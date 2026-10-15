// Koala hugging a eucalyptus trunk on a wooden display stand, in chunky pixel art: every surface is hard square
// texels (dithered cell paints on the fur and bark, pixel-art textures on the face, leaves, tufts and plaque).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A pixel-art koala sitting on a seat branch and hugging a eucalyptus trunk with hands and feet, on a plank display stand with a brass plaque, leaf litter and gum nuts.",
  style: "pixel art",
  commit: "88fc1f0",
};

const S = (c: string) => snapColor(c, 64);
const frac = (x: number) => x - Math.floor(x);

// One texel size for every cell paint on the animal and the tree.
const TEXEL = 0.014;

// ---------------------------------------------------------------------------------------------------------------
// Palettes and paints

const GRAY = ["#2b2e36", "#444956", "#646b79", "#868d9b", "#aab0bb", "#c8ccd4"].map(S);
const CREAM = ["#a5a397", "#c4c1b3", "#dedacb", "#f1eee2"].map(S);
const PAW_RAMP = ["#101015", "#1c1d24", "#2c2e37", "#40424d"].map(S);
const CLAW = S("#2a2420");
const SMOOTH = ["#8a8a72", "#a9a98d", "#c9c4a4", "#e2dcc0"].map(S);
const ROUGH = ["#2e241d", "#4a3a2f", "#6a5444", "#8a7258"].map(S);
const RED = ["#7a4030", "#a65f42", "#cf8a60"].map(S);
const BRASS = S("#c9a13a");

const coat = cellPaint(
  TEXEL,
  (c) => {
    const { x, y, z } = c.at;
    const n1 = noise(c.at, 0.1, 3);
    const r = c.random(1);
    const edge = (noise(c.at, 0.05, 8) - 0.5) * 0.06;
    const front = c.n.z > 0.2 && Math.abs(x) < 0.085 + edge && y > 0.44 && y < 0.92 && z < 0.22;
    if (front)
      return c.pick(CREAM, 0.55 + 0.35 * (n1 - 0.5) + 0.15 * c.n.y + (r < 0.1 ? 0.2 : r > 0.94 ? -0.2 : 0));
    let v = 0.46 + 0.3 * c.n.y + 0.6 * (n1 - 0.5);
    if (c.n.z < -0.3 && y > 0.4 && y < 0.7) {
      if (c.random(5) < 0.14) return S("#8a7360");
      v += 0.18;
    }
    if (r < 0.09) v += 0.18;
    else if (r > 0.93) v -= 0.16;
    return c.pick(GRAY, v);
  },
  { dither: true },
);

const muzzlePaint = cellPaint(
  TEXEL,
  (c) => c.pick(GRAY.slice(2), 0.5 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.04, 12) - 0.5) + (c.random(2) < 0.1 ? 0.2 : 0)),
  { dither: true },
);

const chinPaint = cellPaint(
  TEXEL,
  (c) => c.pick(CREAM, 0.5 + 0.3 * c.n.y + (c.random(4) < 0.1 ? 0.25 : 0)),
  { dither: true },
);

const PAW = cellPaint(
  TEXEL * 0.8,
  (c) => c.pick(PAW_RAMP, 0.4 + 0.4 * c.n.y + 0.4 * (c.random(3) - 0.5)),
  { dither: true },
);

const bark = cellPaint(
  0.015,
  (c) => {
    const a = Math.atan2(c.at.x, c.at.z - 0.33);
    const k = Math.floor((a + Math.PI) / (Math.PI / 6));
    const sr = frac(Math.sin(k * 12.9898 + 1.7) * 43758.5453);
    const patch = noise(c.at, 0.16, 4) + 0.25 * (sr - 0.5);
    const grain = c.random(2);
    if (patch > 0.55)
      return c.pick(SMOOTH, 0.45 + 0.4 * (noise(c.at, 0.05, 6) - 0.5) + 0.3 * c.n.y + (grain < 0.08 ? -0.25 : 0));
    if (patch > 0.47) return c.pick(RED, 0.4 + 0.5 * (grain - 0.5) + 0.3 * c.n.y);
    return c.pick(ROUGH, 0.3 + 0.5 * sr + 0.25 * (grain - 0.5) + 0.2 * c.n.y);
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const NOSE = pixelArt([".kkkk.", "kkhhkk", "kkhkkk", "kkkkkk", "kdkkdk", "kkkkkk", ".kkkk.", "..kk.."], {
  k: "#1b1b22",
  h: "#585868",
  d: "#07070a",
});

const EYE = pixelArt(["..ppp..", ".ppppp.", "ppwkkpp", "ppkkkpp", "ppkkkpp", ".ppppp.", "..ppp.."], {
  p: "#454854",
  k: "#09090f",
  w: "#ffffff",
});

const EAR_INNER = pixelArt(
  ["..gggg..", ".gwwwwg.", "gwwwwwwg", "gwwhwwwg", "gwwwwwwg", "gwwwwwwg", ".gwwwwg.", "..gggg.."],
  { g: "#c4c3bf", w: "#f4f1e8", h: "#e2d9c2" },
);

const TUFT = pixelArt(["..w..", "..w..", ".www.", ".wgw.", ".wgw.", "wwgww", "wwgww", "wwwww"], {
  w: "#ffffff",
  g: "#cfcfd6",
});

const GRASS = pixelArt(["..h...h", ".gh.h.g", ".gh.hgg", "ghggggg", "ggggggg"], { g: "#5a9a3a", h: "#8cc858" });

const FLAP = pixelArt(["..aa..", ".aaab.", ".aabb.", "aaabbc", "aabbbc", "aabbcc", "abbbcc", "bbbccc"], {
  a: "#d9cba6",
  b: "#b5a47c",
  c: "#8e7d5a",
});

function leafTexture(hi: string, mid: string, lo: string, rib: string) {
  return pixelTexture(7, 18, (g) => {
    for (let row = 0; row < 18; row++) {
      const t = (17 - row) / 17;
      const w = t < 0.07 ? 0.4 : Math.max(0.6, 2.5 * Math.sin(Math.PI * Math.pow(t, 0.7)));
      const cx = 3 + 0.8 * Math.sin(t * Math.PI);
      const mx = Math.round(cx);
      const x0 = Math.round(cx - w);
      const x1 = Math.round(cx + w);
      for (let x = x0; x <= x1; x++) g.set(x, row, x === mx ? rib : x === x0 || x === x1 ? lo : x < cx ? hi : mid);
    }
    g.set(3, 17, "#6b5a3e");
  });
}
const LEAF_A = leafTexture("#7fbfa6", "#4f9585", "#2e6360", "#b9e3c8");
const LEAF_B = leafTexture("#9cc27c", "#6a9a58", "#3d6a40", "#cfe6a0");

const makePlanks = (wood: string[], seed: number) =>
  pixelTexture(40, 36, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const yy = y % 6;
      if (yy === 0) return wood[0];
      const end = (row * 17 + 9) % 40;
      if (x === end && yy < 5) return wood[0];
      const base = 0.45 + 0.1 * ((row % 3) - 1) + (yy === 1 ? 0.2 : 0) - (yy === 5 ? 0.12 : 0);
      return pick(wood, base + (r() - 0.5) * 0.25, bayer(x, y));
    });
    for (let row = 0; row < 6; row++) g.set(((row * 17 + 9) % 40) + 3, row * 6 + 3, "#cdb98a");
  });
const PLANKS_DARK = makePlanks(["#241509", "#3a2412", "#52361c", "#6b4a29", "#85623a"].map(S), 11);
const PLANKS_LIGHT = makePlanks(["#4a3018", "#6d4a28", "#8f6a3a", "#b08a50", "#cfa96a"].map(S), 23);

const GLYPH: Record<string, string[]> = {
  K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  A: [".x.", "x.x", "xxx", "x.x", "x.x"],
  L: ["x..", "x..", "x..", "x..", "xxx"],
};
const PLAQUE = pixelTexture(23, 9, (g) => {
  g.fill((_x, y) => (y < 4 ? "#d8b448" : "#c9a13a"));
  for (let x = 0; x < 23; x++) {
    g.set(x, 0, "#ecd070");
    g.set(x, 8, "#8a6a1e");
  }
  for (let y = 0; y < 9; y++) {
    g.set(0, y, "#ecd070");
    g.set(22, y, "#8a6a1e");
  }
  "KOALA".split("").forEach((ch, i) => g.stamp(2 + i * 4, 2, GLYPH[ch], { x: "#3a2a12" }));
  g.set(1, 1, "#8a6a1e");
  g.set(21, 1, "#8a6a1e");
  g.set(1, 7, "#8a6a1e");
  g.set(21, 7, "#8a6a1e");
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koala" });
  const TZ = 0.33; // the trunk's z
  const trunkR = (y: number) => 0.062 - 0.0145 * (y - 0.12);

  // --- Skeleton ---------------------------------------------------------------------------------------------
  const stand = b.joint("stand", { at: [0, 0.1, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, -0.07],
      [0, 0.64, -0.03],
      [0, 0.76, 0.02],
      [0, 0.86, 0.06],
    ]),
    { parent: stand, names: ["hips", "spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neckChain",
    polyline([
      [0, 0.86, 0.06],
      [0, 0.95, 0.105],
    ]),
    { parent: spine, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.95, 0.105], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.935, 0.14], aim: [0, 0.915, 0.25], role: "jaw" });

  // --- Body -------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.56, -0.07], w: 0.3, h: 0.26 },
      { at: [0, 0.64, -0.04], w: 0.34, h: 0.3 },
      { at: [0, 0.73, 0.0], w: 0.33, h: 0.3 },
      { at: [0, 0.82, 0.04], w: 0.27, h: 0.24 },
      { at: [0, 0.9, 0.08], w: 0.19, h: 0.17 },
      { at: [0, 0.95, 0.1], w: 0.16, h: 0.14 },
    ],
    { bone: [spine, neck], color: coat, sides: 8, smooth: false },
  );

  // --- Head -------------------------------------------------------------------------------------------------
  const headPart = b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
    bone: head,
    at: [0, 1.0, 0.12],
    scale: [0.14, 0.115, 0.12],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), muzzlePaint, {
    bone: head,
    at: [0, 0.97, 0.2],
    scale: [0.062, 0.05, 0.058],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.062, 0.078, 0.045), "#ffffff", {
    bone: head,
    at: [0, 0.995, 0.25],
    rotation: [10, 0, 0],
    texture: NOSE,
  });
  b.part(new THREE.BoxGeometry(0.07, 0.006, 0.012), "#2a1a1a", { bone: head, at: [0, 0.935, 0.243] });
  b.part(new THREE.SphereGeometry(1, 8, 6), chinPaint, {
    bone: jaw,
    at: [0, 0.91, 0.19],
    scale: [0.052, 0.026, 0.05],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.05, 0.008, 0.04), "#4a2228", { bone: jaw, at: [0, 0.925, 0.2] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.014), "#ffffff", {
      bone: head,
      at: [s * 0.068, 1.025, 0.222],
      dir: [s * 0.35, 0, 1],
      axis: "z",
      texture: EYE,
    });

    // Ears: big round fluffy discs with a pale pixel-art centre and white rim tufts.
    const earJ = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.1, 1.06, 0.1],
      dir: [s * 0.6, 0.8, 0.1],
      role: "hinge",
    });
    const ear = b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: earJ,
      at: [s * 0.125, 1.08, 0.1],
      dir: [s * 0.5, 0.15, 0.85],
      axis: "z",
      scale: [0.075, 0.08, 0.026],
      flat: true,
    });
    b.part(new THREE.CircleGeometry(0.042, 10), "#ffffff", {
      bone: earJ,
      at: offset(ear, ear, 0.029),
      dir: ear,
      axis: "z",
      texture: EAR_INNER,
    });
    const rim = b
      .surface(ear)
      .scatter(12, { rng: rng(31 + side.charCodeAt(0)), minDist: 0.03, filter: (h) => Math.abs(h.n.dot(ear.axis)) < 0.6 });
    b.cards(rim, TUFT, { size: [0.03, 0.04], lean: 20, color: "#f3f0e6", rng: rng(5) });
  }

  // Cheek, crown and nape fur.
  const headHits = b.surface(headPart).scatter(44, {
    rng: rng(41),
    minDist: 0.04,
    filter: (h) => h.n.z < 0.55 && h.at.y < 1.1,
  });
  b.cards(headHits, TUFT, { size: [0.035, 0.05], lean: 55, vary: 0.3, rng: rng(42), color: coat });

  // Body fur: grey flanks and back, white chest fluff.
  const bodyHits = b.surface(body).scatter(90, {
    rng: rng(21),
    minDist: 0.055,
    filter: (h) => h.n.z < 0.35 && h.at.y > 0.45 && h.at.y < 0.88,
  });
  b.cards(bodyHits, TUFT, { size: [0.034, 0.05], lean: 55, vary: 0.3, rng: rng(22), color: coat });
  const chestHits = b.surface(body).scatter(40, {
    rng: rng(23),
    minDist: 0.045,
    filter: (h) => h.n.z > 0.35 && h.at.y > 0.55 && h.at.y < 0.88 && Math.abs(h.at.x) < 0.09,
  });
  b.cards(chestHits, TUFT, { size: [0.03, 0.044], lean: 50, vary: 0.25, rng: rng(24), color: "#f1eee2" });

  // --- Eucalyptus trunk and stand ---------------------------------------------------------------------------
  const trunk = b.sweep(
    [
      [0, 0.12, TZ],
      [0, 0.95, TZ],
    ],
    [0.062, 0.05],
    { bone: stand, color: bark, sides: 8, smooth: false, caps: { start: "flat", end: "flat" } },
  );
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.076, 0.05],
      [0.062, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.1, TZ], segments: 8, bone: stand, color: bark },
  );
  // Cut branch stubs on the back of the trunk.
  b.spike([0, 0.28, TZ + 0.03], [-0.5, 0.3, 0.8], 0.1, 0.024, { bone: stand, color: bark, sides: 6, smooth: false });
  b.spike([0, 0.72, TZ + 0.03], [0.55, 0.3, 0.8], 0.09, 0.022, { bone: stand, color: bark, sides: 6, smooth: false });
  // Peeling bark flaps.
  const flapHits = b.surface(trunk).scatter(14, {
    rng: rng(51),
    minDist: 0.07,
    filter: (h) => h.at.y < 0.34 || (h.at.y > 0.6 && h.at.y < 0.74),
  });
  b.cards(flapHits, FLAP, { size: [0.042, 0.056], lean: 50, bend: 35, vary: 0.25, rng: rng(52), bone: stand });

  type Branch = { pts: number[][]; r: [number, number]; leaves: number; t0: number };
  const branches: Branch[] = [
    // forks above the trunk, flanking the koala's head
    {
      pts: [
        [0, 0.9, TZ],
        [0.05, 1.02, 0.34],
        [0.16, 1.2, 0.31],
        [0.26, 1.38, 0.26],
      ],
      r: [0.036, 0.012],
      leaves: 16,
      t0: 0.3,
    },
    {
      pts: [
        [0, 0.9, TZ],
        [-0.05, 1.02, 0.34],
        [-0.15, 1.18, 0.32],
        [-0.3, 1.3, 0.28],
      ],
      r: [0.036, 0.012],
      leaves: 16,
      t0: 0.3,
    },
    // low side branches
    {
      pts: [
        [-0.03, 0.66, TZ],
        [-0.2, 0.72, 0.36],
        [-0.38, 0.7, 0.34],
        [-0.52, 0.62, 0.32],
      ],
      r: [0.026, 0.01],
      leaves: 14,
      t0: 0.35,
    },
    {
      pts: [
        [0.03, 0.62, TZ],
        [0.2, 0.6, 0.35],
        [0.34, 0.67, 0.36],
      ],
      r: [0.024, 0.01],
      leaves: 10,
      t0: 0.35,
    },
    // the seat branch the koala sits on, running back from the trunk
    {
      pts: [
        [0, 0.36, TZ],
        [0, 0.37, 0.1],
        [0, 0.39, -0.12],
        [0, 0.42, -0.3],
      ],
      r: [0.045, 0.028],
      leaves: 0,
      t0: 1,
    },
    // leafy twig off the end of the seat branch
    {
      pts: [
        [0, 0.41, -0.28],
        [0.04, 0.5, -0.36],
        [0.12, 0.58, -0.42],
      ],
      r: [0.02, 0.008],
      leaves: 10,
      t0: 0.3,
    },
  ];
  const leafFrames: ReturnType<typeof frame>[] = [];
  const jitter = rng(61);
  for (const br of branches) {
    const path = catmull(br.pts);
    b.sweep(path, br.r, { bone: stand, color: bark, sides: 6, smooth: false, caps: { start: "flat", end: "round" } });
    for (let i = 0; i < br.leaves; i++) {
      const t = br.t0 + ((1 - br.t0) * (i + jitter())) / br.leaves;
      const p = path.at(Math.min(t, 1)).add(new THREE.Vector3(jitter() * 0.02 - 0.01, 0, jitter() * 0.02 - 0.01));
      leafFrames.push(frame(p, [0, 1, 0]));
    }
    // gum nuts near the branch tip
    if (br.leaves > 0)
      for (let i = 0; i < 3; i++) {
        const p = path.at(0.62 + 0.13 * i);
        b.part(new THREE.SphereGeometry(0.013, 6, 4), i % 2 ? "#6b5340" : "#4a3828", {
          bone: stand,
          at: [p.x + (i - 1) * 0.012, p.y - 0.018, p.z + 0.01],
          scale: [1, 0.85, 1],
          flat: true,
        });
      }
  }
  b.cards(leafFrames, [LEAF_A, LEAF_A, LEAF_B], {
    size: [0.05, 0.13],
    lean: 150,
    vary: 0.25,
    spin: 25,
    rng: rng(62),
    bone: stand,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
  });

  // Plank display stand with brass corners, plaque, grass, fallen leaves and stones.
  b.part(tileBox([0.84, 0.07, 0.84], PLANKS_DARK, 0.022, { rand: rng(3), step: [1, 6] }), "#ffffff", {
    texture: PLANKS_DARK,
    bone: stand,
    at: [0, 0.035, 0],
  });
  b.part(tileBox([0.74, 0.03, 0.74], PLANKS_LIGHT, 0.02, { rand: rng(4), step: [1, 6] }), "#ffffff", {
    texture: PLANKS_LIGHT,
    bone: stand,
    at: [0, 0.085, 0],
  });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 6), BRASS, {
        bone: stand,
        at: [sx * 0.32, 0.106, sz * 0.32],
        flat: true,
      });
  b.part(new THREE.BoxGeometry(0.16, 0.0626, 0.012), "#ffffff", {
    texture: PLAQUE,
    bone: stand,
    at: [0, 0.035, 0.425],
  });

  const place = rng(9);
  const grassFrames: ReturnType<typeof frame>[] = [];
  while (grassFrames.length < 18) {
    const x = (place() - 0.5) * 0.66;
    const z = (place() - 0.5) * 0.66;
    if (Math.hypot(x, z - TZ) < 0.13 || Math.hypot(x, z + 0.0) < 0.0) continue;
    grassFrames.push(frame([x, 0.1, z], [0, 1, 0]));
  }
  b.cards(grassFrames, GRASS, { size: [0.056, 0.04], cross: true, vary: 0.3, rng: rng(10), bone: stand });
  const litter: ReturnType<typeof frame>[] = [];
  for (const p of [
    [-0.25, -0.2],
    [0.22, -0.28],
    [0.28, 0.12],
    [-0.28, 0.2],
    [0.1, 0.1],
    [-0.1, -0.3],
  ])
    litter.push(frame([p[0], 0.103, p[1]], [0, 1, 0]));
  b.cards(litter, [LEAF_A, LEAF_B], {
    size: [0.05, 0.13],
    lean: 90,
    mirror: true,
    spin: 180,
    rng: rng(11),
    bone: stand,
    flow: (_f, i) => [Math.cos(i * 1.9), 0, Math.sin(i * 1.9)],
  });
  for (const [x, z, w, a] of [
    [0.3, 0.3, 0.07, 20],
    [-0.3, -0.08, 0.05, 55],
    [0.15, -0.15, 0.04, 80],
  ])
    b.part(new THREE.BoxGeometry(w, w * 0.6, w * 0.8), "#8a8d96", {
      bone: stand,
      at: [x, 0.1 + w * 0.25, z],
      rotation: [0, a, 0],
      flat: true,
    });

  // --- Limbs: arms around the trunk, feet gripping below ---------------------------------------------------
  const digit = (name: string, parent: Joint, pts: number[][], r: number, claw: boolean) => {
    const ch = b.chain(name, catmull(pts), { parent, names: [`${name}a`, `${name}b`], role: "digit" });
    b.sweep(ch, [r, r * 0.75], { color: PAW, sides: 5, smooth: false });
    if (claw) {
      const end = ch.at(1);
      b.spike(end, end, 0.024, r * 0.7, { color: CLAW, sides: 5 });
    }
  };
  const grip = (
    prefix: [string, string],
    side: string,
    s: number,
    wrist: Joint,
    y: number,
    backYs: number[],
    frontYs: number[],
    r: number,
    thumbClaws: boolean,
  ) => {
    const R = trunkR(y) + 0.012;
    const pt = (a: number, dy: number) => [s * R * Math.cos(a), y + dy, TZ + R * Math.sin(a)];
    backYs.forEach((dy, i) =>
      digit(`${prefix[0]}${side}${i + 1}`, wrist, [pt(0, dy), pt(0.62, dy), pt(1.22, dy)], r, true),
    );
    frontYs.forEach((dy, i) =>
      digit(`${prefix[1]}${side}${i + 1}`, wrist, [pt(-0.05, dy), pt(-0.66, dy), pt(-1.25, dy)], r * 1.05, thumbClaws),
    );
    b.part(new THREE.BoxGeometry(0.034, 0.075, 0.05), PAW, {
      bone: wrist,
      at: [s * (trunkR(y) + 0.008), y, TZ],
      flat: true,
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Arm
    const armPts = limb([s * 0.15, 0.8, 0.04], [s * 0.056, 0.82, TZ], [0.18, 0.15], [[s, -0.5, 0]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.05, 0.042, 0.035], { color: coat, sides: 6, smooth: false });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), coat, { bone: arm.joints[0], at: [s * 0.15, 0.8, 0.04], flat: true });
    grip(["finger", "thumb"], side, s, arm.joints[arm.joints.length - 1], 0.82, [-0.024, 0, 0.024], [-0.015, 0.015], 0.011, true);

    // Leg
    const legPts = limb([s * 0.13, 0.5, -0.04], [s * 0.066, 0.52, TZ], [0.22, 0.2], [[s, 0.6, 0]]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.07, 0.05, 0.036], { color: coat, sides: 6, smooth: false });
    b.part(new THREE.SphereGeometry(0.078, 8, 6), coat, { bone: leg.joints[0], at: [s * 0.135, 0.5, -0.03], flat: true });
    grip(["toe", "bigToe"], side, s, leg.joints[leg.joints.length - 1], 0.52, [-0.025, 0, 0.025], [0], 0.012, false);
  }

  return b.root;
}
