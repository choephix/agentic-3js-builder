import * as THREE from "three";
import { bezier, catmull, createBuilder, mottle, noise, paint, rng, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

type V3 = [number, number, number];
type RGB = [number, number, number];

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "An emperor penguin with glossy blue-black plumage, a gold ear patch and an orange-pink beak stripe, with a grey down chick peeking out between its feet.",
};

// ---------- colour helpers ----------
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const mixC = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const BLUE_BLACK = hex("#18202d");
const SNOW = hex("#f3f0e6");
const GOLD = hex("#eeb33a");
const FEET = "#17181d";
const EYE = "#06070a";
const BEAK = "#16171c";
const STRIPE = "#f0875f";

// ---------- body stations (model space, metres) ----------
const TORSO: { at: V3; w: number; h: number }[] = [
  { at: [0, 0.16, -0.01], w: 0.27, h: 0.24 },
  { at: [0, 0.34, 0.0], w: 0.4, h: 0.36 },
  { at: [0, 0.54, 0.02], w: 0.44, h: 0.4 },
  { at: [0, 0.7, 0.02], w: 0.4, h: 0.34 },
  { at: [0, 0.8, 0.02], w: 0.3, h: 0.28 },
];

// ---------- webbed foot outline (u = forward, v = left) ----------
const FOOT_UV: [number, number][] = [
  [-0.07, -0.06],
  [0.04, -0.075],
  [0.14, -0.05],
  [0.085, -0.02],
  [0.15, 0.0],
  [0.085, 0.025],
  [0.14, 0.05],
  [0.03, 0.07],
  [-0.07, 0.06],
];
const footOutline = (k: number): OutlinePoint[] =>
  FOOT_UV.map(([u, v]): OutlinePoint => [u * k, v * k]);

// ---------- chick down tuft (drawn bottom edge = root) ----------
const TUFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
  <path d="M16 40 C9 34 2 24 4 12 C9 20 11 24 12 28 C11 18 13 9 16 2 C19 9 21 18 20 28 C21 24 23 20 28 12 C30 24 23 34 16 40Z" fill="#8c939c"/>
  <path d="M16 38 C12 32 10 26 11 20 C13 25 14 27 16 28 C18 27 19 25 21 20 C22 26 20 32 16 38Z" fill="#d2d7dd"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "emperor-penguin" });

  // ---------- paints ----------
  // Blue-black back and head, snowy front and underside, gold patch on the ear and neck side.
  const plumage = paint((p, n) => {
    const snow =
      Math.max(smooth(0.12, 0.4, n.z), smooth(-0.2, -0.6, n.y)) * smooth(0.86, 0.78, p.y);
    const gold =
      smooth(0.04, 0.07, Math.abs(p.x)) *
      smooth(0.84, 0.88, p.y) *
      smooth(1.05, 1.0, p.y) *
      smooth(-0.07, -0.03, p.z) *
      smooth(0.15, 0.1, p.z) *
      smooth(0.12, 0.45, noise(p, 0.05, 4));
    return mixC(mixC(BLUE_BLACK, SNOW, snow), GOLD, gold);
  });

  // Beak: dark base and tip, orange-pink band along both sides.
  const beakPaint = paint((_p, _n, s) => {
    const side = Math.abs(Math.sin((s[1] * Math.PI) / 180)) > 0.7;
    return s[0] > 0.3 && s[0] < 0.85 && side ? STRIPE : BEAK;
  });

  const chickDown = mottle("#7d848d", "#bcc2ca", { size: 0.05, contrast: 0.6, seed: 4 });
  const tuft = svg(TUFT_SVG, { size: 128 });

  // ---------- adult skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.16, -0.01], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", catmull(TORSO.map((s) => s.at)), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "neck"],
    role: "spine",
  });
  const head = b.joint("head", { parent: spine, at: [0, 0.98, 0.04], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.035 }),
    aim: head.local({ forward: 0.22, up: -0.06 }),
    role: "jaw",
  });

  // ---------- body, head, tail ----------
  b.loft(TORSO, { bone: [spine, hips], color: plumage });
  b.capsule([0, 0.25, -0.17], [0, 0.19, -0.27], 0.035, { bone: hips, color: plumage });

  b.part(new THREE.SphereGeometry(0.1, 14, 10), plumage, {
    bone: head,
    at: [0, 0.98, 0.04],
    scale: [1.02, 1, 1.06],
    flat: true,
  });

  // Eyes with a small glint.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.045, up: 0.02, forward: 0.09 }),
    });
    b.part(new THREE.SphereGeometry(0.0037, 5, 4), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.028, forward: 0.1 }),
    });
  }

  // Long slender beak: upper mandible on the head, lower on the jaw.
  const upperBeak = bezier(
    head.local({ forward: 0.05, up: 0.02 }),
    head.local({ forward: 0.13, up: 0.035 }),
    head.local({ forward: 0.21, up: 0.01 }),
    head.local({ forward: 0.26, up: -0.03 }),
  );
  b.sweep(upperBeak, (t): [number, number] => [0.022 - 0.012 * t, 0.03 - 0.022 * t], {
    bone: head,
    color: beakPaint,
  });

  const lowerBeak = bezier(
    head.local({ forward: 0.04, up: -0.035 }),
    head.local({ forward: 0.12, up: -0.045 }),
    head.local({ forward: 0.19, up: -0.05 }),
    head.local({ forward: 0.22, up: -0.06 }),
  );
  b.sweep(lowerBeak, (t): [number, number] => [0.016 - 0.006 * t, 0.013 - 0.007 * t], {
    bone: jaw,
    color: beakPaint,
  });

  // ---------- legs, feet, flippers ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";

    const leg = b.chain(
      `leg${k}`,
      catmull([
        [s * 0.1, 0.2, -0.02],
        [s * 0.1, 0.1, 0.0],
        [s * 0.1, 0.03, 0.03],
      ]),
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`], role: "leg" },
    );
    b.sweep(leg, 0.03, { color: FEET });
    b.extrude(footOutline(1.15), {
      at: [s * 0.1, 0.012, 0.03],
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: 0.024,
      bevel: 0.004,
      color: FEET,
      bone: leg,
    });

    // Stubby flipper held slightly out: flat blade, thin across x, wide front to back.
    const arm = b.chain(
      `arm${k}`,
      catmull([
        [s * 0.15, 0.77, 0.0],
        [s * 0.22, 0.6, 0.01],
        [s * 0.26, 0.44, 0.03],
      ]),
      { parent: spine.joints[3], names: [`shoulder${k}`, `wrist${k}`, `hand${k}`], role: "arm" },
    );
    b.sweep(arm, (t): [number, number] => [0.012 - 0.004 * t, 0.034 - 0.022 * t], {
      color: plumage,
    });
  }

  // ---------- grey chick between the feet ----------
  const chick = b.joint("chick", { parent: hips, at: [0, 0, 0.27], dir: [0, 1, 0] });
  const chickHead = b.joint("chickHead", { parent: chick, at: [0, 0.3, 0.28], dir: [0, 1, 0.1] });

  const chickBody = b.part(new THREE.SphereGeometry(0.11, 12, 9), chickDown, {
    bone: chick,
    at: [0, 0.13, 0.27],
    scale: [1, 1.12, 1],
  });
  const chickCrown = b.part(new THREE.SphereGeometry(0.095, 12, 9), chickDown, {
    bone: chickHead,
    at: [0, 0.3, 0.28],
  });

  // Fluffy down: tufts scattered over the chick's round shapes.
  b.cards(
    b.surface(chickBody).scatter(150, {
      rng: rng(11),
      minDist: 0.026,
      filter: (h) => h.n.y > -0.4,
    }),
    tuft,
    { size: [0.05, 0.065], lean: 35, bend: 25, vary: 0.25, rng: rng(12) },
  );
  b.cards(
    b.surface(chickCrown).scatter(90, {
      rng: rng(13),
      minDist: 0.022,
      filter: (h) => h.n.y > -0.3,
    }),
    tuft,
    { size: [0.045, 0.055], lean: 40, bend: 25, vary: 0.25, rng: rng(14) },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), EYE, {
      bone: chickHead,
      at: chickHead.local({ left: s * 0.035, up: 0.02, forward: 0.09 }),
    });
    b.extrude(footOutline(0.45), {
      at: [s * 0.04, 0.006, 0.25],
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: FEET,
      bone: chick,
    });
  }
  b.spike(chickHead.local({ forward: 0.09, up: -0.02 }), [0, 0, 1], 0.035, 0.012, {
    bone: chickHead,
    color: "#4b5058",
  });

  return b.root;
}
