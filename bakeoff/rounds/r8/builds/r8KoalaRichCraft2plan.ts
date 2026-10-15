import * as THREE from "three";
import { createBuilder, frame, rng, noise, catmull, polyline } from "../../../../src/index";
import { pixelArt, pixelTexture, tileBox, cellPaint, pick, bayer, snapColor, stepped } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a eucalyptus stand",
  description:
    "Pixel-art koala clinging to a gum-tree limb: big fuzzy ears, leathery nose, gripping paws, silver leaves, gum-nuts, on a plank-and-moss base.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Constants: one texel size drives every pixel texture, box tile and paint cell.
const TEXEL = 0.02;
const snap = (c: string) => snapColor(c, 32);
const zz = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);
const DEG = Math.PI / 180;

const H = 1.0; // head scale constant (all head parts are authored for H = 1)
const EAR = 1.0; // ear scale constant

// Palettes
const FUR_RAMP = ["#30333d", "#494d5a", "#666a78", "#898d9a", "#abaeb8", "#c9ccd4"].map(snap);
const CREAM_RAMP = ["#a79b7e", "#cabd9d", "#e6dcc0", "#f7f0da"].map(snap);
const MUZZLE_RAMP = ["#5d616e", "#7d818e", "#9b9ea9", "#b7bac3"].map(snap);
const BARK_RAMP = ["#2b1f18", "#47311f", "#684a35", "#876949", "#a48a63"].map(snap);
const MOSS_RAMP = ["#27401f", "#3f6634", "#5f8f45", "#86b55c"].map(snap);
const WOOD = ["#33200f", "#533821", "#744f2d", "#94693c"].map(snap);
const NOSE_C = snap("#14121a");
const CLAW_C = snap("#e9e2cf");
const TWIG_C = snap("#6d5a3a");
const CUT_C = snap("#d8c79a");
const NUT_C = snap("#6f4e30");
const NUT_CAP = snap("#4c3320");

// ---------------------------------------------------------------------------------------------------------------
// Paints
function furColor(c: Cell, lift = 0): string {
  const r = c.random(3);
  if (r < 0.035) return FUR_RAMP[0];
  if (r > 0.988) return FUR_RAMP[5];
  const v = 0.5 + lift + 0.26 * c.n.y + 0.5 * (noise(c.at, 0.11, 4) - 0.5);
  return c.pick(FUR_RAMP, v);
}

const FUR = cellPaint(TEXEL, (c) => furColor(c), { dither: true });
const DARKFUR = cellPaint(
  TEXEL,
  (c) => c.pick(FUR_RAMP.slice(0, 4), 0.35 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.06, 8) - 0.5)),
  { dither: true },
);

const BODY = cellPaint(
  TEXEL,
  (c) => {
    const { x, y } = c.at;
    const edge = 0.022 * zz(y / 0.07);
    const belly =
      c.n.z > 0.45 && y > 0.3 && y < 0.74 && Math.abs(x) < 0.12 + edge - Math.max(0, y - 0.58) * 0.5;
    if (belly) {
      if (c.random(5) < 0.04) return CREAM_RAMP[1];
      return c.pick(CREAM_RAMP, 0.62 + 0.3 * (noise(c.at, 0.08, 2) - 0.5) + 0.12 * c.n.y);
    }
    return furColor(c);
  },
  { dither: true },
);

const rampPaint = (ramp: string[], base: number, k: number, seed: number) =>
  cellPaint(TEXEL, (c) => c.pick(ramp, base + k * c.n.y + 0.5 * (noise(c.at, 0.09, seed) - 0.5)), { dither: true });

const CREAMP = rampPaint(CREAM_RAMP, 0.7, 0.2, 12);
const MUZZLEP = rampPaint(MUZZLE_RAMP, 0.55, 0.25, 13);

const BARK = cellPaint(
  TEXEL,
  (c) => {
    if (c.random(5) < 0.03) return BARK_RAMP[0];
    if (c.n.y > 0.7 && noise(c.at, 0.09, 2) > 0.52) return c.pick(MOSS_RAMP, 0.3 + 0.7 * noise(c.at, 0.05, 3));
    const q = new THREE.Vector3(c.at.x * 4, c.at.y * 0.25, c.at.z * 4);
    const v = 0.45 + 0.8 * (noise(q, 0.12, 9) - 0.5) + 0.12 * c.n.y;
    return c.pick(BARK_RAMP, v);
  },
  { dither: true },
);

const earInner = (ctr: THREE.Vector3) =>
  cellPaint(
    TEXEL,
    (c) => {
      const d = c.at.distanceTo(ctr) / 0.075;
      if (c.random(9) < 0.06) return CREAM_RAMP[0];
      return c.pick(CREAM_RAMP, 0.98 - 0.5 * d * d + 0.3 * (noise(c.at, 0.05, 6) - 0.5));
    },
    { dither: true },
  );

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#0b0a10", w: "#ffffff" });
const SHINE = pixelArt(["ss", "s."], { s: "#7a7894" });
const TUFT = pixelArt(["..ww..", "..wc..", ".wwcc.", ".wwwc.", "wwwwcc", "wwwwcc"], { w: "#f6eed6", c: "#cbbe9e" });

const leafRows = [
  "...o...",
  "..ogo..",
  "..ogo..",
  ".olmgo.",
  ".olmgo.",
  "oolmggo",
  "oolmggo",
  "oolmggo",
  "oolmggo",
  ".olmgo.",
  ".olmgo.",
  ".ogmgo.",
  "..omo..",
  "..omo..",
  "...m...",
  "...m...",
];
const LEAF_A = pixelArt(leafRows, { o: "#43614f", g: "#7ea588", l: "#a8c9ad", m: "#d4e7d2" });
const LEAF_B = pixelArt(leafRows, { o: "#4d6a52", g: "#92b394", l: "#bad3b6", m: "#e6f0dc" });

const PLANKS = pixelTexture(40, 36, (g) => {
  const r = rng(11);
  g.fill((x, y) => {
    const row = Math.floor(y / 6);
    if (y % 6 === 5) return WOOD[0];
    const off = (row * 13) % 40;
    if ((x + off) % 40 === 0) return WOOD[0];
    return pick(WOOD, 0.45 + 0.22 * Math.sin((x + off) * 0.45 + row * 2) + 0.25 * (r() - 0.5), bayer(x, y));
  });
});

const MOSS = pixelTexture(32, 26, (g) => {
  const r = rng(21);
  g.fill((x, y) => pick(MOSS_RAMP, 0.45 + 0.4 * (r() - 0.5) + 0.25 * Math.sin(x * 0.7 + y * 0.5), bayer(x, y)));
  g.stamp(5, 6, ["y"], { y: "#f0d96a" });
  g.stamp(22, 15, ["y"], { y: "#f0d96a" });
  g.stamp(14, 21, ["w"], { w: "#e8efe0" });
});

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton ---------------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const stand = b.joint("stand", { parent: root, at: [0, 0, -0.12], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.34, 0.06], aim: [0, 0.5, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: hips, at: [0, 0.5, 0.1], aim: [0, 0.64, 0.12], role: "spine" });
  const spine3 = b.joint("spine3", { parent: spine2, at: [0, 0.64, 0.12], aim: [0, 0.72, 0.12], role: "spine" });
  const neck = b.joint("neck", { parent: spine3, at: [0, 0.72, 0.12], aim: [0, 0.8, 0.12], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.8, 0.12], aim: [0, 0.8, 0.32], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.725, 0.2], aim: [0, 0.725, 0.34], role: "jaw" });

  // Small helper ----------------------------------------------------------------------------------------------
  const box = (w: number, h: number, d: number, color: any, at: V3, bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // Setting: base ----------------------------------------------------------------------------------------------
  const rand = rng(5);
  b.part(tileBox([0.8, 0.04, 0.64], PLANKS, TEXEL, { rand, step: [1, 6] }), "#ffffff", {
    texture: PLANKS,
    bone: stand,
    at: [0, 0.02, 0.07],
  });
  b.part(tileBox([0.74, 0.03, 0.58], PLANKS, TEXEL, { rand, step: [1, 6] }), "#ffffff", {
    texture: PLANKS,
    bone: stand,
    at: [0, 0.055, 0.07],
  });
  b.part(tileBox([0.68, 0.012, 0.52], MOSS, TEXEL), "#ffffff", { texture: MOSS, bone: stand, at: [0, 0.076, 0.07] });
  // corner studs
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      box(0.04, 0.05, 0.04, snap("#2a1b0e"), [sx * 0.37, 0.025, 0.07 + sz * 0.29], stand);

  // Trunk and cross branches -----------------------------------------------------------------------------------
  const TY = 0.075;
  b.sweep(
    catmull([
      [0, TY, -0.12],
      [0.008, 0.4, -0.125],
      [-0.006, 0.75, -0.12],
      [0, 0.98, -0.12],
    ]),
    [0.08, 0.06],
    { section: { ngon: 8 }, caps: "flat", color: BARK, bone: stand },
  );
  // root flares
  for (let i = 0; i < 5; i++) {
    const a = i * 72 + 20;
    const r = 0.075;
    box(0.06, 0.06, 0.09, BARK, [Math.sin(a * DEG) * r, 0.1, -0.12 + Math.cos(a * DEG) * r], stand, {
      rotation: [0, a, 0],
    });
  }
  // bark chips and knots
  const chips: [number, number, number, number][] = [
    [30, 0.3, 0.05, 0.02],
    [-40, 0.42, 0.04, 0.03],
    [140, 0.35, 0.05, 0.03],
    [-110, 0.28, 0.04, 0.02],
    [60, 0.7, 0.045, 0.025],
    [-70, 0.78, 0.05, 0.03],
    [170, 0.66, 0.04, 0.02],
    [100, 0.9, 0.04, 0.02],
  ];
  for (const [a, y, w, d] of chips) {
    const r = 0.072;
    box(w, w * 1.1, d, BARK_RAMP[a > 0 ? 4 : 1], [Math.sin(a * DEG) * r, y, -0.12 + Math.cos(a * DEG) * r], stand, {
      rotation: [0, a, 0],
    });
  }
  // dark knot holes
  for (const [a, y] of [
    [-25, 0.46],
    [75, 0.52],
  ] as [number, number][]) {
    const r = 0.076;
    box(0.035, 0.045, 0.012, BARK_RAMP[0], [Math.sin(a * DEG) * r, y, -0.12 + Math.cos(a * DEG) * r], stand, {
      rotation: [0, a, 0],
    });
  }

  const crossY = [
    { y: 0.2, hl: 0.31 },
    { y: 0.56, hl: 0.34 },
  ];
  for (const { y, hl } of crossY) {
    b.sweep(
      polyline([
        [-hl, y, -0.12],
        [hl, y, -0.12],
      ]),
      0.036,
      { section: { ngon: 6 }, caps: "flat", color: BARK, bone: stand },
    );
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.012, 6), CUT_C, {
        bone: stand,
        at: [s * (hl + 0.005), y, -0.12],
        dir: [s, 0, 0],
      });
    }
  }

  // Leafy shoots -----------------------------------------------------------------------------------------------
  const leafR = rng(9);
  const leafFrames: any[] = [];
  const shoot = (pts: V3[], r0: number, n: number, seed: number) => {
    const path = catmull(pts);
    b.sweep(path, [r0, 0.007], { section: { ngon: 4 }, caps: "point", color: TWIG_C, bone: stand });
    const rr = rng(seed);
    for (let i = 0; i < n; i++) {
      const t = 0.3 + (0.7 * i) / Math.max(1, n - 1);
      const p = path.at(t);
      const tg = path.tangentAt(t);
      const side = i % 2 ? 1 : -1;
      const dir: V3 = [
        tg.x * 0.6 + side * 0.55 + (rr() - 0.5) * 0.3,
        -0.55 - rr() * 0.3,
        (rr() - 0.5) * 0.8,
      ];
      leafFrames.push(frame([p.x, p.y, p.z], dir));
    }
  };
  shoot(
    [
      [0, 0.76, -0.12],
      [0.12, 0.86, -0.15],
      [0.27, 0.97, -0.17],
    ],
    0.03,
    6,
    1,
  );
  shoot(
    [
      [0, 0.8, -0.12],
      [-0.1, 0.88, -0.15],
      [-0.23, 0.93, -0.17],
    ],
    0.026,
    5,
    2,
  );
  shoot(
    [
      [0, 0.92, -0.12],
      [0, 1.0, -0.15],
      [-0.05, 1.04, -0.2],
    ],
    0.02,
    4,
    3,
  );
  for (const s of [1, -1])
    shoot(
      [
        [s * 0.34, 0.56, -0.12],
        [s * 0.39, 0.63, -0.13],
        [s * 0.42, 0.62, -0.15],
      ],
      0.018,
      4,
      s > 0 ? 4 : 7,
    );
  b.cards(leafFrames, [LEAF_A, LEAF_B], {
    size: [0.06, 0.15],
    lean: 0,
    bend: 25,
    flow: [0, 0, 1],
    vary: 0.25,
    spin: 18,
    rng: leafR,
    bone: stand,
  });

  // Props on the base ------------------------------------------------------------------------------------------
  const NUT: [number, number][] = [
    [0, 0],
    [0.016, 0],
    [0.022, 0.012],
    [0.02, 0.026],
    [0.011, 0.03],
    [0, 0.03],
  ];
  const CAP: [number, number][] = [
    [0, 0.03],
    [0.014, 0.03],
    [0.009, 0.041],
    [0, 0.046],
  ];
  for (const [x, z] of [
    [0.3, 0.22],
    [0.34, 0.12],
    [-0.31, 0.2],
  ] as [number, number][]) {
    b.lathe(NUT, { at: [x, 0.082, z], segments: 6, color: NUT_C, bone: stand });
    b.lathe(CAP, { at: [x, 0.082, z], segments: 6, color: NUT_CAP, bone: stand });
  }
  b.cards([frame([-0.22, 0.083, 0.3], [0, 1, 0])], LEAF_A, {
    size: [0.05, 0.12],
    lean: 90,
    flow: [1, 0, 0.3],
    mirror: true,
    bone: stand,
  });
  b.cards([frame([0.18, 0.083, 0.31], [0, 1, 0])], LEAF_B, {
    size: [0.05, 0.11],
    lean: 90,
    flow: [-0.6, 0, 1],
    mirror: true,
    bone: stand,
  });

  // Torso ------------------------------------------------------------------------------------------------------
  box(0.36, 0.44, 0.3, BODY, [0, 0.5, 0.1], spine2); // main mass
  box(0.3, 0.3, 0.06, BODY, [0, 0.47, 0.28], spine2); // pot belly bulge
  box(0.32, 0.12, 0.08, BODY, [0, 0.66, 0.24], spine3); // chest shelf
  box(0.34, 0.14, 0.26, FUR, [0, 0.3, 0.04], hips); // rump
  for (const s of [1, -1]) {
    box(0.1, 0.12, 0.2, FUR, [s * 0.16, 0.3, 0.1], hips); // haunches
    box(0.12, 0.12, 0.14, FUR, [s * 0.19, 0.62, 0.1], spine3); // shoulders
  }
  // fur lumps on the flanks
  const lr = rng(31);
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      box(0.04, 0.05, 0.05, FUR, [s * 0.185, 0.36 + i * 0.1 + lr() * 0.02, 0.02 + lr() * 0.16], spine2, {
        rotation: [0, 0, s * (lr() * 20 - 10)],
      });
  // cream fringe tufts on the chest and belly
  const bellyFr: any[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const y = 0.36 + i * 0.058;
      const x = s * (0.12 + 0.022 * zz(y / 0.07) - Math.max(0, y - 0.58) * 0.5);
      bellyFr.push(frame([x, y, 0.286], [s * 0.5, -0.2, 1]));
    }
  b.cards(bellyFr, TUFT, { size: [0.045, 0.045], lean: 40, flow: [0, -0.3, 1], cross: true, vary: 0.2, spin: 15, rng: rng(33), bone: spine2 });

  // Head -------------------------------------------------------------------------------------------------------
  box(0.34 * H, 0.27 * H, 0.29 * H, FUR, [0, 0.85, 0.12], head); // skull
  box(0.28 * H, 0.03 * H, 0.24 * H, FUR, [0, 0.995, 0.1], head); // crown step
  for (const s of [1, -1]) box(0.05 * H, 0.1 * H, 0.2 * H, CREAMP, [s * 0.19, 0.78, 0.1], head); // cheek ruffs
  box(0.17 * H, 0.13 * H, 0.07 * H, MUZZLEP, [0, 0.79, 0.29], head); // muzzle
  // nose assembly
  box(0.075, 0.07, 0.05, NOSE_C, [0, 0.83, 0.335], head);
  box(0.06, 0.03, 0.045, NOSE_C, [0, 0.88, 0.335], head);
  box(0.05, 0.015, 0.04, NOSE_C, [0, 0.79, 0.335], head);
  b.part(new THREE.PlaneGeometry(0.022, 0.022), "#ffffff", {
    bone: head,
    at: [-0.02, 0.862, 0.3615],
    dir: [0, 0, 1],
    axis: "z",
    texture: SHINE,
  });
  // mouth: dark slit, then separate lower jaw
  box(0.13, 0.008, 0.075, snap("#1b1620"), [0, 0.7255, 0.29], head);
  box(0.12, 0.04, 0.09, CREAMP, [0, 0.705, 0.275], jaw);
  box(0.07, 0.02, 0.03, CREAMP, [0, 0.69, 0.32], jaw);
  // eyes: dark sockets, then pixel eyes with a glint
  for (const s of [1, -1]) {
    box(0.06, 0.05, 0.007, FUR_RAMP[1], [s * 0.085, 0.89, 0.2685], head);
    b.part(new THREE.PlaneGeometry(0.044, 0.044), "#ffffff", {
      bone: head,
      at: [s * 0.085, 0.89, 0.2745],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    });
    // dark brow tufts, tilted
    box(0.055, 0.016, 0.02, FUR_RAMP[0], [s * 0.088, 0.93, 0.262], head, { rotation: [0, 0, -s * 10] });
  }
  // cheek and forehead tufts
  const cheekFr: any[] = [];
  for (const s of [1, -1]) {
    for (const [y, z] of [
      [0.82, 0.04],
      [0.77, 0.1],
      [0.74, 0.18],
      [0.81, 0.19],
    ] as [number, number][])
      cheekFr.push(frame([s * 0.215, y, z], [s, -0.25, 0.35]));
  }
  b.cards(cheekFr, TUFT, { size: [0.05, 0.05], lean: 45, flow: [0, -0.3, 1], cross: true, vary: 0.2, spin: 15, rng: rng(41), bone: head });
  const foreFr: any[] = [];
  for (let i = 0; i < 5; i++) foreFr.push(frame([(i - 2) * 0.05, 0.99, 0.2], [0, 0.5, 1]));
  b.cards(foreFr, TUFT, { size: [0.04, 0.04], lean: 35, flow: [0, -0.2, 1], vary: 0.25, rng: rng(42), bone: head });

  // Ears (signature feature) ----------------------------------------------------------------------------------
  const EAR_OUT = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((hw) => [-hw, hw] as [number, number]), TEXEL * EAR, { rows: true });
  const EAR_IN = stepped([1, 2, 3, 3, 3, 2, 1].map((hw) => [-hw, hw] as [number, number]), TEXEL * EAR, { rows: true });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const a = -s * 15 * DEG;
    const ex = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const ey = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const base = new THREE.Vector3(s * 0.185, 0.905, 0.07);
    const P = (u: number, v: number, w: number): V3 =>
      base.clone().addScaledVector(ex, u).addScaledVector(ey, v).add(new THREE.Vector3(0, 0, w)).toArray() as V3;
    const ear = b.joint(`ear${S}`, { parent: head, at: base.toArray() as V3, dir: ey.toArray() as V3, role: "hinge" });
    b.extrude(EAR_OUT, { at: base.toArray() as V3, x: ex.toArray() as V3, y: ey.toArray() as V3, thickness: 0.05, color: FUR, bone: ear });
    const ctr = new THREE.Vector3(...P(0, 0.09, 0.03));
    b.extrude(EAR_IN, { at: P(0, 0.03, 0.028), x: ex.toArray() as V3, y: ey.toArray() as V3, thickness: 0.012, color: earInner(ctr), bone: ear });
    for (const [u, v] of [
      [-0.025, 0.065],
      [0.03, 0.1],
      [0.0, 0.125],
    ] as [number, number][])
      box(0.012, 0.012, 0.006, CREAM_RAMP[1], P(u, v, 0.037), ear, { rotation: [0, 0, a / DEG] });
    // fringe of cream tufts around the rim
    const rim: any[] = [];
    for (let i = 0; i < 9; i++) {
      const th = (15 + i * (150 / 8)) * DEG;
      const u = 0.075 * EAR * Math.cos(th);
      const v = 0.09 * EAR + 0.088 * EAR * Math.sin(th);
      const d = ex.clone().multiplyScalar(Math.cos(th)).addScaledVector(ey, Math.sin(th));
      rim.push(frame(P(u, v, 0.0), d.toArray() as V3));
    }
    b.cards(rim, TUFT, { size: [0.045, 0.05], lean: 15, flow: [0, 0, 1], cross: true, vary: 0.15, rng: rng(50 + (s > 0 ? 1 : 2)), bone: ear });
  }

  // Limbs ------------------------------------------------------------------------------------------------------
  const CLAW_DIR = (dx: number): V3 => [dx, -1, 0];
  const digit = (parent: any, name: string, from: V3, dir: V3, len: number, w: number) => {
    const d = new THREE.Vector3(...dir).normalize();
    const j = b.joint(name, { parent, at: from, dir: d.toArray() as V3, role: "digit" });
    const mid = new THREE.Vector3(...from).addScaledVector(d, len / 2).toArray() as V3;
    b.part(new THREE.BoxGeometry(w, len, w), DARKFUR, { bone: j, at: mid, dir: d.toArray() as V3 });
    const tip = new THREE.Vector3(...from).addScaledVector(d, len + len * 0.1).toArray() as V3;
    b.part(new THREE.BoxGeometry(w * 0.7, len * 0.3, w * 0.7), CLAW_C, { bone: j, at: tip, dir: d.toArray() as V3 });
  };
  const gripper = (parent: any, tag: string, c: V3, w: number, len: number) => {
    b.part(new THREE.BoxGeometry(w, 0.04, 0.075), DARKFUR, { bone: parent, at: c });
    const dw = w / 3.3;
    for (let i = 0; i < 3; i++)
      digit(parent, `${tag}F${i + 1}`, [c[0] + (i - 1) * (w / 3), c[1] - 0.004, c[2] + 0.0375 + dw / 2 - 0.004], [0, -1, 0], len, dw);
    for (let i = 0; i < 2; i++)
      digit(parent, `${tag}B${i + 1}`, [c[0] + (i - 0.5) * (w / 2.2), c[1] - 0.004, c[2] - 0.0375 - dw / 2 + 0.004], [0, -1, 0], len * 0.9, dw);
  };
  void CLAW_DIR;

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // arm
    const sh: V3 = [s * 0.19, 0.62, 0.1];
    const el: V3 = [s * 0.29, 0.53, 0.06];
    const hd: V3 = [s * 0.26, 0.616, -0.12];
    const arm = b.chain(`arm${S}`, polyline([sh, el, hd]), {
      parent: spine3,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.054, 0.05, 0.042, 0.04], { section: "box", caps: "flat", color: FUR });
    box(0.075, 0.075, 0.075, FUR, el, arm.joints[1]); // elbow block
    const hand = arm.tip ?? arm.joints[arm.joints.length - 1];
    gripper(hand, `hand${S}`, hd, 0.1, 0.075);

    // leg
    const hp: V3 = [s * 0.12, 0.36, 0.06];
    const kn: V3 = [s * 0.21, 0.31, 0.14];
    const an: V3 = [s * 0.22, 0.256, -0.12];
    const leg = b.chain(`leg${S}`, polyline([hp, kn, an]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [an[0], 0.235, an[2]],
    });
    b.sweep(leg, [0.068, 0.062, 0.05, 0.044], { section: "box", caps: "flat", color: FUR });
    box(0.09, 0.09, 0.09, FUR, kn, leg.joints[1]); // knee block
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    gripper(foot, `foot${S}`, an, 0.12, 0.07);
  }

  return b.root;
}
