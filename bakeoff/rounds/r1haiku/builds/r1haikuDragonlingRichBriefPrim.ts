import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

type P = [number, number, number];

const TEAL = "#2a9d8f";
const TEAL_DEEP = "#1d7468";
const BELLY = "#ecd58c";
const SPINE = "#f58a3b";
const HORN = "#efe4c8";
const AMBER = "#f2a007";
const EYE_BALL = "#ffb300";
const PUPIL = "#1a1410";
const TOOTH = "#f8f4e6";
const SMOKE = "#dcdcd6";
const EGG = "#eee6cf";
const SPECK = "#8c6a46";
const NOSTRIL = "#14403a";
const CLAW = "#3a3328";

export const meta = {
  name: "Baby dragon with broken egg",
  description: "A house-cat-sized teal baby dragon sits proudly beside its speckled, cracked egg.",
};

const dist = (a: P, c: P) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const mid = (a: P, c: P): P => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

export default function build() {
  const rand = rng(31);
  const b = createBuilder({ name: "baby-dragon" });

  // ---------- helpers ----------
  const ball = (r: number, color: string, at: P, scale?: P) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, scale ? { at, scale } : { at });

  // tapered point from base a to tip c (horns, spines, claws)
  const stud = (a: P, c: P, r: number, color: string) => {
    const len = dist(a, c);
    b.part(new THREE.ConeGeometry(r, len, 6), color, { at: mid(a, c), aim: c });
  };

  // round limb segment from a to c
  const seg = (a: P, c: P, r: number, color: string) => {
    const len = dist(a, c);
    b.part(new THREE.CapsuleGeometry(r, Math.max(0.002, len - 2 * r), 3, 6), color, {
      at: mid(a, c),
      aim: c,
    });
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.13, 0] });
  const jaw = b.joint("jaw", { at: [0, 0.455, 0.2], parent: hips });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.joint(`hip${side}`, { at: [s * 0.07, 0.12, 0], parent: hips });
    b.joint(`knee${side}`, { at: [s * 0.085, 0.07, 0.11], parent: hips });
    b.joint(`ankle${side}`, { at: [s * 0.075, 0.02, 0.15], parent: hips });
  }

  const neckPts: P[] = [
    [0, 0.28, 0.05],
    [0, 0.36, 0.1],
    [0, 0.44, 0.14],
  ];
  const neck = b.chain("neck", neckPts);
  b.sweep(neck, { radius: 0.042, color: TEAL });

  const tailPts: P[] = [
    [0, 0.11, -0.08],
    [0, 0.08, -0.17],
    [0, 0.06, -0.27],
    [0, 0.05, -0.33],
  ];
  const tail = b.chain("tail", tailPts);
  b.sweep(tail, { radius: 0.04, color: TEAL });

  // ---------- torso and head ----------
  ball(0.11, TEAL, [0, 0.22, 0], [1, 1.15, 0.95]);
  ball(0.085, BELLY, [0, 0.2, 0.06], [0.9, 1.05, 0.6]);

  // head
  ball(0.075, TEAL, [0, 0.49, 0.17], [1, 0.92, 1.1]);
  ball(0.048, BELLY, [0, 0.46, 0.2], [1, 0.7, 0.9]);
  ball(0.05, TEAL, [0, 0.48, 0.25], [0.9, 0.75, 1.2]);
  ball(0.008, NOSTRIL, [0.018, 0.505, 0.28]);

  // lower jaw with toothy grin
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.11), BELLY, { at: [0, 0.45, 0.23] });
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.014;
    stud([x, 0.458, 0.25], [x, 0.478, 0.25], 0.006, TOOTH);
  }

  // big amber eyes
  for (const s of [1, -1]) {
    ball(0.032, EYE_BALL, [s * 0.052, 0.515, 0.215]);
    ball(0.016, PUPIL, [s * 0.054, 0.515, 0.242], [0.6, 1.2, 0.5]);
  }

  // stubby swept horns
  for (const s of [1, -1]) {
    stud([s * 0.04, 0.55, 0.15], [s * 0.05, 0.615, 0.1], 0.013, HORN);
  }

  // ---------- legs (sitting pose, feet forward) ----------
  for (const s of [1, -1]) {
    ball(0.085, TEAL, [s * 0.07, 0.11, -0.03], [1, 0.75, 1.2]);
    seg([s * 0.085, 0.07, 0.11], [s * 0.075, 0.03, 0.15], 0.03, TEAL);
    b.part(new THREE.BoxGeometry(0.06, 0.024, 0.09), TEAL_DEEP, { at: [s * 0.075, 0.012, 0.18] });
    for (const x of [-0.016, 0, 0.016]) {
      stud([s * 0.075 + x, 0.014, 0.226], [s * 0.075 + x, 0.008, 0.245], 0.006, CLAW);
    }
  }

  // ---------- arms, wings, spines per side ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front arm resting forward, hand near knee
    const shoulder: P = [s * 0.09, 0.29, 0.04];
    const elbow: P = [s * 0.13, 0.2, 0.1];
    const wrist: P = [s * 0.12, 0.14, 0.15];
    b.chain(`arm${side}`, [shoulder, elbow, wrist]);
    seg(shoulder, elbow, 0.022, TEAL);
    seg(elbow, wrist, 0.02, TEAL);
    ball(0.026, TEAL, wrist);
    for (const dx of [-0.012, 0, 0.012]) {
      stud([wrist[0] + s * dx, wrist[1] - 0.01, wrist[2] + 0.02], [wrist[0] + s * dx, wrist[1] - 0.02, wrist[2] + 0.045], 0.005, CLAW);
    }

    // oversized wing: arm bone, finger bones, amber skin
    const wShoulder: P = [s * 0.09, 0.33, -0.01];
    const wElbow: P = [s * 0.17, 0.4, 0.0];
    const wWrist: P = [s * 0.25, 0.37, -0.02];
    const tip1: P = [s * 0.36, 0.3, -0.03];
    const tip2: P = [s * 0.33, 0.36, -0.12];
    const tip3: P = [s * 0.25, 0.43, -0.14];
    b.chain(`wing${side}`, [wShoulder, wElbow, wWrist]);
    seg(wShoulder, wElbow, 0.016, TEAL);
    seg(wElbow, wWrist, 0.013, TEAL);
    seg(wWrist, tip1, 0.008, TEAL_DEEP);
    seg(wWrist, tip2, 0.008, TEAL_DEEP);
    seg(wWrist, tip3, 0.008, TEAL_DEEP);

    b.membrane(
      [wShoulder, wElbow, wWrist, tip1],
      [
        [s * 0.1, 0.2, -0.06],
        [s * 0.2, 0.24, -0.12],
        [s * 0.28, 0.3, -0.14],
        tip3,
      ],
      { color: AMBER },
    );

    // dorsal spines in soft orange, along back and neck
    const spines: [P, P][] = [];
    const backRow: [number, number][] = [
      [0.03, 0.335],
      [-0.02, 0.32],
      [-0.07, 0.285],
      [-0.12, 0.245],
      [-0.17, 0.195],
      [-0.22, 0.15],
    ];
    for (const [z, y] of backRow) {
      spines.push([[0, y, z], [0, y + 0.05, z - 0.02]]);
    }
    spines.push([[0, 0.39, 0.1], [0, 0.44, 0.08]]);
    if (s > 0) {
      for (const [base, tip] of spines) stud(base, tip, 0.014, SPINE);
    }
  }

  // ---------- tail with spade ----------
  ball(0.04, TEAL_DEEP, [0, 0.05, -0.37], [1.0, 1.25, 0.3]);
  stud([0, 0.05, -0.37], [0, 0.05, -0.45], 0.03, TEAL_DEEP);

  // ---------- smoke wisp from one nostril ----------
  const smoke: [P, number][] = [
    [[0.022, 0.545, 0.27], 0.012],
    [[0.035, 0.575, 0.28], 0.016],
    [[0.025, 0.61, 0.27], 0.02],
    [[0.01, 0.645, 0.25], 0.024],
  ];
  for (const [at, r] of smoke) ball(r, SMOKE, at);

  // ---------- broken egg beside the dragon ----------
  const ex = 0.3;
  const ez = 0.14;
  const H = 0.17;
  const eggR = (t: number) => 0.08 * Math.pow(Math.sin(Math.PI * t), 0.7) * (1 - 0.18 * (t - 0.5));

  const outline: number[][] = [[0, 0]];
  for (let i = 1; i <= 14; i++) {
    const t = (i / 14) * 0.7;
    outline.push([eggR(t), t * H]);
  }
  // jagged broken rim
  for (let k = 0; k < 8; k++) {
    const t = 0.72 + (k % 2) * 0.03;
    const r = eggR(0.7) * (k % 2 ? 0.6 : 1.0);
    outline.push([r, t * H]);
  }
  outline.push([0, 0.72 * H]);
  b.lathe(outline, { at: [ex, 0, ez], axis: [0, 1, 0] });

  // speckles on the shell
  for (let i = 0; i < 40; i++) {
    const t = 0.05 + rand() * 0.6;
    const a = rand() * Math.PI * 2;
    const r = eggR(t);
    ball(0.006, SPECK, [ex + r * Math.cos(a), t * H, ez + r * Math.sin(a)]);
  }

  // shell shards on the floor
  const shards: [P, P][] = [
    [[ex + 0.1, 0.01, ez + 0.05], [ex + 0.13, 0.035, ez + 0.08]],
    [[ex - 0.09, 0.01, ez + 0.07], [ex - 0.12, 0.03, ez + 0.1]],
    [[ex + 0.04, 0.01, ez - 0.1], [ex + 0.06, 0.025, ez - 0.13]],
  ];
  for (const [a, c] of shards) stud(a, c, 0.022, EGG);

  return b.root;
}
