// Pixel koala: a chunky grey koala sitting on a peeled eucalyptus seat-branch and hugging two forked branches with
// all ten of its clawed digits, mounted on a little octagonal wooden stand with a brass plaque, a lashed prop post,
// leafy twigs, gum nuts and a few fallen leaves.
// Style: pixel art. One texel (2 cm) for fur, bark and wood, half of it (1 cm) for every drawn detail: eyes, nose, ear
// fluff, leaves, tufts and plaque are hand-placed pixel drawings; every paint is quantised into square dithered cells
// from a small palette. Volumes are boxes, faceted 8-sided tubes and pixel-staircase extrusions.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel koala on a eucalyptus stand",
  description:
    "Pixel-art koala sitting on a eucalyptus seat branch, gripping two forked branches with clawed hands and feet, on a wooden stand with a plaque, rope-lashed prop, leafy twigs and gum nuts.",
};

type V3 = [number, number, number];
const WHITE = "#ffffff";
const TEXEL = 0.02;
const HALF = TEXEL / 2;
const OCT = Math.cos(Math.PI / 8);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Paints: square dithered cells, small ramps.

const FUR_RAMP = ["#30323b", "#454854", "#5f6471", "#7f8591", "#a2a8b1"];
const CREAM_RAMP = ["#a8a598", "#c5c1b3", "#dcd8c8", "#eeeadb"];
const RUMP_RAMP = ["#7f7c76", "#a19d93", "#c0bbad", "#d6d1c2"];
const CHEEK_RAMP = ["#7f8591", "#a2a8b1", "#c4c8cc", "#e0e1dc"];
const MUZZLE_RAMP = ["#797a79", "#9a9a94", "#bdbab0", "#d3cfc2"];
const HAND_RAMP = ["#1a1b21", "#282a32", "#393c46"];
const WOOD_RAMP = ["#3b2418", "#573522", "#744630", "#8f5e40", "#a8774f"];
const ROPE_RAMP = ["#8f7340", "#b8975a", "#d6b878"];
const ROCK_RAMP = ["#4f4f5a", "#686873", "#85858d"];

const furValue = (c: Cell) => 0.48 + 0.3 * c.n.y + (c.random(3) - 0.5) * 0.34 + (noise(c.at, 0.14, 2) - 0.5) * 0.35;

const FUR = cellPaint(TEXEL, (c) => c.pick(FUR_RAMP, furValue(c)), { dither: true });
/** Torso: cream bib on the chest, mottled pale rump, grey everywhere else. */
const BODY = cellPaint(
  TEXEL,
  (c) => {
    const { x, y } = c.at;
    const chest = (x / 0.14) ** 2 + ((y - 0.8) / 0.2) ** 2 + (c.random(9) - 0.5) * 0.3 < 1;
    if (chest && c.n.z > 0.2) return c.pick(CREAM_RAMP, 0.55 + 0.3 * c.n.y + (c.random(4) - 0.5) * 0.4);
    if (y < 0.74 && c.n.z < -0.15) return c.pick(RUMP_RAMP, 0.5 + (c.random(5) - 0.5) * 0.9);
    return c.pick(FUR_RAMP, furValue(c));
  },
  { dither: true },
);
const CHEEK = cellPaint(TEXEL, (c) => c.pick(CHEEK_RAMP, 0.55 + 0.25 * c.n.y + (c.random(6) - 0.5) * 0.4), {
  dither: true,
});
const MUZZLE = cellPaint(HALF, (c) => c.pick(MUZZLE_RAMP, 0.55 + 0.25 * c.n.y + (c.random(7) - 0.5) * 0.4), {
  dither: true,
});
const HAND = cellPaint(HALF, (c) => c.pick(HAND_RAMP, 0.5 + 0.3 * c.n.y + (c.random(8) - 0.5) * 0.7), { dither: true });

const BARK_BASE = ["#8b7e69", "#a89c83", "#c4baa0", "#dbd3ba", "#ebe5d0"];
const BARK_PINK = ["#a37e6c", "#c39b86", "#dcb9a2"];
const BARK_OLIVE = ["#7a8566", "#98a280", "#b4bc9b"];
const BARK_STOCK = ["#3f342b", "#58493a", "#76644e", "#917c61"];
/** Eucalyptus bark: pale ghost-gum streaks with pink and olive patches, rough dark stocking low on the trunk. */
const BARK = cellPaint(
  TEXEL,
  (c) => {
    const q = V(c.at.x * 3.2, c.at.y * 0.5, c.at.z * 3.2);
    const n1 = noise(q, 0.16, 11);
    const n2 = noise(c.at, 0.22, 21);
    const shade = 0.5 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.4;
    if (c.at.y < 0.34 + (c.random(2) - 0.5) * 0.1 + n1 * 0.12) return c.pick(BARK_STOCK, shade);
    if (c.random(6) < 0.05) return "#6f6250";
    if (n2 > 0.62) return c.pick(BARK_PINK, shade);
    if (n2 < 0.34) return c.pick(BARK_OLIVE, shade);
    return c.pick(BARK_BASE, n1 * 0.7 + shade * 0.5 - 0.1);
  },
  { dither: true },
);
const WOOD = cellPaint(TEXEL, (c) => c.pick(WOOD_RAMP, 0.4 + 0.3 * c.n.y + (c.random(4) - 0.5) * 0.45), {
  dither: true,
});
/** Stand top: dark wood with patches of moss on the upward faces. */
const BASE = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.y > 0.8 && noise(c.at, 0.22, 5) > 0.6)
      return c.pick(["#365a2c", "#4d7a38", "#6a9a45"], 0.4 + (c.random(5) - 0.5) * 0.8);
    return c.pick(WOOD_RAMP, 0.3 + 0.3 * c.n.y + (c.random(4) - 0.5) * 0.4);
  },
  { dither: true },
);
const ROPE = cellPaint(HALF, (c) => c.pick(ROPE_RAMP, 0.4 + (c.random(5) - 0.5) * 0.9 + 0.2 * c.n.y), { dither: true });
const ROCK = cellPaint(TEXEL, (c) => c.pick(ROCK_RAMP, 0.4 + 0.3 * c.n.y + (c.random(9) - 0.5) * 0.5), { dither: true });

const NOSE_C = "#17181e";
const EYE_PATCH = "#2b2d35";
const MOUTH_C = "#3a1f27";
const CLAW = "#e6dcc6";
const TWIG = "#8a5240";
const GUM = "#6c4a2e";
const GUM_CAP = "#8a7a52";

// ---------------------------------------------------------------------------------------------------------------
// Pixel drawings (1 pixel = 1 cm).

const EYE_TEX = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#101117", w: "#f4f1e6" });
const NOSE_TEX = pixelArt(
  ["..kkkkkk..", ".kkhhkkkk.", "kkkhkkkkkk", "kkkkkkkkkk", ".kkkkkkkk.", "..kkkkkk.."],
  { k: NOSE_C, h: "#52556a" },
);
const MOUTH_TEX = pixelArt(["k.......k", ".kkkkkkk."], { k: "#2a161c" });

/** Round ear fluff: cream centre dithered grey toward the rim, a ragged white fringe. */
const EAR_TEX = pixelTexture(16, 16, (g) => {
  const ramp = ["#b9b7ad", "#d4d0c2", "#e8e4d6", "#f4f1e6"];
  g.fill((x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7.9) return "";
    if (d > 6.7) return (x * 7 + y * 13) % 5 < 2 ? "#c9c7bd" : "#ece8da";
    return pick(ramp, 0.95 - (d / 8) * 0.6 + (y / 16) * 0.12 - (x / 16) * 0.06, bayer(x, y));
  });
});

const LEAF_ROWS = [
  "....oo.",
  "...oggo",
  "...ohgo",
  "..oghgo",
  "..ogmgo",
  "..ohmgo",
  ".oghmgo",
  ".ogmhgo",
  ".oghmgo",
  ".oghmgo",
  ".oggmgo",
  "..ogmgo",
  "..oggo.",
  "...ogo.",
  "...mo..",
  "...m...",
];
const LEAF_A = pixelArt(LEAF_ROWS, { o: "#27463f", g: "#5d8f7b", h: "#8fb8a0", m: "#c2d8c6" });
const LEAF_B = pixelArt(LEAF_ROWS, { o: "#2d4a34", g: "#6d9a64", h: "#9cc287", m: "#d2e2b8" });
const LEAF_ROUND = pixelArt(
  ["..oooo..", ".ogghgo.", "oghhmggo", "oghmmggo", "ogghmggo", "ogggmggo", ".oggmgo.", "...omo.."],
  { o: "#3a5a60", g: "#86aaa6", h: "#b5cfc8", m: "#dcebe4" },
);
const TUFT_GREY = pixelArt(["..a..", "..a..", ".aab.", ".aab.", "aaabb", "aaabb"], { a: "#868c97", b: "#5a5f6c" });
const TUFT_DARK = pixelArt(["..a..", "..a..", ".aab.", ".aab.", "aaabb", "aaabb"], { a: "#5f6471", b: "#3a3d48" });
const TUFT_CREAM = pixelArt(["..a..", "..a..", ".aab.", ".aab.", "aaabb", "aaabb"], { a: "#eeeadb", b: "#c5c1b3" });
const RINGS_TEX = pixelTexture(10, 10, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 4.5, y - 4.5);
    if (d > 5.4) return "";
    if (d < 0.9) return "#6a4a30";
    return Math.floor(d * 1.3) % 2 ? "#d8b98a" : "#bd9a6a";
  });
});
const PLAQUE_TEX = pixelArt(
  [
    "dddddddddddddddddd",
    "dhbbbbbbbggbbbbbhd",
    "dbbbbbbbgGGgbbbbbd",
    "dhbbbbbbbggbbbbbhd",
    "dddddddddddddddddd",
  ],
  { d: "#5a3f17", b: "#d9a441", h: "#f6d98a", g: "#2f5b3a", G: "#4f8a58" },
);

// ---------------------------------------------------------------------------------------------------------------

/** Piecewise smoothstep through `[t, value]` keys. */
function keyed(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i];
    const [tb, vb] = keys[i + 1];
    if (t <= tb) {
      const k = (t - ta) / (tb - ta);
      return va + (vb - va) * k * k * (3 - 2 * k);
    }
  }
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(11);

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.705, -0.06], dir: [0, 1, 0], group: "body" });
  const stand = b.joint("stand", { parent: hips, at: [0, 0.05, -0.1], dir: [0, 1, 0], group: "stand" });

  const full = catmull([
    [0, 0.705, -0.06],
    [0, 0.8, -0.05],
    [0, 0.9, -0.02],
    [0, 0.98, 0.015],
    [0, 1.02, 0.03],
  ]);
  const K = full.knots;
  const spine = b.chain("spine", full.slice(0, K[3]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", full.slice(K[3], 1), { parent: chest, names: ["neck"], role: "neck", group: "body" });
  const HC: V3 = [0, 1.08, 0.05];
  const H = (x: number, y: number, z: number): V3 => [HC[0] + x, HC[1] + y, HC[2] + z];
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.02, 0.03], dir: [0, 0.15, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.095, 0), aim: H(0, -0.095, 0.2), role: "jaw", group: "head" });

  // ------------------------------------------------------------------------------------------------ the stand
  const flat = (r: number) => r / OCT;
  b.lathe(
    [
      [0, 0],
      [flat(0.5), 0],
      [flat(0.5), 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, -0.05], segments: 8, spin: 22.5, color: BASE, bone: stand, group: "stand" },
  );
  b.lathe(
    [
      [0, 0],
      [flat(0.46), 0],
      [flat(0.43), 0.05],
      [0, 0.05],
    ],
    { at: [0, 0.07, -0.05], segments: 8, spin: 22.5, color: BASE, bone: stand, group: "stand" },
  );
  b.part(new THREE.PlaneGeometry(0.18, 0.05), WHITE, {
    bone: stand,
    at: [0, 0.035, 0.453],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE_TEX,
    group: "stand",
  });
  for (const [x, z, w, h, d] of [
    [-0.31, 0.2, 0.07, 0.04, 0.055],
    [0.34, -0.12, 0.05, 0.03, 0.045],
  ])
    b.part(new THREE.BoxGeometry(w, h, d), ROCK, { bone: stand, at: [x, 0.12 + h / 2 - 0.004, z], group: "stand" });

  // ------------------------------------------------------------------------------------------------ eucalyptus trunk
  const trunkPath = catmull([
    [0, 0.06, -0.3],
    [0.005, 0.4, -0.3],
    [-0.01, 0.8, -0.3],
    [0, 1.15, -0.3],
    [0.02, 1.5, -0.3],
    [0.04, 1.78, -0.3],
  ]);
  const trunk = b.sweep(trunkPath, [0.125, 0.108, 0.095, 0.075, 0.05, 0.022], {
    bone: stand,
    color: BARK,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
    group: "stand",
  });

  // Forked branches the koala hugs.
  const branchR = (t: number) => 0.06 - 0.032 * t;
  const branches = new Map<number, ReturnType<typeof catmull>>();
  for (const s of [1, -1]) {
    const bp = catmull([
      [0, 0.72, -0.3],
      [s * 0.12, 0.9, -0.26],
      [s * 0.27, 1.1, -0.19],
      [s * 0.42, 1.33, -0.12],
      [s * 0.54, 1.55, -0.08],
      [s * 0.6, 1.72, -0.05],
    ]);
    branches.set(s, bp);
    b.sweep(bp, branchR, { bone: stand, color: BARK, sides: 8, smooth: false, caps: { start: "round", end: "point" }, group: "stand" });
  }

  // Seat branch the koala sits on, with a prop post lashed under its tip.
  const seatR = (z: number) => 0.062 - 0.014 * ((z + 0.3) / 0.6);
  b.sweep(
    catmull([
      [0, 0.485, -0.3],
      [0, 0.49, 0],
      [0, 0.49, 0.3],
    ]),
    [0.062, 0.048],
    { bone: stand, color: BARK, sides: 8, smooth: false, caps: { start: "round", end: "flat" }, group: "stand" },
  );
  const cut = new THREE.CircleGeometry(0.052, 8);
  cut.rotateZ(22.5 * DEG);
  b.part(cut, WHITE, { bone: stand, at: [0, 0.49, 0.3015], dir: [0, 0, 1], axis: "z", texture: RINGS_TEX, group: "stand" });
  b.part(new THREE.BoxGeometry(0.07, 0.35, 0.07), WOOD, { bone: stand, at: [0, 0.275, 0.26], group: "stand" });
  for (const y of [0.3, 0.33, 0.36, 0.39])
    b.part(new THREE.BoxGeometry(0.084, 0.014, 0.084), ROPE, { bone: stand, at: [0, y, 0.26], group: "stand" });
  for (const dx of [-0.012, 0.014])
    b.part(new THREE.BoxGeometry(0.012, 0.07 + dx * 2, 0.012), ROPE, {
      bone: stand,
      at: [dx, 0.34, 0.305],
      group: "stand",
    });

  // Peeling bark ribbons on the trunk.
  const barkSurface = b.surface(trunk);
  const stripColors = ["#d9cfb4", "#b6a688", "#7d6a50"];
  for (const hit of barkSurface.scatter(18, {
    rng: rng(5),
    minDist: 0.18,
    filter: (h) => h.at.y > 0.2 && h.at.y < 1.7 && Math.abs(h.n.y) < 0.6,
  }))
    b.stick(new THREE.BoxGeometry(0.045, 0.012, 0.16 + rand() * 0.2), stripColors[Math.floor(rand() * 3)], hit, {
      embed: 0.2,
      flow: [0, 1, 0],
      bone: stand,
      group: "stand",
    });

  // ------------------------------------------------------------------------------------------------ torso
  const RAD: [number, number, number][] = [
    [0, 0.17, 0.16],
    [0.2, 0.2, 0.185],
    [0.5, 0.185, 0.165],
    [0.8, 0.15, 0.13],
    [1, 0.12, 0.11],
  ];
  const bodyR = (t: number): [number, number] => [
    keyed(RAD.map((k) => [k[0], k[1]]), t),
    keyed(RAD.map((k) => [k[0], k[2]]), t),
  ];
  const body = b.sweep(full, bodyR, {
    bone: [hips, spine, neck],
    color: BODY,
    sides: 8,
    smooth: false,
    group: "body",
  });

  // Fur tufts: grey over the coat, cream on the bib.
  const hits = b.surface(body).scatter(150, { rng: rng(3), minDist: 0.05, filter: (h) => h.n.y > -0.3 });
  const isChest = (h: { at: THREE.Vector3; n: THREE.Vector3 }) =>
    (h.at.x / 0.14) ** 2 + ((h.at.y - 0.8) / 0.2) ** 2 < 1 && h.n.z > 0.2;
  const bib = hits.filter(isChest);
  const coat = hits.filter((h) => !isChest(h));
  b.cards(bib, TUFT_CREAM, { size: [0.05, 0.06], lean: 62, flow: [0, -1, 0], cross: true, vary: 0.2, rng: rng(4) });
  b.cards(coat, [TUFT_GREY, TUFT_DARK, TUFT_GREY], {
    size: [0.05, 0.06],
    lean: 62,
    flow: [0, -1, 0],
    cross: true,
    vary: 0.2,
    rng: rng(6),
  });

  // ------------------------------------------------------------------------------------------------ head
  const hbox = (w: number, h: number, d: number, at: V3, color: typeof FUR | string, bone = head, group = "head") =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, group });
  hbox(0.3, 0.25, 0.26, H(0, 0.02, -0.01), FUR); // cranium
  hbox(0.22, 0.04, 0.2, H(0, 0.165, -0.02), FUR); // crown
  hbox(0.35, 0.1, 0.22, H(0, -0.06, -0.01), CHEEK); // cheeks
  hbox(0.15, 0.1, 0.07, H(0, -0.04, 0.155), MUZZLE); // muzzle
  hbox(0.11, 0.07, 0.04, H(0, 0, 0.205), NOSE_C); // big leathery nose
  const plane = (w: number, h: number, at: V3, tex: THREE.Texture, bone = head, dir: V3 = [0, 0, 1], up?: V3) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, { bone, at, dir, up, axis: "z", texture: tex, group: "head" });
  plane(0.11, 0.066, H(0, 0, 0.2265), NOSE_TEX);
  plane(0.09, 0.018, H(0, -0.078, 0.1915), MOUTH_TEX);
  // Lower jaw with a dark mouth slab behind it.
  hbox(0.13, 0.045, 0.12, H(0, -0.1225, 0.1), CHEEK, jaw);
  hbox(0.125, 0.012, 0.115, H(0, -0.094, 0.1), MOUTH_C, jaw);
  hbox(0.07, 0.03, 0.03, H(0, -0.115, 0.165), CHEEK, jaw); // chin

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Small beady eyes on dark patches.
    b.part(new THREE.PlaneGeometry(0.065, 0.055), EYE_PATCH, {
      bone: head,
      at: H(s * 0.085, 0.045, 0.1215),
      dir: [0, 0, 1],
      axis: "z",
      group: "head",
    });
    plane(0.04, 0.04, H(s * 0.085, 0.045, 0.1235), EYE_TEX);

    // Big round ears: grey back disc, fluffy pixel face, hinged at the skull.
    const ear = b.joint(`ear${S}`, {
      parent: head,
      at: H(s * 0.12, 0.12, -0.04),
      dir: [s * 0.3, 1, 0],
      role: "hinge",
      group: "head",
    });
    const a = s * 18 * DEG;
    const xDir: V3 = [Math.cos(a), -Math.sin(a), 0];
    const yDir: V3 = [Math.sin(a), Math.cos(a), 0];
    const c = H(s * 0.17, 0.17, -0.04);
    b.extrude(
      stepped(
        [2, 3, 4, 4, 5, 5, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]),
        TEXEL,
        { rows: true },
      ),
      {
        at: [c[0] - yDir[0] * 0.1, c[1] - yDir[1] * 0.1, c[2]],
        x: xDir,
        y: yDir,
        thickness: 0.05,
        color: FUR,
        bone: ear,
        group: "head",
      },
    );
    b.part(new THREE.PlaneGeometry(0.17, 0.17), WHITE, {
      bone: ear,
      at: [c[0], c[1], c[2] + 0.0275],
      dir: [0, 0, 1],
      up: yDir,
      axis: "z",
      texture: EAR_TEX,
      group: "head",
    });

    // Cheek ruff: stepped cream tufts hanging off the jowls.
    [
      { z: -0.05, hw: [1, 2, 2, 3] },
      { z: 0.0, hw: [1, 2, 3, 3, 4] },
      { z: 0.05, hw: [1, 2, 2, 3] },
    ].forEach(({ z, hw }) =>
      b.extrude(
        stepped(
          hw.map((h) => [-h, h] as [number, number]),
          0.011,
          { rows: true },
        ),
        {
          at: H(s * 0.172, -0.115, z),
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.03,
          color: "#e3dfd0",
          bone: head,
          group: "head",
        },
      ),
    );
  }
  // Crown tufts.
  [
    { x: -0.05, hw: [3, 3, 2, 1] },
    { x: 0.0, hw: [3, 3, 2, 2, 1] },
    { x: 0.05, hw: [3, 2, 1] },
  ].forEach(({ x, hw }) =>
    b.extrude(
      stepped(
        hw.map((h) => [-h, h] as [number, number]),
        0.012,
        { rows: true },
      ),
      { at: H(x, 0.18, -0.02), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: FUR, bone: head, group: "head" },
    ),
  );

  // ------------------------------------------------------------------------------------------------ grips
  /** Palm plus five digits wrapped round a branch: centre `G`, axis `D`, palm side `u`, branch radius `Rb`. */
  const grip = (
    prefix: string,
    parent: typeof head,
    G: THREE.Vector3,
    D: THREE.Vector3,
    u: THREE.Vector3,
    Rb: number,
    longs: number[],
    thumbs: number[],
    clawed: boolean,
    group: string,
  ) => {
    const perp = u.clone().addScaledVector(D, -u.dot(D)).normalize();
    const R = Rb * 1.04 + 0.013;
    const at = (off: number, sign: number, deg: number, r: number) =>
      G.clone()
        .addScaledVector(D, off)
        .addScaledVector(perp.clone().applyAxisAngle(D, sign * deg * DEG), r);
    const upSign = at(0, 1, 95, R).y >= at(0, -1, 95, R).y ? 1 : -1;
    const lo = Math.min(...longs, ...thumbs);
    const hi = Math.max(...longs, ...thumbs);
    b.part(new THREE.BoxGeometry(0.056, hi - lo + 0.05, 0.044), HAND, {
      bone: parent,
      at: G.clone()
        .addScaledVector(D, (lo + hi) / 2)
        .addScaledVector(perp, Rb * 1.04 + 0.022)
        .toArray() as V3,
      dir: D.toArray() as V3,
      up: perp.toArray() as V3,
      group,
    });
    const digit = (name: string, off: number, sign: number, sweepDeg: number, claw: boolean) => {
      const path = catmull([
        at(off, sign, 0, Rb * 1.04 + 0.04),
        at(off, sign, 35, R),
        at(off, sign, sweepDeg * 0.6, R),
        at(off, sign, sweepDeg, R),
      ]);
      const ch = b.chain(name, path, { parent, names: [`${name}a`, `${name}b`], role: "digit", group });
      b.sweep(ch, [0.021, 0.012], { color: HAND, sides: 6, smooth: false, group });
      if (claw)
        b.spike(path.at(1), path.tangentAt(1), 0.04, 0.009, { color: CLAW, bone: ch.joints[1], sides: 5, group });
    };
    longs.forEach((off, i) => digit(`${prefix}${i + 1}`, off, upSign, 165, clawed));
    thumbs.forEach((off, i) => digit(`${prefix}T${i + 1}`, off, -upSign, 150, clawed));
  };

  // Arms: shoulders to the forked branches.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const bp = branches.get(s)!;
    const tg = 0.42;
    const G = bp.at(tg);
    const D = bp.tangentAt(tg).normalize();
    const Rb = branchR(tg);
    const raw = V(0, -0.35, 1);
    const u = raw.addScaledVector(D, -raw.dot(D)).normalize();
    const W = G.clone().addScaledVector(u, Rb * 1.04 + 0.075);
    const pts = limb(V(s * 0.17, 0.84, 0), W, [0.17, 0.17], [[s * 0.5, -0.4, 0.7]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
      group: `arm${S}`,
    });
    b.sweep(arm, [0.075, 0.062, 0.046], { color: FUR, sides: 8, smooth: false, group: `arm${S}` });
    grip(`finger${S}`, arm.tip!, G, D, u, Rb, [-0.06, -0.034, -0.008], [0.026, 0.052], true, `arm${S}`);
  }

  // Legs: thighs out and forward, feet pressed to the sides of the seat branch, toes wrapped over it.
  const FZ = 0.2;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const Rb = seatR(FZ);
    const G = V(0, 0.49, FZ);
    const D = V(0, 0, 1);
    const u = V(s, 0.15, 0).normalize();
    const ankle = G.clone().addScaledVector(u, Rb * 1.04 + 0.075);
    const leg = b.chain(`leg${S}`, [V(s * 0.13, 0.65, -0.03), V(s * 0.24, 0.62, FZ), ankle], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.07, 0.52, FZ],
      group: `leg${S}`,
    });
    b.sweep(leg, [0.1, 0.075, 0.05], { color: FUR, sides: 8, smooth: false, group: `leg${S}` });
    grip(`toe${S}`, leg.tip!, G, D, u, Rb, [-0.075, -0.045, -0.015, 0.015], [0.05], true, `leg${S}`);
  }

  // ------------------------------------------------------------------------------------------------ leaves
  type F = ReturnType<typeof frame>;
  const longLeaves: F[] = [];
  const roundLeaves: F[] = [];
  const up = V(0, 1, 0);
  const nuts: V3[] = [];
  const twig = (root: THREE.Vector3, dir: THREE.Vector3, len: number, n: number, round: boolean) => {
    const d = dir.clone().normalize();
    const path = catmull([
      root,
      root.clone().addScaledVector(d, len * 0.35).add(V(0, 0.012, 0)),
      root.clone().addScaledVector(d, len * 0.7).add(V(0, -0.03, 0)),
      root.clone().addScaledVector(d, len).add(V(0, -0.08, 0)),
    ]);
    b.sweep(path, [0.011, 0.004], { bone: stand, color: TWIG, sides: 5, smooth: false, group: "leaves" });
    const list = round ? roundLeaves : longLeaves;
    for (let i = 0; i <= n; i++) {
      const t = i === n ? 1 : (i + 0.6) / (n + 0.4);
      const p = path.at(t);
      const tan = path.tangentAt(t);
      const lat = tan.clone().cross(up).normalize();
      const side = i % 2 ? 1 : -1;
      const out =
        i === n
          ? tan.clone().multiplyScalar(0.5).add(V(0, -0.6, 0))
          : tan.clone().multiplyScalar(0.5).addScaledVector(lat, side * 0.5).add(V(0, -0.8, 0));
      list.push(frame(p, out.normalize()));
      if (!round && i === 2) nuts.push([p.x, p.y - 0.02, p.z + 0.025]);
    }
  };
  for (const s of [1, -1]) {
    const bp = branches.get(s)!;
    [0.62, 0.74, 0.85, 0.95].forEach((t, i) => {
      const sg = (i % 2 ? 1 : -1) * (s > 0 ? 1 : -1);
      const dir = bp
        .tangentAt(t)
        .clone()
        .multiplyScalar(0.6)
        .add(V(s * 0.5, 0.2, sg * 0.6));
      twig(bp.at(t), dir, 0.34 + rand() * 0.14, 4, false);
    });
    twig(bp.at(1), bp.tangentAt(1).clone().add(V(s * 0.3, 0, 0.3)), 0.4, 5, false);
  }
  [0.8, 0.9, 0.98].forEach((t, i) => {
    const sg = i % 2 ? 1 : -1;
    twig(trunkPath.at(t), V(sg * 0.7, 0.5, sg * 0.4 + 0.3), 0.32 + rand() * 0.1, 4, i === 1);
  });
  b.cards(longLeaves, [LEAF_A, LEAF_B, LEAF_A], {
    size: [0.075, 0.17],
    flow: [0, 0, 1],
    vary: 0.2,
    spin: 40,
    rng: rng(21),
    bone: stand,
  });
  b.cards(roundLeaves, LEAF_ROUND, { size: [0.085, 0.085], flow: [0, 0, 1], vary: 0.2, spin: 40, rng: rng(22), bone: stand });
  for (const [x, y, z] of nuts) {
    b.part(new THREE.SphereGeometry(0.018, 5, 4), GUM, { bone: stand, at: [x, y, z], flat: true, group: "leaves" });
    b.part(new THREE.BoxGeometry(0.026, 0.008, 0.026), GUM_CAP, { bone: stand, at: [x, y + 0.016, z], group: "leaves" });
  }

  // Fallen leaves and gum nuts on the stand.
  const fallen: F[] = [
    [0.22, 0.12, 0.3],
    [-0.28, -0.1, -0.35],
    [0.36, 0.14, 0.06],
    [-0.12, 0.3, 0.12],
    [0.1, 0.34, -0.02],
  ].map(([x, a, z]) => frame([x, 0.121, z], [0, 1, 0], [Math.cos(a * 20), 0, Math.sin(a * 20)]));
  b.cards(fallen, [LEAF_A, LEAF_B], {
    size: [0.075, 0.17],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.9 + 0.4), 0, Math.sin(i * 1.9 + 0.4)],
    mirror: true,
    rng: rng(23),
    bone: stand,
  });
  for (const [x, z] of [
    [0.3, 0.28],
    [-0.34, 0.12],
  ]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), GUM, { bone: stand, at: [x, 0.13, z], flat: true, group: "stand" });
    b.part(new THREE.BoxGeometry(0.03, 0.009, 0.03), GUM_CAP, { bone: stand, at: [x, 0.145, z], group: "stand" });
  }

  return b.root;
}
