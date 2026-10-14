```ts
// A penguin at rest: an egg-shaped body, black on the back and head and white on the front, a long flipper on each
// side, a beak built as an upper and a lower jaw, webbed feet on short legs, a small tail and a cream-striped red scarf.
import * as THREE from "three";
import { catmull, createBuilder, interpolate, noise, paint, rgb, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Penguin",
  description:
    "A stylised penguin at rest: black back and head, white front, orange beak and feet, flippers and a striped red scarf.",
};

type Color3 = readonly [number, number, number];

const INK = "#16181e";
const INK_RGB = rgb(INK);
const SLATE = rgb("#2c323c");
const SNOW = rgb("#f6f3ec");
const BEAK = "#f5a623";
const WEB = "#ec8a1f";
const SCARF = "#d9432f";
const CREAM = "#f4eddd";

/** Webbed foot outline, in metres: x across the foot, y forward (+Z), from the foot's centre. */
const FOOT_OUTLINE: Array<[number, number]> = [
  [-0.03, -0.028],
  [0.03, -0.028],
  [0.035, 0],
  [0.045, 0.05],
  [0.016, 0.034],
  [0, 0.06],
  [-0.016, 0.034],
  [-0.045, 0.05],
  [-0.035, 0],
];

/** The hanging end of the scarf, in metres from the point where it leaves the collar. */
const SCARF_TAIL: Array<[number, number]> = [
  [-0.022, 0.012],
  [0.022, 0.012],
  [0.028, -0.095],
  [0, -0.072],
  [-0.024, -0.102],
];

const mix3 = (a: Color3, b: Color3, t: number): Color3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Black back and head, white belly facing forward, with a soft ragged edge where the two meet. */
const plumage = paint((p, n) => {
  const front = n.z + 0.12 * (noise(p, 0.07, 3) - 0.5);
  const belly = smoothstep(0.2, 0.55, front) * (1 - smoothstep(0.5, 0.57, p.y));
  const back = mix3(INK_RGB, SLATE, smoothstep(0.56, 0.72, p.y));
  return mix3(back, SNOW, belly);
});

/** Cream and red stripes that wind once round the neck. */
const knit = paint((p) => {
  const turn = Math.atan2(p.x, p.z) / (2 * Math.PI) + 0.5;
  return Math.floor(turn * 12) % 2 ? CREAM : SCARF;
});

export default function penguin() {
  const b = createBuilder({ name: "penguin", paintSize: 1024 });

  // Skeleton: hips at the base, a spine of five joints up to the crown, then the jaw under the head.
  b.joint("hips", { at: [0, 0.15, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, 0],
      [0, 0.32, 0],
      [0, 0.47, 0],
      [0, 0.62, 0.012],
      [0, 0.7, 0.02],
    ]),
    {
      parent: "hips",
      up: [0, 0, 1],
      names: ["waist", "chest", "shoulder", "head", "crown"],
      role: "spine",
    },
  );

  // Body: one tube along the spine. Its radius is read from the height, so the profile is an egg with a neck
  // and a rounded head. Width runs along X and depth along Z.
  const profileY = [0.15, 0.22, 0.32, 0.42, 0.5, 0.56, 0.62, 0.66, 0.7];
  const profileX = [0.09, 0.12, 0.14, 0.14, 0.125, 0.105, 0.1, 0.092, 0.05];
  const profileZ = [0.08, 0.11, 0.125, 0.12, 0.11, 0.1, 0.1, 0.09, 0.05];
  const body = b.sweep(
    spine,
    (t: number): [number, number] => {
      const y = spine.path.at(t).y;
      return [interpolate(profileY, profileX, y), interpolate(profileY, profileZ, y)];
    },
    { color: plumage, sides: 10, name: "body" },
  );

  // Beak: the lower jaw hinges at the back of the mouth line, so posing "jaw" opens it.
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.595, 0.09], role: "jaw" });
  b.extrude(
    [
      [0, 0.045],
      [0.08, 0.005],
      [0, 0],
    ],
    {
      at: [0, 0.595, 0.09],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      color: BEAK,
      bone: "head",
      name: "beakUpper",
    },
  );
  b.extrude(
    [
      [0, 0],
      [0.078, 0.003],
      [0, -0.022],
    ],
    {
      at: jaw,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.026,
      color: BEAK,
      name: "beakLower",
    },
  );

  // Eyes: white balls seated on the front of the head, with black pupils and a small glint.
  const skin = b.surface(body);
  const eyeBall = new THREE.SphereGeometry(0.034, b.segments(12), b.segments(8));
  const pupilBall = new THREE.SphereGeometry(0.015, b.segments(10), b.segments(6));
  const glintBall = new THREE.SphereGeometry(0.0055, b.segments(6), b.segments(4));
  for (const side of [1, -1] as const) {
    const s = side > 0 ? "L" : "R";
    const eye = b.stick(eyeBall, "#fbfbf7", skin.nearest([side * 0.05, 0.645, 0.13]), {
      embed: 0.25,
      name: `eye${s}`,
    });
    const pupil = b.stick(pupilBall, "#0d0e10", eye.moved([0, 0.03, 0]), { embed: 0.5, name: `pupil${s}` });
    b.stick(glintBall, "#ffffff", pupil.moved([0.005, 0.009, 0]), { embed: 0.3, name: `glint${s}` });
  }

  // Legs and webbed feet, one per side, standing on the floor at y = 0.
  for (const side of [1, -1] as const) {
    const s = side > 0 ? "L" : "R";
    const x = side * 0.05;
    const leg = b.chain(
      `leg${s}`,
      [
        [x, 0.14, 0],
        [x, 0.075, 0.012],
        [x, 0.03, 0.008],
      ],
      {
        parent: "hips",
        up: [0, 0, 1],
        names: [`hip${s}`, `knee${s}`, `ankle${s}`],
        role: "leg",
      },
    );
    b.sweep(leg, 0.017, { color: WEB, sides: 6, name: `leg${s}` });
    b.extrude(FOOT_OUTLINE, {
      at: [x, 0.007, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.004,
      color: WEB,
      bone: `ankle${s}`,
      name: `foot${s}`,
    });
  }

  // Flippers: long, flat and black, hanging along the sides and tapering to a rounded tip.
  for (const side of [1, -1] as const) {
    const s = side > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${s}`,
      catmull([
        [0.11 * side, 0.47, 0],
        [0.16 * side, 0.36, -0.01],
        [0.17 * side, 0.22, -0.02],
      ]),
      {
        parent: "shoulder",
        up: [0, 0, 1],
        names: [`shoulder${s}`, `wrist${s}`, `tip${s}`],
        role: "wing",
      },
    );
    b.sweep(wing, (t: number): [number, number] => [0.012 - 0.004 * t, 0.04 - 0.024 * t], {
      color: INK,
      name: `wing${s}`,
    });
  }

  // Short tail nub at the back.
  b.spike([0, 0.2, -0.085], [0, 0.155, -0.16], null, 0.032, { color: INK, name: "tail" });

  // Scarf: a loop round the neck, striped in cream, with one hanging end at the front.
  const collar = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [0.136 * Math.sin(a), 0.52, 0.126 * Math.cos(a)];
  });
  b.sweep(catmull(collar, { closed: true }), 0.022, {
    color: knit,
    sides: 8,
    bone: "shoulder",
    name: "scarf",
  });
  b.extrude(SCARF_TAIL, {
    at: [0.035, 0.515, 0.14],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.004,
    color: SCARF,
    bone: "shoulder",
    name: "scarfTail",
  });

  return b.root;
}
```