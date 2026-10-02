import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cellPaint, pixelArt, snapColor } from "../kits/pixel";

const TEXEL = 0.018;
const FEATHER_LIGHT = snapColor("#ffd1dd", 64);
const FEATHER_DARK = snapColor("#d85c86", 64);
const SHADOW_PINK = snapColor("#a93466", 64);
const WING_PINK = snapColor("#ef82a7", 64);
const BLACK = snapColor("#171827", 64);
const BEAK_PINK = snapColor("#e66e89", 64);
const BEAK_BLACK = snapColor("#25212b", 64);
const LEG = snapColor("#d66f88", 64);
const LEG_SHADOW = snapColor("#9c3f62", 64);
const EYE_WHITE = snapColor("#fff4dc", 64);
const GOLD = snapColor("#f4bf65", 64);
const FLOOR_PINK = snapColor("#f7bfd0", 64);

const BODY_PALETTE = ["#b84271", "#d85c86", "#ef82a7", "#f49ab5", "#ffd1dd"].map((c) => snapColor(c, 64));
const BODY = cellPaint(TEXEL, (c) => {
  const blush = 0.5 + 0.26 * c.n.y + 0.2 * Math.sin(c.at.z * 18);
  return c.pick(BODY_PALETTE, blush + 0.08 * c.random(11));
}, { dither: true });

const FEATHER_CARD = pixelArt(
  [
    "....pp....",
    "...pwwp...",
    "..pwwwwp..",
    "..pwwwwp..",
    ".pwwwwwwp.",
    ".pwwwwwwp.",
    "..pwwwwp..",
    "...pwwp...",
    "....pp....",
  ],
  { p: FEATHER_DARK, w: FEATHER_LIGHT },
);
const DARK_FEATHER_CARD = pixelArt(
  [
    "...kkkk...",
    "..kbbbbk..",
    ".kbbbbbbk.",
    ".kbbbbbbk.",
    "kbbbbbbbbk",
    ".kbbbbbbk.",
    "..kbbbbk..",
    "...kkkk...",
  ],
  { k: BLACK, b: SHADOW_PINK },
);
const EYE_PIXEL = pixelArt(
  ["kkkkkk", "kwwwwk", "kwbbwk", "kwbbwk", "kwwwwk", "kkkkkk"],
  { k: BLACK, w: EYE_WHITE, b: "#5d3757" },
);

export const meta = {
  name: "Greater Flamingo",
  description: "A cheerful, pixel-feathered greater flamingo balancing on both long legs.",
  style: "whimsical pixel-art mix",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "flamingo", detail: 1, paintSize: 1024 });

  // Skeleton first: a readable standing bird with both wings and both legs exposed.
  const hips = b.joint("hips", { at: [0, 0.86, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.84, -0.18], [0, 0.94, 0.02], [0, 0.98, 0.23]]),
    { parent: hips, names: ["spineBase", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.99, 0.22], [0, 1.16, 0.38], [0, 1.36, 0.27], [0, 1.48, 0.43], [0, 1.52, 0.57]]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neckBase", "neckLow", "neckMid", "neckHigh", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.55, 0.62], dir: [0, 0.02, 1], role: "head" });
  const jawUpper = b.joint("jawUpper", { parent: head, at: [0, 1.56, 0.70], aim: [0, 1.54, 0.96], role: "jaw" });
  const jawLower = b.joint("jawLower", { parent: head, at: [0, 1.51, 0.70], aim: [0, 1.49, 0.92], role: "jaw" });

  const wingChains = [-1, 1].map((s) =>
    b.chain(
      s < 0 ? "wingR" : "wingL",
      catmull([
        [s * 0.18, 1.04, 0.02],
        [s * 0.30, 1.02, 0.05],
        [s * 0.43, 0.93, 0.00],
        [s * 0.56, 0.82, -0.06],
      ]),
      { parent: spine.joints[0], names: s < 0 ? ["shoulderR", "elbowR", "wristR", "wingTipR"] : ["shoulderL", "elbowL", "wristL", "wingTipL"], role: "wing" },
    ),
  );

  const legChains = [-1, 1].map((s) => {
    const hip = [s * 0.115, 0.84, 0.00] as [number, number, number];
    const foot = [s * 0.135, 0.055, 0.11] as [number, number, number];
    const points = limb(hip, foot, [0.25, 0.39, 0.17], [[0, 0, 1], [0, 0, -1]]);
    return b.chain(
      s < 0 ? "legR" : "legL",
      points,
      { parent: hips, names: s < 0 ? ["hipR", "kneeR", "ankleR", "footR"] : ["hipL", "kneeL", "ankleL", "footL"], role: "leg" },
    );
  });

  const tail = b.chain(
    "tail",
    catmull([[0, 0.96, -0.27], [0, 0.93, -0.42], [0, 0.87, -0.56]]),
    { parent: spine.joints[0], names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );

  // Main low-poly masses and the long, gently banded neck.
  const body = b.sweep(spine, (t) => [0.22 + 0.035 * Math.sin(t * Math.PI), 0.17 + 0.02 * Math.sin(t * Math.PI)], {
    section: { ngon: 8 },
    color: BODY,
    shift: [0, -0.015],
    name: "featheredBody",
    group: "body",
  });
  const neckTube = b.sweep(neck, [0.075, 0.047], {
    section: { ngon: 7 },
    color: BODY,
    bands: [[0.24, FEATHER_LIGHT], [0.52, BODY], [0.72, FEATHER_LIGHT]],
    name: "neckFeathers",
    group: "neck",
  });
  const tailTube = b.sweep(tail, [0.095, 0.025], {
    section: { ngon: 7 },
    color: BODY,
    bands: [[0.65, FEATHER_LIGHT]],
    name: "tailFeathers",
    group: "tail",
  });

  for (const [index, chain] of wingChains.entries()) {
    const s = index === 0 ? -1 : 1;
    b.sweep(chain, [0.08, 0.028], { section: { ngon: 6 }, color: WING_PINK, name: s < 0 ? "wingRArm" : "wingLArm", group: "wing" });
    const shoulder = [s * 0.23, 1.02, 0.04] as [number, number, number];
    b.membrane(chain, catmull([shoulder, [s * 0.34, 0.86, -0.11], [s * 0.56, 0.70, -0.08]]), {
      color: WING_PINK,
      thickness: 0.012,
      rows: 5,
      cols: 7,
      scallop: 0.12,
      bone: chain.joints[0],
      name: s < 0 ? "wingRWeb" : "wingLWeb",
      group: "wing",
    });
    // Layered primary feathers are intentionally square and graphic.
    for (let i = 0; i < 5; i += 1) {
      const root = [s * (0.34 + i * 0.045), 0.92 - i * 0.025, -0.06 - i * 0.012] as [number, number, number];
      const length = 0.25 + i * 0.018;
      b.extrude(
        [[0, 0], [0.075, 0], [0.06, length * 0.55], [0.025, length], [0, length, "sharp"]],
        { at: root, x: [0, 0, 1], y: [s * 0.15, 1, 0], thickness: 0.014, bevel: 0.004, color: i > 2 ? BLACK : FEATHER_LIGHT, bone: chain.joints[Math.min(i, chain.joints.length - 1)], name: `${s < 0 ? "wingR" : "wingL"}Primary${i}`, group: "feathers" },
      );
    }
    // A small row of pink coverts gives the wing its feathery stepped edge.
    for (let i = 0; i < 4; i += 1) {
      b.stick(new THREE.BoxGeometry(0.09, 0.025, 0.012), FEATHER_DARK, chain.at(0.28 + i * 0.16).moved([0, 0.005, 0]), {
        embed: 0.2,
        spin: s * (8 + i * 4),
        name: `${s < 0 ? "wingR" : "wingL"}Covert${i}`,
        group: "feathers",
      });
    }
  }

  for (const [index, chain] of legChains.entries()) {
    const s = index === 0 ? -1 : 1;
    b.sweep(chain, [0.040, 0.027], { section: { ngon: 6 }, color: LEG, skin: "rigid", name: s < 0 ? "legRShanks" : "legLShanks", group: "legs" });
    const knee = chain.joints[1];
    const ankle = chain.joints[2];
    b.part(new THREE.SphereGeometry(0.052, 6, 4), LEG_SHADOW, { bone: knee, at: knee.at, name: `${s < 0 ? "kneeR" : "kneeL"}KneeCap`, group: "legs", flat: true });
    b.part(new THREE.CylinderGeometry(0.033, 0.040, 0.018, 6), FEATHER_LIGHT, { bone: ankle, at: ankle.at, name: `${s < 0 ? "ankleR" : "ankleL"}Cuff`, group: "legs", flat: true });
    const foot = chain.joints[chain.joints.length - 1];
    b.rod(foot.at, [s * 0.11, 0.045, 0.29], 0.022, { color: LEG, bone: foot, name: `${s < 0 ? "footR" : "footL"}ToeCenter`, group: "feet" });
    b.rod(foot.at, [s * 0.09, 0.045, 0.22], 0.018, { color: LEG, bone: foot, name: `${s < 0 ? "footR" : "footL"}ToeOuter`, group: "feet" });
    b.rod(foot.at, [s * 0.01, 0.045, 0.23], 0.018, { color: LEG, bone: foot, name: `${s < 0 ? "footR" : "footL"}ToeInner`, group: "feet" });
    b.extrude(
      [[-0.09, 0], [0.09, 0], [0.13, 0.07], [0.04, 0.13], [-0.04, 0.13], [-0.13, 0.07]],
      { at: [s * 0.055, 0.044, 0.145], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.008, color: FEATHER_LIGHT, bone: foot, name: `${s < 0 ? "footR" : "footL"}Webbing`, group: "feet" },
    );
  }

  // Head, expressive eyes, crest, and a two-piece hooked bill.
  b.part(new THREE.SphereGeometry(0.125, 8, 6), BODY, { bone: head, at: [0, 1.54, 0.62], scale: [0.92, 0.88, 1.12], name: "headPlumage", group: "head", flat: true });
  b.part(new THREE.SphereGeometry(0.075, 7, 5), FEATHER_LIGHT, { bone: head, at: [0, 1.49, 0.69], scale: [1, 0.72, 0.68], name: "faceMask", group: "head", flat: true });
  b.extrude(
    [[-0.11, 0], [-0.08, 0.08], [-0.04, 0.16], [0, 0.10, "sharp"], [0.04, 0.19], [0.08, 0.07], [0.11, 0]],
    { at: [0, 1.61, 0.57], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.004, color: FEATHER_DARK, bone: head, name: "pixelCrest", group: "head" },
  );
  b.sweep(bezier([0, 1.56, 0.68], [0, 1.57, 0.76], [0, 1.54, 0.88], [0, 1.50, 0.98]), [0.058, 0], { color: (t) => t < 0.56 ? BEAK_PINK : BEAK_BLACK, caps: "point", bone: jawUpper, section: { ngon: 6 }, name: "upperBill", group: "beak" });
  b.sweep(bezier([0, 1.51, 0.69], [0, 1.50, 0.77], [0, 1.48, 0.85], [0, 1.47, 0.92]), [0.032, 0], { color: (t) => t < 0.48 ? FEATHER_LIGHT : BEAK_BLACK, caps: "point", bone: jawLower, section: { ngon: 6 }, name: "lowerBill", group: "beak" });

  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.082, 1.575, 0.676] as [number, number, number];
    b.part(new THREE.SphereGeometry(0.035, 7, 5), BLACK, { bone: head, at: eyeAt, name: `${s < 0 ? "eyeR" : "eyeL"}`, group: "face", flat: true });
    b.part(new THREE.BoxGeometry(0.024, 0.024, 0.006), EYE_WHITE, { bone: head, at: [s * 0.084, 1.585, 0.708], texture: EYE_PIXEL, dir: [0, 0, 1], axis: "z", name: `${s < 0 ? "eyeR" : "eyeL"}Pixel`, group: "face" });
    for (let lash = 0; lash < 3; lash += 1) {
      b.spike([s * (0.103 + lash * 0.008), 1.595 + lash * 0.008, 0.694], [s * 0.07, 0.02, 0.05], 0.028, 0.004, { color: BLACK, bone: head, name: `${s < 0 ? "eyeR" : "eyeL"}Lash${lash}`, group: "face" });
    }
  }

  // Whimsical pixel feather cards break up the broad painted surfaces.
  const bodySurface = b.surface([body, neckTube]);
  const bodyCards = bodySurface.scatter(42, { rng: rng(17), minDist: 0.055, filter: (hit) => hit.n.y > -0.25 });
  b.cards(bodyCards, FEATHER_CARD, { size: [0.045, 0.11], lean: 58, bend: 14, vary: 0.24, rng: rng(18), color: FEATHER_LIGHT, group: "down" });
  const tailCards = b.surface(tailTube).scatter(12, { rng: rng(19), minDist: 0.035, filter: (hit) => hit.n.y > -0.5 });
  b.cards(tailCards, DARK_FEATHER_CARD, { size: [0.05, 0.16], lean: 34, bend: 10, vary: 0.20, rng: rng(20), color: FEATHER_DARK, group: "tail" });

  // Pixel-gold ankle beads and a few tiny story accents.
  for (const [index, chain] of legChains.entries()) {
    const s = index === 0 ? -1 : 1;
    const ankle = chain.joints[2];
    b.ring(ankle, { count: 5, radius: 0.044, fromDeg: -70, toDeg: 70, name: `${s < 0 ? "ankleR" : "ankleL"}Beads`, group: "jewelry" }, (bead) => {
      b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), GOLD, { frame: bead, name: `${s < 0 ? "ankleR" : "ankleL"}Bead${bead.i}`, group: "jewelry", flat: true });
    });
  }

  // A small floor-contact shadow makes the standing pose read at a glance.
  b.part(new THREE.CylinderGeometry(0.30, 0.30, 0.008, 12), FLOOR_PINK, { at: [0, 0.004, 0.10], name: "groundShadow", group: "ground", flat: true });

  return b.root;
}
