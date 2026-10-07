```ts
import * as THREE from "three";
import {
  cards,
  countershade,
  createBuilder,
  frame,
  mix,
  paint,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A proud old male lion at rest, head held high, with a golden-to-chocolate mane, a scarred brow, amber eyes and a dark tail tuft.",
};

type Vec = [number, number, number];

const TAWNY = "#c98a3f";
const TAWNY_DARK = "#8e5526";
const CREAM = "#f3e2bd";
const NOSE = "#16100d";
const AMBER = "#e9a31c";
const PUPIL = "#120b06";
const PAD = "#3d2415";
const TUFT = "#2e1a0d";

const GOLD = "#f2c966";
const RUST = "#a8662c";
const CHOCOLATE = "#3d1f0e";

const HEAD_C: Vec = [0, 1.0, 0.86];
const HEAD_R: Vec = [0.16, 0.16, 0.19];
const MANE_C: Vec = [0, 0.98, 0.82];
const RUFF_C: Vec = [0, 0.72, 0.5];
const FACE = new THREE.Vector3(0, 1.0, 1.02);

const BODY = countershade(TAWNY, CREAM, { level: -0.05, soft: 0.45 });
const HEAD = countershade("#d89d4f", CREAM, { level: -0.3, soft: 0.3 });
const MANE = paint((p) => {
  const t = smoothstep(0.15, 0.7, p.distanceTo(FACE));
  return t < 0.5 ? mix(GOLD, RUST, t * 2) : mix(RUST, CHOCOLATE, (t - 0.5) * 2);
});

// A tapered, pointed strand: root at the bottom of the drawing, tip at the top. Its midrib darkens the tint a little.
const STRAND = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 0C76 30 94 64 82 96Q50 106 18 96C6 64 24 30 50 0Z" fill="#ffffff"/><path d="M50 8Q54 52 50 92" fill="none" stroke="#c4c4c4" stroke-width="5" stroke-linecap="round"/></svg>`;
// A healed scar across the brow.
const SCAR = `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><path d="M4 9L26 14L38 27L56 21L96 33" fill="none" stroke="#6b3420" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type Ellipsoid = { p: THREE.Vector3; n: THREE.Vector3 };

/** The point on an ellipsoid (centre c, radii r) in direction dir from its centre, its outward normal, and an optional lift. */
function onEllipsoid(c: Vec, r: Vec, dir: THREE.Vector3, lift = 0): Ellipsoid {
  const d = dir.clone().normalize();
  const k = 1 / Math.hypot(d.x / r[0], d.y / r[1], d.z / r[2]);
  const n = new THREE.Vector3(d.x / r[0] ** 2, d.y / r[1] ** 2, d.z / r[2] ** 2).normalize();
  const p = new THREE.Vector3(c[0] + d.x * k, c[1] + d.y * k, c[2] + d.z * k).addScaledVector(n, lift);
  return { p, n };
}

/** Evenly spread unit directions over a sphere. */
function fibonacci(n: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) * 2) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  });
}

/** Card roots on an ellipsoid shell, each facing its outward normal, for the directions `keep` accepts. */
function shell(c: Vec, r: Vec, count: number, keep: (d: THREE.Vector3) => boolean) {
  return fibonacci(count)
    .filter(keep)
    .map((d) => {
      const { p, n } = onEllipsoid(c, r, d);
      return frame(p, n);
    });
}

export default function lion() {
  const b = createBuilder({ name: "lion", detail: 1, paintSize: 1024 });
  const ball = (w: number, h: number) => new THREE.SphereGeometry(1, b.segments(w), b.segments(h));
  const strand = svg(STRAND);
  const scar = svg(SCAR);

  // Skeleton: a low body, a neck raised high, a head held up, jointed legs and a long tail.
  b.joint("hips", { at: [0, 0.36, -0.55], dir: [0, 0.1, 1] });
  b.joint("chest", { parent: "hips", at: [0, 0.5, 0.3], dir: [0, 0.3, 1], role: "spine" });
  const neck = b.joint("neck", { parent: "chest", at: [0, 0.74, 0.56], dir: [0, 0.75, 0.66], role: "neck" });
  const head = b.joint("head", { parent: neck, at: HEAD_C, dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.88, 0.9], dir: [0, -0.12, 1], role: "jaw" });

  // Legs: a chain per leg, rigid capsules along each segment, big padded paws on the tips.
  for (const [side, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const x = (v: number) => sx * v;

    const fore = b.chain(
      `foreleg${side}`,
      [
        [x(0.24), 0.5, 0.42],
        [x(0.24), 0.16, 0.5],
        [x(0.24), 0.08, 0.9],
      ],
      { parent: "chest", role: "leg", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    const [shoulder, elbow, wrist] = fore.joints;
    b.capsule(shoulder, elbow, [0.12, 0.09], { color: TAWNY });
    b.capsule(elbow, wrist, [0.09, 0.07], { color: TAWNY });
    b.part(ball(12, 9), TAWNY, {
      at: [x(0.24), 0.07, 0.98],
      scale: [0.1, 0.07, 0.12],
      bone: wrist,
      name: `paw${side}`,
    });
    for (const dx of [-0.055, 0, 0.055])
      b.part(ball(8, 6), PAD, { at: [x(0.24) + dx, 0.03, 1.08], scale: 0.03, bone: wrist, name: `toe${side}` });

    const hind = b.chain(
      `hindleg${side}`,
      [
        [x(0.25), 0.36, -0.55],
        [x(0.27), 0.18, -0.25],
        [x(0.24), 0.07, -0.7],
      ],
      { parent: "hips", role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`] },
    );
    const [hip, knee, ankle] = hind.joints;
    b.capsule(hip, knee, [0.2, 0.12], { color: TAWNY });
    b.capsule(knee, ankle, [0.12, 0.07], { color: TAWNY });
    b.part(ball(12, 9), TAWNY, {
      at: [x(0.24), 0.065, -0.74],
      scale: [0.1, 0.065, 0.12],
      bone: ankle,
      name: `hindPaw${side}`,
    });
    for (const dx of [-0.055, 0, 0.055])
      b.part(ball(8, 6), PAD, {
        at: [x(0.24) + dx, 0.03, -0.61],
        scale: 0.03,
        bone: ankle,
        name: `hindToe${side}`,
      });
  }

  // Long tail that curls down to a dark tuft.
  const tail = b.chain(
    "tail",
    [
      [0, 0.4, -0.98],
      [0, 0.38, -1.3],
      [0, 0.3, -1.56],
      [0, 0.18, -1.74],
      [0, 0.08, -1.84],
    ],
    { parent: "hips", role: "tail", names: ["tail1", "tail2", "tail3", "tail4", "tailTip"] },
  );
  b.sweep(tail, [0.06, 0.03], { color: TAWNY, sides: 8, name: "tail" });
  const tip = tail.joints[tail.joints.length - 1];
  b.cards(
    Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2;
      return frame(tip, [Math.cos(a) * 0.55, -0.2 + 0.1 * Math.sin(3 * a), -1]);
    }),
    strand,
    { size: [0.12, 0.22], lean: 10, vary: 0.25, rng: rng(5), color: TUFT, cross: true, bone: tip, name: "tuft" },
  );
  b.part(ball(12, 9), TUFT, { at: [0, 0.11, -1.86], scale: [0.065, 0.065, 0.085], bone: tip, name: "tuftBall" });

  // Body: a tawny barrel with a cream underside, from haunches to chest.
  b.loft(
    [
      { at: [0, 0.36, -0.85], w: 0.46, h: 0.5 },
      { at: [0, 0.34, -0.42], w: 0.6, h: 0.56 },
      { at: [0, 0.37, 0], w: 0.6, h: 0.56 },
      { at: [0, 0.5, 0.36], w: 0.54, h: 0.54 },
    ],
    { color: BODY, bone: ["hips", "chest"], sides: 12, name: "body" },
  );

  // Neck: a smooth column rising to the head.
  b.loft(
    [
      { at: [0, 0.56, 0.3], w: 0.5, h: 0.5 },
      { at: [0, 0.76, 0.56], w: 0.42, h: 0.44 },
      { at: [0, 0.94, 0.78], w: 0.38, h: 0.4 },
    ],
    { color: BODY, bone: ["chest", "neck"], sides: 10, name: "neck" },
  );

  // Head: a golden skull, a cream muzzle and jaw, a broad black nose.
  const skull = b.part(ball(16, 12), HEAD, { at: HEAD_C, scale: HEAD_R, bone: head, name: "head" });
  b.part(ball(12, 9), CREAM, { at: [0, 0.945, 1.08], scale: [0.085, 0.07, 0.09], bone: head, name: "muzzle" });
  b.part(ball(10, 7), NOSE, { at: [0, 0.98, 1.15], scale: [0.06, 0.04, 0.035], bone: head, name: "nose" });
  b.part(ball(12, 8), CREAM, { at: [0, 0.85, 1.0], scale: [0.068, 0.035, 0.1], bone: jaw, name: "lowerJaw" });

  for (const [side, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    // Amber eyes with round black pupils, set into the front of the skull.
    const eyeDir = new THREE.Vector3(sx * 0.42, 0.22, 0.88);
    const eye = onEllipsoid(HEAD_C, HEAD_R, eyeDir, 0.004);
    const pupil = onEllipsoid(HEAD_C, HEAD_R, eyeDir, 0.032);
    b.part(ball(12, 9), AMBER, { at: eye.p, scale: 0.03, bone: head, name: `eye${side}` });
    b.part(ball(8, 6), PUPIL, { at: pupil.p, scale: 0.014, bone: head, name: `pupil${side}` });

    // Ears peeking out at the top sides of the skull.
    const ear = onEllipsoid(HEAD_C, HEAD_R, new THREE.Vector3(sx * 0.6, 0.74, -0.25), 0.01);
    b.part(ball(8, 6), TAWNY_DARK, { at: ear.p, scale: [0.045, 0.045, 0.03], bone: head, name: `ear${side}` });
  }

  // Scar across the lion's left brow, drawn onto the skull.
  const brow = onEllipsoid(HEAD_C, HEAD_R, new THREE.Vector3(0.42, 0.5, 0.76), 0.002);
  b.decal(skull, scar, { at: brow.p, dir: brow.n, size: [0.13, 0.052], name: "scar" });

  // Mane: an outer layer of long strands, an undercoat, and a ruff down the chest.
  b.cards(
    shell(MANE_C, [0.22, 0.23, 0.22], 170, (d) => d.z < 0.25 && d.y > -0.45),
    strand,
    {
      size: [0.13, 0.32],
      lean: 40,
      bend: 25,
      flow: [0, -0.35, -1],
      vary: 0.3,
      spin: 25,
      rng: rng(7),
      color: MANE,
      cross: true,
      bone: head,
      name: "mane",
    },
  );
  b.cards(
    shell(MANE_C, [0.2, 0.21, 0.2], 150, (d) => d.z < 0.2 && d.y > -0.4),
    strand,
    {
      size: [0.1, 0.2],
      lean: 15,
      flow: [0, -0.25, -1],
      vary: 0.3,
      rng: rng(11),
      color: MANE,
      cross: true,
      bone: head,
      name: "undercoat",
    },
  );
  b.cards(
    shell(RUFF_C, [0.3, 0.3, 0.3], 220, (d) => d.y < 0.05 && d.y > -0.85 && d.z > -0.3 && d.z < 0.7),
    strand,
    {
      size: [0.12, 0.28],
      lean: 50,
      flow: [0, -1, -0.2],
      vary: 0.3,
      rng: rng(13),
      color: MANE,
      cross: true,
      bone: "neck",
      name: "ruff",
    },
  );

  return b.root;
}
```