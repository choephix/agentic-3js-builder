// A koala sitting on a eucalyptus branch that rests in the forks of a wooden stand, in pixel art. Everything snaps
// to one texel grid (TEXEL): fur is painted in square cells of that size, the head is a skin box with its face
// drawn on the pixel grid, and the wood, bark, leaves and brass plate are pixel textures at the same scale.
import * as THREE from "three";
import type { Builder } from "../src/builder";
import { createBuilder } from "../src/builder";
import type { Frame } from "../src/frame";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { noise } from "../src/paint";
import type { Joint } from "../src/skeleton";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  tileBox,
} from "../kits/pixel";

export const meta = {
  name: "Koala on eucalyptus",
  description: "A koala sitting on a eucalyptus branch and clasping it, the branch resting on a forked wooden stand.",
  style: "pixel art",
  commit: "b816db2",
};

/** One texel in metres: every box, paint cell and drawn pixel of the koala and stand is this square. */
const TEXEL = 0.0125;

const snap = (c: string) => snapColor(c, 16);

// Palette: warm greys and creams for the koala, bark and leaf greens, wood and brass for the stand.
const FUR = ["#4b4c4d", "#65676a", "#7d8083", "#979a9d", "#b1b4b6", "#cbcdcf"].map(snap);
const CREAM = ["#8f8a7d", "#b1ab9c", "#d3cdbf", "#ebe7dc"].map(snap);
const INK = snap("#131219");
const NOSE = snap("#1b1a22");
const NOSE_HI = snap("#3f3d4b");
const PAD = snap("#2c2f33");
const CLAW = snap("#e7dfc9");
const BARK = ["#3f3b35", "#5d574e", "#7b7568", "#9d9686", "#bcb5a5", "#dcd6c8"].map(snap);
const BARK_DARK = snap("#4a3f33");
const LEAF = ["#2d5439", "#41704a", "#5a8c5a", "#79a66c", "#9cc38a"].map(snap);
const LEAF_VEIN = snap("#c3deab");
const BLOOM = ["#56706a", "#71908a", "#91aea4"].map(snap);
const GUM_C = snap("#8e9d86");
const WOOD = ["#2a1a0e", "#3d2615", "#56371f", "#6f4a2b", "#8a5d37"].map(snap);
const WOOD_SEAM = snap("#1c1009");
const BRASS_D = snap("#7d5a22");
const BRASS = snap("#c99a3e");
const BRASS_L = snap("#f0cc7a");

// Paints: fur in square cells with ordered dither; a pale oval on the chest faces the viewer.
const FURP = cellPaint(
  TEXEL,
  (c) => {
    const dx = c.at.x / 0.065;
    const dy = (c.at.y - 0.9) / 0.07;
    if (c.n.z > 0.3 && dx * dx + dy * dy < 1) return c.pick(CREAM, 0.6 + 0.4 * c.n.z);
    const v =
      0.5 + 0.25 * c.n.y - (c.n.y < -0.4 ? 0.15 : 0) + 0.2 * (noise(c.at, 0.07, 4) - 0.5) + 0.16 * (c.random(9) - 0.5);
    return c.pick(FUR, v);
  },
  { dither: true },
);
const CREAMP = cellPaint(TEXEL, (c) => c.pick(CREAM, 0.55 + 0.35 * c.random(3)), { dither: true });
const BARKP = cellPaint(
  TEXEL,
  (c) => {
    if (c.random(2) < 0.08) return BARK_DARK;
    return c.pick(BARK, 0.3 + 0.6 * noise(c.at, 0.09, 6) + 0.2 * (c.random(4) - 0.5));
  },
  { dither: true },
);

// Head: a skin box whose front face carries the eyes, nose and muzzle, drawn on the pixel grid.
const HEAD = skinLayout({ head: [13, 12, 11] });
const headRand = rng(21);
const HEAD_SHEET = pixelTexture(...HEAD.size, (g) => {
  for (const faces of Object.values(HEAD.faces))
    for (const rect of Object.values(faces))
      g.fill((x, y, _w, h) => pick(FUR, 0.62 - 0.22 * (y / h) + 0.2 * (headRand() - 0.5), bayer(x, y)), rect);
  const front = HEAD.faces.head.pz;
  g.fill((x, y) => (y >= 7 ? pick(CREAM, 0.72 + 0.2 * (headRand() - 0.5), bayer(x, y)) : undefined), front);
  g.stamp(front[0] + 2, front[1] + 3, [".kk.", "kwkk", "kkkk", ".kk."], { k: INK, w: "#ffffff" });
  g.stamp(front[0] + 7, front[1] + 3, [".kk.", "kwkk", "kkkk", ".kk."], { k: INK, w: "#ffffff" });
  g.stamp(front[0] + 4, front[1] + 7, [".nnn.", "nnhnn"], { n: NOSE, h: NOSE_HI });
  g.stamp(front[0] + 4, front[1] + 10, [".k.k."], { k: INK });
});

// Ears: staircase discs from the pixel kit, one fur disc and a cream inner disc in front of it.
const disc = (radius: number) =>
  Array.from({ length: 2 * radius }, (_, i) => {
    const x = i - radius + 0.5;
    const h = Math.round(Math.sqrt(radius * radius - x * x));
    return [-h, h] as [number, number];
  });
const EAR = stepped(disc(4), TEXEL, { start: -4 });
const EAR_IN = stepped(disc(3), TEXEL, { start: -3 });

// Leaves: a sickle-shaped eucalyptus leaf on a 6 × 14 pixel grid with a pale midrib.
const leafTexture = (ramp: readonly string[]) =>
  pixelTexture(6, 14, (g) => {
    for (let y = 0; y < 14; y++) {
      const half = Math.sin((Math.PI * (y + 0.5)) / 14) ** 0.75 * 2.9;
      for (let x = 0; x < 6; x++) {
        if (Math.abs(x + 0.5 - 3) > half) continue;
        const vein = x === 2 && y > 1 && y < 12;
        g.set(x, y, vein ? LEAF_VEIN : pick(ramp, 0.25 + 0.6 * (y / 14), bayer(x, y)));
      }
    }
  });
const LEAF_A = leafTexture(LEAF);
const LEAF_B = leafTexture(LEAF.slice(1));
const LEAF_BLOOM = leafTexture(BLOOM);

// Fur tufts: a grey-scale pixel tuft, tinted by the fur paint.
const TUFT = pixelArt([".w.", "www", "wgw", "g.g"], { w: "#ffffff", g: "#9a9a9a" });

// Stand: square planks on the pixel grid, a darker rim and a brass plate with a koala-face pictogram.
const plankRand = rng(41);
const PLANKS = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => {
    if (y % 8 === 0) return WOOD_SEAM;
    if ((x + Math.floor(y / 8) * 8) % 16 === 0) return WOOD_SEAM;
    return pick(WOOD, 0.3 + 0.5 * plankRand() + 0.15 * ((y % 8) / 8), bayer(x, y));
  });
});
const RIM = pixelTexture(32, 4, (g) => {
  g.fill((x, y) => pick(WOOD.slice(0, 3), 0.35 + (0.4 * ((x * 7 + y * 3) % 5)) / 5, bayer(x, y)));
});
const PLATE_ICON = [
  "..ff...ff..",
  ".fffffffff.",
  "fffffffffff",
  "ffwkfffwkff",
  "ffkkfffkkff",
  "fffffffffff",
  "ffffnnnffff",
  "fffffffffff",
];
const PLATE = pixelTexture(20, 12, (g) => {
  g.fill((x, y) =>
    x === 0 || y === 0 || x === 19 || y === 11 ? BRASS_D : pick([BRASS_D, BRASS, BRASS_L], 0.6, bayer(x, y)),
  );
  g.stamp(4, 1, PLATE_ICON, { f: "#8f959d", k: INK, w: "#ffffff", n: NOSE });
});

// Eucalyptus gumnut: a small cup with a flat cap, as a lathe outline (x = radius, y = height).
const GUM: [number, number][] = [
  [0, 0],
  [0.007, 0],
  [0.0085, 0.006],
  [0.0065, 0.012],
  [0, 0.013],
];

// Wood collar that rings a post where it meets the stand: a short turned ring.
const COLLAR: [number, number][] = [
  [0.04, 0],
  [0.05, 0],
  [0.052, 0.01],
  [0.046, 0.016],
  [0.04, 0.02],
  [0, 0.02],
];

/** Three digits at the end of a limb that wrap round the branch, each with a claw. */
function digits(b: Builder, tip: Joint, s: number) {
  const inward = s > 0 ? { right: 0.03 } : { left: 0.03 };
  for (const k of [-1, 0, 1]) {
    const end = tip.local({ ...inward, up: k * 0.011, forward: -0.025 });
    b.capsule(tip.at, end, 0.0065, { bone: tip, color: PAD });
    const claw = end.clone().sub(tip.at);
    b.spike(end, claw, 0.016, 0.0035, { bone: tip, color: CLAW });
  }
}

/** A twig that sprouts from `on` and grows through the offsets `grow`; it rides the stand bone (no joints). */
function twig(b: Builder, name: string, on: Frame, grow: [number, number, number][]) {
  const p = on.at;
  const pts: [number, number, number][] = [[p.x, p.y, p.z]];
  for (const [x, y, z] of grow) pts.push([p.x + x, p.y + y, p.z + z]);
  return b.sprout(name, on, catmull(pts), [0.007, 0.0025], { count: 0, color: BARKP });
}

export default function build() {
  const b = createBuilder({ name: "koalaHaiku" });

  // Skeleton: the stand is the root (the branch, forks and plinth ride it); the koala's spine sits on the branch.
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, 0.13],
      [0, 0.87, 0.13],
      [0, 0.96, 0.135],
      [0, 1.04, 0.13],
      [0, 1.1, 0.135],
    ]),
    { parent: stand, names: ["hips", "spine1", "spine2", "neck1", "head"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const head = spine.tip;
  if (!head) throw new Error("koalaHaiku: the spine has no head tip");

  // Body: a loft through the spine stations, so the torso bends with the spine.
  const body = b.loft(
    [
      { at: [0, 0.78, 0.13], w: 0.22, h: 0.22 },
      { at: [0, 0.87, 0.13], w: 0.27, h: 0.25 },
      { at: [0, 0.96, 0.135], w: 0.27, h: 0.24 },
      { at: [0, 1.04, 0.13], w: 0.22, h: 0.2 },
      { at: [0, 1.1, 0.125], w: 0.15, h: 0.14 },
    ],
    { bone: spine, color: FURP },
  );
  const tufts = b.surface(body).scatter(40, { rng: rng(3), minDist: 0.04, filter: (h) => h.n.z > -0.4 && h.n.y < 0.8 });
  b.cards(tufts, TUFT, { size: [0.03, 0.04], lean: 25, bend: 20, vary: 0.25, rng: rng(4), color: FURP });

  // Head: the skin box reads the face sheet; ears are staircase discs on the head bone.
  b.part(skinBox(HEAD_SHEET, HEAD.faces.head, TEXEL), "#ffffff", {
    texture: HEAD_SHEET,
    bone: head,
    at: head.local({ up: 0.04 }),
  });
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: head.local({ left: s * 0.085, up: 0.1, forward: -0.02 }),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: FURP,
      bone: head,
    });
    b.extrude(EAR_IN, {
      at: head.local({ left: s * 0.085, up: 0.1, forward: 0 }),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: CREAMP,
      bone: head,
    });
  }

  // Limbs: hind legs hang down the front of the branch with the feet hooked under it; forelimbs reach down and
  // clasp its front with the paws.
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${k}`,
      catmull([
        [s * 0.09, 0.79, 0.12],
        [s * 0.14, 0.7, 0.2],
        [s * 0.07, 0.6, 0.14],
        [s * 0.02, 0.6, 0.06],
      ]),
      { parent: hips, names: [`hip${k}`, `knee${k}`, `ankle${k}`, `toe${k}`], role: "leg" },
    );
    b.sweep(leg, [0.05, 0.04, 0.03, 0.024], { color: FURP });
    if (leg.tip) digits(b, leg.tip, s);

    const arm = b.chain(
      `arm${k}`,
      catmull([
        [s * 0.13, 0.99, 0.12],
        [s * 0.18, 0.85, 0.2],
        [s * 0.09, 0.7, 0.13],
        [s * 0.03, 0.66, 0.07],
      ]),
      { parent: chest, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`], role: "arm" },
    );
    b.sweep(arm, [0.03, 0.028, 0.022, 0.017], { color: FURP });
    if (arm.tip) digits(b, arm.tip, s);
  }

  // Branch: a eucalyptus limb running across the stand, resting in two forked posts; twigs and gumnuts on top.
  const branch = b.sweep(
    catmull([
      [-0.5, 0.66, -0.02],
      [-0.25, 0.64, -0.01],
      [0, 0.63, 0],
      [0.25, 0.64, -0.01],
      [0.5, 0.7, -0.03],
    ]),
    [0.03, 0.04, 0.042, 0.04, 0.028],
    { color: BARKP, bone: stand },
  );
  for (const x of [-0.2, 0.22]) {
    b.sweep(
      catmull([
        [x, 0.06, 0],
        [x, 0.3, 0],
        [x, 0.62, 0],
      ]),
      [0.04, 0.03, 0.032],
      { color: BARKP, bone: stand },
    );
    b.lathe(COLLAR, { at: [x, 0.1, 0], color: "#4a2f19", segments: 10, bone: stand });
  }

  const twigs = [
    twig(b, "twigA", branch.at(0.2, 20), [
      [0.02, 0.07, 0.01],
      [0.04, 0.13, 0.02],
    ]),
    twig(b, "twigB", branch.at(0.32, 60), [
      [0.0, 0.06, 0.04],
      [0.01, 0.12, 0.07],
    ]),
    twig(b, "twigC", branch.at(0.7, 0), [
      [-0.02, 0.08, -0.01],
      [-0.05, 0.13, -0.02],
    ]),
    twig(b, "twigD", branch.at(0.82, 40), [
      [0.03, 0.07, 0.02],
      [0.06, 0.12, 0.03],
    ]),
    twig(b, "twigE", branch.at(0.56, 330), [
      [0.03, 0.06, -0.03],
      [0.06, 0.1, -0.05],
    ]),
    twig(b, "twigF", branch.at(0.12, 300), [
      [-0.02, 0.07, -0.03],
      [-0.03, 0.12, -0.06],
    ]),
    twig(b, "twigG", branch.at(0.94, 20), [
      [0.02, 0.07, 0.02],
      [0.04, 0.13, 0.03],
    ]),
    twig(b, "twigH", branch.at(0.07, 25), [
      [-0.03, 0.07, 0.02],
      [-0.06, 0.12, 0.03],
    ]),
  ];

  // Leaves on every twig; a gumnut on every other one.
  const leafFrames = twigs.flatMap((tw) => b.along(tw.sweep, 9, () => {}));
  b.cards(leafFrames, [LEAF_A, LEAF_B, LEAF_BLOOM], {
    size: [0.03, 0.07],
    lean: 30,
    vary: 0.25,
    spin: 60,
    rng: rng(12),
  });
  twigs.forEach((tw, i) => {
    if (i % 2 === 0) b.along(tw.sweep, 1, (at) => b.lathe(GUM, { at, color: GUM_C, segments: 8 }));
  });

  // Stand: planked block, a rim, a brass plate and rivets, with fallen leaves on the top.
  b.part(tileBox([0.4, 0.1, 0.4], PLANKS, TEXEL, { rand: rng(31), step: [1, 8] }), "#ffffff", {
    texture: PLANKS,
    bone: stand,
    at: [0, 0.05, 0],
  });
  b.part(tileBox([0.4, 0.025, 0.025], RIM, TEXEL), "#ffffff", { texture: RIM, bone: stand, at: [0, 0.1125, 0.1875] });
  b.part(tileBox([0.4, 0.025, 0.025], RIM, TEXEL), "#ffffff", { texture: RIM, bone: stand, at: [0, 0.1125, -0.1875] });
  b.part(tileBox([0.025, 0.025, 0.35], RIM, TEXEL), "#ffffff", { texture: RIM, bone: stand, at: [0.1875, 0.1125, 0] });
  b.part(tileBox([0.025, 0.025, 0.35], RIM, TEXEL), "#ffffff", { texture: RIM, bone: stand, at: [-0.1875, 0.1125, 0] });
  b.part(new THREE.BoxGeometry(0.16, 0.096, 0.004), "#ffffff", {
    texture: PLATE,
    bone: stand,
    at: [0, 0.05, 0.202],
  });
  for (const at of [
    [-0.07, 0.085, 0.2045],
    [0.07, 0.085, 0.2045],
    [-0.07, 0.015, 0.2045],
    [0.07, 0.015, 0.2045],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), BRASS_L, { bone: stand, at });
  }
  const litterAt: [number, number, number][] = [
    [0.12, 0.1, 0.14],
    [-0.15, 0.1, -0.06],
    [0.1, 0.1, -0.16],
    [-0.1, 0.1, 0.15],
    [0.16, 0.1, -0.02],
  ];
  b.cards(
    litterAt.map((p) => frame(p, [0, 1, 0])),
    [LEAF_A, LEAF_B],
    { size: [0.03, 0.07], lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, rng: rng(15) },
  );
  b.lathe(GUM, { at: [-0.11, 0.1, 0.07], color: GUM_C, segments: 8, bone: stand });

  return b.root;
}
