import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, paint } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const BLUE = "#0c1a2e"; // blue-black back and head
const WHITE = "#f3f4ef"; // belly
const GOLD = "#f0b429"; // neck and ear patch
const BEAK = "#161616";
const PINK = "#ff7a59"; // beak stripe
const FOOT = "#1a1a1c";
const EYE = "#050505";
const CHICK = "#c3c7cf";
const FLUFF = "#9ca2ad";
const FLUFF_LT = "#e4e6ea";
const CHICK_BEAK = "#e8843c";

export const meta = {
  name: "emperor-penguin-chick",
  description: "An emperor penguin parent standing over a fluffy grey chick between its feet.",
};

// Piecewise-linear profile over t in [0, 1] from evenly spaced keys.
function lerpKeys(keys: number[], t: number): number {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  const u = x - i;
  return keys[i] * (1 - u) + keys[i + 1] * u;
}

const bodyKeys = [0.1, 0.2, 0.17, 0.11];
const bodyR = (t: number): [number, number] => {
  const w = lerpKeys(bodyKeys, t);
  return [w, w * 0.7];
};

// Flipper: a rounded blade in the plane of up and forward (x = forward, y = up).
const flipper: OutlinePoint[] = [
  [-0.035, 0.0],
  [0.035, 0.0],
  [0.03, -0.14],
  [0.0, -0.26, "sharp"],
  [-0.03, -0.14],
];

// Webbed foot laid flat: x = across, y = forward, three toes.
const foot: OutlinePoint[] = [
  [-0.04, -0.05],
  [0.04, -0.05],
  [0.055, 0.02],
  [0.075, 0.08, "sharp"],
  [0.01, 0.05],
  [0.0, 0.1, "sharp"],
  [-0.01, 0.05],
  [-0.075, 0.08, "sharp"],
  [-0.055, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-chick" });

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.32, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.32, 0],
      [0, 0.6, 0],
      [0, 0.9, 0.02],
      [0, 1.05, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 1.2, 0.04], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.19, 0.08], role: "jaw" });

  // ---- Body: an egg of tube, blue back, white front, gold neck patch ----
  const coat = paint((p, n, _s) => {
    if (n.z > 0.25 && p.y < 0.95) return WHITE;
    if (Math.abs(n.x) > 0.45 && n.z > -0.2 && p.y > 0.93 && p.y < 1.1) return GOLD;
    return BLUE;
  });
  b.sweep(spine, bodyR, { sides: 12, color: coat });

  // ---- Head: blue-black sphere with a gold ear patch --------------------
  const headPaint = paint((p, _n, _s) => {
    if (Math.abs(p.x) > 0.055 && p.y > 1.1 && p.y < 1.19 && p.z > -0.05 && p.z < 0.07) return GOLD;
    return BLUE;
  });
  b.part(new THREE.SphereGeometry(0.1, 14, 10), headPaint, { bone: head, at: [0, 1.2, 0.04] });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), EYE, { bone: head, at: [s * 0.078, 1.225, 0.1] });
  }

  // ---- Beak: long slender upper and lower mandibles ---------------------
  const beakTop = paint((_p, _n, s) => (Math.abs(s[1]) < 50 && s[0] > 0.3 && s[0] < 0.75 ? PINK : BEAK));
  b.sweep(
    bezier([0, 1.22, 0.1], [0, 1.21, 0.22], [0, 1.18, 0.34], [0, 1.15, 0.44]),
    [0.03, 0.008],
    { bone: head, color: beakTop, sides: 8 },
  );
  b.sweep(
    bezier([0, 1.19, 0.1], [0, 1.18, 0.22], [0, 1.16, 0.33], [0, 1.14, 0.4]),
    [0.024, 0.006],
    { bone: jaw, color: BEAK, sides: 8 },
  );

  // ---- Flippers: short, held slightly out -------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.joint(`wing${side}`, { parent: spine.joints[1], at: [s * 0.12, 0.93, 0], role: "wing" });
    b.extrude(flipper, {
      at: [s * 0.12, 0.93, 0],
      x: [0, 0, 1],
      y: [-s * 0.25, 1, 0],
      thickness: [0.01, 0.035],
      bevel: 0.006,
      smoothing: 1,
      color: BLUE,
      bone: wing,
    });
  }

  // ---- Legs and big black webbed feet ----------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.joint(`leg${side}`, { parent: hips, at: [s * 0.09, 0.3, 0], role: "leg" });
    const ankle: [number, number, number] = [s * 0.09, 0.03, 0.02];
    b.rod([s * 0.09, 0.3, 0], ankle, 0.024, { bone: leg, color: FOOT });
    b.extrude(foot, {
      at: [s * 0.09, 0.006, 0.02],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      smoothing: 0,
      color: FOOT,
      bone: leg,
    });
  }

  // ---- Chick: fluffy grey, tucked between the feet ----------------------
  const chickBody = b.part(new THREE.SphereGeometry(0.12, 12, 9), CHICK, {
    bone: hips,
    at: [0, 0.12, 0.12],
  });
  const chickHead = b.part(new THREE.SphereGeometry(0.085, 10, 8), CHICK, {
    bone: hips,
    at: [0, 0.25, 0.2],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), EYE, { bone: hips, at: [s * 0.036, 0.262, 0.272] });
  }
  b.rod([0, 0.25, 0.27], [0, 0.245, 0.3], 0.01, { bone: hips, color: CHICK_BEAK });

  // Fluff: small grey puffs stuck over the chick's body and head.
  let k = 0;
  for (const hit of b.surface(chickBody).scatter(70, { rng: rng(11), minDist: 0.032, filter: (h) => h.n.y > -0.3 })) {
    b.stick(new THREE.SphereGeometry(0.032, 5, 4), k++ % 2 ? FLUFF : FLUFF_LT, hit, { embed: 0.4 });
  }
  for (const hit of b.surface(chickHead).scatter(22, { rng: rng(23), minDist: 0.03 })) {
    b.stick(new THREE.SphereGeometry(0.028, 5, 4), k++ % 2 ? FLUFF : FLUFF_LT, hit, { embed: 0.4 });
  }

  return b.root;
}
