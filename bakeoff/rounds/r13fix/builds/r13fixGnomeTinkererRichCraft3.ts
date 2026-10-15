import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  countershade,
  mottle,
  stripes,
  grain,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Joint } from "../../../../src/index";
import { gearTrain, gearGeometry, gaugeTexture, metal, panelled, coil, TINT } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome tinkerer: big red hat with goggles, a fluffy white beard, a riveted backpack bristling with gears, a telescope, a lantern, a gauge, a steam pipe and tools.",
};

type V = [number, number, number];
const norm = (v: V): V => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BRASS = metal("brass", { tarnish: 0.35, verdigris: 0.15 });
const GILT = metal("gilt");
const COPPER = metal("copper", { verdigris: 0.35 });
const STEEL = metal("steel");
const IRON = metal("iron");
const BLUED = metal("blued");

const SKIN = mottle("#f2b890", "#e8a07e", { size: 0.06, seed: 3 });
const NOSE = mottle("#ee9a80", "#e0806c", { size: 0.04, seed: 8 });
const CHEEK = "#f08f84";
const LIP = "#c9605c";
const BEARD = grain("#fdfaf2", "#cfcbdc", { size: 0.014, axis: "y", seed: 4 });
const HAT = countershade(mottle("#dc4a30", "#c53a2b", { size: 0.05, seed: 2 }), "#8c2328", { level: -0.2, soft: 0.6 });
const HAT_BAND = "#4a2c18";
const TUNIC = paint((p, n) => {
  const lit = mix("#38a69b", "#256f7a", smoothstep(0.5, -0.8, n.y));
  const grime = smoothstep(0.55, 0.8, noise(p, 0.06, 4)) * 0.3 + smoothstep(0.5, 0.38, p.y) * 0.3;
  return mix(lit, "#3a3a2e", grime);
});
const SLEEVE = countershade(mottle("#3aa89c", "#2f9490", { size: 0.05, seed: 6 }), "#216a72", { level: -0.2, soft: 0.5 });
const PANTS = grain("#5f4e8e", "#493a74", { size: 0.012, axis: "y", seed: 2 });
const BOOT = paint((p, n) => {
  const c = mix("#8a5330", "#5e341d", smoothstep(0.5, -0.6, n.y));
  return mix(c, "#4a3a22", smoothstep(0.07, 0.0, p.y) * 0.7);
});
const SOLE = "#3b2416";
const GLOVE = grain("#e0ad6a", "#c68e4e", { size: 0.01, axis: "y", seed: 5 });
const LEATHER = grain("#7a4a28", "#5e3719", { size: 0.012, axis: "x", seed: 7 });
const LEATHER_DK = grain("#5a361b", "#442813", { size: 0.012, axis: "y", seed: 9 });
const PACK = panelled(grain("#a06d3d", "#82562f", { size: 0.02, axis: "y", seed: 1 }), { size: 0.12, aspect: 0.8, rivets: 0.04 });
const PACK_DK = panelled(grain("#7a4d2a", "#5f3b20", { size: 0.02, axis: "x", seed: 12 }), { size: 0.1, aspect: 0.6, rivets: 0.035 });
const WOOD = grain("#b07a45", "#8a5a30", { size: 0.01, axis: "y", seed: 14 });
const BEDROLL = stripes("#d96b3a", "#f4d9a0", { size: 0.05, axis: "x", width: 0.5, wobble: 0.1 });
const PUFF_A = "#f6f6fa";
const PUFF_B = "#dde2ee";

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 80 80">
  <ellipse cx="40" cy="42" rx="35" ry="33" fill="#2a1a14"/>
  <ellipse cx="40" cy="42" rx="31" ry="29" fill="#fffaf0"/>
  <circle cx="42" cy="45" r="21" fill="#5c9a3e"/>
  <path d="M21 45 a21 21 0 0 0 42 0 z" fill="#8ac85a"/>
  <circle cx="42" cy="45" r="21" fill="none" stroke="#2f5a22" stroke-width="3"/>
  <circle cx="42" cy="45" r="10.5" fill="#120c0a"/>
  <circle cx="34" cy="36" r="7" fill="#ffffff"/>
  <circle cx="50" cy="54" r="3.2" fill="#ffffff"/>
  <path d="M5 30 Q40 2 76 28" stroke="#2a1a14" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const APRON = svg(
  `<svg viewBox="0 0 100 124">
  <defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#946032"/><stop offset="1" stop-color="#6b4220"/></linearGradient></defs>
  <path d="M32 3 H68 L70 32 Q72 40 94 42 L97 120 H3 L6 42 Q28 40 30 32 Z" fill="url(#l)" stroke="#3a2210" stroke-width="3" stroke-linejoin="round"/>
  <path d="M35 8 H65 L66.5 31 Q69 45 90 46 L92.5 115 H7.5 L10 46 Q31 45 33.5 31 Z" fill="none" stroke="#e1bd84" stroke-width="1.4" stroke-dasharray="4 3"/>
  <circle cx="50" cy="19" r="9" fill="none" stroke="#e0b04a" stroke-width="5" stroke-dasharray="3.2 2.4"/>
  <circle cx="50" cy="19" r="5" fill="#3a2210" stroke="#e0b04a" stroke-width="2"/>
  <rect x="26" y="50" width="48" height="30" rx="4" fill="#7c4e29" stroke="#3a2210" stroke-width="2.5"/>
  <rect x="29" y="53" width="42" height="24" rx="2" fill="none" stroke="#e1bd84" stroke-width="1.2" stroke-dasharray="3 2.5"/>
  <rect x="33" y="40" width="6" height="16" rx="2" fill="#d83a2a" stroke="#3a2210" stroke-width="1.5"/>
  <rect x="44" y="36" width="6" height="20" rx="2" fill="#2f79d0" stroke="#3a2210" stroke-width="1.5"/>
  <rect x="55" y="42" width="5" height="14" rx="1" fill="#f1c93b" stroke="#3a2210" stroke-width="1.5"/>
  <path d="M65 56 l3 -16 l3 1 l-2 15 z" fill="#c9ced8" stroke="#3a2210" stroke-width="1.5"/>
  <rect x="12" y="90" width="76" height="26" rx="4" fill="#74482a" stroke="#3a2210" stroke-width="2.5"/>
  <path d="M50 90 V116" stroke="#3a2210" stroke-width="2.5"/>
  <rect x="15" y="93" width="70" height="20" rx="2" fill="none" stroke="#e1bd84" stroke-width="1.2" stroke-dasharray="3 2.5"/>
  <g fill="#e0b04a" stroke="#3a2210" stroke-width="1"><circle cx="14" cy="92" r="2.2"/><circle cx="86" cy="92" r="2.2"/><circle cx="14" cy="114" r="2.2"/><circle cx="86" cy="114" r="2.2"/><circle cx="50" cy="90" r="2.4"/><circle cx="30" cy="48" r="2"/><circle cx="70" cy="48" r="2"/></g>
  <ellipse cx="24" cy="100" rx="9" ry="4" fill="#1a0e06" opacity="0.35"/>
  <ellipse cx="72" cy="108" rx="7" ry="3" fill="#1a0e06" opacity="0.3"/>
  </svg>`,
  { size: 384 },
);

const PATCH = svg(
  `<svg viewBox="0 0 64 64">
  <rect x="4" y="4" width="56" height="56" rx="9" fill="#f1c93b" stroke="#3a2210" stroke-width="3"/>
  <rect x="9" y="9" width="46" height="46" rx="5" fill="none" stroke="#a8761c" stroke-width="2" stroke-dasharray="5 3"/>
  <path d="M32 12 L37.5 25 L51 26 L40.5 35 L44 49 L32 41.5 L20 49 L23.5 35 L13 26 L26.5 25 Z" fill="#d83a2a" stroke="#3a2210" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const TAG = svg(
  `<svg viewBox="0 0 120 44">
  <rect x="2" y="2" width="116" height="40" rx="8" fill="#d9a441" stroke="#4a2c10" stroke-width="3"/>
  <rect x="7" y="7" width="106" height="30" rx="5" fill="none" stroke="#7a5214" stroke-width="1.5"/>
  <text x="60" y="20" text-anchor="middle" font-family="serif" font-weight="bold" font-size="12" fill="#3a2210">TINKER &amp; CO.</text>
  <text x="60" y="33" text-anchor="middle" font-family="serif" font-style="italic" font-size="8" fill="#5a3a14">gadgets · gizmos · gears</text>
  <g fill="#4a2c10"><circle cx="11" cy="11" r="2"/><circle cx="109" cy="11" r="2"/><circle cx="11" cy="33" r="2"/><circle cx="109" cy="33" r="2"/></g>
  </svg>`,
  { size: 256 },
);

const SCROLL = svg(
  `<svg viewBox="0 0 128 32">
  <rect width="128" height="32" fill="#2f5fa8"/>
  <g stroke="#9cc4ff" stroke-width="0.6" opacity="0.7"><path d="M0 8H128M0 16H128M0 24H128M16 0V32M32 0V32M48 0V32M64 0V32M80 0V32M96 0V32M112 0V32"/></g>
  <circle cx="32" cy="16" r="9" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 2"/>
  <circle cx="32" cy="16" r="4" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <path d="M60 24 L84 8 L100 20 L116 6" fill="none" stroke="#ffffff" stroke-width="1.4"/>
  <path d="M56 28 H120" stroke="#ffffff" stroke-width="1"/>
  </svg>`,
  { size: 256 },
);

const GAUGE = gaugeTexture({ needle: 52, label: "STEAM" });

export default function build() {
  const b = createBuilder({ name: "gnome_tinkerer" });
  const R = rng(11);

  // ---- helpers -------------------------------------------------------------------------------------------------
  const ball = (
    at: V,
    r: number,
    color: any,
    bone: Joint,
    s: V = [1, 1, 1],
    seg: [number, number] = [8, 6],
  ) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]).scale(r * s[0], r * s[1], r * s[2]), color, {
      at,
      bone,
      flat: true,
    });
  const box = (at: V, size: V, color: any, bone: Joint, dir?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, dir ? { at, bone, dir } : { at, bone });
  const cyl = (at: V, dir: V, r0: number, r1: number, len: number, color: any, bone: Joint, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, sides), color, { at, bone, dir });
  const ringAround = (at: V, dir: V, r: number, tube: number, color: any, bone: Joint) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 10), color, { at, dir, axis: "z", bone });

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.49, 0.015],
      [0, 0.58, 0.02],
      [0, 0.67, 0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.69, 0.01], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.75, 0.02], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.8, 0.05], dir: [0, -0.25, 1], role: "jaw" });

  // ---- torso -----------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.37, 0], w: 0.27, h: 0.23 },
      { at: [0, 0.46, 0.02], w: 0.31, h: 0.28 },
      { at: [0, 0.55, 0.03], w: 0.31, h: 0.29 },
      { at: [0, 0.62, 0.012], w: 0.27, h: 0.22 },
      { at: [0, 0.665, 0.0], w: 0.2, h: 0.16 },
    ],
    { bone: [hips, spine], color: TUNIC, caps: { start: "flat", end: "round" } },
  );
  const skin = b.surface(torso);
  const front = (y: number, x = 0) => skin.ray([x, y, 1], [0, 0, -1]) ?? skin.nearest([x, y, 0.2]);

  // tunic hem trim, belt, buckle
  b.sweep(skin.loop([0, 0.4, 0], { lift: 0.006 }), 0.012, { color: "#e3b045", bone: hips, sides: 6 });
  const belt = skin.loop([0, 0.45, 0], { lift: 0.012 });
  b.sweep(belt, () => [0.026, 0.013], { color: LEATHER_DK, bone: hips });
  const bk = front(0.45);
  b.stick(new THREE.BoxGeometry(0.065, 0.014, 0.05), GILT, bk, { embed: 0.3, bone: hips });
  b.stick(new THREE.BoxGeometry(0.035, 0.016, 0.026), "#2a1a10", bk.moved([0, 0.004, 0]), { embed: 0.3, bone: hips });

  // apron: drawn bib on the torso plus a hanging skirt
  const apronHit = front(0.54);
  b.decal(torso, APRON, { at: apronHit.at, dir: [0, 0, 1], size: [0.26, 0.32], segments: 16 });
  b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.125, -0.165],
      [-0.125, -0.165],
    ],
    { at: [0, 0.455, 0.14], x: [1, 0, 0], y: [0, 1, -0.15], thickness: 0.012, bevel: 0.003, color: LEATHER, bone: hips },
  );
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.045, -0.06],
      [-0.045, -0.06],
    ],
    { at: [0, 0.38, 0.152], x: [1, 0, 0], y: [0, 1, -0.15], thickness: 0.016, color: LEATHER_DK, bone: hips },
  );

  // belt pouches with tools
  for (const s of [1, -1]) {
    const ph = front(0.43, s * 0.115);
    b.stick(new THREE.BoxGeometry(0.065, 0.04, 0.075), LEATHER_DK, ph, { embed: 0.2, bone: hips });
    b.stick(new THREE.BoxGeometry(0.07, 0.012, 0.03), LEATHER, ph.moved([0, 0.03, 0.025]), { embed: 0.2, bone: hips });
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), GILT, ph.moved([0, 0.045, 0.012]), { embed: 0.3, bone: hips });
  }
  const tool = front(0.43, 0.115);
  b.rod(tool.at, add([tool.at.x, tool.at.y, tool.at.z], [0.01, 0.07, 0.01]), 0.007, { color: STEEL, bone: hips, sides: 6 });
  b.rod(add([tool.at.x, tool.at.y, tool.at.z], [-0.012, 0.0, 0.01]), add([tool.at.x, tool.at.y, tool.at.z], [-0.025, 0.075, 0.015]), 0.01, { color: "#d83a2a", bone: hips, sides: 6 });

  // shoulder straps carrying the pack
  for (const s of [1, -1]) {
    const route = skin.drape(
      catmull([
        [s * 0.085, 0.62, -0.13],
        [s * 0.09, 0.745, -0.04],
        [s * 0.09, 0.745, 0.05],
        [s * 0.09, 0.62, 0.13],
        [s * 0.085, 0.5, 0.16],
      ]),
      { lift: 0.01 },
    );
    b.sweep(route, () => [0.02, 0.008], { color: LEATHER_DK, bone: chest });
    const sb = skin.nearest([s * 0.09, 0.56, 0.2]);
    b.stick(new THREE.BoxGeometry(0.04, 0.01, 0.035), BRASS, sb, { embed: 0.3, bone: chest });
  }

  // ---- head ------------------------------------------------------------------------------------------------------
  const HC: V = [0, 0.865, 0.035];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9).scale(0.125, 0.115, 0.12), SKIN, { at: HC, bone: head, flat: true });
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = face.around(HC).at(s * 24, 1);
    if (hit) b.decal(skull, EYE, { at: hit.at, dir: [s * 0.15, 0, 1], size: [0.072, 0.072], segments: 8 });
    // brows
    b.capsule([s * 0.018, 0.905, 0.152], [s * 0.088, 0.918, 0.118], [0.02, 0.013], { color: BEARD, bone: head, sides: 6 });
    b.capsule([s * 0.05, 0.915, 0.14], [s * 0.095, 0.935, 0.108], [0.014, 0.006], { color: BEARD, bone: head, sides: 5 });
    // cheeks
    ball([s * 0.088, 0.825, 0.118], 0.036, CHEEK, head, [1, 0.9, 0.8]);
    // ears
    const ear: [number, number, "sharp"?][] = [
      [0, -0.04],
      [0.08, -0.03],
      [0.16, 0.045, "sharp"],
      [0.07, 0.035],
      [0, 0.04],
    ] as any;
    b.extrude(ear as any, { at: [s * 0.115, 0.85, 0.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: SKIN, bone: head });
    b.extrude(
      [
        [0.01, -0.02],
        [0.07, -0.015],
        [0.13, 0.035, "sharp"],
        [0.06, 0.022],
        [0.01, 0.02],
      ] as any,
      { at: [s * 0.117, 0.852, 0.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.02, color: "#e98a78", bone: head },
    );
    // hair tufts at the temples
    for (let i = 0; i < 3; i++) {
      b.spike([s * 0.112, 0.9 - i * 0.022, -0.01 - i * 0.012], norm([s * 0.9, -0.35 - i * 0.15, -0.3]), 0.08 - i * 0.012, 0.026, {
        color: BEARD,
        bone: head,
        sides: 5,
        smooth: false,
      });
    }
    // mustache
    b.sweep(
      catmull([
        [s * 0.004, 0.802, 0.165],
        [s * 0.05, 0.79, 0.168],
        [s * 0.1, 0.775, 0.148],
        [s * 0.135, 0.785, 0.115],
        [s * 0.142, 0.82, 0.095],
      ]),
      [0.034, 0.03, 0.022, 0.013, 0.004],
      { color: BEARD, bone: head, sides: 6 },
    );
  }
  // nose, lips and jaw
  ball([0, 0.836, 0.172], 0.042, NOSE, head, [1, 0.95, 1.1], [10, 7]);
  ball([0, 0.797, 0.142], 0.02, LIP, head, [1.6, 0.7, 1]);
  box([0, 0.775, 0.082], [0.09, 0.04, 0.09], SKIN, jaw);
  box([0, 0.766, 0.15], [0.045, 0.014, 0.03], LIP, jaw);
  box([0, 0.77, 0.115], [0.04, 0.02, 0.05], "#7a2a30", jaw);

  // beard: core plus overlapping blades
  ball([0, 0.75, 0.04], 0.115, BEARD, head, [1, 0.88, 0.85], [10, 7]);
  const rows = [
    { n: 11, y: 0.745, rad: 0.112, len: 0.13, r: 0.034, from: 75, ph: 0 },
    { n: 9, y: 0.71, rad: 0.1, len: 0.15, r: 0.036, from: 66, ph: 0.5 },
    { n: 7, y: 0.675, rad: 0.085, len: 0.17, r: 0.037, from: 58, ph: 0 },
    { n: 5, y: 0.65, rad: 0.06, len: 0.19, r: 0.038, from: 40, ph: 0.5 },
    { n: 3, y: 0.63, rad: 0.03, len: 0.21, r: 0.04, from: 20, ph: 0 },
  ];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const a = ((-row.from + (2 * row.from * i) / (row.n - 1)) * Math.PI) / 180;
      const root: V = [row.rad * Math.sin(a), row.y, 0.03 + row.rad * Math.cos(a) * 0.95];
      const len = row.len * (0.8 + 0.4 * Math.cos(a)) * (0.92 + R() * 0.16);
      b.spike(root, norm([Math.sin(a) * 0.5, -1, 0.35 + Math.cos(a) * 0.1]), len, row.r, {
        color: BEARD,
        bone: head,
        sides: 5,
        smooth: false,
      });
    }
  }

  // ---- hat -------------------------------------------------------------------------------------------------------
  const hatPath = bezier([0, 0.94, 0.015], [0, 1.08, 0.03], [0, 1.22, -0.03], [0, 1.29, -0.2]);
  const hat = b.sweep(hatPath, [0.155, 0.012], {
    color: HAT,
    bone: head,
    sides: 9,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.195, 0.012],
      [0.16, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0.935, 0.02], color: HAT, bone: head, segments: 12 },
  );
  b.lathe(
    [
      [0.14, 0],
      [0.166, 0],
      [0.166, 0.04],
      [0.14, 0.04],
    ],
    { at: [0, 0.945, 0.018], color: HAT_BAND, bone: head, segments: 12 },
  );
  const tip = hatPath.at(1);
  ball([tip.x, tip.y - 0.03, tip.z], 0.03, GILT, head, [1, 1, 1], [8, 6]);
  const hatSurf = b.surface(hat);
  const ph = hatSurf.ray([0.5, 1.0, 0.02], [-1, 0, 0]) ?? hatSurf.nearest([0.15, 1.0, 0.02]);
  b.decal(hat, PATCH, { at: ph.at, dir: [1, 0, 0.1], size: [0.075, 0.075], segments: 8 });
  // goggles on the band
  for (const s of [1, -1]) {
    const lc: V = [s * 0.058, 0.972, 0.19];
    const ld = norm([s * 0.12, 0.25, 1]);
    ringAround(lc, ld, 0.034, 0.009, BRASS, head);
    glow(
      b.part(new THREE.CircleGeometry(0.03, 10), "#7fe8ff", {
        at: add(lc, mul(ld, 0.003)),
        dir: ld,
        axis: "z",
        bone: head,
      }),
      1.4,
    );
  }
  b.rod([-0.03, 0.975, 0.19], [0.03, 0.975, 0.19], 0.008, { color: BRASS, bone: head, sides: 6 });
  // brass gear pin on the other side
  b.part(gearGeometry({ teeth: 12, module: 0.0045, bore: 0.003, thickness: 0.007 }), GILT, {
    at: [-0.162, 0.968, 0.04],
    dir: [-1, 0, 0.1],
    bone: head,
  });

  // ---- arms and hands ----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh: V = [s * 0.16, 0.65, 0];
    const el: V = [s * 0.235, 0.52, -0.01];
    const wr: V = [s * 0.275, 0.39, 0.055];
    const arm = b.chain(`arm${L}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const wrist = arm.tip as Joint;
    b.sweep(arm, [0.058, 0.052, 0.047, 0.045, 0.047], {
      color: SLEEVE,
      bands: [
        [0.7, SLEEVE],
        [1, LEATHER],
      ],
    });
    ball(add(sh, [s * 0.01, 0.01, 0]), 0.064, SLEEVE, arm.joints[0], [1, 0.95, 1]);
    const cuff = arm.at(0.7);
    b.part(new THREE.TorusGeometry(0.05, 0.008, 5, 9), BRASS, { at: cuff.at, dir: cuff.tangent, axis: "z", bone: cuff.bone ?? chest });
    const cuff2 = arm.at(0.9);
    b.part(new THREE.TorusGeometry(0.047, 0.007, 5, 9), BRASS, { at: cuff2.at, dir: cuff2.tangent, axis: "z", bone: cuff2.bone ?? chest });
    // palm
    const pc: V = add(wr, [0, -0.035, 0.012]);
    ball(pc, 0.04, GLOVE, wrist, [0.8, 1, 0.9]);
    const fingers: [string, V, V, V][] = [];
    for (let i = 0; i < 3; i++) {
      const p0: V = [pc[0], pc[1] - 0.03, pc[2] + (i - 1) * 0.022];
      const p1: V = add(p0, [0, -0.032, 0.004]);
      const p2: V = add(p1, [0, -0.026, 0.01]);
      fingers.push([["index", "middle", "ring"][i], p0, p1, p2]);
    }
    const t0: V = add(pc, [-s * 0.03, 0, 0.035]);
    const t1: V = add(t0, [-s * 0.012, -0.015, 0.025]);
    const t2: V = add(t1, [-s * 0.004, -0.012, 0.02]);
    fingers.push(["thumb", t0, t1, t2]);
    for (const [nm, p0, p1, p2] of fingers) {
      const f = b.chain(`${nm}${L}`, polyline([p0, p1, p2]), {
        parent: wrist,
        names: [`${nm}1${L}`, `${nm}2${L}`, `${nm}3${L}`],
        role: "digit",
      });
      b.capsule(p0, p1, 0.0125, GLOVE, { bone: f.joints[0], sides: 6 });
      b.capsule(p1, p2, 0.0105, GLOVE, { bone: f.joints[1], sides: 6 });
    }
  }

  // ---- legs and boots ----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.09, 0.4, 0],
        [s * 0.1, 0.22, 0.02],
        [s * 0.1, 0.075, 0],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `ankle${L}`],
        role: "leg",
        contact: [s * 0.1, 0, 0.05],
      },
    );
    const ankle = leg.tip as Joint;
    const legTube = b.sweep(leg, [0.076, 0.068, 0.06, 0.058, 0.066], {
      color: PANTS,
      bands: [
        [0.58, PANTS],
        [1, BOOT],
      ],
    });
    const kp = legTube.at(0.4, 0);
    b.stick(new THREE.BoxGeometry(0.06, 0.012, 0.055), "#c9a24a", kp, { embed: 0.35 });
    b.stick(new THREE.BoxGeometry(0.044, 0.014, 0.038), "#d96b3a", kp.moved([0, 0.002, 0]), { embed: 0.35 });
    const bc = leg.at(0.58);
    b.part(new THREE.TorusGeometry(0.066, 0.011, 5, 9), BOOT, { at: bc.at, dir: bc.tangent, axis: "z", bone: bc.bone ?? hips });
    // foot
    b.part(new THREE.CylinderGeometry(0.066, 0.07, 0.06, 8).scale(1, 1, 1.9), SOLE, { at: [s * 0.1, 0.03, 0.045], bone: ankle });
    ball([s * 0.1, 0.06, 0.0], 0.068, BOOT, ankle, [1, 0.9, 1.1]);
    const toe = b.joint(`toe${L}`, { parent: ankle, at: [s * 0.1, 0.05, 0.11], dir: [0, 0, 1], role: "digit" });
    ball([s * 0.1, 0.054, 0.125], 0.058, BOOT, toe, [1, 0.85, 1.15], [8, 6]);
    box([s * 0.166, 0.1, 0.02], [0.014, 0.034, 0.034], BRASS, ankle);
    box([s * 0.1, 0.145, 0.0], [0.04, 0.012, 0.01], BRASS, ankle);
  }

  // ---- backpack ----------------------------------------------------------------------------------------------
  const PZ = -0.26;
  b.part(new THREE.BoxGeometry(0.34, 0.4, 0.22), PACK, { at: [0, 0.58, PZ], bone: chest });
  b.part(new THREE.BoxGeometry(0.36, 0.07, 0.24), PACK_DK, { at: [0, 0.795, PZ], bone: chest });
  b.part(new THREE.BoxGeometry(0.35, 0.04, 0.23), PACK_DK, { at: [0, 0.38, PZ], bone: chest });
  for (const y of [0.74, 0.4]) {
    b.part(new THREE.BoxGeometry(0.352, 0.036, 0.232), LEATHER_DK, { at: [0, y, PZ], bone: chest });
    for (const s of [1, -1]) {
      box([s * 0.178, y, PZ + 0.04], [0.014, 0.045, 0.04], BRASS, chest);
      box([s * 0.18, y, PZ + 0.04], [0.01, 0.02, 0.022], "#2a1a10", chest);
    }
  }
  // lid tag
  b.part(new THREE.PlaneGeometry(0.16, 0.058), "#ffffff", { at: [0, 0.8, -0.3815], dir: [0, 0, -1], axis: "z", texture: TAG, bone: chest });

  // gear train on the back
  const train = gearTrain(b, {
    at: [0, 0.58, -0.372],
    axis: [0, 0, -1],
    module: 0.006,
    spin: "gear",
    bone: chest,
    group: "pack",
    gears: [
      { teeth: 22, spokes: 5, bore: 0.004 },
      { teeth: 12, angle: 25 },
      { teeth: 16, from: 0, angle: 200, holes: 4, color: metal("copper", { verdigris: 0.3 }) },
      { teeth: 18, on: 1, shift: 0.016, texture: true, color: TINT.gilt },
      { teeth: 10, from: 3, angle: 120 },
    ],
  });
  train.spin(14);
  // spring along the pack's lower back
  b.sweep(coil([-0.12, 0.415, -0.388], [0.12, 0.415, -0.388], 0.012, 9), 0.0035, { color: BLUED, bone: chest, sides: 5 });

  // bedroll beneath the pack
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 8), BEDROLL, { at: [0, 0.345, PZ], dir: [1, 0, 0], bone: chest });
  for (const x of [-0.11, 0.11]) ringAround([x, 0.345, PZ], [1, 0, 0], 0.046, 0.007, LEATHER_DK, chest);
  b.part(new THREE.CircleGeometry(0.04, 8), "#f4d9a0", { at: [0.1805, 0.345, PZ], dir: [1, 0, 0], axis: "z", bone: chest });

  // ---- left side of pack (+X): gauge, hammer, lantern --------------------------------------------------------
  cyl([0.178, 0.64, PZ + 0.07], [1, 0, 0], 0.052, 0.052, 0.02, GILT, chest, 10);
  b.part(new THREE.CircleGeometry(0.043, 14), "#ffffff", { at: [0.189, 0.64, PZ + 0.07], dir: [1, 0, 0], axis: "z", texture: GAUGE, bone: chest });
  b.rod([0.17, 0.42, -0.31], [0.19, 0.66, -0.31], 0.013, { color: WOOD, bone: chest, sides: 6 });
  box([0.19, 0.675, -0.31], [0.05, 0.05, 0.11], IRON, chest);
  box([0.19, 0.675, -0.37], [0.045, 0.035, 0.02], STEEL, chest);
  for (const y of [0.46, 0.56]) ringAround([0.19, y, -0.31], [0, 1, 0], 0.018, 0.005, LEATHER_DK, chest);
  // lantern on a chain
  const LC: V = [0.215, 0.325, -0.2];
  ringAround([0.176, 0.455, -0.2], [1, 0, 0], 0.012, 0.004, BRASS, chest);
  b.rod([0.178, 0.455, -0.2], [0.215, 0.395, -0.2], 0.003, { color: STEEL, bone: chest, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(1, 7, 5).scale(0.03, 0.04, 0.03), "#ffd25a", { at: LC, bone: chest, flat: true }), 2);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) b.rod([LC[0] + sx * 0.03, LC[1] - 0.045, LC[2] + sz * 0.03], [LC[0] + sx * 0.03, LC[1] + 0.05, LC[2] + sz * 0.03], 0.004, { color: BRASS, bone: chest, sides: 4 });
  b.part(new THREE.ConeGeometry(0.048, 0.035, 8), BRASS, { at: [LC[0], LC[1] + 0.068, LC[2]], bone: chest });
  b.part(new THREE.CylinderGeometry(0.04, 0.034, 0.016, 8), BRASS, { at: [LC[0], LC[1] - 0.052, LC[2]], bone: chest });
  ringAround([LC[0], LC[1] + 0.09, LC[2]], [1, 0, 0], 0.01, 0.003, BRASS, chest);

  // ---- right side of pack (-X): telescope and wrench -----------------------------------------------------------
  const B0: V = [-0.19, 0.49, -0.31];
  const d = norm([-0.1, 1, -0.2]);
  const at = (k: number): V => add(B0, mul(d, k));
  b.rod(at(-0.04), at(0), 0.02, { color: IRON, bone: chest, sides: 8 });
  b.rod(at(0), at(0.2), 0.03, { color: BRASS, bone: chest, sides: 8 });
  b.rod(at(0.05), at(0.14), 0.033, { color: LEATHER, bone: chest, sides: 8 });
  b.rod(at(0.19), at(0.36), 0.024, { color: GILT, bone: chest, sides: 8 });
  b.rod(at(0.35), at(0.5), 0.019, { color: BRASS, bone: chest, sides: 8 });
  for (const k of [0.2, 0.36]) ringAround(at(k), d, k > 0.3 ? 0.026 : 0.032, 0.006, COPPER, chest);
  ringAround(at(0.5), d, 0.021, 0.006, GILT, chest);
  glow(b.part(new THREE.CircleGeometry(0.017, 8), "#8ee8ff", { at: add(at(0.502), [0, 0, 0]), dir: d, axis: "z", bone: chest }), 1.2);
  for (const k of [0.04, 0.17]) ringAround(at(k), d, 0.036, 0.006, LEATHER_DK, chest);
  // wrench
  b.extrude(
    [
      [0, -0.015],
      [0.2, -0.015],
      [0.22, -0.04],
      [0.27, -0.04],
      [0.29, -0.012],
      [0.25, -0.012],
      [0.25, 0.012],
      [0.29, 0.012],
      [0.27, 0.04],
      [0.22, 0.04],
      [0.2, 0.015],
      [0, 0.015],
    ],
    { at: [-0.18, 0.4, -0.18], x: [0, 0.98, -0.2], y: [0, 0.2, 0.98], thickness: 0.014, bevel: 0.003, color: STEEL, bone: chest },
  );
  ringAround([-0.18, 0.47, -0.2], [0, 1, 0], 0.02, 0.005, LEATHER_DK, chest);

  // ---- top of pack: scroll, propeller, antenna, steam pipe -----------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10), "#ffffff", { at: [0, 0.858, -0.19], dir: [1, 0, 0], bone: chest, texture: SCROLL });
  for (const x of [-0.17, 0.17]) cyl([x, 0.858, -0.19], [1, 0, 0], 0.033, 0.033, 0.012, "#f1e4c0", chest, 10);
  for (const x of [-0.09, 0.09]) ringAround([x, 0.858, -0.19], [1, 0, 0], 0.032, 0.005, "#d83a2a", chest);
  // propeller
  const hub: V = [-0.1, 0.915, -0.3];
  b.rod([-0.1, 0.83, -0.3], hub, 0.008, { color: BRASS, bone: chest, sides: 6 });
  const prop = b.joint("prop", { parent: chest, at: hub, dir: [0, 1, 0], role: "hinge" });
  cyl(hub, [0, 1, 0], 0.016, 0.016, 0.03, GILT, prop, 8);
  for (const s of [1, -1])
    b.extrude(
      [
        [0.01, -0.012],
        [0.1, -0.024],
        [0.125, 0.0, "sharp"],
        [0.1, 0.02],
        [0.01, 0.012],
      ] as any,
      { at: hub, x: [s, 0, 0], y: [0, 0, 1], thickness: 0.005, color: s > 0 ? "#d83a2a" : "#f1c93b", bone: prop },
    );
  // antenna with crystal
  b.rod([0.0, 0.83, -0.33], [0.0, 0.98, -0.345], 0.006, { color: STEEL, bone: chest, sides: 6 });
  ringAround([0, 0.9, -0.337], [0, 1, -0.1], 0.012, 0.004, COPPER, chest);
  glow(b.part(new THREE.OctahedronGeometry(0.035).scale(1, 1.7, 1), "#66f0d0", { at: [0, 1.03, -0.348], bone: chest, flat: true }), 1.6);
  // steam pipe + puffs
  b.sweep(
    catmull([
      [0.11, 0.83, -0.3],
      [0.11, 0.9, -0.3],
      [0.13, 0.95, -0.31],
      [0.17, 0.972, -0.32],
    ]),
    0.016,
    { color: COPPER, bone: chest, sides: 7 },
  );
  ringAround([0.11, 0.87, -0.3], [0, 1, 0], 0.019, 0.005, GILT, chest);
  b.lathe(
    [
      [0, 0],
      [0.014, 0],
      [0.034, 0.05],
      [0.028, 0.054],
      [0.01, 0.012],
      [0, 0.012],
    ],
    { at: [0.17, 0.972, -0.32], axis: norm([1, 0.5, -0.1]), color: BRASS, bone: chest, segments: 8 },
  );
  const puffs: [V, number, string][] = [
    [[0.235, 1.045, -0.33], 0.03, PUFF_A],
    [[0.265, 1.12, -0.34], 0.042, PUFF_B],
    [[0.245, 1.21, -0.35], 0.054, PUFF_A],
  ];
  for (const [p, r, c] of puffs) ball(p, r, c, chest, [1, 0.9, 1], [7, 5]);

  // upper pack extras: side pouch buckles
  for (const s of [1, -1]) box([s * 0.19, 0.795, PZ + 0.06], [0.016, 0.05, 0.04], BRASS, chest);

  return b.root;
}
