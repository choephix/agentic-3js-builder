// Red panda balancing on a mossy ruin stone: Genshin Impact style (toon kit cel paints, anime eyes, gold filigree,
// dendro glow motifs).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Mossy-Stone Red Panda",
  description:
    "A red panda balancing on a mossy ruin stone, tail up for balance: cel-shaded coat with zig-zag fur edges, big anime eyes, a gold-trimmed teal collar with a glowing dendro pendant, glowing runes and drifting leaves.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel paints: lit tone + hue-shifted shadow tone)
const RUST = cel("#e8662c");
const AMBER = cel("#f7a443");
const CREAMP = cel("#fff3dc", "#f3d2b6");
const CHESTNUT = cel("#4d231c", "#2e1417");
const LEG = cel("#38191b", "#21101a");
const TAIL_A = cel("#f58f3c");
const TAIL_B = cel("#a8381f", "#7c2420");
const EAR_BACK = cel("#5d2619", "#3b1618");
const EYE_PATCH = cel("#6d2b1d", "#4a1c1c");
const TEAR = cel("#7a3220", "#53201d");
const TEAL = cel("#19bfae", "#1388a4");
const MOSS_LIT = cel(mottle("#9fe24d", "#6cc43b", { size: 0.07, seed: 4 }));
const STONE_P = cel(mottle("#b6bfd0", "#949fbc", { size: 0.13, seed: 2, contrast: 1.4 }));
const CRACK = cel("#6d799b", "#545f8a");
const GOLD = "#f0bd3e";
const GOLD_DK = "#b97f22";
const NOSE = "#1c1020";
const WHITE = "#fffaf0";
const CLAW = "#e3d4ba";
const PINK = "#ff8497";

// Body coat: amber saddle, rust flanks, chestnut belly with inked zig-zag edges.
const SADDLE = furEdge(AMBER, RUST, { level: 0.52, teeth: 0.22, period: 0.034 });
const COAT = furEdge(SADDLE, CHESTNUT, { level: -0.26, teeth: 0.22, period: 0.03, ink: INK, inkWidth: 0.05 });
const LEG_COAT = furEdge(RUST, LEG, { by: "position", axis: [0, 1, 0], level: 0.285, teeth: 0.03, period: 0.022, along: [1, 0, 0] });

// Tail: zig-zag rings, dark tip.
const TAIL_RINGS = paint((_p, _n, s) => {
  if (s[0] > 0.93) return TAIL_B;
  const k = Math.floor(s[0] * 9 + 0.24 * zigzag(s[1] / 38));
  return k % 2 === 0 ? TAIL_A : TAIL_B;
});

// Head markings, read in skull-local normalised coordinates.
const HC = [0, 0.455, 0.335] as const;
const HR = [0.088, 0.074, 0.078] as const;
const HEAD_COAT = paint((p, _n) => {
  const x = Math.abs(p.x - HC[0]) / HR[0];
  const y = (p.y - HC[1]) / HR[1];
  const z = (p.z - HC[2]) / HR[2];
  if (z > 0.1) {
    const ex = x - 0.53;
    const ey = y - 0.08;
    if (ex * ex + ey * ey * 0.9 < 0.15) return EYE_PATCH;
    if (ey < -0.2 && ey > -1.0 && Math.abs(x - (0.53 + -ey * 0.12)) < 0.065) return TEAR;
    const bx = x - 0.5;
    const by = y - 0.55;
    if (bx * bx + by * by * 1.5 < 0.05) return CREAMP;
  }
  if (y < -0.06 + 0.12 * zigzag(x * 3.2) && z > -0.4) return CREAMP;
  return y > 0.5 ? AMBER : RUST;
});

// Stone: moss wherever it faces up (ragged edge, inked), cracks and mottling elsewhere.
const mossMask = (p: THREE.Vector3, n: THREE.Vector3) => n.y * 0.9 + 1.1 * (noise(p, 0.1, 5) - 0.5) + (p.y - 0.12) * 2.6;
const STONE = paint((p, n) => {
  const m = mossMask(p, n);
  if (m > 0.55) return MOSS_LIT;
  if (m > 0.5) return "#3f7a2e";
  const c = cells(p, 0.16, 7);
  if (c.d2 - c.d1 < 0.05) return CRACK;
  return STONE_P;
});

const outline = (pts: number[][]) => pts.map(([x, y]) => [x, y] as OutlinePoint);

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const R = rng(11);

  // --- Textures --------------------------------------------------------------------------------------------------
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 1 C21 20 31 38 29 63 L3 63 C1 40 11 20 16 1Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const MOSS = svg(
    `<svg viewBox="0 0 64 40">
      <path d="M2 40 C4 26 8 14 12 2 C17 14 19 28 22 40Z" fill="#6fc23a"/>
      <path d="M16 40 C20 22 24 12 30 0 C35 12 37 26 40 40Z" fill="#8ad94a"/>
      <path d="M30 40 C34 24 40 12 48 4 C49 16 50 28 54 40Z" fill="#5fae34"/>
      <path d="M44 40 C48 28 54 18 61 10 C61 22 61 32 64 40Z" fill="#a8ea62"/>
      <path d="M8 40 C11 30 14 22 20 14 C21 24 22 32 26 40Z" fill="#b6f070"/>
      <rect x="0" y="35" width="64" height="5" fill="#4f9a30"/>
    </svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 32 44">
      <path d="M16 44 L16 18" stroke="#4aa83a" stroke-width="3" fill="none"/>
      <ellipse cx="9" cy="32" rx="6" ry="3" fill="#5fc247" transform="rotate(-30 9 32)"/>
      <ellipse cx="23" cy="36" rx="6" ry="3" fill="#4aa83a" transform="rotate(30 23 36)"/>
      <g fill="#ffd9f3" stroke="#e48ac6" stroke-width="1.2">
        <ellipse cx="16" cy="6.5" rx="4.6" ry="6.5"/>
        <ellipse cx="16" cy="6.5" rx="4.6" ry="6.5" transform="rotate(72 16 14)"/>
        <ellipse cx="16" cy="6.5" rx="4.6" ry="6.5" transform="rotate(144 16 14)"/>
        <ellipse cx="16" cy="6.5" rx="4.6" ry="6.5" transform="rotate(216 16 14)"/>
        <ellipse cx="16" cy="6.5" rx="4.6" ry="6.5" transform="rotate(288 16 14)"/>
      </g>
      <circle cx="16" cy="14" r="3.6" fill="#ffd54a" stroke="#d99a1e" stroke-width="1"/>
    </svg>`,
    { size: 128 },
  );
  const FERN = svg(
    `<svg viewBox="0 0 40 64">
      <path d="M20 64 C19 44 21 24 22 2" stroke="#3f8f33" stroke-width="2.4" fill="none"/>
      <g fill="#58b843">
        <path d="M20 58 C12 56 6 50 2 44 C10 46 16 50 20 54Z"/><path d="M20 58 C28 56 34 50 38 44 C30 46 24 50 20 54Z"/>
        <path d="M20.5 46 C13 44 8 38 4 32 C12 34 17 38 20.5 42Z"/><path d="M20.5 46 C28 44 33 38 37 32 C29 34 24 38 20.5 42Z"/>
        <path d="M21 34 C15 32 11 27 8 21 C14 23 18 27 21 30Z"/><path d="M21 34 C27 32 31 27 34 21 C28 23 24 27 21 30Z"/>
        <path d="M21.5 22 C17 20 14 16 12 11 C17 13 20 16 21.5 19Z"/><path d="M21.5 22 C26 20 29 16 31 11 C26 13 23 16 21.5 19Z"/>
        <path d="M22 10 C20 6 21 3 22 1 C23 3 24 6 22 10Z"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 16 48">
      <path d="M8 40 C6 26 3 14 2 2 C6 14 8 26 8 40Z" fill="#f2c24a"/>
      <path d="M8 40 C8 26 10 14 14 2 C13 14 10 26 8 40Z" fill="#d99a2b"/>
      <path d="M8 40 C7 24 7 12 8 0 C9 12 9 24 8 40Z" fill="#ffd96a"/>
      <rect x="4" y="38" width="8" height="8" rx="2" fill="#f0bd3e" stroke="#b97f22" stroke-width="1"/>
    </svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 64" fill="none" stroke="#9dffb4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="27"/>
      <circle cx="32" cy="32" r="22" stroke-width="1.6" stroke-dasharray="3 5"/>
      <path d="M32 13 C45 23 45 43 32 53 C19 43 19 23 32 13Z"/>
      <path d="M32 18 L32 56 M32 30 L40 24 M32 38 L24 32 M32 46 L40 40"/>
    </svg>`,
    { size: 256 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 96 64" fill="none" stroke="#f0bd3e" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="90" height="58" rx="9" stroke-width="3.4"/>
      <rect x="8" y="8" width="80" height="48" rx="6" stroke="#b97f22" stroke-width="1.8"/>
      <path d="M8 22 C16 22 18 14 12 12 M88 22 C80 22 78 14 84 12 M8 42 C16 42 18 50 12 52 M88 42 C80 42 78 50 84 52" stroke-width="2.4"/>
      <path d="M40 8 L48 3 L56 8 M40 56 L48 61 L56 56" stroke-width="2.4"/>
      <circle cx="48" cy="3.6" r="2.6" fill="#f0bd3e" stroke="none"/><circle cx="48" cy="60.4" r="2.6" fill="#f0bd3e" stroke="none"/>
    </svg>`,
    { size: 384 },
  );
  const EYE = animeEye({ iris: "#2fd8a6", blush: "#ff9db3", brow: false });

  // --- Skeleton --------------------------------------------------------------------------------------------------
  const base = b.joint("base", { at: [0, 0.2, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.385, -0.17], dir: [0, 0.04, 1], role: "spine" });
  const spinePath = catmull([
    [0, 0.385, -0.17],
    [0, 0.392, -0.06],
    [0, 0.4, 0.06],
    [0, 0.408, 0.18],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const chest = spine.joints[3];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.408, 0.18],
      [0, 0.425, 0.235],
      [0, 0.445, 0.285],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.445, 0.285], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.03 }),
    aim: head.local({ forward: 0.14, down: 0.042 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.385, -0.21],
      [0, 0.385, -0.3],
      [0, 0.41, -0.42],
      [0, 0.49, -0.5],
      [0, 0.6, -0.52],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  // --- Stone -----------------------------------------------------------------------------------------------------
  const baseRock = b.extrude(
    outline([
      [-0.2, 0.4],
      [0.12, 0.43],
      [0.27, 0.3],
      [0.3, 0.05],
      [0.26, -0.22],
      [0.14, -0.4],
      [-0.12, -0.42],
      [-0.27, -0.3],
      [-0.31, -0.02],
      [-0.28, 0.24],
    ]),
    {
      at: [0, 0.058, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.12,
      bevel: 0.03,
      smoothing: 1,
      color: STONE,
      bone: base,
      name: "baseRock",
    },
  );
  const mainRock = b.extrude(
    outline([
      [-0.13, 0.3],
      [0.06, 0.33],
      [0.15, 0.24],
      [0.18, 0.05],
      [0.16, -0.18],
      [0.09, -0.3],
      [-0.08, -0.31],
      [-0.17, -0.22],
      [-0.19, 0],
      [-0.17, 0.2],
    ]),
    {
      at: [0, 0.125, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.15,
      bevel: 0.025,
      smoothing: 1,
      color: STONE,
      bone: base,
      name: "mainRock",
    },
  );
  const pebbleSpecs: number[][] = [
    [0.31, 0.2, 0.07, 0.05, 0.06],
    [-0.33, 0.1, 0.06, 0.045, 0.07],
    [0.2, -0.42, 0.08, 0.05, 0.06],
    [-0.18, 0.47, 0.06, 0.04, 0.05],
    [0.3, -0.25, 0.045, 0.035, 0.045],
    [0.18, 0.48, 0.04, 0.03, 0.04],
    [-0.3, -0.34, 0.05, 0.04, 0.05],
    [-0.05, -0.49, 0.05, 0.035, 0.04],
  ];
  const pebbles = pebbleSpecs.map(([x, z, sx, sy, sz], i) =>
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      at: [x, sy - 0.006, z],
      scale: [sx, sy, sz],
      rotation: [0, i * 47, 0],
      bone: base,
      flat: true,
      name: `pebble${i}`,
    }),
  );
  const rocks = [baseRock, mainRock, ...pebbles];
  const rockSurface = b.surface(rocks);
  const mainSurface = b.surface(mainRock);
  const baseSurface = b.surface(baseRock);

  // Moss tufts on every upward face, hanging moss down the upper walls.
  const mossHits = [
    ...mainSurface.scatter(80, { rng: R, minDist: 0.03, filter: (h) => h.n.y > 0.5 && mossMask(h.at, h.n) > 0.65 }),
    ...baseSurface.scatter(80, { rng: R, minDist: 0.032, filter: (h) => h.n.y > 0.5 && mossMask(h.at, h.n) > 0.65 }),
  ];
  b.cards(mossHits, MOSS, { size: [0.056, 0.036], vary: 0.35, spin: 180, cross: true, rng: R, bone: base });
  const wallHits = mainSurface.scatter(44, {
    rng: R,
    minDist: 0.034,
    filter: (h) => h.n.y < 0.45 && h.n.y > -0.3 && h.at.y > 0.15 && mossMask(h.at, h.n) > 0.6,
  });
  b.cards(
    wallHits.map((h) => frame(h.at.addScaledVector(h.n, 0.004), [0, 1, 0])),
    MOSS,
    { size: [0.04, 0.05], lean: 180, flow: (_f, i) => wallHits[i].n, vary: 0.3, rng: R, bone: base },
  );
  const pebbleMoss = b
    .surface(pebbles)
    .scatter(20, { rng: R, minDist: 0.03, filter: (h) => h.n.y > 0.5 });
  b.cards(pebbleMoss, MOSS, { size: [0.04, 0.026], vary: 0.3, spin: 180, cross: true, rng: R, bone: base });

  // Plants on the base ledge: flowers, ferns, mushrooms.
  const land = (x: number, z: number) => baseSurface.ray([x, 1, z], [0, -1, 0]);
  const flowerSpots = [
    [0.24, 0.3],
    [-0.23, 0.26],
    [0.27, -0.12],
    [-0.27, -0.1],
    [0.16, -0.36],
    [-0.14, -0.38],
    [0.0, 0.4],
    [-0.12, 0.38],
  ];
  const flowerHits = flowerSpots.flatMap(([x, z]) => {
    const h = land(x, z);
    return h && h.n.y > 0.8 ? [h] : [];
  });
  b.cards(flowerHits, FLOWER, { size: [0.045, 0.062], vary: 0.25, spin: 180, cross: true, rng: R, bone: base });
  const fernHits = [
    [0.2, 0.34],
    [-0.2, 0.32],
    [0.26, -0.2],
    [-0.25, -0.24],
    [0.05, -0.39],
  ].flatMap(([x, z]) => {
    const h = land(x, z);
    return h && h.n.y > 0.8 ? [h] : [];
  });
  b.cards(fernHits, FERN, { size: [0.07, 0.1], vary: 0.25, spin: 180, lean: 25, cross: true, rng: R, bone: base });

  const mushroom = (x: number, z: number, k: number) => {
    const h = land(x, z);
    if (!h) return;
    const top = h.at.clone().add(new THREE.Vector3(0.004 * k, 0.045 * k, 0));
    b.rod(h.at, top, [0.011 * k, 0.008 * k], CREAMP, { sides: 6, bone: base, name: "mushStem" });
    const cap = b.lathe(
      [
        [0, 0],
        [0.034 * k, 0],
        [0.04 * k, 0.012 * k],
        [0.03 * k, 0.028 * k],
        [0.012 * k, 0.04 * k],
        [0, 0.042 * k],
      ],
      { at: top.clone().add(new THREE.Vector3(0, -0.006 * k, 0)), segments: 9, color: cel("#f2799a", "#c9528f"), bone: base, name: "mushCap" },
    );
    const dots = b.surface(cap).scatter(6, { rng: R, minDist: 0.014 * k, filter: (d) => d.n.y > 0.35 });
    for (const d of dots) b.stick(new THREE.SphereGeometry(0.005 * k, 5, 4), WHITE, d, { embed: 0.4, bone: base });
  };
  mushroom(0.25, 0.2, 1.1);
  mushroom(0.29, 0.1, 0.75);
  mushroom(0.22, 0.28, 0.6);
  mushroom(-0.22, -0.3, 0.9);

  // Carved plaques with gold filigree and glowing dendro runes on the stone walls.
  const plaque = (at: [number, number, number], dir: [number, number, number], size: [number, number], target: typeof mainRock) => {
    b.decal(target, PLAQUE, { at, dir, size, lift: 0.003, segments: 14, bone: base, name: "plaque" });
    glow(
      b.decal(target, RUNE, {
        at,
        dir,
        size: [size[1] * 0.62, size[1] * 0.62],
        lift: 0.006,
        segments: 12,
        bone: base,
        name: "rune",
      }),
      1.4,
    );
  };
  plaque([0, 0.1, 0.34], [0, 0, 1], [0.15, 0.1], mainRock);
  plaque([0.19, 0.11, 0.0], [1, 0, 0], [0.14, 0.095], mainRock);
  plaque([-0.2, 0.11, -0.02], [-1, 0, 0], [0.14, 0.095], mainRock);

  // --- Panda body ------------------------------------------------------------------------------------------------
  const body = b.sweep(spine, (t) => [0.08 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.082 + 0.012 * Math.sin(Math.PI * t)], {
    color: COAT,
    sides: 12,
    name: "body",
  });
  const neckTube = b.sweep(neck, () => [0.074, 0.066], { color: COAT, sides: 10, name: "neckTube" });
  const tailTube = b.sweep(tail, [0.05, 0.062, 0.068, 0.066, 0.058, 0.045, 0.03], {
    color: TAIL_RINGS,
    sides: 10,
    name: "tailTube",
  });

  // Fur cards on body and tail, flowing back / toward the tail tip.
  const bodySkin = b.surface(body);
  const furBody = bodySkin.scatter(110, { rng: R, minDist: 0.032, filter: (h) => h.n.y > -0.35 });
  b.cards(furBody, TUFT, { size: [0.028, 0.046], lean: 72, bend: 20, vary: 0.3, spin: 15, rng: R, color: COAT, flow: [0, -0.2, -1] });
  const tailSkin = b.surface(tailTube);
  const furTail = tailSkin.scatter(110, { rng: R, minDist: 0.03 });
  b.cards(furTail, TUFT, {
    size: [0.03, 0.055],
    lean: 74,
    bend: 20,
    vary: 0.3,
    spin: 15,
    rng: R,
    color: TAIL_RINGS,
    flow: (f) => tail.path.tangentAt(tail.path.closestT(f)),
  });

  // --- Legs ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Front leg: elbow tucked back.
    const sh = [s * 0.07, 0.35, 0.14];
    const wr = [s * 0.078, 0.222, 0.158];
    const [f0, f1, f2] = limb(sh, wr, [0.08, 0.075], [0, 0, -1]);
    const foreLeg = b.chain(`foreleg${side}`, catmull([f0, f1, f2, [s * 0.08, 0.214, 0.205]]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(foreLeg, [0.042, 0.032, 0.026, 0.024, 0.021], { color: LEG_COAT, sides: 8, name: `foreleg${side}` });
    // Hind leg: knee forward, plantigrade foot.
    const hp = [s * 0.072, 0.355, -0.14];
    const an = [s * 0.078, 0.225, -0.165];
    const [h0, h1, h2] = limb(hp, an, [0.085, 0.085], [0, 0, 1]);
    const hindLeg = b.chain(`hindleg${side}`, catmull([h0, h1, h2, [s * 0.082, 0.22, -0.095]]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hindLeg, [0.05, 0.036, 0.027, 0.024, 0.022], { color: LEG_COAT, sides: 8, name: `hindleg${side}` });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      at: [s * 0.074, 0.355, -0.135],
      scale: [0.054, 0.07, 0.078],
      bone: hindLeg.joints[0],
      name: `haunch${side}`,
    });

    // Paws with spread toes and pale claws.
    const pawParts = (cx: number, cy: number, cz: number, sx: number, sz: number, bone: (typeof foreLeg.joints)[number]) => {
      b.part(new THREE.SphereGeometry(1, 10, 8), LEG, { at: [cx, cy, cz], scale: [sx, 0.019, sz], bone, name: `paw${side}` });
      const toes: THREE.BufferGeometry[] = [];
      const claws: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 4; i++) {
        const fx = (i - 1.5) * 0.0108;
        const fz = sz * 0.82 + (i === 1 || i === 2 ? 0.003 : 0);
        const tx = cx + fx * 1.05 + (i - 1.5) * 0.0015 * s;
        toes.push(new THREE.SphereGeometry(0.0088, 6, 5).translate(tx, cy - 0.003, cz + fz));
        claws.push(
          new THREE.ConeGeometry(0.0026, 0.013, 5).rotateX(Math.PI / 2 + 0.25).translate(tx, cy - 0.006, cz + fz + 0.01),
        );
      }
      b.part(mergeGeometries(toes)!, LEG, { bone, at: [0, 0, 0], name: `toes${side}` });
      b.part(mergeGeometries(claws)!, CLAW, { bone, at: [0, 0, 0], name: `claws${side}` });
    };
    pawParts(s * 0.08, 0.218, 0.185, 0.027, 0.034, foreLeg.tip!);
    pawParts(s * 0.082, 0.219, -0.118, 0.03, 0.044, hindLeg.tip!);
  }

  // --- Head ------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEAD_COAT, { at: HC, scale: [...HR], bone: head, name: "skull" });
  const skin = b.surface(skull);
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 9), CREAMP, {
    at: [0, 0.435, 0.395],
    scale: [0.042, 0.034, 0.05],
    bone: head,
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [0, 0.447, 0.446], scale: [0.017, 0.012, 0.012], bone: head, name: "nose" });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), WHITE, { at: [0.005, 0.4515, 0.4535], bone: head, name: "noseShine" });
  // Lower jaw, tongue and tiny fangs.
  b.capsule(jaw.at, [0, 0.403, 0.425], [0.033, 0.016], { color: CREAMP, bone: jaw, sides: 8, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { at: [0, 0.409, 0.392], scale: [0.018, 0.006, 0.03], bone: jaw, name: "tongue" });
  for (const s of [1, -1]) {
    b.spike([s * 0.015, 0.414, 0.436], [0, -1, 0.1], 0.014, 0.0045, { color: WHITE, sides: 5, bone: head, name: "fang" });
    b.spike([s * 0.012, 0.396, 0.425], [0, 1, 0.1], 0.012, 0.0035, { color: WHITE, sides: 5, bone: jaw, name: "lowerFang" });
  }
  // Mouth: philtrum and smile, draped on the muzzle.
  const muzzleSkin = b.surface(muzzle);
  b.sweep(muzzleSkin.drape(catmull([[0, 0.438, 0.446], [0, 0.427, 0.443], [0, 0.418, 0.438]]), { lift: 0.0012 }), 0.0014, {
    color: INK,
    sides: 4,
    bone: head,
    name: "philtrum",
  });
  for (const s of [1, -1])
    b.sweep(
      muzzleSkin.drape(
        catmull([
          [0, 0.418, 0.438],
          [s * 0.014, 0.412, 0.433],
          [s * 0.029, 0.413, 0.418],
          [s * 0.036, 0.42, 0.405],
        ]),
        { lift: 0.0012 },
      ),
      0.0014,
      { color: INK, sides: 4, bone: head, name: "smile" },
    );
  // Whiskers.
  for (const s of [1, -1])
    for (const [dy, dz] of [
      [0.35, 0.2],
      [0.0, 0.35],
      [-0.3, 0.5],
    ])
      b.rod([s * 0.034, 0.43, 0.42], [s * 0.115, 0.43 + dy * 0.075, 0.42 + dz * 0.06 - 0.02], 0.0013, WHITE, {
        sides: 4,
        bone: head,
        name: "whisker",
      });
  // Anime eyes.
  for (const s of [1, -1]) {
    const hit = skin.around([...HC]).at(s * 32, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.047, 0.064], mirror: s > 0, lift: 0.002, bone: head, name: "eye" });
  }
  // Cheek ruffs: cream spikes sweeping back.
  for (const s of [1, -1])
    for (const [az, el, len] of [
      [60, -10, 0.05],
      [72, -22, 0.058],
      [84, -34, 0.048],
      [96, -14, 0.04],
    ]) {
      const hit = skin.around([...HC]).at(s * az, el);
      if (hit) b.spike(hit, [s * 0.8, -0.25, -0.5], len, 0.017, { color: CREAMP, sides: 5, bone: head, name: "ruff" });
    }
  // Ears.
  const earShape: OutlinePoint[] = outline([
    [-0.046, 0],
    [-0.05, 0.025],
    [-0.038, 0.06],
    [-0.012, 0.088],
    [0.012, 0.088],
    [0.038, 0.06],
    [0.05, 0.025],
    [0.046, 0],
  ]);
  const EAR = paint((_p, n, s) => {
    if (n.z > 0.55) {
      const w = 0.047 * (1 - Math.pow(Math.max(s[1], 0) / 0.092, 2.2));
      return Math.abs(s[0]) < 0.62 * w && s[1] > 0.012 && s[1] < 0.07 ? CREAMP : RUST;
    }
    return EAR_BACK;
  });
  for (const s of [1, -1]) {
    const ear = b.extrude(earShape, {
      at: [s * 0.062, 0.497, 0.318],
      x: [s, 0, 0],
      y: [s * 0.5, 1, 0.28],
      thickness: 0.018,
      bevel: 0.005,
      smoothing: 1,
      color: EAR,
      bone: head,
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    // Fluffy white fringe in the ear.
    for (const u of [-0.016, 0, 0.016]) {
      const base0 = ear.local([u, 0.016 + (u === 0 ? 0.01 : 0), s > 0 ? 0.009 : -0.009]);
      b.spike(base0, [0, 0.8, 0.5], 0.026, 0.008, { color: CREAMP, sides: 4, bone: head, name: "earTuft" });
    }
  }
  // A little leaf on the head.
  const leaf = b.extrude(
    outline([
      [0, 0],
      [0.02, 0.02],
      [0.03, 0.06],
      [0, 0.11],
      [-0.03, 0.06],
      [-0.02, 0.02],
    ]),
    {
      at: [0.015, 0.521, 0.325],
      x: [1, 0.2, 0],
      y: [0.2, 0.6, 0.8],
      thickness: 0.004,
      smoothing: 1,
      color: cel("#59c441", "#2f9a52"),
      bone: head,
      name: "headLeaf",
    },
  );
  b.rod(leaf.local([0, 0.006, 0.003]), leaf.local([0, 0.095, 0.003]), 0.0016, "#2c8a3a", { sides: 4, bone: head, name: "leafRib" });

  // --- Collar, pendant, tassels ---------------------------------------------------------------------------------
  const collarLine = neck.at(0.5);
  const band = b.ring(collarLine, { count: 14, radius: 0.081 });
  b.sweep(catmull(band.items, { closed: true }), 0.0125, { color: TEAL, sides: 8, name: "collar" });
  for (const dy of [0.0145, -0.0145]) {
    const trim = b.ring(collarLine.moved([0, dy, 0]), { count: 14, radius: 0.0815 });
    b.sweep(catmull(trim.items, { closed: true }), 0.0036, { color: GOLD, sides: 6, name: "collarTrim" });
  }
  for (const item of band.items)
    b.stick(new THREE.SphereGeometry(0.0058, 6, 4), GOLD, item.moved([0, 0.011, 0]), { embed: 0.45, name: "collarStud" });
  const low = band.items.reduce((a, c) => (c.at.y < a.at.y ? c : a));
  const pend = low.at.clone().add(new THREE.Vector3(0, -0.012, 0.004));
  b.part(new THREE.TorusGeometry(0.0085, 0.0028, 6, 10), GOLD, { at: pend, dir: [0, 0, 1], axis: "z", bone: neck.joints[0], name: "pendantRing" });
  b.part(new THREE.OctahedronGeometry(1, 0), GOLD, {
    at: pend.clone().add(new THREE.Vector3(0, -0.031, 0.002)),
    scale: [0.0145, 0.025, 0.007],
    flat: true,
    bone: neck.joints[0],
    name: "pendantFrame",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), "#7dff8e", {
      at: pend.clone().add(new THREE.Vector3(0, -0.031, 0.006)),
      scale: [0.01, 0.019, 0.006],
      flat: true,
      bone: neck.joints[0],
      name: "pendantGem",
    }),
    1.6,
  );
  const tasselRoots = [-0.008, 0, 0.008].map((dx) => frame(pend.clone().add(new THREE.Vector3(dx, -0.055, 0.003)), [0, 1, 0]));
  b.cards(tasselRoots, TASSEL, { size: [0.014, 0.045], lean: 180, flow: [0, 0, 1], cross: true, bone: neck.joints[0] });
  // Ribbon tails along the back of the neck.
  for (const s of [1, -1])
    b.sweep(
      bodySkin.drape(
        catmull([
          [s * 0.012, 0.495, 0.215],
          [s * 0.03, 0.5, 0.15],
          [s * 0.05, 0.495, 0.09],
        ]),
        { lift: 0.0035 },
      ),
      () => [0.011, 0.003],
      { color: TEAL, section: "box", caps: "flat", name: "ribbonTail" },
    );

  // --- Floating dendro motes and leaves ------------------------------------------------------------------------
  const motes: number[][] = [
    [0.2, 0.46, 0.2],
    [-0.22, 0.52, 0.12],
    [0.26, 0.58, -0.1],
    [-0.15, 0.66, -0.3],
    [0.12, 0.7, -0.44],
    [-0.3, 0.38, 0.32],
    [0.32, 0.34, 0.34],
    [0.05, 0.78, -0.62],
    [-0.12, 0.6, 0.3],
    [0.18, 0.64, 0.12],
  ];
  motes.forEach(([x, y, z], i) => {
    const k = 0.7 + 0.5 * R();
    glow(
      b.part(new THREE.OctahedronGeometry(0.011 * k, 0), i % 3 === 0 ? "#d7ff7a" : "#8dff9a", {
        at: [x, y, z],
        rotation: [i * 33, i * 71, 0],
        bone: base,
        flat: true,
        name: "mote",
      }),
      1.4,
    );
  });
  const leafOutline = outline([
    [0, 0],
    [0.014, 0.012],
    [0.018, 0.034],
    [0, 0.058],
    [-0.018, 0.034],
    [-0.014, 0.012],
  ]);
  [
    [0.3, 0.5, 0.0],
    [-0.28, 0.46, 0.0],
    [0.1, 0.56, 0.3],
    [-0.1, 0.74, -0.52],
    [0.2, 0.8, -0.2],
    [-0.32, 0.6, -0.2],
  ].forEach(([x, y, z], i) => {
    glow(
      b.extrude(leafOutline, {
        at: [x, y, z],
        x: [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
        y: [0.3 * Math.sin(i), 1, 0.3 * Math.cos(i)],
        thickness: 0.003,
        smoothing: 1,
        color: "#b5ff8c",
        bone: base,
        name: "floatLeaf",
      }),
      1.3,
    );
  });

  // Rest pose: jaw slightly open.
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  void rockSurface;
  return b.root;
}
