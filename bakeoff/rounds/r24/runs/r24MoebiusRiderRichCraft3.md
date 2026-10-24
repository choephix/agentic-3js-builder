```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  limb,
  catmull,
  bezier,
  lerp,
  offset,
  paint,
  stripes,
  spots,
  gradient,
  svg,
  rng,
} from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Desert Rider on a Stilt Strider",
  description:
    "A veiled desert wanderer sitting cross-legged on a tall, long-legged crested beast, in pastel Moebius comic colours: cel-shaded hide, ink edges, tapestry saddle, glowing lantern, third eye and drawn textures.",
};

type V = [number, number, number];
type Pt2 = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#e8aa2e";
const GOLD_D = "#a8741c";
const LEATHER = "#8a4e33";
const WOOD = "#7a4a2e";
const BONE_C = "#f6e7c1";
const GEM_RED = "#ff5040";
const GEM_TEAL = "#6cf5e0";
const HIDE = "#f2a07b";
const HIDE_D = "#c9634f";
const CREAM = "#fff0cd";
const TEAL = "#2fb1a8";
const TEAL_D = "#1b6a76";
const RED = "#d9503f";
const VIOLET = "#7a5aa6";
const SKIN = "#c78a5e";
const NAVY = "#3b2a4d";

// Cel-shaded paints: one lit tone and one hue-shifted shadow tone each.
const HIDE_TOP = spots(HIDE, HIDE_D, { size: 0.2, amount: 0.3, seed: 3 });
const BODY = cel(furEdge(HIDE_TOP, CREAM, { level: -0.2, teeth: 0.22, period: 0.07, ink: INK }));
const NECKP = cel(
  furEdge(CREAM, HIDE_TOP, { axis: [0, 0, 1], level: 0.25, teeth: 0.25, period: 0.07, along: [0, 1, 0], ink: INK }),
);
const TAILP = cel(stripes(HIDE, TEAL_D, { size: 0.2, axis: "z", width: 0.3, wobble: 0.2, seed: 5 }));
const LEGP = gradient(
  cel(stripes(HIDE, HIDE_D, { size: 0.17, axis: "y", width: 0.3, wobble: 0.2, seed: 2 })),
  cel(TEAL_D),
  [0, 0.55, 0],
  [0, 0.12, 0],
);
const HEADP = cel(HIDE);
const BEAK = cel("#f6dca0", "#d8a878");
const BEAK_D = cel("#d9a46a", "#a8744a");
const TEALP = cel(TEAL);
const TEAL_DP = cel(TEAL_D);
const CREAMP = cel(CREAM);
const REDP = cel(RED);
const ROBE = cel(TEAL);
const TROUS = cel("#5b4a86");
const BOOTP = cel("#4a2d3f");
const SKINP = cel(SKIN);
const LEATHP = cel(LEATHER);
const TURBAN = cel(stripes(CREAM, TEAL, { size: 0.045, axis: "y", width: 0.25, wobble: 0.1 }));
const ROLL = stripes(RED, CREAM, { size: 0.07, axis: "x", width: 0.4, wobble: 0.1 });

const SAIL = paint((_p, _n, s) => {
  const rib = Math.abs(((s[0] * 13) % 1) - 0.5) < 0.05;
  if (s[1] > 0.94) return INK;
  if (rib) return TEAL_D;
  return s[1] > 0.55 ? "#f6c28f" : TEAL;
});
const CAPE = paint((_p, _n, s) => {
  if (s[1] > 0.95) return GOLD;
  if (s[1] > 0.91) return INK;
  return Math.sin(s[0] * 34) > 0.55 ? HIDE_D : "#e8745a";
});
const SCARF = paint((_p, _n, s) => (Math.floor(s[0] * 14) % 2 ? CREAM : TEAL));
const PENNANT = paint((_p, _n, s) => (Math.floor(s[0] / 0.07) % 2 ? RED : GOLD));

// ---------------------------------------------------------------------------------------------------------
// Textures
const rays = Array.from(
  { length: 12 },
  (_, i) =>
    `<path transform="rotate(${i * 30})" d="M-7 -28 L0 -47 L7 -28Z" fill="${i % 2 ? RED : GOLD}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`,
).join("");
const SUN = svg(
  `<svg viewBox="0 0 100 100"><g transform="translate(50 50)">${rays}
  <circle r="27" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
  <circle r="17" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M-10 -2 Q-6 -7 -2 -2 M3 -2 Q7 -7 11 -2" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M-6 7 Q0 12 6 7" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></svg>`,
  { size: 192 },
);

const BEAST_EYE = svg(
  `<svg viewBox="0 0 100 70">
  <defs><clipPath id="c"><path d="M4 38 Q50 -6 96 36 Q52 76 4 38Z"/></clipPath></defs>
  <path d="M4 38 Q50 -6 96 36 Q52 76 4 38Z" fill="#fff6d8"/>
  <g clip-path="url(#c)">
    <circle cx="58" cy="38" r="25" fill="#e0a02a"/>
    <circle cx="58" cy="38" r="25" fill="none" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="60" cy="38" rx="7" ry="20" fill="${INK}"/>
    <circle cx="51" cy="28" r="5" fill="#ffffff"/>
  </g>
  <path d="M4 38 Q52 76 96 36" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M4 38 Q50 -6 96 36" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M20 58 l7 7 M34 63 l5 6 M48 64 l3 6 M62 62 l-1 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const FACE = svg(
  `<svg viewBox="0 0 100 40">
  <path d="M8 13 Q27 3 44 12" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M56 12 Q73 3 92 13" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M12 24 Q28 12 44 24 Q28 33 12 24Z" fill="#fff3d6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M56 24 Q72 12 88 24 Q72 33 56 24Z" fill="#fff3d6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="29" cy="23" r="6.5" fill="#2a8a8f"/><circle cx="29" cy="23" r="3" fill="${INK}"/>
  <circle cx="71" cy="23" r="6.5" fill="#2a8a8f"/><circle cx="71" cy="23" r="3" fill="${INK}"/>
  <circle cx="31" cy="20.5" r="1.8" fill="#ffffff"/><circle cx="73" cy="20.5" r="1.8" fill="#ffffff"/>
  <path d="M9 25 L2 31 M91 25 L98 31" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BLADE = svg(
  `<svg viewBox="0 0 32 96">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${TEAL_D}"/><stop offset="0.5" stop-color="${TEAL}"/><stop offset="1" stop-color="${HIDE}"/>
  </linearGradient></defs>
  <path d="M16 95 C2 70 3 30 16 2 C29 30 30 70 16 95Z" fill="url(#g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 92 L16 10" stroke="${INK}" stroke-width="2.2"/>
  <path d="M16 72 L8 58 M16 58 L24 44 M16 44 L9 32 M16 72 L24 58 M16 58 L8 46 M16 44 L23 32" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
  <path d="M12 50 L4 3 M12 50 L8 2 M12 50 L12 1 M12 50 L16 2 M12 50 L20 3" stroke="${RED}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M12 50 L12 14 M12 50 L8 18 M12 50 L16 18" stroke="${CREAM}" stroke-width="2" stroke-linecap="round" fill="none"/>
  <rect x="8" y="48" width="8" height="6" fill="${GOLD_D}" stroke="${INK}" stroke-width="2"/>
  <circle cx="12" cy="58" r="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="2.4"/>
  </svg>`,
  { size: 160 },
);

const dia = [0, 1, 2, 3, 4]
  .map((i) => {
    const cx = 14 + i * 18;
    return `<polygon points="${cx},17 ${cx + 9},30 ${cx},43 ${cx - 9},30" fill="${i % 2 ? TEAL : GOLD}" stroke="${INK}" stroke-width="2"/><circle cx="${cx}" cy="30" r="3" fill="${CREAM}"/>`;
  })
  .join("");
const TAPESTRY = svg(
  `<svg viewBox="0 0 100 60">
  <rect width="100" height="60" fill="#c9434a"/>
  <rect x="3" y="3" width="94" height="54" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <rect x="8" y="8" width="84" height="44" fill="none" stroke="${INK}" stroke-width="2"/>
  ${dia}
  <path d="M10 10 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5" stroke="${CREAM}" stroke-width="2" fill="none"/>
  <path d="M10 50 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5" stroke="${CREAM}" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 256 },
);

const CHEVRON = svg(
  `<svg viewBox="0 0 100 60">
  <rect width="100" height="60" fill="${VIOLET}"/>
  ${[0, 1, 2, 3, 4, 5]
    .map(
      (i) =>
        `<path d="M0 ${8 + i * 10} L25 ${i * 10} L50 ${8 + i * 10} L75 ${i * 10} L100 ${8 + i * 10}" stroke="${i % 2 ? TEAL : CREAM}" stroke-width="5" fill="none"/>`,
    )
    .join("")}
  <rect x="1.5" y="1.5" width="97" height="57" fill="none" stroke="${INK}" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const GLYPH = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M50 50 a6 6 0 0 1 12 0 a12 12 0 0 1 -24 0 a18 18 0 0 1 36 0 a24 24 0 0 1 -48 0 a30 30 0 0 1 60 0" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
  <path d="M50 50 a6 6 0 0 1 12 0 a12 12 0 0 1 -24 0 a18 18 0 0 1 36 0 a24 24 0 0 1 -48 0 a30 30 0 0 1 60 0" stroke="${TEAL_D}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="88" cy="50" r="5" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="12" cy="28" r="3.5" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <circle cx="20" cy="82" r="3.5" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const LANTERN = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="l" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#fff2a8"/><stop offset="1" stop-color="#ff9a3a"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#l)"/>
  ${[0, 17, 33, 50, 67, 83].map((x) => `<rect x="${x}" y="0" width="5" height="100" fill="${INK}"/>`).join("")}
  <rect x="0" y="45" width="100" height="5" fill="${INK}"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------
// Builder and helpers
const b = createBuilder({ name: "desert_rider", paintSize: 2048 });
const R = rng(11);

const prof = (k: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  return k[i] + (k[i + 1] - k[i]) * (x - i);
};
const sph = (r = 1, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
/** Ellipsoid aligned to a bone's frame: scale = [across, along bone, third axis]. */
function blob(bone: Joint, color: ColorInput, at: any, r: V, extra: any = {}) {
  return b.part(sph(), color, { bone, at, quat: bone.quat, scale: r, flat: true, ...extra });
}
/** Ellipsoid aligned to the world axes. */
function ellip(bone: Joint, color: ColorInput, at: any, r: V, extra: any = {}) {
  return b.part(sph(), color, { bone, at, scale: r, flat: true, ...extra });
}
function ball(bone: Joint, color: ColorInput, at: any, r: number, extra: any = {}) {
  return b.part(sph(r, 8, 6), color, { bone, at, flat: true, ...extra });
}
function torus(bone: Joint, color: ColorInput, at: any, dir: any, r: number, tube: number, extra: any = {}) {
  return b.part(new THREE.TorusGeometry(r, tube, 5, 10), color, { bone, at, dir, axis: "z", flat: true, ...extra });
}
const scaleOutline = (o: Pt2[], k: number): Pt2[] =>
  o.map((p) => (p.length === 3 ? ([p[0] * k, p[1] * k, "sharp"] as Pt2) : ([p[0] * k, p[1] * k] as Pt2)));

// =========================================================================================================
// THE BEAST: skeleton
const hips = b.joint("hips", { at: [0, 2.4, -0.8] });
const spine = b.chain(
  "spine",
  catmull([
    [0, 2.4, -0.8],
    [0, 2.44, -0.35],
    [0, 2.5, 0.15],
    [0, 2.56, 0.62],
  ]),
  { parent: hips, count: 4, role: "spine" },
);
const chestB = spine.joints[spine.joints.length - 1];
const sBone = spine.joints[2];

const rxP = prof([0.3, 0.34, 0.34, 0.27, 0.22]);
const ryP = prof([0.36, 0.42, 0.45, 0.42, 0.34]);
const body = b.sweep(spine, (t: number): [number, number] => [rxP(t), ryP(t)], { color: BODY, sides: 10 });

// Neck
const bNeck = b.chain(
  "bNeck",
  catmull([
    [0, 2.62, 0.6],
    [0, 3.0, 0.82],
    [0, 3.45, 1.12],
    [0, 3.85, 1.5],
    [0, 4.08, 1.88],
  ]),
  { parent: chestB, count: 5, role: "neck" },
);
const neckSw = b.sweep(
  bNeck,
  (t: number): [number, number] => {
    const r = 0.17 - 0.095 * t;
    return [r, r * 0.95];
  },
  { color: NECKP, sides: 8 },
);

// Nape sail
{
  const A: THREE.Vector3[] = [];
  const B: THREE.Vector3[] = [];
  for (const t of [0.06, 0.14, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86]) {
    const p = neckSw.at(t, 0);
    const h = 0.05 + 0.28 * Math.pow(Math.max(Math.sin((Math.PI * (t - 0.06)) / 0.8), 0), 0.8);
    A.push(p.at.clone());
    B.push(p.at.clone().addScaledVector(p.n, h));
  }
  b.membrane(catmull(A), catmull(B), { bone: bNeck, color: SAIL, thickness: 0.012, rows: 3, scallop: 0.1 });
}

// Collar of bells and ruff
{
  const base = bNeck.at(0.1);
  b.ring(base, { count: 9, radius: 0.19 }, (item) => b.stick(sph(0.028, 6, 4), GOLD, item, { embed: 0.3 }));
  b.cards(b.ring(bNeck.at(0.14), { count: 10, radius: 0.18, tilt: -30 }).items, BLADE, {
    size: [0.1, 0.3],
    vary: 0.2,
    rng: R,
    bend: 20,
  });
  torus(bNeck.joints[0], GOLD, base.at, base.tangent, 0.19, 0.016);
}

// Head
const headB = b.joint("headB", { parent: bNeck, at: bNeck.at(1).at, dir: [0, -0.3, 1], role: "head" });
const hb = (r: number, a: number, u: number) => headB.local([r, a, u]);
const hs = (s: number, w: number, a: number, u: number) => headB.local([-s * w, a, u]);

const skull = blob(headB, HEADP, hb(0, 0.06, 0), [0.15, 0.24, 0.14]);
b.frustumBox(hb(0, 0.12, 0), hb(0, 0.66, -0.07), [0.2, 0.17], [0.06, 0.06], { bone: headB, color: BEAK });
b.spike(hb(0, 0.66, -0.07), headB.dir([0, 0.3, -1]), 0.1, 0.035, { bone: headB, color: BEAK_D });
const jawB = b.joint("jawB", { parent: headB, at: hb(0, 0.1, -0.09), aim: hb(0, 0.6, -0.14), role: "jaw" });
b.frustumBox(jawB.at, hb(0, 0.62, -0.13), [0.15, 0.07], [0.05, 0.045], { bone: jawB, color: BEAK_D });
b.part(new THREE.BoxGeometry(0.1, 0.12, 0.03), BEAK_D, { bone: jawB, at: hb(0, 0.52, -0.16), flat: true });

// Third eye
glow(b.part(new THREE.OctahedronGeometry(0.035), GEM_TEAL, { bone: headB, at: hb(0, 0.14, 0.125), flat: true }), 1.3);
b.part(new THREE.TorusGeometry(0.04, 0.01, 4, 8), GOLD, {
  bone: headB,
  at: hb(0, 0.14, 0.12),
  dir: headB.dir([0, 0.3, 1]),
  axis: "z",
});

for (const s of [1, -1]) {
  // eyes
  const hit = b.surface(skull).around(skull.at).at(s * 65, 8)!;
  b.decal(skull, BEAST_EYE, { at: hit, size: [0.17, 0.12], mirror: s > 0, segments: 8 });
  blob(headB, TEAL_DP, hs(s, 0.115, 0.1, 0.1), [0.06, 0.08, 0.025], { rotation: [0, 0, s * 20] });
  // tusks and nostrils
  b.spike(hs(s, 0.055, 0.4, -0.12), headB.dir([0, 0.1, 1]), 0.1, 0.02, { bone: jawB, color: BONE_C, sides: 5 });
  blob(headB, INK, hs(s, 0.03, 0.56, -0.015), [0.014, 0.02, 0.01]);
  // ear frills
  const E1: Pt2[] = [
    [0, -0.03],
    [0.14, -0.11],
    [0.34, -0.05],
    [0.52, 0.14, "sharp"],
    [0.34, 0.09],
    [0.15, 0.1],
    [0, 0.05],
  ];
  b.extrude(E1, {
    at: hs(s, 0.1, -0.02, 0.05),
    x: [s * 0.7, 0, -0.7],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 1,
    color: TEALP,
    bone: headB,
  });
  b.extrude(scaleOutline(E1, 0.6), {
    at: hs(s, 0.1, -0.02, 0.05),
    x: [s * 0.7, 0, -0.7],
    y: [0, 1, 0],
    thickness: 0.02,
    smoothing: 1,
    color: REDP,
    bone: headB,
  });
  // horns
  b.sweep(bezier(hs(s, 0.07, 0.05, 0.1), hs(s, 0.17, -0.1, 0.32), hs(s, 0.3, -0.38, 0.36)), [0.04, 0.004], {
    bone: headB,
    color: BONE_C,
    caps: { start: "flat", end: "point" },
    sides: 6,
  });
  // bridle: cheek strap + rein ring
  b.rod(hs(s, 0.075, 0.3, -0.02), hs(s, 0.1, 0.0, 0.03), 0.009, { color: LEATHER, bone: headB });
  ball(headB, GOLD, hs(s, 0.085, 0.38, -0.08), 0.022);
}
torus(headB, LEATHER, hb(0, 0.26, -0.03), headB.axis, 0.085, 0.012);
{
  const crest: any[] = [];
  for (const [az, el] of [
    [0, 62],
    [0, 80],
    [180, 78],
    [180, 58],
  ]) {
    const h = b.surface(skull).around(skull.at).at(az, el);
    if (h) crest.push(h);
  }
  b.cards(crest, BLADE, { size: [0.09, 0.28], lean: 35, bend: 20, flow: [0, -0.2, -1], vary: 0.15, rng: R });
}

// Legs
function beastLeg(s: number, fore: boolean) {
  const side = s > 0 ? "L" : "R";
  const root: V = fore ? [s * 0.27, 2.32, 0.52] : [s * 0.29, 2.32, -0.78];
  const foot: V = fore ? [s * 0.4, 0.05, 0.84] : [s * 0.42, 0.05, -0.98];
  const bends: V[] = fore
    ? [
        [0, 0, -1],
        [0, 0, 1],
      ]
    : [
        [0, 0, 1],
        [0, 0, -1],
      ];
  const pts = limb(root, foot, [0.9, 0.85, 0.75], bends);
  const names = fore
    ? [`foreShoulder${side}`, `foreElbow${side}`, `foreWrist${side}`, `foreHoof${side}`]
    : [`hindHip${side}`, `hindKnee${side}`, `hindHock${side}`, `hindHoof${side}`];
  const leg = b.chain(`${fore ? "fore" : "hind"}${side}`, pts, {
    parent: fore ? chestB : hips,
    names,
    role: "leg",
  });
  b.sweep(leg, [0.12, 0.085, 0.065, 0.05, 0.04], { color: LEGP, sides: 6, smooth: false });
  ball(leg.joints[0], HEADP, root, 0.17);
  const hoof = leg.joints[leg.joints.length - 1];
  // splayed padded foot
  b.part(new THREE.CylinderGeometry(0.1, 0.125, 0.07, 6), BEAK_D, { bone: hoof, at: [foot[0], 0.035, foot[2]], flat: true });
  for (const a of [-38, 0, 38]) {
    const r = (a * Math.PI) / 180;
    b.spike([foot[0] + Math.sin(r) * 0.07, 0.04, foot[2] + Math.cos(r) * 0.07], [Math.sin(r), 0, Math.cos(r)], 0.2, 0.045, {
      bone: hoof,
      color: BONE_C,
      sides: 6,
    });
  }
  b.spike([foot[0], 0.05, foot[2] - 0.08], [0, 0.3, -1], 0.13, 0.03, { bone: hoof, color: BONE_C, sides: 5 });
  // gold anklet + feathered knee tuft
  const an = leg.at(0.86);
  torus(an.bone, GOLD, an.at, an.tangent, 0.065, 0.016);
  const an2 = leg.at(0.74);
  torus(an2.bone, GOLD_D, an2.at, an2.tangent, 0.06, 0.012);
  b.cards(b.ring(leg.at(0.36), { count: 6, radius: 0.06, tilt: 25 }).items, BLADE, {
    size: [0.07, 0.22],
    vary: 0.2,
    rng: R,
  });
}
for (const s of [1, -1]) {
  beastLeg(s, true);
  beastLeg(s, false);
}

// Tail
const tail = b.chain(
  "tail",
  catmull([
    [0, 2.45, -1.0],
    [0, 2.35, -1.5],
    [0, 2.45, -2.0],
    [0, 2.8, -2.4],
  ]),
  { parent: hips, count: 5, role: "tail" },
);
b.sweep(tail, (t: number) => 0.1 * (1 - t) + 0.03, { color: TAILP, sides: 7 });
b.cards(b.ring(tail.at(1), { count: 9, radius: 0.03, tilt: 60 }).items, BLADE, {
  size: [0.11, 0.5],
  cross: true,
  bend: 30,
  vary: 0.2,
  rng: R,
});

// Flank glyphs
for (const s of [1, -1]) {
  const h = b.surface(body).around([0, 2.6, 0.4]).at(s * 90, 22)!;
  b.decal(body, GLYPH, { at: h, size: [0.34, 0.34], mirror: s > 0 });
}

// Saddle, blanket, girth and packs
const SZ = -0.12;
const topY = b.surface(body).ray([0, 6, SZ], [0, -1, 0])!.at.y;

{
  const girth = b.surface(body).loop(spine.joints[2], { lift: 0.02 });
  b.sweep(girth, 0.026, { color: LEATHER, sides: 6 });
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.035), GOLD, { at: girth.at(0.27), bone: sBone, flat: true });
}
b.part(new THREE.BoxGeometry(0.52, 0.03, 0.72), "#ffffff", { bone: sBone, at: [0, topY, SZ], texture: TAPESTRY });
ellip(sBone, REDP, [0, topY + 0.07, SZ + 0.05], [0.3, 0.06, 0.34]);
ellip(sBone, GOLD, [0, topY + 0.13, SZ + 0.38], [0.045, 0.06, 0.045]);
ellip(sBone, GOLD, [0, topY + 0.14, SZ - 0.3], [0.17, 0.08, 0.04]);
b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.64, 10), ROLL, {
  bone: sBone,
  at: [0, topY + 0.14, SZ - 0.5],
  dir: [1, 0, 0],
});
for (const x of [-0.2, 0.2]) {
  b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 10), LEATHER, {
    bone: sBone,
    at: [x, topY + 0.14, SZ - 0.5],
    dir: [1, 0, 0],
    axis: "z",
  });
}
const tassels: any[] = [];
for (const s of [1, -1]) {
  const rz = s * 18;
  b.part(new THREE.BoxGeometry(0.02, 0.36, 0.62), "#ffffff", {
    bone: sBone,
    at: [s * 0.37, topY - 0.17, SZ],
    rotation: [0, 0, rz],
    texture: TAPESTRY,
  });
  const nrm: V = [s * Math.cos((18 * Math.PI) / 180), Math.sin((18 * Math.PI) / 180), 0];
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
    bone: sBone,
    at: [s * 0.37 + nrm[0] * 0.013, topY - 0.17 + nrm[1] * 0.013, SZ],
    dir: nrm,
    axis: "z",
    texture: SUN,
  });
  for (const dz of [-0.25, 0, 0.25]) tassels.push(frame([s * 0.426, topY - 0.34, SZ + dz], [0, 1, 0]));
  // hanging pack with strap
  b.part(new THREE.BoxGeometry(0.14, 0.28, 0.3), "#ffffff", {
    bone: sBone,
    at: [s * 0.44, topY - 0.46, SZ - 0.52],
    rotation: [0, 0, s * 10],
    texture: CHEVRON,
  });
  b.rod([s * 0.2, topY + 0.01, SZ - 0.52], [s * 0.44, topY - 0.3, SZ - 0.52], 0.012, { color: LEATHER, bone: sBone });
  ball(sBone, GOLD, [s * 0.44, topY - 0.3, SZ - 0.52], 0.022);
}
for (const x of [-0.2, -0.1, 0, 0.1, 0.2]) tassels.push(frame([x, topY + 0.005, SZ - 0.36], [0, 1, 0]));
b.cards(tassels, TASSEL, { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bone: sBone });
b.cards(
  [frame([-0.04, topY + 0.2, SZ + 0.38], [0, 1, 0]), frame([0.04, topY + 0.2, SZ + 0.38], [0, 1, 0])],
  TASSEL,
  { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], bone: sBone },
);

// =========================================================================================================
// THE RIDER
const PY = topY + 0.14;
const SY = PY + 0.6;
const pelvis = b.joint("pelvis", {
  parent: spine.nearestJoint([0, PY, SZ]),
  at: [0, PY, SZ],
  dir: [0, 1, 0],
  role: "spine",
});
const torso = b.chain(
  "spineR",
  catmull([
    [0, PY, SZ],
    [0, PY + 0.2, SZ + 0.01],
    [0, PY + 0.42, SZ],
    [0, SY, SZ],
  ]),
  { parent: pelvis, count: 3, role: "spine" },
);
const chest = torso.joints[torso.joints.length - 1];
const torsoSw = b.sweep(torso, (t: number): [number, number] => [0.17 + 0.05 * t, 0.115 + 0.02 * Math.sin(t * 3)], {
  color: ROBE,
  sides: 8,
});
ellip(pelvis, TROUS, [0, PY, SZ], [0.19, 0.12, 0.15]);

// waist sash with knot and tails
b.part(new THREE.TorusGeometry(1, 0.2, 5, 14), REDP, {
  bone: torso.joints[0],
  at: [0, PY + 0.1, SZ],
  dir: [0, 1, 0],
  up: [0, 0, 1],
  axis: "z",
  scale: [0.185, 0.14, 0.2],
  flat: true,
});
ball(torso.joints[0], REDP, [0.16, PY + 0.1, SZ + 0.09], 0.05);
b.sweep(bezier([0.16, PY + 0.1, SZ + 0.09], [0.22, PY - 0.1, SZ + 0.14], [0.2, PY - 0.3, SZ + 0.12]), [0.035, 0.02], {
  bone: torso.joints[0],
  color: REDP,
  sides: 5,
});
b.sweep(bezier([0.16, PY + 0.1, SZ + 0.09], [0.1, PY - 0.08, SZ + 0.2], [0.08, PY - 0.27, SZ + 0.18]), [0.03, 0.016], {
  bone: torso.joints[0],
  color: CREAMP,
  sides: 5,
});
// dagger in the sash
b.spike([-0.15, PY + 0.2, SZ + 0.12], [-0.3, -0.55, 0.8], 0.2, 0.02, { bone: torso.joints[0], color: "#d8dde8", sides: 4 });
b.rod([-0.15, PY + 0.2, SZ + 0.12], [-0.12, PY + 0.28, SZ + 0.09], 0.016, { bone: torso.joints[0], color: GOLD });

// sun medal on the chest
{
  const h = b.surface(torsoSw).ray([0, PY + 0.45, SZ + 1], [0, 0, -1])!;
  b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
    bone: chest,
    at: offset(h, h.n, 0.004),
    dir: h.n,
    axis: "z",
    texture: SUN,
  });
}

// neck & head
const neckR = b.joint("neck", { parent: chest, at: [0, SY, SZ], dir: [0, 1, 0.1], role: "neck" });
b.rod([0, SY - 0.05, SZ], [0, SY + 0.14, SZ + 0.02], 0.055, { color: SKINP, bone: neckR });
b.part(new THREE.TorusGeometry(1, 0.2, 5, 12), cel(GOLD), {
  bone: neckR,
  at: [0, SY - 0.02, SZ],
  dir: [0, 1, 0],
  up: [0, 0, 1],
  axis: "z",
  scale: [0.13, 0.11, 0.2],
  flat: true,
});
const headR = b.joint("head", { parent: neckR, at: [0, SY + 0.13, SZ + 0.02], dir: [0, 1, 0], role: "head" });
const rh = (s: number, w: number, up: number, fwd: number) => headR.local([-s * w, up, -fwd]);
const cranium = blob(headR, SKINP, rh(0, 0, 0.095, 0), [0.1, 0.115, 0.105]);
blob(headR, CREAMP, rh(0, 0, 0.025, 0.035), [0.108, 0.085, 0.1]);
b.spike(rh(0, 0, 0.085, 0.1), headR.dir([0, 0.1, -1]), 0.05, 0.03, { bone: headR, color: CREAMP, sides: 5 });
b.decal(cranium, FACE, { at: rh(0, 0, 0.125, 0.1), dir: [0, 0, 1], size: [0.2, 0.085], segments: 8 });
const jawR = b.joint("jaw", { parent: headR, at: rh(0, 0, 0.04, 0.02), aim: rh(0, 0, 0.0, 0.1), role: "jaw" });
blob(jawR, CREAMP, rh(0, 0, 0.0, 0.05), [0.06, 0.04, 0.05]);
for (const s of [1, -1]) blob(headR, SKINP, rh(s, 0.1, 0.09, -0.01), [0.02, 0.04, 0.03]);

// turban
b.lathe(
  [
    [0, 0],
    [0.125, 0],
    [0.145, 0.05],
    [0.14, 0.1],
    [0.11, 0.15],
    [0.06, 0.2],
    [0, 0.24],
  ],
  { at: rh(0, 0, 0.14, 0), axis: [0, 1, 0], segments: 10, color: TURBAN, bone: headR },
);
[0.03, 0.08, 0.13].forEach((y, i) => {
  torus(headR, i % 2 ? TEALP : CREAMP, rh(0, 0, 0.14 + y, 0), [i % 2 ? 0.16 : -0.16, 1, 0.08], 0.135 - i * 0.012, 0.022);
});
glow(b.part(new THREE.OctahedronGeometry(0.03), GEM_RED, { bone: headR, at: rh(0, 0, 0.2, 0.145), flat: true }), 1.3);
b.part(new THREE.ConeGeometry(0.04, 0.03, 6), GOLD, { bone: headR, at: rh(0, 0, 0.2, 0.135), dir: headR.dir([0, 0, -1]), flat: true });
b.cards([frame(rh(0, 0, 0.23, 0.12), [0, 1, -0.2])], BLADE, { size: [0.08, 0.27], bend: 25, cross: true, bone: headR });

// flowing scarf
{
  const A: V[] = [];
  const B: V[] = [];
  [0, 1, 2, 3, 4].forEach((i) => {
    const t = i / 4;
    const x = 0.08 * Math.sin(i * 1.3);
    const y = SY + 0.06 + 0.1 * Math.sin(i * 1.1);
    const z = SZ - 0.12 - t * 1.75;
    A.push([x, y, z]);
    B.push([x, y - (0.12 + 0.07 * t), z]);
  });
  b.membrane(catmull(A), catmull(B), { bone: neckR, color: SCARF, thickness: 0.01, rows: 2, cols: 14, scallop: 0.15 });
}
// cape
{
  const top = catmull([
    [0.26, SY - 0.03, SZ - 0.02],
    [0.12, SY + 0.03, SZ - 0.14],
    [-0.12, SY + 0.03, SZ - 0.14],
    [-0.26, SY - 0.03, SZ - 0.02],
  ]);
  const hem = catmull([
    [0.55, SY - 0.62, SZ - 0.5],
    [0.22, SY - 0.72, SZ - 0.85],
    [-0.22, SY - 0.7, SZ - 0.88],
    [-0.55, SY - 0.62, SZ - 0.5],
  ]);
  b.membrane(top, hem, { bone: chest, color: CAPE, thickness: 0.012, rows: 5, cols: 10 });
  for (const s of [1, -1]) ball(chest, GOLD, [s * 0.25, SY - 0.03, SZ - 0.01], 0.03);
}

// Rider legs, crossed
for (const s of [1, -1]) {
  const side = s > 0 ? "L" : "R";
  const hip: V = [s * 0.11, PY, SZ];
  const foot: V = [-s * 0.1, PY + 0.03 + (s > 0 ? 0.06 : 0), SZ + 0.4 + (s > 0 ? 0.06 : 0)];
  const pts = limb(hip, foot, [0.44, 0.44], [[s, 0.3, 0.2]]);
  const leg = b.chain(`rLeg${side}`, pts, {
    parent: pelvis,
    names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    role: "leg",
  });
  b.sweep(leg, [0.095, 0.085, 0.055], { color: TROUS, sides: 7 });
  const ankle = leg.joints[leg.joints.length - 1];
  b.rod(lerp(pts[1], pts[2], 0.5), pts[2], 0.058, { color: BOOTP, bone: leg.joints[1], sides: 7 });
  ellip(ankle, BOOTP, [foot[0], foot[1] - 0.01, foot[2] + 0.05], [0.055, 0.05, 0.11]);
  b.spike([foot[0], foot[1] + 0.0, foot[2] + 0.13], [0, 0.7, 1], 0.13, 0.04, { bone: ankle, color: BOOTP, sides: 6 });
  torus(leg.joints[1], GOLD, lerp(pts[1], pts[2], 0.55), new THREE.Vector3().subVectors(pts[2], pts[1]), 0.062, 0.01);
}

// Rider arms
const staffBase: V = [0.5, topY - 0.6, SZ - 0.12];
const staffTop: V = [0.5, PY + 1.45, SZ + 0.1];
const handYL = PY + 0.3;
const handPosL = lerp(staffBase, staffTop, (handYL - staffBase[1]) / (staffTop[1] - staffBase[1]));
const handPosR: V = [-0.18, PY + 0.34, SZ + 0.4];
function riderArm(s: number, hand: any) {
  const side = s > 0 ? "L" : "R";
  const sh: V = [s * 0.22, SY - 0.05, SZ];
  const pts = limb(sh, hand, [0.3, 0.28], [[s * 0.6, -0.5, -0.6]]);
  const arm = b.chain(`arm${side}`, pts, {
    parent: chest,
    names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    role: "arm",
  });
  b.sweep(arm, [0.075, 0.065, 0.095], { color: ROBE, sides: 7 });
  ball(chest, ROBE, sh, 0.09);
  const wrist = arm.joints[arm.joints.length - 1];
  torus(arm.joints[1], GOLD, lerp(pts[1], pts[2], 0.9), new THREE.Vector3().subVectors(pts[2], pts[1]), 0.08, 0.012);
  ellip(wrist, SKINP, hand, [0.045, 0.05, 0.05]);
  b.spike(offset(hand, [s * 0.5, 0.2, 0.7], 0.03), [s * 0.4, 0.2, 0.8], 0.06, 0.016, { bone: wrist, color: SKINP, sides: 5 });
  return wrist;
}
const handL = riderArm(1, handPosL);
const handR = riderArm(-1, handPosR);

// Reins
for (const s of [1, -1]) {
  const mouth = hs(s, 0.085, 0.38, -0.08);
  const start = new THREE.Vector3(...handPosR);
  const mid = lerp(start, mouth, 0.5).add(new THREE.Vector3(s * 0.22, -0.15, 0));
  b.sweep(catmull([start, mid, mouth]), 0.011, { color: LEATHER, bone: handR, sides: 5 });
}

// Staff, spearhead, pennant and lantern
b.rod(staffBase, staffTop, 0.022, { color: WOOD, bone: handL, sides: 6 });
b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 6), GOLD, { bone: handL, at: [staffBase[0], staffBase[1] + 0.04, staffBase[2]], flat: true });
b.spike(staffTop, [0, 1, 0], 0.2, 0.03, { bone: handL, color: GOLD, sides: 6 });
torus(handL, GOLD, [staffTop[0], staffTop[1] - 0.02, staffTop[2]], [0, 1, 0], 0.03, 0.01);
{
  const penAt: V = [staffTop[0], staffTop[1] - 0.1, staffTop[2]];
  const pen = b.extrude(
    [
      [0, 0],
      [0.55, -0.02],
      [0.4, 0.1],
      [0.55, 0.22],
      [0, 0.2],
    ],
    { at: penAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: PENNANT, bone: handL },
  );
  for (const k of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: handL,
      at: offset(pen.local([0.2, 0.1, 0]), pen.axis, k * 0.005),
      dir: [k, 0, 0],
      axis: "z",
      texture: SUN,
    });
  }
}
{
  const lx = staffTop[0] + 0.2;
  const ly = staffTop[1] - 0.52;
  b.rod([staffTop[0], staffTop[1] - 0.26, staffTop[2]], [lx, staffTop[1] - 0.26, staffTop[2]], 0.01, { color: GOLD_D, bone: handL });
  b.rod([lx, staffTop[1] - 0.26, staffTop[2]], [lx, ly + 0.16, staffTop[2]], 0.006, { color: GOLD_D, bone: handL });
  glow(
    b.part(new THREE.CylinderGeometry(0.065, 0.07, 0.15, 6), "#ffffff", {
      bone: handL,
      at: [lx, ly, staffTop[2]],
      texture: LANTERN,
    }),
    1.4,
  );
  b.part(new THREE.ConeGeometry(0.09, 0.07, 6), GOLD, { bone: handL, at: [lx, ly + 0.11, staffTop[2]], flat: true });
  b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.025, 6), GOLD, { bone: handL, at: [lx, ly - 0.085, staffTop[2]], flat: true });
  ball(handL, GOLD, [lx, ly - 0.115, staffTop[2]], 0.02);
}

export default function build() {
  return b.root;
}
```