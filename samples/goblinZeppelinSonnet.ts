import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Rgb } from "../src/paint";
import { cells, mix, mottle, noise, paint, patches, smoothstep } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Goblin Zeppelin 'Boombug'",
  description:
    "A ramshackle goblin airship hovering on mooring lines: patchwork stitched envelope, scrap-built plank gondola with copper steam pods, three wooden propellers, hinged rudder and elevators, bomb mortar, four goblin crew and a mooring field.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type N3 = [number, number, number];

// ------------------------------------------------------------------------------------------------ palette
const SKIN = "#86c43a";
const SKIN_D = "#5f9a26";
const SKIN_L = "#b4de5e";
const TUSK = "#f0e6c2";
const EYE = "#ffe347";
const INK = "#1c1410";
const WOOD = "#8c5a2e";
const WOOD_D = "#5b381b";
const WOOD_L = "#b98a52";
const WOOD_P = "#6f4524";
const IRON = "#4d535c";
const IRON_D = "#2c3037";
const IRON_L = "#8a929c";
const RUST = "#9b5430";
const BRASS = "#e0a92c";
const BRASS_D = "#9a6b1a";
const COPPER = "#cd6d33";
const COPPER_D = "#8c3f1e";
const PATINA = "#4fae8f";
const ROPE = "#cfa86c";
const ROPE_D = "#7c5a30";
const LEATHER = "#7a4a28";
const LEATHER_D = "#4a2c18";
const CLOTH_A = "#dcb46a";
const CLOTH_B = "#cfa059";
const CLOTH_C = "#b98a48";
const PATCHES = ["#c9532b", "#4f8f3a", "#ecdca8", "#8e5a36", "#e3922a", "#3f808a"];
const GREEN_BAND = "#3e8a2a";
const CREAM = "#f3e6b8";
const ORANGE = "#ee7a1c";
const RED = "#c23a22";
const STONE = "#8f8b82";
const SACK = "#bfa273";
const SACK_D = "#8d7347";
const GLASS = "#ffc659";
const FUSE = "#ffd24a";
const SOOT = "#3a3028";
const BLUEGREY = "#566a7d";

const ENV_Y = 7.2;
const tmp = new THREE.Vector3();

// ------------------------------------------------------------------------------------------------ paints
const fract = (x: number) => x - Math.floor(x);
const h1 = (i: number, s = 0) => fract(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);

function shade(col: Rgb, n: THREE.Vector3, cool = "#3d2850", warm = "#fff1bd"): Rgb {
  let c = col;
  c = mix(c, cool, smoothstep(0.05, -0.9, n.y) * 0.6);
  c = mix(c, warm, smoothstep(0.35, 1.0, n.y) * 0.36);
  return c;
}

const cloth = paint((p, n, s) => {
  const r = Math.max(Math.hypot(p.x, p.y - ENV_Y), 0.3);
  const deg = ((s[1] % 360) + 360) % 360;
  const GORE = 22.5;
  const gi = Math.floor(deg / GORE);
  const gd = deg - gi * GORE;
  const seam = Math.min(gd, GORE - gd) * (Math.PI / 180) * r;
  let col: Rgb = mix(mix(CLOTH_A, CLOTH_B, h1(gi, 3)), CLOTH_C, h1(gi, 9) * 0.35);
  col = mix(col, CLOTH_C, smoothstep(0.55, 0.82, noise(p, 0.45, 4)) * 0.55);
  tmp.set(p.x * 0.85, p.y * 0.85, p.z * 0.6);
  const c = cells(tmp, 1.15, 4);
  const e = c.d2 - c.d1;
  if (c.id < 0.5) {
    const pick = PATCHES[Math.floor((c.id / 0.5) * PATCHES.length)];
    let pc: Rgb = mix(pick, "#2a1c14", 0.06 + 0.12 * noise(p, 0.3, 7));
    pc = mix(pc, "#fff2c0", smoothstep(0.1, 0.5, e) * 0.1);
    col = pc;
    if (e < 0.05) col = mix(col, "#2a1a10", 0.8);
    else if (e > 0.07 && e < 0.115 && fract((p.x + p.y + p.z) * 9) < 0.55) col = mix(col, "#f4e6b4", 0.8);
  }
  // goblin green racing bands with cream pinstripes
  const z = p.z;
  const bands: Array<[number, number]> = [
    [-1.55, -0.95],
    [3.15, 3.75],
    [-3.85, -3.4],
  ];
  for (const [a, bb] of bands) {
    if (z > a && z < bb) {
      col = mix(GREEN_BAND, "#1f4a18", smoothstep(0.3, 0.9, noise(p, 0.4, 2)) * 0.4);
      const edge = Math.min(z - a, bb - z);
      if (edge > 0.045 && edge < 0.085) col = mix(CREAM, col, 0.12);
      else if (edge < 0.03) col = mix(col, "#2a1a10", 0.7);
    }
  }
  if (seam < 0.016) col = mix(col, "#3b2616", 0.6);
  else if (seam > 0.032 && seam < 0.05 && fract(p.z * 11) < 0.5) col = mix(col, "#fff0bf", 0.55);
  // leather end caps
  if (z > 6.08 || z < -6.0) col = mix(LEATHER, LEATHER_D, noise(p, 0.2, 3) * 0.6);
  // soot and grime, heavier astern and underneath
  const scorch = smoothstep(0.55, 0.8, noise(p, 1.1, 31)) * smoothstep(-1.5, -4.5, z) * smoothstep(-0.2, -0.9, n.y + 0.4);
  col = mix(col, "#2a1a14", scorch * 0.7);
  const grime = smoothstep(0.6, 0.85, noise(p, 0.8, 11)) * 0.38 + smoothstep(0.1, -1, n.y) * 0.2 + smoothstep(1.5, -5, z) * 0.12;
  col = mix(col, SOOT, grime);
  return shade(col, n);
});

const woodP = (a: string, b: string, c: string, plank = 0.17, seed = 1) =>
  paint((p, n) => {
    let across: number;
    let along: number;
    if (Math.abs(n.y) > 0.7) {
      across = p.x;
      along = p.z;
    } else {
      across = p.y;
      along = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
    }
    const row = Math.floor(across / plank);
    const f = across / plank - row;
    const hr = h1(row, seed);
    const j = Math.floor((along + hr * 3) / (1.3 + hr));
    const hj = h1(row * 31 + j, seed + 4);
    let col: Rgb = mix(mix(a, b, hr), c, hj * 0.6);
    const g = noise(tmp.set(along * 1.5, row * 9.7, across * 0.3), 0.5, seed);
    col = mix(col, WOOD_D, smoothstep(0.55, 0.9, g) * 0.35);
    if (f < 0.07 || f > 0.96) col = mix(col, "#2a170a", 0.65);
    else if (f > 0.84) col = mix(col, "#e0b078", 0.22);
    else if (f < 0.2) col = mix(col, "#2a170a", 0.15);
    const jf = fract((along + hr * 3) / (1.3 + hr)) * (1.3 + hr);
    if (jf < 0.025) col = mix(col, "#2a170a", 0.6);
    if (f > 0.35 && f < 0.65 && (jf < 0.1 || jf > 1.2 + hr - 0.1) && jf > 0.04) col = mix(col, IRON_D, 0.5);
    return shade(col, n, "#3a2840", "#ffe9b0");
  });

const woodPaint = woodP(WOOD, WOOD_L, WOOD_P, 0.17, 1);
const woodDark = woodP(WOOD_P, WOOD, WOOD_D, 0.14, 5);
const woodLight = woodP(WOOD_L, "#d6a96b", WOOD, 0.12, 8);

const copperPaint = paint((p, n) => {
  let col: Rgb = mix(COPPER_D, COPPER, smoothstep(-0.4, 0.9, n.y));
  col = mix(col, "#ffb27a", smoothstep(0.7, 1, n.y) * 0.25);
  col = mix(col, PATINA, smoothstep(0.58, 0.78, noise(p, 0.3, 3)) * 0.8);
  return col;
});
const ironPaint = mottle(IRON, RUST, { size: 0.18, seed: 2, contrast: 1.2 });
const ironDark = mottle(IRON_D, "#5a3a2a", { size: 0.15, seed: 6, contrast: 1.1 });
const stonePaint = patches(STONE, ["#a29d92", "#7d7a72", "#9a9488", "#6f7a62"], { size: 0.28, gap: 0.09, seed: 3 });
const sackPaint = mottle(SACK, SACK_D, { size: 0.08, seed: 4, contrast: 1.1 });
const skinPaint = mottle(SKIN, SKIN_D, { size: 0.07, seed: 5, contrast: 0.9 });
const tinPaint = paint((p, n) => {
  const w = 0.5 + 0.5 * Math.sin(p.x * 34);
  let col: Rgb = mix("#6f7b85", "#a9b4bb", w);
  col = mix(col, RUST, smoothstep(0.5, 0.8, noise(p, 0.28, 12)) * 0.75);
  col = mix(col, "#2e3a2a", smoothstep(0.7, 0.9, noise(p, 0.5, 14)) * 0.3);
  return shade(col, n);
});
const greenTin = paint((p, n) => {
  const w = 0.5 + 0.5 * Math.sin(p.x * 34);
  let col: Rgb = mix("#3f7a52", "#67a678", w);
  col = mix(col, RUST, smoothstep(0.55, 0.8, noise(p, 0.25, 16)) * 0.7);
  return shade(col, n);
});
const barrelPaint = paint((_p, n, s) => {
  const stave = Math.floor((((s[1] % 360) + 360) % 360) / 22.5);
  const f = ((s[1] % 22.5) + 22.5) % 22.5;
  let col: Rgb = mix(WOOD, WOOD_L, h1(stave, 2) * 0.7);
  if (f < 0.9 || f > 21.6) col = mix(col, "#2a170a", 0.65);
  return shade(col, n);
});
const finPaint = paint((p, n) => {
  let col: Rgb = mix(mix(CLOTH_A, CLOTH_B, noise(p, 0.9, 5)), CLOTH_C, smoothstep(0.55, 0.8, noise(p, 0.4, 6)) * 0.5);
  tmp.set(p.x * 1.2, p.y * 1.2, p.z * 1.2);
  const c = cells(tmp, 1.0, 23);
  const e = c.d2 - c.d1;
  if (c.id < 0.33) {
    col = mix(PATCHES[Math.floor((c.id / 0.33) * PATCHES.length)], "#2a1c14", 0.1);
    if (e < 0.05) col = mix(col, "#2a1a10", 0.8);
    else if (e > 0.07 && e < 0.115 && fract((p.x + p.y + p.z) * 9) < 0.55) col = mix(col, "#f4e6b4", 0.8);
  }
  col = mix(col, SOOT, smoothstep(0.6, 0.85, noise(p, 0.8, 13)) * 0.35);
  return shade(col, n);
});
const flagPaint = paint((_p, _n, s) => {
  const across = s[1];
  const along = s[0];
  const dx = (along - 0.2) * 2.3;
  const dy = (across - 0.5) * 0.68;
  const d = Math.hypot(dx, dy);
  if (d < 0.17) {
    if (d > 0.15) return INK;
    // skull dot eyes
    if (Math.hypot(dx - 0.05, dy - 0.03) < 0.035 || Math.hypot(dx - 0.05, dy + 0.03) < 0.035) return INK;
    if (Math.abs(dy) < 0.02 && dx < -0.08) return INK;
    return "#f3c52a";
  }
  if (across < 0.1 || across > 0.9) return ORANGE;
  if (Math.abs(along - 0.7) < 0.03 || Math.abs(along - 0.85) < 0.02) return CREAM;
  return mix("#3f8f2a", "#2c6a20", along);
});

// ------------------------------------------------------------------------------------------------ drawings
const EMBLEM = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="97" fill="#2b1b10"/>
  <circle cx="100" cy="100" r="90" fill="#f0b21f"/>
  <circle cx="100" cy="100" r="76" fill="#2b5a24"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#2b1b10" stroke-width="4" stroke-dasharray="9 7"/>
  <g stroke="#1b2e10" stroke-width="4" stroke-linejoin="round">
    <path d="M62 96 L14 58 L58 66 Z" fill="#9ad24a"/><path d="M138 96 L186 58 L142 66 Z" fill="#9ad24a"/>
    <ellipse cx="100" cy="104" rx="44" ry="42" fill="#9ad24a"/>
  </g>
  <path d="M64 86 L92 96 L86 108 L66 100Z" fill="#ffe94a" stroke="#1b2e10" stroke-width="3"/>
  <path d="M136 86 L108 96 L114 108 L134 100Z" fill="#ffe94a" stroke="#1b2e10" stroke-width="3"/>
  <circle cx="82" cy="101" r="4" fill="#1b2e10"/><circle cx="118" cy="101" r="4" fill="#1b2e10"/>
  <path d="M60 80 L94 90" stroke="#1b2e10" stroke-width="6" stroke-linecap="round"/>
  <path d="M140 80 L106 90" stroke="#1b2e10" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 100 L112 124 L98 127Z" fill="#7cb83a" stroke="#1b2e10" stroke-width="3"/>
  <path d="M68 130 Q100 146 132 130 L130 142 Q100 160 70 142Z" fill="#2b1b10"/>
  <path d="M74 136 L80 146 L86 139 L92 149 L98 141 L104 149 L110 139 L116 146 L122 136 Z" fill="#f4ecc8"/>
  <path d="M76 128 L80 138 L84 130Z M116 130 L120 138 L124 128Z" fill="#f4ecc8"/>
  <rect x="30" y="152" width="140" height="14" rx="5" fill="#c23a22" stroke="#2b1b10" stroke-width="3" transform="rotate(-6 100 159)"/>
  </svg>`,
  { size: 512 },
);

const NOSEFACE = svg(
  `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#1b1008" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M22 40 L100 62 L96 92 L28 78 Z" fill="#ffe33a"/>
    <path d="M218 40 L140 62 L144 92 L212 78 Z" fill="#ffe33a"/>
    <path d="M18 24 L106 58" fill="none" stroke-width="12"/>
    <path d="M222 24 L134 58" fill="none" stroke-width="12"/>
  </g>
  <ellipse cx="72" cy="76" rx="9" ry="14" fill="#1b1008"/><ellipse cx="168" cy="76" rx="9" ry="14" fill="#1b1008"/>
  <path d="M30 116 Q120 160 210 116 Q120 128 30 116Z" fill="#1b1008" stroke="#1b1008" stroke-width="10" stroke-linejoin="round"/>
  <path d="M34 114 L48 138 L60 118 L74 144 L88 122 L104 148 L120 124 L136 148 L152 122 L166 144 L180 118 L192 138 L206 114 Z" fill="#f4ecc8" stroke="#1b1008" stroke-width="4" stroke-linejoin="round"/>
  <path d="M120 124 L120 146" stroke="#1b1008" stroke-width="3"/>
  </svg>`,
  { size: 512 },
);

const NAMEPLATE = svg(
  `<svg viewBox="0 0 280 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="276" height="66" rx="8" fill="#e7c37a" stroke="#3a2210" stroke-width="5"/>
  <rect x="9" y="9" width="262" height="52" rx="5" fill="none" stroke="#a5361f" stroke-width="3"/>
  <text x="140" y="49" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="42" fill="#b52c18" stroke="#3a2210" stroke-width="2">BOOMBUG</text>
  <circle cx="18" cy="18" r="3.5" fill="#3a2210"/><circle cx="262" cy="18" r="3.5" fill="#3a2210"/>
  <circle cx="18" cy="52" r="3.5" fill="#3a2210"/><circle cx="262" cy="52" r="3.5" fill="#3a2210"/>
  </svg>`,
  { size: 512 },
);

const SIGN = svg(
  `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 14 L190 14 L234 40 L190 66 L6 66 Z" fill="#c8a165" stroke="#3a2210" stroke-width="5" stroke-linejoin="round"/>
  <text x="96" y="52" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" font-size="34" fill="#3a1d0c">DOCK 13</text>
  </svg>`,
  { size: 384 },
);

const BOOMDECAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="44" fill="#e8d9a8" stroke="#1c1410" stroke-width="5"/>
  <path d="M50 20 C30 20 24 38 32 50 L32 62 L42 62 L42 70 L58 70 L58 62 L68 62 L68 50 C76 38 70 20 50 20Z" fill="#fff6d8" stroke="#1c1410" stroke-width="3"/>
  <circle cx="41" cy="46" r="7" fill="#1c1410"/><circle cx="59" cy="46" r="7" fill="#1c1410"/>
  <path d="M50 54 L46 61 L54 61Z" fill="#1c1410"/>
  <path d="M20 80 L40 70 M80 80 L60 70 M20 70 L40 80 M80 70 L60 80" stroke="#c23a22" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const PUFF = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="#e9e6df"><circle cx="50" cy="62" r="26"/><circle cx="30" cy="54" r="20"/><circle cx="70" cy="52" r="22"/><circle cx="48" cy="36" r="22"/></g>
  <g fill="#c8c6c2"><circle cx="58" cy="72" r="14"/><circle cx="28" cy="62" r="10"/></g>
  </svg>`,
  { size: 128 },
);

const RAG = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 0 L36 0 L34 40 L38 62 L30 100 L24 66 L18 90 L12 54 L6 70 L8 30Z" fill="#c9532b" stroke="#6a2a14" stroke-width="2.5"/>
  <path d="M10 8 L30 8 M10 16 L30 16" stroke="#f4e6b4" stroke-width="2" stroke-dasharray="4 3"/>
  </svg>`,
  { size: 128 },
);

const bunting = (a: string, b2: string) =>
  svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2 L58 2 L30 78Z" fill="${a}" stroke="#2a1a10" stroke-width="4" stroke-linejoin="round"/>
  <path d="M14 14 L46 14 L30 52Z" fill="${b2}"/>
  <path d="M9 7 L51 7" stroke="#f4e6b4" stroke-width="3" stroke-dasharray="6 4"/>
  </svg>`,
    { size: 128 },
  );
const BUNT_A = bunting("#c23a22", "#f3c52a");
const BUNT_B = bunting("#3e8a2a", "#ee7a1c");

const GRASS = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 64 Q10 30 4 6 Q18 28 20 64Z" fill="#5fa829"/><path d="M22 64 Q26 24 24 2 Q38 26 36 64Z" fill="#7cc23a"/>
  <path d="M34 64 Q44 34 58 12 Q54 40 48 64Z" fill="#5fa829"/><path d="M44 64 Q52 44 62 36 Q58 52 56 64Z" fill="#8bd04a"/>
  </svg>`,
  { size: 128 },
);

const ZZZ = svg(
  `<svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#1c1410" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
    <path d="M8 40 L30 40 L8 62 L30 62" /><path d="M38 18 L56 18 L38 36 L56 36"/><path d="M62 4 L74 4 L62 16 L74 16" stroke-width="5"/>
  </g>
  <g fill="none" stroke="#f6f0d0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M8 40 L30 40 L8 62 L30 62" /><path d="M38 18 L56 18 L38 36 L56 36"/><path d="M62 4 L74 4 L62 16 L74 16" stroke-width="2"/>
  </g></svg>`,
  { size: 192 },
);

function scaled(points: OutlinePoint[], k: number): OutlinePoint[] {
  return points.map((q) => (q.length === 3 ? [q[0] * k, q[1] * k, q[2]] : [q[0] * k, q[1] * k]));
}

function gearOutline(R: number, teeth: number, depth: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const da = (Math.PI * 2) / teeth;
    for (const [f, rr] of [
      [0.0, R - depth],
      [0.18, R],
      [0.5, R],
      [0.68, R - depth],
    ] as const)
      pts.push([Math.cos(a + f * da) * rr, Math.sin(a + f * da) * rr]);
  }
  return pts;
}

// ================================================================================================ build
export default function build() {
  const b = createBuilder({ name: "goblinZeppelin", paintSize: 2048 });

  // ---------------------------------------------------------------------------------------------- skeleton
  const ground = b.joint("ground", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hull = b.joint("hull", { parent: ground, at: [0, ENV_Y, 0], dir: [0, 0, 1], role: "spine" });
  const gondola = b.joint("gondola", { parent: hull, at: [0, 2.9, 0.2], dir: [0, 0, 1], role: "spine" });
  const rudder = b.joint("rudder", { parent: hull, at: [0, ENV_Y + 0.3, -5.75], dir: [0, 1, 0], role: "hinge" });
  const elevL = b.joint("elevatorL", { parent: hull, at: [0.3, ENV_Y + 0.2, -5.55], dir: [1, 0, 0], role: "hinge" });
  const elevR = b.joint("elevatorR", { parent: hull, at: [-0.3, ENV_Y + 0.2, -5.55], dir: [-1, 0, 0], role: "hinge" });
  const propL = b.joint("propL", { parent: gondola, at: [1.95, 3.0, -1.95], dir: [0, 0, -1], role: "hinge" });
  const propR = b.joint("propR", { parent: gondola, at: [-1.95, 3.0, -1.95], dir: [0, 0, -1], role: "hinge" });
  const propRear = b.joint("propRear", { parent: gondola, at: [0, 3.0, -3.4], dir: [0, 0, -1], role: "hinge" });
  const wheel = b.joint("wheel", { parent: gondola, at: [0, 3.38, 0.08], dir: [0, 0.3, 1], role: "hinge" });
  const hatch = b.joint("hatch", { parent: gondola, at: [0.36, 3.0, -1.2], dir: [0, 1, 0], role: "hinge" });
  const mortar = b.joint("mortar", { parent: gondola, at: [0, 3.0, 1.75], dir: [1, 0, 0], role: "hinge" });
  const lampBow = b.joint("lanternBow", { parent: gondola, at: [0, 4.35, 3.0], dir: [0, -1, 0], role: "hinge" });
  const flagPath = catmull([
    [0, 10.98, 1.0],
    [0, 10.92, 0.1],
    [0, 11.02, -0.9],
    [0, 10.9, -2.3],
  ]);
  const flag = b.chain("flag", flagPath, { parent: hull, count: 3, role: "tail" });

  // helpers --------------------------------------------------------------------------------------
  const bank = new Map<string, { bone: Joint; color: string; geos: THREE.BufferGeometry[] }>();
  const addTo = (bone: Joint, color: string, geo: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    let e = bank.get(key);
    if (!e) bank.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(geo);
  };
  const stud = (bone: Joint, color: string, at: N3, r = 0.02) =>
    addTo(bone, color, new THREE.SphereGeometry(r, 5, 3).translate(at[0], at[1], at[2]));
  const boxAt = (bone: Joint, color: string, at: N3, size: N3, rotY = 0, rotX = 0, rotZ = 0) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    g.applyMatrix4(
      new THREE.Matrix4()
        .makeTranslation(at[0], at[1], at[2])
        .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rotX * DEG, rotY * DEG, rotZ * DEG, "YXZ"))),
    );
    addTo(bone, color, g);
  };
  const beam = (bone: Joint, color: Fill, a: N3, c: N3, w: number, h: number, name?: string) =>
    b.frustumBox(a, c, [w, h], [w, h], { color, bone, name });
  const rodA = (bone: Joint, color: Fill, a: N3, c: N3, r: number, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides });
  const ball = (bone: Joint, color: Fill, at: N3, r: number, scale?: N3 | number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, scale });
  const torus = (bone: Joint, color: Fill, at: N3, R: number, r: number, dir: N3, seg = 12) =>
    b.part(new THREE.TorusGeometry(R, r, 5, seg), color, { bone, at, dir, axis: "z" });

  // ------------------------------------------------------------------------------------------ envelope
  const stations: Array<[number, number, number]> = [
    [6.38, 0.14, -0.22],
    [6.0, 1.15, -0.14],
    [5.0, 2.0, -0.06],
    [3.6, 2.42, 0],
    [1.6, 2.58, 0],
    [-0.6, 2.52, 0],
    [-2.6, 2.15, 0.03],
    [-4.0, 1.62, 0.09],
    [-5.15, 1.0, 0.15],
    [-5.95, 0.5, 0.2],
    [-6.38, 0.13, 0.24],
  ];
  const spine = catmull(stations.map(([z, , dy]) => [0, ENV_Y + dy, z]));
  const env = b.loft(
    stations.map(([z, r, dy]) => ({ at: [0, ENV_Y + dy, z] as N3, w: 2 * r, h: 2 * r * 0.93 })),
    { bone: hull, color: cloth, sides: 20, name: "envelope" },
  );
  const tOf = (z: number) => spine.closestT([0, ENV_Y, z]);

  // emblems and nose face
  for (const s of [1, -1]) {
    b.decal(env, EMBLEM, { at: [s * 2.5, 7.15, 1.55], dir: [s, 0, 0], size: [2.7, 2.7], segments: 14, mirror: s < 0, name: `emblem${s > 0 ? "L" : "R"}` });
  }
  b.decal(env, NOSEFACE, { at: [0, 7.0, 5.6], dir: [0, 0.12, 1], size: [2.5, 1.7], segments: 16, name: "noseFace" });

  // hoops, longitudinal ropes, knots
  const hoopZ = [5.3, 4.0, 2.7, 1.4, 0.1, -1.2, -2.5, -3.7, -4.8];
  const knotPts: N3[] = [];
  for (const z of hoopZ) {
    const t = tOf(z);
    const pts: number[][] = [];
    for (let i = 0; i < 20; i++) pts.push(env.at(t, i * 18, 0.04).at.toArray());
    b.sweep(catmull(pts, { closed: true }), 0.042, { color: ROPE, bone: hull, sides: 5, name: "hoop" });
    for (let i = 0; i < 8; i++) knotPts.push(env.at(t, i * 45, 0.07).at.toArray() as N3);
  }
  for (let i = 0; i < 8; i++) {
    const line = env.line(i * 45, 0.035).slice(0.05, 0.95);
    b.sweep(line, 0.03, { color: ROPE_D, bone: hull, sides: 4, name: "gorerope" });
  }
  for (const k of knotPts) stud(hull, ROPE_D, k, 0.075);

  // nose and tail caps
  b.part(new THREE.ConeGeometry(0.36, 0.55, 8), IRON, { bone: hull, at: [0, ENV_Y - 0.25, 6.62], dir: [0, 0, 1] });
  torus(hull, IRON_L, [0, ENV_Y - 0.25, 6.5], 0.4, 0.05, [0, 0, 1], 10);
  torus(hull, BRASS, [0, ENV_Y - 0.25, 6.92], 0.14, 0.035, [1, 0, 0]);
  b.part(new THREE.ConeGeometry(0.3, 0.5, 8), IRON, { bone: hull, at: [0, ENV_Y + 0.28, -6.62], dir: [0, 0, -1] });
  torus(hull, IRON_L, [0, ENV_Y + 0.24, -6.4], 0.3, 0.045, [0, 0, 1], 10);
  torus(hull, BRASS, [0, ENV_Y + 0.28, -6.86], 0.13, 0.035, [1, 0, 0]);
  // lacing on caps
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    stud(hull, CREAM, [Math.cos(a) * 0.8, ENV_Y - 0.14 + Math.sin(a) * 0.76, 5.85], 0.03);
  }

  // patched tears: loose rag flaps hanging off the belly and tail
  const rng1 = rng(11);
  const ragFrames = [] as Frame[];
  for (let i = 0; i < 9; i++) {
    const z = -4.6 + i * 0.5 + rng1() * 0.2;
    const deg = 180 + (rng1() - 0.5) * 120;
    const sp = env.at(tOf(z), deg, 0.02);
    ragFrames.push(frame(sp.at, [0, 1, 0]));
  }
  b.cards(ragFrames, RAG, { size: [0.14, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(12), spin: 25 });

  // brass gas valves and patched vents along the crown
  for (const z of [4.2, 2.2, -0.2, -2.4]) {
    const sp = env.at(tOf(z), 0, 0.0);
    b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.07, 10), BRASS_D, { bone: hull, at: sp.at, dir: sp.n });
    b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 10), BRASS, { bone: hull, at: env.at(tOf(z), 0, 0.045).at, dir: sp.n, axis: "z" });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6), IRON_D, { bone: hull, at: env.at(tOf(z), 0, 0.09).at, dir: sp.n });
    b.rod(env.at(tOf(z), 0, 0.14).at, env.at(tOf(z), 0, 0.14).at.clone().add(new THREE.Vector3(0.14, 0, 0)), 0.015, { bone: hull, color: IRON_L, sides: 4 });
    ball(hull, RED, env.at(tOf(z), 0, 0.14).at.clone().add(new THREE.Vector3(0.16, 0, 0)).toArray() as N3, 0.04);
  }
  // pennant on top
  const mastBase: N3 = [0, ENV_Y + 2.38, 1.0];
  rodA(hull, WOOD_D, mastBase, [0, 11.05, 1.0], 0.045, 6);
  b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.14, 8), IRON, { bone: hull, at: [0, ENV_Y + 2.36, 1.0] });
  ball(hull, BRASS, [0, 11.09, 1.0], 0.07);
  for (let i = 0; i < 4; i++) {
    const a = i * 90 * DEG + 0.4;
    rodA(hull, ROPE_D, [0, 10.7, 1.0], [Math.cos(a) * 0.45, ENV_Y + 2.3, 1.0 + Math.sin(a) * 0.45], 0.015, 4);
  }
  b.membrane(flag, [[0, 10.3, 1.0], [0, 10.4, 0.1], [0, 10.7, -0.9], [0, 10.9, -2.3]], {
    color: flagPaint,
    thickness: 0.02,
    rows: 3,
    bone: flag,
    name: "pennant",
  });

  // ------------------------------------------------------------------------------------- tail surfaces
  const finThick = 0.1;
  // fixed fins
  b.extrude(
    [[-3.3, 1.1], [-4.4, 3.0], [-5.2, 3.5], [-5.75, 3.5], [-5.75, 0.35], [-5.0, 0.55], [-4.0, 0.9]],
    { x: [0, 0, 1], at: [0, ENV_Y, 0], thickness: finThick, bevel: 0.02, color: finPaint, bone: hull, name: "finTop" },
  );
  b.extrude(
    [[-3.3, -1.0], [-4.3, -2.2], [-5.2, -2.55], [-5.75, -2.55], [-5.75, -0.35], [-4.4, -0.6]],
    { x: [0, 0, 1], at: [0, ENV_Y, 0], thickness: finThick, bevel: 0.02, color: finPaint, bone: hull, name: "finBottom" },
  );
  // rudder
  b.extrude([[-5.75, 3.5], [-6.45, 3.4], [-6.7, 2.4], [-6.6, 0.9], [-5.75, 0.35]], {
    x: [0, 0, 1],
    at: [0, ENV_Y, 0], thickness: 0.08, bevel: 0.02, color: finPaint, bone: rudder, name: "rudderTop",
  });
  b.extrude([[-5.75, -2.55], [-6.45, -2.4], [-6.6, -1.6], [-6.4, -0.6], [-5.75, -0.35]], {
    x: [0, 0, 1],
    at: [0, ENV_Y, 0], thickness: 0.08, bevel: 0.02, color: finPaint, bone: rudder, name: "rudderBottom",
  });
  for (const [a, c] of [
    [[-3.3, 1.1], [-4.4, 3.0]],
    [[-4.4, 3.0], [-5.2, 3.5]],
    [[-3.3, -1.0], [-4.3, -2.2]],
    [[-4.3, -2.2], [-5.2, -2.55]],
  ] as const) {
    rodA(hull, WOOD_D, [0, ENV_Y + a[1], a[0]], [0, ENV_Y + c[1], c[0]], 0.05, 6);
    stud(hull, BRASS, [0.06, ENV_Y + c[1], c[0]], 0.03);
    stud(hull, BRASS, [-0.06, ENV_Y + c[1], c[0]], 0.03);
  }
  rodA(rudder, WOOD_D, [0, ENV_Y + 0.35, -5.75], [0, ENV_Y + 3.5, -5.75], 0.05, 6);
  rodA(rudder, WOOD_D, [0, ENV_Y - 2.55, -5.75], [0, ENV_Y - 0.35, -5.75], 0.05, 6);
  for (const s of [1, -1]) {
    // stabilisers
    b.extrude([[0.3, -3.7], [1.5, -4.4], [3.2, -5.3], [3.2, -5.55], [0.3, -5.55]], {
      at: [0, ENV_Y + 0.2, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: finThick, bevel: 0.02, color: finPaint, bone: hull,
      name: `stab${s > 0 ? "L" : "R"}`,
    });
    // elevators
    b.extrude([[0.3, -5.55], [3.2, -5.55], [3.0, -6.35], [2.0, -6.65], [0.3, -6.2]], {
      at: [0, ENV_Y + 0.2, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, color: finPaint, bone: s > 0 ? elevL : elevR,
      name: `elevator${s > 0 ? "L" : "R"}`,
    });
    rodA(s > 0 ? elevL : elevR, WOOD_D, [s * 0.3, ENV_Y + 0.2, -5.55], [s * 3.2, ENV_Y + 0.2, -5.55], 0.05, 6);
    // spars
    rodA(hull, WOOD_D, [s * 0.4, ENV_Y + 0.2, -3.7], [s * 3.2, ENV_Y + 0.2, -5.3], 0.045, 6);
    rodA(hull, WOOD_D, [s * 3.2, ENV_Y + 0.2, -5.3], [s * 3.2, ENV_Y + 0.2, -5.55], 0.05, 6);
    for (const [x, z] of [[1.5, -4.4], [2.4, -4.85], [3.2, -5.3]] as const) {
      stud(hull, BRASS, [s * x, ENV_Y + 0.26, z], 0.03);
      stud(hull, BRASS, [s * x, ENV_Y + 0.14, z], 0.03);
    }
    // bracing wires to hull
    rodA(hull, IRON_L, [s * 3.1, ENV_Y + 0.28, -5.1], [s * 0.9, ENV_Y + 0.9, -3.5], 0.012, 4);
  }
  rodA(hull, WOOD_D, [0, ENV_Y + 0.9, -3.3], [0, ENV_Y + 3.4, -5.2], 0.045, 6);
  rodA(hull, IRON_L, [0, ENV_Y + 3.45, -5.2], [0, ENV_Y + 1.7, -3.0], 0.012, 4);
  rodA(hull, WOOD_D, [0, ENV_Y - 0.9, -3.3], [0, ENV_Y - 2.5, -5.2], 0.045, 6);
  // control horns and linkage
  rodA(rudder, IRON, [0, ENV_Y + 0.35, -5.75], [0.5, ENV_Y + 0.35, -5.75], 0.025, 5);
  stud(rudder, BRASS, [0.5, ENV_Y + 0.35, -5.75], 0.05);

  // ---------------------------------------------------------------------------------- keel and catwalk
  const keelZ0 = -3.6;
  const keelZ1 = 4.2;
  const catY = 4.56;
  for (const s of [1, -1]) {
    beam(hull, woodDark, [s * 0.36, catY, keelZ0], [s * 0.36, catY, keelZ1], 0.1, 0.14, "keelBeam");
  }
  for (let z = keelZ0 + 0.1; z < keelZ1; z += 0.42) boxAt(hull, WOOD, [0, catY + 0.06, z], [0.84, 0.05, 0.34], (h1(Math.round(z * 10)) - 0.5) * 6);
  for (let z = keelZ0 + 0.3; z < keelZ1; z += 0.84) stud(hull, IRON_D, [0.34, catY + 0.1, z], 0.025), stud(hull, IRON_D, [-0.34, catY + 0.1, z], 0.025);
  // hangers from hoops to the catwalk
  for (const z of [4.0, 2.7, 1.4, 0.1, -1.2, -2.5]) {
    const t = tOf(z);
    for (const s of [1, -1]) {
      const up = env.at(t, 180 - s * 34, 0.05).at;
      rodA(hull, ROPE, [up.x, up.y, up.z], [s * 0.4, catY + 0.08, z], 0.022, 4);
    }
  }

  // ------------------------------------------------------------------------------------------ gondola
  // hull bottom
  const gStations: Array<{ at: N3; w: number; h: number }> = [
    { at: [0, 2.14, -2.78], w: 1.7, h: 0.5 },
    { at: [0, 2.12, -1.0], w: 1.92, h: 0.5 },
    { at: [0, 2.12, 1.0], w: 1.92, h: 0.5 },
    { at: [0, 2.2, 2.3], w: 1.0, h: 0.5 },
    { at: [0, 2.55, 3.15], w: 0.25, h: 0.5 },
  ];
  b.loft(gStations, { bone: gondola, color: woodDark, section: "box", name: "gondolaFloor" });
  // keel runner
  b.loft(
    [
      { at: [0, 1.88, -2.5], w: 0.2, h: 0.12 },
      { at: [0, 1.84, 0.5], w: 0.24, h: 0.14 },
      { at: [0, 1.95, 2.4], w: 0.16, h: 0.12 },
      { at: [0, 2.6, 3.3], w: 0.12, h: 0.1 },
    ],
    { bone: gondola, color: IRON_D, section: "box", name: "keelRunner" },
  );
  // side walls (straight section) and angled bow walls
  for (const s of [1, -1]) {
    b.extrude(
      [[-2.8, 2.2], [-2.3, 1.92], [1.3, 1.92], [1.3, 3.3], [0.4, 3.2], [-1.0, 3.28], [-1.25, 3.9], [-2.8, 3.9]],
      { at: [s * 0.9, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.12, bevel: 0.015, color: woodPaint, bone: gondola, name: `wall${s > 0 ? "L" : "R"}` },
    );
    b.extrude([[0, 1.92], [1.0, 2.05], [1.8, 2.45], [2.05, 2.8], [2.05, 3.75], [1.0, 3.45], [0, 3.3]], {
      at: [s * 0.9, 0, 1.3], x: [-s * 0.406, 0, 0.914], y: [0, 1, 0], thickness: 0.12, bevel: 0.015, color: woodPaint, bone: gondola, name: `bow${s > 0 ? "L" : "R"}`,
    });
    // rails
    b.sweep(
      [
        [s * 0.93, 3.37, -1.0],
        [s * 0.93, 3.29, 0.4],
        [s * 0.93, 3.39, 1.3],
        [s * 0.49, 3.55, 2.21],
        [s * 0.08, 3.84, 3.17],
      ],
      [0.1, 0.05],
      { bone: gondola, color: WOOD_L, section: "box", skin: "rigid", name: `rail${s > 0 ? "L" : "R"}` },
    );
    // outer bottom skirts: hull strakes
    beam(gondola, WOOD_D, [s * 0.98, 2.35, -2.7], [s * 0.98, 2.35, 1.25], 0.05, 0.1, "strake");
    beam(gondola, WOOD_D, [s * 0.98, 2.9, -1.2], [s * 0.98, 2.9, 1.25], 0.05, 0.09, "strake");
    // iron straps around the hull
    for (const z of [-2.1, -0.5, 0.9]) {
      boxAt(gondola, IRON, [s * 0.975, 2.62, z], [0.03, 1.4, 0.13]);
      for (const y of [2.1, 2.5, 2.9, 3.2]) stud(gondola, IRON_L, [s * 0.995, y, z], 0.026);
    }
    // scrap armour plates
    boxAt(gondola, "#7a8590", [s * 0.985, 2.55, 0.35], [0.025, 0.4, 0.5], 0, 0, s * 3);
    boxAt(gondola, RUST, [s * 0.99, 3.0, -0.3], [0.025, 0.28, 0.4], 0, 0, -s * 4);
    boxAt(gondola, "#4a7a5a", [s * 0.985, 2.3, -1.4], [0.025, 0.3, 0.55], 0, 0, s * 2);
    for (const [y, z] of [[2.7, 0.62], [2.42, 0.1], [3.1, -0.05], [2.9, -0.52], [2.45, -1.16], [2.15, -1.65]] as const)
      stud(gondola, IRON_L, [s * 1.0, y, z], 0.024);
  }
  // stem post and figurehead
  b.sweep(catmull([[0, 2.2, 3.0], [0, 3.4, 3.35], [0, 4.0, 3.3], [0, 4.25, 3.1]]), [0.1, 0.07], {
    bone: gondola, color: woodLight, section: "box", name: "stem",
  });
  {
    const fh: N3 = [0, 3.82, 3.85];
    b.rod([0, 3.0, 3.35], [0, 3.72, 3.72], 0.1, { bone: gondola, color: woodLight, sides: 6, name: "figureNeck" });
    torus(gondola, BRASS, [0, 3.62, 3.68], 0.13, 0.03, [0, 0.5, 1], 8);
    ball(gondola, "#7fb83a", fh, 0.28, [1.05, 0.95, 1]);
    ball(gondola, "#6aa22e", [0, fh[1] - 0.17, fh[2] + 0.1], 0.2, [1.05, 0.75, 1]);
    b.rod([-0.25, fh[1] + 0.07, fh[2] + 0.17], [0.25, fh[1] + 0.07, fh[2] + 0.17], 0.05, { bone: gondola, color: "#4f8a22", sides: 5, name: "figureBrow" });
    for (const s of [1, -1]) {
      ball(gondola, EYE, [s * 0.11, fh[1] + 0.02, fh[2] + 0.22], 0.075, [1, 1, 0.7]);
      ball(gondola, INK, [s * 0.11, fh[1] + 0.02, fh[2] + 0.285], 0.03);
      b.spike([s * 0.1, fh[1] - 0.24, fh[2] + 0.2], [s * 0.06, 1, 0.45], 0.2, 0.04, { bone: gondola, color: TUSK, sides: 6, name: "figureTusk" });
      b.extrude(scaled([[0, -0.07], [0.25, -0.12], [0.55, 0.06], [0.75, 0.34, "sharp"], [0.45, 0.28], [0.2, 0.2], [0, 0.12]], 0.8), {
        at: [s * 0.25, fh[1] + 0.02, fh[2] - 0.05], x: [s * 0.9, 0.15, -0.5], y: [0, 1, 0.1], thickness: 0.05, bevel: 0.01, color: "#7fb83a", bone: gondola, name: "figureEar",
      });
      stud(gondola, BRASS, [s * 0.4, fh[1] + 0.1, fh[2] - 0.13], 0.035);
    }
    b.sweep(catmull([[0, fh[1] + 0.0, fh[2] + 0.26], [0, fh[1] + 0.02, fh[2] + 0.45], [0, fh[1] - 0.1, fh[2] + 0.58], [0, fh[1] - 0.2, fh[2] + 0.52]]), [0.09, 0.025], { bone: gondola, color: "#8fcb48", sides: 6, name: "figureNose" });
    torus(gondola, BRASS, [0, fh[1] - 0.19, fh[2] + 0.5], 0.05, 0.012, [1, 0, 0], 8);
    for (let i = 0; i < 4; i++) b.spike([0, fh[1] + 0.26 - i * 0.04, fh[2] - 0.02 - i * 0.12], [0, 1, -0.3 - i * 0.15], 0.18, 0.04, { bone: gondola, color: INK, sides: 5, name: "figureTuft" });
  }
  // stern wall and cabin front wall
  b.part(new THREE.BoxGeometry(1.82, 1.9, 0.12), woodPaint, { bone: gondola, at: [0, 2.95, -2.74] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.54, 0.8, 0.12), woodPaint, { bone: gondola, at: [s * 0.63, 3.4, -1.25] });
  b.part(new THREE.BoxGeometry(0.72, 0.28, 0.12), woodPaint, { bone: gondola, at: [0, 3.82, -1.25] });
  b.part(new THREE.BoxGeometry(1.76, 0.75, 0.12), woodPaint, { bone: gondola, at: [0, 2.78, -1.25] });
  // deck gunwale cross beams
  for (const z of [-1.0, 0.55]) beam(gondola, WOOD_L, [-0.9, 3.28, z], [0.9, 3.28, z], 0.09, 0.1, "crossbeam");
  // deck boards inside
  b.part(new THREE.BoxGeometry(1.7, 0.04, 5.0), woodLight, { bone: gondola, at: [0, 2.4, -0.2] });
  // cabin roof: two scrap sheets
  b.part(new THREE.BoxGeometry(1.84, 0.08, 1.0), tinPaint, { bone: gondola, at: [0, 4.0, -2.35], rotation: [-7, 0, 3] });
  b.part(new THREE.BoxGeometry(1.84, 0.08, 0.95), greenTin, { bone: gondola, at: [0, 4.04, -1.55], rotation: [-5, 0, -2] });
  for (let i = 0; i < 6; i++) boxAt(gondola, WOOD_D, [-0.85 + i * 0.34, 3.92, -1.9], [0.08, 0.1, 1.9]);
  for (let i = 0; i < 9; i++) {
    stud(gondola, IRON_L, [-0.9 + i * 0.225, 4.06, -2.78], 0.022);
    stud(gondola, IRON_L, [-0.9 + i * 0.225, 4.1, -1.12], 0.022);
  }
  // cabin windows (glowing portholes) and door frame
  for (const s of [1, -1]) {
    torus(gondola, BRASS, [s * 0.985, 3.5, -2.0], 0.17, 0.03, [s, 0, 0], 10);
    glow(b.part(new THREE.CircleGeometry(0.15, 10), GLASS, { bone: gondola, at: [s * 0.975, 3.5, -2.0], dir: [s, 0, 0], axis: "z" }), 0.9);
    for (let i = 0; i < 4; i++) {
      const a = i * 90 * DEG + 0.4;
      stud(gondola, BRASS_D, [s * 1.0, 3.5 + Math.sin(a) * 0.2, -2.0 + Math.cos(a) * 0.2], 0.022);
    }
    rodA(gondola, IRON_D, [s * 0.99, 3.5, -2.17], [s * 0.99, 3.5, -1.83], 0.012, 4);
  }
  // the hatch: a door ajar
  b.part(new THREE.BoxGeometry(0.7, 1.25, 0.07), woodLight, { bone: hatch, at: [0, 3.0, -1.2] });
  for (const y of [2.55, 3.45]) b.part(new THREE.BoxGeometry(0.7, 0.09, 0.09), IRON, { bone: hatch, at: [0, y, -1.2] });
  for (const y of [2.55, 3.45]) ball(hatch, IRON_L, [0.3, y, -1.15], 0.03);
  b.part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, { bone: hatch, at: [-0.28, 3.0, -1.14] });
  torus(hatch, BRASS, [0, 3.3, -1.15], 0.1, 0.02, [0, 0, 1], 8);
  glow(b.part(new THREE.CircleGeometry(0.085, 8), GLASS, { bone: hatch, at: [0, 3.3, -1.157], dir: [0, 0, 1], axis: "z" }), 0.8);
  b.part(new THREE.BoxGeometry(0.05, 1.25, 0.09), woodDark, { bone: hatch, at: [-0.15, 3.0, -1.2] });
  b.part(new THREE.BoxGeometry(0.05, 1.25, 0.09), woodDark, { bone: hatch, at: [0.15, 3.0, -1.2] });
  // cabin interior: hammock, stove, bottles, loudspeaker horn
  b.sweep(catmull([[-0.8, 3.45, -2.35], [-0.4, 2.95, -2.3], [0.4, 2.95, -2.3], [0.8, 3.45, -2.35]]), () => [0.32, 0.03], { bone: gondola, color: "#a24a38", sides: 6, section: "box", name: "hammock" });
  ball(gondola, CREAM, [-0.55, 3.15, -2.3], 0.13, [1.3, 0.6, 1]);
  b.part(new THREE.BoxGeometry(0.5, 0.6, 0.5), IRON, { bone: gondola, at: [-0.5, 2.7, -2.5] });
  glow(b.part(new THREE.BoxGeometry(0.26, 0.2, 0.02), "#ff7a1c", { bone: gondola, at: [-0.5, 2.62, -2.24] }), 1.4);
  b.sweep(polyline([[-0.5, 3.0, -2.5], [-0.5, 4.4, -2.5]]), 0.06, { bone: gondola, color: IRON_D, sides: 6, name: "stovePipe" });
  b.part(new THREE.ConeGeometry(0.13, 0.12, 8), IRON, { bone: gondola, at: [-0.5, 4.5, -2.5] });
  b.cards([frame([-0.5, 4.46, -2.5], [0, 1, 0]), frame([-0.55, 4.7, -2.8], [0, 1, 0])], PUFF, { size: [0.4, 0.4], lean: 35, flow: [0, 0, -1], cross: true, vary: 0.2, rng: rng(5) });
  for (let i = 0; i < 3; i++) {
    const x = 0.42 + i * 0.14;
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 6), i === 1 ? "#a8ff4a" : "#6dff9a", { bone: gondola, at: [x, 3.25, -2.64] }), 1);
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.05, 5), BRASS_D, { bone: gondola, at: [x, 3.36, -2.64] });
  }
  rodA(gondola, WOOD_D, [0.3, 3.16, -2.68], [0.9, 3.16, -2.68], 0.03, 5);
  b.lathe([[0, 0], [0.07, 0], [0.07, 0.2], [0.14, 0.42], [0.3, 0.62], [0.28, 0.62], [0.12, 0.4], [0.05, 0.2], [0, 0.2]], { at: [0.55, 4.1, -1.75], axis: [0, 0.45, 1], segments: 10, color: BRASS, bone: gondola, name: "horn" });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 8), IRON_D, { bone: gondola, at: [0.55, 4.08, -1.75] });
  // helm: pedestal, wheel
  b.part(new THREE.BoxGeometry(0.46, 0.62, 0.42), woodDark, { bone: gondola, at: [0, 2.72, 0.35] });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.46), woodLight, { bone: gondola, at: [0, 3.05, 0.35] });
  rodA(gondola, IRON, [0, 3.1, 0.3], [0, 3.38, 0.1], 0.04, 6);
  torus(wheel, WOOD_L, [0, 3.38, 0.08], 0.3, 0.032, [0, 0.3, 1], 12);
  torus(wheel, BRASS, [0, 3.38, 0.08], 0.07, 0.04, [0, 0.3, 1], 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    rodA(wheel, WOOD_L, [0, 3.38, 0.08], [c * 0.3, 3.38 + sn * 0.3 * 0.95, 0.08 - sn * 0.3 * 0.3], 0.018, 5);
    ball(wheel, BRASS, [c * 0.38, 3.38 + sn * 0.38 * 0.95, 0.08 - sn * 0.38 * 0.3], 0.032);
  }
  // compass / instruments on the pedestal
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), BRASS, { bone: gondola, at: [0.12, 3.12, 0.45] });
  glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "#9fe3ff", { bone: gondola, at: [0.12, 3.17, 0.45] }), 0.7);
  for (const x of [-0.17, -0.1, -0.03]) {
    rodA(gondola, IRON, [x, 3.08, 0.5], [x, 3.35, 0.55 + (x + 0.1) * 0.8], 0.012, 4);
    ball(gondola, x < -0.1 ? RED : x > -0.1 ? "#3f8f2a" : BRASS, [x, 3.37, 0.555 + (x + 0.1) * 0.8], 0.03);
  }
  // mortar turret
  b.part(new THREE.CylinderGeometry(0.4, 0.46, 0.5, 8), woodDark, { bone: gondola, at: [0, 2.65, 1.75] });
  b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.07, 8), IRON, { bone: gondola, at: [0, 2.93, 1.75] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.32, 0.24), IRON, { bone: gondola, at: [s * 0.27, 3.15, 1.75] });
  b.rod([0, 2.95, 1.65], [0, 4.05, 2.4], [0.18, 0.18], { color: COPPER_D, bone: mortar, sides: 10, name: "mortarBarrel" });
  b.rod([0, 4.0, 2.37], [0, 4.25, 2.55], [0.25, 0.25], { color: IRON, bone: mortar, sides: 10, name: "mortarMouth" });
  b.rod([0, 2.92, 1.62], [0, 3.18, 1.8], [0.22, 0.22], { color: IRON_D, bone: mortar, sides: 10, name: "mortarBreech" });
  torus(mortar, BRASS, [0, 3.45, 2.0], 0.2, 0.03, [0, 1.1, 0.75], 10);
  torus(mortar, BRASS, [0, 3.75, 2.2], 0.21, 0.03, [0, 1.1, 0.75], 10);
  rodA(mortar, IRON_D, [-0.3, 3.0, 1.75], [0.3, 3.0, 1.75], 0.045, 6);
  // bombs and shot rack
  const bombs: N3[] = [[-0.5, 2.62, 1.0], [-0.65, 2.62, 1.3], [-0.38, 2.62, 1.3], [-0.52, 2.95, 1.2]];
  for (const p of bombs) {
    ball(gondola, "#25282e", p, 0.2);
    rodA(gondola, ROPE_D, [p[0], p[1] + 0.18, p[2]], [p[0] + 0.04, p[1] + 0.32, p[2]], 0.012, 4);
    stud(gondola, RED, [p[0] + 0.05, p[1] + 0.33, p[2]], 0.03);
    stud(gondola, IRON_L, [p[0] + 0.14, p[1] + 0.12, p[2] + 0.12], 0.03);
  }
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: gondola, at: [-0.5, 2.62, 1.205], dir: [0, 0, 1], axis: "z", texture: BOOMDECAL });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), FUSE, { bone: gondola, at: [-0.46, 2.95 + 0.33, 1.2] }), 1.5);
  // barrels and crates on deck (stern side)
  const barrelOutline: Array<[number, number]> = [[0, 0], [0.24, 0], [0.29, 0.08], [0.32, 0.3], [0.29, 0.52], [0.24, 0.6], [0, 0.6]];
  const barrel = (bone: Joint, at: N3, scale = 1, withDecal = false) => {
    b.lathe(barrelOutline, { at, segments: 12, color: barrelPaint, bone, name: "barrel" });
    for (const y of [0.08, 0.3, 0.52]) {
      const r = y === 0.3 ? 0.325 : y === 0.08 ? 0.295 : 0.295;
      b.part(new THREE.TorusGeometry(r * scale, 0.02, 4, 12), IRON, { bone, at: [at[0], at[1] + y * scale, at[2]], dir: [0, 1, 0], axis: "z" });
    }
    if (withDecal) b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [at[0], at[1] + 0.32, at[2] + 0.328], dir: [0, 0, 1], axis: "z", texture: BOOMDECAL });
  };
  barrel(gondola, [0.55, 2.4, -0.8], 1, false);
  barrel(gondola, [-0.45, 2.4, -0.82], 1, false);
  barrel(gondola, [-0.5, 2.4, -0.2], 1, false);
  b.part(new THREE.BoxGeometry(0.5, 0.42, 0.5), woodDark, { bone: gondola, at: [0.58, 2.62, -0.3], rotation: [0, 12, 0] });
  b.part(new THREE.BoxGeometry(0.42, 0.34, 0.42), woodLight, { bone: gondola, at: [0.58, 2.99, -0.3], rotation: [0, -8, 0] });
  b.part(new THREE.BoxGeometry(0.56, 0.05, 0.56), woodDark, { bone: gondola, at: [0.58, 2.4, -0.3] });
  for (const [x, y, z, r] of [[0.58, 2.62, -0.3, 12], [0.58, 2.99, -0.3, -8]] as const) {
    boxAt(gondola, IRON, [x, y, z + 0.26], [0.5, 0.05, 0.02], r);
    stud(gondola, IRON_L, [x + 0.2, y + 0.05, z + 0.28], 0.02);
    stud(gondola, IRON_L, [x - 0.2, y + 0.05, z + 0.28], 0.02);
  }
  // coiled rope and sacks
  for (let i = 0; i < 4; i++) b.part(new THREE.TorusGeometry(0.2, 0.04, 5, 12), ROPE, { bone: gondola, at: [-0.6, 2.46 + i * 0.07, 0.55], dir: [0, 1, 0], axis: "z" });
  ball(gondola, sackPaint, [0.6, 2.58, 0.8], 0.24, [1, 0.75, 0.9]);
  ball(gondola, sackPaint, [0.45, 2.55, 0.5], 0.2, [1, 0.7, 0.9]);
  stud(gondola, ROPE_D, [0.6, 2.77, 0.8], 0.05);
  // ship's bell on the right rail
  b.sweep(catmull([[-0.94, 3.4, 0.3], [-0.94, 3.75, 0.3], [-0.75, 3.95, 0.3]]), 0.03, { bone: gondola, color: IRON_D, sides: 5, name: "bellArm" });
  b.lathe([[0, 0], [0.1, 0], [0.16, 0.0], [0.15, 0.04], [0.11, 0.2], [0.05, 0.26], [0, 0.26]], { at: [-0.75, 3.7, 0.3], segments: 8, color: BRASS, bone: gondola, name: "bell" });
  ball(gondola, IRON_D, [-0.75, 3.72, 0.3], 0.03);
  // tools hung on the cabin front wall
  rodA(gondola, WOOD, [0.7, 3.45, -1.15], [0.7, 3.0, -1.15], 0.03, 5);
  b.part(new THREE.BoxGeometry(0.22, 0.1, 0.08), IRON, { bone: gondola, at: [0.7, 3.5, -1.15] });
  rodA(gondola, WOOD, [0.5, 3.2, -1.15], [0.84, 3.3, -1.15], 0.025, 5);
  torus(gondola, IRON, [0.43, 3.15, -1.15], 0.07, 0.02, [0, 0, 1], 8);
  // gear salvage bolted to the right bow
  for (const s of [-1]) {
    b.extrude(gearOutline(0.38, 12, 0.07), { at: [s * 1.0, 2.85, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.01, color: ironPaint, bone: gondola, name: "cog" });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), BRASS, { bone: gondola, at: [s * 1.05, 2.85, 0.55], dir: [1, 0, 0] });
  }
  // nameplates
  b.part(new THREE.PlaneGeometry(1.45, 0.36), "#ffffff", { bone: gondola, at: [-1.0, 2.95, 0.6], dir: [-1, 0, 0], axis: "z", texture: NAMEPLATE, up: [0, 1, 0] });
  b.part(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", { bone: gondola, at: [1.0, 2.7, 0.0], dir: [1, 0, 0], axis: "z", texture: EMBLEM });

  // stern: rear prop bracket
  rodA(gondola, IRON_D, [0, 3.0, -2.8], [0, 3.0, -3.38], 0.07, 8);
  b.part(new THREE.BoxGeometry(0.5, 0.5, 0.1), IRON, { bone: gondola, at: [0, 3.0, -2.82] });
  for (const [dx, dy] of [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]] as const) stud(gondola, IRON_L, [dx, 3.0 + dy, -2.88], 0.025);
  // rear sterncastle poop lamp post and stern rail
  b.sweep(catmull([[-0.9, 3.95, -2.85], [0, 4.05, -2.95], [0.9, 3.95, -2.85]]), 0.035, { bone: gondola, color: WOOD_L, name: "sternRail" });
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) rodA(gondola, WOOD_L, [x, 3.9, -2.85], [x, 4.06, -2.94], 0.03, 5);

  // ------------------------------------------------------------------------- gondola to envelope rigging
  for (const s of [1, -1]) {
    for (const z of [-2.3, 0.9]) {
      beam(gondola, WOOD_L, [s * 1.03, 3.3, z], [s * 1.03, catY + 0.02, z], 0.1, 0.1, "strut");
      beam(gondola, woodDark, [s * 0.3, catY - 0.03, z], [s * 1.08, catY - 0.03, z], 0.1, 0.12, "outerBeam");
      boxAt(gondola, IRON, [s * 1.03, 3.62, z], [0.13, 0.08, 0.13]);
      boxAt(gondola, IRON, [s * 1.03, 4.4, z], [0.13, 0.08, 0.13]);
      b.sweep(polyline([[s * 0.98, 3.4, z], [s * 0.7, 4.1, z + 0.3], [s * 0.4, catY + 0.03, z + 0.6]]), 0.022, { bone: gondola, color: ROPE, sides: 4, skin: "rigid", name: "rigging" });
      b.sweep(polyline([[s * 0.98, 3.4, z], [s * 0.7, 4.1, z - 0.3], [s * 0.4, catY + 0.03, z - 0.6]]), 0.022, { bone: gondola, color: ROPE, sides: 4, skin: "rigid", name: "rigging" });
      ball(gondola, IRON, [s * 0.97, 3.38, z], 0.07);
    }
    // pod outriggers
    beam(gondola, WOOD_D, [s * 0.9, 3.0, -1.6], [s * 1.7, 3.0, -1.6], 0.1, 0.12, "outrigger");
    beam(gondola, WOOD_D, [s * 0.9, 3.0, -0.5], [s * 1.7, 3.0, -0.5], 0.1, 0.12, "outrigger");
    rodA(gondola, IRON_L, [s * 0.95, 3.5, -1.0], [s * 1.7, 3.25, -1.05], 0.015, 4);
  }

  // ---------------------------------------------------------------------------------------- steam pods
  const pod = (s: number, prop: Joint, name: string) => {
    const cx = s * 1.95;
    b.lathe([[0, -0.78], [0.16, -0.77], [0.3, -0.68], [0.37, -0.45], [0.38, 0.42], [0.33, 0.62], [0.2, 0.74], [0, 0.78]], {
      at: [cx, 3.0, -0.85], axis: [0, 0, 1], segments: 10, color: copperPaint, bone: gondola, name: `${name}Boiler`,
    });
    for (const dz of [-0.5, -0.1, 0.34, 0.58]) torus(gondola, IRON, [cx, 3.0, -0.85 + dz], dz === 0.58 ? 0.25 : 0.39, 0.026, [0, 0, 1], 12);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      stud(gondola, BRASS, [cx + Math.cos(a) * 0.395, 3.0 + Math.sin(a) * 0.395, -0.62], 0.025);
    }
    // smoke stack
    b.sweep(catmull([[cx, 3.3, -0.55], [cx, 3.85, -0.5], [cx + s * 0.05, 4.3, -0.55]]), [0.09, 0.075], { bone: gondola, color: IRON_D, sides: 8, name: `${name}Stack` });
    b.part(new THREE.CylinderGeometry(0.15, 0.1, 0.1, 8), IRON, { bone: gondola, at: [cx + s * 0.05, 4.36, -0.55] });
    torus(gondola, IRON_L, [cx, 3.7, -0.5], 0.1, 0.02, [0, 1, 0], 8);
    // furnace door (glow) facing outward and forward
    b.part(new THREE.BoxGeometry(0.06, 0.26, 0.26), IRON_D, { bone: gondola, at: [cx + s * 0.375, 3.0, -0.85] });
    glow(b.part(new THREE.BoxGeometry(0.02, 0.16, 0.16), "#ff7a1c", { bone: gondola, at: [cx + s * 0.41, 2.99, -0.85] }), 1.6);
    // pressure gauge
    torus(gondola, BRASS, [cx + s * 0.26, 3.26, -0.2], 0.1, 0.025, [s * 0.75, 0.66, 0], 8);
    glow(b.part(new THREE.CircleGeometry(0.085, 8), "#f3f0d0", { bone: gondola, at: [cx + s * 0.245, 3.245, -0.2], dir: [s * 0.75, 0.66, 0], axis: "z" }), 0.5);
    // pipe back to hull
    b.sweep(catmull([[cx - s * 0.3, 3.1, -0.3], [cx - s * 0.5, 3.35, -0.2], [s * 1.0, 3.1, -0.15]]), 0.04, { bone: gondola, color: COPPER, sides: 6, name: `${name}Pipe` });
    // intake funnel front
    b.lathe([[0, 0], [0.12, 0], [0.2, 0.16], [0.17, 0.18], [0.09, 0.05], [0, 0.05]], { at: [cx, 3.0, -0.07], axis: [0, 0, 1], segments: 8, color: BRASS, bone: gondola, name: `${name}Funnel` });
    // shaft and hub
    rodA(gondola, IRON, [cx, 3.0, -1.6], [cx, 3.0, -1.95], 0.05, 8);
    // blades
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8), BRASS, { bone: prop, at: [cx, 3.0, -1.95], dir: [0, 0, 1] });
    b.part(new THREE.ConeGeometry(0.09, 0.22, 8), BRASS_D, { bone: prop, at: [cx, 3.0, -2.1], dir: [0, 0, -1] });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.3;
      b.extrude([[0.06, -0.06], [0.28, -0.16], [0.6, -0.16], [0.78, -0.03], [0.68, 0.1], [0.3, 0.09], [0.06, 0.05]], {
        at: [cx, 3.0, -1.97], x: [Math.cos(a), Math.sin(a), 0], y: [-Math.sin(a), Math.cos(a), 0.35], thickness: 0.035, bevel: 0.008, color: woodLight, bone: prop, name: `${name}Blade`,
      });
      rodA(prop, IRON, [cx + Math.cos(a) * 0.1, 3.0 + Math.sin(a) * 0.1, -1.97], [cx + Math.cos(a) * 0.28, 3.0 + Math.sin(a) * 0.28, -1.97], 0.025, 5);
    }
    // steam puffs
    b.cards(
      [frame([cx + s * 0.05, 4.42, -0.55], [0, 1, 0]), frame([cx + s * 0.05, 4.62, -0.9], [0, 1, 0]), frame([cx + s * 0.05, 4.8, -1.3], [0, 1, 0])],
      PUFF,
      { size: [0.4, 0.4], lean: 30, flow: [0, 0, -1], cross: true, vary: 0.2, rng: rng(21 + (s > 0 ? 1 : 2)) },
    );
  };
  pod(1, propL, "podL");
  pod(-1, propR, "podR");

  // rear propeller
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 8), BRASS, { bone: propRear, at: [0, 3.0, -3.45], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.12, 0.3, 8), BRASS_D, { bone: propRear, at: [0, 3.0, -3.7], dir: [0, 0, -1] });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    b.extrude([[0.08, -0.09], [0.35, -0.22], [0.8, -0.24], [1.08, -0.06], [0.95, 0.14], [0.4, 0.12], [0.08, 0.08]], {
      at: [0, 3.0, -3.46], x: [Math.cos(a), Math.sin(a), 0], y: [-Math.sin(a), Math.cos(a), 0.4], thickness: 0.05, bevel: 0.01, color: woodLight, bone: propRear, name: "rearBlade",
    });
    rodA(propRear, IRON, [Math.cos(a) * 0.13, 3.0 + Math.sin(a) * 0.13, -3.46], [Math.cos(a) * 0.4, 3.0 + Math.sin(a) * 0.4, -3.46], 0.03, 5);
    stud(propRear, BRASS, [Math.cos(a) * 0.95, 3.0 + Math.sin(a) * 0.95, -3.46], 0.035);
  }
  // blade tips painted: warning cap (orange)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    stud(propRear, ORANGE, [Math.cos(a) * 1.0, 3.0 + Math.sin(a) * 1.0, -3.46], 0.05);
  }

  // ----------------------------------------------------------------------------------------- goblins
  function goblin(g: {
    pos: N3; yaw: number; hip: number; bone: Joint; feet: [N3, N3]; hands: [N3, N3]; lean?: number; look?: [number, number];
    top: string; trim: string; pants: string; hat: "cap" | "pot" | "bandana" | "sleep" | "none"; s?: number;
  }) {
    const bone = g.bone;
    const R = new THREE.Matrix4().makeRotationY(g.yaw * DEG);
    const org = new THREE.Vector3(...g.pos);
    const S = g.s ?? 1.25;
    const W = (x: number, y: number, z: number) => new THREE.Vector3(x * S, y * S, z * S).applyMatrix4(R).add(org);
    const Rv = (x: number, y: number, z: number) => new THREE.Vector3(x * S, y * S, z * S).applyMatrix4(R);
    const Dw = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(R).normalize();
    const lean = (g.lean ?? 14) * DEG;
    const hip = g.hip;
    const ch = (u: number) => W(0, hip + u * Math.cos(lean), u * Math.sin(lean));
    const k = S * 1.12;
    // torso
    b.sweep([W(0, hip, 0), ch(0.2), ch(0.38)], [0.12 * S, 0.15 * S, 0.13 * S], { bone, color: g.top, sides: 7, name: "gTorso" });
    ball(bone, g.pants, W(0, hip, 0).toArray() as N3, 0.13 * S, [1, 0.8, 0.95]);
    // belt, buckle
    b.part(new THREE.TorusGeometry(0.135 * S, 0.028 * S, 4, 10), LEATHER_D, { bone, at: ch(0.06), dir: Dw(0, Math.cos(lean), Math.sin(lean)), axis: "z" });
    b.part(new THREE.BoxGeometry(0.06 * S, 0.05 * S, 0.03 * S), BRASS, { bone, at: W(0, hip + 0.06, 0.135), rotation: [0, g.yaw, 0] });
    // shoulders yoke
    for (const s of [1, -1]) ball(bone, g.trim, ch(0.36).add(Rv(s * 0.19, 0, 0)).toArray() as N3, 0.075 * S);
    // neck
    const neck = ch(0.44);
    // head
    const headC = W(0, hip + 0.4 * Math.cos(lean) + 0.15, 0.4 * Math.sin(lean) + 0.09);
    const look = g.look ?? [0, 0];
    const qh = new THREE.Quaternion().setFromEuler(new THREE.Euler(look[1] * DEG, (g.yaw + look[0]) * DEG, 0, "YXZ"));
    const mh = new THREE.Matrix4().compose(headC, qh, new THREE.Vector3(1, 1, 1));
    b.rod(ch(0.3), neck.clone().add(new THREE.Vector3(0, 0.02, 0)), 0.06 * S, { bone, color: SKIN_D, sides: 6, name: "gNeck" });
    const hp = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y * k, z * k).applyMatrix4(mh);
    const hd = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(qh).normalize();
    const hq = (rx = 0, ry = 0, rz = 0) => qh.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG)));
    const hpart = (geo: THREE.BufferGeometry, color: Fill, at: THREE.Vector3, rot: N3 = [0, 0, 0], scale?: N3 | number) =>
      b.part(geo, color, { bone, at, quat: hq(...rot), scale });
    hpart(new THREE.SphereGeometry(0.155 * k, 10, 8), skinPaint, hp(0, 0, 0), [0, 0, 0], [1, 0.95, 1.05]);
    hpart(new THREE.SphereGeometry(0.11 * k, 8, 6), skinPaint, hp(0, -0.1, 0.07), [0, 0, 0], [1.05, 0.8, 1]);
    // brow
    b.rod(hp(-0.125, 0.045, 0.1), hp(0.125, 0.045, 0.1), 0.032 * k, { bone, color: SKIN_D, sides: 5, name: "gBrow" });
    for (const s of [1, -1]) {
      hpart(new THREE.SphereGeometry(0.044 * k, 8, 6), EYE, hp(s * 0.07, 0.01, 0.125), [0, 0, 0], [1, 1, 0.8]);
      if (g.hat !== "sleep") hpart(new THREE.SphereGeometry(0.02 * k, 5, 4), INK, hp(s * 0.07, 0.01, 0.16));
      else {
        hpart(new THREE.SphereGeometry(0.047 * k, 8, 6), SKIN_D, hp(s * 0.07, 0.015, 0.128), [0, 0, 0], [1, 0.8, 0.85]);
        b.rod(hp(s * 0.04, 0.0, 0.17), hp(s * 0.1, 0.0, 0.165), 0.006 * k, { bone, color: INK, sides: 3 });
      }
      b.rod(hp(s * 0.03, 0.055, 0.15), hp(s * 0.115, 0.045, 0.12), 0.012 * k, { bone, color: INK, sides: 4, name: "gLid" });
      // ears
      const out = s;
      b.extrude(
        scaled([[0, -0.04], [0.14, -0.07], [0.3, 0.04], [0.42, 0.2, "sharp"], [0.26, 0.17], [0.12, 0.12], [0, 0.07]], k),
        { at: hp(s * 0.14, 0.02, -0.01), x: hd(out * 0.9, 0.12, -0.5), y: hd(0, 1, 0.1), thickness: 0.018 * k, bevel: 0.004, color: SKIN, bone, name: "gEar" },
      );
      b.extrude(
        scaled([[0.03, -0.015], [0.14, -0.03], [0.27, 0.06], [0.3, 0.13], [0.16, 0.1], [0.04, 0.05]], k),
        { at: hp(s * 0.147, 0.022, -0.012).add(hd(out * 0.45, 0, 0.9).multiplyScalar(0.002)), x: hd(out * 0.9, 0.12, -0.5), y: hd(0, 1, 0.1), thickness: 0.026 * k, color: "#d98a6b", bone, name: "gEarIn" },
      );
      // tusks
      b.spike(hp(s * 0.05, -0.135, 0.125), hd(s * 0.1, 1, 0.3), 0.075 * k, 0.017 * k, { bone, color: TUSK, sides: 5, name: "gTusk" });
      // lower teeth
      b.spike(hp(s * 0.095, -0.115, 0.11), hd(s * 0.1, 1, 0.2), 0.035 * k, 0.01 * k, { bone, color: TUSK, sides: 4, name: "gTooth" });
    }
    // nose
    b.sweep(catmull([hp(0, 0.0, 0.14), hp(0, 0.02, 0.22), hp(0, -0.04, 0.29), hp(0, -0.075, 0.28)]), [0.042 * k, 0.012 * k], { bone, color: SKIN_L, sides: 6, name: "gNose" });
    // mouth
    b.sweep(catmull([hp(-0.085, -0.095, 0.115), hp(0, -0.12, 0.14), hp(0.085, -0.095, 0.115)]), 0.009 * k, { bone, color: INK, sides: 4, name: "gMouth" });
    // hair/ mohawk tufts
    for (let i = 0; i < 4; i++)
      b.spike(hp(0, 0.1 - i * 0.02, 0.06 - i * 0.055), hd(0, 1, -0.25 - i * 0.1), 0.07 * k, 0.018 * k, { bone, color: INK, sides: 4, name: "gTuft" });
    // goggles on forehead
    const goggleC = g.hat === "sleep" ? null : hp(0, 0.095, 0.125);
    if (goggleC) {
      for (const s of [1, -1]) {
        hpart(new THREE.TorusGeometry(0.052 * k, 0.014 * k, 5, 10), BRASS, hp(s * 0.062, 0.1, 0.128), [-12, 0, 0]);
        glow(hpart(new THREE.CircleGeometry(0.045 * k, 9), "#8fe0ff", hp(s * 0.062, 0.1, 0.133), [-12, 0, 0]), 0.5);
      }
      b.sweep(catmull([hp(0.15, 0.09, 0.07), hp(0.12, 0.1, 0.12), hp(0, 0.1, 0.16), hp(-0.12, 0.1, 0.12), hp(-0.15, 0.09, 0.07), hp(0, 0.09, -0.15), hp(0.15, 0.09, 0.07)]), 0.01 * k, { bone, color: LEATHER_D, sides: 4, name: "gStrap" });
    }
    // hats
    const up = hd(0, 1, 0);
    if (g.hat === "cap") {
      b.lathe(scaled([[0, 0], [0.17, 0], [0.185, 0.05], [0.165, 0.13], [0.09, 0.19], [0, 0.2]], k), { at: hp(0, 0.07, -0.01), axis: up, segments: 8, color: LEATHER, bone, name: "gCap" });
      for (const s of [1, -1]) b.extrude(scaled([[0, 0], [0.09, -0.02], [0.1, -0.12], [0.02, -0.16], [-0.04, -0.06]], k), { at: hp(s * 0.15, 0.06, 0.0), x: hd(s, 0.1, 0), y: hd(0, 1, 0), thickness: 0.02 * k, color: LEATHER_D, bone, name: "gFlap" });
      stud(bone, BRASS, hp(0, 0.17, 0.12).toArray() as N3, 0.015);
    } else if (g.hat === "pot") {
      b.lathe(scaled([[0, 0], [0.19, 0], [0.2, 0.06], [0.17, 0.17], [0, 0.18]], k), { at: hp(0, 0.06, -0.01), axis: up, segments: 8, color: IRON_L, bone, name: "gPot" });
      rodA(bone, IRON_D, hp(0, 0.24, 0).toArray() as N3, hp(0, 0.3, 0).toArray() as N3, 0.012, 4);
      stud(bone, IRON_D, hp(0, 0.31, 0).toArray() as N3, 0.035);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        stud(bone, BRASS, hp(Math.cos(a) * 0.195, 0.14, Math.sin(a) * 0.195).toArray() as N3, 0.015);
      }
    } else if (g.hat === "bandana") {
      b.sweep(catmull([hp(0.16, 0.06, 0.04), hp(0.1, 0.075, 0.13), hp(0, 0.085, 0.16), hp(-0.1, 0.075, 0.13), hp(-0.16, 0.06, 0.04), hp(0, 0.06, -0.17), hp(0.16, 0.06, 0.04)]), 0.03 * k, { bone, color: RED, sides: 5, name: "gBandana" });
      b.spike(hp(0, 0.06, -0.16), hd(0.3, -0.3, -1), 0.2 * k, 0.03 * k, { bone, color: RED, sides: 4, name: "gKnot" });
      b.spike(hp(0, 0.06, -0.16), hd(-0.3, -0.5, -1), 0.18 * k, 0.03 * k, { bone, color: RED, sides: 4, name: "gKnot" });
    } else if (g.hat === "sleep") {
      b.lathe(scaled([[0, 0], [0.2, 0], [0.34, 0.02], [0.3, 0.05], [0.17, 0.08], [0.14, 0.2], [0, 0.22]], k), { at: hp(0, 0.1, 0.06), axis: hd(0, 1, 0.55), segments: 8, color: "#6d7f3c", bone, name: "gSlouch" });
    }
    // arms
    for (const [si, s] of [[0, 1], [1, -1]] as const) {
      const sh = ch(0.36).add(Rv(s * 0.19, 0, 0));
      const pts = limb(sh, g.hands[si], [0.26 * S, 0.25 * S], Dw(s * 0.5, -0.5, -0.8));
      b.sweep(pts.slice(0, 2).concat([pts[1].clone().lerp(pts[2], 0.05)]), [0.062 * S, 0.055 * S, 0.052 * S], { bone, color: g.top, sides: 6, name: "gArmUp" });
      b.sweep([pts[1], pts[2]], [0.052 * S, 0.05 * S], { bone, color: skinPaint, sides: 6, name: "gArmLow" });
      ball(bone, g.trim, [pts[1].x, pts[1].y, pts[1].z], 0.052 * S);
      b.part(new THREE.SphereGeometry(0.075 * S, 8, 6), SKIN_L, { bone, at: pts[2], scale: [1, 0.85, 1.15] });
      b.spike(pts[2], Dw(-s * 0.4, 0.15, 1), 0.08 * S, 0.02 * S, { bone, color: SKIN_L, sides: 4, name: "gThumb" });
      // cuff
      b.part(new THREE.TorusGeometry(0.05 * S, 0.015 * S, 4, 8), LEATHER_D, { bone, at: pts[1].clone().lerp(pts[2], 0.82), dir: pts[2].clone().sub(pts[1]), axis: "z" });
    }
    // legs
    for (const [si, s] of [[0, 1], [1, -1]] as const) {
      const hipP = W(s * 0.09, hip, 0);
      const pts = limb(hipP, g.feet[si], [0.27 * S, 0.27 * S], Dw(0, 0.1, 1));
      b.sweep(pts, [0.075 * S, 0.065 * S, 0.055 * S], { bone, color: g.pants, sides: 6, name: "gLeg" });
      b.part(new THREE.SphereGeometry(0.065 * S, 6, 5), g.pants, { bone, at: pts[1] });
      const f = pts[2];
      b.part(new THREE.BoxGeometry(0.15 * S, 0.1 * S, 0.27 * S), LEATHER_D, { bone, at: new THREE.Vector3(f.x, f.y - 0.03, f.z).add(Rv(0, 0, 0.07)), rotation: [0, g.yaw, 0] });
      b.part(new THREE.SphereGeometry(0.085 * S, 6, 4), LEATHER, { bone, at: new THREE.Vector3(f.x, f.y - 0.03, f.z).add(Rv(0, 0, 0.19)), scale: [0.9, 0.7, 0.9] });
      b.part(new THREE.CylinderGeometry(0.07 * S, 0.08 * S, 0.12 * S, 6), LEATHER, { bone, at: new THREE.Vector3(f.x, f.y + 0.06, f.z).add(Rv(0, 0, 0.0)) });
      b.rod(new THREE.Vector3(f.x, f.y + 0.05, f.z).add(Rv(-0.08, 0, 0)), new THREE.Vector3(f.x, f.y + 0.05, f.z).add(Rv(0.08, 0, 0)), 0.012 * S, { bone, color: BRASS, sides: 4, name: "gBuckle" });
    }
    return { W, Dw, mh, hp, headC, ch };
  }

  // pilot at the helm
  goblin({
    pos: [0, 2.42, -0.28], yaw: 0, hip: 0.4, bone: gondola, lean: 16,
    feet: [[0.14, 2.5, -0.15], [-0.14, 2.5, -0.3]], hands: [[0.27, 3.42, 0.05], [-0.27, 3.42, 0.2]],
    look: [8, 6], top: LEATHER, trim: ORANGE, pants: "#4d5a3e", hat: "cap",
  });
  // bomb gunner
  goblin({
    pos: [0.46, 2.42, 1.0], yaw: 20, hip: 0.38, bone: gondola, lean: 20,
    feet: [[0.62, 2.5, 1.05], [0.3, 2.5, 0.92]], hands: [[0.28, 3.1, 1.52], [0.18, 2.95, 1.4]],
    look: [-10, 4], top: "#3a3a42", trim: IRON_L, pants: "#6a4a30", hat: "pot",
  });
  // lit bomb in the gunner's hand
  ball(gondola, "#25282e", [0.28, 3.25, 1.55], 0.17);
  rodA(gondola, ROPE_D, [0.28, 3.4, 1.55], [0.3, 3.55, 1.53], 0.012, 4);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), FUSE, { bone: gondola, at: [0.3, 3.57, 1.53] }), 2);
  glow(b.part(new THREE.ConeGeometry(0.03, 0.1, 5), "#ff6a1a", { bone: gondola, at: [0.3, 3.63, 1.53] }), 2);
  // bosun's chair goblin patching the envelope
  goblin({
    pos: [2.5, 5.62, 1.7], yaw: -90, hip: 0.1, bone: hull, lean: 8,
    feet: [[2.3, 5.2, 1.84], [2.3, 5.2, 1.56]], hands: [[2.08, 6.2, 1.9], [2.08, 6.0, 1.55]],
    look: [0, -12], top: BLUEGREY, trim: CREAM, pants: "#6a4a30", hat: "bandana",
  });
  // seat, ropes, bucket, brush
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.62), WOOD_L, { bone: hull, at: [2.5, 5.58, 1.7] });
  for (const dz of [-0.26, 0.26]) {
    b.sweep(polyline([[2.5, 5.58, 1.7 + dz], [2.5, 6.6, 1.7 + dz * 0.5], [2.34, 8.5, 1.7 + dz * 0.2]]), 0.018, { bone: hull, color: ROPE, sides: 4, skin: "rigid", name: "chairRope" });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 8), "#a8b0b8", { bone: hull, at: [2.55, 5.5, 2.12] });
  torus(hull, IRON, [2.55, 5.58, 2.12], 0.09, 0.012, [1, 0, 0], 8);
  b.rod([2.08, 6.2, 1.9], [1.98, 6.38, 1.95], 0.014, { bone: hull, color: WOOD, sides: 4 });
  b.part(new THREE.BoxGeometry(0.03, 0.1, 0.06), "#2f6a2a", { bone: hull, at: [1.96, 6.42, 1.96], rotation: [0, 0, 20] });
  // fresh patch being sewn
  b.part(new THREE.BoxGeometry(0.03, 0.7, 0.8), "#3f808a", { bone: hull, at: [2.06, 6.05, 1.75], rotation: [0, 0, -3] });
  for (let i = 0; i < 5; i++) stud(hull, CREAM, [2.095, 5.78 + i * 0.12, 1.4], 0.016), stud(hull, CREAM, [2.095, 5.78 + i * 0.12, 2.1], 0.016);

  // ------------------------------------------------------------------------------------------- lanterns
  const lantern = (bone: Joint, at: N3, scale = 1) => {
    const [x, y, z] = at;
    b.part(new THREE.CylinderGeometry(0.1 * scale, 0.12 * scale, 0.05 * scale, 6), BRASS_D, { bone, at: [x, y, z] });
    glow(b.part(new THREE.CylinderGeometry(0.09 * scale, 0.11 * scale, 0.22 * scale, 6), GLASS, { bone, at: [x, y + 0.135 * scale, z] }), 1.3);
    b.part(new THREE.ConeGeometry(0.14 * scale, 0.12 * scale, 6), BRASS, { bone, at: [x, y + 0.31 * scale, z] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      rodA(bone, IRON_D, [x + Math.cos(a) * 0.11 * scale, y + 0.03 * scale, z + Math.sin(a) * 0.11 * scale], [x + Math.cos(a) * 0.095 * scale, y + 0.245 * scale, z + Math.sin(a) * 0.095 * scale], 0.007 * scale, 3);
    }
    torus(bone, IRON, [x, y + 0.42 * scale, z], 0.05 * scale, 0.01 * scale, [1, 0, 0], 8);
  };
  rodA(lampBow, IRON, [0, 4.25, 3.1], [0, 4.0, 3.1], 0.014, 4);
  lantern(lampBow, [0, 3.62, 3.1], 1.2);
  rodA(lampBow, IRON, [0, 4.0, 3.1], [0, 3.62 + 0.5, 3.1], 0.012, 4);
  b.sweep(catmull([[0, 4.25, 3.1], [0, 4.4, 3.3], [0, 4.2, 3.46]]), 0.014, { bone: gondola, color: IRON, sides: 4, name: "lampArm" });
  for (const s of [1, -1]) {
    rodA(gondola, WOOD_D, [s * 0.9, 3.9, -2.8], [s * 0.9, 4.4, -2.8], 0.04, 5);
    lantern(gondola, [s * 0.9, 4.4, -2.8], 1.0);
  }
  lantern(hull, [0, catY - 0.5, 4.35], 1.1);
  rodA(hull, IRON, [0, catY, 4.35], [0, catY - 0.1, 4.35], 0.012, 4);

  // sandbag ballast hanging on both sides
  for (const s of [1, -1]) {
    for (const z of [-2.2, -1.5, -0.8, 0.0, 0.7]) {
      const y = 2.0 + h1(Math.round(z * 10), s) * 0.25;
      const x = s * 1.2;
      if (z > -1.7 && z < 0.0) continue;
      b.part(new THREE.SphereGeometry(0.19, 7, 5), sackPaint, { bone: gondola, at: [x, y, z], scale: [1, 1.25, 0.95] });
      b.part(new THREE.ConeGeometry(0.09, 0.1, 6), SACK, { bone: gondola, at: [x, y + 0.26, z] });
      rodA(gondola, ROPE, [x, y + 0.3, z], [s * 1.0, 3.32, z], 0.014, 4);
      b.part(new THREE.TorusGeometry(0.07, 0.012, 4, 8), ROPE_D, { bone: gondola, at: [x, y + 0.2, z], dir: [0, 1, 0], axis: "z" });
    }
  }

  // ---------------------------------------------------------------------------------------- mooring
  const sagLine = (bone: Joint, a: N3, c: N3, sag: number, r = 0.04) => {
    const m: N3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - sag, (a[2] + c[2]) / 2];
    const path = catmull([a, m, c]);
    const turns = path.length / 0.15;
    const rope = paint((_p, n, s) => {
      const d = ((((s[1] - 360 * turns * s[0]) % 120) + 120) % 120) < 52;
      return shade(d ? mix(ROPE_D, ROPE, 0.0) : mix(ROPE, "#e3c88e", 0.3), n);
    });
    b.sweep(path, r, { bone, color: rope, sides: 6, name: "mooringLine" });
    return path;
  };
  const anchorStone = (at: N3, r = 0.6) => {
    b.lathe([[0, 0], [r, 0], [r + 0.04, 0.12], [r - 0.06, 0.2], [0, 0.2]], { at, segments: 7, color: stonePaint, bone: ground, name: "flagstone" });
  };
  const sandbags = (at: N3, seed: number) => {
    const rr = rng(seed);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + rr();
      b.part(new THREE.SphereGeometry(0.2, 7, 5), sackPaint, { bone: ground, at: [at[0] + Math.cos(a) * 0.3, at[1] + 0.15, at[2] + Math.sin(a) * 0.3], scale: [1.1, 0.7, 0.85], rotation: [0, a * 57, 0] });
    }
    b.part(new THREE.SphereGeometry(0.2, 7, 5), sackPaint, { bone: ground, at: [at[0], at[1] + 0.36, at[2]], scale: [1.1, 0.7, 0.85], rotation: [0, seed * 20, 0] });
  };
  const ringBolt = (at: N3, dir: N3) => {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 6), IRON, { bone: ground, at: [at[0], at[1] - 0.04, at[2]] });
    b.part(new THREE.TorusGeometry(0.14, 0.035, 5, 10), IRON_L, { bone: ground, at: [at[0], at[1] + 0.12, at[2]], dir, axis: "z" });
  };
  const tuftsAt: Array<[number, number, number]> = [];

  // gondola lines
  const lines: Array<{ start: N3; end: N3; stone: N3; seed: number }> = [
    { start: [0.5, 3.5, 2.2], end: [4.6, 0.62, 5.5], stone: [4.6, 0, 5.5], seed: 1 },
    { start: [-0.5, 3.5, 2.2], end: [-4.6, 0.62, 5.5], stone: [-4.6, 0, 5.5], seed: 2 },
    { start: [0.96, 3.98, -2.6], end: [4.9, 0.62, -4.9], stone: [4.9, 0, -4.9], seed: 3 },
    { start: [-0.96, 3.98, -2.6], end: [-4.9, 0.62, -4.9], stone: [-4.9, 0, -4.9], seed: 4 },
  ];
  for (const l of lines) {
    // cleat on the hull
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 6), IRON_D, { bone: gondola, at: [l.start[0], l.start[1] - 0.03, l.start[2]] });
    rodA(gondola, IRON_D, [l.start[0] - 0.1, l.start[1] + 0.07, l.start[2]], [l.start[0] + 0.1, l.start[1] + 0.07, l.start[2]], 0.03, 5);
    sagLine(ground, l.start, [l.end[0], l.end[1] + 0.1, l.end[2]], 0.18, 0.04);
    anchorStone(l.stone, 0.62);
    const ang = Math.atan2(l.end[0], l.end[2]);
    ringBolt([l.stone[0], 0.2, l.stone[2]], [Math.cos(ang), 0, -Math.sin(ang)]);
    sandbags([l.stone[0] + (l.seed % 2 ? -0.28 : 0.28), 0.1, l.stone[2] + (l.seed < 3 ? 0.1 : -0.1)], l.seed * 7);
    // tied end loop
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), ROPE, { bone: ground, at: [l.stone[0], 0.4, l.stone[2]], dir: [0, 1, 0], axis: "z" });
    tuftsAt.push([l.stone[0] + 0.8, 0, l.stone[2] + 0.3], [l.stone[0] - 0.7, 0, l.stone[2] - 0.5]);
  }

  // nose line to a capstan
  const noseLine = sagLine(ground, [0, ENV_Y - 0.25 - 0.03, 6.95], [0, 1.15, 9.5], 0.35, 0.05);
  // tail line to a big iron anchor
  const tailLine = sagLine(ground, [0, ENV_Y + 0.28, -6.9], [0, 1.45, -9.6], 0.3, 0.05);
  for (const [line, tex, seed] of [[noseLine, BUNT_A, 41], [tailLine, BUNT_B, 42]] as const) {
    const fr: Frame[] = [];
    for (let i = 1; i < 12; i++) fr.push(frame(line.at(i / 12), [0, 1, 0]));
    b.cards(fr, tex, { size: [0.3, 0.38], lean: 180, flow: [1, 0, 0], cross: false, vary: 0.15, rng: rng(seed), bone: ground });
  }
  // capstan
  anchorStone([0, 0, 9.6], 0.95);
  b.lathe([[0, 0.2], [0.45, 0.2], [0.5, 0.35], [0.36, 0.5], [0.3, 0.9], [0.4, 1.0], [0.42, 1.1], [0, 1.1]], { at: [0, 0, 9.6], segments: 10, color: woodPaint, bone: ground, name: "capstan" });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    rodA(ground, WOOD_L, [Math.cos(a) * 0.1, 1.0, 9.6 + Math.sin(a) * 0.1], [Math.cos(a) * 0.95, 1.0, 9.6 + Math.sin(a) * 0.95], 0.04, 5);
    ball(ground, IRON, [Math.cos(a) * 0.95, 1.0, 9.6 + Math.sin(a) * 0.95], 0.05);
  }
  for (let i = 0; i < 3; i++) torus(ground, ROPE, [0, 0.58 + i * 0.1, 9.6], 0.32, 0.04, [0, 1, 0], 10);
  torus(ground, IRON, [0, 0.45, 9.6], 0.46, 0.03, [0, 1, 0], 10);
  torus(ground, IRON, [0, 1.02, 9.6], 0.37, 0.03, [0, 1, 0], 10);
  // anchor
  anchorStone([0, 0, -9.6], 0.9);
  b.rod([0, 0.15, -9.6], [0, 1.7, -9.6], 0.06, { bone: ground, color: ironDark, sides: 6, name: "anchorShank" });
  b.rod([-0.45, 1.45, -9.6], [0.45, 1.45, -9.6], 0.05, { bone: ground, color: ironDark, sides: 6, name: "anchorStock" });
  ball(ground, IRON, [0.45, 1.45, -9.6], 0.07);
  ball(ground, IRON, [-0.45, 1.45, -9.6], 0.07);
  torus(ground, IRON_L, [0, 1.78, -9.6], 0.14, 0.035, [1, 0, 0], 10);
  b.sweep(catmull([[-0.6, 0.55, -9.6], [-0.4, 0.15, -9.6], [0, 0.1, -9.6], [0.4, 0.15, -9.6], [0.6, 0.55, -9.6]]), [0.05, 0.05], { bone: ground, color: ironDark, sides: 6, name: "anchorArm" });
  b.spike([-0.6, 0.5, -9.6], [-0.3, 1, 0], 0.22, 0.08, { bone: ground, color: IRON_L, sides: 4, name: "fluke" });
  b.spike([0.6, 0.5, -9.6], [0.3, 1, 0], 0.22, 0.08, { bone: ground, color: IRON_L, sides: 4, name: "fluke" });
  tuftsAt.push([1.4, 0, -9.4], [-1.4, 0, -9.0], [1.8, 0, 9.0], [-1.7, 0, 10.1], [2.4, 0, 8.6]);

  // rope ladder on the left side
  const ladderTop: N3 = [1.12, 3.3, 0.85];
  for (const dz of [0, 0.46]) {
    sagLine(gondola, [ladderTop[0], ladderTop[1], ladderTop[2] + dz], [1.55, 0.08, 1.0 + dz], 0.0, 0.025);
  }
  const rungs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.6) / 9.6;
    const x = ladderTop[0] + (1.55 - ladderTop[0]) * t;
    const y = ladderTop[1] + (0.08 - ladderTop[1]) * t;
    const z = ladderTop[2] + 0.23 + (1.0 - ladderTop[2]) * t;
    rungs.push(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5).rotateX(Math.PI / 2).translate(x, y, z));
  }
  b.part(mergeGeometries(rungs)!, WOOD_L, { bone: gondola, at: [0, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), IRON_D, { bone: ground, at: [1.55, 0.12, 1.0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), IRON_D, { bone: ground, at: [1.55, 0.12, 1.46] });
  for (const dz of [0, 0.46]) b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.2, 6), IRON_D, { bone: gondola, at: [1.12, 3.3, 0.85 + dz] });
  rodA(gondola, WOOD_L, [1.12, 3.32, 0.8], [1.12, 3.32, 1.36], 0.05, 5);

  // a goblin climbing the ladder with a sack of bombs
  goblin({
    pos: [1.58, 1.3, 1.16], yaw: -90, hip: 0.4, bone: gondola, lean: 12,
    feet: [[1.4, 1.37, 1.28], [1.42, 1.72, 1.06]], hands: [[1.33, 2.25, 1.28], [1.3, 2.5, 1.04]],
    look: [0, -18], top: "#7a3a2a", trim: BRASS_D, pants: "#3e4a56", hat: "pot", s: 1.15,
  });
  ball(gondola, sackPaint, [1.92, 1.95, 1.16], 0.26, [0.8, 1.1, 0.9]);
  // ground guard asleep next to the capstan, sitting on a crate
  b.part(new THREE.BoxGeometry(0.6, 0.46, 0.6), woodDark, { bone: ground, at: [1.6, 0.23, 8.5], rotation: [0, 18, 0] });
  boxAt(ground, IRON, [1.6, 0.23, 8.5], [0.62, 0.05, 0.62], 18);
  boxAt(ground, WOOD_L, [1.6, 0.23, 8.5], [0.05, 0.48, 0.62], 18);
  goblin({
    pos: [1.6, 0.46, 8.5], yaw: -150, hip: 0.1, bone: ground, lean: -10,
    feet: [[1.1, 0.08, 8.0], [1.4, 0.08, 7.85]], hands: [[1.78, 0.62, 8.15], [1.45, 0.58, 8.1]],
    look: [0, 24], top: ORANGE, trim: LEATHER_D, pants: "#6a4a30", hat: "sleep",
  });
  b.cards([frame([1.2, 1.55, 8.2], [0, 1, 0])], ZZZ, { size: [0.5, 0.4], lean: 90, flow: [0, 0, -1], mirror: true });
  b.part(new THREE.PlaneGeometry(0.5, 0.4), "#ffffff", { bone: ground, at: [1.15, 1.45, 8.0], dir: [0, 0.3, 1], axis: "z", texture: ZZZ });
  // spear leaning on capstan
  b.rod([2.2, 0.02, 9.4], [1.5, 1.9, 9.45], 0.025, { bone: ground, color: WOOD, sides: 5, name: "spear" });
  b.spike([1.5, 1.9, 9.45], [-0.35, 1, 0.0], 0.3, 0.05, { bone: ground, color: IRON_L, sides: 5, name: "spearHead" });

  // sign post
  b.rod([-2.9, 0, 7.4], [-2.9, 1.7, 7.4], 0.06, { bone: ground, color: WOOD, sides: 6, name: "signPost" });
  b.part(new THREE.PlaneGeometry(1.0, 0.33), "#ffffff", { bone: ground, at: [-2.9, 1.45, 7.47], dir: [0, 0, 1], axis: "z", texture: SIGN });
  b.part(new THREE.PlaneGeometry(1.0, 0.33), "#ffffff", { bone: ground, at: [-2.9, 1.45, 7.33], dir: [0, 0, -1], axis: "z", texture: SIGN, up: [0, 1, 0] });
  anchorStone([-2.9, 0, 7.4], 0.5);
  // crate pile
  b.part(new THREE.BoxGeometry(0.7, 0.55, 0.7), woodPaint, { bone: ground, at: [3.2, 0.275, 3.2], rotation: [0, 25, 0] });
  b.part(new THREE.BoxGeometry(0.55, 0.45, 0.55), woodLight, { bone: ground, at: [3.25, 0.775, 3.15], rotation: [0, -10, 0] });
  b.part(new THREE.BoxGeometry(0.6, 0.5, 0.6), woodDark, { bone: ground, at: [2.5, 0.25, 3.7], rotation: [0, 50, 0] });
  barrel(ground, [-3.4, 0, 2.6], 1, true);
  barrel(ground, [-3.9, 0, 3.2], 1, false);
  for (const [x, z, r] of [[3.2, 3.2, 25], [2.5, 3.7, 50]] as const) boxAt(ground, IRON, [x, 0.25, z], [0.72, 0.06, 0.72], r);
  // tufts of grass (cards)
  const grassF: Frame[] = [];
  const rg = rng(31);
  for (const [x, , z] of tuftsAt) for (let i = 0; i < 3; i++) grassF.push(frame([x + (rg() - 0.5) * 0.7, 0, z + (rg() - 0.5) * 0.7], [0, 1, 0]));
  for (const [x, z] of [[3.6, 3.9], [-3.1, 2.2], [2.9, -1.8], [-2.6, -2.4], [-2.2, 5.9], [3.9, 7.4], [0.8, -7.6], [-1.2, 6.5]] as const) grassF.push(frame([x, 0, z], [0, 1, 0]));
  b.cards(grassF, GRASS, { size: [0.28, 0.28], cross: true, vary: 0.35, spin: 180, rng: rng(32), bone: ground });

  // ------------------------------------------------------------------------------- final flush & pose
  for (const e of bank.values()) {
    const merged = mergeGeometries(e.geos);
    if (merged) b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], name: `merged.${e.color}` });
  }
  b.pose(hatch, { axis: [0, 1, 0], deg: 70 });
  return b.root;
}
