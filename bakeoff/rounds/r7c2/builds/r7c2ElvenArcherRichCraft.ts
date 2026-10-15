import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  svg,
} from "../../../../src/index";
import { cel, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "High-fantasy anime elven ranger in a rigged A-pose: platinum hair with a braid, emerald anime eyes, leaf-green cloak, quiver and recurve bow on her back, standing on a small forest diorama with a target, glowing lantern and mushrooms.",
};

type V = [number, number, number];
type Col = Parameters<typeof cel>[0];
type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Small vector helpers (plain arrays)
const nrm = (a: number[]): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const add = (a: number[], d: number[], k = 1): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
const cross = (a: number[], c: number[]): V => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];
const perpTo = (d: number[], hint: number[] = [0, 1, 0]): V => {
  const dn = nrm(d);
  let h = hint;
  if (Math.abs(h[0] * dn[0] + h[1] * dn[1] + h[2] * dn[2]) > 0.95) h = [1, 0, 0];
  const k = h[0] * dn[0] + h[1] * dn[1] + h[2] * dn[2];
  return nrm([h[0] - dn[0] * k, h[1] - dn[1] * k, h[2] - dn[2] * k]);
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every colour is a two-tone cel paint
const SHIRT = "#efe8c4";
const SKIN = cel("#fff0e2", "#f8d2c0");
const SKIN_DEEP = cel("#f4bfae", "#d98f90");
const HAIR = cel(
  paint((p, n) => {
    const t = smoothstep(1.62, 1.36, p.y);
    const warm = mix("#fbf1c6", "#f1dca0", noise(p, 0.05, 11));
    const c = mix(warm, "#b9e6d0", t * 0.85);
    const ring = smoothstep(0.1, 0, Math.abs(n.y - 0.5)) * smoothstep(1.68, 1.74, p.y) * smoothstep(-0.12, 0.0, p.z + 0.1);
    return mix(c, "#ffffff", ring * 0.7);
  }),
);
const CLOAK = cel(
  paint((p, _n, s) => {
    const t = smoothstep(-0.2, -0.95, s[1]);
    const m = noise(p, 0.09, 3);
    return mix(mix("#2b6b46", "#3f9160", m), "#8d9145", t * 0.8);
  }),
);
const JERKIN = cel(
  paint((p, n) => {
    if (p.y > 1.385) return SHIRT;
    if (n.z > -0.2 && p.y > 1.29 && Math.abs(p.x) < (p.y - 1.29) * 0.8) return SHIRT;
    return mix("#a9693a", "#935a2f", noise(p, 0.03, 3));
  }),
);
const LEATHER = cel(grain("#7e4c29", "#5f3a20", { size: 0.01, axis: "x", seed: 4 }));
const BOOT = cel(grain("#6f4628", "#523319", { size: 0.012, axis: "y", seed: 6 }));
const DARK = cel("#4a2c1b", "#2b1a1a");
const SLEEVE = cel(SHIRT, "#c3c6a6");
const PANTS = cel("#56703f", "#33503f");
const GOLD = cel("#f5c64e", "#c9862c");
const STEEL = cel("#dbe4ee", "#8a98b8");
const WOOD = cel(grain("#d09048", "#a9662d", { size: 0.012, axis: [0.1, 1, 0], seed: 7 }));
const FUR = cel("#fffaf0", "#e2d5c0");
const SKIRT = cel(paint((p) => (p.y < 0.765 ? "#f2c24e" : mix("#4f9a62", "#3d7d54", noise(p, 0.08, 5)))));
const hw = (y: number) => (y > -0.2 ? 0.055 + 0.025 * -y : 0.06 - 0.6 * (-y - 0.2));
const TABARD = cel(
  paint((_p, _n, s) => (Math.abs(s[0]) > hw(s[1]) - 0.011 || s[1] > -0.012 ? "#f2c24e" : "#3c8553")),
);
const BASE = cel(
  paint((p, n) =>
    n.y > 0.5
      ? mix("#4f9a45", "#7cc058", noise(p, 0.12, 8))
      : mix("#6b4a30", "#523823", noise(p, 0.07, 9)),
  ),
);
const ROCK = cel(
  paint((p, n) =>
    n.y > 0.6 ? mix("#5e9448", "#7ab45a", noise(p, 0.05, 2)) : mix("#7d8590", "#9aa2ab", noise(p, 0.06, 3)),
  ),
);
const BARK = cel(grain("#6c4a30", "#4b3322", { size: 0.015, axis: "y", seed: 9 }));
const STRAW = cel(grain("#e2c378", "#c49a4c", { size: 0.012, axis: "x", seed: 12 }));
const CREAM = cel("#f3ead0", "#cfc3b4");

// ---------------------------------------------------------------------------------------------------------------
// Outlines (counter-clockwise)
const lockOutline = (w: number, len: number, sway: number): Pt[] => [
  [-w / 2, 0],
  [-w * 0.55, -len * 0.3],
  [-w * 0.4 + sway * 0.3, -len * 0.6],
  [sway, -len, "sharp"],
  [w * 0.35 + sway * 0.5, -len * 0.75],
  [w * 0.55, -len * 0.4],
  [w / 2, 0],
];
const earOutline = (k: number, off = 0): Pt[] => [
  [off, -0.022 * k],
  [off + 0.04 * k, -0.028 * k],
  [off + 0.1 * k, -0.01 * k],
  [off + 0.14 * k, 0.012 * k, "sharp"],
  [off + 0.07 * k, 0.03 * k],
  [off, 0.024 * k],
];
const CLOAK_BACK: Pt[] = [
  [-0.2, 0],
  [-0.26, -0.35],
  [-0.27, -0.7],
  [-0.2, -0.95, "sharp"],
  [-0.1, -0.78, "sharp"],
  [0, -1.0, "sharp"],
  [0.1, -0.78, "sharp"],
  [0.2, -0.95, "sharp"],
  [0.27, -0.7],
  [0.26, -0.35],
  [0.2, 0],
];
const CLOAK_SIDE: Pt[] = [
  [-0.09, 0],
  [-0.105, -0.3],
  [-0.085, -0.58],
  [0.0, -0.72, "sharp"],
  [0.075, -0.5, "sharp"],
  [0.105, -0.28],
  [0.09, 0],
];
const TABARD_OUT: Pt[] = [
  [-0.055, 0],
  [-0.06, -0.2],
  [0, -0.3, "sharp"],
  [0.06, -0.2],
  [0.055, 0],
];
const LEAF_OUT: Pt[] = [
  [0, -0.03, "sharp"],
  [0.018, -0.012],
  [0.016, 0.012],
  [0, 0.03, "sharp"],
  [-0.016, 0.012],
  [-0.018, -0.012],
];
const VANE: Pt[] = [
  [0, 0],
  [0.07, 0],
  [0.079, 0.022, "sharp"],
  [0.012, 0.022],
];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TORSO_TEX = svg(
  `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#f2c24e" stroke-width="1.8" fill="none" stroke-linecap="round">
    <path d="M9 84 C7 64 16 52 12 32 C10 22 14 14 21 8"/>
    <path d="M51 84 C53 64 44 52 48 32 C50 22 46 14 39 8"/>
  </g>
  <g fill="#f2c24e">
    <path d="M12 60 q-9 -1 -10 -9 q9 0 10 9z"/><path d="M13 44 q9 -2 11 -10 q-9 1 -11 10z"/>
    <path d="M48 60 q9 -1 10 -9 q-9 0 -10 9z"/><path d="M47 44 q-9 -2 -11 -10 q9 1 11 10z"/>
    <path d="M18 18 q8 -1 9 -9 q-8 1 -9 9z"/><path d="M42 18 q-8 -1 -9 -9 q8 1 9 9z"/>
  </g>
  <g stroke="#3b2414" stroke-width="1.5" stroke-linecap="round" fill="none">
    <path d="M25 30 L35 38 M35 30 L25 38 M25 40 L35 48 M35 40 L25 48 M25 50 L35 58 M35 50 L25 58 M25 60 L35 68 M35 60 L25 68"/>
  </g>
  <g fill="#f2c24e"><circle cx="25" cy="30" r="1.6"/><circle cx="35" cy="30" r="1.6"/><circle cx="25" cy="40" r="1.6"/><circle cx="35" cy="40" r="1.6"/><circle cx="25" cy="50" r="1.6"/><circle cx="35" cy="50" r="1.6"/><circle cx="25" cy="60" r="1.6"/><circle cx="35" cy="60" r="1.6"/></g>
  </svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="22" r="16.5" fill="none" stroke="#f2c24e" stroke-width="2.4"/>
  <path d="M20 8 C31 16 31 28 20 38 C9 28 9 16 20 8Z" fill="#f2c24e"/>
  <path d="M20 12 V40" stroke="#7a4d1c" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M20 20 L26 15 M20 27 L27 21 M20 20 L14 15 M20 27 L13 21" stroke="#7a4d1c" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="20" cy="45" r="2.4" fill="#f2c24e"/>
  </svg>`,
  { size: 256 },
);
const RUNES = svg(
  `<svg viewBox="0 0 30 160" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#8dffc8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 6 V28 M15 12 L25 5 M15 20 L25 13"/>
    <path d="M7 42 L15 52 L23 42 M15 52 V70"/>
    <path d="M8 84 H22 M8 84 L15 98 L22 84 M15 98 V108"/>
    <path d="M7 120 L23 128 M7 128 L23 120 M15 114 V136"/>
    <path d="M15 144 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M15 137 V153"/>
  </g></svg>`,
  { size: 320 },
);
const RINGS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#e0b57a"/>
  <g fill="none" stroke="#a9743c" stroke-width="1.6">
  <circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="14"/><circle cx="50" cy="50" r="6"/></g>
  <path d="M50 50 L90 40" stroke="#7a4d28" stroke-width="1.4"/></svg>`,
  { size: 256 },
);
const TARGET = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#e8d7a3"/>
  <circle cx="50" cy="50" r="40" fill="#bf3b2e"/>
  <circle cx="50" cy="50" r="30" fill="#f5efe0"/>
  <circle cx="50" cy="50" r="20" fill="#2f5d8c"/>
  <circle cx="50" cy="50" r="10" fill="#f4c44a"/>
  <g fill="none" stroke="#3a2a1a" stroke-width="0.9"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="10"/><circle cx="50" cy="50" r="49.5"/></g>
  </svg>`,
  { size: 256 },
);
const GRASS = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2c6a33"/><stop offset="1" stop-color="#a4e660"/></linearGradient></defs>
  <path d="M5 64 C8 42 6 24 1 6 C12 20 15 42 15 64Z" fill="url(#g)"/>
  <path d="M14 64 C14 36 18 14 23 0 C27 18 27 40 27 64Z" fill="url(#g)"/>
  <path d="M26 64 C28 44 32 28 39 14 C39 34 34 50 37 64Z" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 48 C12 36 13 28 12 20" stroke="#3f8f45" stroke-width="2" fill="none"/>
  <path d="M12 38 q-8 -2 -9 -9 q8 1 9 9z" fill="#4fa653"/>
  <g fill="#ffd1e6" stroke="#e58bb5" stroke-width="0.8"><circle cx="12" cy="8" r="4.5"/><circle cx="17" cy="12" r="4.5"/><circle cx="15" cy="18" r="4.5"/><circle cx="9" cy="18" r="4.5"/><circle cx="7" cy="12" r="4.5"/></g>
  <circle cx="12" cy="13" r="3" fill="#ffd94d"/></svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2 C30 16 30 34 16 46 C2 34 2 16 16 2Z" fill="#dc8a2e" stroke="#8a4a14" stroke-width="1.2"/>
  <path d="M16 6 V46 M16 18 L24 12 M16 28 L25 21 M16 18 L8 12 M16 28 L7 21" stroke="#8a4a14" stroke-width="1.2" fill="none"/></svg>`,
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "elven_ranger", paintSize: 2048 });
  type J = ReturnType<typeof b.joint>;

  // ---- Generic placement helpers ------------------------------------------------------------------------------
  const ball = (col: Col, at: V, sc: V | number, bone: J, seg: [number, number] = [8, 6]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), col, {
      bone,
      at,
      scale: typeof sc === "number" ? [sc, sc, sc] : sc,
    });
  const box = (col: Col, at: V, size: V, bone: J, rot?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), col, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cyl = (col: Col, at: V, dir: V, r0: number, r1: number, h: number, bone: J, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, sides), col, { bone, at, dir });

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.08, 0.005],
      [0, 1.23, 0.012],
      [0, 1.39, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine3 = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.39, 0],
      [0, 1.47, 0.012],
      [0, 1.545, 0.025],
    ]),
    { parent: spine3, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.545, 0.025], aim: [0, 1.78, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.603, 0.02], aim: [0, 1.572, 0.1], role: "jaw" });

  // ---- Legs ---------------------------------------------------------------------------------------------------
  const legR = (t: number) => (t < 0.52 ? 0.064 - 0.02 * (t / 0.52) : 0.044 - 0.012 * ((t - 0.52) / 0.48));
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.93, 0], [s * 0.1, 0.1, 0], [0.45, 0.42], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.03],
    });
    const ankle = leg.tip!;
    const toe = b.joint(`toe${L}`, { parent: ankle, at: [s * 0.1, 0.05, 0.07], aim: [s * 0.1, 0.04, 0.16] });
    b.sweep(leg, legR, { color: PANTS });
    b.sweep(leg, (t) => legR(t) + 0.012, { from: 0.58, to: 1, color: BOOT, caps: { start: "flat", end: "round" } });
    b.sweep(leg, (t) => legR(t) + 0.021, { from: 0.565, to: 0.64, color: LEATHER, caps: { start: "flat", end: "flat" } });
    b.sweep(leg, (t) => legR(t) + 0.024, { from: 0.558, to: 0.57, color: GOLD, caps: { start: "flat", end: "flat" } });
    b.sweep(leg, (t) => legR(t) + 0.016, { from: 0.8, to: 0.84, color: GOLD, caps: { start: "flat", end: "flat" } });
    b.capsule([s * 0.1, 0.05, -0.015], [s * 0.1, 0.043, 0.06], [0.05, 0.043], { color: BOOT, bone: ankle });
    b.capsule([s * 0.1, 0.04, 0.055], [s * 0.1, 0.036, 0.125], [0.041, 0.036], { color: BOOT, bone: toe });
    box(DARK, [s * 0.1, 0.007, 0.04], [0.075, 0.014, 0.2], ankle);
  }

  // ---- Torso --------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.02, 0], w: 0.25, h: 0.18 },
      { at: [0, 1.12, 0], w: 0.225, h: 0.17 },
      { at: [0, 1.27, 0.01], w: 0.3, h: 0.21 },
      { at: [0, 1.38, 0], w: 0.33, h: 0.18 },
      { at: [0, 1.44, 0], w: 0.16, h: 0.12 },
    ],
    { bone: [hips, spine], color: JERKIN },
  );
  b.decal(torso, TORSO_TEX, { at: [0, 1.2, 0.12], dir: [0, 0, 1], size: [0.2, 0.3], lift: 0.003 });
  const skinT = b.surface(torso);

  b.sweep(neck, [0.043, 0.038], { color: SKIN });

  // Fur collar, hood and brooch
  const collarPts: V[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    collarPts.push([Math.sin(a) * 0.088, 1.447, Math.cos(a) * 0.066 + 0.002]);
  }
  b.sweep(catmull(collarPts, { closed: true }), 0.03, { color: FUR, bone: spine3 });
  ball(CLOAK, [0, 1.5, -0.105], [0.1, 0.07, 0.08], spine3, [8, 6]);
  b.part(new THREE.ConeGeometry(0.075, 0.2, 6), CLOAK, { bone: spine3, at: [0, 1.4, -0.125], dir: [0, -1, -0.12] });
  b.extrude(LEAF_OUT, { at: [0, 1.428, 0.124], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, color: GOLD, bone: spine3 });
  glow(b.part(new THREE.OctahedronGeometry(0.011, 0), "#5dffb0", { bone: spine3, at: [0, 1.43, 0.131], scale: [1, 1.5, 0.9] }), 1.4);

  // ---- Cloak --------------------------------------------------------------------------------------------------
  const cloakPanel = (c: V, u: V, outward: V, outline: Pt[], flare = 0.08) => {
    const y = nrm([-outward[0] * flare, 1, -outward[2] * flare]);
    return b.extrude(outline, { at: c, x: u, y, thickness: 0.016, bevel: 0.003, color: CLOAK, bone: spine3 });
  };
  cloakPanel([0, 1.45, -0.135], [1, 0, 0], [0, 0, -1], CLOAK_BACK);
  for (const s of [1, -1]) {
    const u = nrm([s * 0.85, 0, 0.52]);
    const out = nrm([s * 0.52, 0, -0.85]);
    cloakPanel([s * 0.17, 1.44, -0.1], u, out, CLOAK_SIDE, 0.1);
  }

  // ---- Arms and hands -----------------------------------------------------------------------------------------
  const armR = (t: number) => 0.046 - 0.016 * t;
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh: V = [s * 0.18, 1.4, 0];
    const el: V = [s * 0.405, 1.225, -0.01];
    const wr: V = [s * 0.62, 1.075, 0.04];
    const arm = b.chain(`arm${L}`, [sh, el, wr], {
      parent: spine3,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    b.sweep(arm, armR, { color: SKIN });
    b.sweep(arm, (t) => armR(t) + 0.007 + 0.009 * t, { from: 0, to: 0.5, color: SLEEVE, caps: { start: "round", end: "flat" } });
    b.sweep(arm, (t) => armR(t) + 0.026, { from: 0.49, to: 0.53, color: GOLD, caps: { start: "flat", end: "flat" } });
    b.sweep(arm, (t) => armR(t) + 0.009, { from: 0.6, to: 0.93, color: LEATHER, caps: { start: "flat", end: "flat" } });
    b.sweep(arm, (t) => armR(t) + 0.012, { from: 0.6, to: 0.62, color: GOLD, caps: { start: "flat", end: "flat" } });
    b.sweep(arm, (t) => armR(t) + 0.012, { from: 0.91, to: 0.93, color: GOLD, caps: { start: "flat", end: "flat" } });

    // Hand
    const U = nrm([wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]]);
    const P = (a: number, o: number): V => [wr[0] + U[0] * a, wr[1] + U[1] * a, wr[2] + U[2] * a + o];
    ball(SKIN, P(0.04, 0), [0.017, 0.046, 0.04], wrist, [8, 6]).mesh.quaternion.identity();
    const fingers: [string, number, number, number][] = [
      ["index", 0.027, 0.074, 0.18],
      ["middle", 0.009, 0.082, 0.05],
      ["ringF", -0.009, 0.075, -0.05],
      ["pinky", -0.026, 0.06, -0.2],
    ];
    for (const [nm, off, len, splay] of fingers) {
      const d = nrm([U[0], U[1], U[2] + splay]);
      const base = P(0.075, off);
      const f = b.chain(`${nm}${L}`, [base, add(base, d, len * 0.55), add(base, d, len)], { parent: wrist, role: "digit" });
      b.sweep(f, [0.0125, 0.0085], { color: SKIN });
    }
    const td = nrm([U[0] * 0.5, U[1] * 0.5, U[2] * 0.5 + 0.85]);
    const tb = P(0.03, 0.03);
    const th = b.chain(`thumb${L}`, [tb, add(tb, td, 0.035), add(tb, td, 0.068)], { parent: wrist, role: "digit" });
    b.sweep(th, [0.014, 0.009], { color: SKIN });
  }

  // Left pauldron: three shingled plates with gold studs
  const lSh = b.chain; // keep reference silenced
  void lSh;
  const shoulderL = spine3;
  const dome = new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  const plates: [V, V, number, Col][] = [
    [[0.2, 1.435, 0], [0.075, 0.05, 0.075], -22, LEATHER],
    [[0.235, 1.41, 0], [0.07, 0.045, 0.07], -34, DARK],
    [[0.268, 1.375, 0], [0.062, 0.04, 0.062], -46, LEATHER],
  ];
  for (const [at, sc, rz, col] of plates) {
    b.part(dome, col, { bone: shoulderL, at, scale: sc, rotation: [0, 0, rz], flat: true });
    ball(GOLD, add(at, [Math.sin((-rz * Math.PI) / 180) * 0.03, Math.cos((rz * Math.PI) / 180) * 0.04, 0]), 0.008, shoulderL, [6, 4]);
  }
  // Right shoulder: a leather strap clasp
  box(LEATHER, [-0.185, 1.43, 0], [0.08, 0.016, 0.07], spine3, [0, 0, 18]);
  box(GOLD, [-0.19, 1.438, 0.0], [0.018, 0.02, 0.074], spine3, [0, 0, 18]);

  // ---- Head ---------------------------------------------------------------------------------------------------
  const sph14 = new THREE.SphereGeometry(1, 14, 10);
  const skull = b.part(sph14, SKIN, { bone: head, at: [0, 1.67, 0], scale: [0.098, 0.105, 0.1] });
  const midface = b.part(sph14, SKIN, { bone: head, at: [0, 1.62, 0.018], scale: [0.08, 0.066, 0.078] });
  ball(SKIN, [0, 1.575, 0.035], [0.048, 0.03, 0.052], jaw, [10, 7]);
  b.part(new THREE.ConeGeometry(0.008, 0.02, 4), SKIN_DEEP, { bone: head, at: [0, 1.633, 0.106], dir: [0, -0.25, 1] });
  // Mouth: a tiny smile
  b.sweep(
    catmull([
      [-0.014, 1.599, 0.091],
      [0, 1.594, 0.097],
      [0.014, 1.599, 0.091],
    ]),
    0.0022,
    { color: "#c9606c", bone: head, sides: 4 },
  );
  // Eyes
  const faceSkin = b.surface([skull, midface]);
  const EYE = animeEye({ iris: "#27d6a0" });
  for (const s of [1, -1]) {
    const hit = faceSkin.around([0, 1.655, 0]).at(s * 30, -1);
    if (hit) b.decal(faceSkin, EYE, { at: hit.at, dir: [0, 0, 1], size: [0.062, 0.085], mirror: s > 0, lift: 0.003 });
  }
  // Ears
  for (const s of [1, -1]) {
    const ex = nrm([s * 0.5, 0.42, -0.75]);
    const ey = perpTo(ex);
    const at: V = [s * 0.09, 1.662, 0.008];
    b.extrude(earOutline(1), { at, x: ex, y: ey, thickness: 0.011, bevel: 0.002, color: SKIN, bone: head });
    b.extrude(earOutline(0.6, 0.014), { at, x: ex, y: ey, thickness: 0.015, bevel: 0.002, color: SKIN_DEEP, bone: head });
    // gold ear cuff
    b.part(new THREE.TorusGeometry(0.014, 0.0035, 4, 8), GOLD, { bone: head, at: add(at, ex, 0.07), dir: ex });
  }

  // ---- Hair ---------------------------------------------------------------------------------------------------
  ball(HAIR, [0, 1.705, -0.012], [0.108, 0.105, 0.108], head, [14, 10]);
  const HCC: V = [0, 1.705, -0.012];
  const lockOn = (theta: number, elev: number, off: number, len: number, w: number, sway: number, flare: number) => {
    const th = (theta * Math.PI) / 180;
    const el = (elev * Math.PI) / 180;
    const n: V = [Math.cos(el) * Math.sin(th), Math.sin(el), Math.cos(el) * Math.cos(th)];
    const upT: V = [-Math.sin(el) * Math.sin(th), Math.cos(el), -Math.sin(el) * Math.cos(th)];
    const x: V = [Math.cos(th), 0, -Math.sin(th)];
    const y = nrm([upT[0] - n[0] * flare, upT[1] - n[1] * flare, upT[2] - n[2] * flare]);
    return b.extrude(lockOutline(w, len, sway), {
      at: add(HCC, n, 0.108 + off),
      x,
      y,
      thickness: 0.012,
      bevel: 0.0025,
      color: HAIR,
      bone: head,
    });
  };
  const wob = (i: number) => (((i * 37) % 5) - 2) * 0.006;
  // crown
  for (let i = 0; i < 6; i++) lockOn(i * 60, 64, 0.004, 0.07, 0.075, wob(i), -0.4);
  for (let i = 0; i < 8; i++) lockOn(22 + i * 45, 44, 0.004, 0.09, 0.075, wob(i + 2), -0.3);
  for (let i = 0; i < 9; i++) lockOn(50 + i * 32.5, 24, 0.004, 0.11, 0.075, wob(i + 4), -0.12);
  // long back hair
  for (let i = 0; i < 9; i++) lockOn(105 + i * 18.75, 2 - (i % 2) * 3, 0.003, 0.3 - (i % 3) * 0.03, 0.08, wob(i), 0.06);
  for (let i = 0; i < 7; i++) lockOn(125 + i * 18.3, -14, 0.0, 0.25 - (i % 2) * 0.03, 0.075, wob(i + 1), 0.02);
  // bangs and side locks
  for (const s of [1, -1]) {
    lockOn(s * 6, 17, 0.004, 0.055, 0.04, s * 0.01, 0.25);
    lockOn(s * 17, 17, 0.004, 0.06, 0.042, s * 0.014, 0.25);
    lockOn(s * 33, 17, 0.002, 0.09, 0.046, s * 0.016, 0.22);
    lockOn(s * 55, 8, -0.007, 0.17, 0.05, s * 0.012, 0.12);
    lockOn(s * 68, 6, -0.006, 0.25, 0.05, s * 0.014, 0.1);
  }
  // Circlet
  const cir: V[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cir.push([Math.sin(a) * 0.113, 1.713 - 0.005 * Math.cos(a), Math.cos(a) * 0.108 - 0.003]);
  }
  b.sweep(catmull(cir, { closed: true }), 0.0045, { color: GOLD, bone: head, sides: 6 });
  glow(b.part(new THREE.OctahedronGeometry(0.013, 0), "#4dffb8", { bone: head, at: [0, 1.706, 0.114], scale: [0.9, 1.5, 0.8] }), 1.4);

  // Braid over the left shoulder
  const braid = catmull([
    [0.1, 1.6, 0.04],
    [0.13, 1.5, 0.08],
    [0.125, 1.4, 0.125],
    [0.105, 1.28, 0.145],
    [0.1, 1.15, 0.15],
    [0.095, 1.02, 0.145],
  ]);
  const BN = 17;
  for (let i = 0; i < BN; i++) {
    const t = (i + 0.5) / BN;
    const pos = braid.at(t);
    const tan = braid.tangentAt(t);
    const side = nrm(cross([tan.x, tan.y, tan.z], [0, 0, 1]));
    const alt = i % 2 ? 1 : -1;
    const taper = 1 - 0.35 * t;
    b.part(new THREE.SphereGeometry(1, 6, 4), HAIR, {
      bone: spine3,
      at: [pos.x + side[0] * alt * 0.005, pos.y + side[1] * alt * 0.005, pos.z + side[2] * alt * 0.005],
      dir: [tan.x + side[0] * alt * 0.8, tan.y + side[1] * alt * 0.8, tan.z + side[2] * alt * 0.8],
      scale: [0.021 * taper, 0.03 * taper, 0.019 * taper],
    });
  }
  const braidEnd = braid.at(1);
  b.extrude(
    lockOutline(0.05, 0.08, 0.004),
    { at: [braidEnd.x, braidEnd.y + 0.005, braidEnd.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: HAIR, bone: spine3 },
  );
  ball(GOLD, [0.1, 1.575, 0.065], [0.016, 0.014, 0.016], head, [6, 4]);
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), GOLD, { bone: spine3, at: [braidEnd.x, braidEnd.y + 0.02, braidEnd.z], rotation: [90, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.01, 0), "#5dffb0", { bone: spine3, at: [braidEnd.x, braidEnd.y + 0.02, braidEnd.z + 0.02], scale: [0.9, 1.4, 0.8] }), 1.2);

  // ---- Tunic skirt, tabard, belt ------------------------------------------------------------------------------
  b.lathe(
    [
      [0.113, 0],
      [0.193, -0.27],
      [0.205, -0.27],
      [0.125, 0],
    ],
    { at: [0, 1.0, 0], axis: [0, 1, 0], segments: 8, color: SKIRT, bone: hips },
  );
  const tabard = b.extrude(TABARD_OUT, {
    at: [0, 1.0, 0.125],
    x: [1, 0, 0],
    y: nrm([0, 1, -0.22]),
    thickness: 0.012,
    bevel: 0.002,
    color: TABARD,
    bone: hips,
  });
  b.decal(tabard, EMBLEM, { at: [0, 0.865, 0.156], dir: [0, 0, 1], size: [0.065, 0.08], lift: 0.002 });
  b.extrude(TABARD_OUT, {
    at: [0, 1.0, -0.125],
    x: [1, 0, 0],
    y: nrm([0, 1, 0.22]),
    thickness: 0.012,
    bevel: 0.002,
    color: TABARD,
    bone: hips,
  });

  const waist = skinT.loop([0, 1.05, 0], { lift: 0.004 });
  b.sweep(waist, () => [0.007, 0.02], { section: "box", color: LEATHER });
  box(GOLD, [0, 1.05, 0.101], [0.05, 0.042, 0.012], hips);
  box(DARK, [0, 1.05, 0.108], [0.026, 0.02, 0.006], hips);
  glow(b.part(new THREE.OctahedronGeometry(0.008, 0), "#5dffb0", { bone: hips, at: [0, 1.05, 0.113], scale: [1, 1.2, 0.7] }), 1.2);

  // Hip pouch (left)
  box(LEATHER, [0.185, 0.975, 0.03], [0.065, 0.08, 0.05], hips, [0, 0, -6]);
  box(DARK, [0.186, 1.005, 0.034], [0.07, 0.035, 0.056], hips, [0, 0, -6]);
  ball(GOLD, [0.19, 0.99, 0.063], 0.007, hips, [6, 4]);
  // Dagger (right)
  b.capsule([-0.165, 1.0, 0.02], [-0.2, 0.78, -0.02], [0.017, 0.012], { color: LEATHER, bone: hips });
  b.capsule([-0.2, 0.8, -0.02], [-0.202, 0.77, -0.022], 0.014, { color: GOLD, bone: hips });
  b.rod([-0.165, 1.0, 0.02], [-0.158, 1.09, 0.028], 0.011, { color: DARK, bone: hips });
  box(GOLD, [-0.165, 1.002, 0.02], [0.075, 0.012, 0.022], hips);
  ball(GOLD, [-0.157, 1.1, 0.029], 0.013, hips, [6, 4]);
  glow(b.part(new THREE.OctahedronGeometry(0.007, 0), "#5dffb0", { bone: hips, at: [-0.157, 1.1, 0.042], scale: [1, 1.2, 0.7] }), 1.2);

  // Baldric strap and chest badge
  const baldricRough = catmull(
    [
      [-0.12, 1.4, 0.06],
      [0, 1.22, 0.115],
      [0.13, 1.04, 0.1],
      [0.16, 1.0, 0],
      [0.11, 1.06, -0.1],
      [-0.01, 1.24, -0.12],
      [-0.12, 1.4, -0.07],
      [-0.16, 1.41, 0],
    ],
    { closed: true },
  );
  b.sweep(skinT.drape(baldricRough, { lift: 0.008 }), () => [0.02, 0.006], { section: "box", color: LEATHER });
  b.extrude(LEAF_OUT, { at: [-0.0, 1.215, 0.128], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.007, bevel: 0.002, color: GOLD, bone: spine3 });

  // ---- Quiver and arrows --------------------------------------------------------------------------------------
  const SHAFT = "#e0bb7e";
  const arrow = (tail: V, tip: V, bone: J, vane1: Col, vane2: Col) => {
    const d = nrm([tip[0] - tail[0], tip[1] - tail[1], tip[2] - tail[2]]);
    b.rod(tail, add(tip, d, -0.036), 0.0042, { color: SHAFT, bone, sides: 5 });
    b.spike(add(tip, d, -0.045), d, 0.045, 0.011, { color: STEEL, bone });
    ball(GOLD, tail, 0.0065, bone, [6, 4]);
    const p1 = perpTo(d);
    const p2 = cross(d, p1);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      const pv = add([0, 0, 0], p1, Math.cos(a));
      const pw = add(pv, p2, Math.sin(a));
      b.extrude(VANE, {
        at: add(tail, d, 0.014),
        x: d,
        y: pw,
        thickness: 0.002,
        color: k === 0 ? vane1 : vane2,
        bone,
      });
    }
  };

  const QC: V = [-0.075, 1.14, -0.235];
  const QD = nrm([-0.28, 1, 0.12]);
  const QH = 0.5;
  const QT = add(QC, QD, QH / 2);
  const quiver = b.part(new THREE.CylinderGeometry(0.056, 0.047, QH, 8), LEATHER, { bone: spine3, at: QC, dir: QD });
  cyl(GOLD, add(QT, QD, -0.0125), QD, 0.061, 0.061, 0.025, spine3);
  cyl(DARK, add(QT, QD, 0.001), QD, 0.05, 0.05, 0.004, spine3);
  cyl(GOLD, add(QC, QD, 0.05), QD, 0.057, 0.057, 0.014, spine3);
  cyl(GOLD, add(QC, QD, -0.12), QD, 0.053, 0.053, 0.014, spine3);
  b.part(new THREE.ConeGeometry(0.048, 0.06, 8), GOLD, { bone: spine3, at: add(QC, QD, -QH / 2 - 0.02), dir: [-QD[0], -QD[1], -QD[2]] });
  b.decal(quiver, EMBLEM, { at: [-0.085, 1.16, -0.288], dir: [0, 0.05, -1], size: [0.06, 0.075], lift: 0.003 });
  const q1 = perpTo(QD, [1, 0, 0]);
  const q2 = cross(QD, q1);
  const offs: [number, number][] = [
    [0, 0],
    [0.022, 0.01],
    [-0.02, 0.012],
    [0.008, -0.024],
    [-0.012, -0.02],
  ];
  offs.forEach(([a, c], i) => {
    const o: V = [q1[0] * a + q2[0] * c, q1[1] * a + q2[1] * c, q1[2] * a + q2[2] * c];
    const tip = add(add(QT, QD, -0.18), o);
    const tail = add(add(QT, QD, 0.2 + (i % 2) * 0.03), o, 2.2);
    arrow(tail, tip, spine3, i === 2 ? "#e0463a" : "#f4f0e0", "#4fb877");
  });
  // Quiver straps
  b.rod([-0.14, 1.36, -0.2], [-0.12, 1.33, -0.12], 0.011, { color: LEATHER, bone: spine3 });

  // ---- Bow (slung on the back, left) --------------------------------------------------------------------------
  const BOW: V[] = [
    [0.31, 0.46, -0.19],
    [0.2905, 0.652, -0.235],
    [0.271, 0.844, -0.268],
    [0.245, 1.1, -0.29],
    [0.219, 1.356, -0.268],
    [0.1995, 1.548, -0.235],
    [0.18, 1.74, -0.19],
  ];
  const bow = b.sweep(catmull(BOW), (t) => 0.008 + 0.011 * Math.sin(Math.PI * t), {
    color: WOOD,
    bands: [
      [0.06, GOLD],
      [0.44, WOOD],
      [0.56, LEATHER],
      [0.94, WOOD],
      [1, GOLD],
    ],
    bone: spine3,
  });
  b.rod(BOW[0], BOW[6], 0.0025, { color: "#f3efe0", bone: spine3, sides: 4 });
  for (const t of [0.27, 0.74]) {
    const pt = bow.at(t, 0);
    glow(b.decal(bow, RUNES, { at: pt.at, dir: pt.n, size: [0.026, 0.15], lift: 0.002 }), 1.1);
  }
  b.rod([0.19, 1.356, -0.15], BOW[4], 0.009, { color: LEATHER, bone: spine3, sides: 5 });
  b.rod([0.24, 0.844, -0.18], BOW[2], 0.009, { color: LEATHER, bone: spine3, sides: 5 });
  ball(GOLD, [0.215, 1.356, -0.262], 0.012, spine3, [6, 4]);

  // ---- Base and setting ---------------------------------------------------------------------------------------
  const baseDisc = b.lathe(
    [
      [0, -0.012],
      [0.8, -0.012],
      [0.86, 0],
      [0.82, 0.014],
      [0, 0.014],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 14, color: BASE, bone: root },
  );
  const ground = b.surface(baseDisc);
  const tufts = ground.scatter(80, {
    rng: rng(5),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.7 && !(Math.abs(h.at.x) < 0.22 && h.at.z > -0.12 && h.at.z < 0.22),
  });
  b.cards(tufts, GRASS, { size: [0.07, 0.11], lean: 8, bend: 20, vary: 0.35, rng: rng(6), spin: 180, cross: true, bone: root });
  const blooms = ground.scatter(14, {
    rng: rng(21),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.7 && Math.hypot(h.at.x, h.at.z) > 0.45,
  });
  b.cards(blooms, FLOWER, { size: [0.05, 0.1], lean: 5, vary: 0.3, rng: rng(22), spin: 180, cross: true, bone: root });
  const leafFrames = Array.from({ length: 14 }, (_, i) => {
    const a = i * 2.4;
    const r = 0.32 + (((i * 37) % 10) / 10) * 0.42;
    return frame([Math.sin(a) * r, 0.016, Math.cos(a) * r], [0, 1, 0]);
  });
  b.cards(leafFrames, LEAF, {
    size: 0.07,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
    bone: root,
    sink: 0,
  });

  // Mossy rocks
  const ico = new THREE.IcosahedronGeometry(1, 0);
  b.part(ico, ROCK, { bone: root, at: [0.58, 0.1, -0.3], scale: [0.17, 0.11, 0.14], rotation: [0, 35, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [0.7, 0.072, -0.12], scale: [0.1, 0.07, 0.09], rotation: [10, 80, 0], flat: true });
  b.part(ico, ROCK, { bone: root, at: [-0.3, 0.087, -0.62], scale: [0.14, 0.09, 0.12], rotation: [0, 12, 8], flat: true });

  // Stump seat with a glowing lantern
  const sx = 0.52;
  const sz = 0.42;
  b.lathe(
    [
      [0, 0],
      [0.23, 0],
      [0.2, 0.08],
      [0.175, 0.2],
      [0.175, 0.3],
      [0, 0.3],
    ],
    { at: [sx, 0.01, sz], axis: [0, 1, 0], segments: 9, color: BARK, bone: root },
  );
  b.part(new THREE.CircleGeometry(0.175, 12), "#ffffff", { bone: root, at: [sx, 0.312, sz], dir: [0, 1, 0], axis: "z", texture: RINGS });
  const ly = 0.314;
  cyl(GOLD, [sx, ly + 0.006, sz], [0, 1, 0], 0.05, 0.055, 0.012, root);
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), "#ffd36b", { bone: root, at: [sx, ly + 0.045, sz] }), 1.6);
  for (const [dx, dz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]) {
    b.rod([sx + dx * 0.036, ly + 0.012, sz + dz * 0.036], [sx + dx * 0.03, ly + 0.09, sz + dz * 0.03], 0.0035, { color: GOLD, bone: root, sides: 4 });
  }
  b.part(new THREE.ConeGeometry(0.055, 0.04, 8), GOLD, { bone: root, at: [sx, ly + 0.11, sz] });
  b.part(new THREE.TorusGeometry(0.018, 0.004, 4, 8), GOLD, { bone: root, at: [sx, ly + 0.14, sz] });

  // Glowing mushrooms
  const mush = (x: number, z: number, h: number, r: number) => {
    cyl(CREAM, [x, 0.014 + h / 2, z], [0, 1, 0], r * 0.22, r * 0.3, h, root, 6);
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#7ff5d2", {
        bone: root,
        at: [x, 0.014 + h, z],
        scale: [r, r * 0.7, r],
      }),
      1.2,
    );
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + x * 10;
      b.part(new THREE.SphereGeometry(1, 5, 3), "#ffffff", {
        bone: root,
        at: [x + Math.sin(a) * 0.6 * r, 0.014 + h + 0.56 * r, z + Math.cos(a) * 0.6 * r],
        scale: [r * 0.15, r * 0.08, r * 0.15],
      });
    }
  };
  mush(0.74, 0.3, 0.07, 0.05);
  mush(0.8, 0.43, 0.04, 0.032);
  mush(0.3, 0.6, 0.05, 0.04);

  // Archery target on a tripod
  const f = nrm([0.85, 0.05, 0.5]);
  const Cb: V = [-0.5, 0.62, -0.05];
  b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 16), STRAW, { bone: root, at: Cb, dir: f });
  b.part(new THREE.CircleGeometry(0.265, 20), "#ffffff", { bone: root, at: add(Cb, f, 0.031), dir: f, axis: "z", texture: TARGET });
  const fSide = nrm(cross([0, 1, 0], f));
  const apex: V = [Cb[0] - f[0] * 0.07, 0.86, Cb[2] - f[2] * 0.07];
  const g0: V = [Cb[0] - f[0] * 0.2, 0.012, Cb[2] - f[2] * 0.2];
  for (const foot of [
    add(g0, fSide, 0.26),
    add(g0, fSide, -0.24),
    [Cb[0] - f[0] * 0.34, 0.012, Cb[2] - f[2] * 0.34],
  ] as V[]) b.rod(apex, foot, 0.014, { color: WOOD, bone: root, sides: 5 });
  const fu = nrm(cross([0, 1, 0], f));
  const Fc = add(Cb, f, 0.032);
  const hits: [number, number, number][] = [
    [0.02, 0.03, 1],
    [-0.1, -0.06, -1],
    [0.13, -0.1, 0.5],
  ];
  hits.forEach(([a, c, k], i) => {
    const tip = add(add(add(Fc, fu, a), [0, 1, 0], c), f, -0.035);
    const back = nrm([f[0] + 0.15 * k * fu[0], f[1] + 0.1 * k, f[2] + 0.15 * k * fu[2]]);
    arrow(add(tip, back, 0.42), tip, root, i === 0 ? "#e0463a" : "#f4f0e0", "#4fb877");
  });

  // Fireflies
  const flies: V[] = [
    [0.4, 1.0, 0.5],
    [-0.35, 1.5, 0.45],
    [0.65, 1.6, -0.1],
    [-0.7, 1.25, 0.2],
    [0.2, 0.75, 0.62],
    [-0.15, 1.85, -0.3],
  ];
  for (const at of flies) glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), "#e6ff8a", { bone: root, at }), 1.6);

  return b.root;
}
