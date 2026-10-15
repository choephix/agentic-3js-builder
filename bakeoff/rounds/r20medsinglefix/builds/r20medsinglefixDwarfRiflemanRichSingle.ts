import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, hand-painted dwarf sharpshooter: horned steel helm with a red crest, huge braided orange beard with brass clasps, domed pauldrons, bandolier, backpack and a brass-belled blunderbuss gripped at the hip.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const SKIN = "#e2a47c";
const SKIN_HI = "#f2bf98";
const SKIN_LO = "#a9654a";
const BEARD = "#c7551c";
const BEARD_HI = "#f2a04a";
const BEARD_DK = "#7d2f10";
const STEEL = "#8e9db0";
const STEEL_HI = "#c4d0de";
const STEEL_DK = "#3f4960";
const GOLD = "#e8b53a";
const GOLD_HI = "#fbe08a";
const GOLD_DK = "#9a6a17";
const BLUE = "#2f62b5";
const BLUE_HI = "#4f86d6";
const BLUE_DK = "#1b3670";
const LEATHER = "#7a4a28";
const LEATHER_HI = "#a06a3c";
const LEATHER_DK = "#3f2414";
const WOOD = "#8a5a30";
const WOOD_HI = "#b47c44";
const WOOD_DK = "#4f2f16";
const BONE = "#e8dcc0";
const BONE_DK = "#b8a47c";
const RED = "#b8281e";
const RED_HI = "#e0503a";
const RED_DK = "#6e1410";
const PANTS = "#6a5848";
const PANTS_HI = "#8a7762";
const PANTS_DK = "#3b2f26";
const INK = "#1c1220";

const hand = (base: string, hi: string, lo: string, seed = 1) =>
  countershade(
    mottle(base, hi, { size: 0.07, contrast: 0.6, seed }),
    mottle(lo, base, { size: 0.07, contrast: 0.6, seed: seed + 5 }),
    { level: -0.05, soft: 0.7 },
  );

const P_SKIN = hand(SKIN, SKIN_HI, SKIN_LO, 2);
const P_BLUE = hand(BLUE, BLUE_HI, BLUE_DK, 3);
const P_STEEL = hand(STEEL, STEEL_HI, STEEL_DK, 4);
const P_STEEL_DK = hand("#59647c", "#8794ab", "#2c3446", 5);
const P_GOLD = hand(GOLD, GOLD_HI, GOLD_DK, 6);
const P_LEATHER = hand(LEATHER, LEATHER_HI, LEATHER_DK, 7);
const P_BOOT = hand("#4d2f1c", "#6e4a2e", "#26160c", 8);
const P_PANTS = hand(PANTS, PANTS_HI, PANTS_DK, 9);
const P_BONE = hand(BONE, "#fff6dc", BONE_DK, 10);
const P_RED = hand(RED, RED_HI, RED_DK, 11);
const P_WOOD = countershade(
  grain(WOOD, WOOD_HI, { size: 0.01, axis: "z", seed: 3 }),
  grain(WOOD_DK, WOOD, { size: 0.01, axis: "z", seed: 4 }),
  { level: -0.05, soft: 0.7 },
);
const P_BEARD = countershade(
  grain(BEARD, BEARD_HI, { size: 0.012, axis: "y", seed: 5 }),
  grain(BEARD_DK, BEARD, { size: 0.012, axis: "y", seed: 6 }),
  { level: -0.1, soft: 0.8 },
);
const TUNIC = paint((p, n) => {
  if (p.y < 0.53) return GOLD;
  if (Math.abs(p.x) < 0.012 && n.z > 0.3) return GOLD;
  return gradient(BLUE_DK, P_BLUE, [0, 0.5, 0], [0, 0.95, 0]);
});

// ---------------------------------------------------------------- textures
const RUNE = svg(
  `<svg viewBox="0 0 64 32">
    <path d="M3 16 Q16 2 32 16 T61 16" stroke="#3a2008" stroke-width="5" fill="none"/>
    <path d="M3 16 Q16 2 32 16 T61 16" stroke="#f2c64a" stroke-width="3" fill="none"/>
    <path d="M3 16 Q16 30 32 16 T61 16" stroke="#3a2008" stroke-width="5" fill="none"/>
    <path d="M3 16 Q16 30 32 16 T61 16" stroke="#f2c64a" stroke-width="3" fill="none"/>
    <circle cx="32" cy="16" r="5" fill="#3a2008"/><circle cx="32" cy="16" r="3.2" fill="#fbe08a"/>
  </svg>`,
  { size: 256 },
);
const STRAND_A = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 Q31 30 16 64 Q1 30 16 0Z" fill="#d86a24"/>
   <path d="M16 8 Q22 32 16 60" stroke="#f4a95a" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const STRAND_B = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 Q30 28 16 64 Q2 28 16 0Z" fill="#a8421a"/>
   <path d="M16 10 Q10 34 16 60" stroke="#e5873a" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- geometry shorthands
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const sph = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
const tor = (r: number, t: number, rs = 5, ts = 12) => new THREE.TorusGeometry(r, t, rs, ts);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const R = rng(7);
  const put = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone, at, ...o });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.56, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.56, 0],
      [0, 0.72, 0.01],
      [0, 0.88, 0.02],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.93, 0.025], aim: [0, 1.0, 0.04], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0.04], aim: [0, 1.2, 0.07], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 0.06], aim: [0, 1.0, 0.2], role: "jaw" });

  // ------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 0.5, 0], w: 0.4, h: 0.3 },
      { at: [0, 0.62, 0], w: 0.43, h: 0.33 },
      { at: [0, 0.76, 0.01], w: 0.46, h: 0.35 },
      { at: [0, 0.88, 0.02], w: 0.52, h: 0.36 },
      { at: [0, 0.95, 0.03], w: 0.4, h: 0.28 },
    ],
    { bone: [hips, spine], color: TUNIC, name: "torso" },
  );
  const skin = b.surface(torso);

  // neck, gorget
  b.rod([0, 0.93, 0.025], [0, 1.03, 0.05], 0.085, P_SKIN, { bone: neck });
  b.lathe(
    [
      [0.12, 0],
      [0.21, 0],
      [0.21, 0.03],
      [0.15, 0.075],
      [0.12, 0.075],
    ],
    { at: [0, 0.905, 0.03], bone: chest, color: P_STEEL, segments: 10 },
  );
  put(tor(0.2, 0.012, 5, 14), P_GOLD, chest, [0, 0.935, 0.03], { dir: [0, 1, 0], axis: "z" });

  // belt, skirt, tabard
  b.lathe(
    [
      [0.2, 0.545],
      [0.25, 0.545],
      [0.25, 0.605],
      [0.2, 0.605],
    ],
    { at: [0, 0, 0], bone: hips, color: P_LEATHER, segments: 14, name: "belt" },
  );
  const skirtPaint = paint((_p, _n, s) => {
    if (s[0] < 0.395) return GOLD;
    if (s[1] % 30 < 2.5) return LEATHER_DK;
    return P_LEATHER;
  });
  const skirt = b.lathe(
    [
      [0.235, 0.57],
      [0.28, 0.38],
      [0.295, 0.38],
      [0.25, 0.57],
    ],
    { at: [0, 0, 0], bone: hips, color: skirtPaint, segments: 12, name: "skirt" },
  );
  skirt.scale.set(1, 1, 0.78);
  const tabardPaint = paint((_p, _n, s) => (Math.abs(s[0]) < 0.012 || s[1] > -0.025 ? GOLD : P_BLUE));
  b.extrude(
    [
      [-0.09, 0],
      [0.09, 0],
      [0.09, -0.2],
      [0, -0.27, "sharp"],
      [-0.09, -0.2],
    ],
    { at: [0, 0.59, 0.2], x: [1, 0, 0], y: [0, 1, -0.17], thickness: 0.014, bevel: 0.003, color: tabardPaint, bone: hips },
  );
  put(box(0.09, 0.07, 0.025), P_GOLD, hips, [0, 0.575, 0.185], { scale: [1, 1, 1] });
  put(box(0.055, 0.04, 0.012), "#fbe08a", hips, [0, 0.575, 0.2]);
  put(sph(0.014, 6, 4), RED, hips, [0, 0.575, 0.208]);

  // pouches and powder horn
  put(box(0.1, 0.1, 0.065), P_LEATHER, hips, [0.2, 0.5, 0.14], { rotation: [0, 18, 0] });
  put(box(0.108, 0.04, 0.072), P_LEATHER, hips, [0.2, 0.535, 0.14], { rotation: [0, 18, 0] });
  put(sph(0.012, 6, 4), P_GOLD, hips, [0.215, 0.525, 0.175]);
  put(box(0.08, 0.09, 0.05), P_LEATHER, hips, [-0.22, 0.5, -0.1], { rotation: [0, -25, 0] });
  put(sph(0.012, 6, 4), P_GOLD, hips, [-0.23, 0.52, -0.13]);
  b.sweep(
    catmull([
      [0.24, 0.58, -0.12],
      [0.3, 0.5, -0.16],
      [0.3, 0.4, -0.14],
      [0.25, 0.33, -0.08],
    ]),
    [0.04, 0.012],
    { bone: hips, color: P_BONE, caps: { start: "flat", end: "point" }, bands: [[0.1, P_GOLD]] },
  );
  b.sweep(
    catmull([
      [0.2, 0.6, -0.06],
      [0.27, 0.62, -0.13],
    ]),
    0.008,
    { bone: hips, color: P_LEATHER_DK(), caps: "flat" },
  );

  // bandolier and harness straps
  const bandPts: number[][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    bandPts.push([0.29 * Math.sin(a), 0.8 - 0.14 * Math.sin(a), 0.21 * Math.cos(a)]);
  }
  const bandPath = skin.drape(catmull(bandPts, { closed: true }), { lift: 0.014 });
  b.sweep(bandPath, 0.026, { color: P_LEATHER, section: { ngon: 4 } });
  b.along(bandPath, 11, (at) => {
    b.part(cyl(0.016, 0.016, 0.06, 6), P_GOLD, { at, dir: at.dir([1, 0, 0]) });
    b.part(cyl(0.012, 0.016, 0.01, 6), P_STEEL, { at: at.moved([0, 0, 0.0]), dir: at.dir([1, 0, 0]) });
  });
  for (const s of [1, -1]) {
    const strap = skin.drape(
      catmull([
        [s * 0.12, 0.8, -0.22],
        [s * 0.14, 0.9, -0.1],
        [s * 0.15, 0.97, 0.03],
        [s * 0.13, 0.9, 0.16],
        [s * 0.11, 0.75, 0.2],
        [s * 0.1, 0.62, 0.18],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, 0.022, { color: P_LEATHER, section: { ngon: 4 } });
  }

  // backpack
  put(box(0.34, 0.34, 0.16), P_LEATHER, chest, [0, 0.76, -0.25]);
  put(box(0.35, 0.05, 0.18), P_LEATHER, chest, [0, 0.95, -0.25]);
  put(box(0.1, 0.08, 0.02), P_GOLD, chest, [0, 0.94, -0.345]);
  put(box(0.24, 0.16, 0.03), P_LEATHER, chest, [0, 0.72, -0.345]);
  put(sph(0.014, 6, 4), P_GOLD, chest, [0, 0.76, -0.36]);
  put(cyl(0.075, 0.075, 0.4, 10), P_BLUE, chest, [0, 1.01, -0.25], { rotation: [0, 0, 90] });
  put(cyl(0.062, 0.062, 0.02, 10), BONE, chest, [0.2, 1.01, -0.25], { rotation: [0, 0, 90] });
  put(cyl(0.062, 0.062, 0.02, 10), BONE, chest, [-0.2, 1.01, -0.25], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    put(tor(0.08, 0.011, 5, 12), P_LEATHER, chest, [s * 0.1, 1.01, -0.25], { dir: [1, 0, 0], axis: "z" });
    put(box(0.014, 0.2, 0.01), P_LEATHER, chest, [s * 0.13, 0.76, -0.332]);
  }
  put(cyl(0.045, 0.04, 0.09, 8), P_STEEL, chest, [0.19, 0.67, -0.26]);
  put(tor(0.03, 0.007, 4, 8), P_STEEL_DK, chest, [0.23, 0.67, -0.26], { dir: [1, 0, 0], axis: "z" });

  // ------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.13, 0.52, 0],
        [s * 0.13, 0.28, 0.03],
        [s * 0.13, 0.09, 0],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.13, 0, 0.05] },
    );
    b.sweep(leg, [0.105, 0.1, 0.092, 0.085, 0.08], {
      bands: [
        [0.6, P_PANTS],
        [1, P_BOOT],
      ],
    });
    const cuff = leg.at(0.6);
    b.part(tor(0.098, 0.017, 6, 12), P_LEATHER, { at: cuff, dir: cuff, axis: "z" });
    const ankle = leg.joints[2];
    put(box(0.16, 0.09, 0.28), P_BOOT, ankle, [s * 0.13, 0.045, 0.08]);
    put(box(0.17, 0.025, 0.3), "#24150b", ankle, [s * 0.13, 0.0125, 0.08]);
    put(sph(0.08, 8, 6), P_BOOT, ankle, [s * 0.13, 0.045, 0.2], { scale: [1, 0.6, 1] });
    put(box(0.17, 0.06, 0.08), "#24150b", ankle, [s * 0.13, 0.03, -0.05]);
    put(box(0.1, 0.012, 0.02), P_GOLD, ankle, [s * 0.13, 0.092, 0.1]);
    put(sph(0.062, 8, 6), P_STEEL, leg.joints[1], [s * 0.13, 0.28, 0.115], { scale: [1, 1, 0.6] });
    put(sph(0.014, 6, 4), P_GOLD, leg.joints[1], [s * 0.13, 0.28, 0.14]);
  }

  // ------------------------------------------------------------ arms
  const wrist: Record<string, Joint> = {};
  const handAt: Record<string, number[]> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const w = s > 0 ? [0.39, 0.47, 0.1] : [-0.38, 0.5, 0.16];
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.3, 0.88, 0],
        [s * 0.4, 0.66, 0.03],
        w,
      ],
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.092, 0.085, 0.074, 0.066], {
      bands: [
        [0.5, P_BLUE],
        [1, P_SKIN],
      ],
    });
    const [sh, el, wr] = arm.joints;
    wrist[S] = wr;
    // sleeve cuff, bracer
    const cuffPt = arm.at(0.5);
    b.part(tor(0.088, 0.014, 5, 12), P_GOLD, { at: cuffPt, dir: cuffPt, axis: "z" });
    b.rod(arm.at(0.62).at, arm.at(0.96).at, [0.076, 0.068], P_LEATHER, { bone: el });
    b.rod(arm.at(0.62).at, arm.at(0.66).at, 0.08, P_GOLD, { bone: el });
    b.rod(arm.at(0.92).at, arm.at(0.96).at, 0.072, P_GOLD, { bone: el });
    put(sph(0.09, 8, 6), P_BLUE, el, [s * 0.4, 0.66, 0.03]);
    // pauldron
    put(sph(0.145, 10, 5), P_STEEL, sh, [s * 0.32, 0.9, 0], { scale: [1, 0.7, 1.05] });
    put(new THREE.SphereGeometry(0.125, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P_STEEL_DK, sh, [s * 0.32, 0.945, 0], {
      scale: [1, 0.8, 1.05],
    });
    put(tor(0.142, 0.014, 5, 14), P_GOLD, sh, [s * 0.32, 0.9, 0], { dir: [0, 1, 0], axis: "z", scale: [1, 1, 1] });
    b.spike([s * 0.34, 1.0, 0], [s * 0.36, 1.1, 0], null, 0.03, P_GOLD, { bone: sh });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      put(sph(0.011, 5, 4), GOLD_HI, sh, [s * 0.32 + 0.142 * Math.cos(a), 0.9, 0.142 * Math.sin(a) * 1.05]);
    }
    // hand
    const H = s > 0 ? [0.39, 0.435, 0.12] : [-0.38, 0.47, 0.18];
    handAt[S] = H;
    put(sph(0.065, 8, 6), P_SKIN, wr, H, { scale: [1, 0.95, 1.1] });
    const fingers = b.joint(`fingers${S}`, {
      parent: wr,
      at: [H[0], H[1] + 0.02, H[2] + 0.04],
      aim: [H[0], H[1] - 0.03, H[2] + 0.09],
      role: "digit",
    });
    const thumb = b.joint(`thumb${S}`, {
      parent: wr,
      at: [H[0] - s * 0.045, H[1] + 0.03, H[2]],
      aim: [H[0] - s * 0.035, H[1] + 0.03, H[2] + 0.09],
      role: "digit",
    });
    for (let i = 0; i < 4; i++) {
      const z = H[2] - 0.045 + i * 0.032;
      b.capsule([H[0] + s * 0.055, H[1] - 0.035, z], [H[0] - s * 0.05, H[1] - 0.035, z], 0.017, P_SKIN, { bone: fingers });
    }
    b.capsule([H[0] - s * 0.04, H[1] + 0.03, H[2] - 0.01], [H[0] - s * 0.03, H[1] + 0.03, H[2] + 0.07], 0.02, P_SKIN, {
      bone: thumb,
    });
  }

  // ------------------------------------------------------------ head
  const C = [0, 1.08, 0.06];
  put(sph(1, 10, 8), P_SKIN, head, C, { scale: [0.145, 0.14, 0.15] });
  put(sph(1, 8, 6), P_SKIN, jaw, [0, 1.025, 0.1], { scale: [0.12, 0.06, 0.11] });
  put(box(0.07, 0.012, 0.03), INK, jaw, [0, 1.045, 0.205]);
  put(sph(0.045, 8, 6), "#dd8a6a", head, [0, 1.06, 0.21], { scale: [1, 0.9, 1.1] });
  for (const s of [1, -1]) {
    put(sph(0.06, 8, 6), "#e8957a", head, [s * 0.085, 1.05, 0.15]);
    put(sph(0.03, 6, 5), P_SKIN, head, [s * 0.145, 1.075, 0.04], { scale: [0.5, 1, 0.8] });
    put(tor(0.014, 0.004, 4, 8), P_GOLD, head, [s * 0.15, 1.04, 0.04], { dir: [1, 0, 0], axis: "z" });
    // eyes
    put(sph(0.02, 8, 6), "#f6efe0", head, [s * 0.055, 1.09, 0.195]);
    glow(put(sph(0.012, 6, 5), "#3a8fe0", head, [s * 0.056, 1.09, 0.212]), 0.8);
    put(sph(0.006, 5, 4), INK, head, [s * 0.056, 1.09, 0.222]);
    put(sph(0.003, 4, 3), "#ffffff", head, [s * 0.052, 1.095, 0.224]);
    // brows
    b.sweep(
      catmull([
        [s * 0.012, 1.125, 0.2],
        [s * 0.06, 1.13, 0.2],
        [s * 0.105, 1.12, 0.17],
      ]),
      [0.03, 0.016],
      { bone: head, color: P_BEARD, caps: { start: "round", end: "point" } },
    );
    // mustache
    b.sweep(
      catmull([
        [s * 0.005, 1.095, 0.222],
        [s * 0.06, 1.082, 0.222],
        [s * 0.125, 1.07, 0.19],
        [s * 0.15, 1.1, 0.165],
      ]),
      [0.034, 0.01],
      { bone: head, color: P_BEARD, caps: { start: "round", end: "point" } },
    );
    // sideburn
    b.sweep(
      catmull([
        [s * 0.135, 1.1, 0.11],
        [s * 0.15, 1.05, 0.14],
        [s * 0.13, 1.01, 0.17],
      ]),
      [0.03, 0.04],
      { bone: head, color: P_BEARD },
    );
    // horns
    b.sweep(bezier([s * 0.16, 1.16, 0.06], [s * 0.3, 1.14, 0.04], [s * 0.34, 1.24, 0.06], [s * 0.27, 1.32, 0.1]), [0.035, 0.006], {
      bone: head,
      color: P_BONE,
      bands: [[0.14, P_GOLD]],
      caps: { start: "flat", end: "point" },
    });
    put(tor(0.034, 0.006, 4, 8), P_GOLD, head, [s * 0.2, 1.15, 0.055], { dir: [1, 0, -0.1], axis: "z" });
  }

  // beard
  const beard = b.loft(
    [
      { at: [0, 1.04, 0.15], w: 0.24, h: 0.15 },
      { at: [0, 0.98, 0.2], w: 0.27, h: 0.15 },
      { at: [0, 0.9, 0.225], w: 0.25, h: 0.14 },
      { at: [0, 0.84, 0.235], w: 0.18, h: 0.11 },
      { at: [0, 0.8, 0.235], w: 0.1, h: 0.08 },
    ],
    { bone: head, color: P_BEARD, name: "beard" },
  );
  const beardHits = b.surface(beard).scatter(150, { rng: R, minDist: 0.028, filter: (h) => h.n.z > -0.1 });
  b.cards(beardHits, [STRAND_A, STRAND_B], { size: [0.035, 0.08], lean: 50, bend: 25, vary: 0.3, rng: R, sink: 0.2 });
  for (const s of [1, -1]) {
    const bp = catmull([
      [s * 0.05, 0.84, 0.24],
      [s * 0.07, 0.76, 0.26],
      [s * 0.06, 0.68, 0.265],
      [s * 0.05, 0.6, 0.26],
    ]);
    b.sweep(bp, 0.024, { bone: head, color: BEARD_DK, caps: "round" });
    let k = 0;
    b.along(
      bp,
      10,
      (at) => {
        const sign = k % 2 ? 1 : -1;
        put(sph(0.03, 6, 5), k % 2 ? P_BEARD : hand(BEARD_HI, "#ffc880", BEARD, 12), head, [at.at.x + sign * 0.012, at.at.y, at.at.z + 0.006], {
          scale: [0.85, 1.15, 0.75],
          rotation: [0, 0, sign * 30],
        });
        k++;
      },
      { from: 0.02, to: 0.9 },
    );
    const clasp = bp.at(0.93);
    put(cyl(0.034, 0.034, 0.04, 8), P_GOLD, head, [clasp.x, clasp.y, clasp.z]);
    put(tor(0.034, 0.006, 4, 8), GOLD_HI, head, [clasp.x, clasp.y + 0.02, clasp.z], { dir: [0, 1, 0], axis: "z" });
    b.spike([s * 0.05, 0.6, 0.26], [s * 0.05, 0.5, 0.255], null, 0.03, P_BEARD, { bone: head });
  }
  put(cyl(0.04, 0.04, 0.03, 8), P_GOLD, head, [0, 0.82, 0.235]);

  // helm
  const helmAt = [0, 1.115, 0.06];
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.175, 0.03],
      [0.16, 0.09],
      [0.11, 0.14],
      [0.05, 0.165],
      [0, 0.175],
    ],
    { at: helmAt, bone: head, color: P_STEEL, segments: 12, name: "helm" },
  );
  put(tor(0.172, 0.013, 5, 14), P_GOLD, head, [0, 1.13, 0.06], { dir: [0, 1, 0], axis: "z" });
  put(tor(0.126, 0.009, 4, 12), P_GOLD, head, [0, 1.225, 0.06], { dir: [0, 1, 0], axis: "z" });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    put(sph(0.011, 5, 4), GOLD_HI, head, [0.18 * Math.cos(a), 1.13, 0.06 + 0.18 * Math.sin(a)]);
  }
  b.frustumBox([0, 1.17, 0.225], [0, 1.105, 0.238], [0.025, 0.014], [0.03, 0.014], { bone: head, color: P_STEEL });
  const crestPaint = paint((_p, _n, s) => (s[1] > 0.06 ? RED_HI : s[1] < 0.015 ? GOLD : P_RED));
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.1, 0.05],
      [0.02, 0.09],
      [-0.08, 0.1],
      [-0.14, 0.06],
    ],
    { at: [0, 1.235, 0.03], x: [0, 0, 1], thickness: 0.03, bevel: 0.006, smoothing: 1, color: crestPaint, bone: head },
  );
  b.spike([0, 1.28, 0.06], [0, 1.37, 0.06], null, 0.022, P_GOLD, { bone: head });

  // ------------------------------------------------------------ blunderbuss (held by the right hand)
  const gb = wrist["R"];
  const G = new THREE.Vector3(...handAt["R"]);
  const d = new THREE.Vector3(0, 0.12, 1).normalize();
  const gp = (t: number, dy = 0, dx = 0): number[] => [G.x + dx, G.y + d.y * t + dy, G.z + d.z * t];
  const dv = [d.x, d.y, d.z];

  b.frustumBox(gp(-0.38, -0.07), gp(0, -0.012), [0.05, 0.13], [0.04, 0.06], { color: P_WOOD, bone: gb, name: "stock" });
  put(box(0.054, 0.135, 0.012), P_GOLD, gb, gp(-0.385, -0.07), { dir: dv, axis: "z" });
  put(new THREE.PlaneGeometry(0.13, 0.065), "#ffffff", gb, gp(-0.2, -0.045, -0.026), {
    texture: RUNE,
    dir: [-1, 0, 0],
    axis: "z",
  });
  glow(put(new THREE.OctahedronGeometry(0.014), "#ff4a3a", gb, gp(-0.3, -0.04, -0.027)), 0.8);
  b.frustumBox(gp(0.02, -0.035), gp(0.3, -0.05), [0.06, 0.04], [0.05, 0.035], { color: P_WOOD, bone: gb });
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.036, 0.24],
      [0.055, 0.37],
      [0.095, 0.48],
      [0.072, 0.48],
      [0.044, 0.37],
      [0.031, 0.24],
      [0, 0.24],
    ],
    {
      at: gp(0.02),
      axis: dv,
      bone: gb,
      segments: 10,
      color: gradient(P_STEEL_DK, P_GOLD, gp(0.33), gp(0.37)),
      name: "barrel",
    },
  );
  put(cyl(0.03, 0.03, 0.006, 8), INK, gb, gp(0.268), { dir: dv });
  for (const t of [0.08, 0.2]) put(tor(0.04, 0.008, 4, 10), P_GOLD, gb, gp(t), { dir: dv, axis: "z" });
  put(tor(0.095, 0.007, 4, 12), GOLD_HI, gb, gp(0.5), { dir: dv, axis: "z" });
  b.spike(gp(0.3, 0.034), gp(0.3, 0.064), null, 0.008, P_GOLD, { bone: gb });
  // lock, hammer, trigger guard
  put(box(0.012, 0.05, 0.12), P_STEEL, gb, gp(-0.02, 0.015, -0.026));
  put(box(0.014, 0.025, 0.05), P_GOLD, gb, gp(-0.02, 0.0, -0.028));
  b.rod(gp(-0.07, 0.04, -0.02), gp(-0.04, 0.09, -0.02), 0.011, P_STEEL, { bone: gb });
  b.spike(gp(-0.04, 0.09, -0.02), gp(0.0, 0.1, -0.02), null, 0.012, P_STEEL, { bone: gb });
  b.sweep(catmull([gp(-0.06, -0.04), gp(-0.04, -0.085), gp(0.02, -0.09), gp(0.045, -0.045)]), 0.008, P_GOLD, { bone: gb });
  b.rod(gp(-0.01, -0.03), gp(-0.005, -0.06), 0.006, P_STEEL, { bone: gb });
  // ramrod and pipes
  b.rod(gp(0.04, -0.07), gp(0.4, -0.07), 0.008, P_WOOD, { bone: gb });
  for (const t of [0.08, 0.24]) put(tor(0.013, 0.005, 4, 8), P_GOLD, gb, gp(t, -0.06), { dir: dv, axis: "z" });
  // sling
  b.sweep(catmull([gp(-0.3, -0.07, 0.015), gp(-0.15, -0.2, 0.05), gp(0.2, -0.2, 0.05), gp(0.28, -0.05, 0.03)]), 0.008, P_LEATHER_DK(), {
    bone: gb,
  });

  b.pose(jaw, { axis: [1, 0, 0], deg: 0 });
  return b.root;
}

function P_LEATHER_DK() {
  return LEATHER_DK;
}
