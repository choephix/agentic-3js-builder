```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  DEG,
  vec,
  catmull,
  bezier,
  limb,
  grain,
  mottle,
  scales,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { gearGeometry, gaugeTexture, metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Ironforge-style dwarf rifleman: barrel chest, huge spiked pauldrons, braided ginger beard, steel helm and a brass-and-oak blunderbuss with glowing runes.",
};

// ------------------------------------------------------------------------------------------------
// Palette
const INK = "#16100d";
const GOLD = "#e8b83c";
const GOLD_D = "#a97a1c";
const BLUE = "#2b52ad";
const BLUE_D = "#1c377e";
const RED = "#b53a2c";
const TEETH = "#efe6cf";
const MOUTH = "#5b1f1c";
const NOSE = "#cf6a55";
const SHIRT = "#d8c9a4";
const CYAN = "#5fd8ff";

const STEEL = metal("steel", { tarnish: 0.15 });
const DARK_STEEL = metal("iron");
const BRASS = metal("brass");
const GILT = metal("gilt");
const BRONZE = metal("bronze", { verdigris: 0.12 });
const ENAMEL = mottle("#3157b3", "#25459a", { size: 0.07, seed: 4 });
const LEATHER = mottle("#76492b", "#5a341e", { size: 0.05, seed: 2 });
const DARK_LEATHER = mottle("#47291a", "#32190f", { size: 0.04, seed: 8 });
const CLOTH = mottle("#5e5240", "#4d4234", { size: 0.04, seed: 11 });
const WOOL_BLUE = mottle("#2d4f9e", "#233f84", { size: 0.035, seed: 12 });
const WOOD = grain("#92592f", "#6a3b1c", { size: 0.012, axis: "z", seed: 3 });
const FUR = mottle("#e4e2da", "#aeb0ac", { size: 0.03, seed: 6 });
const HORN = mottle("#ddcfa6", "#9a8460", { size: 0.04, seed: 7 });
const MAIL = scales(["#8d96a6", "#7b8494"], "#3b414d", { size: 0.017, width: 0.22, seed: 5 });

const JERKIN = paint((p) => (p.y > 0.985 ? SHIRT : p.x > -0.004 && p.x < 0.004 && p.z > 0.1 ? DARK_LEATHER : LEATHER));

const SKIN = paint((p, n) => {
  const m = noise(p, 0.06, 3);
  const flush = smoothstep(0.45, 0.8, noise(p, 0.05, 9)) * 0.35;
  const base = mix("#d99467", "#e8b088", smoothstep(0.2, 0.8, m));
  return mix(base, "#c8553f", flush + 0.12 * smoothstep(0.1, 0.9, 0.2 - n.y));
});

const BEARD = paint((p, n) => {
  const t = smoothstep(1.06, 0.66, p.y);
  const streak = noise(new THREE.Vector3(p.x * 9, p.y * 1.2, p.z * 9), 0.1, 14);
  let c = mix("#8e3414", "#d4601f", t * 0.7 + streak * 0.4);
  c = mix(c, "#f0a040", smoothstep(0.62, 0.85, streak) * 0.55);
  return mix(c, "#5a1e0c", 0.25 * smoothstep(0.2, -0.8, n.y));
});

// Tabard drawn by paint on the hanging cloth (s = outline metres)
const TABARD = paint((_p, _n, s) => {
  const x = s[0];
  const y = s[1];
  const bottom = -0.19 - 0.065 * (1 - Math.min(1, Math.abs(x) / 0.095));
  const edge = Math.min(0.095 - Math.abs(x), -y, y - bottom);
  if (edge < 0.012) return GOLD;
  if (edge < 0.017) return BLUE_D;
  const cy = y + 0.1;
  const r = Math.hypot(x, cy);
  const ang = Math.atan2(cy, x);
  const cog = r < 0.046 && r > 0.036 && Math.cos(ang * 8) > 0;
  if (r < 0.012 || (r > 0.026 && r < 0.036) || cog) return GOLD;
  if ((Math.abs(x) < 0.005 || Math.abs(cy) < 0.005) && r < 0.03) return GOLD;
  return mix(BLUE, "#223f87", noise(new THREE.Vector3(x * 3, y * 3, 0), 0.05, 5));
});

// ------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="a"><path d="M4 34 Q50 -6 96 34 Q50 62 4 34Z"/></clipPath></defs>
  <path d="M4 34 Q50 -6 96 34 Q50 62 4 34Z" fill="#f4ecd8"/>
  <g clip-path="url(#a)">
    <circle cx="50" cy="32" r="19" fill="#3d8fd8"/>
    <circle cx="50" cy="38" r="19" fill="#7fc4f2" opacity="0.5"/>
    <circle cx="50" cy="32" r="19" fill="none" stroke="#1b4f86" stroke-width="3"/>
    <circle cx="50" cy="32" r="8.5" fill="#0c0a0c"/>
    <circle cx="43" cy="25" r="5" fill="#ffffff"/>
    <circle cx="57" cy="39" r="2.4" fill="#ffffff"/>
  </g>
  <path d="M4 34 Q50 62 96 34" fill="none" stroke="#2a1812" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M3 35 Q50 -12 97 35" fill="none" stroke="#1b110c" stroke-width="9" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const LOCK = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#6e250f"/><stop offset="0.5" stop-color="#c4561c"/><stop offset="1" stop-color="#f2a444"/></linearGradient></defs>
  <path d="M20 0 Q38 40 34 100 L6 100 Q2 40 20 0Z" fill="url(#g)"/>
  <path d="M20 10 Q23 50 18 100" stroke="#8a3412" stroke-width="2.4" fill="none"/>
  <path d="M26 30 Q29 60 26 96" stroke="#f6b858" stroke-width="1.6" fill="none"/>
</svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#8f918c"/><stop offset="0.6" stop-color="#d6d6d0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M20 0 Q36 30 34 80 L6 80 Q4 30 20 0Z" fill="url(#g)"/>
  <path d="M12 80 Q12 40 20 8 M28 80 Q28 40 22 12" stroke="#a5a7a2" stroke-width="1.6" fill="none"/>
</svg>`,
  { size: 128 },
);

function runeStrip(n: number, color: string, shadow: string, seed: number, extra = "") {
  const r = rng(seed);
  const w = 20;
  const h = 40;
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = 10 + i * w;
    d += `M${x} 6 V${h - 6} `;
    const k = 1 + Math.floor(r() * 3);
    for (let j = 0; j < k; j++) {
      const y = 8 + r() * (h - 22);
      const dir = r() < 0.5 ? -1 : 1;
      d += `M${x} ${y.toFixed(1)} L${x + dir * 7} ${(y + 7 + r() * 6).toFixed(1)} `;
    }
  }
  const vb = `0 0 ${n * w + 10} ${h}`;
  return svg(
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${extra}
    <path d="${d}" stroke="${shadow}" stroke-width="6.4" stroke-linecap="round" fill="none"/>
    <path d="${d}" stroke="${color}" stroke-width="3.4" stroke-linecap="round" fill="none"/></svg>`,
    { size: 512 },
  );
}
const RUNES_GOLD = runeStrip(6, GOLD, "#5a3a08", 31);
const RUNES_GLOW = runeStrip(5, CYAN, "#1c6fa8", 77);

const BADGE = svg(
  `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 8 H74 V54 Q74 86 40 96 Q6 86 6 54Z" fill="#2b52ad" stroke="#e8b83c" stroke-width="5" stroke-linejoin="round"/>
  <path d="M14 16 H66 V52 Q66 78 40 87 Q14 78 14 52Z" fill="none" stroke="#1c377e" stroke-width="3"/>
  <path d="M40 14 L52 28 H28Z" fill="#e8b83c"/>
  <path d="M22 38 H58 Q64 38 64 44 H54 L50 50 H46 V60 H56 V68 H24 V60 H34 V50 H30 Q22 50 22 44Z" fill="#f2c94c" stroke="#6b4a10" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const BUCKLE = svg(
  `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="54" height="44" rx="8" fill="#e8b83c" stroke="#7a5412" stroke-width="4"/>
  <circle cx="30" cy="25" r="14" fill="#2b52ad" stroke="#7a5412" stroke-width="3"/>
  <path d="M22 20 H38 Q41 20 41 23 H36 L34 26 H32 V31 H37 V34 H23 V31 H28 V26 H26 Q22 26 22 23Z" fill="#f2c94c"/>
</svg>`,
  { size: 192 },
);

const GAUGE = gaugeTexture({ needle: 40, label: "PWDR" });

// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });
  const S = [1, -1] as const;
  const L = (s: number) => (s > 0 ? "L" : "R");
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- placement helpers (all in absolute model space; bone always explicit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const P = (geo: THREE.BufferGeometry, color: any, at: any, bone: Joint, o: any = {}) =>
    b.part(geo, color, { at, bone, flat: true, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bx = (w: number, h: number, d: number, color: any, at: any, bone: Joint, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, bone, o);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Sp = (r: number, color: any, at: any, bone: Joint, scale: number[] = [1, 1, 1], o: any = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), color, at, bone, { scale, ...o });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cy = (r0: number, r1: number, h: number, sides: number, color: any, at: any, bone: Joint, dir?: any, o: any = {}) =>
    P(new THREE.CylinderGeometry(r0, r1, h, sides), color, at, bone, dir ? { dir, ...o } : o);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ring = (r: number, tube: number, color: any, at: any, bone: Joint, dir: any, seg = 12) =>
    P(new THREE.TorusGeometry(r, tube, 5, seg), color, at, bone, { dir, axis: "z" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tube = (pts: number[][], r: any, color: any, bone: Joint, o: any = {}) =>
    b.sweep(catmull(pts), r, { color, bone, ...o });

  // ============================================================================================
  // SKELETON
  const hips = b.joint("hips", { at: [0, 0.52, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, 0],
      [0, 0.68, 0.01],
      [0, 0.86, 0.025],
      [0, 1.0, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.99, 0.04], dir: [0, 1, 0.25], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0.06], dir: [0, 1, 0.05], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.045, 0.0], dir: [0, 0, 1], role: "jaw" });

  // ============================================================================================
  // TORSO
  const torso = b.loft(
    [
      { at: [0, 0.44, 0.0], w: 0.34, h: 0.26 },
      { at: [0, 0.6, 0.03], w: 0.42, h: 0.32 },
      { at: [0, 0.76, 0.03], w: 0.46, h: 0.33 },
      { at: [0, 0.92, 0.02], w: 0.58, h: 0.32 },
      { at: [0, 1.02, 0.04], w: 0.4, h: 0.24 },
    ],
    { bone: [spine, hips], color: JERKIN, caps: { start: "flat", end: "round" }, name: "torso" },
  );
  const torsoSurf = b.surface(torso);

  // neck
  b.capsule([0, 0.97, 0.03], [0, 1.04, 0.05], 0.095, { color: SKIN, bone: neck });

  // belt, buckle
  const beltPath = torsoSurf.loop([0, 0.585, 0.03], { dir: [0, 1, 0], lift: 0.02 });
  b.sweep(beltPath, 0.028, { section: "box", color: DARK_LEATHER, bone: chest });
  const bHit = torsoSurf.ray([0, 0.585, 1], [0, 0, -1]);
  const bAt = bHit ? bHit.at.clone() : v3(0, 0.585, 0.19);
  const bN = bHit ? bHit.n.clone() : v3(0, 0, 1);
  const bk = bAt.clone().addScaledVector(bN, 0.05);
  Bx(0.09, 0.075, 0.016, GILT, bk, chest);
  b.part(new THREE.PlaneGeometry(0.08, 0.066), "#ffffff", {
    at: bAt.clone().addScaledVector(bN, 0.0605),
    dir: bN,
    axis: "z",
    texture: BUCKLE,
    bone: chest,
  });
  // belt studs
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 1.25;
    if (Math.abs(a) < 0.18) continue;
    const hh = torsoSurf.ray([Math.sin(a) * 1.0, 0.585, Math.cos(a) * 1.0], [-Math.sin(a), 0, -Math.cos(a)]);
    if (hh) Sp(0.011, GILT, hh.at.clone().addScaledVector(hh.n, 0.048), chest);
  }

  // hanging blue tabard below the belt
  const yAx = v3(0, 0.894, -0.447);
  b.extrude(
    [
      [-0.095, 0],
      [0.095, 0],
      [0.095, -0.19],
      [0, -0.255, "sharp"],
      [-0.095, -0.19],
    ],
    { at: [0, 0.56, 0.2], x: [1, 0, 0], y: yAx, thickness: 0.012, bevel: 0.003, color: TABARD, bone: hips },
  );
  // side flaps (leather faulds)
  for (const s of S) {
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.055, -0.13],
        [0, -0.17, "sharp"],
        [-0.055, -0.13],
      ],
      { at: [s * 0.2, 0.57, 0.04], x: [0, 0, 1], y: [s * 0.35, 1, 0], thickness: 0.012, color: DARK_LEATHER, bone: hips },
    );
  }

  // bandolier with cartridges
  const strap = torsoSurf.drape(
    catmull([
      [-0.22, 1.01, 0.02],
      [-0.12, 0.9, 0.2],
      [0.02, 0.78, 0.25],
      [0.17, 0.67, 0.23],
      [0.25, 0.6, 0.1],
    ]),
    { lift: 0.016 },
  );
  b.sweep(strap, 0.02, { section: { ngon: 6 }, color: DARK_LEATHER, bone: chest });
  b.along(strap, 7, (at) => {
    Cy(0.017, 0.017, 0.07, 6, BRASS, at.moved({ forward: 0.03 }), chest);
    Cy(0.0175, 0.0175, 0.022, 6, RED, at.moved({ forward: 0.03, up: 0.04 }), chest);
  });

  // fur collar
  const collar = P(new THREE.TorusGeometry(0.19, 0.055, 6, 12), FUR, [0, 0.995, 0.03], chest, {
    rotation: [90, 0, 0],
    scale: [1, 0.85, 1],
  });
  const furHits = b.surface(collar).scatter(70, { rng: rng(21), minDist: 0.03 });
  b.cards(furHits, TUFT, { size: [0.055, 0.075], lean: 50, bend: 15, vary: 0.3, rng: rng(22), flow: [0, -1, 0.2] });

  // backpack and bedroll
  Bx(0.3, 0.34, 0.13, LEATHER, [0, 0.78, -0.21], chest);
  Bx(0.31, 0.07, 0.15, DARK_LEATHER, [0, 0.96, -0.205], chest);
  Cy(0.065, 0.065, 0.4, 8, WOOL_BLUE, [0, 1.03, -0.23], chest, [1, 0, 0]);
  for (const s of S) {
    Ring(0.068, 0.009, DARK_LEATHER, [s * 0.12, 1.03, -0.23], chest, [1, 0, 0]);
    Bx(0.03, 0.04, 0.012, GILT, [s * 0.12, 1.03, -0.3], chest);
    Bx(0.04, 0.2, 0.012, DARK_LEATHER, [s * 0.1, 0.78, -0.282], chest);
    Bx(0.04, 0.16, 0.014, DARK_LEATHER, [s * 0.14, 0.9, -0.15], chest, { rotation: [0, 0, s * 12] });
  }
  b.part(new THREE.PlaneGeometry(0.17, 0.21), "#ffffff", {
    at: [0, 0.78, -0.2785],
    dir: [0, 0, -1],
    axis: "z",
    texture: BADGE,
    bone: chest,
  });
  // tin cup on the pack
  Cy(0.04, 0.032, 0.07, 8, STEEL, [0.17, 0.68, -0.25], chest);
  Ring(0.025, 0.006, STEEL, [0.205, 0.68, -0.25], chest, [1, 0, 0], 8);

  // powder horn at left hip
  const horn = b.sweep(
    bezier([0.28, 0.63, -0.02], [0.36, 0.53, -0.06], [0.33, 0.38, -0.12], [0.24, 0.33, -0.2]),
    [0.042, 0.008],
    { color: HORN, bone: hips, caps: { start: "flat", end: "point" } },
  );
  void horn;
  Cy(0.046, 0.046, 0.03, 8, GILT, [0.28, 0.635, -0.02], hips, [-0.1, 1, 0.1]);
  tube(
    [
      [0.28, 0.65, -0.02],
      [0.22, 0.75, 0.0],
      [0.14, 0.62, 0.0],
    ],
    0.01,
    DARK_LEATHER,
    hips,
  );
  // coin pouch right hip
  Sp(0.065, LEATHER, [-0.21, 0.52, -0.08], hips, [1, 1.1, 0.9]);
  Bx(0.05, 0.03, 0.03, GILT, [-0.21, 0.575, -0.04], hips);
  // powder gauge left front
  Cy(0.05, 0.05, 0.016, 12, BRASS, [0.2, 0.52, 0.17], hips, [0.5, 0, 1]);
  b.part(new THREE.CircleGeometry(0.043, 16), "#ffffff", {
    at: [0.2 + 0.5 * 0.0105 * 0.894, 0.52, 0.17 + 0.0105 * 0.894],
    dir: [0.5, 0, 1],
    axis: "z",
    texture: GAUGE,
    bone: hips,
  });

  // ============================================================================================
  // LEGS
  for (const s of S) {
    const side = L(s);
    const pts = limb([s * 0.15, 0.53, 0], [s * 0.17, 0.11, 0.05], [0.25, 0.25], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.1],
    });
    b.sweep(
      leg,
      (t) => 0.108 - 0.03 * t,
      {
        bands: [
          [0.5, CLOTH],
          [1, DARK_LEATHER],
        ],
      },
    );
    const knee = leg.joints[1];
    const foot = leg.joints[2];
    const kp = pts[1];
    const shin = pts[2].clone().sub(kp).normalize();
    // boot cuff + knee guard
    Cy(0.088, 0.104, 0.075, 8, LEATHER, kp.clone().addScaledVector(shin, 0.05), knee, shin);
    Ring(0.099, 0.007, GILT, kp.clone().addScaledVector(shin, 0.012), knee, shin, 10);
    Sp(0.075, STEEL, kp.clone().add(v3(0, 0.01, 0.085)), knee, [1, 0.95, 0.5]);
    Sp(0.016, GILT, kp.clone().add(v3(0, 0.01, 0.12)), knee);
    // boot
    Bx(0.17, 0.12, 0.2, DARK_LEATHER, [s * 0.17, 0.06, 0.07], foot);
    Sp(1, DARK_LEATHER, [s * 0.17, 0.055, 0.16], foot, [0.088, 0.062, 0.095]);
    Bx(0.19, 0.03, 0.34, DARK_STEEL, [s * 0.17, 0.015, 0.1], foot);
    Bx(0.16, 0.03, 0.06, DARK_STEEL, [s * 0.17, 0.045, -0.03], foot);
    // boot straps
    for (const yy of [0.075, 0.1]) Bx(0.176, 0.016, 0.205, LEATHER, [s * 0.17, yy, 0.068], foot);
    Bx(0.03, 0.03, 0.018, GILT, [s * 0.17, 0.088, 0.175], foot);
    Bx(0.025, 0.024, 0.02, GILT, [s * 0.17, 0.12, 0.12], foot);
  }

  // ============================================================================================
  // ARMS
  const armSide: Record<string, { chain: ReturnType<typeof b.chain>; pts: THREE.Vector3[] }> = {};
  for (const s of S) {
    const side = L(s);
    const sh = v3(s * 0.33, 0.92, 0.0);
    const tgt = s > 0 ? v3(0.62, 0.62, 0.07) : v3(-0.52, 0.62, -0.04);
    const pts = limb(sh, tgt, [0.23, 0.21], [0, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    armSide[side] = { chain: arm, pts };
    b.sweep(arm, (t) => (t < 0.5 ? 0.095 - 0.04 * t : 0.075 - 0.05 * (t - 0.5)), {
      bands: [
        [0.5, MAIL],
        [1, SKIN],
      ],
    });
    // gold cuff at the elbow, leather bracer
    b.sweep(arm, 0.083, { from: 0.55, to: 0.6, color: GILT });
    b.sweep(arm, 0.075, { from: 0.6, to: 0.95, color: LEATHER });
    b.sweep(arm, 0.08, { from: 0.9, to: 0.95, color: GILT });
    const elbow = arm.joints[1];
    Sp(0.062, STEEL, pts[1].clone().add(v3(s * 0.02, 0, -0.045)), elbow, [1, 1, 0.8]);
    Sp(0.014, GILT, pts[1].clone().add(v3(s * 0.02, 0, -0.095)), elbow);

    // pauldron: three stacked blue plates with gold rims and a geared apex
    const sj = arm.joints[0];
    const c0 = sh.clone().add(v3(s * 0.045, 0.03, 0));
    const radii = [0.14, 0.122, 0.104];
    for (let k = 0; k < 3; k++) {
      const dirk = v3(s * (0.55 + 0.35 * k), 1, 0).normalize();
      const ck = c0.clone().add(v3(s * 0.035 * k, -0.055 * k, 0));
      P(new THREE.SphereGeometry(radii[k], 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), ENAMEL, ck, sj, {
        dir: dirk,
        scale: [1, 0.7, 1],
      });
      Ring(radii[k], 0.0095, GILT, ck, sj, dirk, 14);
      if (k === 0) {
        const apex = ck.clone().addScaledVector(dirk, radii[0] * 0.7 + 0.004);
        P(gearGeometry({ teeth: 10, module: 0.0075, thickness: 0.012, bore: 0.006 }), GILT, apex, sj, { dir: dirk });
        P(new THREE.ConeGeometry(0.02, 0.07, 6), GILT, apex.clone().addScaledVector(dirk, 0.04), sj, { dir: dirk });
      } else {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.3;
          const side2 = v3(0, 0, 1).cross(dirk).normalize();
          const fwd = dirk.clone().cross(side2).normalize();
          const rp = ck
            .clone()
            .addScaledVector(side2, Math.cos(a) * radii[k] * 0.86)
            .addScaledVector(fwd, Math.sin(a) * radii[k] * 0.86)
            .addScaledVector(dirk, 0.012);
          Sp(0.009, GILT, rp, sj);
        }
      }
    }
  }

  // ---- open left hand
  function openHand(s: number, wrist: Joint, wp: THREE.Vector3, elbowP: THREE.Vector3) {
    const side = L(s);
    const d = wp.clone().sub(elbowP).normalize();
    const nIn = v3(-s, 0, 0);
    nIn.addScaledVector(d, -nIn.dot(d)).normalize();
    const across = d.clone().cross(nIn).normalize();
    const tdir = across.z >= 0 ? 1 : -1;
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, d, nIn));
    b.part(new THREE.BoxGeometry(0.105, 0.09, 0.05), SKIN, {
      at: wp.clone().addScaledVector(d, 0.05),
      quat: q,
      bone: wrist,
      flat: true,
    });
    const names = ["index", "middle", "ring", "pinky"];
    const offs = [0.038, 0.013, -0.013, -0.036];
    const l1 = [0.044, 0.048, 0.044, 0.036];
    const l2 = [0.036, 0.04, 0.036, 0.03];
    names.forEach((nm, i) => {
      const off = offs[i] * tdir;
      const p0 = wp.clone().addScaledVector(d, 0.095).addScaledVector(across, off);
      const dir1 = d.clone().multiplyScalar(0.9).addScaledVector(nIn, 0.22).addScaledVector(across, off * 2.5).normalize();
      const dir2 = d.clone().multiplyScalar(0.45).addScaledVector(nIn, 0.85).normalize();
      const p1 = p0.clone().addScaledVector(dir1, l1[i]);
      const p2 = p1.clone().addScaledVector(dir2, l2[i]);
      const ch = b.chain(`${nm}${side}`, [p0, p1, p2], {
        parent: wrist,
        names: [`${nm}${side}1`, `${nm}${side}2`],
        role: "digit",
      });
      b.sweep(ch, [0.0165, 0.012], { color: SKIN });
      Sp(0.02, SKIN, p0, wrist, [1, 1, 1], { flat: false });
    });
    const t0 = wp.clone().addScaledVector(d, 0.045).addScaledVector(across, 0.058 * tdir);
    const td1 = d.clone().multiplyScalar(0.6).addScaledVector(across, 0.55 * tdir).addScaledVector(nIn, 0.1).normalize();
    const td2 = d.clone().multiplyScalar(0.9).addScaledVector(across, 0.1 * tdir).addScaledVector(nIn, 0.4).normalize();
    const t1 = t0.clone().addScaledVector(td1, 0.045);
    const t2 = t1.clone().addScaledVector(td2, 0.04);
    const th = b.chain(`thumb${side}`, [t0, t1, t2], {
      parent: wrist,
      names: [`thumb${side}1`, `thumb${side}2`],
      role: "digit",
    });
    b.sweep(th, [0.02, 0.014], { color: SKIN });
  }
  const aL = armSide["L"];
  openHand(1, aL.chain.joints[2], aL.pts[2], aL.pts[1]);
  // gauntlet backplate on the open hand
  Bx(0.09, 0.012, 0.075, STEEL, aL.pts[2].clone().add(v3(0.03, -0.045, 0.0)), aL.chain.joints[2], {
    rotation: [0, 0, 40],
  });

  // ---- right fist around the blunderbuss grip
  const aR = armSide["R"];
  const wristR = aR.chain.joints[2];
  const GX = -0.52;
  const GZ = 0.05;
  const RR = 0.038;
  const ringPt = (a: number, y: number): number[] => [GX + RR * Math.sin(a * DEG), y, GZ + RR * Math.cos(a * DEG)];
  Bx(0.085, 0.095, 0.048, SKIN, [GX, 0.6, 0.0], wristR);
  ["index", "middle", "ring", "pinky"].forEach((nm, i) => {
    const y = [0.636, 0.612, 0.588, 0.564][i];
    const pts = [ringPt(150, y), ringPt(80, y), ringPt(10, y), ringPt(-60, y)];
    const ch = b.chain(`${nm}R`, catmull(pts), {
      parent: wristR,
      names: [`${nm}R1`, `${nm}R2`, `${nm}R3`],
      role: "digit",
    });
    b.sweep(ch, [0.0125, 0.0105], { color: SKIN });
    Sp(0.016, SKIN, pts[0], wristR, [1, 1, 1], { flat: false });
  });
  const thumbR = b.chain(
    "thumbR",
    catmull([
      [GX + 0.025, 0.646, 0.005],
      [GX + 0.045, 0.655, 0.045],
      [GX + 0.025, 0.652, 0.088],
    ]),
    { parent: wristR, names: ["thumbR1", "thumbR2"], role: "digit" },
  );
  b.sweep(thumbR, [0.019, 0.013], { color: SKIN });

  // ============================================================================================
  // BLUNDERBUSS
  const W = v3(-0.52, 0.665, 0.09);
  const gun = b.joint("blunderbuss", { parent: wristR, at: W, dir: [0, 0, 1] });
  const Wp = (x: number, y: number, z: number): number[] => [W.x + x, W.y + y, W.z + z];

  b.extrude(
    [
      [-0.37, 0.05],
      [-0.3, 0.075],
      [0, 0.075],
      [0.34, 0.07],
      [0.34, 0.03],
      [0.08, 0.015],
      [0.02, -0.01],
      [-0.12, -0.015],
      [-0.24, -0.06],
      [-0.34, -0.13],
      [-0.38, -0.12],
    ],
    { at: W, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.046, bevel: 0.006, color: WOOD, bone: gun },
  );
  // grip
  Cy(0.026, 0.031, 0.13, 8, WOOD, [GX, 0.6, GZ], gun);
  Sp(0.036, BRASS, [GX, 0.532, GZ], gun, [1, 0.8, 1]);
  // barrel and flare
  const barrel = b.rod(Wp(0, 0.105, -0.08), Wp(0, 0.105, 0.3), 0.03, { color: STEEL, bone: gun });
  Bx(0.052, 0.058, 0.045, DARK_STEEL, Wp(0, 0.105, -0.095), gun);
  b.lathe(
    [
      [0, 0],
      [0.031, 0],
      [0.04, 0.05],
      [0.07, 0.12],
      [0.088, 0.17],
      [0.075, 0.17],
      [0.055, 0.12],
      [0.02, 0.06],
      [0, 0.05],
    ],
    { at: Wp(0, 0.105, 0.29), axis: [0, 0, 1], segments: 10, color: BRONZE, bone: gun },
  );
  Cy(0.03, 0.03, 0.01, 10, INK, Wp(0, 0.105, 0.342), gun, [0, 0, 1]);
  for (const z of [-0.04, 0.09, 0.22]) Ring(0.034, 0.008, GILT, Wp(0, 0.105, z), gun, [0, 0, 1], 10);
  P(new THREE.ConeGeometry(0.01, 0.03, 5), GILT, Wp(0, 0.145, 0.25), gun);
  // glowing rune inlay on the barrel
  const rune = b.decal(barrel, RUNES_GLOW, {
    at: Wp(0, 0.135, 0.09),
    dir: [0, 1, 0],
    up: [1, 0, 0],
    size: [0.2, 0.05],
    bone: gun,
  });
  glow(rune, 1.5);
  // gilded rune inlay on the stock, both sides
  for (const s of S) {
    b.part(new THREE.PlaneGeometry(0.21, 0.065), "#ffffff", {
      at: Wp(s * 0.0235, 0.012, -0.2),
      dir: [s, 0, 0],
      axis: "z",
      texture: RUNES_GOLD,
      bone: gun,
    });
  }
  // lock, pan, hammer
  Bx(0.008, 0.055, 0.14, BRASS, Wp(-0.026, 0.04, 0.0), gun);
  Bx(0.008, 0.055, 0.14, BRASS, Wp(0.026, 0.04, 0.0), gun);
  tube(
    [
      Wp(-0.036, 0.05, -0.03),
      Wp(-0.036, 0.095, -0.06),
      Wp(-0.036, 0.145, -0.045),
      Wp(-0.036, 0.155, -0.01),
    ],
    0.0075,
    DARK_STEEL,
    gun,
  );
  Bx(0.016, 0.02, 0.02, STEEL, Wp(-0.036, 0.158, 0.0), gun);
  Bx(0.02, 0.012, 0.03, BRASS, Wp(-0.034, 0.083, 0.035), gun);
  Bx(0.02, 0.05, 0.008, STEEL, Wp(-0.034, 0.115, 0.05), gun, { rotation: [-20, 0, 0] });
  // trigger guard + trigger
  tube([Wp(0, -0.012, 0.085), Wp(0, -0.055, 0.09), Wp(0, -0.062, 0.13), Wp(0, -0.02, 0.145)], 0.006, BRASS, gun);
  Bx(0.008, 0.03, 0.01, DARK_STEEL, Wp(0, -0.03, 0.105), gun, { rotation: [-15, 0, 0] });
  // butt plate and pommel
  Bx(0.056, 0.2, 0.014, BRASS, Wp(0, -0.035, -0.382), gun, { rotation: [-3, 0, 0] });
  Bx(0.05, 0.02, 0.05, BRASS, Wp(0, 0.075, -0.34), gun);
  // fore-stock pipes
  for (const z of [0.03, 0.17, 0.3]) Bx(0.04, 0.012, 0.024, BRASS, Wp(0, 0.05, z), gun);

  // ============================================================================================
  // HEAD
  const C = v3(0, 1.1, 0.06);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, {
    bone: head,
    at: C,
    scale: [0.155, 0.15, 0.16],
  });
  const faceSurf = b.surface(skull);

  // jaws
  b.frustumBox([0, 1.04, 0.03], [0, 1.015, 0.19], [0.27, 0.07], [0.2, 0.08], { bone: jaw, color: SKIN });
  Bx(0.1, 0.016, 0.02, TEETH, [0, 1.06, 0.17], jaw);
  b.frustumBox([0, 1.1, 0.06], [0, 1.085, 0.2], [0.22, 0.08], [0.18, 0.08], { bone: head, color: SKIN });
  Bx(0.1, 0.016, 0.02, TEETH, [0, 1.072, 0.2], head);
  Bx(0.14, 0.02, 0.1, MOUTH, [0, 1.065, 0.13], head);

  // nose
  Sp(0.056, NOSE, [0, 1.075, 0.205], head, [1, 0.92, 1], { flat: false });
  for (const s of S) Sp(0.024, NOSE, [s * 0.034, 1.06, 0.19], head, [1, 0.8, 0.9], { flat: false });
  b.frustumBox([0, 1.15, 0.17], [0, 1.09, 0.205], [0.05, 0.03], [0.07, 0.04], { bone: head, color: SKIN });

  // cheeks, brow, ears, eyes
  for (const s of S) {
    Sp(0.052, SKIN, [s * 0.1, 1.058, 0.125], head, [1, 0.8, 0.9], { flat: false });
    b.capsule([s * 0.012, 1.148, 0.205], [s * 0.13, 1.152, 0.12], 0.03, { color: SKIN, bone: head });
    b.capsule([s * 0.012, 1.163, 0.213], [s * 0.138, 1.17, 0.12], 0.022, { color: BEARD, bone: head });
    Sp(0.045, SKIN, [s * 0.155, 1.1, 0.03], head, [0.45, 1, 0.8], { flat: false });
    const hit = faceSurf.around(C).at(s * 22, -2);
    b.decal(skull, EYE, {
      at: hit ?? [s * 0.058, 1.095, 0.21],
      dir: [s * 0.22, 0, 1],
      size: [0.078, 0.047],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
    });
  }

  // hair at the nape
  Sp(0.13, BEARD, [0, 1.07, -0.065], head, [1, 0.9, 0.9], { flat: false });

  // mustache
  b.capsule([-0.06, 1.047, 0.213], [0.06, 1.047, 0.213], 0.03, { color: BEARD, bone: head });
  for (const s of S) {
    tube(
      [
        [s * 0.05, 1.045, 0.215],
        [s * 0.1, 1.03, 0.205],
        [s * 0.15, 1.015, 0.17],
        [s * 0.17, 1.045, 0.12],
      ],
      [0.032, 0.009],
      BEARD,
      head,
      { caps: { start: "round", end: "point" } },
    );
    // sideburns
    tube(
      [
        [s * 0.145, 1.15, 0.0],
        [s * 0.155, 1.08, 0.07],
        [s * 0.135, 1.0, 0.14],
        [s * 0.08, 0.975, 0.2],
      ],
      [0.03, 0.05, 0.045, 0.035],
      BEARD,
      head,
    );
  }

  // main beard
  const beard = b.loft(
    [
      { at: [0, 1.045, 0.15], w: 0.27, h: 0.14 },
      { at: [0, 0.99, 0.2], w: 0.31, h: 0.17 },
      { at: [0, 0.9, 0.235], w: 0.28, h: 0.15 },
      { at: [0, 0.81, 0.245], w: 0.2, h: 0.11 },
      { at: [0, 0.74, 0.25], w: 0.1, h: 0.07 },
    ],
    { bone: jaw, color: BEARD, caps: { start: "flat", end: "point" }, name: "beard" },
  );
  const beardHits = b.surface(beard).scatter(80, { rng: rng(5), minDist: 0.034, filter: (h) => h.n.z > -0.2 });
  b.cards(beardHits, LOCK, {
    size: [0.055, 0.12],
    lean: 75,
    bend: 20,
    vary: 0.25,
    rng: rng(6),
    flow: [0, -1, 0.3],
  });

  // braids
  for (const s of S) {
    const side = L(s);
    const path = catmull([
      [s * 0.085, 0.985, 0.285],
      [s * 0.09, 0.9, 0.315],
      [s * 0.09, 0.8, 0.325],
      [s * 0.088, 0.7, 0.3],
      [s * 0.082, 0.6, 0.24],
    ]);
    const br = b.chain(`braid${side}`, path, {
      parent: jaw,
      names: [`braid${side}1`, `braid${side}2`, `braid${side}3`, `braid${side}4`],
      role: "tail",
    });
    b.sweep(br, [0.028, 0.02], { color: BEARD });
    let flip = 1;
    b.along(br, 11, (at) => {
      flip = -flip;
      P(new THREE.SphereGeometry(1, 6, 4), BEARD, at, jaw, {
        scale: [0.036, 0.05, 0.032],
        rotation: [0, 0, 38 * flip],
      });
    });
    const end = path.at(1);
    Ring(0.027, 0.01, GILT, [end.x, end.y + 0.01, end.z], jaw, [0, 1, 0], 8);
    b.spike(end, [0, -1, 0], 0.1, 0.034, { color: BEARD, bone: jaw });
    for (const k of [-1, 1])
      b.spike(end, [k * 0.3, -1, 0], 0.085, 0.022, { color: BEARD, bone: jaw });
    const mid1 = path.at(0.45);
    Ring(0.027, 0.009, GILT, [mid1.x, mid1.y, mid1.z], jaw, [0, 1, 0], 8);
  }
  // gold beard beads
  for (const s of S) Sp(0.016, GILT, [s * 0.14, 0.96, 0.22], jaw);

  // ============================================================================================
  // HELM
  const HB = v3(0, 1.19, 0.05);
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.174, 0.03],
      [0.162, 0.08],
      [0.125, 0.122],
      [0.065, 0.144],
      [0, 0.15],
    ],
    { at: HB, segments: 12, color: STEEL, bone: head },
  );
  b.lathe(
    [
      [0.16, 0.0],
      [0.25, -0.03],
      [0.262, -0.018],
      [0.17, 0.02],
    ],
    { at: HB, segments: 12, color: DARK_STEEL, bone: head },
  );
  Ring(0.172, 0.011, GILT, [0, 1.2, 0.05], head, [0, 1, 0], 14);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    Sp(0.0085, GILT, [0.19 * Math.sin(a), 1.172, 0.05 + 0.19 * Math.cos(a)], head);
  }
  // crest fin
  b.extrude(
    [
      [-0.16, -0.05],
      [-0.145, 0.03],
      [-0.02, 0.08],
      [0.1, 0.055],
      [0.15, -0.05],
    ],
    { at: [0, 1.3, 0.05], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bevel: 0.005, smoothing: 1, color: ENAMEL, bone: head },
  );
  // geared badge on the brow of the helm
  P(gearGeometry({ teeth: 12, module: 0.0055, thickness: 0.01, bore: 0.004 }), GILT, [0, 1.235, 0.216], head, {
    dir: [0, 0.3, 1],
  });
  Sp(0.012, BLUE, [0, 1.235, 0.226], head);
  // cheek guards
  for (const s of S) {
    b.extrude(
      [
        [-0.06, 0],
        [0.05, 0.01],
        [0.075, -0.06],
        [0.045, -0.125],
        [-0.02, -0.15],
        [-0.07, -0.08],
      ],
      { at: [s * 0.162, 1.17, 0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: STEEL, bone: head },
    );
    Sp(0.009, GILT, [s * 0.172, 1.15, 0.045], head);
    Sp(0.009, GILT, [s * 0.172, 1.1, 0.03], head);
  }

  return b.root;
}
```