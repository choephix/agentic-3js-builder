import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Grizzly Bear",
  description:
    "A grizzly bear on all fours: a high shoulder hump, a shaggy mane, a dished face and ivory claws, painted in a Blizzard-style hand-painted look.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Palette: saturated warm browns, a golden sun-catch, silvered guard-hair tips, amber eyes,
// ivory claws, worn leather and brass.
const FUR_DEEP = "#3a1c0c";
const FUR_BASE = "#82501f";
const FUR_LIGHT = "#bb6f2c";
const FUR_HI = "#e0963a";
const SUN_GOLD = "#f7bd5c";
const SILVER = "#e8d2a4";
const MUZZLE = "#dcae7e";
const NOSE = "#1b120c";
const IVORY = "#f1e5c8";
const LEATHER = "#5d3920";
const BRASS = "#e0ad47";
const IRIS = "#d4902c";
const PUPIL = "#120a06";
const SCAR = "#2a170c";

// Key light, from above and in front: the painted sun-catch sits where a surface faces it.
const SUN = new THREE.Vector3(0.35, 0.8, 0.5).normalize();

// Painted coat: broad warm tonal patches, a sunlit top, a golden sun-catch, a shadowed underside
// and silvered guard-hair streaks on the hump. Smooth fields, not hard blotches.
const coat = paint((p, n) => {
  const broad = smoothstep(0.2, 0.8, noise(p, 0.45, 3));
  const brush = noise(p, 0.07, 9);
  const base = mix(FUR_DEEP, FUR_BASE, 0.35 + 0.65 * broad);
  const top = smoothstep(0.2, 0.9, n.y);
  const sun = smoothstep(0.55, 0.85, n.dot(SUN));
  const under = smoothstep(-0.05, -0.6, n.y);
  let c = mix(base, FUR_HI, 0.5 * top * (0.6 + 0.4 * brush));
  c = mix(c, SUN_GOLD, 0.55 * sun);
  c = mix(c, FUR_DEEP, 0.6 * under);
  const grizzle = smoothstep(0.6, 0.85, brush) * top;
  return mix(c, SILVER, 0.45 * grizzle);
});

// Head: lighter muzzle, dark brow band, sun-catch on the forehead, shadowed jowl.
const headPaint = paint((p, n) => {
  const broad = smoothstep(0.2, 0.8, noise(p, 0.3, 4));
  const sun = smoothstep(0.55, 0.85, n.dot(SUN));
  let c = mix(FUR_BASE, FUR_HI, 0.25 * smoothstep(0.2, 0.9, n.y) + 0.15 * broad);
  c = mix(c, SUN_GOLD, 0.35 * sun);
  const muzzle = smoothstep(1.08, 1.18, p.z) * smoothstep(0.98, 0.9, p.y);
  c = mix(c, MUZZLE, muzzle);
  const brow = smoothstep(0.02, 0.0, Math.abs(p.y - 1.07)) * smoothstep(0.95, 1.05, p.z);
  c = mix(c, FUR_DEEP, 0.55 * brow);
  const under = smoothstep(-0.1, -0.7, n.y);
  return mix(c, FUR_DEEP, 0.5 * under);
});

// Legs and paws: darker than the body, with a lit top edge.
const legPaint = paint((p, n) => {
  const broad = smoothstep(0.25, 0.75, noise(p, 0.35, 5));
  const base = mix(FUR_DEEP, FUR_BASE, 0.3 + 0.5 * broad);
  const top = smoothstep(0.1, 0.9, n.y);
  return mix(base, FUR_LIGHT, 0.35 * top);
});

const leather = paint((p) => mix(LEATHER, "#3a2010", smoothstep(0.3, 0.7, noise(p, 0.04, 2))));

// One guard-hair lock: three tapered blades, dark at the root and silvered at the tip.
const tuft = svg(
  `<svg viewBox="0 0 48 64">
  <defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="0">
    <stop offset="0" stop-color="#3a1c0c"/><stop offset="0.5" stop-color="#8e5626"/><stop offset="1" stop-color="#e8d2a4"/>
  </linearGradient></defs>
  <g fill="url(#g)">
    <path d="M4 64 Q0 34 18 4 Q20 36 26 64 Z"/>
    <path d="M16 64 Q16 30 30 6 Q32 36 36 64 Z"/>
    <path d="M26 64 Q30 36 46 14 Q42 42 40 64 Z"/>
  </g></svg>`,
  { size: 192 },
);

// Keyed profile: rows are [t, ...values], interpolated linearly in t.
function keyed(keys: number[][], t: number): number[] {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    const [t1, ...v1] = keys[i];
    if (t <= t1) {
      const [t0, ...v0] = keys[i - 1];
      const k = (t - t0) / (t1 - t0);
      return v0.map((v, j) => v + (v1[j] - v) * k);
    }
  }
  return keys[keys.length - 1].slice(1);
}

// Torso [t, rx (sideways), ry (up)]: low rump, deep chest, shoulder hump as the high point.
const BODY_R = [
  [0, 0.25, 0.25],
  [0.3, 0.29, 0.27],
  [0.6, 0.31, 0.32],
  [0.85, 0.31, 0.3],
  [1, 0.28, 0.26],
];
// Forelegs: heavy at the shoulder, tapering into a thick wrist.
const FORE_R = [
  [0, 0.22],
  [0.3, 0.17],
  [0.7, 0.13],
  [1, 0.08],
];
// Hind legs: a big thigh and a hock, tapering to the foot.
const HIND_R = [
  [0, 0.26],
  [0.3, 0.2],
  [0.65, 0.11],
  [1, 0.065],
];

export default function build() {
  const b = createBuilder({ name: "grizzlyBear", detail: 1.6 });

  // Skeleton: root at the hips, spine forward over the hump to the chest, neck, head with jaw,
  // tail, and four legs.
  const hips = b.joint("hips", { at: [0, 0.86, -0.8], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.72],
      [0, 0.9, -0.42],
      [0, 0.94, -0.1],
      [0, 0.96, 0.2],
      [0, 0.92, 0.46],
    ]),
    { parent: hips, role: "spine", up: [0, 1, 0] },
  );
  const neck = b.chain("neck", catmull([[0, 0.92, 0.46], [0, 0.95, 0.62], [0, 0.95, 0.78]]), {
    parent: spine.joints[3],
    role: "neck",
    up: [0, 1, 0],
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.93, 0.8], aim: [0, 0.86, 1.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.82, 0.92], aim: [0, 0.79, 1.2], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.9, -0.8], [0, 0.96, -0.9], [0, 1.0, -0.96]]), {
    parent: hips,
    role: "tail",
    up: [0, 1, 0],
  });

  // Torso: one tube over the spine.
  const body = b.sweep(
    spine,
    (t) => {
      const v = keyed(BODY_R, t);
      return [v[0], v[1]];
    },
    { color: coat },
  );

  // Neck: thick and short, carrying the head low.
  const neckBody = b.sweep(neck, (t) => keyed([[0, 0.27], [1, 0.23]], t)[0], { color: coat });

  // Head: a lofted skull, a dished face and a long muzzle, all on the head bone.
  b.loft(
    [
      { at: [0, 0.95, 0.8], w: 0.34, h: 0.34 },
      { at: [0, 0.94, 0.92], w: 0.4, h: 0.38 },
      { at: [0, 0.92, 1.02], w: 0.4, h: 0.36 },
      { at: [0, 0.88, 1.12], w: 0.32, h: 0.28 },
      { at: [0, 0.85, 1.2], w: 0.24, h: 0.22 },
      { at: [0, 0.83, 1.27], w: 0.16, h: 0.16 },
    ],
    { bone: head, color: headPaint },
  );
  // Lower jaw: separate loft on its own bone so it can open.
  b.loft(
    [
      { at: [0, 0.83, 0.94], w: 0.22, h: 0.13 },
      { at: [0, 0.8, 1.1], w: 0.19, h: 0.11 },
      { at: [0, 0.78, 1.22], w: 0.12, h: 0.08 },
    ],
    { bone: jaw, color: headPaint },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // Tail stub.
  b.sweep(tail, (t) => 0.065 - 0.02 * t, { color: legPaint });

  // Legs and paws. Each paw is a flattened sphere on the foot tip, with five ivory claws.
  const hindTubes: Sweep[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fore = b.chain(
      `foreLeg${side}`,
      catmull([[s * 0.2, 0.9, 0.28], [s * 0.21, 0.5, 0.28], [s * 0.21, 0.13, 0.32], [s * 0.21, 0.07, 0.48]]),
      {
        parent: spine.joints[3],
        role: "leg",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      },
    );
    b.sweep(fore, (t) => keyed(FORE_R, t)[0], { color: legPaint });
    const pawF = fore.tip;
    if (!pawF) throw new Error("foreleg paw tip is missing");
    b.part(new THREE.SphereGeometry(1, 18, 12), legPaint, {
      bone: pawF,
      at: [s * 0.21, 0.07, 0.38],
      scale: [0.15, 0.075, 0.17],
    });
    for (let k = -2; k <= 2; k++) {
      b.spike([s * 0.21 + k * 0.045, 0.05, 0.53], [0, -0.35, 1], 0.09, 0.019, { color: IVORY, bone: pawF });
    }

    const hind = b.chain(
      `hindLeg${side}`,
      catmull([[s * 0.22, 0.86, -0.66], [s * 0.25, 0.5, -0.52], [s * 0.24, 0.17, -0.78], [s * 0.24, 0.07, -0.6]]),
      {
        parent: spine.joints[0],
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      },
    );
    hindTubes.push(b.sweep(hind, (t) => keyed(HIND_R, t)[0], { color: legPaint }));
    const pawH = hind.tip;
    if (!pawH) throw new Error("hind paw tip is missing");
    b.part(new THREE.SphereGeometry(1, 18, 12), legPaint, {
      bone: pawH,
      at: [s * 0.24, 0.07, -0.68],
      scale: [0.15, 0.075, 0.17],
    });
    for (let k = -2; k <= 2; k++) {
      b.spike([s * 0.24 + k * 0.042, 0.05, -0.55], [0, -0.3, 1], 0.075, 0.017, { color: IVORY, bone: pawH });
    }
  }

  // Head details: amber eyes with pupils and glints, brow ridges, rounded ears, nose, fangs.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 12, 8), IRIS, { bone: head, at: [s * 0.17, 0.99, 1.0] });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), PUPIL, { bone: head, at: [s * 0.175, 0.99, 1.025] });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), IVORY, { bone: head, at: [s * 0.182, 1.005, 1.036] });
    b.part(new THREE.SphereGeometry(1, 12, 8), FUR_DEEP, {
      bone: head,
      at: [s * 0.155, 1.07, 0.99],
      scale: [0.08, 0.026, 0.05],
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), FUR_BASE, {
      bone: head,
      at: [s * 0.165, 1.1, 0.88],
      scale: [0.035, 0.07, 0.07],
    });
    b.part(new THREE.SphereGeometry(1, 10, 6), MUZZLE, {
      bone: head,
      at: [s * 0.18, 1.1, 0.885],
      scale: [0.012, 0.042, 0.042],
    });
    b.spike([s * 0.07, 0.765, 1.2], [0, -1, 0.12], 0.055, 0.015, { color: IVORY, bone: head });
    b.spike([s * 0.065, 0.8, 1.12], [0, 1, 0.1], 0.045, 0.013, { color: IVORY, bone: jaw });
  }
  b.part(new THREE.SphereGeometry(1, 14, 10), NOSE, { bone: head, at: [0, 0.84, 1.3], scale: [0.075, 0.055, 0.06] });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), IVORY, { bone: head, at: [0.02, 0.86, 1.345] });

  const mouth = b.surface(body).drape(
    catmull([[-0.13, 0.82, 1.1], [-0.08, 0.79, 1.22], [0, 0.78, 1.28], [0.08, 0.79, 1.22], [0.13, 0.82, 1.1]]),
    { lift: 0.004 },
  );
  b.sweep(mouth, 0.01, { color: NOSE });

  // Shoulder scars, painted into the coat.
  for (const s of [1, -1]) {
    const scar = b.surface(body).drape(
      catmull([[s * 0.12, 1.2, 0.12], [s * 0.2, 1.14, 0.0], [s * 0.17, 1.08, -0.1]]),
      { lift: 0.004 },
    );
    b.sweep(scar, 0.006, { color: SCAR });
  }

  // Collar: leather band round the neck with brass rivets, a buckle and a claw pendant.
  const neckSurf = b.surface(neckBody);
  const collar = neckSurf.loop([0, 0.95, 0.62], { dir: [0, 0, 1], lift: 0.01 });
  b.sweep(collar, 0.024, { color: leather });
  b.along(collar, 16, (at) => {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS, { at });
  });
  const front = neckSurf.around([0, 0.95, 0.62]).at(0, -20);
  if (front) b.stick(new THREE.BoxGeometry(0.07, 0.045, 0.02), BRASS, front, { embed: 0.3 });
  const under = neckSurf.around([0, 0.95, 0.62]).at(0, -75);
  if (under) b.spike(under, under, 0.09, 0.022, { color: IVORY });

  // Mane: a dense mass of guard-hair locks over the shoulder hump, down the withers and the
  // upper flanks, lying back along the coat. Crossed and spun so the locks read from every side.
  const mane = b.surface([body]).scatter(760, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.3 && h.at.y > 0.7 && h.at.z > -0.2 && h.at.z < 0.5,
  });
  b.cards(mane, tuft, { size: [0.12, 0.19], lean: 75, bend: 35, vary: 0.3, spin: 25, cross: true, rng: rng(12) });

  // Thigh feathering: long hair on the hind legs, lying back toward the hock.
  const thighFur = b.surface(hindTubes).scatter(300, {
    rng: rng(41),
    minDist: 0.03,
    filter: (h) => h.at.y > 0.42 && h.n.y > -0.4,
  });
  b.cards(thighFur, tuft, { size: [0.1, 0.16], lean: 75, bend: 30, vary: 0.3, spin: 25, rng: rng(42) });

  return b.root;
}
