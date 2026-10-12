import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Red rock crab",
  description:
    "A feisty red rock crab: a knobbly brick-red shell speckled orange and cream, one oversized claw raised in challenge, eyes on stalks, eight pointed walking legs, and a barnacle and a strand of seaweed on its back.",
};

type V = [number, number, number];

const SHELL = "#9b2c1c";
const RIDGE = "#5e1810";
const KNOB = "#b8402a";
const LEG = "#c0492b";
const CLAW = "#c63b25";
const DARK = "#2a1812";
const ORANGE = "#f08c3a";
const CREAM = "#f2e2bd";
const EYE = "#f5ecd6";
const PUPIL = "#17100c";
const BARNACLE = "#d8ceb0";
const WEED = "#4d6c2a";
const BULB = "#86b04e";

const CENTER: V = [0, 0.12, 0];
const SHELL_SIZE: V = [0.19, 0.075, 0.15];
const UP: V = [0, 1, 0];
const DOWN: V = [0, -1, 0];

// Walking legs on the +X side, front to back: hip, knee, ankle, foot, ground tip.
const LEGS: V[][] = [
  [[0.145, 0.085, 0.07], [0.29, 0.16, 0.1], [0.37, 0.07, 0.13], [0.4, 0.03, 0.15], [0.41, 0, 0.155]],
  [[0.155, 0.085, 0.01], [0.31, 0.165, 0.02], [0.4, 0.07, 0.03], [0.43, 0.03, 0.04], [0.44, 0, 0.045]],
  [[0.14, 0.085, -0.05], [0.29, 0.16, -0.05], [0.37, 0.07, -0.08], [0.4, 0.03, -0.1], [0.41, 0, -0.105]],
  [[0.115, 0.088, -0.105], [0.25, 0.155, -0.12], [0.32, 0.07, -0.16], [0.34, 0.03, -0.19], [0.35, 0, -0.2]],
];

// Shell bumps: x, z, radius.
const KNOBS: [number, number, number][] = [
  [-0.13, 0.07, 0.016], [-0.06, 0.1, 0.02], [0.02, 0.105, 0.018], [0.08, 0.085, 0.017], [0.14, 0.04, 0.015],
  [-0.15, -0.03, 0.017], [-0.08, -0.02, 0.014], [0.01, 0, 0.02], [0.09, -0.02, 0.016], [0.15, -0.05, 0.014],
  [-0.1, -0.1, 0.015], [-0.02, -0.095, 0.017], [0.06, -0.11, 0.014],
];

const SIDES: [string, number][] = [
  ["L", 1],
  ["R", -1],
];

export default function build() {
  const b = createBuilder({ name: "red-rock-crab" });
  const rnd = rng(11);

  // Skeleton root: the carapace.
  const body = b.joint("body", { at: CENTER });

  // A pointed cone from `from` out to `to`, apex at `to`.
  const pointed = (from: V, to: V, r: number, color: string) => {
    const d: V = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const mid: V = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
    const dir: V = [d[0] / len, d[1] / len, d[2] / len];
    b.part(new THREE.ConeGeometry(r, len, 6), color, { at: mid, dir });
  };

  // ---------- carapace ----------
  const shell = b.part(new THREE.SphereGeometry(1, 14, 9), SHELL, {
    at: CENTER,
    bone: body,
    scale: SHELL_SIZE,
  });
  const shellSurf = b.surface(shell);

  // Two carapace grooves across the top.
  const ridge = (z: number, xs: number[]) => {
    b.sweep(
      xs.map((x) => shellSurf.nearest([x, 0.3, z])),
      0.008,
      { color: RIDGE },
    );
  };
  ridge(0.05, [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15]);
  ridge(-0.07, [-0.13, -0.08, -0.03, 0.02, 0.07, 0.12]);

  // Knobbly bumps on the carapace.
  for (const [x, z, r] of KNOBS) {
    b.stick(new THREE.IcosahedronGeometry(r, 0), KNOB, shellSurf.nearest([x, 0.3, z]));
  }

  // Little frontal teeth between the eye stalks.
  for (const x of [-0.05, 0, 0.05]) {
    b.stick(new THREE.IcosahedronGeometry(0.013, 0), RIDGE, shellSurf.nearest([x, 0.12, 0.4]));
  }

  // Speckles in orange and cream, scattered over the upper shell.
  for (let i = 0; i < 80; i++) {
    const up = 0.25 + 0.75 * rnd();
    const a = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - up * up);
    const dx = s * Math.cos(a);
    const dz = s * Math.sin(a);
    if (dz > 0.5) continue; // keep the face clear for the eyes
    const hit = shellSurf.nearest([CENTER[0] + dx * 0.5, CENTER[1] + up * 0.5, dz * 0.5]);
    const r = 0.005 + 0.006 * rnd();
    const color = rnd() < 0.55 ? ORANGE : CREAM;
    b.stick(new THREE.SphereGeometry(r, 5, 4), color, hit);
  }

  // ---------- walking legs ----------
  for (const [tag, sx] of SIDES) {
    LEGS.forEach((spec, i) => {
      const pts = spec.map(([x, y, z]): V => [sx * x, y, z]);
      const leg = b.chain(`leg${tag}${i + 1}`, pts.slice(0, 4), { parent: body, role: "leg" });
      b.sweep(leg, 0.019, { color: LEG });
      pointed(pts[3], pts[4], 0.016, DARK);
    });
  }

  // ---------- oversized raised claw (crab's left, +X) ----------
  const arm = b.chain(
    "armL",
    [
      [0.15, 0.13, 0.08],
      [0.22, 0.27, 0.12],
      [0.26, 0.42, 0.25],
    ],
    { parent: body, role: "arm" },
  );
  b.sweep(arm, 0.03, { color: CLAW });

  const wrist = arm.at(1);
  const palm = b.part(new THREE.SphereGeometry(1, 14, 10), CLAW, {
    at: wrist,
    scale: [0.07, 0.078, 0.082],
  });
  const palmSurf = b.surface(palm);
  for (const p of [
    [0.26, 0.62, 0.22],
    [0.36, 0.44, 0.2],
    [0.17, 0.5, 0.2],
    [0.2, 0.3, 0.26],
  ] as V[]) {
    b.stick(new THREE.IcosahedronGeometry(0.013, 0), KNOB, palmSurf.nearest(p));
  }

  // Lower pincer, fixed, with a dark pointed tip.
  b.sweep([wrist, [0.27, 0.37, 0.33], [0.28, 0.35, 0.41]], 0.022, { color: CLAW });
  pointed([0.28, 0.35, 0.41], [0.29, 0.37, 0.49], 0.019, DARK);

  // Upper pincer, raised open, with a dark pointed tip.
  b.sweep([wrist, [0.255, 0.48, 0.33], [0.265, 0.53, 0.42]], 0.021, { color: CLAW });
  pointed([0.265, 0.53, 0.42], [0.28, 0.58, 0.5], 0.018, DARK);

  // Little teeth on the inner edges of both pincers.
  const tooth = (p: V, dir: V) => {
    b.part(new THREE.ConeGeometry(0.0065, 0.02, 5), DARK, { at: p, dir });
  };
  tooth([0.2735, 0.379, 0.358], UP);
  tooth([0.2775, 0.371, 0.39], UP);
  tooth([0.2585, 0.4815, 0.3615], DOWN);
  tooth([0.2625, 0.5015, 0.3975], DOWN);

  // ---------- eyes on stalks ----------
  for (const [tag, sx] of SIDES) {
    const stalk = b.chain(
      `eyeStalk${tag}`,
      [
        [sx * 0.08, 0.16, 0.12],
        [sx * 0.095, 0.22, 0.15],
        [sx * 0.1, 0.27, 0.17],
      ],
      { parent: body, role: "neck" },
    );
    b.sweep(stalk, 0.013, { color: LEG });
    const eye = b.part(new THREE.SphereGeometry(0.032, 10, 8), EYE, { at: stalk.at(1) });
    b.stick(
      new THREE.SphereGeometry(0.014, 6, 5),
      PUPIL,
      b.surface(eye).nearest([sx * 0.1, 0.275, 0.26]),
    );
  }

  // ---------- barnacle and seaweed on the back ----------
  const barnacleHit = shellSurf.nearest([0.09, 0.32, -0.1]);
  b.stick(
    new THREE.SphereGeometry(0.016, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    BARNACLE,
    barnacleHit,
  );

  const weedBase = shellSurf.nearest([-0.07, 0.3, -0.12]);
  const weed = [
    weedBase,
    [-0.09, 0.2, -0.16],
    [-0.12, 0.26, -0.19],
    [-0.11, 0.32, -0.21],
    [-0.15, 0.37, -0.22],
  ];
  b.sweep(weed, 0.006, { color: WEED });
  b.along(weed, 3, (at) => {
    b.stick(new THREE.SphereGeometry(0.009, 6, 5), BULB, at);
  });

  return b.root;
}
