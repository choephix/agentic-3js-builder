import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import type { Sweep } from "../src/sweep";
import { bezier, catmull } from "../src/path";
import { limb } from "../src/ik";
import { countershade, gradient, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Arctic fox in winter coat",
  description:
    "A plump arctic fox in a snow-white winter coat: soft fur cards, a knitted scarf with a bell and pompom, a bushy tail, and a little snow patch underfoot.",
  style: "whimsical",
  commit: "b816db2",
};

const SNOW = "#f7fafd";
const CREAM = "#f8f1e6";
const BLUE_GREY = "#cad8ea";
const SLATE = "#9fb1cb";
const INK = "#2c3140";
const NOSE = "#262a36";
const EAR_IN = "#f0c9c3";
const SCARF = "#d4505f";
const GOLD = "#e5b34a";
const PAD = "#5d6679";
const PAW = "#e8eff8";
const SNOW_PAD = "#eef4fb";
const POM = "#f4e9d8";

// Smooth piecewise interpolation through [t, value] keys, for radius profiles.
const keyed = (t: number, keys: [number, number][]): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][1];
};

export default function build() {
  const b = createBuilder({ name: "arcticFoxWinter" });

  // Paints: a soft blue-grey mottle on top, snow-white underneath, a cream chest.
  const coat = countershade(mottle(BLUE_GREY, SNOW, { size: 0.1, seed: 5 }), SNOW, { level: 0.1 });
  const bodyCoat = gradient(coat, CREAM, [0, 0.33, 0.12], [0, 0.33, 0.26]);
  const earPaint = paint((_p, _n, s) =>
    s[1] > 0.035 && Math.abs(s[0] - 0.24 * s[1]) < 0.02 - (s[1] - 0.035) * 0.2 ? EAR_IN : SLATE,
  );
  const tailPaint = paint((_p, _n, s) =>
    s[0] > 0.86 ? SNOW : Math.cos((s[1] * Math.PI) / 180) > 0.45 ? SLATE : coat,
  );
  const scarfPaint = paint((p) => (Math.floor(Math.atan2(p.x, p.z - 0.38) * 6) & 1 ? CREAM : SCARF));

  // Card textures: soft rounded fur tufts, a white ruff tuft, guard hairs, snowflakes.
  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 64 C5 54 3 34 10 22 C12 16 14 10 16 4 C18 10 20 16 22 22 C29 34 27 54 16 64 Z" fill="#dbe6f2"/><g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M9 60 Q6 38 12 20"/><path d="M14 62 Q11 36 15 8"/><path d="M19 62 Q21 36 17 10"/><path d="M24 60 Q27 38 20 20"/></g></svg>`,
    { size: 128 },
  );
  const tuftPale = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#eee6da"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M16 64 C6 52 4 34 12 22 C14 15 15 8 16 2 C18 9 20 16 22 23 C29 35 27 52 16 64 Z" fill="url(#pg)"/></svg>`,
    { size: 128 },
  );
  const guard = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 64 L16 4 M10 62 L7 18 M22 62 L25 16 M13 60 L11 26" stroke="#a9bcd6" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`,
    { size: 128 },
  );
  const snowflake = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g stroke="#8fc3ec" stroke-width="5" stroke-linecap="round" fill="none"><path d="M32 6V58M6 32H58M14 14L50 50M50 14L14 50"/><path d="M32 16l-7-6M32 16l7-6M32 48l-7 6M32 48l7 6M16 32l-6-7M16 32l-6 7M48 32l6-7M48 32l6 7"/></g></svg>`,
    { size: 128 },
  );

  // Skeleton: a root hips joint, a spine chain, a neck off the chest, and a head off the neck.
  const hips = b.joint("hips", { at: [0, 0.33, -0.16], aim: [0, 0.33, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.33, -0.12], [0, 0.34, 0.02], [0, 0.35, 0.14], [0, 0.36, 0.22]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const neck = b.chain("neck", catmull([[0, 0.36, 0.2], [0, 0.42, 0.27], [0, 0.47, 0.33]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.5, 0.36], aim: [0, 0.505, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.462, 0.43], aim: [0, 0.455, 0.54], role: "jaw" });
  const earJoints = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.06, 0.6, 0.36],
      aim: [s * 0.075, 0.72, 0.34],
      role: "hinge",
    }),
  );

  // Body: one tube over the spine, plump at the chest, rounder at the rump.
  const bodyR = (t: number): [number, number] => [
    keyed(t, [[0, 0.1], [0.35, 0.14], [0.7, 0.15], [1, 0.13]]),
    keyed(t, [[0, 0.11], [0.5, 0.13], [1, 0.12]]),
  ];
  const body = b.sweep(spine, bodyR, {
    caps: "round",
    extend: [0.06, 0.04],
    shift: [0, -0.008],
    color: bodyCoat,
  });
  const neckTube = b.sweep(neck, [0.1, 0.09, 0.085], { caps: "round", color: bodyCoat });

  // Head: round skull, tapered cream muzzle, cream lower jaw on the jaw joint.
  const skull = b.part(new THREE.SphereGeometry(0.12, 16, 12), coat, {
    bone: head,
    at: [0, 0.515, 0.4],
    scale: [1, 0.93, 1.02],
  });
  const muzzle = b.loft(
    [
      { at: [0, 0.5, 0.46], w: 0.085, h: 0.08 },
      { at: [0, 0.49, 0.52], w: 0.065, h: 0.065 },
      { at: [0, 0.48, 0.58], w: 0.034, h: 0.036 },
    ],
    { bone: head, color: CREAM },
  );
  b.loft(
    [
      { at: [0, 0.462, 0.44], w: 0.075, h: 0.045 },
      { at: [0, 0.455, 0.5], w: 0.05, h: 0.035 },
      { at: [0, 0.452, 0.555], w: 0.02, h: 0.02 },
    ],
    { bone: jaw, color: CREAM },
  );
  b.part(new THREE.SphereGeometry(0.024, 12, 8), NOSE, {
    bone: head,
    at: [0, 0.49, 0.605],
    scale: [1.35, 0.8, 1],
  });

  for (const s of [1, -1]) {
    // Eyes: dark round eye with a white glint.
    b.part(new THREE.SphereGeometry(0.027, 12, 8), INK, { bone: head, at: [s * 0.062, 0.535, 0.5], scale: [1, 1, 0.7] });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), "#ffffff", { bone: head, at: [s * 0.066, 0.545, 0.52] });
    // Whiskers: three fine curves from each side of the muzzle.
    for (let k = 0; k < 3; k++) {
      b.sweep(
        bezier(
          [s * 0.03, 0.478 + 0.008 * k, 0.55],
          [s * 0.08, 0.48 + 0.01 * k, 0.58 + 0.01 * k],
          [s * 0.12, 0.47 + 0.015 * k, 0.62 + 0.02 * k],
          [s * 0.14, 0.46 + 0.02 * k, 0.64 + 0.025 * k],
        ),
        0.0016,
        { bone: head, color: INK },
      );
    }
    // Little smile curving back from the nose.
    b.sweep(
      catmull([
        [0, 0.46, 0.565],
        [s * 0.035, 0.455, 0.535],
        [s * 0.07, 0.47, 0.5],
      ]),
      0.004,
      { bone: head, color: INK },
    );
  }

  // Ears: short, broad and pointed, outlined in the XY plane, each on its own hinge joint.
  const ear: OutlinePoint[] = [
    [-0.07, 0],
    [0.07, 0],
    [0.05, 0.09],
    [0.03, 0.125, "sharp"],
    [-0.03, 0.09],
  ];
  for (const [i, s] of [1, -1].entries()) {
    b.extrude(ear, {
      at: [s * 0.06, 0.6, 0.36],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.008,
      smoothing: 1,
      color: earPaint,
      bone: earJoints[i],
    });
  }

  // Legs: three-segment limbs landing on paws; front elbows bend back, hind hocks back.
  const legTubes: Sweep[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const frontPts = limb(
      [s * 0.075, 0.31, 0.2],
      [s * 0.085, 0.028, 0.25],
      [0.15, 0.13, 0.07],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `pawF${side}`],
      role: "leg",
    });
    const hindPts = limb(
      [s * 0.075, 0.31, -0.1],
      [s * 0.085, 0.028, -0.07],
      [0.16, 0.14, 0.075],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `pawH${side}`],
      role: "leg",
    });
    for (const [chain, pawZ] of [
      [fl, 0.25],
      [hl, -0.07],
    ] as const) {
      legTubes.push(b.sweep(chain, [0.065, 0.055, 0.042, 0.036], { caps: "round", color: coat }));
      const pawJoint = chain.joints[chain.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.05, 12, 8), PAW, {
        bone: pawJoint,
        at: [s * 0.085, 0.028, pawZ],
        scale: [1, 0.55, 1.3],
      });
      for (const dx of [-0.022, 0, 0.022]) {
        b.part(new THREE.SphereGeometry(0.014, 8, 6), PAD, {
          bone: pawJoint,
          at: [s * 0.085 + dx, 0.016, pawZ + 0.056],
        });
      }
    }
  }

  // Tail: a bushy plume sprouted from the top of the rump, drooping and curling up at the tip.
  const tail = b.sprout(
    "tail",
    body.at(0.02, 0),
    catmull([
      [0, 0.33, -0.22],
      [0, 0.28, -0.34],
      [0, 0.28, -0.44],
      [0, 0.34, -0.5],
    ]),
    [0.06, 0.095, 0.1, 0.09, 0.06, 0.025],
    { count: 4, role: "tail", color: tailPaint },
  );

  // Knitted scarf: a band round the neck, two hanging ends, a bell and a pompom.
  const scarfLoop = b.surface(neckTube).loop(neck.joints[1], { lift: 0.018 });
  b.sweep(scarfLoop, 0.03, { color: scarfPaint });
  b.sweep(
    catmull([
      [0, 0.4, 0.35],
      [0.012, 0.32, 0.37],
      [0.02, 0.24, 0.38],
      [0.026, 0.2, 0.38],
    ]),
    [0.026, 0.02],
    { color: scarfPaint, caps: "round" },
  );
  b.part(new THREE.SphereGeometry(0.013, 8, 6), GOLD, { bone: chest, at: [0.0, 0.37, 0.37] });
  const pomC: [number, number, number][] = [
    [0, 0, 0],
    [0.02, 0.01, 0.01],
    [-0.02, 0.005, 0.012],
    [0.005, -0.02, 0.01],
    [-0.01, 0.018, -0.01],
    [0.018, -0.012, -0.012],
    [-0.018, -0.01, -0.005],
  ];
  for (const [dx, dy, dz] of pomC) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), POM, {
      bone: chest,
      at: [0.026 + dx, 0.2 + dy, 0.38 + dz],
    });
  }

  // Snow patch underfoot: a flattened drift the paws sink into.
  const pad = b.part(new THREE.SphereGeometry(0.42, 18, 10), SNOW_PAD, {
    bone: hips,
    at: [0, 0.021, 0],
    scale: [1, 0.05, 0.8],
  });

  // Fur: soft tufts over the body, a fringe along the top of the neck (clear of the scarf),
  // white ruffs at the cheeks, tufts on the legs and tail, and snowflakes on the back and the patch.
  const furHits = b.surface(body).scatter(640, {
    rng: rng(3),
    minDist: 0.024,
    filter: (h) => h.n.y > -0.55,
  });
  b.cards(furHits, [tuft, tuft, tuftPale], { size: [0.045, 0.07], lean: 50, bend: 25, vary: 0.3, rng: rng(4) });

  const neckHits = b.surface(neckTube).scatter(40, {
    rng: rng(17),
    minDist: 0.024,
    filter: (h) => h.at.y > 0.47,
  });
  b.cards(neckHits, tuft, { size: [0.04, 0.06], lean: 45, bend: 20, vary: 0.3, rng: rng(18) });

  const cheekHits = b.surface([skull, muzzle]).scatter(90, {
    rng: rng(5),
    minDist: 0.02,
    filter: (h) => h.n.y < 0.12 && h.n.z > -0.2,
  });
  b.cards(cheekHits, tuftPale, { size: [0.028, 0.045], lean: 40, bend: 20, vary: 0.3, rng: rng(6) });

  const legHits = b.surface(legTubes).scatter(140, {
    rng: rng(12),
    minDist: 0.02,
    filter: (h) => h.at.y > 0.09,
  });
  b.cards(legHits, [tuft, tuftPale], { size: [0.03, 0.05], lean: 35, vary: 0.3, rng: rng(13) });

  const tailHits = b.surface(tail.sweep).scatter(150, {
    rng: rng(7),
    minDist: 0.025,
  });
  b.cards(tailHits, [tuft, guard], { size: [0.05, 0.075], lean: 45, bend: 25, vary: 0.3, rng: rng(14) });

  const backSnow = b.surface(body).scatter(8, {
    rng: rng(15),
    minDist: 0.1,
    filter: (h) => h.n.y > 0.6,
  });
  b.cards(backSnow, snowflake, { size: 0.04, lean: 20, rng: rng(16) });

  const padSnow = b.surface(pad).scatter(12, {
    rng: rng(11),
    minDist: 0.14,
    filter: (h) => h.n.y > 0.8,
  });
  b.cards(padSnow, snowflake, { size: 0.05, lean: 15, rng: rng(12) });

  return b.root;
}
