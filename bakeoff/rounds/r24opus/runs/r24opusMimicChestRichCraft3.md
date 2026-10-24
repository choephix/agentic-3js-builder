```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  noise,
  cells,
  mix,
  smoothstep,
  mottle,
  spots,
  gradient,
  svg,
  catmull,
  polyline,
  frame,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Treasure-Chest Mimic",
  description:
    "A D&D treasure-chest mimic: an iron-bound, gilt-cornered oak chest whose lid is a fanged upper jaw with angry glowing eyes and an arcane forehead sigil, a flesh-lined mouth full of coins, gems and a gnawed bone, a long sticky tongue lolling out with coins stuck to it, and four crab-like flesh legs bursting through the wood.",
};

// ---------------------------------------------------------------------------------------------------------------
// Proportions (meters). The chest box is the lower jaw, the lid is the upper jaw hinged at the back.

const W = 0.92; // chest width (x)
const D = 0.6; // chest depth (z)
const Y0 = 0.15; // bottom of the box, lifted by the legs
const BH = 0.4; // box height
const YT = Y0 + BH; // rim height
const T = 0.04; // wall thickness
const FH = 0.12; // lid front face height
const DOME = 0.14; // lid dome rise above the front face
const LA = D / 2; // lid half depth
const LC = YT + FH; // dome spring line
const MF = YT - 0.13; // mouth floor (flesh) height
const OPEN = 40; // lid open angle, degrees
const RAD = Math.PI / 180;
const RE = 0.06; // eyeball radius
const EYE_X = 0.2;
const EYE_Y = YT + 0.068;
const BAND_X = 0.31; // iron bands and straps

// Palette
const WOOD_L = "#b9783e";
const WOOD_D = "#6a3a1a";
const WOOD_DD = "#3a1e0c";
const SEAM = "#1a0c05";
const GRIME = "#2c2418";
const CLAW = "#2b1810";
const VEIN = "#4e0c2c";
const BONE = "#e8dcc0";
const LEATHER = "#4a2a18";
const SPIT = "#d4ecf6";

type Col = string | Paint;

const HINGE = new THREE.Vector3(0, YT, -D / 2);
const XA = new THREE.Vector3(1, 0, 0);
const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
/** A closed-lid point moved to where the open lid carries it. */
const openP = (p: number[]) => V(p).sub(HINGE).applyAxisAngle(XA, -OPEN * RAD).add(HINGE);
/** A closed-lid direction turned with the open lid. */
const openD = (d: number[]) => V(d).applyAxisAngle(XA, -OPEN * RAD).normalize();

/** A point on the lid dome (closed pose) at angle th (0 = front, PI = back), lifted out along its normal. */
function lidAt(x: number, th: number, lift = 0) {
  const z = LA * Math.cos(th);
  const y = LC + DOME * Math.sin(th);
  const nz = Math.cos(th) / LA;
  const ny = Math.sin(th) / DOME;
  const l = Math.hypot(nz, ny);
  return { p: [x, y + (ny / l) * lift, z + (nz / l) * lift], n: [0, ny / l, nz / l] };
}

/** The lid's outer profile at x: front face, dome, back face (closed pose). */
function lidLine(x: number, lift: number, steps = 18): number[][] {
  const pts: number[][] = [[x, YT + 0.003, LA + lift]];
  for (let i = 0; i <= steps; i++) pts.push(lidAt(x, (i / steps) * Math.PI, lift).p);
  pts.push([x, YT + 0.003, -LA - lift]);
  return pts;
}

/** A closed rounded rectangle at height y: rims, gums, bands. */
function roundRect(y: number, hw: number, hd: number, r: number, k = 3) {
  const cs = [
    [hw - r, hd - r, 0],
    [-(hw - r), hd - r, 90],
    [-(hw - r), -(hd - r), 180],
    [hw - r, -(hd - r), 270],
  ];
  const pts: number[][] = [];
  for (const [cx, cz, a0] of cs)
    for (let j = 0; j <= k; j++) {
      const a = (a0 + (90 * j) / k) * RAD;
      pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    }
  return polyline(pts, { closed: true });
}

const hash1 = (k: number, s: number) => {
  const v = Math.sin(k * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const sc = new THREE.Vector3();

/** Weathered oak planks: per-plank tone, grain streaks, knots, dark seams, grime low down, warm top light. */
function planks(coord: (p: THREE.Vector3) => number, size: number, seed: number, grime: boolean) {
  return paint((p, n) => {
    const v = coord(p) / size;
    const k = Math.floor(v);
    const f = v - k;
    const tone = hash1(k, seed);
    let c = mix(WOOD_D, WOOD_L, 0.2 + 0.6 * tone);
    if (Math.abs(n.x) > 0.7) sc.set(p.z * 0.12 + k * 1.7, p.y * 1.6, p.x * 1.6);
    else sc.set(p.x * 0.12 + k * 1.7, p.y * 1.6, p.z * 1.6);
    const g = noise(sc, 0.01, seed);
    c = mix(c, WOOD_DD, smoothstep(0.5, 0.78, g) * 0.55);
    c = mix(c, WOOD_L, smoothstep(0.42, 0.2, g) * 0.25);
    const knot = cells(p, 0.18, seed + k);
    if (knot.id < 0.3) {
      c = mix(c, WOOD_DD, smoothstep(0.14, 0.05, knot.d1) * 0.85);
      c = mix(c, SEAM, smoothstep(0.05, 0.02, knot.d1));
    }
    const edge = Math.min(f, 1 - f) * size;
    if (edge < 0.0035) c = mix(c, SEAM, 0.9);
    else if (edge < 0.009) c = mix(c, SEAM, 0.25);
    if (grime) c = mix(c, GRIME, smoothstep(Y0 + 0.14, Y0, p.y) * 0.65);
    c = mix(c, "#e09a5c", smoothstep(0.45, 1, n.y) * 0.22);
    c = mix(c, SEAM, smoothstep(-0.3, -1, n.y) * 0.45);
    return c;
  });
}

export default function build() {
  const b = createBuilder({ name: "mimic", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Paints

  const WOOD_BOX = planks((p) => p.y - Y0, 0.08, 3, true);
  const WOOD_LID = planks(
    (p) => (p.y <= LC ? p.y - YT : FH + Math.atan2((p.y - LC) / DOME, p.z / LA) * ((LA + DOME) / 2)),
    0.075,
    5,
    false,
  );
  const IRON = metal("iron", { tarnish: 0.45, polish: 0.25 });
  const GILT = metal("gilt", { tarnish: 0.22 });
  const BRASS = metal("brass", { tarnish: 0.3 });
  const STEEL = metal("steel", { tarnish: 0.55 });

  const FLESH = paint((p, n) => {
    let c = mix("#741226", "#c43a4a", noise(p, 0.05, 11));
    const v = cells(p, 0.045, 12);
    c = mix(c, "#4a0a2a", smoothstep(0.07, 0.015, v.d2 - v.d1) * 0.75);
    c = mix(c, "#ff9aa6", smoothstep(0.6, 1, n.y) * smoothstep(0.6, 0.8, noise(p, 0.015, 13)) * 0.6);
    return c;
  });
  const GUM = paint((p, n) => {
    let c = mix("#b23a52", "#e47a8e", noise(p, 0.03, 14));
    c = mix(c, "#ffd0da", smoothstep(0.7, 1, n.y) * 0.35);
    return c;
  });
  const LIDFLESH = mottle("#4e0c24", "#8a2440", { size: 0.03, seed: 51 });
  const TEETH = paint((_p, _n, s) => {
    let c = mix("#8a6a30", "#efe4c4", smoothstep(0.02, 0.5, s[1]));
    c = mix(c, "#fffaf0", smoothstep(0.75, 1, s[1]));
    return c;
  });
  const SCLERA = paint((p) => {
    const v = cells(p, 0.018, 41);
    return mix("#f6ecc4", "#c8343a", smoothstep(0.07, 0.012, v.d2 - v.d1) * 0.75);
  });
  const TONGUE = paint((p, n, s) => {
    const deg = Math.abs(((s[1] + 540) % 360) - 180);
    let c = mix("#a8205a", "#e0567e", noise(p, 0.04, 21));
    const bumps = cells(p, 0.014, 22);
    c = mix(c, "#f78fac", smoothstep(0.35, 0.1, bumps.d1) * 0.5);
    if (deg < 7) c = mix(c, "#56082c", 0.8);
    c = mix(c, "#f2a6bc", smoothstep(110, 150, deg));
    c = mix(c, "#6a0c3e", smoothstep(0.82, 1, s[0]) * 0.45);
    c = mix(c, "#ffd2e0", smoothstep(0.7, 1, n.y) * smoothstep(0.55, 0.75, noise(p, 0.012, 23)) * 0.6);
    return c;
  });
  const LEGP = gradient(
    spots(mottle("#6a1a38", "#9a3452", { size: 0.04, seed: 31 }), "#3a0a20", { size: 0.03, amount: 0.4, seed: 32 }),
    "#240a14",
    [0, 0.24, 0],
    [0, 0.01, 0],
  );

  // -------------------------------------------------------------------------------------------------------------
  // Textures

  let streaks = "";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r1 = 38 - (i % 3) * 5;
    streaks += `<line x1="${(50 + 15 * Math.cos(a)).toFixed(1)}" y1="${(50 + 15 * Math.sin(a)).toFixed(1)}" x2="${(50 + r1 * Math.cos(a)).toFixed(1)}" y2="${(50 + r1 * Math.sin(a)).toFixed(1)}" stroke="#c0600e" stroke-width="2.2"/>`;
  }
  const EYE_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="ir" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff68a"/><stop offset="0.45" stop-color="#f2c21e"/><stop offset="0.85" stop-color="#d5700e"/><stop offset="1" stop-color="#8a2a06"/></radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="#2a0a04"/>
    <circle cx="50" cy="50" r="44" fill="url(#ir)"/>
    ${streaks}
    <circle cx="50" cy="50" r="44" fill="none" stroke="#5a1a04" stroke-width="3"/>
    <path d="M50 8 Q63 50 50 92 Q37 50 50 8 Z" fill="#140404"/>
    <path d="M50 14 Q57 50 50 86" stroke="#4a0e0e" stroke-width="2" fill="none"/>
    <ellipse cx="34" cy="31" rx="10" ry="6.5" fill="#ffffff" transform="rotate(-30 34 31)"/>
    <circle cx="66" cy="68" r="4" fill="#ffffff"/>
  </svg>`,
    { size: 256 },
  );

  const KEYHOLE_TEX = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="k" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#fff6b0"/><stop offset="0.5" stop-color="#ffb030"/><stop offset="1" stop-color="#e0300c"/></radialGradient></defs>
    <g stroke="#1a0d05" stroke-width="6" stroke-linejoin="round"><circle cx="30" cy="26" r="13" fill="#1a0d05"/><path d="M23 32 L18 70 L42 70 L37 32 Z" fill="#1a0d05"/></g>
    <circle cx="30" cy="26" r="13" fill="url(#k)"/>
    <path d="M23 32 L18 70 L42 70 L37 32 Z" fill="url(#k)"/>
    <circle cx="26" cy="22" r="4" fill="#fffbe0"/>
  </svg>`,
    { size: 128 },
  );

  const rr = rng(77);
  let runePaths = "";
  let runeDots = "";
  for (let i = 0; i < 14; i++) {
    const cx = 18 + i * 30.3;
    const x0 = cx - 8;
    const x1 = cx + 8;
    const opts = [
      ` M${cx} 9 L${x1} 17`,
      ` M${cx} 20 L${x0} 13`,
      ` M${x0} 31 L${cx} 22 L${x1} 31`,
      ` M${x0} 20 L${x1} 20`,
      ` M${cx} 31 L${x1} 25`,
      ` M${x0} 9 L${cx} 15 L${x1} 9`,
    ];
    let d = `M${cx} 9 L${cx} 31`;
    const used = new Set<number>();
    for (let j = 0; j < 3; j++) {
      const k = Math.floor(rr() * opts.length);
      if (used.has(k)) continue;
      used.add(k);
      d += opts[k];
    }
    runePaths += `<path d="${d}"/>`;
    if (i < 13) runeDots += `<circle cx="${(cx + 15).toFixed(1)}" cy="20" r="2" fill="#e6b8ff"/>`;
  }
  const RUNES_TEX = svg(
    `<svg viewBox="0 0 440 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="440" height="40" rx="3" fill="#17141c"/>
    <path d="M4 4 L436 4 M4 36 L436 36" stroke="#b8923e" stroke-width="2.4"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#6a24a8" stroke-width="6.5">${runePaths}</g>
      <g stroke="#ecc6ff" stroke-width="2.8">${runePaths}</g>
    </g>
    ${runeDots}
  </svg>`,
    { size: 512 },
  );

  let ticks = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const a2 = a + (i % 2 ? 0.12 : -0.12);
    ticks += `<path d="M${(60 + 46 * Math.cos(a)).toFixed(1)} ${(60 + 46 * Math.sin(a)).toFixed(1)} L${(60 + 53 * Math.cos(a2)).toFixed(1)} ${(60 + 53 * Math.sin(a2)).toFixed(1)}"/>`;
  }
  const SIGIL_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="60" cy="60" r="55" stroke="#5a1a8a" stroke-width="7"/>
      <circle cx="60" cy="60" r="55" stroke="#e8c0ff" stroke-width="2.6"/>
      <circle cx="60" cy="60" r="44" stroke="#c27aff" stroke-width="2.8"/>
      <g stroke="#e8c0ff" stroke-width="2.6">${ticks}</g>
      <path d="M60 22 L93 79 L27 79 Z" stroke="#5a1a8a" stroke-width="7"/>
      <path d="M60 22 L93 79 L27 79 Z" stroke="#d99cff" stroke-width="2.8"/>
    </g>
    <path d="M38 62 Q60 44 82 62 Q60 80 38 62 Z" fill="#2a0c3a" stroke="#f0d0ff" stroke-width="2.6"/>
    <ellipse cx="60" cy="62" rx="4" ry="9" fill="#ff5ad8"/>
  </svg>`,
    { size: 256 },
  );

  const DROOL_TEX = svg(
    `<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 100 L17 100 Q14 70 12 40 Q19 28 15 14 Q10 2 5 14 Q1 28 8 40 Q6 70 3 100 Z" fill="#cfe6f2"/>
    <path d="M8 96 Q8 64 9 40 M7 22 Q6 14 9 10" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );

  const COIN_TEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="#b8861e"/>
    <circle cx="32" cy="32" r="26" fill="#f2c94c" stroke="#9a6a10" stroke-width="2.5"/>
    <path d="M18 40 L20 24 L26 32 L32 20 L38 32 L44 24 L46 40 Z" fill="#d8a52a" stroke="#7a5208" stroke-width="2"/>
    <path d="M18 45 L46 45" stroke="#7a5208" stroke-width="2.5"/>
    <path d="M14 22 Q20 12 32 10" stroke="#fff4c0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );

  const NOTE_TEX = svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6 L20 3 L40 7 L60 2 L76 6 L74 30 L78 55 L73 80 L76 96 L50 93 L30 97 L8 94 L5 70 L2 45 L6 25 Z" fill="#ead6a4" stroke="#7a5a2a" stroke-width="2"/>
    <ellipse cx="60" cy="78" rx="12" ry="8" fill="#d6b97c"/>
    <ellipse cx="18" cy="20" rx="8" ry="5" fill="#dcc28a"/>
    <text x="40" y="33" text-anchor="middle" font-family="serif" font-weight="bold" font-size="20" fill="#3a1a0a">FREE</text>
    <text x="40" y="53" text-anchor="middle" font-family="serif" font-weight="bold" font-size="16" fill="#8a1a10">LOOT!</text>
    <path d="M20 66 L52 66 M45 60 L54 66 L45 72" stroke="#8a1a10" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="40" y="87" text-anchor="middle" font-family="serif" font-style="italic" font-size="8.5" fill="#3a1a0a">~ not a mimic</text>
  </svg>`,
    { size: 256 },
  );

  const THROAT_TEX = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="t" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stop-color="#050002"/><stop offset="0.55" stop-color="#2a0410"/><stop offset="1" stop-color="#7a1426"/></radialGradient></defs>
    <ellipse cx="50" cy="27" rx="48" ry="22" fill="url(#t)"/>
    <path d="M12 22 Q50 2 88 22" stroke="#a83046" stroke-width="3" fill="none"/>
    <path d="M20 30 Q50 14 80 30" stroke="#6a1022" stroke-width="2.5" fill="none"/>
  </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: the box is the body and lower jaw; the lid is the upper jaw hinged at the back.

  const body = b.joint("body", { at: [0, Y0 + BH / 2, 0], role: "spine" });
  const jaw = b.joint("jaw", { parent: body, at: [0, YT, -D / 2], dir: [0, 0, 1], role: "jaw" });

  // Helpers
  const box = (size: number[], color: Col, at: number[] | THREE.Vector3, bone: Joint) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone });
  const rivet = (at: number[] | THREE.Vector3, bone: Joint, r = 0.008, color: Col = GILT) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, bone });
  const coinGeo = () => new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12);
  const tr = rng(5);
  const tooth = (base: number[], dir: number[], h: number, r: number, bone: Joint) => {
    const d = V(dir).normalize();
    const B = V(base);
    b.part(new THREE.ConeGeometry(r, h, 5), TEETH, {
      bone,
      at: B.clone().addScaledVector(d, h / 2 - 0.012),
      dir: d,
      flat: true,
    });
    return B.clone().addScaledVector(d, h - 0.012);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Lower box: walls, flesh-lined mouth, iron and gilt fittings

  box([W, 0.04, D], WOOD_BOX, [0, Y0 + 0.02, 0], body);
  const frontWall = box([W, BH, T], WOOD_BOX, [0, Y0 + BH / 2, D / 2 - T / 2], body);
  box([W, BH, T], WOOD_BOX, [0, Y0 + BH / 2, -D / 2 + T / 2], body);
  for (const s of [1, -1]) box([T, BH, D - 2 * T], WOOD_BOX, [s * (W / 2 - T / 2), Y0 + BH / 2, 0], body);

  // Mouth floor and lining
  const floorH = MF - Y0 - 0.04;
  box([W - 2 * T, floorH, D - 2 * T], FLESH, [0, Y0 + 0.04 + floorH / 2, 0], body);
  const linH = YT - 0.012 - MF;
  const linY = (MF + YT - 0.012) / 2;
  for (const s of [1, -1]) {
    box([W - 2 * T, linH, 0.012], FLESH, [0, linY, s * (D / 2 - T - 0.006)], body);
    box([0.012, linH, D - 2 * T - 0.024], FLESH, [s * (W / 2 - T - 0.006), linY, 0], body);
  }
  // Throat at the back of the mouth
  b.part(new THREE.PlaneGeometry(0.34, 0.1), "#ffffff", {
    bone: body,
    at: [0, (MF + YT) / 2 - 0.005, -D / 2 + T + 0.0135],
    dir: [0, 0, 1],
    axis: "z",
    texture: THROAT_TEX,
  });
  // Lower gum ridge
  b.sweep(roundRect(YT - 0.012, W / 2 - T - 0.004, D / 2 - T - 0.004, 0.04), 0.022, { color: GUM, bone: body });

  // Gilt rim along the top, iron band along the bottom
  b.sweep(roundRect(YT - 0.008, W / 2 + 0.002, D / 2 + 0.002, 0.012), (_t: number): [number, number] => [0.009, 0.014], {
    section: "box",
    color: GILT,
    bone: body,
  });
  b.sweep(roundRect(Y0 + 0.03, W / 2 + 0.003, D / 2 + 0.003, 0.012), (_t: number): [number, number] => [0.008, 0.02], {
    section: "box",
    color: IRON,
    bone: body,
  });

  // Vertical iron straps with gilt rivets, front and back
  for (const s of [1, -1])
    for (const fz of [1, -1]) {
      box([0.05, BH - 0.02, 0.012], IRON, [s * BAND_X, Y0 + BH / 2, fz * (D / 2 + 0.006)], body);
      for (const y of [Y0 + 0.07, Y0 + 0.17, Y0 + 0.27, Y0 + 0.36]) rivet([s * BAND_X, y, fz * (D / 2 + 0.014)], body);
    }

  // Gilt corner edges and brackets
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([sx * (W / 2), Y0 + 0.01, sz * (D / 2)], [sx * (W / 2), YT - 0.012, sz * (D / 2)], 0.016, GILT, {
        bone: body,
      });
      for (const level of [Y0 + 0.07, YT - 0.065]) {
        box([0.09, 0.1, 0.01], GILT, [sx * (W / 2 - 0.045), level, sz * (D / 2 + 0.005)], body);
        rivet([sx * (W / 2 - 0.045), level, sz * (D / 2 + 0.012)], body, 0.008, IRON);
      }
      box([0.01, 0.1, 0.08], GILT, [sx * (W / 2 + 0.005), YT - 0.065, sz * (D / 2 - 0.04)], body);
      rivet([sx * (W / 2 + 0.012), YT - 0.065, sz * (D / 2 - 0.04)], body, 0.008, IRON);
    }

  // Side ring handles
  for (const s of [1, -1]) {
    box([0.012, 0.05, 0.11], IRON, [s * (W / 2 + 0.006), YT - 0.095, 0], body);
    for (const z of [-0.045, 0.045]) rivet([s * (W / 2 + 0.014), YT - 0.085, z], body, 0.009, GILT);
    b.part(new THREE.TorusGeometry(0.045, 0.009, 5, 10, Math.PI), IRON, {
      bone: body,
      at: [s * (W / 2 + 0.02), YT - 0.1, 0],
      rotation: [180, 90, 0],
    });
  }

  // Lock plate with a glowing keyhole
  const lockPlate = b.extrude(
    [
      [-0.07, 0, "sharp"],
      [0.07, 0, "sharp"],
      [0.07, -0.085],
      [0, -0.14, "sharp"],
      [-0.07, -0.085],
    ],
    { at: [0, YT - 0.012, D / 2 + 0.007], x: [1, 0, 0], thickness: 0.014, bevel: 0.004, smoothing: 1, color: GILT, bone: body },
  );
  void lockPlate;
  for (const p of [
    [-0.05, YT - 0.03],
    [0.05, YT - 0.03],
    [0, YT - 0.135],
  ])
    rivet([p[0], p[1], D / 2 + 0.016], body, 0.007, IRON);
  glow(
    b.part(new THREE.PlaneGeometry(0.045, 0.06), "#ffffff", {
      bone: body,
      at: [0, YT - 0.075, D / 2 + 0.0155],
      dir: [0, 0, 1],
      axis: "z",
      texture: KEYHOLE_TEX,
    }),
    1.6,
  );

  // Rune band across the lower front
  box([0.5, 0.05, 0.01], IRON, [0, Y0 + 0.1, D / 2 + 0.005], body);
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.042), "#ffffff", {
      bone: body,
      at: [0, Y0 + 0.1, D / 2 + 0.0115],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNES_TEX,
    }),
    1.3,
  );

  // Parchment note nailed to the right side
  b.part(new THREE.PlaneGeometry(0.15, 0.19), "#ffffff", {
    bone: body,
    at: [-(W / 2 + 0.004), Y0 + 0.2, 0.0],
    dir: [-1, 0, 0],
    up: [0, 1, 0.14],
    axis: "z",
    texture: NOTE_TEX,
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), IRON, {
    bone: body,
    at: [-(W / 2 + 0.007), Y0 + 0.28, -0.012],
    dir: [-1, 0, 0],
  });

  // Back hinges
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), GILT, {
      bone: body,
      at: [s * BAND_X, YT, -D / 2 - 0.012],
      dir: [1, 0, 0],
    });
    box([0.1, 0.08, 0.008], GILT, [s * BAND_X, YT - 0.045, -D / 2 - 0.004], body);
    box([0.1, 0.07, 0.008], GILT, [s * BAND_X, YT + 0.04, -D / 2 - 0.004], jaw);
  }

  // Veins creeping out of the mouth over the front planks
  const frontSkin = b.surface(frontWall);
  for (const [x0, w] of [
    [-0.18, 0.015],
    [-0.12, -0.012],
    [0.12, 0.014],
    [0.185, -0.016],
  ]) {
    const rough = catmull([
      [x0, YT + 0.002, D / 2 + 0.01],
      [x0 + w, YT - 0.05, D / 2 + 0.01],
      [x0 - w, YT - 0.1, D / 2 + 0.01],
      [x0 + w * 1.4, YT - 0.16, D / 2 + 0.01],
    ]);
    b.sweep(frontSkin.drape(rough, { lift: 0.003 }), [0.008, 0.002], { color: VEIN, bone: body });
    const twig = catmull([
      [x0 - w, YT - 0.1, D / 2 + 0.01],
      [x0 - w * 2.5, YT - 0.13, D / 2 + 0.01],
      [x0 - w * 3.2, YT - 0.15, D / 2 + 0.01],
    ]);
    b.sweep(frontSkin.drape(twig, { lift: 0.003 }), [0.005, 0.0015], { color: VEIN, bone: body });
  }

  // Lower teeth: front, sides, back
  const lowerTips: Record<string, THREE.Vector3> = {};
  for (const x of [-0.37, -0.3, -0.23, -0.16, 0.16, 0.23, 0.3, 0.37]) {
    const fang = Math.abs(Math.abs(x) - 0.23) < 0.01;
    const h = fang ? 0.11 : 0.058 + tr() * 0.02;
    tooth([x, YT - 0.012, D / 2 - T - 0.01], [0, 1, 0.12], h, fang ? 0.024 : 0.017, body);
  }
  for (const s of [1, -1])
    for (const z of [-0.06, 0.05, 0.16]) {
      const tip = tooth([s * (W / 2 - T - 0.01), YT - 0.012, z], [-s * 0.12, 1, 0], 0.055 + tr() * 0.02, 0.016, body);
      lowerTips[`${s}:${z}`] = tip;
    }
  for (const x of [-0.24, -0.12, 0.12, 0.24]) tooth([x, YT - 0.012, -D / 2 + T + 0.01], [0, 1, -0.1], 0.045, 0.014, body);

  // -------------------------------------------------------------------------------------------------------------
  // Lid (built closed, then opened): domed oak, iron bands, gilt trims, palate, fangs, eyes' sockets and brows

  const lidOutline: Array<[number, number] | [number, number, "sharp"]> = [[LA, YT, "sharp"]];
  for (let i = 0; i <= 16; i++) {
    const th = (i / 16) * Math.PI;
    lidOutline.push([LA * Math.cos(th), LC + DOME * Math.sin(th)]);
  }
  lidOutline.push([-LA, YT, "sharp"]);
  const lidPart = b.extrude(lidOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: W,
    bevel: 0.012,
    color: WOOD_LID,
    bone: jaw,
  });

  // Iron bands over the dome, with gilt rivets
  for (const s of [1, -1]) {
    b.sweep(lidLine(s * BAND_X, 0.006), (_t: number): [number, number] => [0.026, 0.007], {
      section: "box",
      color: IRON,
      bone: jaw,
      caps: "flat",
    });
    rivet([s * BAND_X, YT + 0.03, LA + 0.014], jaw);
    for (const th of [0.5, 0.85, 1.2, 1.57, 1.95, 2.3, 2.65, 3.0]) rivet(lidAt(s * BAND_X, th, 0.014).p, jaw);
    // Gilt-set ruby cabochons on the band fronts
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 6), "#e8213c", {
        bone: jaw,
        at: [s * BAND_X, YT + 0.075, LA + 0.012],
        scale: [1, 1, 0.6],
      }),
      0.8,
    );
    b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 12), GILT, {
      bone: jaw,
      at: [s * BAND_X, YT + 0.075, LA + 0.012],
      dir: [0, 0, 1],
      axis: "z",
    });
    // Gilt edge trim following the lid's end profile
    b.sweep(lidLine(s * (W / 2 - 0.01), 0.004), 0.013, { color: GILT, bone: jaw });
    // Gilt corner plates on the lid front
    box([0.08, 0.06, 0.01], GILT, [s * (W / 2 - 0.04), YT + 0.035, LA + 0.005], jaw);
    rivet([s * (W / 2 - 0.04), YT + 0.035, LA + 0.012], jaw, 0.007, IRON);
  }
  // Gilt rim along the lid's bottom edge
  b.sweep(roundRect(YT + 0.01, W / 2 + 0.002, D / 2 + 0.002, 0.012), (_t: number): [number, number] => [0.009, 0.012], {
    section: "box",
    color: GILT,
    bone: jaw,
  });

  // Forehead medallion: an arcane sigil between the eyes
  b.part(new THREE.CircleGeometry(0.047, 16), "#1a1024", {
    bone: jaw,
    at: [0, EYE_Y, LA + 0.002],
    dir: [0, 0, 1],
    axis: "z",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", {
      bone: jaw,
      at: [0, EYE_Y, LA + 0.0038],
      dir: [0, 0, 1],
      axis: "z",
      texture: SIGIL_TEX,
    }),
    1.4,
  );
  b.part(new THREE.TorusGeometry(0.05, 0.009, 6, 18), GILT, {
    bone: jaw,
    at: [0, EYE_Y, LA + 0.004],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Eye sockets and angry iron brows
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(RE * 0.98, 0.011, 6, 16), GILT, {
      bone: jaw,
      at: [s * EYE_X, EYE_Y, LA + 0.004],
      dir: [0, 0, 1],
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.17, 0.032, 0.03), IRON, {
      bone: jaw,
      at: [s * (EYE_X + 0.01), YT + 0.138, LA + 0.006],
      rotation: [0, 0, s * 10],
      flat: true,
    });
    for (const dx of [-0.06, 0.06]) {
      const x = s * (EYE_X + 0.01) + dx;
      rivet([x, YT + 0.138 + s * Math.tan(10 * RAD) * (x - s * (EYE_X + 0.01)), LA + 0.022], jaw, 0.007, GILT);
    }
  }

  // Palate, ridges and upper gum
  box([W - 2 * T - 0.02, 0.014, D - 2 * T - 0.02], FLESH, [0, YT - 0.004, 0], jaw);
  for (const z of [0.04, 0.1, 0.16, 0.21])
    b.sweep(
      catmull([
        [-0.28, YT - 0.012, z - 0.03],
        [0, YT - 0.013, z],
        [0.28, YT - 0.012, z - 0.03],
      ]),
      0.008,
      { color: GUM, bone: jaw },
    );
  b.sweep(roundRect(YT - 0.012, W / 2 - T - 0.004, D / 2 - T - 0.004, 0.04), 0.02, { color: GUM, bone: jaw });

  // Upper teeth (closed coordinates); remember tips for drool
  const upperTips: THREE.Vector3[] = [];
  const upperFangTips: THREE.Vector3[] = [];
  for (const x of [-0.37, -0.3, -0.23, -0.165, -0.1, -0.035, 0.035, 0.1, 0.165, 0.23, 0.3, 0.37]) {
    const fang = Math.abs(Math.abs(x) - 0.1) < 0.01;
    const h = fang ? 0.13 : 0.06 + tr() * 0.025;
    const tip = tooth([x, YT - 0.006, D / 2 - T - 0.01], [0, -1, 0.05], h, fang ? 0.027 : 0.017, jaw);
    upperTips.push(tip);
    if (fang) upperFangTips.push(tip);
  }
  const upperSide: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1])
    for (const z of [0.02, 0.12, 0.2]) {
      upperSide[`${s}:${z}`] = tooth([s * (W / 2 - T - 0.01), YT - 0.006, z], [-s * 0.12, -1, 0], 0.06 + tr() * 0.02, 0.016, jaw);
    }

  // A rusty adventurer's dagger stuck in the lid, with flesh oozing round the wound
  {
    const dg = lidAt(-0.2, 55 * RAD, 0);
    const P = V(dg.p);
    const n = V(dg.n);
    const d = n.clone().add(new THREE.Vector3(-0.35, 0, -0.15)).normalize();
    const at = (k: number) => P.clone().addScaledVector(d, k);
    b.part(new THREE.SphereGeometry(0.032, 8, 6), FLESH, { bone: jaw, at: P, dir: n, scale: [1, 0.35, 1] });
    b.frustumBox(at(-0.03), at(0.11), [0.034, 0.007], [0.042, 0.008], { color: STEEL, bone: jaw });
    b.part(new THREE.BoxGeometry(0.12, 0.016, 0.022), BRASS, { bone: jaw, at: at(0.115), dir: d, flat: true });
    b.rod(at(0.123), at(0.205), 0.011, LEATHER, { bone: jaw });
    for (const k of [0.135, 0.16, 0.185]) b.rod(at(k), at(k + 0.006), 0.0128, "#2a160c", { bone: jaw });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), BRASS, { bone: jaw, at: at(0.218) });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs: four crab-like flesh legs bursting out of the box sides

  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const suf = (sz > 0 ? "F" : "B") + (sx > 0 ? "L" : "R");
      const hip = [sx * 0.34, Y0 + 0.03, sz * 0.12];
      const knee = [sx * 0.6, 0.26, sz * 0.25];
      const foot = [sx * 0.71, 0.036, sz * 0.33];
      const leg = b.chain(`leg${suf}`, [hip, knee, foot], {
        parent: body,
        names: [`hip${suf}`, `knee${suf}`, `ankle${suf}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      const ankle = leg.joints[2];
      const legSweep = b.sweep(leg, [0.05, 0.03], { color: LEGP });
      // Flesh bursting through the wood where the leg exits
      b.part(new THREE.SphereGeometry(0.06, 8, 6), FLESH, {
        bone: body,
        at: [sx * 0.462, 0.217, sz * 0.18],
        dir: [sx, 0, 0],
        scale: [1, 0.4, 1.1],
      });
      // Knee knob and bony nubs
      b.part(new THREE.SphereGeometry(0.05, 8, 6), LEGP, { bone: leg.joints[1], at: knee });
      for (const [t, deg] of [
        [0.3, 0],
        [0.47, -25],
        [0.47, 25],
        [0.62, 0],
      ]) {
        const f = legSweep.at(t, deg);
        b.spike(f, f, 0.04, 0.012, { color: CLAW });
      }
      // Foot pad and claws
      b.part(new THREE.SphereGeometry(0.046, 8, 6), LEGP, {
        bone: ankle,
        at: [foot[0], 0.034, foot[2]],
        scale: [1.15, 0.74, 1.15],
      });
      const out = new THREE.Vector3(foot[0], 0, foot[2]).normalize();
      for (const k of [-1, 0, 1]) {
        const a = k * 32 * RAD;
        const dx = out.x * Math.cos(a) - out.z * Math.sin(a);
        const dz = out.x * Math.sin(a) + out.z * Math.cos(a);
        const base = [foot[0] + dx * 0.035, 0.028, foot[2] + dz * 0.035];
        b.spike(base, [dx, -0.32, dz], 0.07, 0.014, { color: CLAW, bone: ankle });
      }
    }

  // -------------------------------------------------------------------------------------------------------------
  // The long tongue, lolling over the front lip and curling up at the sticky tip

  const tongue = b.chain(
    "tongue",
    catmull([
      [0, MF - 0.03, -0.2],
      [0, MF + 0.035, 0.0],
      [0, YT + 0.045, 0.2],
      [0, YT + 0.07, 0.33],
      [0, YT - 0.02, 0.5],
      [0, 0.34, 0.66],
      [0, 0.23, 0.84],
      [0, 0.25, 1.02],
      [0, 0.35, 1.15],
      [0, 0.49, 1.21],
    ]),
    { parent: body, count: 10, role: "tentacle" },
  );
  const tongueR = (t: number): [number, number] => {
    const w =
      0.058 + 0.02 * Math.sin(Math.min(t / 0.75, 1) * (Math.PI / 2)) + 0.028 * Math.exp(-(((t - 0.94) / 0.05) ** 2));
    return [w, w * 0.46];
  };
  const tongueSweep = b.sweep(tongue, tongueR, { color: TONGUE });
  // Coins stuck to the sticky tongue
  for (const [t, deg, spin] of [
    [0.55, 38, 20],
    [0.68, -42, 70],
    [0.82, 15, 140],
    [0.9, -30, 10],
  ])
    b.stick(coinGeo(), "#ffffff", tongueSweep.at(t, deg), { texture: COIN_TEX, embed: 0.4, spin });
  // Glossy spit bubbles
  const br = rng(12);
  for (let i = 0; i < 9; i++) {
    const f = tongueSweep.at(0.3 + br() * 0.68, (br() - 0.5) * 140);
    b.stick(new THREE.SphereGeometry(0.008 + br() * 0.006, 6, 4), "#ffe2ee", f, { embed: 0.4 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Hoard in the mouth: coins, stacks, gems and a gnawed bone

  const rc = rng(17);
  for (let i = 0; i < 18; i++) {
    const x = (rc() * 2 - 1) * 0.36;
    const z = (rc() * 2 - 1) * 0.19;
    if (Math.abs(x) < 0.1) continue;
    b.part(coinGeo(), "#ffffff", {
      bone: body,
      texture: COIN_TEX,
      at: [x, MF + 0.004 + rc() * 0.006, z],
      rotation: [(rc() - 0.5) * 30, rc() * 180, (rc() - 0.5) * 30],
    });
  }
  for (const [sx, sz, nStack] of [
    [-0.3, -0.15, 5],
    [0.28, 0.14, 4],
    [-0.2, 0.16, 3],
  ])
    for (let k = 0; k < nStack; k++)
      b.part(coinGeo(), "#ffffff", {
        bone: body,
        texture: COIN_TEX,
        at: [sx + (rc() - 0.5) * 0.006, MF + 0.003 + k * 0.0062, sz + (rc() - 0.5) * 0.006],
        rotation: [0, rc() * 360, 0],
      });
  glow(
    b.part(new THREE.OctahedronGeometry(0.028), "#e0203a", {
      bone: body,
      at: [0.3, MF + 0.03, -0.12],
      scale: [1, 1.3, 1],
      rotation: [10, 30, 15],
      flat: true,
    }),
    0.7,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.024), "#20d070", {
      bone: body,
      at: [-0.28, MF + 0.026, 0.06],
      scale: [1, 1.3, 1],
      rotation: [-15, 10, -20],
      flat: true,
    }),
    0.7,
  );
  {
    const A = V([0.16, MF + 0.016, -0.18]);
    const B2 = V([0.32, MF + 0.018, 0.04]);
    b.rod(A, B2, 0.013, BONE, { bone: body });
    const along = B2.clone().sub(A).normalize();
    const side = new THREE.Vector3(along.z, 0, -along.x);
    for (const end of [A, B2])
      for (const k of [-1, 1])
        b.part(new THREE.SphereGeometry(0.02, 7, 5), BONE, {
          bone: body,
          at: end.clone().addScaledVector(side, k * 0.013).addScaledVector(along, end === A ? -0.004 : 0.004),
        });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Open the mouth: the rest pose has the lid raised.

  b.pose(jaw, { axis: [1, 0, 0], deg: -OPEN });

  // Eyes, lids and gaze, built in the open pose so they look forward
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E = openP([s * EYE_X, EYE_Y, LA + 0.012]);
    const gaze = new THREE.Vector3(s * 0.08, 0.02, 1).normalize();
    const eye = b.joint(`eye${side}`, { parent: jaw, at: E, dir: gaze });
    const ball = b.part(new THREE.SphereGeometry(RE, 14, 10), SCLERA, { bone: eye, at: E });
    glow(
      b.decal(ball, EYE_TEX, {
        at: E.clone().addScaledVector(gaze, RE),
        dir: gaze,
        size: [0.074, 0.074],
        mirror: s > 0,
        bone: eye,
      }),
      1.2,
    );
    const capOutline = (ro: number, ri: number, deg: number) => {
      const pts: [number, number][] = [[0, ro]];
      for (let a = 15; a < deg; a += 15) pts.push([ro * Math.sin(a * RAD), ro * Math.cos(a * RAD)]);
      pts.push([ro * Math.sin(deg * RAD), ro * Math.cos(deg * RAD)]);
      pts.push([ri * Math.sin(deg * RAD), ri * Math.cos(deg * RAD)]);
      for (let a = Math.floor((deg - 1) / 15) * 15; a >= 15; a -= 15) pts.push([ri * Math.sin(a * RAD), ri * Math.cos(a * RAD)]);
      pts.push([0, ri]);
      return pts;
    };
    const upperLid = b.joint(`eyelid${side}`, { parent: jaw, at: E, dir: gaze, role: "hinge" });
    b.lathe(capOutline(RE * 1.13, RE * 1.0, 55), {
      at: E,
      axis: new THREE.Vector3(-s * 0.4, 1, 0.42).normalize(),
      segments: 10,
      color: LIDFLESH,
      bone: upperLid,
    });
    const lowerLid = b.joint(`eyelidLow${side}`, { parent: jaw, at: E, dir: gaze, role: "hinge" });
    b.lathe(capOutline(RE * 1.1, RE * 0.98, 38), {
      at: E,
      axis: new THREE.Vector3(s * 0.1, -1, 0.35).normalize(),
      segments: 10,
      color: LIDFLESH,
      bone: lowerLid,
    });
  }

  // Arcane sigil branded on the lid's crown
  {
    const top = lidAt(0, 85 * RAD, 0);
    glow(
      b.decal(lidPart, SIGIL_TEX, {
        at: openP(top.p),
        dir: openD(top.n),
        size: [0.24, 0.24],
        bone: jaw,
      }),
      1.1,
    );
  }

  // Cheek webbing between the jaws at the back corners of the mouth
  for (const s of [1, -1]) {
    const zs = [-0.26, -0.195, -0.13, -0.065, 0.0];
    const edgeA = zs.map((z) => [s * 0.4, YT + 0.004, z]);
    const edgeB = zs.map((z) => openP([s * 0.4, YT - 0.004, z]));
    b.membrane(edgeA, edgeB, { color: FLESH, thickness: 0.01, scallop: 0.2, bone: body });
  }

  // Uvula hanging at the back of the throat
  {
    const top = openP([0, YT - 0.011, -D / 2 + T + 0.07]);
    b.capsule(top, top.clone().add(new THREE.Vector3(0, -0.06, 0.005)), [0.018, 0.014], { color: FLESH, bone: jaw });
  }

  // Drool hanging from the fangs, and spit strands stretched between the jaws
  const droolFrames = [...upperFangTips, upperTips[3], upperTips[8], upperTips[10]].map((tip) =>
    frame(openP([tip.x, tip.y, tip.z]), [0, 1, 0]),
  );
  b.cards(droolFrames, DROOL_TEX, {
    size: [0.022, 0.1],
    lean: 180,
    flow: [0, 0, 1],
    bone: jaw,
    vary: 0.35,
    rng: rng(9),
    color: "#ffffff",
  });
  for (const [s, zu, zl] of [
    [1, 0.12, 0.16],
    [-1, 0.12, 0.05],
    [1, 0.2, 0.16],
  ]) {
    const up = upperSide[`${s}:${zu}`];
    const lo = lowerTips[`${s}:${zl}`];
    if (!up || !lo) continue;
    const a = openP([up.x, up.y, up.z]);
    const mid = a.clone().lerp(lo, 0.5).add(new THREE.Vector3(-s * 0.025, -0.02, 0.01));
    b.sweep(catmull([a, mid, lo]), [0.0035, 0.002, 0.0035], { color: SPIT, bone: jaw });
  }

  return b.root;
}
```