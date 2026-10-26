import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alder House — Brutalist Housing Block",
  description:
    "A raw board-marked concrete slab block on pilotis: deep loggia grid with colour-washed back walls, rear access galleries, bridges to two stair/lift towers, a roof terrace with vault, plant house, stacks and an amphitheatre.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants (meters)

const N = 15; // bays
const BW = 3.6; // bay width
const L = N * BW; // 54 m long
const HL = L / 2;
const G = 5.0; // ground storey (pilotis) height
const FH = 3.0; // storey height
const ST = 0.4; // slab thickness
const lvl = (k: number) => G + k * FH;
const TOP = lvl(9); // roof deck, 32 m
const finX = (j: number) => -HL + j * BW;
const bayX = (i: number) => -HL + (i + 0.5) * BW;
const ZF = 5.5; // front wall
const ZFP = 7.0; // front slab edge
const ZB = -5.5; // back wall
const ZBP = -6.0; // back slab edge
const ZGP = -7.6; // gallery slab edge
const GAL = [1, 4, 7]; // gallery levels
const TCX = 33.7; // tower centre x
const TCZ = -3;

const PAL = ["#c4572f", "#e0a526", "#2f7f87", "#8c3b3b", "#d9d2c0", "#4d6fa5"];
const DOORS = ["#c4572f", "#e0a526", "#2f7f87", "#33363a"];
const LAUNDRY = ["#f2efe6", "#d9534f", "#4d6fa5", "#e0a526", "#7aa86a"];

const b = createBuilder({ name: "brutalist-block", paintSize: 2048 });
const R = rng(1967);

// ---------------------------------------------------------------------------------------------------------------
// Concrete paint: board-marked formwork, panel joints, rain streaks, grime at the foot, moss on the tops

const CON_LO = "#7b7870";
const CON_MID = "#9f9b90";
const CON_HI = "#c3bfb3";
const STAIN = "#4c4a45";
const GRIME = "#3d3b37";
const MOSS = "#5f6e3a";

const hashN = (a: number, c: number) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(c | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const qv = new THREE.Vector3();

function concrete(seed: number, shade = 1) {
  return paint((p, n) => {
    const big = noise(p, 5, seed);
    let c = mix(CON_LO, mix(CON_MID, CON_HI, 0.5), smoothstep(0.25, 0.75, big));
    if (Math.abs(n.y) < 0.55) {
      const board = 0.4;
      const row = Math.floor(p.y / board);
      c = mix(c, CON_LO, 0.28 * hashN(row, seed));
      const fy = p.y / board - row;
      if (fy < 0.12) c = mix(c, STAIN, 0.3);
      const h = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
      const pw = 2.4;
      const fx = (h / pw - Math.floor(h / pw)) * pw;
      if (fx < 0.09) c = mix(c, STAIN, 0.45);
      qv.set(p.x * 0.7 + p.z * 0.7, p.y * 0.12, seed * 3.1);
      const streak = noise(qv, 0.45, seed + 7);
      c = mix(c, STAIN, 0.55 * smoothstep(0.62, 0.82, streak));
      c = mix(c, GRIME, 0.5 * (1 - smoothstep(0.2, 4.5, p.y)));
      if (noise(p, 0.28, seed + 11) > 0.72) c = mix(c, STAIN, 0.18);
    } else if (n.y > 0.55) {
      const m = noise(p, 1.3, seed + 3);
      c = mix(c, CON_HI, 0.25);
      c = mix(c, MOSS, 0.5 * smoothstep(0.58, 0.76, m));
    } else {
      c = mix(c, STAIN, 0.42);
    }
    return [c[0] * shade, c[1] * shade, c[2] * shade] as const;
  });
}

const CONC = concrete(3, 1);
const CONC_D = concrete(8, 0.82);
const CONC_T = concrete(5, 0.96);
const CONC_L = concrete(13, 1.08);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const winSvg = (glass: string, glassHi: string, curtain?: string, curtain2?: string) => `
<svg viewBox="0 0 54 42" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="${glassHi}"/><stop offset="1" stop-color="${glass}"/></linearGradient></defs>
  <rect width="54" height="42" fill="#22252a"/>
  <rect x="2" y="2" width="21" height="38" fill="url(#g)"/>
  <rect x="25" y="2" width="27" height="22" fill="url(#g)"/>
  <rect x="25" y="26" width="27" height="14" fill="#41464a"/>
  ${
    curtain
      ? `<rect x="2" y="2" width="21" height="38" fill="${curtain}"/>
         <rect x="25" y="2" width="27" height="22" fill="${curtain2 ?? curtain}"/>
         <path d="M6 2V40M10 2V40M14 2V40M18 2V40M29 2V24M34 2V24M39 2V24M44 2V24M49 2V24" stroke="#000" stroke-opacity="0.16" stroke-width="1.4"/>`
      : `<path d="M2 30L23 8M2 40L23 20M25 22L40 2M33 24L52 6" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2.4"/>`
  }
  <rect x="2" y="2" width="21" height="2" fill="#000" fill-opacity="0.25"/>
  <rect x="19" y="20" width="2" height="6" fill="#c9c9c9"/>
  <rect x="25" y="24" width="27" height="2" fill="#12141a"/>
  <path d="M25 26V40" stroke="#1b1d21" stroke-width="1"/>
</svg>`;
const WIN_DARK = svg(winSvg("#3b5666", "#7da0b2"), { size: 192 });
const WIN_CREAM = svg(winSvg("#3b5666", "#7da0b2", "#e9dcb4", "#efe5c4"), { size: 192 });
const WIN_ORANGE = svg(winSvg("#3b5666", "#7da0b2", "#d98b45", "#c97a3a"), { size: 192 });
const WIN_LIT = svg(winSvg("#ffcf86", "#fff0c0", "#ffd58c", "#ffe3a8"), { size: 192 });

const ribSvg = (g0: string, g1: string) => `
<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g0}"/></linearGradient></defs>
  <rect width="60" height="24" fill="#23262a"/>
  <rect x="2" y="2" width="56" height="17" fill="url(#r)"/>
  <path d="M16 2V19M30 2V19M44 2V19" stroke="#23262a" stroke-width="1.6"/>
  <path d="M4 17L14 4M32 17L42 4" stroke="#fff" stroke-opacity="0.18" stroke-width="2"/>
  <rect x="0" y="20" width="60" height="4" fill="#9c988d"/>
</svg>`;
const RIB_DARK = svg(ribSvg("#38505e", "#7499ab"), { size: 192 });
const RIB_LIT = svg(ribSvg("#ffc878", "#fff0c4"), { size: 192 });

const DOOR = svg(
  `<svg viewBox="0 0 20 44" xmlns="http://www.w3.org/2000/svg">
  <rect width="20" height="44" fill="#4d4d4d"/>
  <rect x="1.5" y="1.5" width="17" height="42.5" fill="#f0f0f0"/>
  <rect x="4" y="5" width="12" height="9" fill="#6e6e6e"/>
  <rect x="4" y="18" width="12" height="22" fill="#d2d2d2" stroke="#9a9a9a" stroke-width="0.8"/>
  <circle cx="16" cy="28" r="1.2" fill="#3a3a3a"/>
  <rect x="5.5" y="21" width="9" height="1.6" fill="#8a8a8a"/>
</svg>`,
  { size: 128 },
);

const LOUVRE = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="24" fill="#3a3a3a"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="1.5" y="${1 + i * 3.2}" width="37" height="2.2" fill="#e2e2e2"/><rect x="1.5" y="${3.2 + i * 3.2}" width="37" height="0.5" fill="#9a9a9a"/>`).join("")}
  <rect x="0" y="0" width="1.5" height="24" fill="#2a2a2a"/><rect x="38.5" y="0" width="1.5" height="24" fill="#2a2a2a"/>
</svg>`,
  { size: 192 },
);

const LOBBY = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b8"/><stop offset="1" stop-color="#f0a95c"/></linearGradient></defs>
  <rect width="120" height="40" fill="#1f2125"/>
  <rect x="1" y="1" width="118" height="38" fill="url(#w)"/>
  <rect x="1" y="1" width="118" height="5" fill="#2a2c31"/>
  <g fill="#fff6dc">${[14, 36, 58, 82, 104].map((x) => `<ellipse cx="${x}" cy="8" rx="4" ry="1.2"/>`).join("")}</g>
  <rect x="14" y="26" width="26" height="6" fill="#6a4a34"/>
  <rect x="82" y="24" width="22" height="8" fill="#6a4a34"/>
  <circle cx="72" cy="26" r="4" fill="#3d6a3a"/><rect x="71" y="29" width="2" height="6" fill="#4a3a2a"/>
  <path d="${Array.from({ length: 11 }, (_, i) => `M${10 * (i + 1)} 1V39`).join("")}" stroke="#1f2125" stroke-width="1.4"/>
  <path d="M1 12H119" stroke="#1f2125" stroke-width="1.2"/>
  <rect x="50" y="12" width="20" height="27" fill="none" stroke="#14161a" stroke-width="2"/>
  <path d="M60 12V39" stroke="#14161a" stroke-width="2"/>
  <rect x="57" y="24" width="1.4" height="6" fill="#d9d9d9"/><rect x="61.6" y="24" width="1.4" height="6" fill="#d9d9d9"/>
  <rect x="0" y="37" width="120" height="3" fill="#303338"/>
</svg>`,
  { size: 512 },
);

const SLIT = svg(
  `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="30" height="100" fill="#20252b"/>
  <rect x="3" y="3" width="24" height="94" fill="#516c7a"/>
  <path d="M3 50H27" stroke="#20252b" stroke-width="3"/>
  <path d="M3 97L27 52M3 47L27 5" stroke="#20252b" stroke-width="2.6"/>
  <path d="M5 30L25 12" stroke="#fff" stroke-opacity="0.25" stroke-width="3"/>
  <rect x="3" y="70" width="24" height="3" fill="#ffd58c" fill-opacity="0.7"/>
</svg>`,
  { size: 256 },
);

const signSvg = (letter: string) => `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#e8dfc8" stroke="#26262a" stroke-width="6"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#c4572f" stroke-width="3"/>
  <text x="50" y="69" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="58" fill="#26262a">${letter}</text>
</svg>`;
const SIGN_A = svg(signSvg("A"), { size: 192 });
const SIGN_B = svg(signSvg("B"), { size: 192 });

const NAME = svg(
  `<svg viewBox="0 0 380 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="380" height="20" fill="#28282c"/>
  <text x="190" y="15.5" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="15" letter-spacing="9" fill="#e8dfc8">ALDER HOUSE</text>
  <rect x="0" y="0" width="380" height="1.2" fill="#c4572f"/>
</svg>`,
  { size: 1024 },
);

// ---------------------------------------------------------------------------------------------------------------
// Geometry collection: many pieces per material become one part each

type Fill = ColorInput;
interface Bucket {
  fill: Fill;
  tex?: THREE.Texture;
  geos: THREE.BufferGeometry[];
  glowS?: number;
}
const buckets = new Map<string, Bucket>();

function put(key: string, fill: Fill, geo: THREE.BufferGeometry, tex?: THREE.Texture, glowS?: number) {
  let bk = buckets.get(key);
  if (!bk) buckets.set(key, (bk = { fill, tex, geos: [], glowS }));
  bk.geos.push(geo);
}

function flush() {
  for (const [key, bk] of buckets) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) throw new Error(`could not merge ${key}`);
    const part = b.part(merged, bk.fill, { at: [0, 0, 0], texture: bk.tex, name: key });
    if (bk.glowS) glow(part, bk.glowS);
  }
}

/** A box between extents, collected. */
function blk(key: string, fill: Fill, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  put(key, fill, g);
}

/** A box between extents, kept as its own part. */
function solid(name: string, fill: Fill, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  return b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), fill, {
    at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    name,
  });
}

const FACE = { pz: 0, nz: Math.PI, px: Math.PI / 2, nx: -Math.PI / 2 };
type Face = keyof typeof FACE;

/** A flat card facing one of four directions. */
function plane(
  key: string,
  fill: Fill,
  w: number,
  h: number,
  face: Face,
  x: number,
  y: number,
  z: number,
  tex?: THREE.Texture,
  glowS?: number,
) {
  const g = new THREE.PlaneGeometry(w, h);
  g.rotateY(FACE[face]);
  g.translate(x, y, z);
  put(key, fill, g, tex, glowS);
}

const palKey = (i: number) => `col${i}`;
const flat = (key: string, fill: string, w: number, h: number, face: Face, x: number, y: number, z: number) =>
  plane(key, fill, w, h, face, x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Main slab: body, floors, fins, parapets

blk("conc.body", CONC, -HL, HL, lvl(0) - ST, TOP, ZB, ZF);

for (let k = 0; k <= 9; k++) {
  blk("conc.slab", CONC, -HL - 0.15, HL + 0.15, lvl(k) - ST, lvl(k), ZBP, ZFP);
  if (GAL.includes(k)) blk("conc.gallery", CONC, -HL - 0.15, HL + 0.15, lvl(k) - ST, lvl(k), ZGP, ZBP);
}

// fins: deep on even lines, shallow on odd lines at the front; slim pilasters at the back
for (let j = 0; j <= N; j++) {
  const x = finX(j);
  const deep = j % 2 === 0;
  blk("conc.fin", CONC, x - 0.15, x + 0.15, lvl(0) - ST, deep ? TOP + 1.6 : TOP, ZF, deep ? ZFP : 6.2);
  blk("conc.fin", CONC, x - 0.15, x + 0.15, lvl(0) - ST, TOP, ZBP, ZB);
  blk("conc.fin", CONC, x - 0.2, x + 0.2, lvl(0) - ST, TOP + 0.6, ZBP - 0.3, ZBP);
}

// gable end walls with vertical relief ribs
for (const s of [1, -1]) {
  const x0 = s * (HL - 0.15);
  const x1 = s * (HL + 0.15);
  blk("conc.end", CONC, Math.min(x0, x1), Math.max(x0, x1), lvl(0) - ST, TOP, ZBP, ZFP);
  for (const z of [-4.2, -2.1, 0, 2.1, 4.2]) {
    const xa = s * (HL + 0.15);
    const xb = s * (HL + 0.7);
    blk("conc.rib", CONC, Math.min(xa, xb), Math.max(xa, xb), lvl(0), TOP - 0.4, z - 0.17, z + 0.17);
  }
  for (const k of [3, 6]) {
    const xa = s * (HL + 0.15);
    const xb = s * (HL + 0.55);
    blk("conc.rib", CONC, Math.min(xa, xb), Math.max(xa, xb), lvl(k) - 0.15, lvl(k) + 0.15, ZBP, ZFP);
  }
}

// front parapets with coping, every storey
for (let k = 0; k < 9; k++) {
  const y = lvl(k);
  blk("conc.par", CONC, -HL - 0.15, HL + 0.15, y, y + 1.1, 6.82, 7.0);
  blk("conc.par", CONC, -HL - 0.15, HL + 0.15, y + 1.1, y + 1.2, 6.74, 7.08);
}
// gallery parapets at the back
for (const k of GAL) {
  const y = lvl(k);
  blk("conc.par", CONC, -HL - 0.15, HL + 0.15, y, y + 1.1, ZGP, ZGP + 0.18);
  blk("conc.par", CONC, -HL - 0.15, HL + 0.15, y + 1.1, y + 1.2, ZGP - 0.08, ZGP + 0.26);
}

// ---------------------------------------------------------------------------------------------------------------
// Bays: windows, coloured loggia walls, doors, clutter

for (let k = 0; k < 9; k++) {
  const y = lvl(k);
  const gallery = GAL.includes(k);
  for (let i = 0; i < N; i++) {
    const x = bayX(i);

    // --- front loggia
    const r = R();
    const tex =
      r < 0.5
        ? ["win.dark", WIN_DARK]
        : r < 0.72
          ? ["win.cream", WIN_CREAM]
          : r < 0.87
            ? ["win.orange", WIN_ORANGE]
            : ["win.lit", WIN_LIT];
    plane(tex[0] as string, "#ffffff", 2.7, 2.1, "pz", x, y + 1.45, ZF + 0.05, tex[1] as THREE.Texture, tex[0] === "win.lit" ? 0.8 : undefined);
    if (R() < 0.55) {
      const c = Math.floor(R() * PAL.length);
      flat(palKey(c), PAL[c], 3.3, 2.6, "pz", x, y + 1.3, ZF + 0.02);
      if (R() < 0.7) flat(palKey(c), PAL[c], 3.3, 0.7, "pz", x, y + 0.6, ZFP + 0.012);
    }
    // sills and lintel shadows
    blk("conc.sill", CONC, x - 1.45, x + 1.45, y, y + 0.12, ZF, ZF + 0.28);

    const rc = R();
    if (rc < 0.2) {
      const px = x + (R() - 0.5) * 1.8;
      const pot = new THREE.CylinderGeometry(0.2, 0.15, 0.36, 6);
      pot.translate(px, y + 0.18, 6.3);
      put("pot", "#b5653c", pot);
      const bush = new THREE.SphereGeometry(0.36, 6, 4);
      bush.translate(px, y + 0.7, 6.3);
      put("plant", R() < 0.5 ? "#4f7d3a" : "#6b9444", bush);
    } else if (rc < 0.34) {
      const col = LAUNDRY[Math.floor(R() * LAUNDRY.length)];
      const g = new THREE.BoxGeometry(0.7, 0.85, 0.02);
      g.translate(x + (R() - 0.5) * 1.4, y + 1.7, 6.2);
      put(`laundry${col}`, col, g);
      const line = new THREE.BoxGeometry(1.8, 0.02, 0.02);
      line.translate(x, y + 2.15, 6.2);
      put("line", "#2b2b2b", line);
    } else if (rc < 0.42) {
      const g = new THREE.BoxGeometry(0.8, 0.5, 0.3);
      g.translate(x + 1.0, y + 2.0, ZF + 0.2);
      put("ac", "#d8d8d2", g);
    }

    // --- back facade
    if (gallery) {
      const c = Math.floor(R() * DOORS.length);
      plane(`door${c}`, DOORS[c], 0.95, 2.1, "nz", x + 0.9, y + 1.05, ZB - 0.03, DOOR);
      plane("win.dark", "#ffffff", 1.1, 0.9, "nz", x - 0.7, y + 1.5, ZB - 0.03, WIN_DARK);
      const lamp = new THREE.BoxGeometry(0.22, 0.12, 0.1);
      lamp.translate(x + 0.9, y + 2.35, ZB - 0.07);
      put("lamp", "#ffd48a", lamp, undefined, 1.5);
    } else {
      const lit = R() < 0.12;
      plane(lit ? "rib.lit" : "rib.dark", "#ffffff", 3.0, 1.2, "nz", x, y + 1.5, ZB - 0.03, lit ? RIB_LIT : RIB_DARK, lit ? 0.8 : undefined);
    }
  }
}
// colour bands along the gallery fronts
GAL.forEach((k, n) => {
  const c = [2, 1, 0][n];
  flat(palKey(c), PAL[c], L + 0.3, 0.7, "nz", 0, lvl(k) + 0.55, ZGP - 0.085);
});

// ---------------------------------------------------------------------------------------------------------------
// Ground storey: pilotis, beams, lobby, end cores, planters

for (const j of [3, 6, 9, 12]) {
  for (const z of [4.3, -4.3]) {
    b.frustumBox([finX(j), -0.2, z], [finX(j), lvl(0) - ST, z], [0.95, 1.5], [1.5, 2.6], {
      color: CONC_D,
      name: `piloti.${j}.${z > 0 ? "f" : "b"}`,
    });
  }
}
for (const z of [4.3, -4.3]) blk("conc.beam", CONC_D, -HL, HL, lvl(0) - ST - 0.7, lvl(0) - ST, z - 0.5, z + 0.5);

// lobby
blk("conc.ground", CONC_D, -6.2, 6.2, -0.2, 0.45, -3.2, 3.2);
blk("conc.ground", CONC_D, -6.2, 6.2, 4.1, 4.6, -3.2, 3.2);
plane("lobby", "#ffffff", 12.2, 3.65, "pz", 0, 2.3, 3.0, LOBBY, 0.75);
plane("lobby", "#ffffff", 6.2, 3.65, "px", 6.0, 2.3, 0, LOBBY, 0.75);
plane("lobby", "#ffffff", 6.2, 3.65, "nx", -6.0, 2.3, 0, LOBBY, 0.75);
plane("lobby", "#ffffff", 12.2, 3.65, "nz", 0, 2.3, -3.0, LOBBY, 0.75);
// steps
blk("conc.ground", CONC_D, -3.4, 3.4, 0, 0.45, 3.0, 4.0);
blk("conc.ground", CONC_D, -3.4, 3.4, 0, 0.3, 4.0, 5.0);
blk("conc.ground", CONC_D, -3.4, 3.4, 0, 0.15, 5.0, 6.0);
// canopy with name fascia
solid("canopy", CONC_D, -8, 8, 3.9, 4.25, 2.6, 8.0);
solid("canopy.fascia", CONC_D, -8, 8, 3.3, 4.25, 7.75, 8.0);
plane("sign.name", "#ffffff", 15.6, 0.8, "pz", 0, 3.8, 8.015, NAME);
blk("conc.post", CONC_D, -7.75, -7.45, 0, 3.9, 7.5, 7.8);
blk("conc.post", CONC_D, 7.45, 7.75, 0, 3.9, 7.5, 7.8);

// end cores with louvres and doors
for (const s of [1, -1]) {
  const x0 = s > 0 ? 21 : -27;
  blk("conc.core", CONC_D, x0, x0 + 6, -0.2, lvl(0) - ST, -4.9, 4.9);
  const cx = x0 + 3;
  plane("louvre.dark", "#6e7274", 3.0, 2.6, "pz", cx - 0.9, 2.0, 4.92, LOUVRE);
  plane("louvre.dark", "#6e7274", 3.0, 2.6, "nz", cx - 0.9, 2.0, -4.92, LOUVRE);
  plane("door0", DOORS[s > 0 ? 0 : 2], 1.3, 2.8, "pz", cx + 1.7, 1.4, 4.92, DOOR);
}

// planters with shrubs
[-12, -6.5, 6.5, 12].forEach((x, i) => {
  solid(`planter${i}`, CONC_D, x - 1.6, x + 1.6, 0, 0.95, 9.3, 10.6);
  for (const dx of [-0.8, 0.5]) {
    b.part(new THREE.IcosahedronGeometry(0.7, 0), i % 2 ? "#4f7d3a" : "#64904a", {
      at: [x + dx, 1.25, 9.95],
      scale: [1.1, 0.85, 1],
      name: `shrub${i}`,
    });
  }
});

// ---------------------------------------------------------------------------------------------------------------
// Stair / lift towers and bridges

function tower(s: 1 | -1, TH: number, letter: "A" | "B") {
  const cx = s * TCX;
  const cz = TCZ;
  blk("conc.tower", CONC_T, cx - 3.3, cx + 3.3, -0.2, TH, cz - 4, cz + 4);
  for (const dx of [-3.3, 3.3])
    for (const dz of [-4, 4]) blk("conc.tower", CONC_T, cx + dx - 0.35, cx + dx + 0.35, -0.2, TH, cz + dz - 0.35, cz + dz + 0.35);
  for (let n = -1; lvl(n) < TH - 0.5; n++)
    blk("conc.tower", CONC_T, cx - 3.55, cx + 3.55, lvl(n) - 0.25, lvl(n), cz - 4.25, cz + 4.25);

  for (let n = -1; ; n++) {
    const y0 = lvl(n) + 0.3;
    if (y0 + 2.4 > TH - 0.8) break;
    const yc = y0 + 1.2;
    for (const dx of [-2.2, 2.2]) {
      plane("slit", "#ffffff", 0.9, 2.4, "pz", cx + dx, yc, cz + 4.02, SLIT);
      plane("slit", "#ffffff", 0.9, 2.4, "nz", cx + dx, yc, cz - 4.02, SLIT);
    }
    plane("slit", "#ffffff", 0.9, 2.4, "px", cx + 3.32, yc, cz + 1.6, SLIT);
    plane("slit", "#ffffff", 0.9, 2.4, "nx", cx - 3.32, yc, cz + 1.6, SLIT);
    plane("slit", "#ffffff", 0.9, 2.4, "px", cx + 3.32, yc, cz - 1.6, SLIT);
    plane("slit", "#ffffff", 0.9, 2.4, "nx", cx - 3.32, yc, cz - 1.6, SLIT);
  }

  // entrance, canopy and number discs
  plane("door1", DOORS[1], 1.3, 2.7, "pz", cx - 0.65, 1.35, cz + 4.03, DOOR);
  plane("door1", DOORS[1], 1.3, 2.7, "pz", cx + 0.65, 1.35, cz + 4.03, DOOR);
  blk("conc.tower", CONC_T, cx - 1.8, cx + 1.8, 2.9, 3.2, cz + 4, cz + 5.9);
  const sign = letter === "A" ? SIGN_A : SIGN_B;
  plane(`sign.${letter}`, "#ffffff", 2.6, 2.6, "pz", cx, TH - 3.6, cz + 4.03, sign);
  plane(`sign.${letter}`, "#ffffff", 2.6, 2.6, "nz", cx, TH - 3.6, cz - 4.03, sign);

  // plant-room crown
  blk("conc.crown", CONC_T, cx - 4.0, cx + 4.0, TH, TH + 0.6, cz - 4.7, cz + 4.7);
  blk("conc.crown", CONC_T, cx - 3.5, cx + 3.5, TH + 0.6, TH + 3.8, cz - 4.2, cz + 4.2);
  blk("conc.crown", CONC_T, cx - 4.0, cx + 4.0, TH + 3.8, TH + 4.3, cz - 4.7, cz + 4.7);
  plane("louvre.crown", "#7d8286", 6.2, 2.5, "pz", cx, TH + 2.2, cz + 4.22, LOUVRE);
  plane("louvre.crown", "#7d8286", 6.2, 2.5, "nz", cx, TH + 2.2, cz - 4.22, LOUVRE);
  plane("louvre.crown", "#7d8286", 7.8, 2.5, "px", cx + 3.52, TH + 2.2, cz, LOUVRE);
  plane("louvre.crown", "#7d8286", 7.8, 2.5, "nx", cx - 3.52, TH + 2.2, cz, LOUVRE);
  // lift motor room and mast
  blk("conc.crown", CONC_T, cx - 1.6, cx + 1.6, TH + 4.3, TH + 6.3, cz - 1.6, cz + 1.6);
  b.rod([cx + 1.0, TH + 6.3, cz], [cx + 1.0, TH + 11.0, cz], 0.07, "#9aa0a6", { name: `mast${letter}` });
  b.rod([cx + 1.0 - 0.9, TH + 9.4, cz], [cx + 1.0 + 0.9, TH + 9.4, cz], 0.04, "#9aa0a6", { name: `mastbar${letter}` });
  // warning light
  b.part(new THREE.SphereGeometry(0.16, 6, 4), "#ff5a3c", { at: [cx + 1.0, TH + 11.1, cz], name: `beacon${letter}` });
}
tower(1, 37, "A");
tower(-1, 35, "B");
glowBeacons();
function glowBeacons() {
  // beacons were added as plain parts; make them self-lit via their meshes
  b.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.name.startsWith("beacon")) glow(m, 1.6);
  });
}

// bridges between slab and towers
for (const s of [1, -1]) {
  for (const k of GAL) {
    const xa = s * (HL + 0.15);
    const xb = s * (TCX - 3.3);
    const x0 = Math.min(xa, xb);
    const x1 = Math.max(xa, xb);
    blk("conc.bridge", CONC_T, x0, x1, lvl(k) - ST, lvl(k) + 2.9, -6.7, -4.5);
    const mx = (x0 + x1) / 2;
    plane("rib.dark", "#ffffff", 2.6, 1.0, "pz", mx, lvl(k) + 1.5, -4.48, RIB_DARK);
    plane("rib.dark", "#ffffff", 2.6, 1.0, "nz", mx, lvl(k) + 1.5, -6.72, RIB_DARK);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Roof terrace

// parapets
blk("conc.roof", CONC_L, -HL - 0.15, HL + 0.15, TOP, TOP + 1.0, 6.8, 7.0);
blk("conc.roof", CONC_L, -HL - 0.15, HL + 0.15, TOP + 1.0, TOP + 1.1, 6.72, 7.08);
blk("conc.roof", CONC_L, -HL - 0.15, HL + 0.15, TOP, TOP + 1.0, ZBP, ZBP + 0.2);
blk("conc.roof", CONC_L, -HL - 0.15, HL + 0.15, TOP + 1.0, TOP + 1.1, ZBP - 0.08, ZBP + 0.28);
for (const s of [1, -1]) blk("conc.roof", CONC_L, s * HL - 0.2 + (s > 0 ? 0.35 : 0), s * HL + 0.2 + (s > 0 ? 0.35 : 0), TOP, TOP + 1.0, ZBP, ZFP);

// plant house with overhanging roof, louvres and four stacks
solid("planthouse", CONC_L, -10, 4, TOP, TOP + 3.4, -3.2, 1.6);
solid("planthouse.roof", CONC_L, -10.6, 4.6, TOP + 3.4, TOP + 3.8, -3.8, 2.2);
plane("louvre.plant", "#8b8f90", 12, 2.4, "pz", -3, TOP + 1.7, 1.62, LOUVRE);
plane("louvre.plant", "#8b8f90", 12, 2.4, "nz", -3, TOP + 1.7, -3.22, LOUVRE);
[-8.2, -4.4, -0.6, 3.0].forEach((x, i) => {
  b.frustumBox([x, TOP + 3.8, -0.8], [x, TOP + 7.2, -0.8], [1.5, 1.5], [0.95, 0.95], { color: CONC_L, name: `stack${i}` });
  solid(`stackcap${i}`, CONC_L, x - 0.7, x + 0.7, TOP + 7.2, TOP + 7.45, -1.5, -0.1);
});

// barrel-vault gym
{
  const vx = 17;
  const vz = 0.5;
  const Rw = 4.5;
  const Hv = 3.4;
  const t = 0.3;
  solid("vault.plinth", CONC_L, vx - 4.8, vx + 4.8, TOP, TOP + 0.5, vz - 5.2, vz + 5.2);
  const outline: [number, number][] = [];
  for (let a = 0; a <= 8; a++) outline.push([Rw * Math.cos((Math.PI * a) / 8), Hv * Math.sin((Math.PI * a) / 8)]);
  for (let a = 8; a >= 0; a--) outline.push([(Rw - t) * Math.cos((Math.PI * a) / 8), (Hv - t) * Math.sin((Math.PI * a) / 8)]);
  b.extrude(outline, { at: [vx, TOP + 0.5, vz], x: [1, 0, 0], thickness: 10, color: CONC_L, name: "vault.shell" });
  const glass: [number, number][] = [];
  for (let a = 0; a <= 8; a++) glass.push([(Rw - t) * Math.cos((Math.PI * a) / 8), (Hv - t) * Math.sin((Math.PI * a) / 8)]);
  for (const s of [1, -1]) {
    b.extrude(glass, { at: [vx, TOP + 0.5, vz + s * 4.9], x: [1, 0, 0], thickness: 0.14, color: "#86a9b3", name: "vault.glass" });
    for (let m = -3; m <= 3; m++) {
      const x = m * 1.2;
      const hh = (Hv - t) * Math.sqrt(Math.max(0, 1 - (x / (Rw - t)) ** 2));
      blk("steel", "#2d3034", vx + x - 0.04, vx + x + 0.04, TOP + 0.5, TOP + 0.5 + hh, vz + s * 4.96 - 0.04, vz + s * 4.96 + 0.04);
    }
  }
}

// stepped amphitheatre
for (let i = 0; i < 4; i++) solid(`amph${i}`, CONC_L, -22.5, -13.5, TOP, TOP + 0.38 * (i + 1), 5.2 - i * 1.5, 6.7 - i * 1.5);

// pergola
for (const x of [5.8, 7.8, 9.8]) {
  for (const z of [2.2, 5.4]) blk("conc.pergola", CONC_L, x - 0.12, x + 0.12, TOP, TOP + 2.8, z - 0.12, z + 0.12);
  blk("conc.pergola", CONC_L, x - 0.12, x + 0.12, TOP + 2.8, TOP + 3.0, 2.0, 5.6);
}
for (let z = 2.2; z <= 5.4; z += 0.8) blk("conc.pergola", CONC_L, 5.6, 10.0, TOP + 3.0, TOP + 3.08, z - 0.06, z + 0.06);

// roof shrubs, dishes, ventilators
[[-21, 3.2], [-14.5, 3.0], [24, 5.5], [24.5, -3.5], [-25, -3.5], [11.5, -4.5]].forEach(([x, z], i) => {
  b.part(new THREE.IcosahedronGeometry(0.7, 0), i % 2 ? "#587f3d" : "#6b9444", {
    at: [x, TOP + 0.7, z],
    scale: [1.2, 0.9, 1.1],
    name: `roofshrub${i}`,
  });
});
[[-12, 5.8], [-24, -3], [24.5, 1]].forEach(([x, z], i) => {
  const d = new THREE.SphereGeometry(0.5, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  d.rotateX(-Math.PI / 2 - 0.4);
  d.translate(x, TOP + 1.7, z);
  put("dish", "#ececea", d);
  blk("steel", "#2d3034", x - 0.04, x + 0.04, TOP, TOP + 1.7, z - 0.04, z + 0.04);
  void i;
});
for (const x of [-6, -2, 2]) {
  const c = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 8);
  c.translate(x, TOP + 4.1, 1.0);
  put("vent", "#8a8e90", c);
}

flush();

return_root();
function return_root() {
  /* builder is read by the default export below */
}

export default function build() {
  return b.root;
}
