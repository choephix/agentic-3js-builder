import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  lerp,
  limb,
  noise,
  paint,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "High-fantasy anime qilin: jade-scaled deer-bodied chimera with dragon head, glowing branching antlers, cloven gold-and-violet hooves, cloud mane and an ox tail ending in a flame tuft.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; painted surfaces below)
const IVORY = "#fff6dc";
const MOUTH = "#6e1a2c";
const NOSTRIL = "#0b3a40";
const CYAN = "#79f2ff";
const GOLD = "#f5bf3f";
const HOOF = "#3a2748";
const RED = "#d9363e";
const BEAD = "#3fe0b8";
const TINE = "#f8d070";

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const cloudSvg = (top: string, bottom: string, line: string, swirl: string) => `
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${bottom}"/><stop offset="1" stop-color="${top}"/></linearGradient></defs>
  <path d="M32 95 C12 93 2 78 12 64 C2 52 12 36 26 40 C22 24 38 8 52 20 C62 30 58 42 52 48 C64 56 62 76 52 84 C48 91 40 95 32 95 Z"
    fill="url(#g)" stroke="${line}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M34 80 C20 78 20 58 33 58 C43 58 44 70 36 71 C32 71 31 66 34 65" fill="none" stroke="${swirl}" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 42 C30 38 34 26 42 28 C48 30 46 38 42 37" fill="none" stroke="${swirl}" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;

const flameSvg = `
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#ff7a1e"/><stop offset="0.6" stop-color="#ffc83a"/><stop offset="1" stop-color="#fff2a0"/></linearGradient></defs>
  <path d="M32 95 C10 90 4 66 18 48 C18 60 26 64 28 56 C30 40 24 26 36 4 C40 22 60 36 58 64 C57 84 48 94 32 95 Z"
    fill="url(#f)" stroke="#c4421a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 88 C22 84 22 70 30 62 C32 70 40 70 40 78 C40 84 36 88 32 88Z" fill="#fff6c8"/>
</svg>`;

const SWIRL = "M32 34 C26 34 24 28 29 25 C36 22 42 29 39 36 C36 44 24 45 19 38 C13 30 19 18 30 15 C42 12 52 22 50 34 C48 46 38 52 28 51 C20 51 14 56 8 54";
const emblemSvg = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="${SWIRL}" fill="none" stroke="#0b4a52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${SWIRL}" fill="none" stroke="#ffc83a" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${SWIRL}" fill="none" stroke="#fff4b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="34" r="2.6" fill="#7ff3ff"/>
</svg>`;

const markSvg = `
<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 62 C10 56 8 40 18 30 C14 22 22 14 24 2 C30 14 40 24 34 34 C42 42 38 56 24 62Z" fill="#ffcf4a" stroke="#7a2e1a" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M24 54 C18 50 18 42 24 36 C30 42 30 50 24 54Z" fill="#e9382f"/>
</svg>`;

// ---------------------------------------------------------------------------------------------------------------
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const add = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(V(x, y, z));

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  type Surf = ReturnType<typeof b.surface>;

  // ---- paints ----------------------------------------------------------------------------------------------
  const SCALE_BACK = scales(["#1fa392", "#27b59f", "#198f86"], "#0b4a52", { size: 0.055, width: 0.2, seed: 3 });
  const SCALE_BELLY = scales(["#f7e8b8", "#f0d98e"], "#c08a3a", { size: 0.055, width: 0.18, seed: 4 });
  const SCALE_GOLD = scales(["#f7c54a", "#eeb236"], "#8a5516", { size: 0.055, width: 0.18, seed: 3 });
  const BASE_COAT = countershade(SCALE_BACK, SCALE_BELLY, { level: -0.2, soft: 0.3 });
  const COAT = cel(paint((p, n) => (p.y > 0.8 && n.y > -0.2 && noise(p, 0.22, 9) > 0.66 ? SCALE_GOLD : BASE_COAT)));
  const SOCK = cel(scales(["#f8ebc0", "#f0d890"], "#b98a3c", { size: 0.04, width: 0.16, seed: 8 }));
  const LEG = furEdge(COAT, SOCK, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.45,
    teeth: 0.06,
    period: 0.05,
    along: [1, 0, 1],
    ink: INK,
  });
  const HEADP = cel(
    countershade(
      scales(["#22b09b", "#2cc0a8", "#1a9288"], "#0b4a52", { size: 0.035, width: 0.2, seed: 5 }),
      scales(["#f7e8b8", "#f0d98e"], "#c08a3a", { size: 0.035, seed: 6 }),
      { level: -0.35, soft: 0.2 },
    ),
  );
  const GOLDP = cel(GOLD, "#c27a1c");

  // ---- textures ----------------------------------------------------------------------------------------------
  const CLOUD_W = svg(cloudSvg("#ffffff", "#8fe6e6", "#1e8c95", "#5cc6cf"), { size: 192 });
  const CLOUD_G = svg(cloudSvg("#fff3c4", "#f2b93b", "#a8601a", "#d98a24"), { size: 192 });
  const FLAME = svg(flameSvg, { size: 192 });
  const EMBLEM = svg(emblemSvg, { size: 256 });
  const MARK = svg(markSvg, { size: 128 });
  const EYE = animeEye({ iris: "#ffb21f", size: 384 });

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, -0.5], dir: [0, 0, 1], role: "spine" });
  const SP = [
    [0, 1.0, -0.5],
    [0, 1.03, -0.15],
    [0, 1.07, 0.2],
    [0, 1.12, 0.5],
  ];
  const spine = b.chain("spine", catmull(SP), { parent: hips, role: "spine" });
  const NP = [
    [0, 1.12, 0.5],
    [0, 1.3, 0.66],
    [0, 1.48, 0.82],
    [0, 1.62, 0.98],
  ];
  const neck = b.chain("neck", catmull(NP), { parent: spine, role: "neck" });
  const head = b.joint("head", { parent: neck, at: NP[3], dir: [0, 0, 1], role: "head" });
  const hp = (x: number, y: number, z: number) => head.local({ left: x, up: y, forward: z });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.05, 0.03), aim: hp(0, -0.05, 0.4), role: "jaw" });
  const TP = [
    [0, 1.02, -0.55],
    [0, 1.0, -0.8],
    [0, 0.9, -1.02],
    [0, 0.75, -1.14],
    [0, 0.58, -1.18],
  ];
  const tail = b.chain("tail", catmull(TP), { parent: hips, role: "tail" });

  // ---- torso and neck ----------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.99, -0.7], w: 0.26, h: 0.3 },
      { at: SP[0], w: 0.42, h: 0.5 },
      { at: SP[1], w: 0.4, h: 0.5 },
      { at: SP[2], w: 0.45, h: 0.55 },
      { at: SP[3], w: 0.4, h: 0.5 },
      { at: [0, 1.2, 0.64], w: 0.28, h: 0.34 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  const neckS = b.sweep(neck, [0.17, 0.15, 0.12, 0.095], { color: COAT });
  b.sweep(tail, [0.07, 0.055, 0.045, 0.04, 0.035], { color: COAT });

  // back ridge: gold plates
  b.along(
    body,
    11,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.05, 0.14, 4), GOLDP, at, { embed: 0.25, scale: [0.35, 1, 1], flow: [0, 0, 1] });
    },
    { from: 0.1, to: 0.88 },
  );
  // tail ridge
  for (let i = 0; i < 4; i++) {
    const at = tail.at(0.1 + i * 0.2);
    b.part(new THREE.ConeGeometry(0.03, 0.08, 4), GOLDP, {
      at: at.at.clone().add(V(0, 0.04, 0)),
      bone: tail.joints[Math.min(i, tail.joints.length - 1)],
      scale: [0.4, 1, 1],
    });
  }

  // flank emblems
  for (const s of [1, -1]) {
    glow(
      b.decal(body, EMBLEM, { at: [s * 0.22, 1.02, 0.0], dir: [s, 0, 0], size: [0.32, 0.32], mirror: s < 0 }),
      0.8,
    );
  }

  // ---- collar and bell ---------------------------------------------------------------------------------------
  const neckSurf = b.surface(neckS);
  const collar = neckSurf.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.017, { color: GOLD });
  b.along(collar, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.022, 6, 5), BEAD, { at, flat: true });
  });
  const bp = collar.at(0.5);
  const bellAt = add(bp, 0, -0.04, 0.01);
  b.part(new THREE.SphereGeometry(0.042, 8, 6), GOLD, { bone: neck.joints[1], at: bellAt, flat: true });
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.02, 8), "#8a5516", {
    bone: neck.joints[1],
    at: add(bellAt, 0, -0.04, 0),
  });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), "#8a5516", { bone: neck.joints[1], at: add(bellAt, 0, -0.056, 0) });
  b.rod(add(bellAt, 0, 0.03, 0), add(bp, 0, 0, 0), 0.007, GOLD, { bone: neck.joints[1] });
  b.spike(add(bellAt, 0.03, -0.01, 0.02), [0, -1, 0], 0.13, 0.014, { color: RED, bone: neck.joints[1] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), RED, { bone: neck.joints[1], at: add(bellAt, 0.03, -0.012, 0.02) });

  // ---- head ----------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    bone: head,
    at: hp(0, 0.03, 0.1),
    scale: [0.12, 0.115, 0.15],
  });
  const skin: Surf = b.surface(skull);
  const hitAt = (az: number, el: number) => {
    const h = skin.around(skull.at).at(az, el);
    if (!h) throw new Error(`skull: no hit at ${az}, ${el}`);
    return h;
  };

  // snout, nose, jaws
  b.frustumBox(hp(0, 0.0, 0.14), hp(0, -0.005, 0.44), [0.15, 0.11], [0.14, 0.085], { bone: head, color: HEADP });
  b.frustumBox(hp(0, -0.005, 0.43), hp(0, -0.008, 0.5), [0.14, 0.085], [0.17, 0.07], { bone: head, color: HEADP });
  b.frustumBox(hp(0, -0.05, 0.1), hp(0, -0.05, 0.42), [0.1, 0.012], [0.09, 0.012], { bone: head, color: MOUTH });
  b.frustumBox(hp(0, -0.072, 0.06), hp(0, -0.078, 0.43), [0.13, 0.05], [0.12, 0.04], { bone: jaw, color: HEADP });
  b.frustumBox(hp(0, -0.06, 0.12), hp(0, -0.062, 0.34), [0.075, 0.02], [0.06, 0.016], { bone: jaw, color: "#e0556a" });
  b.spike(hp(0, 0.035, 0.4), [0, 1, 0.5], 0.07, 0.02, { bone: head, color: GOLD });
  for (let i = 0; i < 3; i++) {
    const pos = lerp(hp(0, 0.075, 0.2), hp(0, 0.06, 0.34), (i + 0.5) / 3);
    b.spike(pos, [0, 1, 0.6], 0.045 - i * 0.008, 0.013, { bone: head, color: GOLD });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), NOSTRIL, { bone: head, at: hp(s * 0.05, 0.012, 0.505), scale: [1, 0.8, 0.8] });
    // upper teeth, lower teeth and fangs
    for (const z of [0.2, 0.26, 0.32]) {
      b.spike(hp(s * 0.056, -0.05, z), [0, -1, 0], 0.028, 0.009, { bone: head, color: IVORY });
      b.spike(hp(s * 0.05, -0.052, z + 0.02), [0, 1, 0], 0.026, 0.009, { bone: jaw, color: IVORY });
    }
    b.spike(hp(s * 0.062, -0.045, 0.37), [0, -1, 0], 0.07, 0.015, { bone: head, color: IVORY });
    b.spike(hp(s * 0.054, -0.055, 0.39), [0, 1, 0], 0.055, 0.013, { bone: jaw, color: IVORY });
  }

  // eyes, brows, forehead gem and mark
  for (const s of [1, -1]) {
    glow(b.decal(skin, EYE, { at: hitAt(s * 60, 6), size: [0.09, 0.122], mirror: s > 0 }), 0.45);
    b.sweep(catmull([hitAt(s * 24, 40), hitAt(s * 44, 38), hitAt(s * 68, 30)]), [0.016, 0.012], {
      bone: head,
      color: GOLDP,
      caps: { end: "point" },
    });
  }
  const brow = hitAt(0, 50);
  b.stick(new THREE.CylinderGeometry(0.03, 0.05, 0.03, 6), GOLDP, brow, { embed: 0.4 });
  glow(b.stick(new THREE.OctahedronGeometry(0.035), CYAN, brow.moved([0, 0.012, 0]), { embed: 0.2, scale: [0.8, 1.4, 0.8] }), 1.4);
  glow(b.decal(skin, MARK, { at: hitAt(0, 26), size: [0.055, 0.075] }), 0.6);

  // ears and cheek frills
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, 0.05],
        [0.16, 0.06],
        [0.26, 0.0, "sharp"],
        [0.15, -0.03],
        [0.07, -0.04],
      ],
      {
        at: hp(s * 0.1, 0.1, -0.02),
        x: [s * 0.7, 0.2, -1],
        y: [0, 1, 0.2],
        thickness: 0.012,
        smoothing: 1,
        color: HEADP,
        bone: head,
      },
    );
    b.extrude(
      [
        [0, 0.05],
        [0.1, 0.09, "sharp"],
        [0.07, 0.03],
        [0.18, 0.0, "sharp"],
        [0.08, -0.03],
        [0.15, -0.1, "sharp"],
        [0.03, -0.07],
        [0, -0.04],
      ],
      {
        at: hp(s * 0.1, -0.02, 0.06),
        x: [s * 0.9, 0, -0.6],
        y: [0, 1, 0],
        thickness: 0.01,
        color: GOLDP,
        bone: head,
      },
    );
  }

  // whiskers
  for (const s of [1, -1]) {
    for (const k of [0, 1]) {
      const dy = -k * 0.05;
      const w = catmull([
        hp(s * 0.07, -0.01 + dy * 0.3, 0.42),
        hp(s * 0.15, -0.04 + dy, 0.36),
        hp(s * 0.28, -0.03 + dy, 0.2),
        hp(s * 0.42, -0.1 + dy, 0.02),
        hp(s * 0.5, -0.08 + dy, -0.15),
      ]);
      b.sweep(w, [0.01 - k * 0.003, 0.002], { bone: head, color: GOLD, caps: { end: "point" } });
      if (k === 0) glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), CYAN, { bone: head, at: hp(s * 0.5, -0.08, -0.15) }), 1.2);
    }
  }

  // antlers
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const root = hitAt(s * 30, 58);
    const p0 = root.at.clone();
    const beam = catmull([
      p0,
      add(p0, s * 0.03, 0.12, -0.05),
      add(p0, s * 0.08, 0.26, -0.14),
      add(p0, s * 0.11, 0.4, -0.27),
      add(p0, s * 0.09, 0.52, -0.42),
    ]);
    b.stick(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 8), GOLDP, root, { embed: 0.3 });
    b.sprout(`antler${tag}`, root, beam, [0.036, 0.012], {
      count: 0,
      color: gradient("#a63a24", "#ffd77a", beam.at(0), beam.at(0.55)),
    });
    const tines = [
      { t: 0.3, up: 0.35, fw: 0.8, len: 0.2, side: 0.3 },
      { t: 0.52, up: 0.5, fw: 0.75, len: 0.18, side: 0.3 },
      { t: 0.74, up: 0.6, fw: 0.5, len: 0.15, side: 0.3 },
      { t: 0.58, up: 0.4, fw: -0.8, len: 0.2, side: 0.4 },
    ];
    for (const T of tines) {
      const base = beam.at(T.t);
      const tan = beam.tangentAt(T.t);
      const dir = V(s * T.side, T.up, T.fw).normalize();
      const tip = base.clone().addScaledVector(dir, T.len);
      const ctrl = base.clone().addScaledVector(tan, T.len * 0.45).addScaledVector(dir, T.len * 0.2);
      b.sweep(bezier(base, ctrl, tip), [0.017, 0.003], { bone: head, color: TINE, caps: { start: "flat", end: "point" } });
      glow(b.part(new THREE.IcosahedronGeometry(0.018, 0), CYAN, { bone: head, at: tip }), 1.2);
    }
    glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), CYAN, { bone: head, at: add(beam.at(1), 0, 0.02, -0.02) }), 1.5);
  }

  // ---- mane of clouds ---------------------------------------------------------------------------------------
  const maneFrames: ReturnType<typeof neckS.at>[] = [];
  for (const [ang, count, t0, t1] of [
    [0, 9, 0.02, 0.98],
    [38, 7, 0.05, 0.9],
    [-38, 7, 0.05, 0.9],
  ] as const) {
    for (let i = 0; i < count; i++) maneFrames.push(neckS.at(t0 + ((t1 - t0) * (i + 0.5)) / count, ang));
  }
  b.cards(maneFrames, [CLOUD_W, CLOUD_W, CLOUD_G], {
    size: [0.2, 0.28],
    lean: 62,
    flow: [0, -0.2, -1],
    bend: 35,
    vary: 0.35,
    spin: 15,
    rng: rng(11),
  });
  const napeFrames = [];
  for (const az of [150, 180, 210]) for (const el of [35, 55]) napeFrames.push(hitAt(az, el));
  b.cards(napeFrames, [CLOUD_W, CLOUD_G], {
    size: [0.14, 0.2],
    lean: 60,
    flow: [0, -0.3, -1],
    bend: 30,
    vary: 0.3,
    rng: rng(12),
    bone: head,
  });
  // shoulder and haunch clouds
  const bodyFrames = [];
  for (const s of [1, -1])
    for (const t of [0.2, 0.78]) bodyFrames.push(body.at(t, s * 75));
  b.cards(bodyFrames, [CLOUD_W, CLOUD_G], {
    size: [0.18, 0.26],
    lean: 75,
    flow: [0, -0.3, -1],
    bend: 30,
    vary: 0.25,
    rng: rng(13),
  });

  // flame goatee
  const beardFrames = [0, 1, 2, 3].map((i) => frame(hp(0, -0.1, 0.08 + i * 0.09), [0, 1, 0]));
  glow(
    b.cards(beardFrames, FLAME, {
      size: [0.07, 0.17],
      lean: 165,
      flow: [0, 0, -1],
      bend: 15,
      vary: 0.2,
      rng: rng(14),
      bone: jaw,
      cross: true,
    }),
    0.9,
  );

  // ---- tail tuft -----------------------------------------------------------------------------------------------
  const tailEnd = tail.at(1);
  b.cards(b.ring(tailEnd, { count: 7, radius: 0.03 }).items, [CLOUD_W, CLOUD_G], {
    size: [0.16, 0.3],
    lean: 45,
    flow: [0, -1, -0.3],
    bend: 25,
    vary: 0.25,
    rng: rng(15),
  });
  glow(b.cards([tailEnd], FLAME, { size: [0.22, 0.4], lean: 0, cross: true }), 1);

  // ---- legs ----------------------------------------------------------------------------------------------------
  const makeLeg = (kind: "fore" | "hind", s: number) => {
    const tag = s > 0 ? "L" : "R";
    const fore = kind === "fore";
    const root = fore ? [s * 0.18, 1.0, 0.45] : [s * 0.19, 1.0, -0.52];
    const foot = fore ? [s * 0.18, 0.1, 0.5] : [s * 0.19, 0.1, -0.66];
    const lengths = fore ? [0.34, 0.33, 0.3] : [0.4, 0.38, 0.3];
    const bends = fore
      ? [
          [0, 0, -1],
          [0, 0, 1],
        ]
      : [
          [0, 0, 1],
          [0, 0, -1],
        ];
    const pts = limb(root, foot, lengths, bends);
    const names = fore
      ? [`shoulder${tag}`, `elbow${tag}`, `knee${tag}`, `hoofF${tag}`]
      : [`hip${tag}`, `stifle${tag}`, `hock${tag}`, `hoofH${tag}`];
    const leg = b.chain(`leg${fore ? "F" : "H"}${tag}`, pts, {
      parent: fore ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, fore ? [0.085, 0.07, 0.05, 0.036, 0.03] : [0.1, 0.085, 0.045, 0.035, 0.03], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, {
      bone: leg.joints[0],
      at: root,
      scale: fore ? [0.11, 0.16, 0.14] : [0.12, 0.17, 0.17],
    });
    const hoofJ = leg.joints[leg.joints.length - 1];
    // knee / hock knob and greave ring
    b.part(new THREE.SphereGeometry(0.045, 7, 5), GOLDP, { bone: leg.joints[2], at: pts[2], flat: true });
    b.part(new THREE.TorusGeometry(0.042, 0.011, 5, 9), GOLDP, {
      bone: leg.joints[2],
      at: add(pts[2], 0, -0.07, 0),
      dir: [0, 1, 0],
      axis: "z",
    });
    // elbow / hock cloud
    b.cards([frame(pts[fore ? 1 : 2], [0, 0, -1])], CLOUD_W, {
      size: [0.1, 0.15],
      lean: 25,
      flow: [0, -1, -0.3],
      bend: 20,
      bone: leg.joints[fore ? 1 : 2],
    });
    // fetlock ring, tuft, cloven hoof
    b.part(new THREE.TorusGeometry(0.038, 0.009, 5, 9), GOLD, { bone: hoofJ, at: add(V(pts[3].x, pts[3].y, pts[3].z), 0, 0.02, 0), dir: [0, 1, 0], axis: "z" });
    b.cards(b.ring(frame(pts[3], [0, 1, 0]), { count: 6, radius: 0.04 }).items, [CLOUD_G, CLOUD_W], {
      size: [0.07, 0.12],
      lean: 80,
      flow: [0, -1, 0],
      vary: 0.2,
      rng: rng(fore ? 21 : 22),
      bone: hoofJ,
    });
    for (const dx of [-0.025, 0.025]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.1, 6), HOOF, {
        bone: hoofJ,
        at: [foot[0] + dx, 0.05, foot[2] + 0.005],
        flat: true,
      });
    }
    b.spike([foot[0], 0.115, foot[2] - 0.035], [0, -0.5, -1], 0.04, 0.011, { bone: hoofJ, color: GOLD });
    return leg;
  };
  for (const s of [1, -1]) {
    makeLeg("fore", s);
    makeLeg("hind", s);
  }

  // slight open jaw for a readable rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });

  return b.root;
}
