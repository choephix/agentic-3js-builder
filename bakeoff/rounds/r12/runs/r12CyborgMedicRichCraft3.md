```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  spiral,
  limb,
  aim,
  frame,
  paint,
  mix,
  noise,
  smoothstep,
  rng,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, gearTexture, gearSize, TINT } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Overwatch-style support hero: a half-cybernetic field medic in white and teal armour with a glowing cyan eye and arm, a swept silver pompadour, a med-tech backpack and a winged caduceus healing staff topped with a golden orb.",
};

type V3 = [number, number, number];
const TAU = Math.PI * 2;

export default function build() {
  const b = createBuilder({ name: "cyborg_medic" });

  // ------------------------------------------------------------------ palette
  const C = {
    teal: "#17b5b0",
    tealD: "#0b6a78",
    gold: "#f4c24f",
    goldD: "#b9822a",
    dark: "#1b212b",
    steel: "#3a4452",
    glowC: "#59f2ff",
    glowG: "#6dffb2",
    glowY: "#ffd873",
    lip: "#9c4b45",
    mouth: "#4a1c1c",
    white: "#f4f8fb",
    brow: "#3b2a22",
  };
  const lit = (lo: string, hi: string) => paint((_p, n) => mix(lo, hi, smoothstep(-0.8, 0.9, n.y)));
  const SKIN = paint((_p, n) => mix("#b3744d", "#e0a47c", smoothstep(-0.7, 0.8, n.y)));
  const SUIT = paint((p, n) => {
    const base = mix("#1d2842", "#34456e", smoothstep(-0.8, 0.9, n.y));
    return mix(base, "#0f1626", 0.35 * smoothstep(0.5, 0.8, noise(p, 0.06, 5)));
  });
  const ARMOR = paint((p, n) => {
    const base = mix("#cdd8e4", "#fbfdff", smoothstep(-0.7, 0.9, n.y));
    const scuff = mix(base, "#9fb2c4", 0.3 * smoothstep(0.55, 0.8, noise(p, 0.05, 3)));
    return mix(scuff, "#6f7d89", 0.55 * smoothstep(0.3, 0.0, p.y));
  });
  const TEALP = lit("#0f8f94", "#27d0c8");
  const BOOT = lit("#22364c", "#41607f");
  const LEATHER = lit("#43301f", "#6d4e37");
  const HAIR = paint((_p, n) => mix("#bccbdd", "#ffffff", smoothstep(-0.3, 0.9, n.y)));
  const STEEL = metal("steel", { tarnish: 0.15 });
  const BLUED = metal("blued");
  const GILT = metal("gilt");
  const IRON = metal("iron");

  // ------------------------------------------------------------------ textures
  const EYE_H = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="M3 25 Q20 6 35 6 Q52 7 61 26 Q45 37 30 36 Q14 35 3 25Z"/></clipPath>
    <radialGradient id="i" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#8ae6cc"/><stop offset=".6" stop-color="#2a9a96"/><stop offset="1" stop-color="#145a5c"/></radialGradient></defs>
    <path d="M3 25 Q20 6 35 6 Q52 7 61 26 Q45 37 30 36 Q14 35 3 25Z" fill="#fbf7f0"/>
    <g clip-path="url(#c)">
      <circle cx="35" cy="22" r="14" fill="url(#i)"/>
      <circle cx="35" cy="22" r="14" fill="none" stroke="#0f3f42" stroke-width="2.4"/>
      <circle cx="35" cy="22" r="6.2" fill="#0a1214"/>
      <ellipse cx="29.5" cy="16" rx="4.2" ry="3.2" fill="#fff"/>
      <circle cx="41" cy="27" r="2" fill="#dffcf6"/>
      <path d="M0 8 L64 8 L64 18 Q35 4 0 18Z" fill="#000" opacity=".2"/>
    </g>
    <path d="M2 26 Q20 3 36 4 Q54 5 62 28" fill="none" stroke="#1c120d" stroke-width="5" stroke-linecap="round"/>
    <path d="M6 24 L1 16" stroke="#1c120d" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M9 30 Q30 39 54 30" fill="none" stroke="#7a4a35" stroke-width="2" stroke-linecap="round" opacity=".7"/>
  </svg>`,
    { size: 256 },
  );
  const EYE_C = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="60" height="32" rx="14" fill="#0d131b"/>
    <rect x="2" y="4" width="60" height="32" rx="14" fill="none" stroke="#59f2ff" stroke-width="2"/>
    <circle cx="32" cy="20" r="13" fill="#06242c"/>
    <circle cx="32" cy="20" r="13" fill="none" stroke="#59f2ff" stroke-width="2.4"/>
    <circle cx="32" cy="20" r="8" fill="#59f2ff"/>
    <circle cx="32" cy="20" r="4" fill="#0a1a20"/>
    <path d="M32 3 V9 M32 31 V37 M13 20 H19 M45 20 H51" stroke="#59f2ff" stroke-width="2"/>
    <circle cx="27" cy="15" r="2.4" fill="#ffffff"/>
  </svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 40 Q10 12 40 10 L84 14 Q94 40 80 62 L50 70 Q22 66 14 40Z" fill="#eaf1f7" stroke="#243040" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 38 Q26 22 44 21 L78 24" fill="none" stroke="#17b5b0" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M30 52 L60 56 L74 46" stroke="#1fc4d6" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <circle cx="74" cy="46" r="4" fill="#59f2ff" stroke="#243040" stroke-width="1.5"/>
    <path d="M62 23 L62 40" stroke="#243040" stroke-width="2"/>
    <circle cx="30" cy="28" r="2" fill="#243040"/><circle cx="48" cy="62" r="2" fill="#243040"/>
  </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27Z" fill="#0a2630" stroke="#59f2ff" stroke-width="5" stroke-linejoin="round"/>
    <path d="M42 24 H58 V42 H76 V58 H58 V76 H42 V58 H24 V42 H42Z" fill="#59f2ff"/>
  </svg>`,
    { size: 192 },
  );
  const CROSS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#f4f8fb" stroke="#243040" stroke-width="5"/>
    <path d="M40 22 H60 V40 H78 V60 H60 V78 H40 V60 H22 V40 H40Z" fill="#17b5b0" stroke="#0b6a78" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
    { size: 192 },
  );
  const TABARD = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0 H64 V104 L32 128 L0 104Z" fill="#f1f5f9"/>
    <path d="M0 0 H9 V108 L0 100Z M55 0 H64 V100 L55 108Z" fill="#17b5b0"/>
    <path d="M0 0 H64 V8 H0Z" fill="#0b6a78"/>
    <path d="M0 104 L32 128 L64 104" fill="none" stroke="#17b5b0" stroke-width="6" stroke-linejoin="round"/>
    <path d="M24 56 H40 M32 48 V64" stroke="#f4c24f" stroke-width="6"/>
    <path d="M16 84 L32 74 L48 84 L32 94Z" fill="none" stroke="#9fd8dc" stroke-width="2"/>
    <path d="M16 24 L32 14 L48 24 L32 34Z" fill="none" stroke="#9fd8dc" stroke-width="2"/>
  </svg>`,
    { size: 256 },
  );
  const HAIR_TEX = svg(
    `<svg viewBox="0 0 20 60" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8da3bd"/><stop offset=".5" stop-color="#d6e3f1"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M10 60 Q1 38 6 18 Q8 8 10 0 Q13 8 15 20 Q19 40 10 60Z" fill="url(#g)" stroke="#6f86a3" stroke-width="1"/>
  </svg>`,
    { size: 128 },
  );
  const HALO = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#ffd873" stroke-width="3"/>
    <circle cx="50" cy="50" r="37" fill="none" stroke="#ffd873" stroke-width="2.2" stroke-dasharray="6 5"/>
    <path d="M50 0 V9 M50 91 V100 M0 50 H9 M91 50 H100" stroke="#ffd873" stroke-width="3"/>
  </svg>`,
    { size: 256 },
  );
  const PLUS = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 H20 V12 H30 V20 H20 V30 H12 V20 H2 V12 H12Z" fill="#ffd873" stroke="#fff2c0" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
    { size: 96 },
  );
  const CIRCUIT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="6" fill="#0e151d"/>
    <path d="M6 16 H24 L30 22 H58 M6 32 H36 L42 38 H58 M6 48 H20 L26 42 H58" stroke="#59f2ff" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
    <circle cx="58" cy="22" r="3" fill="#59f2ff"/><circle cx="58" cy="38" r="3" fill="#59f2ff"/><circle cx="58" cy="42" r="2" fill="#59f2ff"/>
  </svg>`,
    { size: 192 },
  );
  const GEARSHAPE = { teeth: 14, module: 0.0035, spokes: 4, bore: 0.003 };
  const GEAR = gearTexture(GEARSHAPE);
  const GEARPLANE = gearSize(GEARSHAPE).plane;

  // ------------------------------------------------------------------ helpers
  const geo = {
    ell: (rx: number, ry: number, rz: number, ws = 10, hs = 7) => new THREE.SphereGeometry(1, ws, hs).scale(rx, ry, rz),
    box: (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d),
    cyl: (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n),
  };
  const put = (g: THREE.BufferGeometry, color: any, at: V3 | THREE.Vector3, bone: any, o: any = {}) =>
    b.part(g, color, { at, bone, flat: true, ...o });
  const prof = (pts: [number, number][], add = 0) => (t: number) => {
    if (t <= pts[0][0]) return pts[0][1] + add;
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) {
        const [t0, r0] = pts[i - 1];
        const [t1, r1] = pts[i];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0) + add;
      }
    }
    return pts[pts.length - 1][1] + add;
  };
  const bump = (t: number, a: number, c: number) => {
    const u = (t - a) / (c - a);
    return u <= 0 || u >= 1 ? 0 : Math.min(1, Math.sin(Math.PI * u) * 2.2);
  };

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.12, 0.005],
      [0, 1.3, 0.012],
      [0, 1.5, 0],
    ]),
    { parent: hips, role: "spine" },
  );
  const sp0 = spine.joints[0];
  const sp1 = spine.joints[1];
  const sp2 = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, 0],
      [0, 1.6, 0.012],
      [0, 1.7, 0.025],
    ]),
    { parent: sp2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.7, 0.025], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.745, 0.0], aim: [0, 1.725, 0.12], role: "jaw" });

  // ------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 0.9, 0.0], w: 0.3, h: 0.2 },
      { at: [0, 1.0, 0.0], w: 0.34, h: 0.21 },
      { at: [0, 1.18, 0.005], w: 0.28, h: 0.19 },
      { at: [0, 1.36, 0.015], w: 0.34, h: 0.23 },
      { at: [0, 1.5, 0.0], w: 0.36, h: 0.2 },
      { at: [0, 1.58, -0.005], w: 0.16, h: 0.14 },
    ],
    { bone: [hips, spine], color: SUIT, caps: "flat" },
  );
  const vest = b.loft(
    [
      { at: [0, 1.2, 0.0], w: 0.3, h: 0.225 },
      { at: [0, 1.3, 0.012], w: 0.37, h: 0.255 },
      { at: [0, 1.42, 0.01], w: 0.4, h: 0.27 },
      { at: [0, 1.52, 0.0], w: 0.36, h: 0.22 },
      { at: [0, 1.56, 0.0], w: 0.2, h: 0.15 },
    ],
    { bone: [hips, spine], color: ARMOR, caps: "flat" },
  );
  glow(
    b.decal(vest, EMBLEM, { at: [0, 1.4, 0.19], dir: [0, 0, 1], size: [0.11, 0.11] }),
    1.1,
  );
  const vestSkin = b.surface(vest);
  b.sweep(vestSkin.loop([0, 1.25, 0], { lift: 0.004 }), 0.012, { color: C.teal, bone: sp0 });
  for (const s of [1, -1]) {
    b.sweep(
      vestSkin.drape(
        catmull([
          [s * 0.11, 1.55, 0.05],
          [s * 0.13, 1.4, 0.13],
          [s * 0.11, 1.24, 0.12],
        ]),
        { lift: 0.006 },
      ),
      0.012,
      { color: C.teal, bone: sp2 },
    );
  }
  // belt, buckle
  const beltPath = b.surface(torso).loop([0, 1.06, 0], { lift: 0.01 });
  b.sweep(beltPath, 0.022, { color: LEATHER, bone: hips });
  put(geo.cyl(0.04, 0.04, 0.02, 6), C.gold, [0, 1.06, 0.135], hips, { dir: [0, 0, 1] });
  put(geo.cyl(0.025, 0.025, 0.012, 6), C.dark, [0, 1.06, 0.147], hips, { dir: [0, 0, 1] });
  glow(put(geo.cyl(0.014, 0.014, 0.008, 6), C.glowG, [0, 1.06, 0.153], hips, { dir: [0, 0, 1] }), 1);
  // tabard cloth
  put(geo.box(0.2, 0.4, 0.014), "#ffffff", [0, 0.84, 0.145], hips, { texture: TABARD, rotation: [-6, 0, 0], flat: false });
  put(geo.box(0.22, 0.34, 0.014), "#ffffff", [0, 0.86, -0.14], hips, { texture: TABARD, rotation: [6, 0, 0], flat: false });
  // collar
  b.lathe(
    [
      [0.05, 0],
      [0.092, 0],
      [0.086, 0.05],
      [0.062, 0.078],
      [0.052, 0.06],
    ],
    { at: [0, 1.52, 0], bone: neck.joints[0], color: ARMOR, segments: 10 },
  );
  b.lathe(
    [
      [0.058, 0.0],
      [0.096, 0.0],
      [0.096, 0.012],
      [0.058, 0.012],
    ],
    { at: [0, 1.52, 0], bone: neck.joints[0], color: C.teal, segments: 10 },
  );
  b.sweep(neck, [0.05, 0.045], { color: SKIN });

  // ------------------------------------------------------------------ backpack (med-tech emitter)
  put(geo.box(0.26, 0.3, 0.1), ARMOR, [0, 1.3, -0.19], sp1);
  put(geo.box(0.275, 0.04, 0.11), TEALP, [0, 1.46, -0.19], sp1);
  put(geo.box(0.275, 0.03, 0.11), TEALP, [0, 1.16, -0.19], sp1);
  for (const s of [1, -1]) {
    put(geo.cyl(0.04, 0.04, 0.3, 8), STEEL, [s * 0.085, 1.32, -0.275], sp1);
    glow(put(geo.cyl(0.044, 0.044, 0.05, 8), C.glowG, [s * 0.085, 1.36, -0.275], sp1), 1);
    put(geo.cyl(0.044, 0.044, 0.02, 8), C.gold, [s * 0.085, 1.2, -0.275], sp1);
    put(geo.cyl(0.044, 0.044, 0.02, 8), C.gold, [s * 0.085, 1.47, -0.275], sp1);
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      at: [0, 1.31, -0.2425],
      dir: [0, 0, -1],
      axis: "z",
      bone: sp1,
      texture: CIRCUIT,
    }),
    1,
  );
  for (const s of [1, -1]) {
    const tip: V3 = [s * (0.1 + 0.03 * (s > 0 ? 1 : 0)), s > 0 ? 1.78 : 1.66, -0.26];
    b.rod([s * 0.09, 1.46, -0.2], tip, 0.006, { color: C.dark, bone: sp1 });
    glow(put(geo.ell(0.014, 0.014, 0.014, 6, 4), C.glowC, tip, sp1), 1.4);
  }
  glow(put(geo.cyl(0.05, 0.05, 0.04, 12), C.glowC, [0, 1.1, -0.25], sp0, { dir: [0, 0, -1] }), 1);
  put(geo.cyl(0.062, 0.062, 0.03, 12), C.dark, [0, 1.1, -0.235], sp0, { dir: [0, 0, -1] });

  // ------------------------------------------------------------------ hip gear
  for (const s of [1, -1]) {
    put(geo.ell(0.04, 0.09, 0.1), ARMOR, [s * 0.17, 0.97, 0.0], hips);
    put(geo.box(0.014, 0.05, 0.09), C.teal, [s * 0.205, 0.97, 0.0], hips);
  }
  // left satchel with cross
  put(geo.box(0.07, 0.13, 0.12), LEATHER, [0.2, 0.87, 0.02], hips);
  put(geo.box(0.074, 0.05, 0.125), TEALP, [0.2, 0.93, 0.02], hips);
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    at: [0.2375, 0.88, 0.02],
    dir: [1, 0, 0],
    axis: "z",
    bone: hips,
    texture: CROSS,
  });
  // right canisters
  for (let i = 0; i < 3; i++) {
    const z = -0.04 + i * 0.045;
    put(geo.cyl(0.02, 0.02, 0.1, 8), "#cfe9f0", [-0.2, 0.86, z], hips);
    glow(put(geo.cyl(0.015, 0.015, 0.08, 8), C.glowG, [-0.2, 0.86, z], hips), 1);
    put(geo.cyl(0.022, 0.022, 0.015, 8), C.gold, [-0.2, 0.915, z], hips);
    put(geo.cyl(0.022, 0.022, 0.015, 8), C.gold, [-0.2, 0.805, z], hips);
  }
  put(geo.box(0.04, 0.03, 0.17), LEATHER, [-0.195, 0.93, 0.0], hips);

  // ------------------------------------------------------------------ legs
  const LEGP: [number, number][] = [
    [0, 0.082],
    [0.3, 0.068],
    [0.5, 0.056],
    [0.62, 0.057],
    [0.85, 0.043],
    [1, 0.037],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.105, 0.96, 0], [s * 0.125, 0.115, -0.005], [0.46, 0.42], [0, 0, 1]) as THREE.Vector3[];
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.125, 0, 0.05],
    });
    const ankle = leg.tip!;
    const knee = leg.joints[1];
    b.sweep(leg, prof(LEGP), { color: SUIT });
    // greave
    b.sweep(leg, (t) => prof(LEGP)(t) + 0.016 * bump(t, 0.55, 0.97), {
      from: 0.55,
      to: 0.97,
      color: ARMOR,
      section: { ngon: 6 },
    });
    // thigh band
    b.sweep(leg, (t) => prof(LEGP)(t) + 0.01 * bump(t, 0.12, 0.2), { from: 0.12, to: 0.2, color: C.teal });
    const K = pts[1];
    put(geo.ell(0.056, 0.066, 0.04), ARMOR, [K.x, K.y, K.z + 0.06], knee);
    put(geo.ell(0.03, 0.035, 0.02), C.teal, [K.x, K.y - 0.005, K.z + 0.092], knee);
    // boot
    const x = s * 0.125;
    const toe = b.joint(`toe${side}`, {
      parent: ankle,
      at: [x, 0.05, 0.11],
      aim: [x, 0.04, 0.2],
      role: "digit",
    });
    b.frustumBox([x, 0.05, -0.075], [x, 0.05, 0.11], [0.105, 0.1], [0.1, 0.092], { color: BOOT, bone: ankle });
    b.frustumBox([x, 0.012, -0.08], [x, 0.012, 0.11], [0.11, 0.024], [0.105, 0.024], { color: C.dark, bone: ankle });
    b.frustumBox([x, 0.046, 0.11], [x, 0.04, 0.215], [0.1, 0.092], [0.082, 0.062], { color: BOOT, bone: toe });
    b.frustumBox([x, 0.012, 0.11], [x, 0.012, 0.225], [0.105, 0.024], [0.085, 0.024], { color: C.dark, bone: toe });
    put(geo.ell(0.044, 0.032, 0.04), ARMOR, [x, 0.04, 0.2], toe);
    put(geo.cyl(0.062, 0.066, 0.07, 10), TEALP, [x, 0.15, 0.0], ankle);
    put(geo.box(0.05, 0.06, 0.03), ARMOR, [x, 0.07, -0.085], ankle);
  }

  // ------------------------------------------------------------------ arms
  const ARMP: [number, number][] = [
    [0, 0.058],
    [0.25, 0.05],
    [0.5, 0.043],
    [0.7, 0.044],
    [1, 0.032],
  ];
  const fingerChain = (name: string, parent: any, pts: THREE.Vector3[], r0: number, color: any) => {
    const names = [1, 2, 3, 4].map((k) => `${name}_${k}`);
    const ch = b.chain(name, pts, { parent, names, role: "digit" });
    b.sweep(ch, [r0, r0 * 0.72], { color, sides: 6 });
    return ch;
  };
  const band = (chain: any, t: number, extra: number, h: number, color: any, str = 1) =>
    glow(
      b.part(geo.cyl(prof(ARMP)(t) + extra, prof(ARMP)(t) + extra, h, 10), color, { frame: chain.at(t), flat: true }),
      str,
    );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, { parent: sp2, at: [s * 0.05, 1.5, -0.01], aim: [s * 0.2, 1.505, 0] });
    const S: V3 = [s * 0.22, 1.5, 0];
    const T: V3 = s > 0 ? [0.4, 0.985, 0.05] : [-0.36, 1.1, 0.19];
    const pts = limb(S, T, [0.3, 0.27], [s * 0.4, 0, -1]) as THREE.Vector3[];
    const arm = b.chain(`arm${side}`, pts, {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const tip = arm.tip!;
    const E = pts[1];
    const W = pts[2];

    // pauldron
    const D = new THREE.Vector3(s * 0.235, 1.545, 0);
    const dome = put(
      new THREE.SphereGeometry(1, 10, 6, 0, TAU, 0, Math.PI * 0.52).scale(0.115, 0.075, 0.105),
      ARMOR,
      D,
      shoulder,
      { rotation: [0, 0, -s * 22] },
    );
    put(geo.cyl(0.115, 0.115, 0.02, 12), s > 0 ? C.dark : C.teal, D.clone().add(new THREE.Vector3(0, -0.005, 0)), shoulder, {
      rotation: [0, 0, -s * 22],
    });
    if (s > 0) {
      glow(put(geo.cyl(0.119, 0.119, 0.008, 12), C.glowC, D.clone().add(new THREE.Vector3(s * 0.004, -0.02, 0)), shoulder, { rotation: [0, 0, -s * 22] }), 1);
    }
    b.decal(dome, CROSS, { at: [D.x + s * 0.09, D.y + 0.045, 0], dir: [s, 0.5, 0], size: [0.06, 0.06] });

    if (s > 0) {
      // ---------------- cyborg left arm
      b.sweep(arm, prof(ARMP), { color: STEEL });
      b.sweep(arm, (t) => prof(ARMP)(t) + 0.016 * bump(t, 0.54, 0.94), {
        from: 0.54,
        to: 0.95,
        color: ARMOR,
        section: { ngon: 6 },
      });
      band(arm, 0.14, 0.008, 0.016, C.glowC, 1);
      band(arm, 0.34, 0.008, 0.016, C.glowC, 1);
      band(arm, 0.5, 0.012, 0.02, C.glowC, 1.2);
      band(arm, 0.97, 0.01, 0.016, C.glowC, 1.2);
      put(geo.ell(0.05, 0.05, 0.05, 8, 6), IRON, E, elbow);
      glow(put(geo.cyl(0.03, 0.03, 0.095, 8), C.glowC, E, elbow, { dir: [1, 0, 0] }), 0.8);
      b.part(new THREE.PlaneGeometry(GEARPLANE, GEARPLANE), TINT.steel, {
        at: arm.at(0.22).at.clone().add(new THREE.Vector3(0.056, 0, 0)),
        dir: [1, 0, 0],
        axis: "z",
        bone: shoulder,
        texture: GEAR,
      });
      glow(
        b.part(new THREE.PlaneGeometry(0.06, 0.1), "#ffffff", {
          at: arm.at(0.75).at.clone().add(new THREE.Vector3(0.06, 0, 0.0)),
          dir: [1, 0, 0],
          axis: "z",
          bone: elbow,
          texture: CIRCUIT,
        }),
        0.9,
      );
      for (const dz of [0.025, -0.025]) {
        const A = arm.at(0.58).at.clone().add(new THREE.Vector3(0.05, 0, dz));
        const B2 = arm.at(0.9).at.clone().add(new THREE.Vector3(0.05, 0, dz));
        b.rod(A, B2, 0.006, { color: IRON, bone: elbow });
        put(geo.ell(0.01, 0.01, 0.01, 6, 4), C.gold, A, elbow);
      }
      // open cyber hand
      const hd = W.clone().sub(E).normalize();
      const fwd = new THREE.Vector3(0, 0, 1);
      const sd = fwd.clone().addScaledVector(hd, -fwd.dot(hd)).normalize();
      const inw = new THREE.Vector3(-s, 0, 0);
      inw.addScaledVector(hd, -inw.dot(hd)).normalize();
      const palmC = W.clone().addScaledVector(hd, 0.058);
      b.part(geo.box(0.04, 0.115, 0.08), BLUED, { bone: tip, at: palmC, quat: aim(hd, sd), flat: true });
      glow(
        b.part(geo.box(0.006, 0.05, 0.04), C.glowC, {
          bone: tip,
          at: palmC.clone().addScaledVector(inw, 0.021),
          quat: aim(hd, sd),
          flat: true,
        }),
        1,
      );
      for (let i = 0; i < 4; i++) {
        const base = palmC.clone().addScaledVector(hd, 0.058).addScaledVector(sd, (i - 1.5) * 0.02);
        const spread = (i - 1.5) * 0.1;
        const k = 1 + 0.12 * (1 - Math.abs(i - 1.5) / 1.5);
        const lens = [0.04 * k, 0.03 * k, 0.024 * k];
        const curls = [0.08, 0.2, 0.35];
        const p: THREE.Vector3[] = [base];
        curls.forEach((c, j) => {
          const d = hd
            .clone()
            .multiplyScalar(Math.cos(c))
            .addScaledVector(inw, Math.sin(c))
            .addScaledVector(sd, spread)
            .normalize();
          p.push(p[j].clone().addScaledVector(d, lens[j]));
        });
        const ch = fingerChain(`finger${side}${i + 1}`, tip, p, 0.0105, STEEL);
        glow(put(geo.ell(0.009, 0.009, 0.009, 6, 4), C.glowC, p[3], ch.tip!), 1.2);
      }
      {
        const base = palmC.clone().addScaledVector(sd, 0.036).addScaledVector(hd, 0.01);
        const dirs = [
          hd.clone().multiplyScalar(0.55).addScaledVector(sd, 0.8).addScaledVector(inw, 0.15),
          hd.clone().multiplyScalar(0.6).addScaledVector(sd, 0.6).addScaledVector(inw, 0.35),
          hd.clone().multiplyScalar(0.65).addScaledVector(sd, 0.4).addScaledVector(inw, 0.55),
        ].map((d) => d.normalize());
        const lens = [0.036, 0.028, 0.024];
        const p: THREE.Vector3[] = [base];
        dirs.forEach((d, j) => p.push(p[j].clone().addScaledVector(d, lens[j])));
        const ch = fingerChain(`thumb${side}`, tip, p, 0.012, STEEL);
        glow(put(geo.ell(0.009, 0.009, 0.009, 6, 4), C.glowC, p[3], ch.tip!), 1.2);
      }
    } else {
      // ---------------- organic right arm, armoured gauntlet, fist on the staff
      b.sweep(arm, prof(ARMP), { color: SUIT });
      b.sweep(arm, (t) => prof(ARMP)(t) + 0.016 * bump(t, 0.52, 0.97), {
        from: 0.52,
        to: 0.97,
        color: ARMOR,
        section: { ngon: 6 },
      });
      band(arm, 0.6, 0.02, 0.016, C.teal, 1);
      band(arm, 0.9, 0.02, 0.016, C.teal, 1);
      put(geo.ell(0.052, 0.055, 0.05, 8, 6), ARMOR, [E.x, E.y, E.z - 0.02], elbow);
      band(arm, 0.18, 0.01, 0.018, C.teal, 1);
      const CX = -0.36;
      const CY = 1.1;
      const CZ = 0.34;
      put(geo.box(0.045, 0.105, 0.085), SKIN, [CX + 0.022, CY, CZ - 0.085], tip, { flat: false });
      for (let i = 0; i < 4; i++) {
        const y = CY + (i - 1.5) * 0.026;
        const p = [-50, -110, -175, -240].map((a) => {
          const r = 0.034;
          return new THREE.Vector3(CX + r * Math.cos((a * Math.PI) / 180), y, CZ + r * Math.sin((a * Math.PI) / 180));
        });
        fingerChain(`finger${side}${i + 1}`, tip, p, 0.0115, SKIN);
      }
      const th = [-60, -10, 40, 90].map((a) => {
        const r = 0.034;
        return new THREE.Vector3(CX + r * Math.cos((a * Math.PI) / 180), CY + 0.075, CZ + r * Math.sin((a * Math.PI) / 180));
      });
      fingerChain(`thumb${side}`, tip, th, 0.013, SKIN);

      // ---------------- healing staff (rides the right wrist)
      const sb = tip;
      put(geo.cyl(0.02, 0.012, 0.07, 8), C.goldD, [CX, 0.035, CZ], sb);
      b.rod([CX, 0.07, CZ], [CX, 1.74, CZ], 0.02, { color: ARMOR, bone: sb });
      for (const y of [0.3, 0.55, 0.8, 1.42, 1.58]) put(geo.cyl(0.026, 0.026, 0.04, 10), TEALP, [CX, y, CZ], sb);
      put(geo.cyl(0.025, 0.025, 0.26, 8), LEATHER, [CX, CY, CZ], sb);
      put(geo.cyl(0.03, 0.03, 0.02, 10), C.gold, [CX, CY + 0.14, CZ], sb);
      put(geo.cyl(0.03, 0.03, 0.02, 10), C.gold, [CX, CY - 0.14, CZ], sb);
      glow(put(geo.cyl(0.024, 0.024, 0.14, 8), C.glowC, [CX, 1.25 + 0.4, CZ], sb), 0.8);
      put(geo.cyl(0.042, 0.03, 0.04, 10), GILT, [CX, 1.74, CZ], sb);
      put(geo.cyl(0.028, 0.03, 0.2, 8), GILT, [CX, 1.85, CZ], sb);
      for (const sg of [1, -1]) {
        const path = spiral([CX, 1.76, CZ], [CX + sg * 0.05, 1.76, CZ], [0, 1, 0], { turns: 1.4, r1: 0.05, pitch: 0.15 });
        b.sweep(path, [0.013, 0.007], { color: GILT, bone: sb });
        const hp = path.at(1);
        put(geo.ell(0.018, 0.016, 0.022, 6, 5), GILT, hp, sb);
        glow(put(geo.ell(0.004, 0.004, 0.004, 4, 3), C.glowC, hp.clone().add(new THREE.Vector3(0, 0.008, 0.012)), sb), 1);
      }
      for (let k = 0; k < 4; k++) {
        const th2 = (45 + 90 * k) * (Math.PI / 180);
        const c = Math.cos(th2);
        const sn = Math.sin(th2);
        b.sweep(
          bezier(
            [CX + 0.032 * c, 1.93, CZ + 0.032 * sn],
            [CX + 0.095 * c, 2.0, CZ + 0.095 * sn],
            [CX + 0.045 * c, 2.095, CZ + 0.045 * sn],
          ),
          [0.011, 0.004],
          { color: GILT, bone: sb },
        );
      }
      glow(put(new THREE.IcosahedronGeometry(0.058, 1), C.glowY, [CX, 2.03, CZ], sb), 1.5);
      b.spike([CX, 2.105, CZ], [0, 1, 0], 0.06, 0.01, { color: GILT, bone: sb });
      // wings
      for (const sg of [1, -1]) {
        for (let i = 0; i < 6; i++) {
          const a = (8 + i * 13) * (Math.PI / 180);
          const len = 0.3 - i * 0.028;
          const w = 0.045;
          const outline: [number, number, "sharp"?][] = [
            [0, -w * 0.4],
            [len * 0.35, -w * 0.75],
            [len * 0.8, -w * 0.45],
            [len, 0, "sharp"],
            [len * 0.75, w * 0.55],
            [len * 0.3, w * 0.7],
            [0, w * 0.4],
          ].map((q) => (q.length === 3 ? [q[0], q[1], "sharp"] : [q[0], q[1]])) as any;
          b.extrude(outline as any, {
            at: [CX + sg * 0.04, 1.9 + i * 0.002, CZ + i * 0.002],
            x: [sg * Math.cos(a), Math.sin(a), 0],
            y: [-sg * Math.sin(a), Math.cos(a), 0],
            thickness: 0.01,
            bevel: 0.002,
            bone: sb,
            color: paint((_p, _n, sc) => mix("#ffffff", "#ffd873", smoothstep(0.5, 1, sc[0] / len))),
          });
        }
      }
      glow(b.cards([frame([CX, 2.03 - 0.14, CZ], [0, 1, 0])], HALO, { size: [0.28, 0.28], lean: 0, bone: sb }), 1.1);
      const pluses: V3[] = [
        [CX + 0.2, 2.18, CZ + 0.03],
        [CX - 0.22, 2.08, CZ - 0.02],
        [CX + 0.08, 2.32, CZ - 0.03],
        [CX - 0.1, 2.24, CZ + 0.05],
        [CX + 0.26, 1.96, CZ - 0.05],
        [CX - 0.3, 1.95, CZ + 0.04],
      ];
      glow(
        b.cards(pluses.map((p) => frame(p, [0, 1, 0])), PLUS, { size: 0.05, lean: 0, bone: sb, vary: 0.3, rng: rng(5) }),
        1.3,
      );
    }
  }

  // ------------------------------------------------------------------ head
  const cranium = put(geo.ell(0.106, 0.108, 0.12, 12, 8), SKIN, [0, 1.815, 0.025], head, { flat: false });
  const midface = put(geo.ell(0.088, 0.075, 0.085, 12, 8), SKIN, [0, 1.77, 0.062], head, { flat: false });
  put(geo.ell(0.075, 0.052, 0.085, 12, 8), SKIN, [0, 1.7, 0.066], jaw, { flat: false });
  put(geo.ell(0.04, 0.03, 0.035, 8, 6), SKIN, [0, 1.68, 0.12], jaw, { flat: false });
  for (const s of [1, -1]) {
    put(geo.ell(0.03, 0.025, 0.03, 8, 6), SKIN, [s * 0.058, 1.768, 0.1], head, { flat: false });
    put(geo.ell(0.014, 0.034, 0.026, 8, 6), SKIN, [s * 0.1, 1.79, 0.0], head, { flat: false });
    b.rod([s * 0.02, 1.842, 0.136], [s * 0.078, 1.85, 0.108], 0.007, { color: C.brow, bone: head });
  }
  put(new THREE.ConeGeometry(0.02, 0.055, 5), SKIN, [0, 1.774, 0.122], head, { dir: [0, -0.3, 1], flat: false });
  // mouth
  put(geo.ell(0.05, 0.012, 0.04, 8, 4), C.mouth, [0, 1.735, 0.1], head, { flat: false });
  put(geo.box(0.05, 0.008, 0.012), "#f4efe6", [0, 1.738, 0.126], head);
  put(geo.box(0.048, 0.007, 0.012), "#f4efe6", [0, 1.73, 0.124], jaw);
  put(geo.ell(0.028, 0.008, 0.012, 8, 4), C.lip, [0, 1.743, 0.139], head, { flat: false });
  put(geo.ell(0.026, 0.008, 0.012, 8, 4), C.lip, [0, 1.726, 0.136], jaw, { flat: false });
  // eyes
  b.decal([cranium, midface], EYE_H, {
    at: [-0.043, 1.806, 0.14],
    dir: [0, 0, 1],
    size: [0.052, 0.034],
    mirror: false,
  });
  glow(
    b.decal([cranium, midface], EYE_C, { at: [0.043, 1.806, 0.14], dir: [0, 0, 1], size: [0.052, 0.034], mirror: true }),
    1.4,
  );
  // cyber cheek plate, headset
  b.decal([cranium, midface], PLATE, { at: [0.095, 1.775, 0.05], dir: [1, 0, 0], size: [0.1, 0.085] });
  put(geo.cyl(0.04, 0.04, 0.03, 10), ARMOR, [0.116, 1.79, 0.0], head, { dir: [1, 0, 0] });
  glow(put(geo.cyl(0.026, 0.026, 0.036, 10), C.glowC, [0.116, 1.79, 0.0], head, { dir: [1, 0, 0] }), 1);
  b.rod([0.12, 1.81, -0.015], [0.105, 1.93, -0.07], 0.006, { color: C.dark, bone: head });
  glow(put(geo.ell(0.012, 0.012, 0.012, 6, 4), C.glowC, [0.105, 1.935, -0.07], head), 1.4);
  glow(put(geo.box(0.02, 0.012, 0.03), C.glowC, [0.0, 1.66, 0.004], head), 1);

  // hair
  const cap = put(
    new THREE.SphereGeometry(1, 10, 8, 0, TAU, 0, 1.85).scale(0.12, 0.118, 0.13),
    HAIR,
    [0, 1.826, 0.018],
    head,
    { rotation: [-26, 0, 0] },
  );
  const hairHits = b.surface(cap).scatter(80, {
    rng: rng(21),
    minDist: 0.02,
    filter: (h) => h.n.y > -0.1 || h.at.z < -0.05,
  });
  b.cards(hairHits, HAIR_TEX, { size: [0.034, 0.09], lean: 62, bend: 25, flow: [0, -0.35, -1], vary: 0.3, spin: 20, rng: rng(22) });
  for (const x of [-0.075, -0.04, 0, 0.04, 0.075]) {
    const ax = Math.abs(x);
    const f = 1 - ax * 4.5;
    const p0: V3 = [x, 1.895 - ax * 0.3, 0.118 - ax * 0.5];
    const p1: V3 = [x * 1.05, 1.97 + 0.07 * f, 0.11 - ax * 0.4];
    const p2: V3 = [x * 1.2, 1.99 + 0.05 * f, -0.04];
    const p3: V3 = [x * 1.45, 1.88, -0.19 - 0.02 * f];
    b.sweep(bezier(p0, p1, p2, p3), (t) => [0.034 * (1 - t) + 0.006, 0.016 * (1 - t) + 0.004], {
      color: HAIR,
      bone: head,
      caps: { start: "round", end: "point" },
    });
  }
  for (const x of [-0.035, 0, 0.035]) {
    b.sweep(
      bezier([x, 1.87, -0.12], [x * 1.4, 1.8, -0.27], [x * 2, 1.68, -0.31], [x * 2.4, 1.56, -0.28]),
      (t) => [0.026 * (1 - t) + 0.005, 0.014 * (1 - t) + 0.004],
      { color: HAIR, bone: head, caps: { start: "round", end: "point" } },
    );
  }
  put(geo.cyl(0.02, 0.02, 0.04, 6), C.teal, [0, 1.84, -0.17], head, { dir: [0, -0.2, 1] });

  return b.root;
}
```