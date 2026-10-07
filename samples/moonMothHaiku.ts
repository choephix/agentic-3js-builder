import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { animeEye, cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Giant Luna Moon Moth",
  description:
    "A giant luna moth at rest on six fluffy legs: mint wings with gold filigree rims and glowing lilac eyespots, feathered antennae, big anime eyes, and a moon pendant hanging from a ribbon bow.",
  style: "whimsical anime mix",
  commit: "b816db2",
};

type V3 = [number, number, number];
type P2 = [number, number];

const DEG = Math.PI / 180;

// Palette: cel-shaded surfaces (lit tone and a hue-shifted shadow tone).
const CREAM = cel("#fff6e4", "#f2dcc0");
const MINT = cel("#b5f2d8", "#93e0c2");
const WING = cel("#c6f7e2", "#b4f0d6", { threshold: -0.3 });
const WING_DEEP = cel("#aeeed5", "#9ae7c8", { threshold: -0.3 });
const VEIN = cel("#8fdcbc", "#7ccfae", { threshold: -0.3 });
const BORDER = cel("#fff0f6", "#f4c4d8");
const ROSE = cel("#ffb4d0", "#ef84ad");
const GOLD = cel("#ffd96e", "#e3a94c");

// Glowing eyespot: dark ring, gold lining, lilac glow, pink heart, cream core.
const EYESPOT = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="31" fill="#2a1450"/>
    <circle cx="32" cy="32" r="27.5" fill="#ffd96e"/>
    <circle cx="32" cy="32" r="25" fill="#d9c8ff"/>
    <circle cx="32" cy="32" r="18" fill="#c9a2ff"/>
    <circle cx="32" cy="32" r="11" fill="#ff8fc7"/>
    <circle cx="32" cy="32" r="5.5" fill="#fff8e0"/>
    <circle cx="29" cy="29" r="1.8" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// Greyscale fluff tuft, tinted by the cards' colour.
const TUFT = svg(
  `<svg viewBox="0 0 32 48">
    <path d="M16 47 C12 34 9 20 13 5" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M16 47 C17 33 20 22 26 11" stroke="#e9e2d4" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M16 47 C15 30 15 18 16 9" stroke="#d6cdbb" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// Wing veins: thin radial lines from the wing root, in wing coordinates (u along the span, v along the chord).
const wingPaint = paint((_p, _n, s) => {
  const u = s[0];
  const v = s[1];
  const r = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  const k = Math.round(a / 0.16);
  if (r > 0.15 && Math.abs(a - k * 0.16) * r < 0.008) return VEIN;
  return r > 0.85 ? WING_DEEP : WING;
});

// Thorax cream fluff; abdomen mint segments with rose rings.
const BODY = paint((_p, _n, s) => {
  const t = s[0];
  if (t < 0.16) return CREAM;
  const k = (t - 0.16) / 0.14;
  const i = Math.floor(k);
  const f = k - i;
  if (f < 0.14) return ROSE;
  return i % 2 ? MINT : CREAM;
});

// Forewing and hindwing outlines in wing coordinates (u = span out from the root, v = chord, + leading edge).
const FORE_RAW: P2[] = [
  [0.0, 0.25],
  [0.3, 0.48],
  [0.7, 0.6],
  [1.0, 0.6],
  [1.24, 0.46],
  [1.36, 0.14],
  [1.26, -0.2],
  [1.04, -0.4],
  [0.72, -0.5],
  [0.42, -0.42],
  [0.12, -0.24],
  [0.0, -0.12],
];
const HIND_RAW: P2[] = [
  [0.0, 0.0],
  [0.45, -0.05],
  [0.84, -0.2],
  [1.02, -0.44],
  [0.96, -0.7],
  [0.66, -0.82],
  [0.34, -0.68],
  [0.06, -0.38],
];

const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

// Wing axes: S runs out along the span (spanDeg above horizontal, on side s); C is the chord, the component of
// `up` square to S, so the wing's leading edge points up and forward.
const wingAxes = (s: number, spanDeg: number, up: V3): { S: V3; C: V3 } => {
  const S = norm([s * Math.cos(spanDeg * DEG), Math.sin(spanDeg * DEG), 0]);
  const k = up[0] * S[0] + up[1] * S[1] + up[2] * S[2];
  const C = norm([up[0] - k * S[0], up[1] - k * S[1], up[2] - k * S[2]]);
  return { S, C };
};

// Smooth closed outline sampled from a catmull through the raw points, scaled about the wing root.
const outline = (raw: P2[], scale: number): P2[] => {
  const path = catmull(
    raw.map(([u, v]): V3 => [u * scale, 0, v * scale]),
    { closed: true },
  );
  return Array.from({ length: 56 }, (_, i) => {
    const p = path.at(i / 56);
    return [p.x, p.z] as P2;
  });
};

// A wing-plane point: u along the span S, v along the chord C.
const wp = (root: V3, S: V3, C: V3, u: number, v: number): V3 => [
  root[0] + u * S[0] + v * C[0],
  root[1] + u * S[1] + v * C[1],
  root[2] + u * S[2] + v * C[2],
];

export default function build() {
  const b = createBuilder({ name: "giantLunaMoth" });

  const wingSet = (
    bone: Joint,
    S: V3,
    C: V3,
    root: V3,
    raw: P2[],
    eyes: [number, number, number][],
  ) => {
    const outer = outline(raw, 1);
    const inner = outline(raw, 0.93);
    // Margin slab in pale pink, then the mint wing with veins on top, thicker so it shows on both faces.
    b.extrude(outer, { at: root, x: S, y: C, thickness: 0.012, bevel: 0.004, color: BORDER, bone });
    b.extrude(inner, { at: root, x: S, y: C, thickness: 0.03, bevel: 0.008, color: wingPaint, bone });
    // Gold filigree rim with beads, following the inner edge.
    const rim = catmull(
      inner.map(([u, v]) => wp(root, S, C, u, v)),
      { closed: true },
    );
    b.sweep(rim, 0.006, { color: GOLD, bone });
    b.along(rim, 24, (at) => {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone, at });
    });
    // Glowing eyespots on both faces of the wing; N is the wing normal (S x C).
    const N = norm([S[1] * C[2] - S[2] * C[1], S[2] * C[0] - S[0] * C[2], S[0] * C[1] - S[1] * C[0]]);
    for (const [u, v, d] of eyes) {
      const c = wp(root, S, C, u, v);
      for (const side of [1, -1]) {
        const at: V3 = [c[0] + N[0] * 0.028 * side, c[1] + N[1] * 0.028 * side, c[2] + N[2] * 0.028 * side];
        const dir: V3 = [N[0] * side, N[1] * side, N[2] * side];
        glow(b.part(new THREE.PlaneGeometry(d, d), "#ffffff", { bone, at, dir, axis: "z", up: C, texture: EYESPOT }), 1.3);
      }
    }
  };

  // Core and body: a spine from the thorax down to the abdomen tip.
  const core = b.joint("core", { at: [0, 0.95, 0], role: "spine" });
  const body = b.chain(
    "body",
    catmull([
      [0, 0.97, 0.12],
      [0, 0.99, -0.08],
      [0, 0.9, -0.34],
      [0, 0.7, -0.62],
      [0, 0.45, -0.86],
      [0, 0.3, -1.02],
    ]),
    { parent: core, names: (i) => `spine${i + 1}`, role: "spine" },
  );
  const bodyTube = b.sweep(body, [0.19, 0.2, 0.16, 0.12, 0.085, 0.045], { color: BODY });

  // Fluffy thorax and abdomen cards.
  b.cards(
    b.surface(bodyTube).scatter(300, {
      rng: rng(5),
      minDist: 0.034,
      filter: (h) => h.n.y > -0.4 && h.at.z > -0.12,
    }),
    TUFT,
    { size: [0.035, 0.065], lean: 30, vary: 0.3, rng: rng(6), color: CREAM },
  );

  // Abdomen fluff: cream tufts on the rear segments.
  b.cards(
    b.surface(bodyTube).scatter(120, {
      rng: rng(8),
      minDist: 0.03,
      filter: (h) => h.at.z < -0.3 && h.n.y > -0.2,
    }),
    TUFT,
    { size: [0.03, 0.05], lean: 35, vary: 0.3, rng: rng(9), color: CREAM },
  );

  // Head: a big round head with anime eyes and a crown of fluff.
  const HEAD_C: V3 = [0, 1.1, 0.3];
  const head = b.joint("head", { parent: core, at: HEAD_C, dir: [0, 0.2, 1], role: "head" });
  const headPart = b.part(new THREE.SphereGeometry(0.2, 24, 16), CREAM, {
    bone: head,
    at: HEAD_C,
    scale: [1, 0.97, 1],
  });
  const headSkin = b.surface(headPart);
  const EYE = animeEye({ iris: "#7a5cff" });
  for (const s of [1, -1]) {
    const hit = headSkin.around(HEAD_C).at(s * 36, 10)!;
    b.decal(headSkin, EYE, { at: hit, size: [0.13, 0.18], mirror: s > 0 });
  }
  b.cards(
    headSkin.scatter(70, { rng: rng(21), minDist: 0.045, filter: (h) => h.n.y > 0.5 }),
    TUFT,
    { size: [0.04, 0.07], lean: 35, vary: 0.3, rng: rng(22), color: CREAM },
  );

  // Bow with two loops, two ribbon tails and a knot, and a crescent moon pendant on a gold bail.
  b.part(new THREE.SphereGeometry(0.03, 8, 6), ROSE, { bone: head, at: [0, 0.93, 0.46] });
  for (const s of [1, -1]) {
    const loop: P2[] = Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      return [0.055 * Math.cos(a), 0.04 * Math.sin(a)] as P2;
    });
    b.extrude(loop, {
      at: [s * 0.06, 0.93, 0.45],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      color: ROSE,
      bone: head,
    });
    b.sweep(
      catmull([
        [s * 0.02, 0.9, 0.46],
        [s * 0.05, 0.82, 0.48],
        [s * 0.09, 0.74, 0.5],
      ]),
      [0.012, 0.006],
      { color: ROSE, bone: head, caps: { start: "flat", end: "flat" } },
    );
  }
  const crescent: P2[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (72 + (216 * i) / 10) * DEG;
    crescent.push([0.075 * Math.cos(a), 0.075 * Math.sin(a)]);
  }
  for (let i = 0; i <= 8; i++) {
    const a = (258 - (158 * i) / 8) * DEG;
    crescent.push([0.04 + 0.07 * Math.cos(a), 0.07 * Math.sin(a)]);
  }
  b.extrude(crescent, {
    at: [0, 0.76, 0.5],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    color: GOLD,
    bone: head,
  });
  b.part(new THREE.TorusGeometry(0.012, 0.004, 6, 10), GOLD, { bone: head, at: [0, 0.845, 0.5] });
  b.sweep(
    catmull([
      [0, 0.91, 0.46],
      [0, 0.88, 0.48],
      [0, 0.85, 0.49],
    ]),
    0.004,
    { color: GOLD, bone: head },
  );

  // Antennae: bipectinate, with feathery fronds along each one and a gold knob at the tip.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSkin.around(HEAD_C).at(s * 24, 64)!;
    const res = b.sprout(
      `antenna${side}`,
      hit,
      catmull([
        [s * 0.12, 1.42, 0.34],
        [s * 0.22, 1.56, 0.32],
        [s * 0.34, 1.66, 0.22],
        [s * 0.4, 1.68, 0.1],
      ]),
      [0.016, 0.005],
      { color: MINT, role: "fan", bands: [[0.85, MINT], [1, GOLD]] },
    );
    b.along(res.chain!, 8, (at) => {
      for (const d of [1, -1]) {
        b.spike(at, [d * 0.8, 0.35, -0.25], 0.035 + 0.075 * (1 - at.t), 0.009, { color: CREAM });
      }
    });
    b.part(new THREE.SphereGeometry(0.026, 10, 8), GOLD, { bone: res.sweep.bone, at: res.sweep.at(0.97) });
  }

  // Six legs: three pairs, each a 2-bone limb to a foot on the floor.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const legs = [
      { k: "F", hip: [s * 0.12, 0.93, 0.2], foot: [s * 0.4, 0.02, 0.45], bend: [s * 0.3, 1, 0.8] },
      { k: "M", hip: [s * 0.14, 0.9, 0], foot: [s * 0.5, 0.02, 0], bend: [s, 0.6, 0] },
      { k: "H", hip: [s * 0.12, 0.88, -0.2], foot: [s * 0.42, 0.02, -0.5], bend: [s * 0.4, 1, -0.9] },
    ] as const;
    for (const leg of legs) {
      const pts = limb(leg.hip as V3, leg.foot as V3, [0.56, 0.54], leg.bend as V3);
      const chain = b.chain(`leg${leg.k}${side}`, pts, {
        parent: core,
        names: [`hip${leg.k}${side}`, `knee${leg.k}${side}`, `foot${leg.k}${side}`],
        role: "leg",
      });
      b.sweep(chain, [0.055, 0.04, 0.026], { color: CREAM, bands: [[0.82, CREAM], [1, ROSE]] });
      b.spike(chain.tip!, [s * 0.4, -0.7, 0.4], 0.035, 0.008, { color: INK });
      b.spike(chain.tip!, [-s * 0.2, -0.7, 0.5], 0.03, 0.007, { color: INK });
    }
  }

  // Wings: forewing (raised) and hindwing (lower, behind), each on its own joint off the core.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const rootF: V3 = [s * 0.07, 1.0, 0.12];
    const fore = wingAxes(s, 20, [0, 1, 0.15]);
    const wingF = b.joint(`wingF${side}`, { parent: core, at: rootF, dir: fore.S, role: "wing" });
    wingSet(wingF, fore.S, fore.C, rootF, FORE_RAW, [[0.82, 0.05, 0.3]]);

    const rootH: V3 = [s * 0.06, 0.96, -0.1];
    const hind = wingAxes(s, 12, [0, 0.6, 1]);
    const wingH = b.joint(`wingH${side}`, { parent: core, at: rootH, dir: hind.S, role: "wing" });
    wingSet(wingH, hind.S, hind.C, rootH, HIND_RAW, [[0.62, -0.42, 0.22]]);

    // Long hindwing tail, mint with a gold tip, trailing back and down.
    const tip0 = wp(rootH, hind.S, hind.C, 1.0, -0.52);
    const tail = b.chain(
      `tail${side}`,
      bezier(tip0, [tip0[0] + s * 0.1, 0.9, -0.95], [s * 1.2, 0.6, -1.3], [s * 1.0, 0.35, -1.5]),
      { parent: wingH, names: (i) => `tail${side}${i + 1}`, role: "tail" },
    );
    b.sweep(tail, [0.03, 0.005], { color: MINT, bands: [[0.78, MINT], [1, GOLD]] });
  }

  // Glowing pollen motes drifting round the wings.
  for (const m of [
    [-0.9, 1.35, 0.7],
    [0.95, 1.5, 0.55],
    [-0.55, 0.85, 0.8],
    [0.6, 0.7, 0.85],
    [-1.2, 0.95, -0.2],
    [1.15, 0.9, -0.3],
  ] as V3[]) {
    glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), "#e6d8ff", { at: m }), 1.5);
  }

  return b.root;
}
