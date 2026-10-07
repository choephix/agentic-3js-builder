```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, paint, rng, spiral } from "agentic-3js-builder";

export const meta = {
  name: "octopus",
  description:
    "A common octopus resting on the floor: a mottled coral mantle with gold slit-pupil eyes, eight tapering arms curling at the tips with suckers on the upper flanks, and a small beak.",
};

// Palette
const CORAL = "#d8643f";
const DEEP = "#7a2c3c";
const PALE = "#f4d7c0";
const SUCKER = "#f8e8d8";
const GOLD = "#e9b43e";
const PUPIL = "#150e12";
const GLINT = "#fff8e8";
const BEAK = "#2a1d22";
const WART = "#8c3645";

const MANTLE_Y = 0.066; // underside of the mantle, metres above the floor

// Arms: azimuth from +Z toward +X (degrees), curl side (+1 curls toward the model's left),
// reach along the floor, and how many turns the tip coils through.
const ARMS = [
  { az: 24, side: 1, reach: 0.38, turns: 1.1 },
  { az: 68, side: -1, reach: 0.34, turns: 0.9 },
  { az: 114, side: 1, reach: 0.36, turns: 1.0 },
  { az: 160, side: -1, reach: 0.33, turns: 1.2 },
  { az: -160, side: 1, reach: 0.35, turns: 1.1 },
  { az: -114, side: -1, reach: 0.37, turns: 0.95 },
  { az: -68, side: 1, reach: 0.35, turns: 1.0 },
  { az: -24, side: -1, reach: 0.39, turns: 1.15 },
];

// Skin: mottled coral on the top, pale underneath.
const skin = countershade(mottle(CORAL, DEEP, { size: 0.08, contrast: 0.9, seed: 3 }), PALE, { level: 0.1 });
const mantleSkin = countershade(mottle(CORAL, DEEP, { size: 0.11, contrast: 0.9, seed: 9 }), PALE, { level: 0.2 });

// Arms: skin plus two rows of suckers on the upper flanks (pale rim, dark core).
const armSkin = paint((_p, _n, s) => {
  const along = (((s[0] * 30) % 1) - 0.5) / 0.24;
  const x = (((s[1] - 60) % 180) + 180) % 180;
  const across = Math.min(x, 180 - x) / 7;
  const d2 = along * along + across * across;
  if (d2 < 0.3) return DEEP;
  if (d2 < 1) return SUCKER;
  return skin;
});

// Eyes: gold domes with a horizontal slit pupil and a small glint.
function eyePaint(side: number) {
  const a = (42 * Math.PI) / 180;
  const fwd = new THREE.Vector3(side * Math.sin(a), 0.12, Math.cos(a)).normalize();
  const glint = new THREE.Vector3(side * 0.35, 0.75, 0.6).normalize();
  return paint((_p, n) => {
    if (n.dot(glint) > 0.94) return GLINT;
    if (n.dot(fwd) > 0.75 && Math.abs(n.y) < 0.22) return PUPIL;
    return GOLD;
  });
}

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const rand = rng(21);
  const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

  // Skeleton: the mantle is the root; beak, funnel and arms hang from it.
  const body = b.joint("body", { at: [0, 0.25, 0], dir: [0, 1, 0], role: "spine" });
  const jaw = b.joint("jaw", { parent: body, at: [0, MANTLE_Y, 0.01], dir: [0, -1, 0.35], role: "jaw" });

  // Mantle: a turned sack, rigid on the body.
  const mantle = b.lathe(
    [
      [0, 0, "sharp"],
      [0.055, 0],
      [0.078, 0.02],
      [0.102, 0.08],
      [0.118, 0.15],
      [0.122, 0.22],
      [0.114, 0.29],
      [0.09, 0.345],
      [0.052, 0.375],
      [0, 0.386, "sharp"],
    ],
    { at: [0, MANTLE_Y, 0], bone: body, segments: 12, smoothing: 1, color: mantleSkin, name: "mantle" },
  );

  // Eyes on the front flanks of the mantle.
  const shell = b.surface(mantle).around([0, 0.25, 0]);
  for (const s of [1, -1]) {
    const hit = shell.at(s * 42, 8);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.036, 10, 8), eyePaint(s), hit, {
      embed: 0.45,
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // Papillae: little warts over the mantle, kept clear of the eyes.
  for (let az = 0; az < 360; az += 30) {
    for (const el of [-14, 14, 40, 62]) {
      const nearEye = Math.abs(wrap(az - 42)) < 24 || Math.abs(wrap(az + 42)) < 24;
      if (nearEye && el > -20 && el < 25) continue;
      const hit = shell.at(az, el);
      if (!hit) continue;
      b.stick(new THREE.SphereGeometry(0.007 + rand() * 0.004, 6, 4), WART, hit, { embed: 0.45 });
    }
  }

  // Mouth: a small hooked beak with a moving lower jaw, and the funnel under the mantle.
  b.spike(jaw, jaw, 0.026, 0.012, { color: BEAK, name: "beakLower" });
  b.spike([0, MANTLE_Y + 0.004, 0.012], [0, -1, 0.35], 0.024, 0.013, {
    color: BEAK,
    bone: body,
    name: "beakUpper",
  });
  b.sweep(
    catmull([
      [0, 0.095, 0.05],
      [0, 0.072, 0.11],
      [0, 0.05, 0.16],
    ]),
    [0.03, 0.017],
    { bone: body, color: mantleSkin, caps: { start: "round", end: "flat" }, name: "funnel" },
  );

  // Arms: eight tapering chains that leave the mantle, run out along the floor and coil up at the tip.
  const armRadius = (t: number) => 0.011 + 0.036 * Math.pow(1 - t, 1.6);
  const COUNT = 7;
  ARMS.forEach((arm, k) => {
    const th = (arm.az * Math.PI) / 180;
    const fwd = [Math.sin(th), 0, Math.cos(th)]; // outward heading
    const left = [Math.cos(th), 0, -Math.sin(th)]; // model-left of that heading
    const at = (r: number, y: number, w: number) => [
      fwd[0] * r + left[0] * w,
      y,
      fwd[2] * r + left[2] * w,
    ];

    const R = arm.reach;
    const tip = at(R, 0.014, 0);
    const curlC = [
      tip[0] + left[0] * arm.side * 0.05,
      tip[1],
      tip[2] + left[2] * arm.side * 0.05,
    ];
    const outward = catmull([
      at(0.07, MANTLE_Y, 0),
      at(0.13, 0.05, 0.012 * arm.side),
      at(R * 0.6, 0.034, -0.02 * arm.side),
      at(R * 0.85, 0.024, 0.016 * arm.side),
      tip,
    ]);
    const curl = spiral(curlC, tip, [0, 1, 0], {
      turns: arm.side * arm.turns,
      r1: 0.02,
      pitch: 0.04,
    });

    const chain = b.chain(`arm${k}`, outward.concat(curl), {
      parent: body,
      count: COUNT,
      names: Array.from({ length: COUNT }, (_, i) => `arm${k}_${i + 1}`),
      role: "tentacle",
    });
    b.sweep(chain, armRadius, { color: armSkin, name: `arm${k}` });
  });

  return b.root;
}
```