import {
  BoxGeometry,
  ConeGeometry,
  PlaneGeometry,
} from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { cellPaint, pixelArt, stepped } from "../kits/pixel";

export const meta = {
  name: "Game Boy Color Slime King",
  description: "A jewel-crowned pixel slime with a face, royal cape, and swallowed treasures.",
  builtBy: "GPT-6 Astra",
};

const TEXEL = 0.025;
const JADE = ["#153c32", "#1d6b4c", "#329b5a", "#65c96b", "#b5ed86"];
const JADE_LIGHT = "#8de47a";
const INK = "#172238";
const MOUTH = "#301a35";
const LIP = "#d94e6d";
const GOLD = "#f7c843";
const GOLD_DARK = "#a66a2c";
const RUBY = "#e74455";
const AQUA = "#57d7d0";
const BONE = "#e8d6a0";
const CAPE = "#713c9b";
const CAPE_DARK = "#40245f";
const WHITE = "#f4f4c7";

const SKIN = cellPaint(TEXEL, (c) => {
  const lift = 0.18 + c.n.y * 0.23 + (c.axis === 2 && c.n.z > 0 ? 0.14 : 0);
  return c.pick(JADE, Math.max(0, Math.min(1, lift)));
}, { dither: true });
const GOLD_PAINT = cellPaint(TEXEL, (c) => c.pick([GOLD_DARK, GOLD, "#ffe878"], 0.35 + c.n.y * 0.4), { dither: true });
const CAPE_PAINT = cellPaint(TEXEL, (c) => c.pick([CAPE_DARK, CAPE, "#a467c0"], 0.3 + c.n.y * 0.3), { dither: true });

const EYE = pixelArt([
  ".......",
  "..kkk..",
  ".kwwwwk",
  ".kwgwwk",
  ".kwwwwk",
  "..kkk..",
  ".......",
], { k: INK, w: WHITE, g: AQUA });
const MOUTH_TEX = pixelArt([
  "..................",
  ".kkkkkkkkkkkkkkkk.",
  "kwwwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkkkk",
  "kwwwwwwwwwwwwwwwwk",
  ".kkkkkkkkkkkkkkkk.",
  "..................",
], { k: MOUTH, w: "#f08a9a" });
const LIP_TEX = pixelArt([
  "..............",
  "..kkkkkkkkkk..",
  ".krrrrrrrrrrk.",
  "..kkkkkkkkkk..",
  "..............",
], { k: MOUTH, r: LIP });
const COIN_TEX = pixelArt([
  ".yyyyy.",
  "yygggyy",
  "ygwwwgy",
  "ygwwwgy",
  "yygggyy",
  ".yyyyy.",
], { y: GOLD, g: GOLD_DARK, w: "#ffe878" });
const BONE_TEX = pixelArt([
  "..ww..",
  ".wwww.",
  "wwwwww",
  ".wwww.",
  "..ww..",
], { w: BONE });

export default function build() {
  const b = createBuilder({ name: "gbcSlimeKing", detail: 1, paintSize: 1024 });

  // Skeleton first: the body chain gives the dome squash and wobble controls.
  const bodyPath = catmull([
    [0, 0.31, 0],
    [0, 0.38, 0],
    [0, 0.56, 0],
    [0, 0.77, 0],
    [0, 0.99, 0],
  ]);
  const hips = b.joint("hips", { at: [0, 0.31, 0], role: "spine", group: "body" });
  const body = b.chain("body", bodyPath, {
    parent: hips,
    count: 5,
    names: ["body1", "body2", "body3", "body4", "body5"],
    role: "spine",
    group: "body",
  });
  b.sweep(body, (t) => 0.29 * (1 - t) ** 0.45 + 0.018, {
  color: SKIN,
  section: { ngon: 8 },
  caps: "round",
  name: "glossyJellyDome",
  group: "body",
});

  const head = b.joint("head", { parent: body.joints[4], at: [0, 0.78, 0.20], dir: [0, 1, 0], role: "head", group: "face" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.57, 0.295], dir: [0, -1, 0], role: "jaw", group: "face" });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, [
      [s * 0.24, 0.62, 0.01],
      [s * 0.40, 0.67, 0.07],
      [s * 0.56, 0.62, 0.16],
    ], {
      parent: body.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
      up: [0, 1, 0],
      count: 3,
    });
    b.sweep(arm, [0.105, 0.045], { color: SKIN, section: { ngon: 6 }, caps: "round", name: `pseudopod${side}`, group: `arm${side}` });
  }

  // Tiny cape behind the body, cut as a staircase silhouette.
  const capeShape = stepped([
    [-1, 6], [-1, 6], [-1, 5], [-1, 5], [-1, 4], [-1, 3], [-1, 2], [-1, 1],
  ], TEXEL, { rows: true });
  b.extrude(capeShape, {
    at: [0, 0.86, -0.25],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    color: CAPE_PAINT,
    bone: head,
    name: "royalCape",
    group: "cape",
  });

  // Crown: an octagonal gold band and five blocky points.
  b.lathe([
    [0, 0], [0.18, 0], [0.19, 0.035], [0.17, 0.07], [0.15, 0.075], [0, 0.075],
  ], { at: [0, 1.03, 0.01], axis: [0, 1, 0], segments: 8, color: GOLD_PAINT, bone: head, name: "crownBand", group: "crown" });
  for (const x of [-0.13, -0.065, 0, 0.065, 0.13]) {
    b.part(new ConeGeometry(0.052, 0.16, 4), GOLD_PAINT, {
      bone: head, at: [x, 1.135 + (Math.abs(x) < 0.01 ? 0.025 : 0), 0.01], name: "crownPoint", group: "crown",
    });
  }
  b.part(new BoxGeometry(0.072, 0.072, 0.022), RUBY, { bone: head, at: [0, 1.075, 0.18], name: "crownJewel", group: "crown" });
  b.part(new BoxGeometry(0.04, 0.04, 0.02), AQUA, { bone: head, at: [0.11, 1.078, 0.16], name: "crownJewelL", group: "crown" });
  b.part(new BoxGeometry(0.04, 0.04, 0.02), AQUA, { bone: head, at: [-0.11, 1.078, 0.16], name: "crownJewelR", group: "crown" });

  // Face decals are crisp 1-bit/limited-palette pixel art, kept separate from the moving jaw.
  for (const s of [1, -1] as const) {
    b.part(new PlaneGeometry(0.125, 0.125), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.115, 0.80, 0.205],
      dir: [0, 0, 1],
      axis: "z",
      name: `pixelEye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }
  b.part(new PlaneGeometry(0.27, 0.105), "#ffffff", {
    texture: MOUTH_TEX,
    bone: head,
    at: [0, 0.635, 0.26],
    dir: [0, 0, 1],
    axis: "z",
    name: "upperMouth",
    group: "face",
  });
  b.part(new PlaneGeometry(0.21, 0.075), "#ffffff", {
    texture: LIP_TEX,
    bone: jaw,
    at: [0, 0.565, 0.27],
    dir: [0, 0, 1],
    axis: "z",
    name: "lowerLip",
    group: "face",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: -16 });

  // Swallowed treasure: muted pixel decals float just behind the face, clearly inside the jelly.
  for (const [x, y, z] of [[-0.17, 0.48, 0.29], [0.18, 0.43, 0.29], [0.11, 0.78, 0.24]] as const) {
    b.part(new PlaneGeometry(0.09, 0.09), "#ffffff", {
      texture: COIN_TEX,
      bone: body.joints[2],
      at: [x, y, z],
      dir: [0, 0, 1],
      axis: "z",
      name: "swallowedCoin",
      group: "treasure",
    });
  }
  b.part(new BoxGeometry(0.035, 0.23, 0.025), GOLD_DARK, { bone: body.joints[2], at: [-0.14, 0.69, 0.29], rotation: [0, 0, -18], name: "swallowedSwordHilt", group: "treasure" });
  b.part(new BoxGeometry(0.09, 0.025, 0.025), GOLD, { bone: body.joints[2], at: [-0.14, 0.60, 0.29], rotation: [0, 0, -18], name: "swallowedSwordGuard", group: "treasure" });
  b.part(new PlaneGeometry(0.10, 0.08), "#ffffff", {
    texture: BONE_TEX,
    bone: body.joints[1],
    at: [0.10, 0.53, 0.29],
    dir: [0, 0, 1],
    axis: "z",
    name: "swallowedBone",
    group: "treasure",
  });

  // A few hard-square highlights sell the glossy dome without breaking the palette.
  b.part(new BoxGeometry(0.035, 0.15, 0.018), JADE_LIGHT, { bone: body.joints[3], at: [0.18, 0.92, 0.27], rotation: [0, 0, -22], name: "jellyHighlight", group: "body" });
  b.part(new BoxGeometry(0.025, 0.08, 0.018), "#d5f59a", { bone: body.joints[3], at: [0.225, 0.81, 0.27], rotation: [0, 0, -22], name: "jellySpark", group: "body" });

  return b.root;
}
