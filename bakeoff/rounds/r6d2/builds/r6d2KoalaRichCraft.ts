import * as THREE from "three";
import { createBuilder, frame, noise, polyline, rng } from "../../../../src/index";
import type { Joint } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Fork",
  description:
    "A chunky pixel-art koala sitting in the crotch of a forked eucalyptus branch, gripping both limbs, on a plank plinth with moss, gum nuts and a KOALA plaque.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette (pixel ramps, dark to light)

const TEXEL = 0.016;
const GREY = ["#4f4d58", "#68666f", "#827f89", "#9d9aa4", "#bab7c0"];
const GREY_DK = ["#25242c", "#34333c", "#454450", "#5a5866"];
const CREAM = ["#b8af98", "#d4cbb2", "#ebe4cf", "#fbf6e8"];
const BARK_RAMP = ["#6f6553", "#8c8170", "#aa9f8a", "#c9bfa6", "#e4dcc6"];
const BARK_RUST = ["#9a5a38", "#b9764a"];
const MOSS = ["#243d1c", "#34561f", "#4a7a2a", "#69a038", "#8cc24c"];
const DIRT = ["#2e1e12", "#46301c", "#5e4128", "#785536"];
const STONE = ["#4a4a54", "#62626e", "#7d7d8a", "#9c9ca8"];
const POSTWOOD = ["#3b2414", "#523320", "#6a4529", "#85583386".slice(0, 7)];
const GRASS = ["#5f9a32", "#79b83e", "#9ad050"];
const CLAW = "#efe6cc";
const INKBLACK = "#17171c";

const norm = (v: V): V => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

// The fork: crotch at y 0.30, limbs lean out to x = +-0.46 at y 0.95, at z = -0.1.
const FORK_Z = -0.1;
const SLOPE = 0.46 / 0.65;
const armX = (y: number) => SLOPE * (y - 0.3);
const armPt = (s: number, t: number): V => [s * 0.46 * t, 0.3 + 0.65 * t, FORK_Z];
const ARM_ANGLE = (Math.atan2(0.46, 0.65) * 180) / Math.PI;

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const EYE = pixelArt([".kkk.", "kwkkk", "kwkkk", "kkkkk", ".kkk."], { k: "#0d0c12", w: "#ffffff" });

const hash = (a: number, b: number) => Math.abs(((a * 73856093) ^ (b * 19349663)) | 0) % 100;

const PLANKS = pixelTexture(80, 48, (g) => {
  const WOODS = ["#8a5a34", "#7c4f2c", "#966239", "#6f4626"];
  g.fill((x, y) => {
    const k = Math.floor(y / 6);
    const ry = y % 6;
    if (ry === 0) return "#3b2412";
    if (ry === 1) return "#b07a48";
    if ((x + k * 29) % 53 === 0) return "#3b2412";
    const h = hash(x + k * 7, ry + k);
    if (h < 9) return "#6a4224";
    if (h > 94) return "#a8713f";
    return WOODS[k % 4];
  });
  for (let k = 0; k < 8; k++) {
    const nx = (k * 29 + 3) % 80;
    g.set(nx, k * 6 + 3, "#2a1a0c");
    g.set((nx + 40) % 80, k * 6 + 3, "#2a1a0c");
  }
});

const GLYPH: Record<string, string[]> = {
  K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  A: [".x.", "x.x", "xxx", "x.x", "x.x"],
  L: ["x..", "x..", "x..", "x..", "xxx"],
};
const PLAQUE = pixelTexture(27, 9, (g) => {
  g.fill(() => "#2a1b10");
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#b8893f" : undefined));
  "KOALA".split("").forEach((ch, i) => g.stamp(4 + i * 4, 2, GLYPH[ch], { x: "#f6d56b" }));
  g.set(2, 4, "#7fb06a");
  g.set(2, 5, "#5a8a48");
  g.set(24, 4, "#7fb06a");
  g.set(24, 5, "#5a8a48");
});

// A sickle-shaped eucalyptus leaf, 7 x 16, tip at the top, stem at the bottom.
const makeLeaf = (lit: string, mid: string, dark: string, vein: string) =>
  pixelTexture(7, 16, (g) => {
    const hw = [0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0];
    for (let y = 0; y < 16; y++) {
      const cx = y <= 2 ? 4 : 3;
      for (let dx = -hw[y]; dx <= hw[y]; dx++) {
        let c = dx < 0 ? lit : mid;
        if (Math.abs(dx) === hw[y] && hw[y] >= 2) c = dark;
        if (dx === 0) c = vein;
        if (y >= 13) c = "#7a5a3a";
        g.set(cx + dx, y, c);
      }
    }
  });
const LEAF_A = makeLeaf("#8fb8ae", "#6b9a92", "#3f6a68", "#c4ddd0");
const LEAF_B = makeLeaf("#86b070", "#609050", "#35603a", "#bcd8a0");

// ---------------------------------------------------------------------------------------------------------------
// Paints

const fur = (ramp: string[], bias = 0.55, seed = 3) =>
  cellPaint(
    TEXEL,
    (c) => {
      const v =
        bias + 0.07 + 0.26 * c.n.y + 0.04 * c.n.z + (noise(c.at, 0.09, seed) - 0.5) * 0.5 + (c.random(seed) - 0.5) * 0.28;
      return c.pick(ramp, v);
    },
    { dither: true },
  );

const FUR = fur(GREY, 0.55, 3);
const FUR_LT = fur(GREY, 0.72, 4);
const FUR_DK = fur(GREY_DK, 0.5, 5);
const FUR_CR = fur(CREAM, 0.62, 6);

const BARK = cellPaint(
  TEXEL,
  (c) => {
    const n1 = noise(c.at, 0.14, 5);
    const n2 = noise(c.at, 0.05, 9);
    if (n1 > 0.66 && c.random(4) < 0.6) return c.pick(BARK_RUST, n2);
    let v = 0.5 + 0.22 * c.n.y + (n1 - 0.5) * 0.9 + (c.random(1) - 0.5) * 0.2;
    if (c.random(8) < 0.07) v -= 0.3;
    return c.pick(BARK_RAMP, v);
  },
  { dither: true },
);

const SOIL = cellPaint(
  TEXEL,
  (c) => {
    const n1 = noise(c.at, 0.16, 11);
    if (c.n.y > 0.5 && n1 < 0.7) return c.pick(MOSS, 0.35 + (n1 - 0.4) * 0.9 + (c.random(3) - 0.5) * 0.4);
    return c.pick(DIRT, 0.4 + (n1 - 0.5) * 0.8 + (c.random(5) - 0.5) * 0.4);
  },
  { dither: true },
);

const ROCK = cellPaint(
  TEXEL,
  (c) => c.pick(STONE, 0.45 + 0.3 * c.n.y + (noise(c.at, 0.07, 2) - 0.5) * 0.7 + (c.random(1) - 0.5) * 0.2),
  { dither: true },
);

const POST = cellPaint(TEXEL, (c) => c.pick(POSTWOOD, 0.5 + 0.25 * c.n.y + (c.random(2) - 0.5) * 0.4), {
  dither: true,
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(5);
  const sides = [1, -1];
  const tag = (s: number) => (s > 0 ? "L" : "R");

  const box = (bone: Joint, size: V, at: V, color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });

  // ---- Skeleton ----------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.46, -0.02], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.46, -0.02], [0, 0.58, 0], [0, 0.69, 0.03]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const sp2 = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.chain("neck", polyline([[0, 0.69, 0.03], [0, 0.77, 0.06]]), {
    parent: chest,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.77, 0.06], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.785, 0.1], dir: [0, 0, 1], role: "jaw" });

  const earJ: Record<string, Joint> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of sides) {
    const S = tag(s);
    earJ[S] = b.joint(`ear${S}`, { parent: head, at: [s * 0.1, 0.9, 0.06], dir: [s * 0.5, 1, 0], role: "hinge" });
    arms[S] = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.14, 0.68, 0.02],
        [s * 0.27, 0.6, 0.1],
        [s * 0.235, 0.63, -0.015],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    legs[S] = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.12, 0.45, 0.0],
        [s * 0.205, 0.5, 0.15],
        [s * 0.135, 0.49, 0.02],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
  }

  // ---- Stand: plinth, soil, props --------------------------------------------------------------------------------
  b.part(tileBox([1.1, 0.11, 0.62], PLANKS, 0.014, { rand: R, step: [1, 6] }), "#ffffff", {
    texture: PLANKS,
    bone: root,
    at: [0, 0.055, 0],
  });
  for (const sx of sides)
    for (const sz of sides) {
      box(root, [0.1, 0.13, 0.1], [sx * 0.5, 0.065, sz * 0.26], POST);
      box(root, [0.115, 0.02, 0.115], [sx * 0.5, 0.14, sz * 0.26], POST);
      box(root, [0.02, 0.02, 0.02], [sx * 0.5, 0.16, sz * 0.26], "#d8b25a");
    }
  b.part(new THREE.BoxGeometry(0.297, 0.099, 0.012), "#ffffff", {
    texture: PLAQUE,
    bone: root,
    at: [0, 0.055, 0.316],
  });
  box(root, [1.0, 0.052, 0.52], [0, 0.124, 0], SOIL);

  // grass tufts
  for (let i = 0; i < 12; i++) {
    let x = (R() - 0.5) * 0.9;
    const z = (R() - 0.5) * 0.46;
    if (Math.abs(x) < 0.12 && Math.abs(z - FORK_Z) < 0.12) x += 0.2;
    for (let k = 0; k < 3; k++) {
      const h = 0.04 + R() * 0.035;
      box(root, [0.014, h, 0.014], [x + (k - 1) * 0.015, 0.15 + h / 2 - 0.004, z + (R() - 0.5) * 0.02], GRASS[k % 3]);
    }
  }
  // rocks
  box(root, [0.1, 0.06, 0.08], [-0.38, 0.172, 0.14], ROCK, { rotation: [0, 25, 0] });
  box(root, [0.06, 0.04, 0.05], [-0.33, 0.2, 0.12], ROCK, { rotation: [0, -15, 0] });
  box(root, [0.08, 0.05, 0.07], [0.4, 0.168, 0.1], ROCK, { rotation: [0, -30, 0] });
  // gum nuts
  const nuts: V[] = [[-0.17, 0.162, 0.03], [0.15, 0.162, 0.05], [0.2, 0.162, -0.14], [-0.12, 0.162, -0.2]];
  for (const n of nuts) {
    box(root, [0.024, 0.024, 0.024], n, "#7a5a32");
    box(root, [0.03, 0.01, 0.03], [n[0], n[1] + 0.016, n[2]], "#a8844a");
    box(root, [0.01, 0.01, 0.01], [n[0], n[1] + 0.024, n[2]], "#5a3f22");
  }
  // fallen leaves
  const LEAF_OUT = stepped(
    [[-1, 1], [-2, 2], [-2, 2], [-2, 2], [-1, 1], [-1, 1], [0, 1]].map((r) => [r[0], r[1]] as [number, number]),
    0.01,
    { rows: true },
  );
  const fallen: [number, number, number][] = [[-0.3, -0.08, 20], [0.28, 0.14, 70], [0.1, 0.2, 150], [-0.22, 0.2, 110], [0.35, -0.12, 200]];
  fallen.forEach(([x, z, deg], i) => {
    const a = (deg * Math.PI) / 180;
    b.extrude(LEAF_OUT, {
      at: [x, 0.153, z],
      x: [Math.cos(a), 0, -Math.sin(a)],
      y: [Math.sin(a), 0, Math.cos(a)],
      thickness: 0.006,
      color: i % 2 ? "#7a9a50" : "#6b9a92",
      bone: root,
    });
  });

  // trunk, roots, crotch
  b.frustumBox([0, 0.14, FORK_Z], [0, 0.31, FORK_Z], [0.14, 0.14], [0.11, 0.11], { color: BARK, bone: root });
  box(root, [0.07, 0.06, 0.07], [0.09, 0.17, FORK_Z + 0.05], BARK, { rotation: [0, 0, -20] });
  box(root, [0.07, 0.06, 0.07], [-0.09, 0.17, FORK_Z + 0.04], BARK, { rotation: [0, 0, 20] });
  box(root, [0.07, 0.06, 0.07], [0.0, 0.17, FORK_Z - 0.09], BARK, { rotation: [20, 0, 0] });
  box(root, [0.14, 0.14, 0.14], [0, 0.31, FORK_Z], BARK);

  // fork limbs
  for (const s of sides) {
    b.frustumBox([s * 0.02, 0.31, FORK_Z], armPt(s, 1), [0.11, 0.11], [0.06, 0.06], { color: BARK, bone: root });
    for (const t of [0.22, 0.4, 0.78, 0.9]) {
      const P = armPt(s, t);
      const half = 0.055 - 0.025 * t;
      box(root, [0.025, 0.1, 0.012], [P[0], P[1], FORK_Z + half + 0.002], "#e9dfc6", {
        rotation: [0, 0, -s * ARM_ANGLE],
      });
    }
    for (const t of [0.3, 0.85]) {
      const P = armPt(s, t);
      const half = 0.055 - 0.025 * t;
      box(root, [0.03, 0.03, 0.014], [P[0], P[1], FORK_Z + half + 0.002], "#5a4a38", { rotation: [0, 0, -s * ARM_ANGLE] });
    }
  }

  // twigs, blossoms and leaves
  const leafFrames: any[] = [];
  const blossom = (Q: V) => {
    box(root, [0.034, 0.034, 0.034], Q, "#d8465c");
    const st: V[] = [[1, 1, 0], [-1, 1, 1], [0, 2, -1], [1, 0, -1], [-1, 0, 1]];
    for (const [dx, dy, dz] of st)
      box(root, [0.014, 0.014, 0.014], [Q[0] + dx * 0.017, Q[1] + dy * 0.015, Q[2] + dz * 0.017], "#f7dc7a");
  };
  let twigIndex = 0;
  for (const s of sides) {
    for (const t of [0.62, 0.7, 0.78, 0.86, 0.94, 1.0]) {
      const P = armPt(s, t);
      const d = norm([s * (0.5 + R() * 0.4), 0.6 + R() * 0.3, -0.3 + R() * 1.1]);
      const len = 0.12 + R() * 0.06;
      const Q: V = [P[0] + d[0] * len, P[1] + d[1] * len, P[2] + d[2] * len];
      b.frustumBox(P, Q, [0.032, 0.032], [0.018, 0.018], { color: BARK, bone: root });
      for (let k = 0; k < 3; k++) {
        const d2 = norm([d[0] + (R() - 0.5) * 0.9, d[1] + (R() - 0.5) * 0.6, d[2] + (R() - 0.5) * 0.9]);
        leafFrames.push(frame(Q, d2));
      }
      if (twigIndex % 3 === 1) blossom([Q[0] + d[0] * 0.02, Q[1] + d[1] * 0.02 - 0.03, Q[2] + d[2] * 0.02]);
      twigIndex++;
    }
    // crown of leaves at the limb tip
    const tip = armPt(s, 1);
    for (let k = 0; k < 4; k++)
      leafFrames.push(frame(tip, norm([s * (0.3 + R() * 0.5), 0.8, -0.4 + R() * 0.9])));
  }
  b.cards(leafFrames, [LEAF_A, LEAF_B], {
    size: [0.065, 0.15],
    lean: 35,
    flow: [0, -1, 0],
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(77),
    bone: root,
  });

  // ---- Koala body ----------------------------------------------------------------------------------------------
  box(hips, [0.27, 0.22, 0.26], [0, 0.47, -0.01], FUR);
  box(hips, [0.2, 0.16, 0.012], [0, 0.5, 0.126], FUR_CR);
  box(hips, [0.18, 0.12, 0.012], [0, 0.47, -0.142], FUR_CR);
  box(hips, [0.1, 0.05, 0.04], [0, 0.4, -0.15], FUR_CR);
  box(sp2, [0.25, 0.18, 0.2], [0, 0.64, 0.01], FUR);
  box(sp2, [0.15, 0.15, 0.012], [0, 0.63, 0.113], FUR_CR);
  box(sp2, [0.07, 0.05, 0.012], [0, 0.7, 0.114], FUR_CR);
  for (const s of sides) {
    box(hips, [0.05, 0.06, 0.05], [s * 0.14, 0.4, 0.02], FUR_LT);
    box(hips, [0.05, 0.05, 0.05], [s * 0.135, 0.52, -0.11], FUR_LT);
    box(sp2, [0.05, 0.05, 0.05], [s * 0.13, 0.72, 0.0], FUR_LT);
    box(sp2, [0.045, 0.045, 0.05], [s * 0.128, 0.6, 0.07], FUR_LT);
    box(chest, [0.07, 0.07, 0.09], [s * 0.135, 0.68, 0.02], FUR_LT);
  }
  box(sp2, [0.14, 0.07, 0.12], [0, 0.745, 0.05], FUR);

  // ---- Head ------------------------------------------------------------------------------------------------------
  box(head, [0.24, 0.17, 0.19], [0, 0.84, 0.08], FUR);
  box(head, [0.2, 0.03, 0.17], [0, 0.94, 0.08], FUR_LT);
  box(head, [0.27, 0.06, 0.15], [0, 0.785, 0.07], FUR_LT);
  box(head, [0.06, 0.03, 0.08], [0, 0.96, 0.07], FUR_LT);
  box(head, [0.11, 0.075, 0.05], [0, 0.8, 0.19], fur(GREY, 0.68, 7));
  box(head, [0.072, 0.05, 0.04], [0, 0.832, 0.215], INKBLACK);
  box(head, [0.022, 0.012, 0.006], [-0.016, 0.856, 0.2365], "#5a5a6c");
  box(head, [0.07, 0.008, 0.01], [0, 0.7625, 0.216], "#2a2128");
  box(jaw, [0.09, 0.03, 0.07], [0, 0.748, 0.17], FUR_CR);
  box(jaw, [0.07, 0.02, 0.04], [0, 0.735, 0.19], FUR_CR);
  for (const s of sides) {
    b.part(new THREE.BoxGeometry(0.042, 0.042, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.08, 0.868, 0.178],
    });
    // brow tick above each eye
    box(head, [0.05, 0.008, 0.01], [s * 0.08, 0.897, 0.178], "#3a3842");
    // cheek ruff tufts
    const cheek: V[] = [[0.125, 0.79, 0.04], [0.13, 0.77, 0.09], [0.115, 0.755, 0.13], [0.095, 0.75, 0.16]];
    for (const [x, y, z] of cheek) box(head, [0.04, 0.04, 0.04], [s * x, y, z], FUR_CR);
    // ears
    const S = tag(s);
    const ear = earJ[S];
    const outer = stepped([2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]), 0.014, { rows: true });
    const inner = stepped([1, 2, 3, 3, 3, 2, 1].map((h) => [-h, h] as [number, number]), 0.014, { rows: true });
    b.extrude(outer, { at: [s * 0.125, 0.875, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: FUR_DK, bone: ear });
    b.extrude(inner, { at: [s * 0.125, 0.889, 0.074], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: FUR_CR, bone: ear });
    const rim: V[] = [[0.178, 0.89, 0.08], [0.172, 0.935, 0.08], [0.15, 0.99, 0.08], [0.08, 0.9, 0.08]];
    for (const [x, y, z] of rim) box(ear, [0.028, 0.03, 0.028], [s * x, y, z], FUR_CR);
  }

  // ---- Arms and legs -------------------------------------------------------------------------------------------
  const PAW = fur(["#3a3944", "#4c4b58", "#605e6c", "#77747f"], 0.55, 8);
  const grip = (bone: Joint, s: number, ys: number[], z: number) => {
    for (const y of ys) {
      const xo = s * (armX(y) + 0.04);
      box(bone, [0.022, 0.024, 0.075], [xo, y, z - 0.035], PAW);
      box(bone, [0.018, 0.02, 0.018], [xo, y, z - 0.085], CLAW);
    }
  };
  for (const s of sides) {
    const S = tag(s);
    const arm = arms[S];
    const leg = legs[S];
    b.rod(arm.joints[0].at, arm.joints[1].at, [0.05, 0.042], FUR, { sides: 4, bone: arm.joints[0] });
    b.rod(arm.joints[1].at, arm.joints[2].at, [0.042, 0.036], FUR, { sides: 4, bone: arm.joints[1] });
    b.rod(leg.joints[0].at, leg.joints[1].at, [0.062, 0.05], FUR, { sides: 4, bone: leg.joints[0] });
    b.rod(leg.joints[1].at, leg.joints[2].at, [0.05, 0.04], FUR, { sides: 4, bone: leg.joints[1] });
    const wrist = arm.joints[2];
    const ankle = leg.joints[2];
    // hand
    box(wrist, [0.1, 0.09, 0.06], [s * 0.234, 0.63, -0.03], PAW);
    grip(wrist, s, [0.6, 0.63, 0.66], -0.03);
    box(wrist, [0.02, 0.025, 0.05], [s * (armX(0.64) - 0.045), 0.645, -0.06], PAW);
    box(wrist, [0.016, 0.02, 0.016], [s * (armX(0.64) - 0.045), 0.645, -0.095], CLAW);
    // foot
    box(ankle, [0.1, 0.06, 0.09], [s * 0.14, 0.49, -0.015], PAW);
    grip(ankle, s, [0.465, 0.49, 0.515], -0.03);
    // elbow and knee fluff
    box(arm.joints[1], [0.075, 0.075, 0.075], [s * 0.27, 0.6, 0.1], FUR_LT);
    box(leg.joints[1], [0.08, 0.08, 0.08], [s * 0.205, 0.5, 0.15], FUR_LT);
  }

  return b.root;
}
