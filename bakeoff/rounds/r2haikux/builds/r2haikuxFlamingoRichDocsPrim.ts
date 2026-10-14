import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient, noise, paint, rng, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "An elegant candy-pink flamingo with an S-curved neck, coral wings tipped in black, a bent two-tone beak and webbed feet, standing in shallow water.",
};

// Palette
const CANDY = "#ff8fb8";
const CANDY_DEEP = "#ff6fa6";
const BELLY = "#ffc9dd";
const CORAL = "#f4674c";
const BLACK = "#1d191c";
const LEG = "#e8477d";
const WEB = "#c93b6e";
const BEAK = "#f9cdd9";
const EYE = "#f6ec8e";
const WATER = "#8fd8d2";
const WATER_LIGHT = "#b2e9e2";
const RIPPLE = "#e2f8f3";
const SAND = "#cdb68c";

// Piecewise-linear section profile over t, returning [sideways, along-normal] radii.
type Key = [number, number, number];
function profile(keys: Key[]): (t: number) => [number, number] {
  return (t) => {
    for (let i = 1; i < keys.length; i++) {
      const [t1, a1, c1] = keys[i];
      if (t <= t1) {
        const [t0, a0, c0] = keys[i - 1];
        const k = (t - t0) / (t1 - t0);
        return [a0 + (a1 - a0) * k, c0 + (c1 - c0) * k];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };
}

// Feather drawing for the plumage cards (greys tint to the card colour).
const plume = svg(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 1C27 18 28 44 16 63C4 44 5 18 16 1Z" fill="#ffffff"/><path d="M16 7V57" stroke="#cfcfcf" stroke-width="1.5"/></svg>',
  { size: 128 },
);

// Paints
const bodyPaint = countershade(CANDY, BELLY);
const neckPaint = gradient(BELLY, CANDY, [0, 0.96, 0.12], [0, 1.28, 0.2]);
const wingPaint = paint((p, _n, s) => (s[0] + (noise(p, 0.07) - 0.5) * 0.08 < -0.3 ? BLACK : CORAL));
const waterPaint = paint((p) => (noise(p, 0.18) > 0.55 ? WATER_LIGHT : WATER));

// Folded wing, drawn in the side plane (u = forward, v = up); the tip points back.
const wingShape: OutlinePoint[] = [
  [0.16, 0.08],
  [-0.1, 0.11],
  [-0.3, 0.06],
  [-0.44, -0.02, "sharp"],
  [-0.3, -0.06],
  [-0.12, -0.1],
  [0.02, -0.08],
  [0.14, -0.03],
];

// Black flight feathers that run out past the wing tip.
function plumeShape(len: number, w: number): OutlinePoint[] {
  return [
    [0.03, w],
    [-len * 0.45, w * 1.1],
    [-len, 0, "sharp"],
    [-len * 0.5, -w * 0.9],
    [0.03, -w * 0.8],
  ];
}

// Webbed foot: a fan of three scalloped toes, flat on the ground.
const webShape: OutlinePoint[] = [
  [0, -0.02],
  [0.045, 0.015],
  [0.07, 0.09, "sharp"],
  [0.035, 0.065],
  [0, 0.12, "sharp"],
  [-0.035, 0.065],
  [-0.07, 0.09, "sharp"],
  [-0.045, 0.015],
];

const blades: [number, number, number][] = [
  [-0.3, 0.885, 0.2],
  [-0.27, 0.865, 0.17],
  [-0.24, 0.9, 0.14],
];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- Skeleton -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.86, -0.1], aim: [0, 0.9, -0.02], role: "spine" });

  const tail = b.chain("tail", catmull([[0, 0.85, -0.08], [0, 0.83, -0.25], [0, 0.79, -0.38]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  const chest = b.joint("chest", { parent: hips, at: [0, 0.93, 0.08], aim: [0, 1.0, 0.2], role: "spine" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.96, 0.12],
      [0, 1.1, 0.3],
      [0, 1.26, 0.16],
      [0, 1.4, 0.28],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.41, 0.3],
    aim: [0, 1.33, 0.5],
    role: "head",
  });

  // ---- Body, neck, head -----------------------------------------------------
  b.sweep(
    catmull([
      [0, 0.79, -0.38],
      [0, 0.84, -0.22],
      [0, 0.87, -0.06],
      [0, 0.92, 0.06],
      [0, 0.96, 0.12],
    ]),
    profile([
      [0, 0.03, 0.03],
      [0.22, 0.07, 0.075],
      [0.5, 0.115, 0.13],
      [0.8, 0.105, 0.115],
      [1, 0.085, 0.085],
    ]),
    { bone: [tail, hips, chest], color: bodyPaint },
  );

  b.sweep(neck, profile([[0, 0.058, 0.058], [0.5, 0.042, 0.042], [1, 0.032, 0.032]]), { color: neckPaint });

  b.part(new THREE.SphereGeometry(0.075, 10, 7), CANDY, {
    bone: head,
    at: head.local({ forward: 0.01 }),
    scale: [1, 0.95, 1.2],
    flat: true,
  });

  // Bent bill: pale pink, black hooked tip.
  const beakPath = catmull([
    head.local({ forward: 0.04, up: 0 }),
    head.local({ forward: 0.11, up: -0.005 }),
    head.local({ forward: 0.15, down: 0.05 }),
    head.local({ forward: 0.13, down: 0.12 }),
  ]);
  b.sweep(beakPath, {
    radius: [0.022, 0.008],
    color: BEAK,
    bands: [
      [0.7, BEAK],
      [1, BLACK],
    ],
    caps: { start: "round", end: "point" },
    bone: head,
  });

  // Pale yellow eyes with dark pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.058, up: 0.024, forward: 0.04 }),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.074, up: 0.024, forward: 0.04 }),
    });
  }

  // ---- Legs, feet, wings ----------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.085, 0.8, -0.1],
        [s * 0.09, 0.46, -0.17],
        [s * 0.085, 0.02, 0],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    b.sweep(leg, profile([[0, 0.03, 0.03], [0.45, 0.021, 0.021], [0.8, 0.013, 0.013], [1, 0.011, 0.011]]), {
      color: LEG,
    });

    // Knobbly knee.
    b.part(new THREE.SphereGeometry(0.03, 8, 6), LEG, { bone: knee, at: knee, flat: true });

    // Webbed foot lying flat on the water bed.
    b.extrude(webShape, {
      at: ankle.local({ down: 0.014 }),
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      color: WEB,
      bone: ankle,
    });

    // Ripple around the foot.
    b.part(new THREE.TorusGeometry(0.14, 0.003, 4, 24), RIPPLE, {
      at: [s * 0.085, 0.006, 0.05],
      dir: [0, 1, 0],
      axis: "z",
      bone: hips,
    });

    // Folded wing with black tips.
    const wing = b.joint(`wing${side}`, {
      parent: hips,
      at: [s * 0.12, 0.93, 0],
      aim: [s * 0.12, 0.8, -0.3],
      role: "wing",
    });
    b.extrude(wingShape, {
      at: [s * 0.125, 0.9, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      smoothing: 1,
      color: wingPaint,
      bone: wing,
    });
    for (const [z, y, len] of blades) {
      b.extrude(plumeShape(len, 0.016), {
        at: [s * 0.125, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.01,
        color: BLACK,
        bone: wing,
      });
    }
  }

  // ---- Shallow water and pebbles -------------------------------------------
  b.part(new THREE.CircleGeometry(0.8, 32), waterPaint, {
    at: [0, 0, 0],
    bone: hips,
    dir: [0, 1, 0],
    axis: "z",
  });

  for (const [x, z] of [
    [0.45, 0.22],
    [-0.42, 0.3],
    [0.3, -0.42],
    [-0.5, -0.2],
    [0.58, -0.15],
  ]) {
    b.part(new THREE.SphereGeometry(0.05, 7, 5), SAND, {
      at: [x, 0.012, z],
      bone: hips,
      scale: [1, 0.3, 0.8],
    });
  }

  // ---- Plumage ----------------------------------------------------------------
  const plumes = b.surface(b.root).scatter(70, {
    rng: rng(5),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.1 || h.n.z < -0.45,
  });
  b.cards(plumes, plume, {
    size: [0.05, 0.1],
    lean: 50,
    bend: 25,
    vary: 0.25,
    rng: rng(6),
    color: CANDY_DEEP,
  });

  return b.root;
}
