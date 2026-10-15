```ts
import * as THREE from "three";
import { createBuilder, rng, mix, noise, paint, smoothstep, grain, svg, catmull } from "agentic-3js-builder";
import type { ColorInput, Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "An open hextech-blue treasure chest with gilded straps and a quilted lid, spilling coins, cut gems and a pearl necklace, with a jewelled crown, three goblets (one tipped over) and glowing crystal clusters, painted in a bold hand-painted fantasy style.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const TAU = Math.PI * 2;
const V3 = THREE.Vector3;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const frac = (x: number) => x - Math.floor(x);

type V = [number, number, number];
type OL = Array<[number, number] | [number, number, "sharp"]>;
type HitLike = { at: THREE.Vector3; n: THREE.Vector3 };

/** Hand-painted three-tone lighting: bright on top/front, saturated mid, warm-dark underneath, plus soft mottling. */
function hand(top: string, mid: string, bot: string, seed = 1, amt = 0.1) {
  return paint((p, n) => {
    const l = Math.max(-1, Math.min(1, n.y * 0.75 + n.z * 0.3 + n.x * 0.1));
    const base = l >= 0 ? mix(mid, top, smoothstep(0, 0.85, l)) : mix(mid, bot, smoothstep(0, 0.8, -l));
    const k = (noise(p, 0.07, seed) - 0.5) * amt * 2;
    const out: Rgb = [clamp01(base[0] + k), clamp01(base[1] + k * 0.85), clamp01(base[2] + k * 0.7)];
    return out;
  });
}

/** SVG star/burst outline path. */
function starPath(cx: number, cy: number, r1: number, r2: number, n: number, rot = 0) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const r = i % 2 === 0 ? r1 : r2;
    d += `${i ? "L" : "M"}${(cx + Math.sin(a) * r).toFixed(2)} ${(cy - Math.cos(a) * r).toFixed(2)}`;
  }
  return d + "Z";
}

/** A cut gem: pointed pavilion at the origin, girdle, crown and table, axis +Y. Flat-shaded by the caller. */
function gemGeo(r: number, h: number, sides = 8) {
  return new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(r, h * 0.55),
      new THREE.Vector2(r, h * 0.66),
      new THREE.Vector2(r * 0.6, h),
      new THREE.Vector2(0.001, h),
    ],
    sides,
  );
}

/** Half-arch outline (z forward, y up) of the chest lid, boxy super-ellipse. */
function archOutline(rz: number, ry: number, n = 12): OL {
  const pts: OL = [];
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * i) / n;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const u = rz * Math.sign(c) * Math.abs(c) ** 0.6;
    const v = i === 0 || i === n ? 0 : ry * s ** 0.6;
    pts.push(i === 0 || i === n ? [i === 0 ? rz : -rz, v, "sharp"] : [u, v]);
  }
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const R = rng(11);

  // Chest dimensions
  const W = 0.96;
  const D = 0.62;
  const CH = 0.42;
  const T = 0.045;

  // ---- Skeleton: one root, one lid hinge --------------------------------------------------------------------
  const root = b.joint("hoard", { at: [0, 0, 0], dir: [0, 1, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, CH, -D / 2], dir: [0, 0, 1], role: "hinge" });

  // ---- Palette ----------------------------------------------------------------------------------------------
  const GOLD = hand("#fff2a8", "#f8bf30", "#a85512", 3, 0.07);
  const GOLD2 = hand("#f7d460", "#dd9a1e", "#7a3e0e", 4, 0.12);
  const PILE = hand("#d99a22", "#a8650f", "#5e300a", 8, 0.18);
  const VELVET = hand("#dd4468", "#a82149", "#5a1030", 6, 0.07);
  const GOLD_FLAT = "#f7c035";
  const RIVET = "#ffe48a";
  const DARKGOLD = "#8a4f10";
  const INK = "#1b1030";
  const PEARL = "#fff4ec";
  const GEMS = ["#e3213f", "#2b6df5", "#19c76b", "#a64be8", "#ffb21c", "#43e8ff", "#ff5fa8"];
  const COIN_TINTS = ["#ffd24a", "#f5b02a", "#ffe27d"];

  const WOOD_BASE = grain(
    hand("#5b70d6", "#3a4cad", "#222d70", 5, 0.06),
    hand("#4a5cc0", "#303f96", "#1c2662", 6, 0.06),
    { size: 0.03, axis: "x", seed: 2 },
  );
  const WOOD = paint((p, n) => {
    const horiz = Math.abs(n.y) > 0.6;
    const f = frac(horiz ? p.x / 0.14 : p.y / 0.105);
    if (f < 0.04) return "#141a48";
    if (f < 0.085) return "#7d93f0";
    return WOOD_BASE;
  });

  // ---- Textures ---------------------------------------------------------------------------------------------
  const COIN_A = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#d9d9d9"/>
      <circle cx="32" cy="32" r="31" fill="#f4f4f4"/>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#9c9c9c" stroke-width="2.4"/>
      <circle cx="32" cy="32" r="24.5" fill="none" stroke="#c4c4c4" stroke-width="2" stroke-dasharray="2.2 3.2"/>
      <path d="M17 41 L19 24 L26 32 L32 19 L38 32 L45 24 L47 41 Z" fill="#cfcfcf" stroke="#7d7d7d" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="17" y="41" width="30" height="5" rx="1.5" fill="#bdbdbd" stroke="#7d7d7d" stroke-width="2"/>
      <circle cx="32" cy="19" r="2.4" fill="#ffffff" stroke="#7d7d7d" stroke-width="1.2"/>
    </svg>`,
    { size: 128 },
  );
  const COIN_B = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#d9d9d9"/>
      <circle cx="32" cy="32" r="31" fill="#f0f0f0"/>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#9c9c9c" stroke-width="2.4"/>
      <path d="${starPath(32, 32, 24, 17, 8)}" fill="#d2d2d2" stroke="#8a8a8a" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M32 18 L42 30 L32 46 L22 30 Z" fill="#fafafa" stroke="#6f6f6f" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M22 30 L42 30 M32 18 L28 30 L32 46 L36 30 Z" fill="none" stroke="#9a9a9a" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const MEDALLION = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#5a2f08"/>
      <circle cx="50" cy="50" r="45" fill="#f6c443"/>
      <circle cx="50" cy="50" r="38" fill="#a8610f"/>
      <circle cx="50" cy="50" r="35.5" fill="#e9a62a"/>
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="#a8610f" stroke-width="2" stroke-dasharray="2.5 3.6"/>
      <path d="${starPath(50, 50, 33, 17, 8)}" fill="#fff0a0" stroke="#5a2f08" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${starPath(50, 50, 22, 12, 8, Math.PI / 8)}" fill="#f2b22c" stroke="#5a2f08" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="12" fill="#0f5a73" stroke="#5a2f08" stroke-width="2.6"/>
      <circle cx="50" cy="50" r="8.5" fill="#35e6ff"/>
      <circle cx="46.5" cy="46.5" r="3.2" fill="#e8ffff"/>
    </svg>`,
    { size: 256 },
  );
  const CREST = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${starPath(50, 50, 48, 36, 12)}" fill="#5a2f08"/>
      <path d="${starPath(50, 50, 45, 34, 12)}" fill="#f6c443"/>
      <circle cx="50" cy="50" r="30" fill="#5a2f08"/>
      <circle cx="50" cy="50" r="27.5" fill="#8a1636"/>
      <circle cx="50" cy="50" r="27.5" fill="none" stroke="#ffd96a" stroke-width="2"/>
      <path d="M30 62 L32 40 L41 50 L50 33 L59 50 L68 40 L70 62 Z" fill="#f8c93a" stroke="#5a2f08" stroke-width="2.6" stroke-linejoin="round"/>
      <rect x="30" y="62" width="40" height="7" rx="2" fill="#e9a62a" stroke="#5a2f08" stroke-width="2.4"/>
      <circle cx="50" cy="33" r="3.4" fill="#fff0a0" stroke="#5a2f08" stroke-width="1.8"/>
      <circle cx="50" cy="65.5" r="2.4" fill="#35e6ff"/>
      <path d="M16 48 Q12 36 22 26 M84 48 Q88 36 78 26" fill="none" stroke="#5a2f08" stroke-width="5" stroke-linecap="round"/>
      <path d="M16 48 Q12 36 22 26 M84 48 Q88 36 78 26" fill="none" stroke="#ffe27a" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const QUILT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="q" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8f1b40"/>
        <path d="M0 8 L8 0 L16 8 L8 16 Z" fill="#b02a54" stroke="#6d1030" stroke-width="1.2" stroke-linejoin="round"/>
        <circle cx="0" cy="0" r="1.6" fill="#ffd45a"/><circle cx="16" cy="0" r="1.6" fill="#ffd45a"/>
        <circle cx="0" cy="16" r="1.6" fill="#ffd45a"/><circle cx="16" cy="16" r="1.6" fill="#ffd45a"/>
        <circle cx="8" cy="8" r="1.3" fill="#ffd45a"/>
      </pattern></defs>
      <rect width="64" height="64" fill="url(#q)"/>
    </svg>`,
    { size: 128 },
  );
  const SPARK = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 2 Q35 29 62 32 Q35 35 32 62 Q29 35 2 32 Q29 29 32 2 Z" fill="#fff4b0"/>
      <path d="M32 14 Q33.5 30.5 50 32 Q33.5 33.5 32 50 Q30.5 33.5 14 32 Q30.5 30.5 32 14 Z" fill="#ffffff"/>
      <circle cx="32" cy="32" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---- Part helpers -----------------------------------------------------------------------------------------
  const P = (geo: THREE.BufferGeometry, color: ColorInput, o: any = {}) => b.part(geo, color, { bone: root, ...o });
  const L = (geo: THREE.BufferGeometry, color: ColorInput, o: any = {}) => b.part(geo, color, { bone: lid, ...o });
  const box = (w: number, h: number, d: number, at: V, color: ColorInput, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const rivet = (at: any, bone: any = root, s = 1) =>
    b.part(new THREE.SphereGeometry(0.011 * s, 6, 4), RIVET, { bone, at, flat: true });
  const randVec = () => new V3(R() - 0.5, R() - 0.5, R() - 0.5);

  // ===============================================================================================================
  // CHEST BODY
  // ===============================================================================================================
  box(W, CH, T, [0, CH / 2, D / 2 - T / 2], WOOD);
  box(W, CH, T, [0, CH / 2, -D / 2 + T / 2], WOOD);
  for (const s of [1, -1]) box(T, CH, D - 2 * T, [s * (W / 2 - T / 2), CH / 2, 0], WOOD);
  box(W - 2 * T, 0.05, D - 2 * T, [0, 0.025, 0], WOOD);

  // velvet lining
  const lh = CH - 0.06;
  const lyc = 0.05 + lh / 2;
  box(W - 2 * T, lh, 0.01, [0, lyc, D / 2 - T - 0.005], VELVET);
  box(W - 2 * T, lh, 0.01, [0, lyc, -D / 2 + T + 0.005], VELVET);
  for (const s of [1, -1]) box(0.01, lh, D - 2 * T, [s * (W / 2 - T - 0.005), lyc, 0], VELVET);
  box(W - 2 * T, 0.01, D - 2 * T, [0, 0.055, 0], VELVET);

  // gold rim round the mouth
  for (const s of [1, -1]) {
    box(W + 0.03, 0.035, T + 0.03, [0, CH - 0.0185, s * (D / 2 - T / 2)], GOLD);
    box(T + 0.03, 0.035, D - 0.02, [s * (W / 2 - T / 2), CH - 0.019, 0], GOLD);
  }

  // corner posts with pyramid caps
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.08, CH, 0.08, [sx * (W / 2), CH / 2, sz * (D / 2)], GOLD);
      P(new THREE.ConeGeometry(0.036, 0.04, 4), GOLD, {
        at: [sx * (W / 2), CH + 0.019, sz * (D / 2)],
        rotation: [0, 45, 0],
        flat: true,
      });
    }

  // base band
  for (const s of [1, -1]) {
    box(W + 0.03, 0.075, 0.025, [0, 0.0475, s * (D / 2 + 0.004)], GOLD);
    box(0.025, 0.075, D + 0.03, [s * (W / 2 + 0.004), 0.0475, 0], GOLD);
  }

  // front & back vertical straps with rivets
  for (const sx of [1, -1]) {
    box(0.1, 0.3, 0.022, [sx * 0.27, 0.235, D / 2 + 0.003], GOLD);
    box(0.1, 0.3, 0.022, [sx * 0.27, 0.235, -D / 2 - 0.003], GOLD);
    for (const y of [0.14, 0.235, 0.33]) rivet([sx * 0.27, y, D / 2 + 0.015]);
    // strap pointed ends (tiny shields) at the top
    P(new THREE.ConeGeometry(0.052, 0.04, 4), GOLD2, {
      at: [sx * 0.27, 0.076, D / 2 + 0.012],
      rotation: [90, 0, 45],
      scale: [1, 0.35, 1],
      flat: true,
    });
  }

  // side medallions
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: root,
      at: [s * (W / 2 + 0.004), 0.24, 0],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      axis: "z",
      texture: MEDALLION,
    });
    for (const z of [-0.2, 0.2]) rivet([s * (W / 2 + 0.01), 0.24, z]);
  }

  // lock plate (shield, keyhole, bezel, ruby)
  const lockY = 0.245;
  b.extrude(
    [
      [-0.085, 0.095],
      [0.085, 0.095],
      [0.098, -0.005],
      [0.05, -0.085],
      [0, -0.12, "sharp"],
      [-0.05, -0.085],
      [-0.098, -0.005],
    ],
    {
      at: [0, lockY, D / 2 + 0.002],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.007,
      smoothing: 1,
      color: GOLD,
      bone: root,
    },
  );
  P(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 10), GOLD2, {
    at: [0, lockY + 0.01, D / 2 + 0.03],
    dir: [0, 0, 1],
  });
  P(new THREE.CylinderGeometry(0.019, 0.019, 0.006, 10), INK, {
    at: [0, lockY + 0.016, D / 2 + 0.034],
    dir: [0, 0, 1],
  });
  b.extrude(
    [
      [-0.008, 0],
      [0.008, 0],
      [0.017, -0.055],
      [-0.017, -0.055],
    ],
    {
      at: [0, lockY + 0.016, D / 2 + 0.031],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: INK,
      bone: root,
    },
  );
  glow(
    P(gemGeo(0.026, 0.036, 8), "#e3213f", {
      at: [0, lockY + 0.078, D / 2 + 0.024],
      dir: [0, 0, 1],
      flat: true,
    }),
    0.55,
  );
  for (const [x, y] of [
    [-0.065, 0.075],
    [0.065, 0.075],
    [-0.04, -0.06],
    [0.04, -0.06],
  ])
    rivet([x, lockY + y, D / 2 + 0.028], root, 0.8);

  // ===============================================================================================================
  // LID (on the hinge joint)
  // ===============================================================================================================
  const RZ = D / 2;
  const RY = 0.2;
  const lidPart = b.extrude(archOutline(RZ, RY), {
    at: [0, CH, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: W - 0.02,
    bevel: 0.012,
    color: WOOD,
    bone: lid,
  });
  // gold end plates and bands
  for (const s of [1, -1]) {
    b.extrude(archOutline(RZ * 1.03, RY * 1.05), {
      at: [s * (W / 2 - 0.0105), CH - 0.002, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: GOLD,
      bone: lid,
    });
    b.extrude(archOutline(RZ * 1.035, RY * 1.07), {
      at: [s * 0.27, CH - 0.002, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.01,
      color: GOLD,
      bone: lid,
    });
    // rivets along the band
    const rp = archOutline(RZ * 1.06, RY * 1.1);
    for (const i of [2, 4, 6, 8, 10]) {
      const [u, v] = rp[i];
      rivet([s * 0.27, CH + v, u], lid);
    }
    // hinge barrels
    L(new THREE.CylinderGeometry(0.027, 0.027, 0.12, 8), GOLD, { at: [s * 0.3, CH, -D / 2], dir: [1, 0, 0] });
    box(0.12, 0.07, 0.012, [s * 0.3, CH - 0.03, -D / 2 - 0.006], GOLD);
  }
  // hasp tongue and its little gem
  b.extrude(
    [
      [-0.045, 0.07],
      [0.045, 0.07],
      [0.05, -0.02],
      [0, -0.09, "sharp"],
      [-0.05, -0.02],
    ],
    {
      at: [0, CH + 0.03, D / 2 + 0.002],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      color: GOLD,
      bone: lid,
    },
  );
  glow(
    L(gemGeo(0.017, 0.025, 6), "#43e8ff", { at: [0, CH + 0.04, D / 2 + 0.01], dir: [0, 0, 1], flat: true }),
    0.7,
  );
  // quilted lining and crest on the lid's underside
  L(new THREE.BoxGeometry(W - 0.16, 0.012, D - 0.12), "#ffffff", { at: [0, CH - 0.005, 0], texture: QUILT });
  for (const s of [1, -1]) {
    L(new THREE.BoxGeometry(W - 0.12, 0.014, 0.022), GOLD2, { at: [0, CH - 0.005, s * (D / 2 - 0.05)] });
    L(new THREE.BoxGeometry(0.022, 0.014, D - 0.1), GOLD2, { at: [s * (W / 2 - 0.07), CH - 0.005, 0] });
  }
  L(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    at: [0, CH - 0.0125, 0],
    dir: [0, -1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: CREST,
  });
  // crest decal on the lid's crown
  b.decal(lidPart, CREST, {
    at: [0, CH + RY, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.36, 0.36],
    bone: lid,
  });

  // ===============================================================================================================
  // PILES
  // ===============================================================================================================
  const hemi = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: ColorInput = PILE) =>
    P(new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, Math.PI / 2), color, {
      at: [x, y, z],
      scale: [sx, sy, sz],
      flat: true,
    });

  const m1 = hemi(0, CH - 0.03, 0, 0.41, 0.2, 0.25);
  const m2 = hemi(0.14, CH - 0.02, 0.04, 0.25, 0.23, 0.18);
  const p1 = hemi(0.15, 0, 0.58, 0.5, 0.2, 0.32);
  const p2 = hemi(0.22, 0.15, 0.27, 0.22, 0.2, 0.2);
  const p3 = hemi(-0.6, 0, 0.18, 0.3, 0.15, 0.32);
  const p4 = hemi(0.72, 0, 0.05, 0.28, 0.13, 0.3);
  const p5 = hemi(0.62, 0, -0.3, 0.3, 0.14, 0.28);
  const p6 = hemi(-0.62, 0, -0.3, 0.3, 0.14, 0.26);

  // ---- coin & gem placement helpers ------------------------------------------------------------------------
  function coin(at: THREE.Vector3, dir: THREE.Vector3, s = 1, kind = 0) {
    const tint = COIN_TINTS[Math.floor(R() * COIN_TINTS.length)];
    return P(new THREE.CylinderGeometry(0.045, 0.045, 0.009, 10), tint, {
      at,
      dir,
      up: randVec().normalize(),
      scale: [s, 1, s],
      texture: kind ? COIN_B : COIN_A,
    });
  }

  function gemOn(h: HitLike, scale = 1) {
    const kind = Math.floor(R() * 3);
    const col = GEMS[Math.floor(R() * GEMS.length)];
    const r = (0.026 + R() * 0.02) * scale;
    const dir = h.n.clone().add(randVec().multiplyScalar(0.8)).normalize();
    if (kind === 1) {
      const part = P(new THREE.OctahedronGeometry(r * 1.1, 0), col, {
        at: h.at.clone().addScaledVector(h.n, r * 0.45),
        dir,
        scale: [1, 1.35, 1],
        flat: true,
      });
      return glow(part, 0.45);
    }
    const hg = r * (kind === 0 ? 1.5 : 2.1);
    const part = P(gemGeo(r, hg, kind === 0 ? 8 : 6), col, {
      at: h.at.clone().addScaledVector(dir, -0.2 * hg),
      dir,
      up: randVec().normalize(),
      flat: true,
    });
    return glow(part, 0.45);
  }

  function dress(
    targets: any,
    coins: number,
    gems: number,
    o: {
      minCoin?: number;
      minGem?: number;
      scale?: [number, number];
      gemScale?: number;
      tilt?: number;
      filter?: (h: HitLike) => boolean;
    } = {},
  ) {
    const skin = b.surface(targets);
    const ok = (h: any) => h.n.y > 0.22 && (o.filter ? o.filter(h) : true);
    const [lo, hi] = o.scale ?? [0.85, 1.1];
    skin.scatter(coins, { rng: R, minDist: o.minCoin ?? 0.05, filter: ok }).forEach((h: any, i: number) => {
      const s = lo + R() * (hi - lo);
      const dir = h.n
        .clone()
        .add(new V3(R() - 0.5, R() * 0.5, R() - 0.5).multiplyScalar(o.tilt ?? 0.8))
        .normalize();
      coin(h.at.clone().addScaledVector(h.n, 0.011 * s), dir, s, i % 2);
    });
    skin.scatter(gems, { rng: R, minDist: o.minGem ?? 0.12, filter: ok }).forEach((h: any) => gemOn(h, o.gemScale ?? 1));
  }

  // ===============================================================================================================
  // GOBLETS
  // ===============================================================================================================
  const GOBLET: [number, number][] = [
    [0, 0],
    [0.055, 0],
    [0.057, 0.012],
    [0.034, 0.022],
    [0.016, 0.05],
    [0.014, 0.085],
    [0.03, 0.1],
    [0.014, 0.116],
    [0.016, 0.14],
    [0.05, 0.172],
    [0.064, 0.215],
    [0.06, 0.268],
    [0.053, 0.268],
    [0.051, 0.22],
    [0.032, 0.19],
    [0, 0.182],
  ];

  function goblet(at: THREE.Vector3, axis: THREE.Vector3, k: number, gemCols: string[], wine?: string) {
    const ax = axis.clone().normalize();
    const paintG = paint((_p, _n, s) => {
      const y = s[0] / k;
      if (Math.abs(y - 0.1) < 0.006 || Math.abs(y - 0.172) < 0.004 || y > 0.262 || y < 0.011) return "#fff0a0";
      if (Math.abs(y - 0.215) < 0.003) return DARKGOLD;
      return GOLD;
    });
    b.lathe(
      GOBLET.map(([x, y]): [number, number] => [x * k, y * k]),
      { at, axis: ax, segments: 10, color: paintG, bone: root },
    );
    // ring of gems round the bowl
    const u = new V3(0, 1, 0).cross(ax);
    if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
    u.normalize();
    const w = ax.clone().cross(u);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const out = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      const pos = at.clone().addScaledVector(ax, 0.2 * k).addScaledVector(out, 0.0585 * k);
      glow(
        P(gemGeo(0.014 * k, 0.02 * k, 6), gemCols[i % gemCols.length], {
          at: pos.clone().addScaledVector(out, -0.004 * k),
          dir: out,
          flat: true,
        }),
        0.5,
      );
    }
    if (wine)
      glow(
        P(new THREE.CylinderGeometry(0.05 * k, 0.05 * k, 0.004, 10), wine, {
          at: at.clone().addScaledVector(ax, 0.254 * k),
          dir: ax,
        }),
        1.0,
      );
  }

  const GA = new V3(-0.6, 0.135, 0.18);
  const GB = new V3(0.72, 0.115, 0.05);
  goblet(GA, new V3(0, 1, 0), 1.0, ["#e3213f", "#2b6df5", "#19c76b"]);
  goblet(GB, new V3(0, 1, 0), 0.9, ["#a64be8", "#43e8ff"], "#38e8ff");
  // gold heaped in the first goblet
  const cup = hemi(GA.x, GA.y + 0.252, GA.z, 0.052, 0.034, 0.052, GOLD2);
  dress(cup, 4, 2, { minCoin: 0.035, minGem: 0.05, scale: [0.5, 0.6], gemScale: 0.55, tilt: 1.2 });

  // tipped goblet on the floor
  const GC = new V3(-0.55, 0.058, 0.78);
  const GCaxis = new V3(0.45, 0.09, 0.75).normalize();
  goblet(GC, GCaxis, 1.0, ["#ffb21c", "#e3213f", "#43e8ff"]);

  // ===============================================================================================================
  // CROWN
  // ===============================================================================================================
  const CQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.22, 0.55, -0.1));
  const CQi = CQ.clone().invert();
  const C0 = new V3(0.14, 0.165, 0.56);
  const kp = (x: number, y: number, z: number) => new V3(x, y, z).applyQuaternion(CQ).add(C0);
  const kd = (x: number, y: number, z: number) => new V3(x, y, z).applyQuaternion(CQ);
  const cl = (p: THREE.Vector3) => p.clone().sub(C0).applyQuaternion(CQi);

  const CROWN_BAND = paint((p, _n) => {
    const q = cl(p);
    const ang = (Math.atan2(q.x, q.z) * 180) / Math.PI;
    const f = frac(ang / 45);
    const dth = Math.min(f, 1 - f) * (Math.PI / 4) * 0.145;
    const m = dth + Math.abs(q.y - 0.045);
    if (Math.abs(m - 0.042) < 0.0035) return "#7a3f0c";
    if (q.y > 0.088 || q.y < 0.012) return "#fff3b0";
    return GOLD;
  });
  const CROWN_CAP = paint((p, _n) => {
    const q = cl(p);
    const ang = (Math.atan2(q.x, q.z) * 180) / Math.PI;
    const f = frac(ang / 45);
    return Math.min(f, 1 - f) < 0.035 ? "#ffd45a" : VELVET;
  });

  b.lathe(
    [
      [0.126, 0],
      [0.142, 0],
      [0.145, 0.012],
      [0.141, 0.07],
      [0.147, 0.085],
      [0.147, 0.095],
      [0.135, 0.095],
      [0.135, 0.085],
      [0.128, 0.07],
      [0.128, 0.012],
    ],
    { at: kp(0, 0, 0), axis: kd(0, 1, 0), segments: 16, color: CROWN_BAND, bone: root },
  );
  b.lathe(
    [
      [0, 0.05],
      [0.128, 0.05],
      [0.126, 0.07],
      [0.1, 0.13],
      [0.05, 0.165],
      [0, 0.175],
    ],
    { at: kp(0, 0, 0), axis: kd(0, 1, 0), segments: 16, color: CROWN_CAP, bone: root },
  );

  const TALL: OL = [
    [-0.034, 0, "sharp"],
    [0.034, 0, "sharp"],
    [0.032, 0.04],
    [0.02, 0.09],
    [0, 0.15, "sharp"],
    [-0.02, 0.09],
    [-0.032, 0.04],
  ];
  const SHORT: OL = [
    [-0.03, 0, "sharp"],
    [0.03, 0, "sharp"],
    [0.034, 0.03],
    [0.026, 0.06],
    [0.01, 0.082],
    [-0.01, 0.082],
    [-0.026, 0.06],
    [-0.034, 0.03],
  ];
  const bigGems = ["#e3213f", "#2b6df5", "#19c76b", "#a64be8"];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const tall = i % 2 === 0;
    b.extrude(tall ? TALL : SHORT, {
      at: kp(sx * 0.143, 0.07, cz * 0.143),
      x: kd(cz, 0, -sx),
      y: kd(0, 1, 0),
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: GOLD,
      bone: root,
    });
    if (tall) {
      glow(
        P(gemGeo(0.017, 0.028, 6), bigGems[(i / 2) % 4], {
          at: kp(sx * 0.143, 0.07 + 0.15, cz * 0.143),
          dir: kd(0, 1, 0),
          flat: true,
        }),
        0.5,
      );
    } else {
      P(new THREE.SphereGeometry(0.017, 8, 6), PEARL, { at: kp(sx * 0.143, 0.07 + 0.088, cz * 0.143) });
    }
    // band jewels
    const out = kd(sx, 0, cz);
    const r = tall ? (i === 0 ? 0.034 : 0.027) : 0.017;
    const pos = kp(sx * 0.147, 0.045, cz * 0.147);
    P(new THREE.CylinderGeometry(r * 1.4, r * 1.4, 0.01, 8), GOLD2, {
      at: pos.clone().addScaledVector(out, -0.004),
      dir: out,
    });
    glow(
      P(gemGeo(r, r * 1.35, 8), tall ? bigGems[(i / 2) % 4] : i % 4 === 1 ? "#ffb21c" : "#43e8ff", {
        at: pos.clone().addScaledVector(out, -0.004),
        dir: out,
        flat: true,
      }),
      0.55,
    );
  }
  // crossing arches, orb and cross
  for (const phi of [0, Math.PI / 2]) {
    const dx = Math.sin(phi);
    const dz = Math.cos(phi);
    const prof: [number, number][] = [
      [-0.143, 0.09],
      [-0.128, 0.17],
      [-0.085, 0.235],
      [-0.03, 0.277],
      [0, 0.284],
      [0.03, 0.277],
      [0.085, 0.235],
      [0.128, 0.17],
      [0.143, 0.09],
    ];
    b.sweep(catmull(prof.map(([r, h]) => kp(dx * r, h, dz * r))), 0.0095, {
      color: GOLD,
      bone: root,
      sides: 6,
    });
  }
  P(new THREE.SphereGeometry(0.026, 8, 6), GOLD, { at: kp(0, 0.298, 0) });
  P(new THREE.BoxGeometry(0.011, 0.05, 0.011), GOLD, { at: kp(0, 0.346, 0), dir: kd(0, 1, 0), up: kd(0, 0, 1) });
  P(new THREE.BoxGeometry(0.036, 0.011, 0.011), GOLD, { at: kp(0, 0.352, 0), dir: kd(0, 1, 0), up: kd(0, 0, 1) });

  // ===============================================================================================================
  // DRESS THE PILES: coins + gems
  // ===============================================================================================================
  dress([m1, m2, p2], 70, 8, { minCoin: 0.05, minGem: 0.11 });
  dress(p1, 70, 7, {
    minCoin: 0.05,
    minGem: 0.12,
    filter: (h) => Math.hypot(h.at.x - C0.x, h.at.z - C0.z) > 0.16,
  });
  dress(p3, 32, 4, {
    minCoin: 0.052,
    filter: (h) => Math.hypot(h.at.x - GA.x, h.at.z - GA.z) > 0.08,
  });
  dress(p4, 30, 4, {
    minCoin: 0.052,
    filter: (h) => Math.hypot(h.at.x - GB.x, h.at.z - GB.z) > 0.08,
  });
  dress(p5, 28, 3, { minCoin: 0.052, filter: (h) => Math.hypot(h.at.x - 0.62, h.at.z + 0.3) > 0.1 });
  dress(p6, 28, 3, { minCoin: 0.052, filter: (h) => Math.hypot(h.at.x + 0.62, h.at.z + 0.3) > 0.1 });

  // ===============================================================================================================
  // HEXTECH CRYSTAL CLUSTERS
  // ===============================================================================================================
  function crystal(base: V3Like, dir: V, r: number, h: number, body: string, tip: string) {
    const d = new V3(dir[0], dir[1], dir[2]).normalize();
    const bp = new V3(base[0], base[1], base[2]);
    const hb = h * 0.68;
    const ht = h * 0.32;
    glow(
      P(new THREE.CylinderGeometry(r, r * 1.08, hb, 6), body, {
        at: bp.clone().addScaledVector(d, hb / 2),
        dir: d,
        flat: true,
      }),
      0.55,
    );
    glow(
      P(new THREE.ConeGeometry(r, ht, 6), tip, {
        at: bp.clone().addScaledVector(d, hb + ht / 2),
        dir: d,
        flat: true,
      }),
      1.0,
    );
  }
  type V3Like = [number, number, number];
  const cluster: Array<[V, V, number, number]> = [
    [[0, 0, 0], [0.18, 1, -0.08], 0.06, 0.56],
    [[-0.09, 0, 0.07], [-0.25, 1, 0.18], 0.045, 0.36],
    [[0.1, 0, 0.09], [0.4, 1, 0.15], 0.04, 0.3],
    [[0.08, 0, -0.09], [0.3, 1, -0.3], 0.035, 0.26],
    [[-0.1, 0, -0.06], [-0.35, 1, -0.1], 0.03, 0.2],
  ];
  for (const [o, d, r, h] of cluster) {
    crystal([0.62 + o[0], 0.115, -0.3 + o[2]], d, r, h, "#1aa6de", "#8ff6ff");
    crystal([-0.62 - o[0], 0.115, -0.3 + o[2]], [-d[0], d[1], d[2]], r * 0.95, h * 0.9, "#6a3de0", "#d2b4ff");
  }

  // ===============================================================================================================
  // FLOOR COINS: stacks, rolling coin, spill from the tipped goblet
  // ===============================================================================================================
  const stack = (x: number, z: number, n: number, s = 1) => {
    for (let i = 0; i < n; i++)
      coin(new V3(x + (R() - 0.5) * 0.008, 0.0045 + i * 0.0092, z + (R() - 0.5) * 0.008), new V3(0, 1, 0), s, i % 2);
  };
  stack(0.55, 0.98, 9);
  stack(0.68, 0.9, 5);
  stack(0.46, 1.04, 3);
  coin(new V3(0.2, 0.045, 1.0), new V3(0.5, 0, 0.86).normalize(), 1, 0);

  const mouth = GC.clone().addScaledVector(GCaxis, 0.265);
  const axH = new V3(GCaxis.x, 0, GCaxis.z).normalize();
  const perp = new V3(-axH.z, 0, axH.x);
  for (let i = 0; i < 18; i++) {
    const d = 0.04 + R() * 0.34;
    const lat = (R() - 0.5) * (0.07 + d * 0.55);
    const pos = mouth.clone().addScaledVector(axH, d).addScaledVector(perp, lat);
    pos.y = 0.0045 + (i % 3) * 0.0092;
    const dir = new V3((R() - 0.5) * 0.25, 1, (R() - 0.5) * 0.25).normalize();
    coin(pos, dir, 0.95 + R() * 0.15, i % 2);
  }
  for (let i = 0; i < 3; i++) {
    const d = 0.1 + R() * 0.3;
    const pos = mouth.clone().addScaledVector(axH, d).addScaledVector(perp, (R() - 0.5) * 0.2);
    pos.y = 0.012;
    gemOn({ at: pos, n: new V3(0, 1, 0) }, 0.9);
  }

  // ===============================================================================================================
  // PEARL NECKLACE draped over the front pile
  // ===============================================================================================================
  const neckSkin = b.surface(p1);
  const rough = catmull([
    [-0.12, 0.16, 0.3],
    [-0.22, 0.14, 0.45],
    [-0.2, 0.1, 0.62],
    [-0.1, 0.08, 0.78],
    [-0.04, 0.08, 0.84],
  ]);
  const chain = neckSkin.drape(rough, { lift: 0.014 });
  b.sweep(chain, 0.0045, { color: GOLD_FLAT, bone: root, sides: 5 });
  b.along(chain, 12, (it: any) => b.part(new THREE.SphereGeometry(0.014, 6, 5), PEARL, { bone: root, at: it.at }));
  const pend = chain.at(0.55) as any;
  glow(
    P(gemGeo(0.03, 0.05, 8), "#e3213f", {
      at: new V3(pend.x ?? pend.at.x, (pend.y ?? pend.at.y) - 0.004, pend.z ?? pend.at.z),
      dir: [0, 1, 0],
      flat: true,
    }),
    0.55,
  );

  // ===============================================================================================================
  // SPARKLES: glowing glints standing on the gold
  // ===============================================================================================================
  const glintHits = b.surface([p1, p3, p4, m1]).scatter(14, {
    rng: R,
    minDist: 0.22,
    filter: (h: any) => h.n.y > 0.4 && Math.hypot(h.at.x - C0.x, h.at.z - C0.z) > 0.18,
  });
  glow(
    b.cards(glintHits, SPARK, {
      size: 0.09,
      lean: 15,
      cross: true,
      vary: 0.3,
      spin: 180,
      rng: R,
      bone: root,
    }),
    1.2,
  );

  // ===============================================================================================================
  // Open the lid
  // ===============================================================================================================
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  return b.root;
}
```