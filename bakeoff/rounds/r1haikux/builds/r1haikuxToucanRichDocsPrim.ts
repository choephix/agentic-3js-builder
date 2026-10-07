import * as THREE from "three";
import { catmull, createBuilder, limb, mottle, paint, rng, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan",
  description: "A keel-billed toucan with a rainbow bill, perched on a short mossy branch beside a pink orchid.",
};

const D = Math.PI / 180;

// Palette
const INK = "#17151e";
const LEMON = "#ffe21f";
const LIME = "#a7e11c";
const SKY = "#4fc4ff";
const ORANGE = "#ff8a1c";
const CHERRY = "#d3122f";
const SCARLET = "#ff2d2d";
const BLUE = "#1f7ff0";
const WHITE = "#fbfaf2";
const EYE = "#0d0c12";
const MOSSY = "#5fae3a";
const STEM = "#5b9c36";
const PINK = "#ff7ab8";
const PINK_LIGHT = "#ffa6d3";
const PINK_DEEP = "#f2569f";
const LIP = "#e0287a";
const COLUMN = "#fff3d0";

// Paints
const BODY = mottle(INK, "#2b2938", { size: 0.09 });
const BODY_PAINT = paint((p, n) => (n.z > 0.35 && p.y > 0.23 && p.y < 0.36 ? LEMON : BODY));
const MOSS = mottle("#7cc247", "#2f7426", { size: 0.035 });
const BARK = mottle("#86603a", "#4d3420", { size: 0.04 });
const BRANCH_PAINT = paint((_p, n) => (n.y > 0.35 ? MOSS : BARK));

const RAINBOW: [number, string][] = [
  [0.3, LIME],
  [0.6, SKY],
  [0.85, ORANGE],
  [1, CHERRY],
];
const UNDERTAIL: [number, number, string, number, number][] = [[110, 250, SCARLET, 0, 0.45]];

/** Piecewise-linear profile through (t, value) keys. */
const ramp = (t: number, keys: [number, number][]): number => {
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

/** A petal or sepal: base at the origin, tip along +x. */
const petalOutline = (len: number, wid: number): OutlinePoint[] => [
  [0, -0.04 * wid, "sharp"],
  [0.3 * len, -0.85 * wid],
  [0.72 * len, -wid],
  [len, -0.2 * wid],
  [len, 0.2 * wid],
  [0.72 * len, wid],
  [0.3 * len, 0.85 * wid],
  [0, 0.04 * wid, "sharp"],
];

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });

  // ------------------------------------------------------------ scenery root
  // Branch, moss and orchid hang on one fixed joint so they never move with the bird.
  const base = b.joint("base", { at: [0, 0, 0] });

  // ------------------------------------------------------------ branch
  const branchPath = catmull([
    [-0.42, 0.035, -0.02],
    [-0.2, 0.035, 0],
    [0, 0.035, 0],
    [0.2, 0.035, 0],
    [0.42, 0.035, -0.02],
  ]);
  const branch = b.sweep(branchPath, 0.035, { bone: base, color: BRANCH_PAINT });

  const clearOfBird = (x: number) => Math.abs(x) > 0.13 && Math.abs(x + 0.25) > 0.1;

  // Moss clumps stuck on the top of the branch.
  const mossRng = rng(11);
  for (const hit of b.surface(branch).scatter(26, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.3 && clearOfBird(h.at.x),
  })) {
    const r = 0.011 + mossRng() * 0.013;
    b.stick(new THREE.SphereGeometry(r, 6, 4).scale(1, 0.55, 1), MOSSY, hit, { embed: 0.35 });
  }

  // Grass-like moss tufts as cards.
  const tuft = svg(
    `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M20 48C12 32 4 22 2 6C13 16 17 26 19 36C20 22 23 11 31 0C29 17 27 33 22 48Z" fill="#6fbf3c"/>` +
      `<path d="M20 48C18 36 15 28 11 20C17 28 20 37 21 48Z" fill="#3d8a2b"/>` +
      `</svg>`,
    { size: 128 },
  );
  b.cards(
    b.surface(branch).scatter(16, {
      rng: rng(21),
      minDist: 0.07,
      filter: (h) => h.n.y > 0.5 && clearOfBird(h.at.x),
    }),
    tuft,
    { size: [0.05, 0.055], lean: 20, vary: 0.3, rng: rng(22) },
  );

  // ------------------------------------------------------------ orchid
  const C = [-0.25, 0.19, 0.05]; // flower centre, facing up and forward
  const ex = [1, 0, 0];
  const ey = [0, 0.866, -0.5];
  const petalDir = (deg: number): number[] => {
    const c = Math.cos(deg * D);
    const s = Math.sin(deg * D);
    return [0, 1, 2].map((i) => c * ex[i] + s * ey[i]);
  };
  const petal = (deg: number, len: number, wid: number, color: string) =>
    b.extrude(petalOutline(len, wid), {
      at: C,
      x: petalDir(deg),
      y: petalDir(deg + 90),
      thickness: 0.004,
      bevel: 0.0015,
      smoothing: 2,
      color,
      bone: base,
    });

  petal(90, 0.05, 0.02, PINK); // dorsal sepal
  petal(-30, 0.05, 0.02, PINK_DEEP); // lateral sepals
  petal(210, 0.05, 0.02, PINK_DEEP);
  petal(30, 0.053, 0.03, PINK_LIGHT); // petals
  petal(150, 0.053, 0.03, PINK_LIGHT);
  petal(270, 0.042, 0.032, LIP); // lip
  b.part(new THREE.SphereGeometry(0.009, 8, 6), COLUMN, { bone: base, at: C, flat: true });

  const stem = catmull([
    [-0.25, 0.05, 0.0],
    [-0.253, 0.11, 0.008],
    [-0.25, 0.165, 0.024],
    [-0.25, 0.18, 0.033],
  ]);
  b.sweep(stem, (t: number) => 0.0055 - 0.0015 * t, { bone: base, color: STEM });

  // ------------------------------------------------------------ bird skeleton
  const P0 = [0, 0.2, -0.07]; // rump, the hips
  const P1 = [0, 0.24, 0];
  const P2 = [0, 0.29, 0.06];
  const P3 = [0, 0.33, 0.1]; // base of the neck
  const H = [0, 0.4, 0.12]; // head centre
  const U0 = [0, 0.43, 0.13]; // upper bill root, inside the skull
  const U3 = [0.09, 0.39, 0.37]; // upper bill tip, hooked down
  const L0 = [0, 0.365, 0.12]; // lower bill hinge
  const L3 = [0.075, 0.33, 0.34]; // lower bill tip

  const hips = b.joint("hips", { parent: base, at: P0, role: "spine" });
  const spine = b.chain("spine", [P0, P1, P2, P3], {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  // Body: a deep chest tapering to the rump.
  b.sweep(
    spine,
    (t: number): [number, number] => [
      ramp(t, [[0, 0.04], [0.35, 0.072], [0.7, 0.07], [1, 0.05]]),
      ramp(t, [[0, 0.05], [0.35, 0.08], [0.7, 0.075], [1, 0.06]]),
    ],
    { color: BODY_PAINT },
  );

  // Tail, with the scarlet undertail coverts at its root.
  const tail = b.chain("tail", [P0, [0, 0.135, -0.14], [0, 0.07, -0.2]], { parent: hips, role: "tail" });
  b.sweep(tail, (t: number): [number, number] => [0.034 + 0.008 * t, 0.012], {
    color: INK,
    sectors: UNDERTAIL,
  });

  // Folded wings along the flanks.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      [
        [s * 0.066, 0.29, 0.03],
        [s * 0.074, 0.23, -0.04],
        [s * 0.07, 0.16, -0.13],
      ],
      { parent: spine.joints[1], role: "wing" },
    );
    b.sweep(wing, (t: number): [number, number] => [0.011, 0.042 - 0.02 * t], { color: INK });
  }

  // Neck and head.
  const neck = b.chain("neck", [P3, H], { parent: spine.joints[2], role: "neck" });
  b.sweep(neck, (t: number): [number, number] => [0.046 - 0.006 * t, 0.042 - 0.004 * t], {
    color: BODY_PAINT,
  });
  const head = b.joint("head", { parent: neck.joints[0], at: H, dir: [0.12, 0.08, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.06, 14, 10).scale(1, 0.92, 1), INK, { bone: head, at: H, flat: true });

  // Eyes: dark eye inside a lime skin ring, with a small highlight.
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.039, up: 0.02, forward: 0.05 });
    b.part(new THREE.TorusGeometry(0.02, 0.0075, 6, 12), LIME, {
      bone: head,
      at: eyeAt,
      dir: [s * 0.58, 0.3, 0.75],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.0115, 8, 6), EYE, { bone: head, at: eyeAt, flat: true });
    b.part(new THREE.SphereGeometry(0.0032, 5, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.0425, up: 0.0218, forward: 0.0545 }),
    });
  }

  // ------------------------------------------------------------ the bill
  const upperJaw = b.joint("upperJaw", { parent: head, at: U0, aim: U3, role: "jaw" });
  const jaw = b.joint("jaw", { parent: head, at: L0, aim: L3, role: "jaw" });

  const upperBill = b.sweep(
    catmull([U0, [0.01, 0.45, 0.22], [0.06, 0.43, 0.32], U3]),
    (t: number): [number, number] => [
      ramp(t, [[0, 0.046], [0.35, 0.04], [0.8, 0.018], [1, 0.008]]),
      ramp(t, [[0, 0.05], [0.4, 0.042], [0.85, 0.02], [1, 0.009]]),
    ],
    { bone: upperJaw, color: LIME, bands: RAINBOW },
  );
  b.sweep(
    catmull([L0, [0.01, 0.35, 0.22], [0.05, 0.335, 0.3], L3]),
    (t: number): [number, number] => [
      ramp(t, [[0, 0.035], [0.5, 0.024], [1, 0.006]]),
      ramp(t, [[0, 0.03], [0.5, 0.02], [1, 0.008]]),
    ],
    { bone: jaw, color: LIME, bands: RAINBOW },
  );

  // Nostrils, placed on the bill surface.
  const bill = b.surface(upperBill);
  for (const s of [1, -1]) {
    const nostril = bill.nearest([s * 0.02, 0.49, 0.17]);
    b.stick(new THREE.SphereGeometry(0.0075, 6, 4).scale(1.4, 0.6, 1), INK, nostril, { embed: 0.4 });
  }

  // ------------------------------------------------------------ legs and toes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.03, 0.17, 0];
    const foot = [s * 0.03, 0.0775, 0]; // resting on the top of the branch
    const leg = b.chain(`leg${side}`, limb(hip, foot, [0.055, 0.05], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.0105 - 0.0025 * t, { color: BLUE });
    const ankle = leg.joints[leg.joints.length - 1];

    // Zygodactyl toes: two forward, two back, wrapping over the branch.
    const toeSpecs: [number, number][] = [
      [0.012, 1],
      [-0.012, 1],
      [0.008, -1],
      [-0.008, -1],
    ];
    toeSpecs.forEach(([dx, sgn], k) => {
      const pts = [0, 0.3, 0.6, 0.85, 1].map((u) => {
        const th = sgn * 120 * u * D;
        return [s * 0.03 + dx * u, 0.035 + 0.0425 * Math.cos(th), 0.0425 * Math.sin(th)];
      });
      const toe = b.chain(`toe${side}${k}`, catmull(pts), { parent: ankle, count: 3, role: "digit" });
      b.sweep(toe, (t: number) => 0.0068 - 0.0026 * t, { color: BLUE });
      const tip = toe.at(1);
      b.spike(tip, tip, 0.013, 0.0042, { color: INK });
    });
  }

  return b.root;
}
