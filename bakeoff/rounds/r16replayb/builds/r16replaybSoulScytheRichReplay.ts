import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { frame } from "../../../../src/frame";
import { aim, rng, vec } from "../../../../src/math";
import { bezier, polyline } from "../../../../src/path";
import { cells, mix, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone war scythe on an obsidian rune dais: a vertebra shaft with a soul-cage of ribs, a roaring dragon skull crown and a sweeping wing-membrane blade of violet-to-teal soulsteel with a glowing edge.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: bone ivory, obsidian violet, one strong soul-teal accent, gold trim, crimson cloth.
const IVORY = "#f1e7cc";
const IVORY_M = "#d6c59c";
const IVORY_D = "#a8956b";
const BONE_SH = "#6f5d44";
const OBS = "#1c1526";
const OBS2 = "#2d2144";
const OBS3 = "#47346e";
const TEAL = "#38f2d4";
const TEAL_L = "#c4fff4";
const TEAL_D = "#1d8f95";
const GOLD = "#e8b23a";
const GOLD_D = "#9a6a1c";
const GOLD_L = "#ffe08a";
const CRIM = "#a3234a";
const CRIM_D = "#5c1230";
const VIOLET = "#6b3fd4";

const SX = -0.1; // shaft x
const TOP = 0.16; // dais top
const K = [SX, 2.04, 0.08]; // skull centre
const BO = [SX, 1.88, 0]; // blade root

const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "soulScythe", paintSize: 2048 });
  const root = b.joint("root", { at: [SX, TOP, 0], dir: [0, 1, 0] });
  const skull = b.joint("skull", { parent: root, at: K, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: skull,
    at: [SX, K[1] - 0.058, K[2] + 0.04],
    aim: [SX, K[1] - 0.105, K[2] + 0.29],
    role: "jaw",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Merge bag: small static pieces of one colour on one bone become one part.
  type Bag = { color: string; bone: Joint; glow: number; geos: THREE.BufferGeometry[] };
  const bags = new Map<string, Bag>();
  const add = (color: string, bone: Joint, g: THREE.BufferGeometry, gl = 0) => {
    const key = `${color}|${bone.name}|${gl}`;
    let bag = bags.get(key);
    if (!bag) bags.set(key, (bag = { color, bone, glow: gl, geos: [] }));
    bag.geos.push(g.index ? g.toNonIndexed() : g);
  };
  const xf = (g: THREE.BufferGeometry, pos: readonly number[], q?: THREE.Quaternion, s?: number | number[]) => {
    const sc = typeof s === "number" ? vec([s, s, s]) : s ? vec(s) : vec([1, 1, 1]);
    const m = new THREE.Matrix4().compose(vec(pos), q ?? new THREE.Quaternion(), sc);
    return g.clone().applyMatrix4(m);
  };
  const cone = (color: string, bone: Joint, base: readonly number[], dir: readonly number[], len: number, r: number, seg = 5, gl = 0) =>
    add(color, bone, xf(new THREE.ConeGeometry(r, len, seg).translate(0, len / 2, 0), base, aim(dir)), gl);
  const cyl = (color: string, bone: Joint, a: readonly number[], c: readonly number[], r0: number, r1: number, seg = 6) => {
    const d = vec(c).sub(vec(a));
    const len = d.length();
    add(color, bone, xf(new THREE.CylinderGeometry(r1, r0, len, seg).translate(0, len / 2, 0), a, aim(d)));
  };
  const ball = (color: string, bone: Joint, pos: readonly number[], r: number, seg = 6, s?: number[], gl = 0, q?: THREE.Quaternion) =>
    add(color, bone, xf(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), pos, q, s), gl);
  const gem = (color: string, bone: Joint, pos: readonly number[], r: number, s?: number[], gl = 0) =>
    add(color, bone, xf(new THREE.OctahedronGeometry(r, 0), pos, undefined, s), gl);
  const torus = (color: string, bone: Joint, pos: readonly number[], axis: readonly number[], R: number, tube: number, gl = 0) =>
    add(color, bone, xf(new THREE.TorusGeometry(R, tube, 5, 14), pos, aim(axis, undefined, "z")), gl);

  // -------------------------------------------------------------------------------------------------------------
  // Paints and drawings
  const obsidian = paint((p, n) => {
    const c = cells(p, 0.24, 4);
    if (c.d2 - c.d1 < 0.045) return TEAL_D;
    const t = noise(p, 0.3, 1);
    return mix(t > 0.5 ? OBS2 : OBS, n.y > 0.5 ? OBS3 : OBS2, 0.35 + 0.4 * t);
  });
  const bonePaint = mottle(IVORY, IVORY_M, { size: 0.07, seed: 3, contrast: 1.3 });
  const SHAFT_LEN = 1.78;
  const wrap = paint((_p, _n, s) => {
    const phase = (s[0] * SHAFT_LEN) / 0.042 - s[1] / 360;
    const f = phase - Math.floor(phase);
    if (f < 0.1) return CRIM_D;
    if (f > 0.5 && f < 0.56) return GOLD_D;
    return f < 0.5 ? CRIM : "#c43a63";
  });

  const runeDisc = (() => {
    let g = "";
    for (let i = 0; i < 24; i++) {
      g += `<g transform="rotate(${i * 15} 100 100)"><path d="M100 13 v12 M95 16 l10 7 M95 25 l10 -7" stroke="#c4fff4" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
    }
    let tri = "";
    for (let i = 0; i < 2; i++)
      tri += `<polygon points="100,34 156,131 44,131" transform="rotate(${i * 60} 100 100)" fill="none" stroke="#38f2d4" stroke-width="1.6" stroke-linejoin="round"/>`;
    let dots = "";
    for (let i = 0; i < 12; i++) dots += `<circle cx="100" cy="${100 - 58}" r="3" fill="#c4fff4" transform="rotate(${i * 30} 100 100)"/>`;
    return svg(
      `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="none" stroke="#38f2d4" stroke-width="2.4"/><circle cx="100" cy="100" r="90" fill="none" stroke="#c4fff4" stroke-width="1.2"/>${g}<circle cx="100" cy="100" r="70" fill="none" stroke="#38f2d4" stroke-width="2"/><circle cx="100" cy="100" r="64" fill="none" stroke="#1d8f95" stroke-width="1.2"/>${tri}${dots}<circle cx="100" cy="100" r="30" fill="none" stroke="#38f2d4" stroke-width="2"/></svg>`,
      { size: 1024 },
    );
  })();

  const glyphPaths = [
    "M20 7 V33 M20 13 L30 21 M20 22 L11 29",
    "M11 8 H29 L11 32 H29",
    "M20 6 L9 20 L20 34 L31 20 Z M20 13 V27",
    "M12 7 V33 M12 20 L28 9 M12 20 L28 31",
  ];
  const glyphTex = glyphPaths.map((d) =>
    svg(
      `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.2" fill="none" stroke="#38f2d4" stroke-width="1.5"/><path d="${d}" stroke="#c4fff4" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      { size: 192 },
    ),
  );
  const sigil = svg(
    `<svg viewBox="0 0 60 60"><path d="M3 30 Q30 5 57 30 Q30 55 3 30 Z" fill="none" stroke="#38f2d4" stroke-width="2.2" stroke-linejoin="round"/><circle cx="30" cy="30" r="9" fill="#38f2d4"/><ellipse cx="30" cy="30" rx="2.6" ry="7.5" fill="#0b2a33"/><path d="M30 4 V12 M30 48 V56 M12 12 L16 17 M48 12 L44 17 M12 48 L16 43 M48 48 L44 43" stroke="#c4fff4" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const ghost = svg(
    `<svg viewBox="0 0 40 64"><path d="M20 3 C9 3 6 16 6 29 C6 41 3 50 8 61 C12 55 15 61 20 62 C25 61 28 55 32 61 C37 50 34 41 34 29 C34 16 31 3 20 3 Z" fill="#8ff7e8" stroke="#c4fff4" stroke-width="2"/><path d="M20 8 C13 8 11 18 11 28 C11 34 12 38 14 42" fill="none" stroke="#e8fffb" stroke-width="2" stroke-linecap="round"/><ellipse cx="14" cy="26" rx="3.4" ry="5" fill="#0b2a33"/><ellipse cx="26" cy="26" rx="3.4" ry="5" fill="#0b2a33"/><ellipse cx="20" cy="38" rx="3" ry="4.2" fill="#0b2a33"/></svg>`,
    { size: 192 },
  );
  const flame = svg(
    `<svg viewBox="0 0 32 56"><path d="M16 1 C20 12 30 20 28 36 C27 48 21 55 16 55 C10 55 4 48 4 36 C3 26 10 22 11 12 C13 15 14 17 15 19 C15 13 15 7 16 1 Z" fill="#38f2d4" stroke="#c4fff4" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 22 C19 30 24 34 22 42 C21 48 18 51 16 51 C13 51 10 48 10 42 C9 36 14 32 16 22 Z" fill="#c4fff4"/><path d="M16 34 C18 38 19 42 16 47 C13 42 14 38 16 34 Z" fill="#ffffff"/></svg>`,
    { size: 160 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Dais: three obsidian tiers, gold trim, glowing rune disc, fang posts with soul flames
  const hexOutline = (r: number): OutlinePoint[] =>
    Array.from({ length: 6 }, (_, i) => [r * Math.cos(((30 + 60 * i) * Math.PI) / 180), r * Math.sin(((30 + 60 * i) * Math.PI) / 180)] as OutlinePoint);
  const hexPt = (r: number, deg: number, y: number) => P(SX + r * Math.cos((deg * Math.PI) / 180), y, -r * Math.sin((deg * Math.PI) / 180));
  const tiers: [number, number, number][] = [
    [0.8, 0.02, 0.04],
    [0.7, 0.07, 0.06],
    [0.56, 0.13, 0.06],
  ];
  for (const [r, yc, th] of tiers)
    b.extrude(hexOutline(r), { at: [SX, yc, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: th, bevel: 0.012, color: obsidian, bone: root, name: "dais" });
  for (const [r, y] of [
    [0.74, 0.04],
    [0.64, 0.1],
    [0.5, 0.16],
  ]) {
    const pts = Array.from({ length: 6 }, (_, i) => hexPt(r, 30 + 60 * i, y));
    b.sweep(polyline(pts, { closed: true }), 0.007, { color: GOLD, sides: 4, bone: root, name: "trim" });
  }
  glow(
    b.part(new THREE.CircleGeometry(0.49, 32), "#ffffff", { bone: root, at: [SX, TOP + 0.0035, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: runeDisc, name: "runeDisc" }),
    1.1,
  );
  for (let i = 0; i < 6; i++) {
    const a = 60 * i;
    // glowing diamond inlay on each tier-1 face, gold studs either side
    const c = hexPt(0.7 * Math.cos(Math.PI / 6) + 0.004, a, 0.07);
    gem(TEAL, root, [c.x, c.y, c.z], 0.032, [1, 1.7, 0.25].map((v, k) => (k === 0 ? 1 : v)), 1.3);
    for (const d of [-14, 14]) {
      const e = hexPt(0.7 * Math.cos(Math.PI / 6) + 0.003, a + d, 0.07);
      ball(GOLD, root, [e.x, e.y, e.z], 0.011, 5);
    }
    // fang post on every corner
    const ca = 30 + 60 * i;
    const base = hexPt(0.63, ca, 0.1);
    const out = hexPt(1, ca, 0).sub(P(SX, 0, 0)).normalize();
    cone(IVORY, root, [base.x, base.y - 0.01, base.z], [out.x * 0.25, 1, out.z * 0.25], 0.26, 0.05, 6);
    torus(GOLD, root, [base.x + out.x * 0.01, base.y + 0.05, base.z + out.z * 0.01], [out.x * 0.25, 1, out.z * 0.25], 0.042, 0.008);
    torus(GOLD_D, root, [base.x + out.x * 0.03, base.y + 0.12, base.z + out.z * 0.03], [out.x * 0.25, 1, out.z * 0.25], 0.03, 0.007);
    glow(
      b.cards([frame(P(base.x + out.x * 0.065, base.y + 0.255, base.z + out.z * 0.065), [0, 1, 0])], flame, {
        size: [0.1, 0.19],
        flow: [0, 0, 1],
        cross: true,
        bone: root,
      }),
      1.2,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Shaft: dark core, vertebrae, leather grip, gold clasps, base talons
  b.sweep(polyline([[SX, 0.12, 0], [SX, 1.9, 0]]), 0.021, { color: OBS2, sides: 8, bone: root, name: "core" });
  const vertebra = (y: number, s: number) => {
    for (const dy of [-0.022, 0.022]) add(IVORY, root, xf(new THREE.CylinderGeometry(0.037 * s, 0.037 * s, 0.014, 8), [SX, y + dy, 0]));
    add(IVORY_D, root, xf(new THREE.CylinderGeometry(0.027 * s, 0.027 * s, 0.04, 8), [SX, y, 0]));
    cone(IVORY, root, [SX, y + 0.012, -0.022 * s], [0, 0.55, -1], 0.08 * s, 0.015 * s, 5);
    for (const sx of [1, -1]) cone(IVORY_M, root, [SX + sx * 0.022 * s, y, 0], [sx, 0.35, 0], 0.065 * s, 0.01 * s, 5);
  };
  for (let i = 0; i < 6; i++) vertebra(0.5 + 0.075 * i, 1.15 - 0.02 * i);
  for (let i = 0; i < 7; i++) vertebra(1.13 + 0.077 * i, 1.0 - 0.02 * i);
  // leather grip
  b.sweep(polyline([[SX, 0.82, 0], [SX, 1.08, 0]]), 0.034, { color: wrap, sides: 8, bone: root, name: "grip", caps: "flat" });
  for (const y of [0.8, 0.84, 1.06, 1.1]) torus(GOLD, root, [SX, y, 0], [0, 1, 0], 0.036, 0.0075);
  for (const y of [0.78, 1.1]) {
    b.lathe(
      [
        [0.03, 0],
        [0.05, 0.012],
        [0.05, 0.03],
        [0.03, 0.04],
      ],
      { at: [SX, y - 0.01, 0], axis: [0, 1, 0], segments: 8, color: GOLD, bone: root, name: "clasp" },
    );
  }
  // ribbons hanging off the upper clasp
  const ribbon: OutlinePoint[] = [
    [-0.035, 0],
    [0.035, 0],
    [0.035, -0.4],
    [0.0, -0.32],
    [-0.035, -0.42],
  ];
  const ribPaint = paint((_p, _n, s) => (Math.abs(s[0]) > 0.026 ? GOLD : Math.abs(s[1]) % 0.1 < 0.008 ? GOLD_D : CRIM));
  b.extrude(ribbon, { at: [SX + 0.05, 1.075, 0.045], x: [0.96, 0, 0.28], y: [0, 1, 0], thickness: 0.006, bevel: 0.002, color: ribPaint, bone: root, name: "ribbon" });
  b.extrude(ribbon.map(([x, y]) => [x * 0.9, y * 0.8] as OutlinePoint), { at: [SX - 0.05, 1.075, 0.04], x: [0.96, 0, -0.28], y: [0, 1, 0], thickness: 0.006, bevel: 0.002, color: ribPaint, bone: root, name: "ribbon" });

  // base talons gripping the shaft
  for (let i = 0; i < 4; i++) {
    const a = ((45 + 90 * i) * Math.PI) / 180;
    const pp = (r: number, y: number) => P(SX + r * Math.sin(a), y, r * Math.cos(a));
    b.sweep(bezier(pp(0.27, 0.15), pp(0.3, 0.42), pp(0.12, 0.43), pp(0.04, 0.58)), [0.036, 0.006], { color: IVORY, bone: root, sides: 6, caps: "point", name: "talon" });
    ball(GOLD, root, [pp(0.27, 0.17).x, 0.17, pp(0.27, 0.17).z], 0.05, 6, [1, 0.8, 1]);
    cone(IVORY_D, root, [pp(0.29, 0.3).x, 0.3, pp(0.29, 0.3).z], [Math.sin(a), 0.4, Math.cos(a)], 0.07, 0.016, 5);
  }
  torus(GOLD, root, [SX, 0.45, 0], [0, 1, 0], 0.036, 0.009);
  torus(GOLD_D, root, [SX, 0.2, 0], [0, 1, 0], 0.05, 0.012);

  // soul cage: six ribs around a glowing soul gem
  for (let i = 0; i < 6; i++) {
    const a = ((30 + 60 * i) * Math.PI) / 180;
    const pp = (r: number, y: number) => P(SX + r * Math.sin(a), y, r * Math.cos(a));
    b.sweep(bezier(pp(0.04, 1.7), pp(0.22, 1.64), pp(0.22, 1.18), pp(0.04, 1.1)), [0.012, 0.018, 0.012], { color: IVORY, bone: root, sides: 6, name: "cageRib" });
    ball(GOLD, root, [pp(0.04, 1.7).x, 1.7, pp(0.04, 1.7).z], 0.024, 6);
    ball(GOLD, root, [pp(0.04, 1.1).x, 1.1, pp(0.04, 1.1).z], 0.024, 6);
    cone(IVORY_D, root, [pp(0.17, 1.4).x, 1.4, pp(0.17, 1.4).z], [Math.sin(a), 0.1, Math.cos(a)], 0.06, 0.016, 5);
  }
  add(TEAL, root, xf(new THREE.IcosahedronGeometry(0.078, 1), [SX, 1.4, 0]), 1.3);
  add(TEAL_L, root, xf(new THREE.OctahedronGeometry(0.05, 0), [SX, 1.4, 0], aim([0.3, 1, 0.2])), 1.8);
  torus(GOLD, root, [SX, 1.4, 0], [0.4, 1, 0.1], 0.118, 0.0065);
  torus(GOLD_D, root, [SX, 1.4, 0], [-0.4, 1, -0.3], 0.135, 0.0065);
  for (const [dx, dy, dz] of [
    [0.115, 0.03, 0.02],
    [-0.1, -0.06, 0.06],
    [0.0, 0.1, -0.12],
    [-0.04, -0.12, -0.11],
  ])
    gem(TEAL_L, root, [SX + dx, 1.4 + dy, dz], 0.014, undefined, 1.8);

  // collar and neck into the skull
  for (const [y, rr] of [
    [1.74, 0.05],
    [1.8, 0.04],
  ])
    torus(GOLD, root, [SX, y, 0], [0, 1, 0], rr, 0.012);
  b.lathe(
    [
      [0.03, 0],
      [0.058, 0.02],
      [0.052, 0.06],
      [0.03, 0.08],
    ],
    { at: [SX, 1.74, 0], axis: [0, 1, 0], segments: 8, color: GOLD_D, bone: root, name: "collar" },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    cone(IVORY, root, [SX + 0.05 * Math.sin(a), 1.76, 0.05 * Math.cos(a)], [Math.sin(a) * 0.6, -1, Math.cos(a) * 0.6], 0.075, 0.014, 4);
  }
  vertebra(1.87, 0.8);
  vertebra(1.935, 0.7);

  // -------------------------------------------------------------------------------------------------------------
  // Skull
  const kk = (dx: number, dy: number, dz: number) => [K[0] + dx, K[1] + dy, K[2] + dz];
  b.part(new THREE.SphereGeometry(0.075, 10, 7), bonePaint, { bone: skull, at: K, scale: [1, 0.88, 1.28], name: "cranium" });
  b.loft(
    [
      { at: kk(0, -0.005, 0.06), w: 0.13, h: 0.105 },
      { at: kk(0, -0.018, 0.19), w: 0.09, h: 0.07 },
      { at: kk(0, -0.03, 0.3), w: 0.07, h: 0.052 },
    ],
    { color: bonePaint, bone: skull, name: "snout" },
  );
  b.loft(
    [
      { at: kk(0, -0.06, 0.06), w: 0.11, h: 0.03 },
      { at: kk(0, -0.085, 0.17), w: 0.08, h: 0.026 },
      { at: kk(0, -0.105, 0.29), w: 0.05, h: 0.022 },
    ],
    { color: IVORY_M, bone: jaw, name: "jawBone" },
  );
  ball(OBS, skull, kk(0, -0.028, 0.325), 0.03, 6, [1, 0.7, 0.8]);
  for (const s of [1, -1]) {
    ball(OBS, skull, kk(s * 0.014, -0.012, 0.345), 0.01, 5);
    ball(OBS, skull, kk(s * 0.064, 0.01, 0.115), 0.029, 6, [0.55, 0.95, 1.15]);
    ball(TEAL, skull, kk(s * 0.07, 0.01, 0.12), 0.017, 5, [0.5, 0.75, 1.3], 1.8, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, s * 0.45)));
    cyl(IVORY_D, skull, kk(s * 0.04, 0.045, 0.17), kk(s * 0.075, 0.037, 0.07), 0.016, 0.012, 5);
    cone(IVORY, skull, kk(s * 0.05, 0.045, 0.12), [s * 0.4, 0.5, -0.7], 0.085, 0.02, 5);
    cone(IVORY_M, skull, kk(s * 0.06, -0.045, 0.06), [s * 0.8, -0.2, -0.6], 0.09, 0.022, 5);
    cone(IVORY_M, skull, kk(s * 0.055, -0.01, 0.0), [s * 0.9, 0.0, -0.5], 0.075, 0.016, 5);
    // upper teeth
    [0.12, 0.165, 0.21, 0.255, 0.305].forEach((z, i) => {
      const t = (z - 0.06) / 0.24;
      const w = t < 0.5 ? 0.13 - 0.08 * t : 0.09 - 0.04 * (t - 0.5) * 2;
      const h = t < 0.5 ? 0.105 - 0.07 * t : 0.07 - 0.036 * (t - 0.5) * 2;
      const y = (t < 0.5 ? -0.005 - 0.026 * t : -0.018 - 0.024 * (t - 0.5) * 2) - h / 2 + 0.006;
      cone(GOLD_L, skull, kk(s * w * 0.4, y, z), [0, -1, 0.2], i % 2 ? 0.032 : 0.044, 0.008, 4);
    });
    [0.15, 0.2, 0.25].forEach((z, i) => {
      const t = (z - 0.06) / 0.23;
      const y = -0.06 - 0.045 * t + 0.014;
      cone(IVORY, jaw, kk(s * (0.04 - 0.02 * t), y, z), [0, 1, 0.1], i === 2 ? 0.04 : 0.03, 0.007, 4);
    });
    // horns, big and small
    b.sweep(bezier(P(K[0] + s * 0.05, K[1] + 0.045, K[2]), P(K[0] + s * 0.17, K[1] + 0.06, K[2] - 0.08), P(K[0] + s * 0.23, K[1] + 0.15, K[2] - 0.2), P(K[0] + s * 0.17, K[1] + 0.3, K[2] - 0.27)), [0.032, 0.003], {
      bone: skull,
      sides: 6,
      caps: "point",
      bands: [
        [0.6, IVORY],
        [1, IVORY_M],
      ],
      name: "horn",
    });
    b.sweep(bezier(P(K[0] + s * 0.06, K[1] + 0.01, K[2]), P(K[0] + s * 0.15, K[1], K[2] - 0.05), P(K[0] + s * 0.2, K[1] - 0.04, K[2] - 0.1), P(K[0] + s * 0.22, K[1] - 0.1, K[2] - 0.2)), [0.022, 0.003], {
      bone: skull,
      sides: 5,
      caps: "point",
      color: IVORY_M,
      name: "hornLow",
    });
  }
  // horn rings (gold) on the big horns
  for (const s of [1, -1]) {
    const hp = bezier(P(K[0] + s * 0.05, K[1] + 0.045, K[2]), P(K[0] + s * 0.17, K[1] + 0.06, K[2] - 0.08), P(K[0] + s * 0.23, K[1] + 0.15, K[2] - 0.2), P(K[0] + s * 0.17, K[1] + 0.3, K[2] - 0.27));
    for (const t of [0.22, 0.38]) {
      const pt = hp.at(t);
      torus(GOLD, skull, [pt.x, pt.y, pt.z], hp.tangentAt(t), 0.032 - 0.029 * t + 0.003, 0.0065);
    }
  }
  // crest spikes down the back of the skull, forehead gem, soul flame in the mouth
  for (let i = 0; i < 3; i++) cone(IVORY_M, skull, kk(0, 0.055 - i * 0.012, 0.0 - i * 0.03), [0, 0.7, -1], 0.09 - i * 0.02, 0.02 - i * 0.003, 5);
  gem(TEAL, skull, kk(0, 0.07, 0.1), 0.017, [0.8, 1.5, 0.6], 1.8);
  torus(GOLD, skull, kk(0, 0.07, 0.1), [0, 0.2, 1], 0.028, 0.005);
  add(TEAL, skull, xf(new THREE.IcosahedronGeometry(0.026, 0), kk(0, -0.07, 0.2)), 1.5);
  glow(b.cards([frame(P(K[0], K[1] - 0.072, K[2] + 0.2), [0, 1, 0])], flame, { size: [0.08, 0.15], flow: [0, 0, 1], cross: true, bone: skull }), 1.2);

  // -------------------------------------------------------------------------------------------------------------
  // Blade: soulsteel wing-membrane on a bone spine, finger ribs, scalloped glowing edge
  const bpts = [[0.02, 0.0], [0.45, 0.3], [1.0, 0.26], [1.2, -0.5]];
  const C = (t: number): [number, number] => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * bpts[0][k] + 3 * u * u * t * bpts[1][k] + 3 * u * t * t * bpts[2][k] + t * t * t * bpts[3][k]) as [number, number];
  };
  const Tn = (t: number): [number, number] => {
    const u = 1 - t;
    const d = [0, 1].map((k) => 3 * u * u * (bpts[1][k] - bpts[0][k]) + 6 * u * t * (bpts[2][k] - bpts[1][k]) + 3 * t * t * (bpts[3][k] - bpts[2][k]));
    const l = Math.hypot(d[0], d[1]);
    return [d[0] / l, d[1] / l];
  };
  const knots = [0.1, 0.34, 0.52, 0.68, 0.82, 1];
  const sf = (t: number) => {
    for (let i = 0; i < knots.length - 1; i++)
      if (t >= knots[i] && t <= knots[i + 1]) {
        const u = (t - knots[i]) / (knots[i + 1] - knots[i]);
        return 1 - 0.17 * Math.sin(Math.PI * Math.pow(u, 0.7));
      }
    return 1;
  };
  const wd = (t: number) => 0.3 * Math.pow(1 - t, 0.8) * (1 + 0.2 * Math.sin(Math.PI * t));
  const ts = Array.from(new Set([...Array.from({ length: 61 }, (_, i) => i / 60), ...knots])).sort((p, q) => p - q);
  const Nlow = (t: number): [number, number] => {
    const [tx, ty] = Tn(t);
    return [ty, -tx];
  };
  const spineL = ts.map(C);
  const nrmL = ts.map(Nlow);
  const wEdge = ts.map((t) => wd(t) * sf(t));
  const edgeL = ts.map((_, i) => [spineL[i][0] + nrmL[i][0] * wEdge[i], spineL[i][1] + nrmL[i][1] * wEdge[i]] as [number, number]);
  const outline: OutlinePoint[] = [
    ...spineL.map((p, i) => (i === 0 || i === ts.length - 1 ? ([p[0], p[1], "sharp"] as OutlinePoint) : ([p[0], p[1]] as OutlinePoint))),
    ...edgeL
      .slice(0, ts.length - 1)
      .reverse()
      .map((p, i, arr) => (i === arr.length - 1 || knots.includes(ts[arr.length - 1 - i]) ? ([p[0], p[1], "sharp"] as OutlinePoint) : ([p[0], p[1]] as OutlinePoint))),
  ];
  const bladePaint = paint((p) => {
    const x = p.x - BO[0];
    const y = p.y - BO[1];
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < spineL.length; i++) {
      const d = (x - spineL[i][0]) ** 2 + (y - spineL[i][1]) ** 2;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    }
    const d = (x - spineL[bi][0]) * nrmL[bi][0] + (y - spineL[bi][1]) * nrmL[bi][1];
    let f = d / Math.max(wEdge[bi], 0.02);
    f += 0.09 * (noise(p, 0.16, 7) - 0.5);
    const stops: [number, string][] = [
      [0, "#2a1658"],
      [0.25, "#43238f"],
      [0.5, "#6b3fd4"],
      [0.68, "#9a6cf0"],
      [0.76, "#35cfc8"],
      [0.9, "#8ff7e8"],
      [1, "#e8fffb"],
    ];
    if (f <= 0) return stops[0][1];
    for (let i = 1; i < stops.length; i++)
      if (f <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (f - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    return stops[stops.length - 1][1];
  });
  b.extrude(outline, { at: BO, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.006, color: bladePaint, bone: root, name: "blade" });
  const W = (xy: readonly number[], z = 0) => P(BO[0] + xy[0], BO[1] + xy[1], z);
  b.sweep(bezier(W(bpts[0]), W(bpts[1]), W(bpts[2]), W(bpts[3])), [0.036, 0.006], {
    bone: root,
    sides: 6,
    caps: "point",
    color: paint((_p, _n, s) => (Math.floor(s[0] * 26) % 2 ? IVORY : IVORY_M)),
    name: "spine",
  });
  glow(b.sweep(polyline(edgeL.map((p) => W(p))), (t) => 0.0085 * (1 - t) + 0.0035, { bone: root, sides: 4, color: TEAL_L, name: "edgeGlow" }), 1.4);
  // spine ridge spikes
  [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].forEach((t, i) => {
    const c = C(t);
    const n = Nlow(t);
    const tg = Tn(t);
    const out = [-n[0] + tg[0] * 0.7, -n[1] + tg[1] * 0.7, 0];
    cone(IVORY, root, [BO[0] + c[0] - n[0] * 0.02, BO[1] + c[1] - n[1] * 0.02, 0], out, 0.11 - i * 0.01, 0.028 - i * 0.002, 5);
  });
  // finger ribs: spine to each scallop tip, on both faces, with tip claws and knuckles
  [0.34, 0.52, 0.68, 0.82].forEach((k, i) => {
    const s0 = k - 0.2 + i * 0.03;
    const c0 = C(s0);
    const n0 = Nlow(k);
    const e = [C(k)[0] + n0[0] * wd(k), C(k)[1] + n0[1] * wd(k)];
    const t0 = Tn(s0);
    const ctl = [(c0[0] + e[0]) * 0.5 + t0[0] * 0.05, (c0[1] + e[1]) * 0.5 + t0[1] * 0.05];
    for (const z of [0.0145, -0.0145]) {
      b.sweep(bezier(W(c0, z), W(ctl, z), W(ctl, z), W(e, z)), [0.016 - i * 0.002, 0.005], { bone: root, sides: 5, caps: "round", color: IVORY, name: "rib" });
      ball(IVORY_M, root, [BO[0] + c0[0], BO[1] + c0[1], z * 1.3], 0.026, 6);
    }
    const dir = [e[0] - ctl[0], e[1] - ctl[1], 0];
    cone(IVORY, root, [BO[0] + e[0], BO[1] + e[1], 0], dir, 0.07, 0.016, 5);
  });
  // glyph decals in the scallop valleys, big sigil near the root, both faces
  const placeDecal = (t: number, f: number, size: number, tex: ReturnType<typeof svg>) => {
    const c = C(t);
    const n = Nlow(t);
    const tg = Tn(t);
    const w = wd(t) * sf(t) * f;
    const pos = [BO[0] + c[0] + n[0] * w, BO[1] + c[1] + n[1] * w];
    for (const z of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          bone: root,
          at: [pos[0], pos[1], z * 0.0145],
          dir: [0, 0, z],
          axis: "z",
          up: [z * tg[0], tg[1], 0],
          texture: tex,
          name: "glyph",
        }),
        1.4,
      );
  };
  placeDecal(0.17, 0.5, 0.17, sigil);
  [0.43, 0.6, 0.75, 0.9].forEach((t, i) => placeDecal(t, 0.62, 0.065, glyphTex[i]));
  // mount: bone plates and rivets clamp the blade to the shaft
  const plate: OutlinePoint[] = [[-0.07, 0.08], [0.14, 0.09], [0.22, 0.03], [0.14, -0.07], [-0.07, -0.1]];
  for (const z of [1, -1]) {
    b.extrude(plate, { at: [BO[0], BO[1], z * 0.0195], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: IVORY_M, bone: root, name: "mountPlate" });
    for (const [rx, ry] of [[-0.03, 0.05], [0.08, 0.05], [0.14, 0.0], [0.05, -0.06], [-0.03, -0.06]]) ball(GOLD, root, [BO[0] + rx, BO[1] + ry, z * 0.027], 0.011, 5);
  }
  ball(GOLD_D, root, BO, 0.056, 7);
  ball(GOLD, root, [BO[0], BO[1], 0.045], 0.022, 6);
  ball(GOLD, root, [BO[0], BO[1], -0.045], 0.022, 6);

  // counter-hook claw on the other side, with a hanging soul charm
  const hook = bezier(P(SX - 0.04, 1.88, 0), P(SX - 0.28, 2.0, 0), P(SX - 0.5, 1.86, 0), P(SX - 0.58, 1.6, 0));
  b.sweep(hook, [0.038, 0.005], { bone: root, sides: 6, caps: "point", bands: [[0.6, IVORY], [1, IVORY_M]], name: "hook" });
  for (const t of [0.15, 0.3, 0.45]) {
    const pt = hook.at(t);
    const tg = hook.tangentAt(t);
    cone(IVORY, root, [pt.x, pt.y + 0.02, 0], [tg.x * 0.3, 1, 0], 0.06 - t * 0.04, 0.014, 4);
  }
  torus(GOLD, root, [hook.at(0.12).x, hook.at(0.12).y, 0], hook.tangentAt(0.12), 0.036, 0.008);
  torus(GOLD, root, [hook.at(0.82).x, hook.at(0.82).y, 0], hook.tangentAt(0.82), 0.0125, 0.005);
  const H = hook.at(0.86);
  const charm = b.chain("charm", [P(H.x, H.y - 0.01, 0), P(H.x, H.y - 0.1, 0), P(H.x + 0.012, H.y - 0.2, 0), P(H.x, H.y - 0.3, 0)], {
    parent: root,
    names: ["charm1", "charm2", "charm3", "charmTip"],
    role: "hinge",
  });
  b.sweep(charm, 0.0045, { color: GOLD_D, sides: 5, name: "charmCord" });
  charm.joints.slice(0, 3).forEach((j) => ball(GOLD, j, [j.at.x, j.at.y, j.at.z], 0.014, 6));
  const tip = charm.tip!;
  cone(IVORY, tip, [tip.at.x, tip.at.y - 0.01, 0], [0, -1, 0.1], 0.11, 0.024, 5);
  torus(GOLD, tip, [tip.at.x, tip.at.y - 0.012, 0], [0, 1, 0], 0.022, 0.006);
  gem(TEAL, tip, [tip.at.x, tip.at.y + 0.035, 0], 0.024, [1, 1.5, 1], 1.5);
  b.extrude(ribbon.map(([x, y]) => [x * 0.8, y * 0.7] as OutlinePoint), { at: [tip.at.x - 0.03, tip.at.y + 0.03, 0.012], x: [1, 0, 0.2], y: [0, 1, 0], thickness: 0.005, color: ribPaint, bone: tip, name: "charmRibbon" });
  b.extrude(ribbon.map(([x, y]) => [x * 0.8, y * 0.6] as OutlinePoint), { at: [tip.at.x + 0.03, tip.at.y + 0.03, -0.012], x: [1, 0, -0.2], y: [0, 1, 0], thickness: 0.005, color: ribPaint, bone: tip, name: "charmRibbon" });

  // -------------------------------------------------------------------------------------------------------------
  // Soul wisps, motes and base dressing
  const r = rng(11);
  const ghostFrames: THREE.Vector3[] = [];
  const ghostFlow: THREE.Vector3[] = [];
  [
    [0.62, 20, 0.23],
    [0.82, 120, 0.27],
    [0.98, 215, 0.22],
    [1.2, 300, 0.3],
    [1.55, 70, 0.26],
    [1.67, 190, 0.28],
  ].forEach(([y, deg, rad]) => {
    const a = (deg * Math.PI) / 180;
    ghostFrames.push(P(SX + rad * Math.sin(a), y, rad * Math.cos(a)));
    ghostFlow.push(P(Math.sin(a), 0, Math.cos(a)));
  });
  glow(
    b.cards(ghostFrames.map((p) => frame(p, [0, 1, 0])), ghost, { size: [0.1, 0.16], flow: (_f, i) => ghostFlow[i], lean: 8, bone: root }),
    1.1,
  );
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.2 + r() * 0.22;
    const y = 0.3 + r() * 1.4;
    gem(TEAL_L, root, [SX + rad * Math.sin(a), y, rad * Math.cos(a)], 0.008 + r() * 0.01, [1, 1.4, 1], 1.8);
  }
  // fallen bone shards on the dais ring and a little hatchling skull offering
  for (let i = 0; i < 14; i++) {
    const a = (r() * 360 * Math.PI) / 180;
    const rad = 0.52 + r() * 0.1;
    const base = P(SX + rad * Math.cos(a), 0.1, -rad * Math.sin(a));
    cone(IVORY_M, root, [base.x, base.y, base.z], [Math.cos(a + 1.5), 0.15, Math.sin(a + 1.5)], 0.04 + r() * 0.04, 0.008 + r() * 0.006, 4);
  }
  const hx = SX + 0.34;
  const hz = 0.45;
  ball(IVORY, root, [hx, 0.185, hz], 0.04, 6, [1, 0.85, 1.2]);
  add(IVORY_M, root, xf(new THREE.ConeGeometry(0.026, 0.07, 5).rotateX(Math.PI / 2).translate(0, 0, 0.035), [hx, 0.18, hz + 0.03]));
  for (const s of [1, -1]) {
    ball(TEAL, root, [hx + s * 0.022, 0.196, hz + 0.03], 0.009, 5, undefined, 1.6);
    cone(IVORY, root, [hx + s * 0.03, 0.2, hz - 0.02], [s * 0.7, 0.5, -0.8], 0.05, 0.01, 4);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Flush merged bags
  for (const bag of bags.values()) {
    const merged = mergeGeometries(bag.geos);
    if (!merged) throw new Error(`merge failed for ${bag.color}`);
    const part = b.part(merged, bag.color, { bone: bag.bone, at: [0, 0, 0], flat: true, name: `merged${bag.glow ? "Glow" : ""}` });
    if (bag.glow) glow(part, bag.glow);
  }

  return b.root;
}
