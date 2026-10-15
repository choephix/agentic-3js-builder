import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering scythe whose haft is a dragon's spine and whose crown is a snarling dragon skull; a soulsteel crescent blade carries glowing spectral runes, a captured soul hovers in its curve, and wisps spiral up from a runic stone dais.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone, deep soulsteel violet, one strong spectral-teal accent, a little gold.
const IVORY = "#f3e9cc";
const IVORY_MID = "#dccaa0";
const IVORY_DK = "#a88f62";
const BONE_SHADE = "#7a6444";
const TOOTH = "#fff6dc";
const STEEL_DK = "#150f2b";
const STEEL = "#2b2056";
const STEEL_HI = "#5a44b8";
const VIOLET = "#8e6cf0";
const TEAL = "#2df5d2";
const TEAL_DK = "#0d8f86";
const MINT = "#c8fff3";
const GOLD = "#f2bd3e";
const GOLD_DK = "#9b6a1b";
const GOLD_HI = "#ffe58f";
const STONE = "#3a3f5e";
const STONE_B = "#4b5176";
const STONE_DK = "#1f2240";
const LEATHER = "#3d1f3a";
const LEATHER_HI = "#78406a";
const SOCKET = "#0a0714";

// ---------------------------------------------------------------------------------------------------------------
// Blade geometry (shared by the plate, the edge, the spine ridge and the rune drawing).
const BY = 1.99; // height of the blade's origin (the hub)
const CY = -0.9; // arc centre, relative to the hub
const RC = 0.95; // centre-line radius of the crescent
const thetaU = (u: number) => (98 - 68 * u) * DEG;
const wA = (u: number) => 0.118 * Math.pow(1 - u, 0.8); // spine side half-width
const wB = (u: number) => 0.15 * Math.pow(1 - u, 0.8); // edge side half-width
const radAt = (u: number, f: number) => RC + (f >= 0 ? f * wA(u) : f * wB(u));
/** Blade point in blade-local meters (x, y relative to the hub) at arc fraction u and width fraction f (-1 edge .. 1 spine). */
const bl = (u: number, f: number): [number, number] => {
  const th = thetaU(u);
  const r = radAt(u, f);
  return [r * Math.cos(th), CY + r * Math.sin(th)];
};
const bw = (u: number, f: number, z = 0): [number, number, number] => {
  const [x, y] = bl(u, f);
  return [x, BY + y, z];
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const boneBase = mottle(IVORY, IVORY_MID, { size: 0.045, seed: 3, contrast: 0.9 });
const bonePaint = paint((p, n) => {
  const base = boneBase.at(p, n);
  const lit = Math.min(Math.max(0.5 + 0.5 * n.y, 0), 1);
  let c = mix(base, IVORY_DK, (1 - lit) * 0.5);
  const cell = cells(p, 0.055, 5);
  if (cell.id < 0.32 && cell.d2 - cell.d1 < 0.045) c = mix(c, BONE_SHADE, 0.7);
  return c;
});
const bandedBone = paint((p, n, s) => {
  const base = bonePaint.at(p, n, s);
  return (s[0] * 9) % 1 < 0.14 ? mix(base, IVORY_DK, 0.65) : base;
});
const vertPaint = (h: number) =>
  paint((p, n, s) => {
    const base = bonePaint.at(p, n, s);
    const k = Math.min(s[0], h - s[0]);
    return mix(BONE_SHADE, base, smoothstep(0.0, 0.016, k) * 0.9 + 0.1);
  });
const bladePaint = paint((p, n, s) => {
  const d = Math.hypot(s[0], s[1] - CY) - RC;
  const t = smoothstep(-0.17, 0.12, d);
  let c = mix(STEEL_HI, STEEL_DK, Math.pow(t, 0.8));
  c = mix(c, STEEL, 0.25 * noise(p, 0.07, 9));
  const streak = Math.max(0, 1 - Math.abs(d + 0.07) / 0.012);
  c = mix(c, VIOLET, streak * 0.55);
  const rim = Math.max(0, 1 - Math.abs(d + 0.13) / 0.01);
  c = mix(c, "#b9a6ff", rim * 0.4);
  return Math.abs(n.z) < 0.5 ? STEEL_DK : c;
});
const leatherPaint = paint((p, n, s) => {
  const phase = (((s[1] / 360 - 15 * s[0]) % 1) + 1) % 1;
  if (phase < 0.12) return mix(GOLD_DK, GOLD, 0.35 + 0.4 * noise(p, 0.02, 2));
  const base = mix(LEATHER, LEATHER_HI, noise(p, 0.03, 4) * 0.8);
  return phase < 0.2 ? mix(base, STEEL_DK, 0.5) : base;
});
const frillPaint = paint((_p, n, s) => {
  const ang = Math.atan2(s[1], s[0]);
  const rib = Math.abs((((ang / DEG + 360) % 22) + 22) % 22 - 11) < 1.6 && Math.abs(n.z) > 0.5;
  const r = Math.hypot(s[0], s[1]);
  const memb = mix(STEEL, TEAL, smoothstep(0.08, 0.32, r) * 0.9);
  return rib ? IVORY_MID : memb;
});
const stonePaint = scales([STONE, STONE_B, "#343858"], STONE_DK, { size: 0.12, width: 0.08 });
const stoneTop = paint((p, n, s) => {
  const base = stonePaint.at(p, n, s);
  return mix(base, "#7d86b8", Math.max(0, n.y) * 0.18);
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const XMIN = -0.16;
const XMAX = 0.9;
const YMIN = -0.46;
const YMAX = 0.2;
const SCL = 1000;
const P = (x: number, y: number) => `${((x - XMIN) * SCL).toFixed(1)},${((YMAX - y) * SCL).toFixed(1)}`;
const bladePoly = (u0: number, u1: number, f: number, n: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const [x, y] = bl(u0 + ((u1 - u0) * i) / n, f);
    pts.push(P(x, y));
  }
  return pts.join(" ");
};
const GLYPHS: number[][][][] = [
  [[[-1, -1], [0, 1], [1, -1]], [[-0.6, 0], [0.6, 0]]],
  [[[-1, 1], [-1, -1], [1, -1]], [[1, 1], [1, -0.2]]],
  [[[0, 1], [0, -1]], [[-1, 0.3], [0, -0.2], [1, 0.3]]],
  [[[-1, 0], [0, 1], [1, 0], [0, -1], [-1, 0]], [[0, 0.3], [0, -0.3]]],
  [[[-1, 1], [1, -1]], [[-1, -1], [1, 1]], [[0, 1], [0, -1]]],
  [[[-1, -1], [-1, 1], [1, 1], [1, -1]], [[-1, 0], [1, 0]]],
];
function bladeSvg(mirror: boolean) {
  const strokes: string[] = [];
  const line = (pts: string, w: number, col: string, op = 1) =>
    strokes.push(`<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`);
  line(bladePoly(0.07, 0.9, -0.52, 36), 7, TEAL);
  line(bladePoly(0.07, 0.9, -0.52, 36), 2.6, MINT);
  line(bladePoly(0.1, 0.84, 0.5, 34), 5, TEAL, 0.9);
  line(bladePoly(0.1, 0.78, 0.74, 30), 3.4, TEAL, 0.7);
  // runes down the middle
  for (let i = 0; i < 9; i++) {
    const u = 0.13 + i * 0.085;
    const th = thetaU(u);
    const T = [Math.sin(th), -Math.cos(th)];
    const N = [Math.cos(th), Math.sin(th)];
    const [cx, cy] = bl(u, -0.02);
    const size = 0.013 + 0.026 * Math.pow(1 - u, 0.7);
    for (const stroke of GLYPHS[i % GLYPHS.length]) {
      const pts = stroke.map(([gx, gy]) => P(cx + T[0] * gx * size + N[0] * gy * size, cy + T[1] * gx * size + N[1] * gy * size));
      line(pts.join(" "), 6, MINT);
    }
  }
  // diamonds + ticks on the spine side
  for (let i = 0; i < 11; i++) {
    const u = 0.09 + i * 0.075;
    const [cx, cy] = bl(u, 0.62);
    const s = 0.01 * (1 - u * 0.6);
    line([P(cx - s, cy), P(cx, cy + s), P(cx + s, cy), P(cx, cy - s), P(cx - s, cy)].join(" "), 4, TEAL);
  }
  // root eye ornament
  for (let k = 0; k < 3; k++) {
    const [cx, cy] = bl(0.02 + k * 0.02, -0.1);
    const s = 0.045 - k * 0.012;
    line([P(cx - s, cy), P(cx, cy + s), P(cx + s, cy), P(cx, cy - s), P(cx - s, cy)].join(" "), 5, k === 2 ? MINT : TEAL);
  }
  // tip streaks
  for (const f of [-0.3, 0.2]) line(bladePoly(0.84, 0.95, f, 8), 4, MINT, 0.8);
  const W = (XMAX - XMIN) * SCL;
  const H = (YMAX - YMIN) * SCL;
  const body = strokes.join("");
  const inner = mirror ? `<g transform="translate(${W},0) scale(-1,1)">${body}</g>` : body;
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${inner}</svg>`, { size: 2048 });
}

function runeCircleSvg() {
  const parts: string[] = [];
  const C = 300;
  const circle = (r: number, w: number, col = TEAL) =>
    parts.push(`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}"/>`);
  circle(286, 9);
  circle(266, 4, MINT);
  circle(196, 5);
  circle(66, 7);
  circle(24, 6, MINT);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r0 = 208;
    const r1 = 252;
    const g = GLYPHS[i % GLYPHS.length];
    const T = [-Math.sin(a), Math.cos(a)];
    const N = [Math.cos(a), Math.sin(a)];
    const cx = C + N[0] * (r0 + r1) * 0.5;
    const cy = C + N[1] * (r0 + r1) * 0.5;
    for (const stroke of g) {
      const pts = stroke.map(([gx, gy]) => `${(cx + T[0] * gx * 13 + N[0] * gy * 16).toFixed(1)},${(cy + T[1] * gx * 13 + N[1] * gy * 16).toFixed(1)}`);
      parts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${MINT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  }
  for (const rot of [0, 60]) {
    const pts = [0, 1, 2].map((k) => {
      const a = ((rot + 120 * k - 90) * Math.PI) / 180;
      return `${(C + Math.cos(a) * 190).toFixed(1)},${(C + Math.sin(a) * 190).toFixed(1)}`;
    });
    parts.push(`<polygon points="${pts.join(" ")}" fill="none" stroke="${TEAL}" stroke-width="6" stroke-linejoin="round"/>`);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    parts.push(`<line x1="${C + Math.cos(a) * 70}" y1="${C + Math.sin(a) * 70}" x2="${C + Math.cos(a) * 190}" y2="${C + Math.sin(a) * 190}" stroke="${TEAL_DK}" stroke-width="5"/>`);
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${parts.join("")}</svg>`, { size: 1024 });
}

const tassel = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 72">
  <path d="M12 0 L18 6 L16 20 L12 72 L8 20 L6 6 Z" fill="${TEAL}"/>
  <path d="M12 4 L14 10 L12 56 L10 10 Z" fill="${MINT}"/>
  <path d="M3 8 L8 14 L5 50 Z" fill="${TEAL_DK}"/><path d="M21 8 L16 14 L19 50 Z" fill="${TEAL_DK}"/>
  <rect x="5" y="0" width="14" height="7" rx="2" fill="${GOLD}"/>
  <rect x="5" y="3" width="14" height="2" fill="${GOLD_DK}"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const rnd = rng(11);

  // Skeleton: root on the dais, the haft, a head with a jaw, and a swinging charm.
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const haft = b.joint("haft", { parent: root, at: [0, 0.14, 0], dir: [0, 1, 0], role: "spine" });
  const head = b.joint("head", { parent: haft, at: [0, 1.6, 0.03], dir: [0, 0, 1], role: "head" });
  const JO = new THREE.Vector3(0, 1.545, 0.075);
  const JA = 36 * DEG;
  const jaw = b.joint("jaw", { parent: head, at: JO, dir: [0, -Math.sin(JA), Math.cos(JA)], role: "jaw" });
  const charm = b.chain(
    "charm",
    catmull([
      [0, 1.12, 0.06],
      [0, 1.02, 0.085],
      [0, 0.92, 0.085],
      [0, 0.82, 0.08],
    ]),
    { parent: haft, names: ["charm1", "charm2", "charm3", "charmTip"], role: "hinge" },
  );

  // ===== Dais ======================================================================================================
  const tier = (r: number, y0: number, y1: number, chamfer: number, name: string, color = stoneTop) =>
    b.lathe(
      [
        [0, y0],
        [r, y0],
        [r, y1 - chamfer],
        [r - chamfer, y1],
        [0, y1],
      ],
      { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color, name },
    );
  tier(0.54, 0, 0.055, 0.016, "tier1");
  tier(0.46, 0.055, 0.1, 0.014, "tier2");
  tier(0.37, 0.1, 0.14, 0.012, "tier3");
  // gold inlay rings
  b.lathe(
    [
      [0.3, 0.136],
      [0.355, 0.136],
      [0.355, 0.146],
      [0.3, 0.146],
    ],
    { at: [0, 0, 0], bone: root, segments: 16, color: GOLD, name: "goldRing" },
  );
  b.lathe(
    [
      [0.44, 0.098],
      [0.455, 0.098],
      [0.455, 0.108],
      [0.44, 0.108],
    ],
    { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: GOLD_DK, name: "goldRing2" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.58, 0.58), "#ffffff", {
      bone: root,
      at: [0, 0.1445, 0],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: runeCircleSvg(),
      name: "runeCircle",
    }),
    1.4,
  );
  // dragon-claw studs around the dais, and corner crystals
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 22.5 * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    b.spike([dx * 0.5, 0.045, dz * 0.5], [dx, 0.6, dz], 0.1, 0.022, { color: IVORY, bone: root, sides: 5 });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD_HI, { bone: root, at: [dx * 0.4, 0.103, dz * 0.4] });
  }
  for (let i = 0; i < 4; i++) {
    const a = (45 + i * 90) * DEG;
    const x = Math.sin(a) * 0.43;
    const z = Math.cos(a) * 0.43;
    glow(b.part(new THREE.OctahedronGeometry(0.06, 0), TEAL, { bone: root, at: [x, 0.19, z], scale: [0.75, 1.9, 0.75], flat: true, name: "crystal" }), 1.2);
    b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.05, 6), GOLD_DK, { bone: root, at: [x, 0.125, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.01, 6), GOLD, { bone: root, at: [x, 0.155, z], flat: true });
  }

  // ===== Floor clutter: dragon bones and shards ====================================================================
  const bonePart = (a: [number, number, number], c: [number, number, number], r: number) => {
    b.capsule(a, c, r, { color: bonePaint, bone: root, sides: 6 });
    for (const e of [a, c]) b.part(new THREE.SphereGeometry(r * 1.45, 6, 4), IVORY, { bone: root, at: e, flat: true });
  };
  bonePart([0.62, 0.032, 0.5], [0.95, 0.032, 0.24], 0.028);
  bonePart([-0.7, 0.026, 0.48], [-0.98, 0.026, 0.62], 0.022);
  b.sweep(
    catmull([
      [-0.62, 0.02, -0.5],
      [-0.78, 0.07, -0.58],
      [-0.9, 0.11, -0.72],
      [-0.92, 0.04, -0.88],
    ]),
    [0.026, 0.006],
    { color: bonePaint, bone: root, sides: 6, caps: "point" },
  );
  b.sweep(
    catmull([
      [0.52, 0.02, -0.62],
      [0.66, 0.07, -0.72],
      [0.74, 0.11, -0.88],
      [0.68, 0.04, -1.02],
    ]),
    [0.024, 0.006],
    { color: bonePaint, bone: root, sides: 6, caps: "point" },
  );
  // small dragon skull on the floor (back left)
  b.part(new THREE.SphereGeometry(0.055, 7, 5), IVORY, { bone: root, at: [-0.68, 0.052, -0.18], scale: [1, 0.85, 1.15], flat: true });
  b.frustumBox([-0.68, 0.045, -0.12], [-0.68, 0.036, 0.02], [0.07, 0.055], [0.04, 0.035], { color: IVORY_MID, bone: root });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.013, 5, 4), TEAL, { bone: root, at: [-0.68 + s * 0.026, 0.07, -0.13] }), 1);
    b.spike([-0.68 + s * 0.035, 0.07, -0.2], [s * 0.7, 0.5, -0.8], 0.09, 0.014, { color: IVORY, bone: root, sides: 5 });
  }
  const shardSpots: Array<[number, number, number, number]> = [
    [0.78, 0, 0.62, 0.07],
    [-0.42, 0, 0.78, 0.055],
    [0.2, 0, -0.78, 0.06],
    [-0.9, 0, -0.18, 0.05],
    [0.95, 0, -0.3, 0.045],
  ];
  for (const [x, , z, h] of shardSpots) {
    glow(
      b.part(new THREE.OctahedronGeometry(h * 0.5, 0), TEAL, {
        bone: root,
        at: [x, h * 0.85, z],
        scale: [0.7, 1.9, 0.7],
        rotation: [rnd() * 14 - 7, rnd() * 90, rnd() * 14 - 7],
        flat: true,
        name: "floorShard",
      }),
      1.1,
    );
  }

  // ===== Haft: a dragon's spine =====================================================================================
  b.rod([0, 0.12, 0], [0, 1.97, 0], 0.03, { color: STEEL_DK, bone: haft, sides: 8, name: "core" });

  const collar = (y0: number, r: number, h: number, name: string) => {
    b.lathe(
      [
        [0, y0],
        [r * 0.9, y0],
        [r, y0 + h * 0.25],
        [r, y0 + h * 0.75],
        [r * 0.9, y0 + h],
        [0, y0 + h],
      ],
      { at: [0, 0, 0], bone: haft, segments: 10, color: GOLD, name },
    );
    b.lathe(
      [
        [r * 0.99, y0 + h * 0.4],
        [r * 1.04, y0 + h * 0.5],
        [r * 0.99, y0 + h * 0.6],
      ],
      { at: [0, 0, 0], bone: haft, segments: 10, color: GOLD_DK, name: name + "Rib" },
    );
  };
  const gemSet = (y: number, r: number, size: number) => {
    for (const a of [0, 90, 180, 270]) {
      const dx = Math.sin(a * DEG);
      const dz = Math.cos(a * DEG);
      glow(
        b.part(new THREE.OctahedronGeometry(size, 0), TEAL, { bone: haft, at: [dx * r, y, dz * r], scale: [1, 1.4, 0.7], rotation: [0, a, 0], flat: true, name: "collarGem" }),
        1.3,
      );
    }
  };
  collar(0.14, 0.066, 0.07, "baseCollar");
  gemSet(0.175, 0.066, 0.016);

  const vertebra = (y0: number, h: number, r: number, i: number, spines: boolean, name: string) => {
    const o: OutlinePoint[] = [
      [0, 0],
      [r * 0.82, 0],
      [r, 0.014],
      [r * 0.74, h * 0.5],
      [r, h - 0.014],
      [r * 0.82, h],
      [0, h],
    ];
    b.lathe(o, { at: [0, y0, 0], bone: haft, segments: 8, spin: (i % 2) * 22.5, color: vertPaint(h), name });
    const ym = y0 + h * 0.52;
    if (spines) {
      b.spike([0, ym, r * 0.55], [0, 0.35, 1], 0.055 + 0.022 * (i % 2), 0.019, { color: IVORY_MID, bone: haft, sides: 5 });
      for (const s of [1, -1]) b.spike([s * r * 0.7, ym - 0.004, 0], [s, -0.25, 0.15], 0.05, 0.014, { color: IVORY_MID, bone: haft, sides: 5 });
    }
    b.spike([0, ym + 0.01, -r * 0.55], [0, 0.45, -1], 0.04 + 0.015 * (i % 2), 0.016, { color: IVORY_DK, bone: haft, sides: 5 });
    // glowing seam below each vertebra
    glow(
      b.lathe(
        [
          [0, y0 - 0.012],
          [r * 0.8, y0 - 0.012],
          [r * 0.8, y0],
          [0, y0],
        ],
        { at: [0, 0, 0], bone: haft, segments: 8, spin: 11, color: TEAL, name: "seam" },
      ),
      1.2,
    );
  };
  // lower spine
  for (let i = 0; i < 6; i++) vertebra(0.2 + i * 0.092, 0.08, 0.056 - i * 0.0018, i, true, `vertLow${i}`);
  // grip
  collar(0.745, 0.058, 0.045, "gripLowCollar");
  b.rod([0, 0.79, 0], [0, 1.1, 0], 0.036, { color: leatherPaint, bone: haft, sides: 10, name: "grip" });
  collar(0.915, 0.05, 0.03, "gripMidCollar");
  gemSet(0.93, 0.05, 0.013);
  collar(1.095, 0.058, 0.045, "gripHiCollar");
  // upper spine
  for (let i = 0; i < 4; i++) vertebra(1.158 + i * 0.08, 0.066, 0.047, i + 1, true, `vertHigh${i}`);
  // neck and post behind and above the skull
  vertebra(1.48, 0.1, 0.05, 0, false, "neck0");
  vertebra(1.595, 0.1, 0.05, 1, false, "neck1");
  vertebra(1.71, 0.09, 0.046, 0, false, "post0");
  vertebra(1.812, 0.09, 0.043, 1, false, "post1");
  collar(1.91, 0.058, 0.05, "hubCollar");

  // ===== Hub and counter-spike ====================================================================================
  b.frustumBox([0, 1.95, 0], [0, 2.045, 0], [0.12, 0.11], [0.09, 0.09], { color: bonePaint, bone: haft, name: "hub" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.085, 0.085, 0.012), GOLD, { bone: haft, at: [0, 1.995, s * 0.055], rotation: [0, 0, 45], name: "hubPlate" });
    glow(b.part(new THREE.OctahedronGeometry(0.034, 0), TEAL, { bone: haft, at: [0, 1.995, s * 0.07], scale: [0.8, 1.2, 0.6], flat: true, name: "hubGem" }), 1.6);
    b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD_HI, { bone: haft, at: [s * 0.05, 1.995, 0.058] });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD_HI, { bone: haft, at: [s * 0.05, 1.995, -0.058] });
  }
  // back-sweeping bone talon, drawn as a flat crescent
  const talon: OutlinePoint[] = [
    [0, -0.06],
    [0.12, -0.075],
    [0.26, -0.065],
    [0.38, -0.02],
    [0.46, 0.06],
    [0.5, 0.18, "sharp"],
    [0.42, 0.12],
    [0.33, 0.075],
    [0.21, 0.045],
    [0.09, 0.05],
    [0, 0.065],
  ];
  b.extrude(talon, { at: [-0.02, BY, 0], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.036, bevel: 0.008, smoothing: 1, color: bonePaint, bone: haft, name: "talon" });
  glow(
    b.extrude(
      [
        [0.07, -0.012],
        [0.2, -0.026],
        [0.33, -0.01],
        [0.41, 0.045],
        [0.45, 0.12],
        [0.36, 0.06],
        [0.28, 0.02],
        [0.18, 0.0],
        [0.07, 0.012],
      ],
      { at: [-0.02, BY, 0], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.044, bevel: 0.004, smoothing: 1, color: TEAL, bone: haft, name: "talonVein" },
    ),
    1.3,
  );
  for (let k = 0; k < 4; k++) {
    const x = -0.02 - (0.1 + k * 0.09);
    b.spike([x, BY - 0.07 + k * 0.012, 0], [-0.4, -1, 0], 0.05 - k * 0.006, 0.014, { color: IVORY_MID, bone: haft, sides: 5 });
  }

  // ===== The blade ===============================================================================================
  const N = 18;
  const outer: OutlinePoint[] = [];
  const inner: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) {
    const [x, y] = bl(i / N, 1);
    outer.push(i === 0 || i === N ? [x, y, "sharp"] : [x, y]);
  }
  for (let i = N - 1; i >= 0; i--) {
    const [x, y] = bl(i / N, -1);
    inner.push(i === 0 ? [x, y, "sharp"] : [x, y]);
  }
  b.extrude([...outer, ...inner], { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.034, bevel: 0.009, color: bladePaint, bone: haft, name: "blade" });

  // glowing edge
  const edgeIn: OutlinePoint[] = [];
  const edgeOut: OutlinePoint[] = [];
  const M = 20;
  for (let i = 0; i <= M; i++) {
    const u = 0.05 + (0.93 * i) / M;
    const sw = 0.006 + 0.016 * Math.min(1, (u - 0.04) / 0.12, (0.99 - u) / 0.3);
    const [x, y] = bl(u, -1);
    edgeIn.push([x, y]);
    const th = thetaU(u);
    const rr = radAt(u, -1) + sw;
    edgeOut.push([rr * Math.cos(th), CY + rr * Math.sin(th)]);
  }
  glow(
    b.extrude([...edgeIn, ...edgeOut.reverse()], { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.044, bevel: 0.006, color: TEAL, bone: haft, name: "edgeGlow" }),
    1.7,
  );

  // spine ridge of bone
  const ridgePts: number[][] = [];
  for (let i = 0; i <= 18; i++) ridgePts.push(bw(0.0 + (0.95 * i) / 18, 1.04));
  b.sweep(catmull(ridgePts), (t) => 0.03 * (1 - t) + 0.006, { color: bandedBone, bone: haft, sides: 7, caps: "point", name: "ridge" });
  for (let k = 0; k < 9; k++) {
    const u = 0.05 + k * 0.1;
    const th = thetaU(u);
    const N2 = [Math.cos(th), Math.sin(th)];
    const T2 = [Math.sin(th), -Math.cos(th)];
    const dirv: [number, number, number] = [N2[0] * 0.55 + T2[0] * 0.85, N2[1] * 0.55 + T2[1] * 0.85, 0];
    const len = 0.1 * Math.pow(1 - u, 0.6) + 0.03;
    b.spike(bw(u, 1.06), dirv, len, 0.022 * (1 - u) + 0.008, { color: k % 2 ? IVORY : IVORY_MID, bone: haft, sides: 5 });
    b.part(new THREE.SphereGeometry(0.026 * (1 - u * 0.7), 6, 4), IVORY, { bone: haft, at: bw(u, 1.04), flat: true });
  }
  // rune drawings on both faces
  const bw0 = XMAX - XMIN;
  const bh0 = YMAX - YMIN;
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(bw0, bh0), "#ffffff", {
        bone: haft,
        at: [(XMIN + XMAX) / 2, BY + (YMIN + YMAX) / 2, s * 0.0205],
        dir: [0, 0, s],
        axis: "z",
        texture: bladeSvg(s < 0),
        name: s > 0 ? "runesFront" : "runesBack",
      }),
      1.5,
    );
  }
  // rivets along the root
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = bl(0.05 + i * 0.055, 0.88);
    for (const s of [1, -1]) rivets.push(new THREE.SphereGeometry(0.009, 5, 4).translate(x, BY + y, s * 0.018));
  }
  b.part(mergeGeometries(rivets), GOLD_HI, { bone: haft, at: [0, 0, 0], name: "rivets" });

  // ===== Dragon skull =============================================================================================
  const TILT = 12;
  const SO = new THREE.Vector3(0, 1.6, 0.03);
  const sp = (x: number, f: number, d: number): [number, number, number] => {
    const a = TILT * DEG;
    return [SO.x + x, SO.y - Math.sin(a) * f + Math.cos(a) * d, SO.z + Math.cos(a) * f + Math.sin(a) * d];
  };
  const spDir = (x: number, f: number, d: number): [number, number, number] => {
    const a = TILT * DEG;
    return [x, -Math.sin(a) * f + Math.cos(a) * d, Math.cos(a) * f + Math.sin(a) * d];
  };
  const jp = (x: number, f: number, d: number): [number, number, number] => [JO.x + x, JO.y - Math.sin(JA) * f + Math.cos(JA) * d, JO.z + Math.cos(JA) * f + Math.sin(JA) * d];
  const jpDir = (x: number, f: number, d: number): [number, number, number] => [x, -Math.sin(JA) * f + Math.cos(JA) * d, Math.cos(JA) * f + Math.sin(JA) * d];

  b.part(new THREE.SphereGeometry(1, 10, 8), bonePaint, { bone: head, at: sp(0, 0.0, 0.035), scale: [0.125, 0.108, 0.14], rotation: [TILT, 0, 0], flat: true, name: "cranium" });
  b.frustumBox(sp(0, 0.1, -0.005), sp(0, 0.43, -0.025), [0.17, 0.115], [0.09, 0.062], { color: bonePaint, bone: head, name: "snout" });
  b.part(new THREE.BoxGeometry(0.104, 0.05, 0.07), IVORY, { bone: head, at: sp(0, 0.43, -0.015), rotation: [TILT, 0, 0], name: "snoutTip" });
  // nostrils, nasal ridge
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 5, 4), SOCKET, { bone: head, at: sp(s * 0.027, 0.47, 0.0), scale: [0.8, 1, 1.2] });
  b.rod(sp(0, 0.17, 0.065), sp(0, 0.42, 0.037), [0.02, 0.012], { color: IVORY_MID, bone: head, sides: 5, name: "nasalRidge" });
  // brows, sockets, glowing eyes
  for (const s of [1, -1]) {
    b.rod(sp(s * 0.03, 0.15, 0.1), sp(s * 0.125, 0.07, 0.085), [0.026, 0.018], { color: bonePaint, bone: head, sides: 5, name: "brow" });
    b.part(new THREE.SphereGeometry(0.043, 7, 5), SOCKET, { bone: head, at: sp(s * 0.078, 0.095, 0.045), scale: [0.9, 1, 1], name: "socket" });
    glow(b.part(new THREE.SphereGeometry(0.029, 7, 5), TEAL, { bone: head, at: sp(s * 0.078, 0.115, 0.054), name: "eye" }), 1.7);
    b.part(new THREE.SphereGeometry(0.011, 5, 4), SOCKET, { bone: head, at: sp(s * 0.078, 0.14, 0.06), scale: [0.5, 0.4, 1], name: "pupil" });
    // cheek spikes and jaw hinge knobs
    b.spike(sp(s * 0.1, 0.06, -0.035), spDir(s * 0.9, -0.2, -0.45), 0.1, 0.03, { color: IVORY, bone: head, sides: 5 });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), IVORY_MID, { bone: head, at: sp(s * 0.115, 0.04, -0.055), flat: true });
    // forehead ridge spikes
    b.spike(sp(s * 0.055, 0.0, 0.12), spDir(s * 0.2, -0.45, 1), 0.075, 0.017, { color: IVORY_MID, bone: head, sides: 5 });
  }
  for (let k = 0; k < 4; k++) b.spike(sp(0, -0.04 - k * 0.045, 0.1 - k * 0.012), spDir(0, -0.55, 1), 0.065 - k * 0.008, 0.019, { color: IVORY_MID, bone: head, sides: 5 });
  // forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.026, 0), TEAL, { bone: head, at: sp(0, 0.07, 0.13), scale: [0.8, 1.25, 0.7], rotation: [TILT, 0, 0], flat: true, name: "foreheadGem" }), 1.6);
  b.part(new THREE.BoxGeometry(0.052, 0.052, 0.012), GOLD, { bone: head, at: sp(0, 0.07, 0.122), rotation: [TILT, 0, 45], name: "foreheadPlate" });
  // horns
  for (const s of [1, -1]) {
    const hp = bezier([s * 0.085, 1.7, 0.0], [s * 0.2, 1.7, -0.14], [s * 0.3, 1.74, -0.3], [s * 0.3, 1.86, -0.46]);
    b.sweep(hp, (t) => 0.042 * (1 - t) + 0.006, { color: bandedBone, bone: head, sides: 6, caps: "point", name: "horn" });
    for (const t of [0.14, 0.3]) {
      const q = hp.at(t);
      b.part(new THREE.TorusGeometry(0.047 * (1 - t) + 0.008, 0.0075, 4, 8), GOLD, { bone: head, at: q, dir: hp.tangentAt(t), axis: "z", name: "hornRing" });
    }
    // eye flames
    const fl = catmull([
      [s * 0.088, 1.628, 0.116],
      [s * 0.15, 1.7, 0.14],
      [s * 0.2, 1.79, 0.12],
      [s * 0.21, 1.87, 0.07],
    ]);
    glow(b.sweep(fl, [0.012, 0.004], { color: TEAL, bone: head, sides: 4, caps: "point", name: "eyeFlame" }), 1.3);
    // frills
    const out = (v: number[]): OutlinePoint => [v[0], v[1], v[2] === 1 ? "sharp" : undefined] as unknown as OutlinePoint;
    void out;
    b.extrude(
      [
        [0, -0.06],
        [0.1, -0.08],
        [0.17, -0.07],
        [0.27, -0.15, "sharp"],
        [0.21, -0.03],
        [0.32, -0.02, "sharp"],
        [0.23, 0.03],
        [0.3, 0.12, "sharp"],
        [0.15, 0.08],
        [0.09, 0.14, "sharp"],
        [0, 0.09],
      ],
      { at: [s * 0.075, 1.6, 0.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: frillPaint, bone: head, name: "frill" },
    );
    b.rod([s * 0.08, 1.6, 0.0], [s * 0.3, 1.635, 0.0], [0.012, 0.005], { color: IVORY_MID, bone: head, sides: 5, name: "frillBone" });
  }
  // upper teeth
  for (const s of [1, -1]) {
    for (let k = 0; k < 6; k++) {
      const f = 0.14 + k * 0.058;
      const half = (0.085 - ((f - 0.1) / 0.33) * 0.04) - 0.006;
      const fang = k === 2;
      b.spike(sp(s * half, f, -0.062 + 0.01 * (f - 0.1) / 0.33), spDir(0, 0, -1), fang ? 0.075 : 0.036, fang ? 0.016 : 0.01, { color: TOOTH, bone: head, sides: 5, name: "toothUp" });
    }
  }
  b.rod(sp(0, 0.12, -0.056), sp(0, 0.41, -0.064), 0.01, { color: IVORY_DK, bone: head, sides: 4, name: "gumUp" });
  // lower jaw
  b.frustumBox(jp(0, -0.015, 0), jp(0, 0.37, 0), [0.15, 0.058], [0.075, 0.04], { color: bonePaint, bone: jaw, name: "jawBox" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.07, 0.06), IVORY_MID, { bone: jaw, at: jp(s * 0.07, -0.01, 0.025), rotation: [JA / DEG, 0, 0], name: "ramus" });
    for (let k = 0; k < 5; k++) {
      const f = 0.1 + k * 0.058;
      const half = (0.07 - ((f - 0.05) / 0.32) * 0.035) - 0.005;
      const fang = k === 4;
      b.spike(jp(s * half, f, 0.018), jpDir(0, 0, 1), fang ? 0.07 : 0.032, fang ? 0.014 : 0.009, { color: TOOTH, bone: jaw, sides: 5, name: "toothLow" });
    }
  }
  b.part(new THREE.BoxGeometry(0.075, 0.05, 0.034), IVORY, { bone: jaw, at: jp(0, 0.38, 0.0), rotation: [JA / DEG, 0, 0], name: "chin" });
  // tongue-flame glow inside the mouth
  glow(b.rod(jp(0, 0.05, 0.026), jp(0, 0.27, 0.026), [0.026, 0.01], { color: TEAL_DK, bone: jaw, sides: 4, name: "throatGlow" }), 1.1);
  glow(b.rod(jp(0, 0.2, 0.034), jp(0, 0.34, 0.032), [0.012, 0.005], { color: TEAL, bone: jaw, sides: 4, name: "tongueGlow" }), 1.3);

  // ===== Charm =====================================================================================================
  b.part(new THREE.TorusGeometry(0.044, 0.007, 4, 10), GOLD, { bone: haft, at: [0, 1.128, 0], rotation: [90, 0, 0], name: "charmRing" });
  b.part(new THREE.SphereGeometry(0.011, 5, 4), GOLD_HI, { bone: haft, at: [0, 1.125, 0.047] });
  b.sweep(charm, 0.007, { color: GOLD, sides: 5, name: "charmCord" });
  b.part(new THREE.CylinderGeometry(0.02, 0.012, 0.03, 6), GOLD, { bone: charm.tip ?? charm.joints[3], at: [0, 0.8, 0.08], flat: true, name: "charmCap" });
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), TEAL, { bone: charm.tip ?? charm.joints[3], at: [0, 0.765, 0.08], scale: [0.8, 1.4, 0.8], flat: true, name: "charmCrystal" }), 1.5);
  b.cards(
    [-0.022, 0, 0.022].map((x, i) => frame([x, 0.745 - (i % 2) * 0.004, 0.08], [0, 1, 0], [0, 0, 1])),
    tassel,
    { size: [0.04, 0.12], lean: 180, flow: [0, 0, 1], bone: charm.tip ?? charm.joints[3], name: "tassels" },
  );

  // ===== Claws gripping the haft base ===============================================================================
  for (let i = 0; i < 3; i++) {
    const a = (60 + i * 120) * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const path = bezier([dx * 0.2, 0.14, dz * 0.2], [dx * 0.22, 0.28, dz * 0.22], [dx * 0.14, 0.44, dz * 0.14], [dx * 0.06, 0.5, dz * 0.06]);
    b.sweep(path, (t) => 0.036 * (1 - t) + 0.006, { color: bandedBone, bone: root, sides: 6, caps: "point", name: "claw" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), IVORY_MID, { bone: root, at: [dx * 0.2, 0.15, dz * 0.2], scale: [1, 0.7, 1], flat: true });
  }

  // ===== Captured soul in the blade's curve =========================================================================
  const OP: [number, number, number] = [0.53, 1.55, 0.0];
  glow(b.part(new THREE.SphereGeometry(0.085, 10, 8), MINT, { bone: haft, at: OP, name: "soulOrb" }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), TEAL_DK, { bone: haft, at: OP, scale: [1.0, 1.0, 1.0], name: "soulHalo" }), 0.8);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 5, 4), SOCKET, { bone: haft, at: [OP[0] + s * 0.03, OP[1] + 0.012, 0.08], scale: [0.7, 1.2, 0.6], name: "soulEye" });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), SOCKET, { bone: haft, at: [OP[0], OP[1] - 0.025, 0.083], scale: [1.2, 0.8, 0.5], name: "soulMouth" });
  b.part(new THREE.TorusGeometry(0.135, 0.008, 4, 16), GOLD, { bone: haft, at: OP, rotation: [72, 0, 18], name: "soulRing1" });
  b.part(new THREE.TorusGeometry(0.125, 0.007, 4, 16), GOLD_DK, { bone: haft, at: OP, rotation: [24, 0, -62], name: "soulRing2" });
  const tether = catmull([
    [0.53, 1.625, 0.0],
    [0.5, 1.7, 0.02],
    [0.47, 1.76, -0.02],
    bw(0.54, -0.98),
  ]);
  glow(b.sweep(tether, [0.008, 0.003], { color: TEAL, bone: haft, sides: 4, caps: "point", name: "tether" }), 1.3);

  // floating shards around the blade tip
  const tipShards: Array<[number, number, number, number]> = [
    [0.84, 1.62, 0.06, 0.03],
    [0.62, 1.36, -0.05, 0.024],
    [0.9, 1.45, -0.03, 0.02],
    [0.38, 1.35, 0.06, 0.02],
  ];
  for (const [x, y, z, r] of tipShards)
    glow(b.part(new THREE.OctahedronGeometry(r, 0), k4(x), { bone: haft, at: [x, y, z], scale: [0.7, 1.6, 0.7], rotation: [x * 40, x * 90, 20], flat: true, name: "bladeShard" }), 1.3);

  // ===== Rising soul wisps =========================================================================================
  for (let i = 0; i < 5; i++) {
    const a0 = (i * 72 + 25) * DEG;
    const yh = 0.5 + i * 0.22;
    const R = 0.3;
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const q = k / 6;
      const ph = a0 - (6 - k) * 0.2;
      pts.push([Math.sin(ph) * R, 0.15 + (yh - 0.15) * Math.pow(q, 1.15), Math.cos(ph) * R]);
    }
    const head3 = pts[6];
    glow(b.sweep(catmull(pts), [0.003, 0.012, 0.03], { color: TEAL, bone: root, sides: 5, caps: "round", name: "wispTail" }), 1.2);
    const sz = 0.05 - i * 0.003;
    glow(b.part(new THREE.SphereGeometry(sz, 8, 6), MINT, { bone: root, at: head3, name: "wisp" }), 1.5);
    const ox = Math.sin(a0);
    const oz = Math.cos(a0);
    const sx = oz;
    const sz2 = -ox;
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009, 5, 4), SOCKET, { bone: root, at: [head3[0] + ox * sz * 0.9 + sx * s * 0.017, head3[1] + 0.01, head3[2] + oz * sz * 0.9 + sz2 * s * 0.017], scale: [0.8, 1.2, 0.8], name: "wispEye" });
  }

  return b.root;
}

function k4(x: number) {
  return x > 0.7 ? TEAL : MINT;
}
