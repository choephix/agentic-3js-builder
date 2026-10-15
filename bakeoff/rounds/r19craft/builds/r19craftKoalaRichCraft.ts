import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Branch Stand",
  description:
    "A chunky pixel-art koala sitting astride a eucalyptus limb, forepaws and hind feet wrapped around the branch, mounted on a wooden display plinth with a peeling gum trunk, hanging sickle leaves, gumnuts and moss.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02; // fur, bark, large surfaces
const HALF = 0.01; // small details: eyes, nose, leaves, plinth tiles

const snap = (list: string[]) => list.map((c) => snapColor(c, 32));

const FUR = snap(["#3e4350", "#565c6b", "#737a89", "#929aa8", "#b3bac5"]);
const CREAM = snap(["#a9a496", "#c9c4b6", "#e4e0d3", "#f6f3ea"]);
const EARIN = snap(["#8c6b73", "#b98f95", "#dcb7b7"]);
const BARK = snap(["#4f4d3f", "#6f705c", "#8d8e78", "#aeaf98", "#cfcdb5"]);
const SALMON = snap(["#8e5a45", "#b27a5c", "#d09e7c"]);
const WOODS = snap(["#4a2f1d", "#5e3b24", "#74492c", "#8a5b37", "#a06d42"]);

const SKIN = "#2b2b33";
const CLAW = "#d9d2c0";
const NUT = "#6b5a3a";
const NUTCAP = "#8c7a52";
const TWIG = "#76593e";
const MOSS = ["#3f6b2f", "#5a8a3c", "#7fae4f"];
const STONE = ["#5e6068", "#7d7f86", "#9a9ca3"];
const PEEL = ["#b9b49a", "#cfcdb5", "#c4966f"];
const BRASS = "#c9a24a";
const BRASS_D = "#8a6a2a";
const LEAFGREEN = "#4f8a4a";

/** Deterministic hash in [0, 1) for integer pixel coordinates. */
const h2 = (x: number, y: number, s = 0) => {
  let h = Math.imul(x + s * 131, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** A sickle-shaped eucalyptus leaf, root at the bottom row, tip at the top. */
function leafTexture(dark: string, mid: string, light: string, tint: string, seed: number) {
  const W = 6;
  const H = 20;
  return pixelTexture(W, H, (g) => {
    for (let r = 0; r < H; r++) {
      const y = 1 - (r + 0.5) / H; // 0 at the root, 1 at the tip
      const w = Math.max(1, Math.round(5 * Math.sin(Math.PI * Math.pow(y, 0.7))));
      const cx = 2.5 + 1.2 * y * y;
      const x0 = Math.round(cx - w / 2);
      const rib = Math.round(cx - 0.5);
      for (let k = 0; k < w; k++) {
        const x = x0 + k;
        const edge = (k === 0 || k === w - 1) && w > 2;
        const c = edge ? dark : x === rib ? light : h2(x, r, seed) < 0.22 ? tint : mid;
        g.set(x, r, c);
      }
    }
  });
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(11);

  // ------------------------------------------------------------------ textures
  const EYE = pixelArt([".kkk.", "kwkkk", "kkkkk", ".kkk."], { k: "#14141a", w: "#ffffff" });
  const EYEPATCH = pixelArt(["..gggg..", ".gggggg.", "gggggggg", "gggggggg", ".gggggg.", "..gggg.."], {
    g: "#383d49",
  });
  const NOSE = pixelArt(
    [".kkkkkk.", "kwwgggkk", "kwggggkk", "kgggggkk", "kkkkkkkk", "kkkkkkkk", "kkkkkkkk", ".kkkkkk.", "..kkkk.."],
    { k: "#16161c", g: "#2e2e3a", w: "#6d7280" },
  );
  const MOUTH = pixelArt(["...kk...", "...kk...", ".kk..kk.", "k......k"], { k: "#2a2428" });
  const TUFT = pixelArt(["..w..", ".www.", ".www.", "wwwwg", "wwgww", "wgwww"], { w: "#ffffff", g: "#c8c8c8" });
  const LEAF_A = leafTexture("#24493f", "#3d7466", "#79ad96", "#5e8f4a", 3);
  const LEAF_B = leafTexture("#2d4a35", "#4f7d52", "#9bbf8a", "#7d9a4a", 8);
  const PLAQUE = pixelTexture(24, 3, (g) => {
    g.fill((x, y) => (y === 0 ? BRASS : y === 2 ? BRASS_D : x % 4 === 2 ? LEAFGREEN : "#e2c36a"));
  });
  const WOOD_TILE = pixelTexture(96, 80, (g) => {
    g.fill((x, y) => {
      const plank = Math.floor(y / 8);
      const iy = y % 8;
      const off = (plank * 37) % 96;
      if (iy === 0) return WOODS[0];
      if ((x + off) % 64 === 0) return WOODS[0];
      if (iy === 1) return WOODS[3];
      const tone = 0.35 + 0.3 * h2(plank, 0, 3) + 0.32 * (h2(Math.floor((x + off) / 7), y, 5) - 0.5);
      return pick(WOODS, tone, bayer(x, y));
    });
    for (let p = 0; p < 10; p++) {
      g.set(3, p * 8 + 4, "#24150c");
      g.set(92, p * 8 + 4, "#24150c");
    }
  });

  // ------------------------------------------------------------------ paints
  const coat = cellPaint(
    TEXEL,
    (c) => {
      const n1 = noise(c.at, 0.1, 3) - 0.5;
      const y = c.at.y;
      const x = Math.abs(c.at.x);
      if (c.n.z > 0.2 && c.at.z < 0.2 && y > 0.7 && y < 0.99) {
        const e = Math.min((0.97 - y) / 0.09, (y - 0.7) / 0.08, (0.13 - x) / 0.07, 1);
        if (e > c.threshold) return c.pick(CREAM, 0.55 + 0.35 * n1 + 0.2 * c.n.y);
      }
      if (c.random(5) < 0.05) return c.pick(FUR, 0.18 + 0.2 * n1);
      return c.pick(FUR, 0.52 + 0.3 * c.n.y + 0.45 * n1);
    },
    { dither: true },
  );
  const creamP = cellPaint(
    TEXEL,
    (c) => c.pick(CREAM, 0.55 + 0.3 * c.n.y + 0.3 * (noise(c.at, 0.08, 9) - 0.5)),
    { dither: true },
  );
  const bark = cellPaint(
    TEXEL,
    (c) => {
      const streak = noise(new THREE.Vector3(c.at.x * 6, c.at.y * 0.6, c.at.z * 6), 0.08, 2);
      const patch = noise(c.at, 0.22, 7);
      if (c.random(4) < 0.04) return BARK[0];
      if (patch > 0.66) return c.pick(SALMON, (patch - 0.66) * 3 + 0.4 * (streak - 0.5));
      return c.pick(BARK, 0.25 + 0.7 * streak + 0.15 * c.n.y);
    },
    { dither: true },
  );
  const earPaint = (cx: number, cy: number) =>
    cellPaint(
      0.014,
      (c) => {
        const r = Math.hypot(c.at.x - cx, c.at.y - cy);
        if (c.n.z > 0.5) {
          if (r < 0.038) return c.pick(EARIN, 0.35 + 0.65 * (1 - r / 0.038));
          if (r > 0.057) return c.pick(CREAM, 0.6 + 0.4 * (noise(c.at, 0.04, 2) - 0.5));
        }
        return c.pick(FUR, 0.45 + 0.4 * (noise(c.at, 0.06, 5) - 0.5));
      },
      { dither: true },
    );

  // ------------------------------------------------------------------ skeleton
  const stand = b.joint("stand", { at: [0, 0.04, 0] });
  const hips = b.joint("hips", { parent: stand, at: [0, 0.6, -0.03], dir: [0, 1, 0], role: "spine" });
  const neckTop = [0, 1.01, 0.05];
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.68, -0.03],
      [0, 0.78, -0.02],
      [0, 0.88, 0.0],
      [0, 0.96, 0.03],
      neckTop,
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[3], at: neckTop, dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.965, 0.06], aim: [0, 0.965, 0.2], role: "jaw" });

  // ------------------------------------------------------------------ stand: plinth
  b.part(tileBox([1.0, 0.04, 0.8], WOOD_TILE, HALF, { rand: R, step: [1, 8] }), "#ffffff", {
    texture: WOOD_TILE,
    bone: stand,
    at: [0, 0.02, 0],
  });
  b.part(tileBox([0.88, 0.04, 0.68], WOOD_TILE, HALF, { rand: R, step: [1, 8] }), "#ffffff", {
    texture: WOOD_TILE,
    bone: stand,
    at: [0, 0.06, 0],
  });
  b.part(new THREE.PlaneGeometry(0.24, 0.03), "#ffffff", {
    texture: PLAQUE,
    bone: stand,
    at: [0, 0.022, 0.4015],
    dir: [0, 0, 1],
    axis: "z",
  });
  // moss tufts and stones on the plinth
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const d = 0.1 + R() * 0.3;
    const w = 0.03 + R() * 0.05;
    const hh = 0.02 + R() * 0.02;
    b.part(box(w, hh, w * (0.7 + R() * 0.6)), MOSS[Math.floor(R() * 3)], {
      bone: stand,
      at: [Math.cos(a) * d * 1.2, 0.08 + hh / 2 - 0.004, -0.23 + Math.sin(a) * d * 0.9],
    });
  }
  for (const [x, z, s, c] of [
    [0.3, 0.22, 0.09, 1],
    [0.37, 0.12, 0.06, 2],
    [-0.32, 0.2, 0.07, 0],
    [-0.36, 0.1, 0.045, 1],
  ] as const) {
    b.part(box(s, s * 0.6, s * 0.85), STONE[c], { bone: stand, at: [x, 0.08 + s * 0.3 - 0.004, z] });
    b.part(box(s * 0.7, s * 0.2, s * 0.6), MOSS[(c + 1) % 3], { bone: stand, at: [x, 0.08 + s * 0.6, z] });
  }
  // fallen leaves on the plinth
  const fallen: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 10; i++)
    fallen.push(frame([(R() - 0.5) * 0.7, 0.083, -0.3 + R() * 0.62], [0, 1, 0]));
  b.cards(fallen, [LEAF_A, LEAF_B], {
    size: [0.04, 0.13],
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
    rng: R,
    bone: stand,
    sink: 0,
  });

  // ------------------------------------------------------------------ stand: trunk and branch
  const trunk = b.sweep(
    catmull([
      [0, 0.07, -0.23],
      [0.01, 0.5, -0.24],
      [-0.01, 1.0, -0.22],
      [0.02, 1.5, -0.22],
    ]),
    [0.09, 0.075, 0.06, 0.045],
    { color: bark, sides: 8, smooth: false, bone: stand, caps: { start: "flat", end: "round" }, name: "trunk" },
  );
  b.sweep(
    catmull([
      [0, 0.53, -0.23],
      [0, 0.525, -0.1],
      [0, 0.515, 0.1],
      [0, 0.51, 0.3],
      [0, 0.52, 0.52],
    ]),
    [0.06, 0.05, 0.042, 0.038, 0.03],
    { color: bark, sides: 8, smooth: false, bone: stand, name: "branch" },
  );
  // bark peel strips on the trunk
  const peelHits = b.surface(trunk).scatter(18, { rng: R, minDist: 0.12, filter: (h) => h.at.y > 0.18 });
  peelHits.forEach((hit, i) => {
    b.stick(box(0.035, 0.012, 0.1 + R() * 0.07), PEEL[i % 3], hit, { embed: 0.4, flow: [0, 1, 0], spin: R() * 20 - 10 });
  });

  // twigs with hanging leaves and gumnuts
  const leafFrames: ReturnType<typeof frame>[] = [];
  const twig = (pts: number[][], leaves: number, r0: number) => {
    const path = catmull(pts);
    b.sweep(path, [r0, 0.006], {
      color: TWIG,
      sides: 5,
      smooth: false,
      bone: stand,
      caps: { start: "flat", end: "round" },
    });
    for (let k = 0; k < leaves; k++) leafFrames.push(frame(path.at(0.28 + (0.72 * k) / (leaves - 1)), [0, 1, 0]));
    for (const t of [0.5, 0.72, 0.9]) {
      const p = path.at(t);
      b.part(box(0.02, 0.026, 0.02), NUT, { bone: stand, at: [p.x, p.y - 0.03, p.z] });
      b.part(box(0.026, 0.008, 0.026), NUTCAP, { bone: stand, at: [p.x, p.y - 0.014, p.z] });
    }
  };
  twig([[0.02, 1.45, -0.22], [0.18, 1.55, -0.18], [0.34, 1.5, -0.1], [0.42, 1.38, -0.05]], 8, 0.022);
  twig([[0.0, 1.46, -0.22], [-0.18, 1.58, -0.26], [-0.36, 1.52, -0.2], [-0.46, 1.38, -0.14]], 8, 0.022);
  twig([[0.01, 1.44, -0.23], [0.05, 1.6, -0.35], [0.15, 1.68, -0.45], [0.2, 1.58, -0.55]], 7, 0.02);
  twig([[0.0, 1.46, -0.22], [-0.06, 1.58, -0.1], [-0.1, 1.68, 0.0], [-0.08, 1.6, 0.1]], 7, 0.02);
  twig([[0.0, 1.05, -0.23], [0.2, 1.18, -0.25], [0.4, 1.22, -0.2], [0.5, 1.1, -0.15]], 8, 0.03);
  twig([[0.0, 1.12, -0.22], [-0.2, 1.25, -0.24], [-0.4, 1.25, -0.2], [-0.5, 1.12, -0.18]], 8, 0.03);
  twig([[0, 0.52, 0.5], [0.05, 0.62, 0.6], [0.1, 0.72, 0.66], [0.14, 0.66, 0.74]], 6, 0.022);
  twig([[0, 0.52, 0.45], [-0.1, 0.6, 0.55], [-0.2, 0.7, 0.6], [-0.26, 0.62, 0.7]], 6, 0.02);
  twig([[-0.04, 0.5, -0.1], [-0.2, 0.46, -0.12], [-0.32, 0.4, -0.1], [-0.4, 0.32, -0.08]], 5, 0.02);
  twig([[0.04, 0.5, -0.15], [0.2, 0.43, -0.16], [0.3, 0.34, -0.1]], 5, 0.02);
  b.cards(leafFrames, [LEAF_A, LEAF_B], {
    size: [0.055, 0.19],
    lean: 150,
    bend: 25,
    cross: true,
    vary: 0.25,
    spin: 25,
    flow: (_f, i) => [Math.cos(i * 2.399), 0, Math.sin(i * 2.399)],
    rng: R,
    bone: stand,
    sink: 0.05,
  });

  // ------------------------------------------------------------------ body
  const rxF = (t: number) => {
    const ks = [0.17, 0.19, 0.18, 0.14, 0.11];
    const x = t * (ks.length - 1);
    const i = Math.min(Math.floor(x), ks.length - 2);
    return ks[i] + (ks[i + 1] - ks[i]) * (x - i);
  };
  const ryF = (t: number) => {
    const ks = [0.15, 0.17, 0.16, 0.13, 0.11];
    const x = t * (ks.length - 1);
    const i = Math.min(Math.floor(x), ks.length - 2);
    return ks[i] + (ks[i + 1] - ks[i]) * (x - i);
  };
  const body = b.sweep(spine, (t) => [rxF(t), ryF(t)], { color: coat, sides: 8, smooth: false, name: "torso" });

  // ------------------------------------------------------------------ head
  const hp = (geo: THREE.BufferGeometry, color: string | typeof coat, at: number[], bone = head) =>
    b.part(geo, color, { bone, at });
  const cranium = hp(box(0.28, 0.24, 0.25), coat, [0, 1.07, 0.06]);
  const crownTop = hp(box(0.24, 0.03, 0.21), coat, [0, 1.205, 0.06]);
  const furHead: Array<typeof cranium> = [cranium, crownTop];
  hp(box(0.26, 0.04, 0.03), coat, [0, 1.17, 0.19]);
  const muzzle = hp(box(0.13, 0.09, 0.06), creamP, [0, 0.995, 0.205]);
  hp(box(0.05, 0.06, 0.04), coat, [0, 1.095, 0.2]);
  hp(box(0.08, 0.09, 0.05), SKIN, [0, 1.05, 0.225]);
  b.part(new THREE.PlaneGeometry(0.08, 0.09), "#ffffff", {
    texture: NOSE,
    bone: head,
    at: [0, 1.05, 0.2515],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.08, 0.04), "#ffffff", {
    texture: MOUTH,
    bone: head,
    at: [0, 0.972, 0.2355],
    dir: [0, 0, 1],
    axis: "z",
  });
  // lower jaw
  b.part(box(0.1, 0.035, 0.09), creamP, { bone: jaw, at: [0, 0.935, 0.15] });
  b.part(box(0.07, 0.012, 0.05), "#5a2f3a", { bone: jaw, at: [0, 0.957, 0.15] });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // cheeks, fringe, eyes
    furHead.push(hp(box(0.06, 0.1, 0.2), creamP, [s * 0.145, 0.995, 0.08]));
    b.extrude(
      stepped(
        [
          [0, 3],
          [1, 3],
          [0, 3],
          [1, 3],
          [0, 3],
        ],
        [0.02, 0.02],
      ),
      { at: [s * 0.175, 0.93, 0.0], x: [0, 0, 1], thickness: 0.03, color: creamP, bone: head },
    );
    b.part(new THREE.PlaneGeometry(0.08, 0.06), "#ffffff", {
      texture: EYEPATCH,
      bone: head,
      at: [s * 0.085, 1.1, 0.1875],
      dir: [0, 0, 1],
      axis: "z",
    });
    b.part(new THREE.PlaneGeometry(0.05, 0.04), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.085, 1.1, 0.1905],
      dir: [0, 0, 1],
      axis: "z",
    });

    // ears
    const ear = b.joint(`ear${S}`, {
      parent: head,
      at: [s * 0.15, 1.15, 0.0],
      dir: [s * 0.3, 1, 0],
      role: "hinge",
    });
    const ex = s * 0.16;
    const ey0 = 1.12;
    const EAR = stepped(
      [2, 3, 4, 4, 5, 5, 5, 5, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]),
      0.014,
      { rows: true },
    );
    const EAR_BACK = stepped(
      [2, 3, 4, 5, 5, 6, 6, 6, 6, 5, 5, 4, 3, 2].map((h) => [-h, h] as [number, number]),
      0.014,
      { rows: true },
    );
    b.extrude(EAR_BACK, { at: [ex, ey0 - 0.014, -0.012], x: [1, 0, 0], thickness: 0.03, color: creamP, bone: ear });
    b.extrude(EAR, {
      at: [ex, ey0, 0.012],
      x: [1, 0, 0],
      thickness: 0.04,
      color: earPaint(ex, ey0 + 6 * 0.014),
      bone: ear,
    });
  }

  // ------------------------------------------------------------------ arms and hands
  const chest = spine.joints[2];
  const armSweeps: ReturnType<typeof b.sweep>[] = [];
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.15, 0.9, 0.02], [s * 0.055, 0.585, 0.25], [0.24, 0.24], [[s * 0.8, 0, -0.5]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    armSweeps.push(b.sweep(arm, [0.058, 0.044], { color: coat, sides: 8, smooth: false, name: `arm${S}` }));
    const wrist = arm.tip!;
    b.part(box(0.065, 0.03, 0.075), coat, { bone: wrist, at: [s * 0.035, 0.565, 0.3] });
    for (let k = 0; k < 4; k++) {
      const z = 0.27 + 0.02 * k;
      const fp = [15, 75, 135].map((a) => [
        s * 0.048 * Math.sin((a * Math.PI) / 180),
        0.51 + 0.048 * Math.cos((a * Math.PI) / 180),
        z,
      ]);
      const fc = b.chain(`finger${S}${k}`, catmull(fp), { parent: wrist, role: "digit" });
      b.sweep(fc, [0.011, 0.008], { color: SKIN, sides: 6, smooth: false });
      b.spike(fc.at(1), fc.at(1), 0.022, 0.006, { color: CLAW, sides: 4 });
    }

    // legs and feet
    const lp = limb([s * 0.13, 0.66, -0.03], [s * 0.085, 0.555, 0.13], [0.17, 0.17], [[s * 0.7, 0.4, 0.6]]);
    const leg = b.chain(`leg${S}`, lp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    legSweeps.push(b.sweep(leg, [0.09, 0.07, 0.05], { color: coat, sides: 8, smooth: false, name: `leg${S}` }));
    const ankle = leg.tip!;
    b.part(box(0.05, 0.04, 0.075), SKIN, { bone: ankle, at: [s * 0.067, 0.535, 0.13] });
    for (let k = 0; k < 4; k++) {
      const z = 0.1 + 0.02 * k;
      const tp = [55, 105, 155].map((a) => [
        s * 0.052 * Math.sin((a * Math.PI) / 180),
        0.514 + 0.052 * Math.cos((a * Math.PI) / 180),
        z,
      ]);
      const tc = b.chain(`toe${S}${k}`, catmull(tp), { parent: ankle, role: "digit" });
      b.sweep(tc, [0.011, 0.008], { color: SKIN, sides: 6, smooth: false });
      b.spike(tc.at(1), tc.at(1), 0.02, 0.006, { color: CLAW, sides: 4 });
    }
  }

  // ------------------------------------------------------------------ fur tufts
  const tuftOpts = {
    size: [0.045, 0.054] as [number, number],
    lean: 55,
    bend: 15,
    vary: 0.25,
    flow: [0, -1, 0.1] as [number, number, number],
    color: coat,
  };
  const bodyHits = b.surface(body).scatter(70, { rng: rng(21), minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(bodyHits, TUFT, { ...tuftOpts, rng: rng(22) });
  const limbHits = b
    .surface([armSweeps, legSweeps])
    .scatter(60, { rng: rng(23), minDist: 0.05, filter: (h) => h.n.y > -0.4 });
  b.cards(limbHits, TUFT, { ...tuftOpts, rng: rng(24), size: [0.04, 0.05] });
  const headHits = b
    .surface(furHead)
    .scatter(34, { rng: rng(25), minDist: 0.045, filter: (h) => h.n.y > -0.2 && h.n.z < 0.6 });
  b.cards(headHits, TUFT, { ...tuftOpts, rng: rng(26), size: [0.04, 0.045] });
  // cream chin fluff under the muzzle
  b.cards(
    b.surface(muzzle).scatter(6, { rng: rng(27), minDist: 0.03, filter: (h) => h.n.y < 0.2 }),
    TUFT,
    { ...tuftOpts, color: creamP, rng: rng(28), size: [0.035, 0.04] },
  );

  return b.root;
}
