```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient, mottle, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "A greater flamingo standing on two legs: S-curved neck, bent black-tipped beak, mottled pink body, black-tipped wings and webbed feet.",
};

// Palette.
const PINK = "#f78fae";
const PINK_DEEP = "#f0729a";
const BELLY = "#ffdbe6";
const CORAL = "#ff4f7b";
const CROWN = "#ff7ea3";
const CHIN = "#ffe3ec";
const LEG = "#f27ea0";
const FOOT = "#e0628a";
const BEAK = "#ffa9c1";
const BLACK = "#16141b";
const IRIS = "#ffd23f";

// Body half-width and half-height in metres, from tail (t = 0) to breast (t = 1).
const BODY_W = [0.03, 0.085, 0.112, 0.118, 0.105, 0.06];
const BODY_H = [0.035, 0.09, 0.115, 0.122, 0.11, 0.075];

/** Smooth value across evenly spaced keys over t in [0, 1]. */
function profile(keys: readonly number[], t: number) {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  const f = x - i;
  const s = f * f * (3 - 2 * f);
  return keys[i] + (keys[i + 1] - keys[i]) * s;
}

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", detail: 1, paintSize: 1024 });

  // Skeleton: root at the pelvis, chest above it, an S-curved neck from the chest up to the head,
  // and a separate lower beak on a jaw joint so the bill can open.
  const pelvis = b.joint("pelvis", { at: [0, 0.81, -0.08] });
  const chest = b.joint("chest", { parent: pelvis, at: [0, 0.89, 0.12], role: "spine" });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.97, 0.13],
      [0, 1.08, 0.27],
      [0, 1.2, 0.27],
      [0, 1.29, 0.19],
      [0, 1.35, 0.22],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3", "neck4", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.354, 0.28], role: "jaw" });

  // Body: one tube along the back, skinned to the pelvis and chest so it bends with them.
  b.sweep(
    catmull([
      [0, 0.9, -0.4],
      [0, 0.87, -0.26],
      [0, 0.83, -0.06],
      [0, 0.84, 0.12],
      [0, 0.9, 0.2],
    ]),
    (t): [number, number] => [profile(BODY_W, t), profile(BODY_H, t)],
    {
      bone: [pelvis, chest],
      color: countershade(mottle(PINK, PINK_DEEP, { size: 0.12, seed: 3 }), BELLY, { level: 0.1, soft: 0.45 }),
      sides: 12,
      name: "body",
    },
  );

  // Neck: pink at the body, paling toward the head.
  b.sweep(neck, [0.056, 0.043, 0.033, 0.03, 0.031], {
    color: gradient(PINK, CHIN, [0, 0.97, 0.13], [0, 1.33, 0.22]),
    sides: 10,
    name: "neck",
  });

  // Head: a slightly flattened ball on the neck's tip, crown deeper than chin.
  const skullGeo = new THREE.SphereGeometry(0.075, b.segments(14), b.segments(10));
  skullGeo.scale(1, 0.95, 1.2);
  const skull = b.part(skullGeo, gradient(CROWN, CHIN, [0, 1.45, 0.25], [0, 1.3, 0.28]), {
    at: [0, 1.37, 0.25],
    bone: head,
    name: "head",
  });

  // Beak: the upper mandible bent sharply down, the lower one on the jaw. Both are pink with black tips.
  b.sweep(
    catmull([
      [0, 1.365, 0.29],
      [0, 1.36, 0.36],
      [0, 1.33, 0.4],
      [0, 1.27, 0.39],
    ]),
    (t): [number, number] => [0.022 - 0.012 * t, 0.015 - 0.008 * t],
    { bone: head, bands: [[0.6, BEAK], [1, BLACK]], sides: 8, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 1.354, 0.28],
      [0, 1.345, 0.35],
      [0, 1.31, 0.38],
      [0, 1.28, 0.375],
    ]),
    (t): [number, number] => [0.017 - 0.008 * t, 0.01 - 0.004 * t],
    { bone: jaw, bands: [[0.65, BEAK], [1, BLACK]], sides: 8, name: "beakLower" },
  );

  // Eyes: yellow balls seated on the head's sides, each with a black pupil on its front.
  const around = b.surface(skull).around([0, 1.37, 0.25]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eye = b.stick(new THREE.SphereGeometry(0.014, 10, 8), IRIS, around.at(s * 62, 8)!, {
      embed: 0.3,
      name: `eye${side}`,
    });
    b.stick(
      new THREE.SphereGeometry(0.0075, 8, 6),
      BLACK,
      b.surface(eye).nearest(eye.at.add(eye.axis)),
      { embed: 0.5, name: `pupil${side}` },
    );
  }

  // Legs, wings and feet, one of each per side. Legs bend back at the ankle; wings fold down the flank.
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const x = s * 0.065;

    // Long pink shank: hip inside the body, knee forward, ankle back, foot on the floor.
    const leg = b.chain(
      `leg${k}`,
      polyline([
        [x, 0.76, -0.04],
        [x, 0.58, 0.05],
        [x, 0.3, -0.07],
        [x, 0.012, 0.02],
      ]),
      { parent: pelvis, names: [`thigh${k}`, `knee${k}`, `ankle${k}`, `foot${k}`], role: "leg" },
    );
    b.sweep(leg, [0.021, 0.016, 0.013, 0.01], { color: LEG, sides: 8, name: `leg${k}` });

    // Webbed foot: three toes fanned forward, sitting on the floor.
    const web = (dx: number, dz: number): [number, number, number] => [x + dx, 0.002, dz];
    b.slab(
      [web(0, -0.02), web(0.05, 0.085), web(0.025, 0.05), web(0, 0.11), web(-0.025, 0.05), web(-0.05, 0.085)],
      { color: FOOT, thickness: 0.008, bone: `foot${k}`, name: `foot${k}` },
    );

    // Wing chain: shoulder, elbow, wrist and a tip joint for the primaries.
    b.chain(
      `wing${k}`,
      polyline([
        [s * 0.12, 0.88, 0.08],
        [s * 0.13, 0.85, -0.1],
        [s * 0.13, 0.83, -0.22],
        [s * 0.13, 0.81, -0.34],
      ]),
      { parent: chest, names: [`wing${k}1`, `wing${k}2`, `wing${k}3`, `wing${k}tip`], role: "wing" },
    );

    // Coverts: a flat pink shape that fades to coral toward the tips.
    b.extrude(
      [
        [0, 0.08],
        [0.12, 0.075],
        [0.24, 0.05],
        [0.34, 0],
        [0.38, -0.05],
        [0.28, -0.07],
        [0.16, -0.085],
        [0.04, -0.06],
      ],
      {
        at: [s * 0.12, 0.86, 0.1],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.024,
        bevel: 0.008,
        color: gradient(PINK, CORAL, [s * 0.12, 0.9, 0.1], [s * 0.13, 0.8, -0.32]),
        bone: `wing${k}2`,
        name: `wing${k}Covert`,
      },
    );

    // Primaries: black, set just outside the coverts so they never z-fight.
    b.extrude(
      [
        [0.22, 0.03],
        [0.34, -0.01],
        [0.46, -0.08],
        [0.42, -0.13],
        [0.3, -0.1],
        [0.22, -0.05],
      ],
      {
        at: [s * 0.126, 0.86, 0.1],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.005,
        color: BLACK,
        bone: `wing${k}tip`,
        name: `wing${k}Primaries`,
      },
    );
  }

  return b.root;
}
```