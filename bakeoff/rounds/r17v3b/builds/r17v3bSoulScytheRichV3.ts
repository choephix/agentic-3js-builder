import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { countershade, mix, mottle, paint, patches } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A dragon-skull soul reaper's scythe on a runed plinth: vertebra shaft with a glowing spectral core, soul-cage orb, a skull whose jaws clamp a wing-bone blade of spirit membrane, trailing soul fire and ghosts.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone, midnight-violet iron, gold trim, one strong spectral-teal accent (glow).
const BONE = "#f0e5c8";
const BONE_M = "#dccba2";
const BONE_D = "#b49c70";
const BONE_S = "#7a6652";
const IRON = "#2b2150";
const IRON_L = "#4d3f86";
const IRON_D = "#150e28";
const GOLD = "#e8b54a";
const GOLD_D = "#a06f22";
const TEAL = "#2ff5c8";
const TEAL_L = "#c2fff3";
const TEAL_D = "#10a58f";
const TEAL_DEEP = "#0b3f4f";
const VIOLET = "#8a5cff";
const VIOLET_D = "#3b1f7d";

const norm = (v: number[]) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

// ---------------------------------------------------------------------------------------------------------------
// Blade geometry (local to the blade root; x along the blade, y up): a wing-bone crescent with scalloped membrane.
const LOBES = 4;
const STEPS = 8;
const centre = bezier([0, 0, 0], [0.45, 0.24, 0], [0.95, 0.18, 0], [1.08, -0.3, 0]);
const topA = (u: number) => 0.03 * Math.sqrt(1 - u);
const botB = (u: number) =>
  0.16 *
  Math.min(1, u / 0.22) *
  Math.pow(1 - u, 0.75) *
  (0.7 + 0.3 * (1 - Math.abs(Math.sin(Math.PI * LOBES * u))));
const bladeAt = (u: number) => {
  const c = centre.at(u);
  const t = centre.tangentAt(u);
  const nx = -t.y;
  const ny = t.x;
  return { c: [c.x, c.y], t: [t.x, t.y], n: [nx, ny] };
};
const topPts: number[][] = [];
const botPts: number[][] = [];
for (let i = 0; i <= LOBES * STEPS; i++) {
  const u = i / (LOBES * STEPS);
  const { c, n } = bladeAt(u);
  topPts.push([c[0] + n[0] * topA(u), c[1] + n[1] * topA(u)]);
  botPts.push([c[0] - n[0] * botB(u), c[1] - n[1] * botB(u)]);
}
const bladeOutline: OutlinePoint[] = [
  ...topPts.map((p) => [p[0], p[1]] as OutlinePoint),
  ...botPts
    .slice(0, -1)
    .reverse()
    .map((p) => [p[0], p[1]] as OutlinePoint),
];
const spineYAt = (x: number) => {
  for (let i = 1; i < topPts.length; i++) {
    if (topPts[i][0] >= x) {
      const a = topPts[i - 1];
      const bb = topPts[i];
      const k = (x - a[0]) / Math.max(bb[0] - a[0], 1e-6);
      return a[1] + (bb[1] - a[1]) * k;
    }
  }
  return topPts[topPts.length - 1][1];
};

// Blade drawing: glowing veins, scalloped inner edge line and runes. Pixel space: 800 px per meter.
const K = 800;
const SW = 960;
const SH = 496;
const YMAX = 0.22;
const px = (x: number, y: number) => `${(x * K).toFixed(1)},${((YMAX - y) * K).toFixed(1)}`;
const GLYPHS = [
  "M0 -11 L0 11 M-7 -4 L7 4",
  "M-8 -10 L8 -10 L0 10 Z",
  "M-9 0 L0 -10 L9 0 L0 10 Z M0 -4 L0 4",
  "M-8 -10 L-8 10 M-8 0 L8 -10 M-8 0 L8 10",
  "M0 -10 L0 10 M-9 -3 L9 -3 M-6 5 L6 5",
  "M-8 8 L0 -10 L8 8 M-5 2 L5 2",
];
const bladeSvg = (mirror: boolean) => {
  let body = "";
  for (const f of [0.38, 0.72]) {
    const pts: string[] = [];
    for (let i = 3; i <= LOBES * STEPS - 2; i++) {
      const u = i / (LOBES * STEPS);
      const { c, n } = bladeAt(u);
      const d = botB(u) * f;
      pts.push(px(c[0] - n[0] * d, c[1] - n[1] * d));
    }
    body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${TEAL}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
    body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${TEAL_L}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  // rim light just inside the cutting edge
  const rim: string[] = [];
  for (let i = 1; i <= LOBES * STEPS - 1; i++) {
    const u = i / (LOBES * STEPS);
    const { c, n } = bladeAt(u);
    const d = botB(u) * 0.9;
    rim.push(px(c[0] - n[0] * d, c[1] - n[1] * d));
  }
  body += `<polyline points="${rim.join(" ")}" fill="none" stroke="${TEAL_L}" stroke-width="5" stroke-linejoin="miter"/>`;
  // finger-bone shadows between membrane panels, soft dark creases
  [0.25, 0.5, 0.75].forEach((u) => {
    const { c, n } = bladeAt(u);
    const a = px(c[0] + n[0] * topA(u) * 0.6, c[1] + n[1] * topA(u) * 0.6);
    const e = px(c[0] - n[0] * botB(u) * 0.97, c[1] - n[1] * botB(u) * 0.97);
    body += `<line x1="${a.split(",")[0]}" y1="${a.split(",")[1]}" x2="${e.split(",")[0]}" y2="${e.split(",")[1]}" stroke="${TEAL_DEEP}" stroke-width="12" stroke-linecap="round"/>`;
  });
  // runes in each panel
  [0.12, 0.375, 0.625, 0.88].forEach((u, i) => {
    const { c, n, t } = bladeAt(u);
    const bb = botB(u);
    const at = px(c[0] - n[0] * bb * 0.55, c[1] - n[1] * bb * 0.55);
    const ang = (-Math.atan2(t[1], t[0]) * 180) / Math.PI;
    const sc = Math.min(1.5, Math.max(0.55, bb / 0.08)) * 1.35;
    body += `<g transform="translate(${at.split(",")[0]} ${at.split(",")[1]}) rotate(${ang.toFixed(1)}) scale(${sc.toFixed(2)})"><path d="${GLYPHS[(i * 2 + 1) % GLYPHS.length]}" fill="none" stroke="${TEAL_L}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  });
  const wrap = mirror ? `<g transform="translate(${SW} 0) scale(-1 1)">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}">${wrap}</svg>`;
};

// Floor rune circle (top of the plinth).
const runeRing = () => {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`;
  s += `<circle cx="256" cy="256" r="240" fill="none" stroke="${TEAL}" stroke-width="8"/>`;
  s += `<circle cx="256" cy="256" r="224" fill="none" stroke="${TEAL_D}" stroke-width="4"/>`;
  s += `<circle cx="256" cy="256" r="124" fill="none" stroke="${TEAL}" stroke-width="6"/>`;
  s += `<circle cx="256" cy="256" r="136" fill="none" stroke="${TEAL_D}" stroke-width="4"/>`;
  for (const off of [0, 60]) {
    const pts: string[] = [];
    for (let k = 0; k < 3; k++) {
      const a = ((off + k * 120 - 90) * Math.PI) / 180;
      pts.push(`${(256 + 206 * Math.cos(a)).toFixed(1)},${(256 + 206 * Math.sin(a)).toFixed(1)}`);
    }
    s += `<polygon points="${pts.join(" ")}" fill="none" stroke="${TEAL_D}" stroke-width="5" stroke-linejoin="miter"/>`;
  }
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 * Math.PI) / 180;
    const cx = 256 + 176 * Math.cos(a);
    const cy = 256 + 176 * Math.sin(a);
    s += `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(k * 30 + 90).toFixed(0)}) scale(1.35)"><path d="${GLYPHS[k % GLYPHS.length]}" fill="none" stroke="${TEAL_L}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return s + `</svg>`;
};

const FLAME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M20 78 C6 62 8 44 18 30 C20 24 15 16 22 2 C30 16 37 30 34 48 C33 62 28 72 20 78Z" fill="${TEAL}"/>
<path d="M20 74 C12 62 14 48 20 38 C27 50 28 62 20 74Z" fill="${TEAL_L}"/></svg>`;

const GHOST = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100">
<path d="M30 4 C46 4 55 18 52 34 C51 46 44 52 41 62 C37 74 46 84 33 97 C33 86 27 80 25 70 C21 60 8 54 8 36 C6 18 14 4 30 4Z" fill="#9ffbe6" stroke="${TEAL}" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="21" cy="30" rx="5.5" ry="8.5" fill="${TEAL_DEEP}"/><ellipse cx="39" cy="30" rx="5.5" ry="8.5" fill="${TEAL_DEEP}"/>
<ellipse cx="30" cy="46" rx="4.5" ry="6" fill="${TEAL_DEEP}"/></svg>`;

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const jaw = b.joint("jaw", { parent: base, at: [-0.01, 1.875, 0], aim: [0.27, 1.83, 0], role: "jaw" });
  const on = { bone: base };

  // Paints --------------------------------------------------------------------------------------------------------
  const boneP = countershade(mottle(BONE, BONE_M, { size: 0.05, contrast: 0.8, seed: 3 }), BONE_D, {
    level: -0.1,
    soft: 0.7,
  });
  const boneShadeP = countershade(mottle(BONE_M, BONE_D, { size: 0.04, contrast: 0.8, seed: 5 }), BONE_S, {
    level: 0,
    soft: 0.6,
  });
  const ironP = countershade(mottle(IRON, IRON_L, { size: 0.08, contrast: 0.7, seed: 11 }), IRON_D, {
    level: -0.1,
    soft: 0.6,
  });
  const stoneP = countershade(
    patches(IRON_D, mottle(IRON, IRON_L, { size: 0.1, contrast: 0.6, seed: 2 }), { size: 0.14, gap: 0.07, seed: 4 }),
    IRON_D,
    { level: -0.2, soft: 0.5 },
  );
  const leatherP = mottle(VIOLET_D, IRON, { size: 0.03, contrast: 0.6, seed: 8 });
  const wrapP = (turns: number) =>
    paint((_p, _n, s) => {
      const d = (((s[1] - turns * s[0]) % 60) + 60) % 60;
      return d < 8 ? TEAL_D : leatherP;
    });
  const hornP = paint((_p, _n, s) => {
    if (s[0] > 0.84) return mix(TEAL_D, TEAL, (s[0] - 0.84) / 0.16);
    return Math.floor(s[0] * 14) % 2 ? boneShadeP : boneP;
  });
  const bladeP = paint((_p, _n, s) => {
    const t = Math.min(Math.max((spineYAt(s[0]) - s[1]) / 0.17, 0), 1);
    return t < 0.5 ? mix(VIOLET_D, TEAL_DEEP, t * 2) : mix(TEAL_DEEP, TEAL_D, (t - 0.5) * 2);
  });

  // Plinth ----------------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.44, 0],
      [0.47, 0.02],
      [0.47, 0.06],
      [0.41, 0.09],
      [0.41, 0.11],
      [0.31, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0, 0], segments: 8, color: stoneP, name: "plinth", ...on },
  );
  // gold rim band
  b.lathe(
    [
      [0.455, 0.0],
      [0.485, 0.01],
      [0.485, 0.03],
      [0.455, 0.04],
    ],
    { at: [0, 0.02, 0], segments: 8, color: GOLD, name: "plinthBand", ...on },
  );
  const ringPts = (r: number, y: number, n: number) =>
    Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * Math.PI * 2), y, r * Math.sin((i / n) * Math.PI * 2)]);
  glow(
    b.sweep(catmull(ringPts(0.4, 0.1, 16), { closed: true }), 0.007, { color: TEAL, sides: 4, name: "plinthGlow", ...on }),
    1.2,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", {
      at: [0, 0.1425, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: svg(runeRing(), { size: 512 }),
      name: "runeRing",
      ...on,
    }),
    1.2,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const long = k % 2 === 0;
    b.spike([0.42 * c, 0.07, 0.42 * s], norm([c * 0.6, 1, s * 0.6]), long ? 0.2 : 0.12, long ? 0.034 : 0.026, {
      color: boneP,
      sides: 5,
      name: "plinthSpike",
      ...on,
    });
    b.part(new THREE.SphereGeometry(0.036, 6, 4), BONE_M, { at: [0.43 * c, 0.07, 0.43 * s], flat: true, ...on });
    const a2 = a + Math.PI / 8;
    glow(
      b.part(new THREE.OctahedronGeometry(0.024), TEAL, {
        at: [0.445 * Math.cos(a2), 0.085, 0.445 * Math.sin(a2)],
        scale: [1, 1.4, 1],
        flat: true,
        name: "plinthGem",
        ...on,
      }),
      1.4,
    );
  }

  // Ferrule and gripping talons ----------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.012, 0.02],
      [0.05, 0.05],
      [0.058, 0.09],
      [0.045, 0.12],
      [0.05, 0.15],
      [0.064, 0.2],
      [0.062, 0.26],
      [0.05, 0.28],
      [0, 0.28],
    ],
    { at: [0, 0.12, 0], segments: 8, color: ironP, name: "ferrule", ...on },
  );
  glow(
    b.lathe(
      [
        [0.058, 0],
        [0.07, 0.01],
        [0.07, 0.022],
        [0.058, 0.032],
      ],
      { at: [0, 0.27, 0], segments: 8, color: TEAL, name: "ferruleGlow", ...on },
    ),
    1.3,
  );
  b.lathe(
    [
      [0.05, 0],
      [0.074, 0.004],
      [0.078, 0.014],
      [0.074, 0.024],
      [0.05, 0.028],
    ],
    { at: [0, 0.375, 0], segments: 8, color: GOLD, name: "ferruleCollar", ...on },
  );
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const at = (r: number, y: number) => [c * r, y, s * r];
    b.sweep(bezier(at(0.21, 0.13), at(0.25, 0.3), at(0.18, 0.46), at(0.07, 0.45)), [0.034, 0.005], {
      color: boneP,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "talon",
      ...on,
    });
    b.part(new THREE.SphereGeometry(0.046, 7, 5), boneShadeP, { at: at(0.21, 0.15), flat: true, ...on });
    b.spike(at(0.21, 0.13), norm([c * 0.9, -0.2, s * 0.9]), 0.1, 0.018, { color: boneShadeP, sides: 5, ...on });
  }

  // Shaft: glowing sinew core threaded through dragon vertebrae and wrapped grips -----------------------------------------
  glow(
    b.sweep(
      [
        [0, 0.34, 0],
        [0, 1.84, 0],
      ],
      0.02,
      { color: TEAL, sides: 6, caps: "flat", name: "shaftCore", ...on },
    ),
    1.3,
  );
  const VERT: OutlinePoint[] = [
    [0, 0],
    [0.046, 0],
    [0.056, 0.012],
    [0.042, 0.03],
    [0.036, 0.05],
    [0.042, 0.07],
    [0.056, 0.088],
    [0.046, 0.1],
    [0, 0.1],
  ];
  [0.42, 0.535, 1.01, 1.125, 1.24].forEach((y, i) => {
    b.lathe(VERT, { at: [0, y, 0], segments: 8, color: boneP, name: "vertebra", ...on });
    for (const s of [1, -1]) {
      b.spike([0, y + 0.06, s * 0.036], norm([0, 0.6, s]), i % 2 ? 0.11 : 0.08, 0.019, {
        color: boneP,
        sides: 5,
        name: "neuralSpine",
        ...on,
      });
      b.spike([s * 0.04, y + 0.05, 0], norm([s, 0.3, 0]), 0.07, 0.013, {
        color: boneShadeP,
        sides: 5,
        name: "processTransverse",
        ...on,
      });
    }
  });
  const ringOutline: OutlinePoint[] = [
    [0.03, 0],
    [0.052, 0.004],
    [0.058, 0.013],
    [0.052, 0.022],
    [0.03, 0.026],
  ];
  const grip = (y0: number, y1: number, turns: number, name: string) => {
    b.sweep(
      [
        [0, y0, 0],
        [0, y1, 0],
      ],
      0.036,
      { color: wrapP(turns), sides: 8, caps: "flat", name, ...on },
    );
    for (const y of [y0 - 0.014, y1 - 0.012])
      b.lathe(ringOutline, { at: [0, y, 0], segments: 8, color: GOLD, name: `${name}Ring`, ...on });
    // studs on the wrap
    const studs: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 4; k++)
      for (let q = 0; q < 8; q++) {
        const a = (q / 8) * Math.PI * 2 + k * 0.4;
        studs.push(
          new THREE.SphereGeometry(0.008, 5, 4).translate(
            0.038 * Math.cos(a),
            y0 + 0.05 + ((y1 - y0 - 0.1) * k) / 3,
            0.038 * Math.sin(a),
          ),
        );
      }
    b.part(mergeGeometries(studs), GOLD_D, { at: [0, 0, 0], name: `${name}Studs`, ...on });
  };
  grip(0.665, 0.98, 2400, "gripLow");
  grip(1.37, 1.58, 1600, "gripHigh");

  // Soul cage: bone ribs around a floating soul orb --------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.07, 0.02],
      [0.045, 0.04],
      [0.03, 0.05],
      [0, 0.05],
    ],
    { at: [0, 1.595, 0], segments: 8, color: boneShadeP, name: "cageCup", ...on },
  );
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [c * 0.05, 1.64, s * 0.05],
        [c * 0.13, 1.715, s * 0.13],
        [c * 0.05, 1.79, s * 0.05],
      ]),
      [0.014, 0.017, 0.014],
      { color: boneP, sides: 6, name: "cageRib", ...on },
    );
  }
  b.sweep(catmull(ringPts(0.132, 1.715, 12), { closed: true }), 0.009, { color: GOLD, sides: 6, name: "cageBand", ...on });
  glow(b.part(new THREE.IcosahedronGeometry(0.066, 1), TEAL, { at: [0, 1.715, 0], flat: true, name: "soulOrb", ...on }), 1.5);
  glow(
    b.part(new THREE.IcosahedronGeometry(0.03, 0), TEAL_L, { at: [0, 1.715, 0], flat: true, name: "soulOrbCore", ...on }),
    1.6,
  );

  // Skull ----------------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.075, 0.02],
      [0.07, 0.09],
      [0.05, 0.1],
      [0, 0.1],
    ],
    { at: [0, 1.78, 0], segments: 8, color: ironP, name: "skullCollar", ...on },
  );
  b.lathe(ringOutline, { at: [0, 1.795, 0], segments: 8, color: GOLD, name: "collarRing", scale: undefined, ...on });
  b.part(new THREE.SphereGeometry(1, 10, 8), boneP, {
    at: [-0.01, 1.95, 0],
    scale: [0.115, 0.092, 0.088],
    flat: true,
    name: "cranium",
    ...on,
  });
  b.frustumBox([0.0, 1.955, 0], [0.3, 1.943, 0], [0.145, 0.1], [0.07, 0.056], { color: boneP, name: "upperJaw", ...on });
  b.part(new THREE.SphereGeometry(0.036, 7, 5), boneShadeP, { at: [0.3, 1.945, 0], scale: [1, 0.8, 1.1], flat: true, ...on });
  b.spike([0.29, 1.965, 0], norm([0.5, 1, 0]), 0.06, 0.016, { color: boneP, sides: 5, name: "noseHorn", ...on });
  for (const x of [0.1, 0.17, 0.23]) b.spike([x, 1.985, 0], norm([-0.4, 1, 0]), 0.034, 0.012, { color: boneShadeP, sides: 5, ...on });
  for (const s of [1, -1]) {
    // eye socket, eye, brow, nostril, cheek, teeth
    b.part(new THREE.SphereGeometry(0.03, 7, 5), IRON_D, { at: [0.065, 1.978, s * 0.066], scale: [1.2, 0.9, 0.8], flat: true, ...on });
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), TEAL, { at: [0.072, 1.978, s * 0.075], name: "eye", ...on }), 1.8);
    b.spike([0.05, 2.0, s * 0.06], norm([-0.55, 0.55, s * 0.4]), 0.1, 0.02, { color: boneP, sides: 5, name: "brow", ...on });
    b.part(new THREE.SphereGeometry(0.009, 5, 4), IRON_D, { at: [0.3, 1.96, s * 0.026], ...on });
    b.spike([0.02, 1.925, s * 0.072], norm([-1, -0.2, s * 0.35]), 0.1, 0.018, { color: boneShadeP, sides: 5, name: "cheekSpike", ...on });
    for (let k = 0; k < 5; k++) {
      const x = 0.08 + k * 0.05;
      b.spike([x, 1.925, s * (0.035 - k * 0.002)], [0, -1, 0], k === 2 ? 0.05 : 0.036, 0.011, {
        color: BONE_L(),
        sides: 5,
        name: "fang",
        ...on,
      });
      b.spike([x + 0.02, 1.83 + 0.036 - k * 0.0, s * (0.028 - k * 0.002)], [0, 1, 0], 0.03, 0.009, {
        color: BONE_L(),
        sides: 5,
        bone: jaw,
      });
    }
    // great horns
    b.sweep(
      bezier([-0.05, 1.99, s * 0.065], [-0.2, 2.1, s * 0.11], [-0.36, 2.16, s * 0.15], [-0.5, 2.02, s * 0.2]),
      [0.04, 0.004],
      { color: hornP, sides: 6, caps: { start: "round", end: "point" }, name: "greatHorn", ...on },
    );
    b.sweep(
      bezier([-0.04, 1.93, s * 0.075], [-0.14, 1.93, s * 0.12], [-0.22, 1.88, s * 0.17], [-0.3, 1.8, s * 0.2]),
      [0.024, 0.004],
      { color: hornP, sides: 6, caps: { start: "round", end: "point" }, name: "lowHorn", ...on },
    );
  }
  // lower jaw (hinged)
  b.frustumBox([0.0, 1.872, 0], [0.27, 1.83, 0], [0.1, 0.04], [0.05, 0.028], { color: boneShadeP, bone: jaw, name: "lowerJaw" });
  b.spike([0.27, 1.826, 0], norm([0.7, -0.5, 0]), 0.06, 0.016, { color: boneP, sides: 5, bone: jaw, name: "chin" });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), TEAL, { at: [0.02, 1.9, 0], name: "mouthFire", ...on }), 1.3);

  // Blade --------------------------------------------------------------------------------------------------------------
  const B0 = [0.1, 1.895, 0];
  const w = (p: number[], z = 0) => [B0[0] + p[0], B0[1] + p[1], z];
  b.extrude(bladeOutline, {
    at: B0,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: bladeP,
    name: "bladeMembrane",
    ...on,
  });
  const bladeCenter = [B0[0] + 0.6, B0[1] + YMAX - SH / K / 2, 0];
  for (const z of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(SW / K, SH / K), "#ffffff", {
        at: [bladeCenter[0], bladeCenter[1], z * 0.0075],
        dir: [0, 0, z],
        axis: "z",
        texture: svg(bladeSvg(z < 0), { size: 960 }),
        name: z > 0 ? "bladeRunesFront" : "bladeRunesBack",
        ...on,
      }),
      1.2,
    );
  // scalloped cutting edge glow
  glow(
    b.sweep(
      polyline(botPts.map((p) => w(p))),
      0.0055,
      { color: TEAL_L, sides: 4, name: "bladeEdge", ...on },
    ),
    1.5,
  );
  // wing-bone spine
  const spinePts: number[][] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const { c, n } = bladeAt(u);
    spinePts.push(w([c[0] + n[0] * topA(u) * 0.6, c[1] + n[1] * topA(u) * 0.6]));
  }
  b.sweep(catmull(spinePts), (t) => 0.034 * Math.pow(1 - t, 0.6) + 0.007, {
    color: boneP,
    sides: 6,
    caps: { start: "round", end: "point" },
    name: "bladeSpine",
    ...on,
  });
  // knuckles and dorsal spikes along the spine
  [0.12, 0.28, 0.44, 0.6, 0.76].forEach((u, i) => {
    const { c, n, t } = bladeAt(u);
    const p = w([c[0] + n[0] * topA(u) * 0.6, c[1] + n[1] * topA(u) * 0.6]);
    b.part(new THREE.SphereGeometry(0.036 * (1 - u * 0.6) + 0.006, 7, 5), boneShadeP, { at: p, flat: true, name: "knuckle", ...on });
    b.spike(
      [p[0] + n[0] * 0.02, p[1] + n[1] * 0.02, 0],
      norm([n[0] * 0.8 - t[0] * 0.6, n[1] * 0.8 - t[1] * 0.6, 0]),
      0.11 - i * 0.012,
      0.02 - i * 0.002,
      { color: boneP, sides: 5, name: "bladeSpike", ...on },
    );
  });
  // finger bones to the scallop tips, with claws
  [0.25, 0.5, 0.75].forEach((u) => {
    const { c, n, t } = bladeAt(u);
    const a = w([c[0] + n[0] * topA(u) * 0.6, c[1] + n[1] * topA(u) * 0.6]);
    const e = w([c[0] - n[0] * botB(u), c[1] - n[1] * botB(u)]);
    b.rod(a, e, [0.013, 0.006], { color: boneP, sides: 5, caps: "round", name: "finger", ...on });
    b.spike(e, norm([-n[0] * 0.8 + t[0] * 0.4, -n[1] * 0.8 + t[1] * 0.4, 0]), 0.05, 0.011, { color: BONE_L(), sides: 5, name: "fingerClaw", ...on });
  });
  const tip = w(topPts[topPts.length - 1]);
  b.spike([tip[0] - 0.02, tip[1] + 0.03, 0], norm([0.15, -1, 0]), 0.08, 0.012, { color: TEAL_L, sides: 5, name: "bladeTip", ...on });

  // Soul fire rising from the spine and dripping from the edge -------------------------------------------------------------
  const flame = svg(FLAME, { size: 128 });
  const flameFrames = [0.08, 0.17, 0.27, 0.37, 0.47, 0.57, 0.67, 0.77, 0.87].map((u) => {
    const { c, n } = bladeAt(u);
    return frame(w([c[0] + n[0] * (topA(u) + 0.03), c[1] + n[1] * (topA(u) + 0.03)]), [0, 1, 0]);
  });
  glow(b.cards(flameFrames, flame, { size: [0.07, 0.16], vary: 0.4, rng: rng(21), cross: true, bone: base }), 1.2);
  const dripFrames = [0.25, 0.5, 0.75].map((u) => {
    const { c, n } = bladeAt(u);
    return frame(w([c[0] - n[0] * botB(u), c[1] - n[1] * botB(u)]), [0, 1, 0]);
  });
  glow(b.cards(dripFrames, flame, { size: [0.06, 0.14], lean: 180, flow: [0, 0, 1], cross: true, bone: base }), 1.2);

  // Souls: ghosts circling the shaft, vortex ribbons and motes --------------------------------------------------------------
  const ghost = svg(GHOST, { size: 128 });
  const ghostFrames = [
    [0.34, 0.5, 0.22],
    [-0.3, 0.72, 0.28],
    [0.26, 1.0, -0.3],
    [-0.32, 1.26, -0.2],
    [0.3, 1.42, 0.26],
    [-0.28, 1.58, 0.24],
  ].map((p) => frame(p, [0, 1, 0]));
  glow(b.cards(ghostFrames, ghost, { size: [0.11, 0.18], vary: 0.2, rng: rng(5), cross: true, bone: base }), 1.1);
  for (const s of [1, -1]) {
    const sp = spiral([0, 0.2, 0], [0.24 * s, 0.2, 0], [0, 1, 0], { turns: 2.2, r1: 0.17, pitch: 0.42 });
    glow(
      b.sweep(sp, [0.012, 0.003], { color: TEAL, sides: 4, caps: { end: "point" }, name: "soulTrail", ...on }),
      1.2,
    );
  }
  const r = rng(9);
  const motes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 46; i++) {
    const top = i % 3 === 0;
    const a = r() * Math.PI * 2;
    const rad = top ? 0 : 0.2 + r() * 0.35;
    const p = top
      ? [0.25 + r() * 0.95, 1.7 + r() * 0.55, (r() - 0.5) * 0.3]
      : [rad * Math.cos(a), 0.25 + r() * 1.5, rad * Math.sin(a)];
    motes.push(new THREE.OctahedronGeometry(0.008 + r() * 0.012).translate(p[0], p[1], p[2]));
  }
  glow(b.part(mergeGeometries(motes), TEAL_L, { at: [0, 0, 0], name: "motes", ...on }), 1.4);

  // Tassel ribbon hanging from the soul cage (chain of joints) --------------------------------------------------------------
  const ribbon = b.chain(
    "ribbon",
    catmull([
      [0.085, 1.63, 0.085],
      [0.13, 1.5, 0.12],
      [0.11, 1.36, 0.1],
      [0.14, 1.2, 0.12],
    ]),
    { parent: base, names: ["ribbon1", "ribbon2", "ribbon3"], role: "tail" },
  );
  b.sweep(ribbon, () => [0.026, 0.003], {
    section: "box",
    caps: "flat",
    color: paint((_p, _n, s) => (s[0] > 0.93 ? GOLD : mix(VIOLET_D, TEAL_D, s[0] * s[0]))),
    name: "ribbonCloth",
  });
  b.part(new THREE.SphereGeometry(0.026, 6, 4), GOLD, { at: [0.085, 1.635, 0.085], flat: true, bone: base });
  glow(
    b.part(new THREE.OctahedronGeometry(0.032), TEAL, { at: [0.14, 1.18, 0.12], scale: [1, 1.5, 1], flat: true, bone: ribbon.joints[2], name: "ribbonGem" }),
    1.4,
  );
  void VIOLET;

  return b.root;
}
