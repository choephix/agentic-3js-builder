```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  countershade,
  grain,
  mottle,
  spots,
  stripes,
  scales,
  svg,
  frame,
  catmull,
  bezier,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Viking Longhouse Feast Table",
  description:
    "A Valheim-style hewn-oak feast table with carved dragon-head trestles, rune-cut edge, embroidered runner, benches, lord and lady chairs, a roast boar, loaves, cheese, stew, fish, a mead keg, horns, tankards and candelabras.",
};

type V3t = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Hewn timber: warm grain on lit faces, cool dark grain below, soot blotches and floor grime near y = 0. */
function wood(a: string, b2: string, c: string, d: string, axis: "x" | "y" | "z", seed: number) {
  const top = grain(a, b2, { size: 0.03, axis, seed });
  const side = grain(c, d, { size: 0.03, axis, seed: seed + 2 });
  const base = countershade(top, side, { level: 0.1, soft: 0.6 });
  return paint((p, n) => {
    let col = base.at(p, n);
    col = mix(col, "#241609", 0.4 * smoothstep(0.62, 0.86, noise(p, 0.22, seed + 9)));
    col = mix(col, "#1c140c", 0.5 * smoothstep(0.14, 0.0, p.y));
    return col;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const INKC = "#21130a";

function runnerSvg() {
  let s = `<svg viewBox="0 0 600 84" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect x="14" y="2" width="572" height="80" fill="#8c2a22"/>`;
  for (let i = 0; i < 54; i++) {
    const x = 26 + i * 10;
    s += `<path d="M${x} 12 l5 7 l5 -7z" fill="#d9b45c"/><path d="M${x} 72 l5 -7 l5 7z" fill="#d9b45c"/>`;
  }
  s += `<rect x="14" y="2" width="572" height="80" fill="none" stroke="#14272f" stroke-width="4"/>`;
  s += `<rect x="22" y="22" width="556" height="40" fill="none" stroke="#d9b45c" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) {
    const cx = 47 + i * 46;
    s += `<g transform="translate(${cx} 42)">
      <path d="M0 -19 L20 0 L0 19 L-20 0Z" fill="#14272f" stroke="#d9b45c" stroke-width="2.2"/>
      <path d="M0 -11 L11 0 L0 11 L-11 0Z" fill="#8c2a22" stroke="#e8d7a0" stroke-width="1.5"/>
      <circle r="3.4" fill="#d9b45c"/></g>`;
    if (i < 11) s += `<circle cx="${cx + 23}" cy="42" r="2.6" fill="#e8d7a0"/>`;
  }
  for (let y = 4; y < 82; y += 6) {
    s += `<rect x="0" y="${y}" width="14" height="3" fill="#e6d6a8"/><rect x="586" y="${y}" width="14" height="3" fill="#e6d6a8"/>`;
  }
  return s + `</svg>`;
}

function carveSvg() {
  let tri = "";
  for (let k = 0; k < 3; k++)
    tri += `<polygon points="110,13 142,67 78,67" transform="rotate(${k * 120} 110 49)"/>`;
  const curl = `<path d="M52 50 C52 40 40 38 36 46 C32 56 42 66 52 62 C62 58 62 40 46 30 C30 20 14 34 14 50 C14 66 22 78 36 82"/>`;
  const grp = (stroke: string, w: number) =>
    `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
      ${tri}<circle cx="110" cy="49" r="41"/>${curl}<g transform="translate(220 0) scale(-1 1)">${curl}</g>
      <path d="M8 6H212M8 94H212"/></g>`;
  return `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(1 1.3)">${grp("#b58a52", 2.4)}</g>${grp("#20120a", 3.6)}
    <circle cx="110" cy="49" r="5" fill="#20120a"/></svg>`;
}

const GLYPHS = [
  "M1 1V19M1 7L9 2M1 12L9 7",
  "M1 19V1L9 6V19",
  "M1 1V19M1 5L9 10L1 15",
  "M1 1V19M1 3L9 8M1 9L9 14",
  "M1 19V1H6L9 5L6 9H1M1 9L9 19",
  "M8 3L1 10L8 17",
  "M1 3L9 17M9 3L1 17",
  "M1 1V19M1 3L8 9L1 15",
  "M1 1V19M9 1V19M1 7L9 13",
  "M5 1V19M1 7L9 13",
  "M5 1V19",
  "M8 2L2 9L8 11L2 18",
  "M5 19V1M1 6L5 1L9 6",
  "M1 19V1L8 5L1 10L8 15L1 19",
];

function runeSvg() {
  let s = `<svg viewBox="0 0 1120 20" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${INKC}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">`;
  for (let i = 0; i < 56; i++) {
    const g = GLYPHS[(i * 5 + Math.floor(i / 7)) % GLYPHS.length];
    s += `<path d="${g}" transform="translate(${i * 20 + 4} 0) scale(1.1 1)"/>`;
  }
  s += `</g><g fill="${INKC}">`;
  for (let i = 0; i < 56; i++) s += `<circle cx="${i * 20 + 17}" cy="10" r="1.3"/>`;
  return s + `</g></svg>`;
}

const FOOD_A = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="42" cy="54" rx="30" ry="19" transform="rotate(-25 42 54)" fill="#7e3a1c" stroke="#2a130a" stroke-width="3.5"/>
  <ellipse cx="42" cy="50" rx="22" ry="11" transform="rotate(-25 42 54)" fill="#a8532a"/>
  <path d="M24 60 L60 42" stroke="#e3a383" stroke-width="5" stroke-linecap="round"/>
  <circle cx="75" cy="30" r="13" fill="#e9d9a0" stroke="#2a130a" stroke-width="3"/>
  <path d="M63 27 A13 13 0 0 1 87 27 Z" fill="#9a5a8c"/>
  <circle cx="70" cy="74" r="5" fill="#6fa23a" stroke="#2a130a" stroke-width="1.8"/>
  <circle cx="79" cy="78" r="5" fill="#6fa23a" stroke="#2a130a" stroke-width="1.8"/>
  <circle cx="64" cy="81" r="5" fill="#7fb546" stroke="#2a130a" stroke-width="1.8"/>
  <circle cx="78" cy="66" r="5" fill="#7fb546" stroke="#2a130a" stroke-width="1.8"/></svg>`;

const FOOD_B = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="30" width="38" height="30" rx="8" transform="rotate(-15 33 45)" fill="#d9a152" stroke="#2a130a" stroke-width="3.5"/>
  <rect x="20" y="36" width="26" height="12" rx="5" transform="rotate(-15 33 45)" fill="#f1d9a0"/>
  <polygon points="52,78 90,62 86,86" fill="#ecc455" stroke="#2a130a" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="74" cy="76" r="3" fill="#c28f2b"/><circle cx="82" cy="80" r="2.2" fill="#c28f2b"/>
  <circle cx="72" cy="26" r="15" fill="#b3261e" stroke="#2a130a" stroke-width="3.5"/>
  <path d="M72 11 Q76 4 82 6" stroke="#2a130a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="66" cy="21" rx="4" ry="6" fill="#e0675a"/></svg>`;

const FOOD_C = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#2a130a" stroke-width="3" stroke-linecap="round" fill="#efe4c4">
    <path d="M12 50 L78 40" fill="none" stroke-width="7"/><path d="M12 50 L78 40" fill="none" stroke="#efe4c4" stroke-width="3.2"/>
    <path d="M26 48 L22 30 M38 46 L35 28 M50 44 L48 26 M62 42 L61 24 M26 49 L24 68 M38 47 L38 66 M50 46 L52 64 M62 44 L66 62" fill="none" stroke-width="2.6"/>
    <circle cx="82" cy="40" r="9"/><circle cx="85" cy="36" r="1.8" fill="#2a130a"/></g>
  <path d="M68 78 q8 -10 16 0 q-8 10 -16 0z" fill="#b5a46a" stroke="#2a130a" stroke-width="3"/>
  <circle cx="30" cy="82" r="2" fill="#c9a35a"/><circle cx="40" cy="86" r="1.6" fill="#c9a35a"/><circle cx="20" cy="76" r="1.6" fill="#c9a35a"/></svg>`;

const HERB = `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 64 Q21 32 20 4" stroke="#1f3a14" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  ${[0, 1, 2, 3, 4]
    .map((i) => {
      const y = 52 - i * 10;
      return `<ellipse cx="11" cy="${y}" rx="9" ry="4.2" transform="rotate(-28 11 ${y})" fill="#4f8a34" stroke="#1f3a14" stroke-width="1.4"/>
              <ellipse cx="29" cy="${y - 4}" rx="9" ry="4.2" transform="rotate(28 29 ${y - 4})" fill="#5f9c3c" stroke="#1f3a14" stroke-width="1.4"/>`;
    })
    .join("")}
  <ellipse cx="20" cy="6" rx="4" ry="6" fill="#6aa844" stroke="#1f3a14" stroke-width="1.4"/></svg>`;

const FIR = `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 64 L24 3" stroke="#3a2a18" stroke-width="2.6" stroke-linecap="round"/>
  ${Array.from({ length: 10 }, (_, i) => {
    const y = 60 - i * 5.6;
    const w = 17 - i * 1.3;
    const col = i % 2 ? "#2f5a34" : "#3f7a42";
    return `<path d="M24 ${y} L${24 - w} ${y - 9} M24 ${y} L${24 + w} ${y - 9}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
  }).join("")}</svg>`;

const KEGHEAD = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#7a5430" stroke="#241509" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#241509" stroke-width="2.4" stroke-dasharray="5 4"/>
  <path d="M28 66 C26 32 70 28 76 40 C64 38 52 44 48 58 C44 70 32 74 28 66Z" fill="#e0b24a" stroke="#241509" stroke-width="3" stroke-linejoin="round"/>
  <path d="M72 40 L78 36 M26 68 L22 74" stroke="#241509" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M50 14 V24 M50 76 V86 M14 50 H24 M76 50 H86" stroke="#241509" stroke-width="2.4"/></svg>`;

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const TOP_Y = 0.8;
const RUN_Y = TOP_Y + 0.0035;

const BOARD_OUT: [number, number][] = [
  [-0.4, 0], [-0.22, 0], [-0.22, 0.22], [-0.15, 0.34], [0, 0.38], [0.15, 0.34], [0.22, 0.22], [0.22, 0],
  [0.4, 0], [0.34, 0.12], [0.3, 0.38], [0.34, 0.7], [-0.34, 0.7], [-0.3, 0.38], [-0.34, 0.12],
];
const BENCH_END: [number, number][] = [
  [-0.13, 0], [-0.07, 0], [-0.045, 0.12], [0.045, 0.12], [0.07, 0], [0.13, 0], [0.105, 0.4], [-0.105, 0.4],
];
const DRAGON: [number, number][] = [
  [0, 0], [0.03, 0.14], [0.02, 0.22], [0.1, 0.26], [0.07, 0.18], [0.16, 0.16], [0.22, 0.1], [0.16, 0.07], [0.18, 0.03], [0.08, 0],
];
const BLADE: [number, number][] = [[0, -0.008], [0.085, -0.008], [0.125, 0.002], [0.085, 0.008], [0, 0.008]];
const TAIL: [number, number][] = [[0, 0], [0.035, 0.03], [0.022, 0], [0.035, -0.03]];
const FIN: [number, number][] = [[-0.03, 0], [0.02, 0.028], [0.03, 0]];
const WEDGE: [number, number][] = [[0, 0], [0.075, 0.026], [0.075, -0.026]];
const PLATE_PROFILE: [number, number][] = [[0, 0], [0.085, 0], [0.105, 0.022], [0.095, 0.024], [0.075, 0.012], [0, 0.012]];
const POT_PROFILE: [number, number][] = [
  [0, 0], [0.07, 0], [0.11, 0.04], [0.125, 0.1], [0.12, 0.15], [0.126, 0.165],
  [0.112, 0.165], [0.108, 0.15], [0.112, 0.1], [0.098, 0.05], [0.06, 0.02], [0, 0.02],
];
const BOWL_PROFILE: [number, number][] = [[0, 0], [0.06, 0], [0.11, 0.05], [0.125, 0.075], [0.115, 0.08], [0.1, 0.058], [0.055, 0.017], [0, 0.017]];
const KEG_PROFILE: [number, number][] = [[0, -0.17], [0.095, -0.17], [0.118, -0.1], [0.135, 0], [0.118, 0.1], [0.095, 0.17], [0, 0.17]];

const oval = (rx: number, rz: number, n = 18): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * rx, Math.sin(a) * rz];
  });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "feast_table", paintSize: 2048 });
  const R = rng(7);

  // ---- textures
  const RUNNER = svg(runnerSvg(), { size: 2048 });
  const CARVE = svg(carveSvg(), { size: 1024 });
  const RUNES = svg(runeSvg(), { size: 2048 });
  const T_FOOD_A = svg(FOOD_A, { size: 256 });
  const T_FOOD_B = svg(FOOD_B, { size: 256 });
  const T_FOOD_C = svg(FOOD_C, { size: 256 });
  const T_HERB = svg(HERB, { size: 192 });
  const T_FIR = svg(FIR, { size: 192 });
  const T_KEG = svg(KEGHEAD, { size: 256 });

  // ---- materials
  const IRON = metal("iron", { tarnish: 0.5 });
  const STEEL = metal("steel");
  const BRONZE = metal("bronze", { verdigris: 0.25 });
  const GILT = metal("gilt");
  const BOARD = wood("#6a4a2a", "#86613a", "#43301d", "#5a4026", "y", 2);
  const BENCH = wood("#6b4a2b", "#8a6538", "#43301d", "#5a4026", "x", 31);
  const CHAIRW = wood("#5b3d22", "#7a5430", "#3a281a", "#4e3620", "y", 41);
  const DARKW = wood("#4a3220", "#5f4129", "#2e2014", "#3d2a19", "x", 51);
  const PLATEW = wood("#8a6a3e", "#a98550", "#5a4126", "#6f5230", "x", 21);
  const MUG1 = wood("#7a5028", "#9a6c38", "#4a3018", "#5f4022", "y", 61);
  const MUG2 = wood("#5a3c22", "#744e2c", "#35241a", "#4a3220", "y", 62);
  const MUGS: ColorInput[] = [MUG1, MUG2, MUG2, MUG1];
  const CREAM = "#e9dcb4";
  const CANDLE = "#efe3c0";
  const FLAME = "#ffb93a";
  const FLAMEHOT = "#fff3b0";
  const DARK = "#1d120b";
  const HORNP = mottle("#e8dcb8", "#c4b48a", { size: 0.03, seed: 3 });

  // ---- tiny helpers
  const box = (w: number, h: number, d: number, color: ColorInput, at: V3t, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: V3t, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, flat: true, ...o });
  const ball = (r: number, color: ColorInput, at: V3t, scale?: V3t, o: any = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, flat: true, ...(scale ? { scale } : {}), ...o });
  const ell = (c: V3t, r: V3t, color: ColorInput, o: any = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { at: c, scale: r, flat: true, ...o });
  const planeOn = (w: number, h: number, tex: THREE.Texture, at: V3t, dir: V3t, up?: V3t) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...(up ? { up } : {}) });

  const dragonHead = (at: V3t, xdir: V3t, th: number, color: ColorInput) => {
    const hd = b.extrude(DRAGON, { at, x: xdir, thickness: th, bevel: 0.006, color });
    for (const w of [1, -1]) {
      ball(0.011, "#f0c850", hd.local([0.125, 0.15, w * (th / 2 + 0.002)]).toArray() as V3t);
      ball(0.006, DARK, hd.local([0.19, 0.108, w * (th / 2)]).toArray() as V3t);
    }
    return hd;
  };

  // =============================================================================================================
  // TABLE
  // =============================================================================================================
  const PLANK_Z = [-0.38, -0.19, 0, 0.19, 0.38];
  PLANK_Z.forEach((z, i) => {
    const len = [3.2, 3.12, 3.2, 3.16, 3.2][i];
    const off = [0, 0.03, -0.02, 0.04, 0][i];
    const pp = wood("#7c5732", "#a07a45", "#4d3420", "#684829", "x", i * 5 + 1);
    box(len, 0.06, 0.188, pp, [off, 0.77 + (R() - 0.5) * 0.004, z]);
  });

  // cleats under the top, with wooden pegs showing on the planks
  for (const s of [1, -1]) {
    box(0.13, 0.04, 0.86, DARKW, [s * 1.15, 0.72, 0]);
    for (const z of PLANK_Z) cyl(0.009, 0.009, 0.008, 6, DARKW, [s * 1.15, TOP_Y + 0.0005, z]);
  }

  // rune-cut front and back edges
  planeOn(3.18, 0.045, RUNES, [0, 0.772, 0.4775], [0, 0, 1]);
  planeOn(3.18, 0.045, RUNES, [0, 0.772, -0.4775], [0, 0, -1]);

  // trestle end boards with carved panels
  for (const s of [1, -1]) {
    b.extrude(BOARD_OUT, { at: [s * 1.15, 0, 0], x: [0, 0, 1], thickness: 0.07, bevel: 0.008, color: BOARD });
    for (const t of [1, -1]) planeOn(0.58, 0.26, CARVE, [s * 1.15 + t * 0.037, 0.56, 0], [t, 0, 0]);
    // wedge keys through the stretcher
    box(0.03, 0.17, 0.06, DARKW, [s * 1.255, 0.6, 0], { rotation: [0, 0, s * 4] });
    dragonHead([s * 1.3, 0.46, 0], [s, 0, 0], 0.07, BOARD);
    // foot blocks
    for (const z of [-0.31, 0.31]) box(0.11, 0.05, 0.16, DARKW, [s * 1.15, 0.025, z]);
  }
  box(2.64, 0.09, 0.11, DARKW, [0, 0.6, 0]);

  // =============================================================================================================
  // BENCHES, PELT, BLANKET
  // =============================================================================================================
  for (const zc of [0.78, -0.78]) {
    box(2.9, 0.06, 0.28, BENCH, [0, 0.43, zc]);
    box(2.15, 0.05, 0.04, DARKW, [0, 0.365, zc]);
    for (const s of [1, -1]) {
      b.extrude(BENCH_END, { at: [s * 1.1, 0, zc], x: [0, 0, 1], thickness: 0.05, bevel: 0.005, color: BENCH });
      cyl(0.011, 0.011, 0.008, 6, DARKW, [s * 1.1, 0.4625, zc - 0.07]);
      cyl(0.011, 0.011, 0.008, 6, DARKW, [s * 1.1, 0.4625, zc + 0.07]);
    }
  }
  // sheepskin on the front bench
  const PELT = mottle("#e5dcc4", "#bdb191", { size: 0.05, seed: 4 });
  ell([0.55, 0.475, 0.78], [0.3, 0.022, 0.17], PELT);
  for (const [dx, dz] of [[-0.27, -0.11], [-0.27, 0.11], [0.27, -0.11], [0.27, 0.11], [0.0, 0.16]])
    ell([0.55 + dx, 0.472, 0.78 + dz], [0.075, 0.018, 0.055], PELT);
  // woven blankets on the back bench
  const BLANK1 = stripes("#8c2a22", "#d8c68d", { size: 0.07, axis: "x", width: 0.3, wobble: 0.05, seed: 5 });
  const BLANK2 = stripes("#1f3a4a", "#d8c68d", { size: 0.06, axis: "x", width: 0.28, wobble: 0.05, seed: 6 });
  box(0.55, 0.03, 0.3, BLANK1, [-0.6, 0.475, -0.78]);
  box(0.4, 0.025, 0.26, BLANK2, [-0.55, 0.5025, -0.78], { rotation: [0, 6, 0] });

  // =============================================================================================================
  // CHAIRS (lord and lady) at the ends
  // =============================================================================================================
  for (const s of [1, -1]) {
    const X = (d: number) => s * (1.95 + d);
    const furCol = s > 0 ? mottle("#4a3626", "#2f2218", { size: 0.06, seed: 12 }) : PELT;
    box(0.52, 0.07, 0.58, CHAIRW, [X(0), 0.46, 0]);
    box(0.5, 0.045, 0.56, furCol, [X(-0.005), 0.5175, 0]);
    for (const dz of [-0.25, 0.25])
      for (const dd of [-0.22, 0.22]) box(0.07, 0.43, 0.07, CHAIRW, [X(dd), 0.215, dz]);
    box(0.04, 0.04, 0.5, CHAIRW, [X(-0.22), 0.15, 0]);
    box(0.04, 0.04, 0.5, CHAIRW, [X(0.22), 0.15, 0]);
    for (const dz of [-0.25, 0.25]) box(0.44, 0.04, 0.04, CHAIRW, [X(0), 0.15, dz]);
    // back posts, bronze bands, dragon finials
    for (const dz of [-0.29, 0.29]) {
      box(0.08, 1.12, 0.08, CHAIRW, [X(0.26), 0.99, dz]);
      box(0.092, 0.025, 0.092, BRONZE, [X(0.26), 0.62, dz]);
      box(0.092, 0.025, 0.092, BRONZE, [X(0.26), 1.4, dz]);
      dragonHead([X(0.26), 1.55, dz], [-s, 0, 0], 0.05, CHAIRW);
    }
    box(0.06, 0.56, 0.54, CHAIRW, [X(0.26), 0.82, 0]);
    box(0.07, 0.1, 0.66, CHAIRW, [X(0.26), 1.2, 0]);
    planeOn(0.46, 0.21, CARVE, [X(0.26) - s * 0.032, 0.86, 0], [-s, 0, 0]);
    // arms
    for (const dz of [-0.3, 0.3]) {
      box(0.5, 0.05, 0.075, CHAIRW, [X(0), 0.77, dz]);
      box(0.06, 0.29, 0.06, CHAIRW, [X(-0.2), 0.615, dz]);
      ball(0.04, BRONZE, [X(-0.25), 0.77, dz]);
    }
  }

  // =============================================================================================================
  // RUNNER
  // =============================================================================================================
  b.part(new THREE.PlaneGeometry(3.0, 0.42), "#ffffff", {
    at: [0, RUN_Y, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: RUNNER,
  });

  // =============================================================================================================
  // PLACE SETTINGS
  // =============================================================================================================
  const plate = (x: number, z: number, food: THREE.Texture, roll: number) => {
    b.lathe(PLATE_PROFILE, { at: [x, TOP_Y, z], color: PLATEW, segments: 14 });
    b.part(new THREE.CircleGeometry(0.072, 14), "#ffffff", {
      at: [x, TOP_Y + 0.0135, z],
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.cos(roll), 0, Math.sin(roll)],
      texture: food,
    });
  };

  const tankard = (x: number, z: number, col: ColorInput, sgn: number) => {
    const y0 = TOP_Y;
    cyl(0.04, 0.045, 0.11, 10, col, [x, y0 + 0.055, z]);
    cyl(0.0425, 0.0425, 0.012, 10, IRON, [x, y0 + 0.095, z]);
    cyl(0.0458, 0.0458, 0.012, 10, IRON, [x, y0 + 0.015, z]);
    cyl(0.0385, 0.0385, 0.014, 10, "#efe2b4", [x, y0 + 0.108, z]);
    b.sweep(
      catmull([
        [x + sgn * 0.04, y0 + 0.095, z],
        [x + sgn * 0.075, y0 + 0.085, z],
        [x + sgn * 0.078, y0 + 0.035, z],
        [x + sgn * 0.043, y0 + 0.022, z],
      ]),
      0.007,
      { color: col, sides: 5 },
    );
  };

  const knife = (x: number, z: number, t: number) => {
    const dx = Math.cos(t);
    const dz = -Math.sin(t);
    const ex = Math.sin(t);
    const ez = Math.cos(t);
    b.extrude(BLADE, { at: [x, TOP_Y + 0.003, z], x: [dx, 0, dz], y: [ex, 0, ez], thickness: 0.003, color: STEEL });
    cyl(0.008, 0.007, 0.07, 6, DARKW, [x - dx * 0.035, TOP_Y + 0.008, z - dz * 0.035], { dir: [dx, 0, dz] });
    ball(0.009, BRONZE, [x - dx * 0.072, TOP_Y + 0.008, z - dz * 0.072]);
  };

  const horn = (x: number, z: number, sgn: number) => {
    const P = (u: number, v: number, w: number): V3t => [x + sgn * u, TOP_Y + v, z - w];
    const path = bezier(P(0, 0.044, 0), P(0.1, 0.04, 0), P(0.2, 0.045, 0.07), P(0.28, 0.12, 0.09));
    b.sweep(path, [0.04, 0.006], {
      color: HORNP,
      bands: [[0.8, HORNP], [1, "#40332a"]],
      sides: 8,
    });
    b.part(new THREE.TorusGeometry(0.041, 0.0065, 5, 12), STEEL, { at: P(0, 0.044, 0), dir: [sgn, 0, 0], axis: "z" });
    b.part(new THREE.TorusGeometry(0.036, 0.005, 5, 12), STEEL, { at: P(0.035, 0.043, 0.002), dir: [sgn, 0, 0], axis: "z" });
    ball(0.007, STEEL, P(0.28, 0.12, 0.09));
  };

  const SEATS = [-1.0, -0.33, 0.33, 1.0];
  const frontFoods = [T_FOOD_A, T_FOOD_B, T_FOOD_A, T_FOOD_C];
  const backFoods = [T_FOOD_B, T_FOOD_C, T_FOOD_A, T_FOOD_B];
  SEATS.forEach((sx, i) => {
    plate(sx, 0.35, frontFoods[i], i * 1.7);
    plate(sx, -0.35, backFoods[i], i * 2.3 + 1);
    tankard(sx + 0.17, 0.27, MUGS[i], 1);
    knife(sx - 0.14, 0.38, (84 * Math.PI) / 180);
    knife(sx + 0.13, -0.38, (-88 * Math.PI) / 180);
    horn(sx + (sx < 0 ? -0.14 : 0.14), -0.25, sx < 0 ? -1 : 1);
  });

  // =============================================================================================================
  // CANDELABRAS
  // =============================================================================================================
  const candelabra = (x: number) => {
    b.lathe([[0, 0], [0.058, 0], [0.054, 0.012], [0.026, 0.03], [0.014, 0.07], [0, 0.07]], {
      at: [x, RUN_Y, 0],
      color: IRON,
      segments: 8,
    });
    b.rod([x, RUN_Y + 0.06, 0], [x, RUN_Y + 0.4, 0], { radius: 0.011, color: IRON, sides: 6 });
    ball(0.022, IRON, [x, RUN_Y + 0.2, 0]);
    ball(0.016, IRON, [x, RUN_Y + 0.3, 0]);
    const tops: V3t[] = [[x, RUN_Y + 0.4, 0]];
    for (const sz of [1, -1]) {
      b.sweep(
        catmull([
          [x, RUN_Y + 0.3, 0],
          [x, RUN_Y + 0.31, sz * 0.05],
          [x, RUN_Y + 0.34, sz * 0.095],
          [x, RUN_Y + 0.385, sz * 0.12],
        ]),
        [0.008, 0.006],
        { color: IRON, sides: 5 },
      );
      tops.push([x, RUN_Y + 0.385, sz * 0.12]);
    }
    tops.forEach((t, k) => {
      cyl(0.022, 0.014, 0.014, 8, IRON, [t[0], t[1] + 0.005, t[2]]);
      const h = k === 0 ? 0.11 : 0.085;
      cyl(0.0125, 0.0135, h, 7, CANDLE, [t[0], t[1] + 0.012 + h / 2, t[2]]);
      cyl(0.003, 0.003, 0.03, 4, CANDLE, [t[0] + 0.011, t[1] + 0.012 + h - 0.012, t[2]]);
      const top = t[1] + 0.012 + h;
      glow(ball(0.012, FLAME, [t[0], top + 0.018, t[2]], [0.85, 1.9, 0.85]), 1.6);
      glow(ball(0.0065, FLAMEHOT, [t[0], top + 0.013, t[2]], [0.8, 1.7, 0.8]), 2);
    });
  };
  candelabra(-0.89);
  candelabra(0.89);

  // =============================================================================================================
  // THE ROAST BOAR
  // =============================================================================================================
  const platterW = wood("#6e4c2a", "#8e6a3c", "#473120", "#5c4228", "x", 71);
  b.extrude(oval(0.47, 0.19), { at: [0, RUN_Y + 0.015, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.006, color: platterW });
  b.extrude(oval(0.41, 0.145), { at: [0, RUN_Y + 0.0375, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.015, color: "#5a3d22" });

  const crackle = stripes("#b9661f", "#6f3210", { size: 0.05, axis: "x", width: 0.22, wobble: 0.2, seed: 3 });
  const BOAR = paint((p, n) => {
    let c = crackle.at(p, n);
    c = mix(c, "#f2b25a", 0.5 * smoothstep(0.55, 0.95, n.y) * smoothstep(0.45, 0.7, noise(p, 0.05, 8)));
    c = mix(c, "#2b1308", 0.6 * smoothstep(0.6, 0.8, noise(p, 0.08, 4)));
    c = mix(c, "#8a4a20", 0.35 * smoothstep(0.2, -0.8, n.y));
    return c;
  });
  const SNOUT = "#c98a62";
  const y0 = RUN_Y + 0.045;
  const bx = -0.04;
  ell([bx - 0.03, y0 + 0.125, 0], [0.29, 0.14, 0.15], BOAR);
  ell([bx - 0.17, y0 + 0.13, 0], [0.14, 0.145, 0.155], BOAR);
  ell([bx + 0.16, y0 + 0.13, 0], [0.16, 0.14, 0.15], BOAR);
  ell([bx + 0.33, y0 + 0.115, 0], [0.13, 0.105, 0.1], BOAR);
  cyl(0.05, 0.045, 0.09, 8, SNOUT, [bx + 0.44, y0 + 0.085, 0], { dir: [1, 0, 0] });
  cyl(0.046, 0.046, 0.012, 8, "#d9a07c", [bx + 0.49, y0 + 0.085, 0], { dir: [1, 0, 0] });
  for (const z of [-0.016, 0.016]) ball(0.007, DARK, [bx + 0.497, y0 + 0.088, z]);
  for (const z of [-1, 1]) {
    ball(0.012, DARK, [bx + 0.4, y0 + 0.15, z * 0.075]);
    b.spike([bx + 0.3, y0 + 0.2, z * 0.06], [0.1, 0.7, z * 0.8], 0.075, 0.035, { color: BOAR, sides: 5 });
    b.spike([bx + 0.43, y0 + 0.06, z * 0.05], [0.4, 1, z * 0.5], 0.09, 0.012, { color: CREAM, sides: 5 });
    // splayed trotters
    for (const fx of [-0.17, 0.17]) {
      b.capsule([bx + fx, y0 + 0.05, z * 0.1], [bx + fx * 1.35, y0 + 0.012, z * 0.2], 0.03, { color: BOAR, sides: 6 });
      ball(0.02, "#3a1a10", [bx + fx * 1.35, y0 + 0.015, z * 0.205], [1.2, 0.7, 1]);
    }
  }
  b.sweep(catmull([[bx - 0.3, y0 + 0.17, 0], [bx - 0.37, y0 + 0.2, 0.01], [bx - 0.38, y0 + 0.25, -0.01], [bx - 0.34, y0 + 0.27, 0.01]]), [0.02, 0.006], {
    color: SNOUT,
    sides: 5,
  });
  // apple under the snout
  ball(0.04, "#b3261e", [bx + 0.57, y0 + 0.0, 0.0]);
  cyl(0.003, 0.003, 0.02, 4, DARKW, [bx + 0.57, y0 + 0.04, 0]);
  // garnish on the platter rim
  ball(0.03, "#c9392c", [bx - 0.38, y0 - 0.005, 0.05]);
  ball(0.03, "#8fa832", [bx - 0.4, y0 - 0.005, -0.04]);
  ball(0.028, "#e9d9a0", [bx - 0.3, y0 - 0.008, 0.165]);
  ball(0.028, "#9a5a8c", [bx - 0.3, y0 + 0.01, 0.165], [1, 0.5, 1], { });
  ball(0.028, "#e9d9a0", [bx + 0.2, y0 - 0.008, -0.165]);
  ball(0.026, "#c9392c", [bx + 0.3, y0 - 0.008, 0.16]);
  const herbPts: V3t[] = [[bx + 0.1, y0 - 0.01, 0.17], [bx - 0.1, y0 - 0.01, -0.17], [bx - 0.42, y0 - 0.01, 0.0], [bx + 0.28, y0 - 0.01, -0.15], [bx - 0.2, y0 - 0.01, 0.17]];
  const herbFlow: V3t[] = [[0.4, 0, 1], [-0.3, 0, -1], [-1, 0, 0.2], [0.4, 0, -1], [-0.2, 0, 1]];
  b.cards(
    herbPts.map((p) => frame(p, [0, 1, 0])),
    T_HERB,
    { size: [0.07, 0.1], lean: 52, flow: (_f: unknown, i: number) => herbFlow[i], vary: 0.2, rng: rng(5), cross: true },
  );

  // =============================================================================================================
  // BREAD BOARD
  // =============================================================================================================
  const brx = -1.1;
  box(0.32, 0.02, 0.22, platterW, [brx, RUN_Y + 0.01, 0]);
  const LOAF = countershade(spots("#c68a3a", "#f1dfb8", { size: 0.03, amount: 0.3, seed: 8 }), "#e0b66a", { level: -0.1 });
  const loaves: [V3t, V3t][] = [
    [[brx - 0.06, 0.04, 0.02], [0.075, 0.045, 0.07]],
    [[brx + 0.07, 0.04, -0.03], [0.065, 0.04, 0.06]],
    [[brx + 0.06, 0.03, 0.065], [0.04, 0.03, 0.04]],
  ];
  for (const [c, r] of loaves) {
    ell([c[0], RUN_Y + 0.02 + c[1], c[2]], r, LOAF);
    for (const rot of [45, -45])
      box(r[0] * 1.1, 0.004, 0.011, "#f0d49a", [c[0], RUN_Y + 0.02 + c[1] + r[1] * 0.94, c[2]], { rotation: [0, rot, 0] });
  }

  // =============================================================================================================
  // CHEESE
  // =============================================================================================================
  cyl(0.14, 0.14, 0.016, 12, platterW, [-0.69, RUN_Y + 0.008, 0]);
  const CHEESE = countershade(spots("#e9be55", "#c88f2f", { size: 0.035, amount: 0.45, seed: 2 }), "#9b6b2a", { level: 0.55, soft: 0.12 });
  const CHEESECUT = spots("#ecc45e", "#c88f2f", { size: 0.03, amount: 0.4, seed: 5 });
  cyl(0.1, 0.1, 0.09, 12, CHEESE, [-0.73, RUN_Y + 0.016 + 0.045, 0]);
  b.extrude(WEDGE, { at: [-0.64, RUN_Y + 0.016 + 0.0425, 0.0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.085, color: CHEESECUT });
  knife(-0.6, 0.075, (200 * Math.PI) / 180);

  // =============================================================================================================
  // STEW POT
  // =============================================================================================================
  const px = 0.68;
  const py = RUN_Y + 0.02;
  cyl(0.15, 0.15, 0.02, 10, platterW, [px, RUN_Y + 0.01, 0]);
  b.lathe(POT_PROFILE, { at: [px, py, 0], color: IRON, segments: 12 });
  cyl(0.108, 0.108, 0.012, 12, "#7a4420", [px, py + 0.136, 0]);
  const chunk: [string, number, number][] = [["#d9792a", 0.04, 0.02], ["#e9d9a0", -0.05, 0.04], ["#6fa23a", 0.0, -0.06], ["#d9792a", -0.03, -0.03], ["#9a5a3a", 0.06, -0.04]];
  for (const [col, cx, cz] of chunk) ball(0.014, col, [px + cx, py + 0.145, cz]);
  b.part(new THREE.TorusGeometry(0.125, 0.006, 5, 14, Math.PI), IRON, { at: [px, py + 0.165, 0] });
  for (const s of [1, -1]) ball(0.012, IRON, [px + s * 0.126, py + 0.165, 0]);
  b.rod([px - 0.01, py + 0.12, 0.03], [px + 0.19, py + 0.235, 0.03], { radius: 0.006, color: DARKW, sides: 5 });
  ell([px - 0.02, py + 0.13, 0.03], [0.03, 0.018, 0.03], IRON);

  // =============================================================================================================
  // FISH PLATTER
  // =============================================================================================================
  const fx0 = 1.14;
  b.extrude(oval(0.17, 0.095, 14), { at: [fx0, RUN_Y + 0.01, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, bevel: 0.004, color: platterW });
  const FISH = countershade(scales("#7f98a6", "#4b606c", { size: 0.014, seed: 3 }), "#dfe3dc", { level: 0.0, soft: 0.4 });
  const fishY = RUN_Y + 0.02 + 0.025;
  for (const [cx, cz, dir] of [[fx0 - 0.02, -0.035, 1], [fx0 + 0.02, 0.035, -1]] as [number, number, number][]) {
    ell([cx, fishY, cz], [0.085, 0.028, 0.022], FISH);
    b.extrude(TAIL, { at: [cx - dir * 0.08, fishY, cz], x: [-dir, 0, 0], thickness: 0.004, color: "#5a707c" });
    b.extrude(FIN, { at: [cx - dir * 0.0, fishY + 0.02, cz], x: [dir, 0, 0], thickness: 0.004, color: "#5a707c" });
    for (const w of [1, -1]) ball(0.006, DARK, [cx + dir * 0.065, fishY + 0.006, cz + w * 0.019]);
  }
  ball(0.02, "#e8c93a", [fx0 - 0.12, RUN_Y + 0.04, 0.07], [1, 0.7, 0.8]);
  ball(0.02, "#e8c93a", [fx0 + 0.12, RUN_Y + 0.04, -0.07], [1, 0.7, 0.8]);
  b.cards(
    [frame([fx0 + 0.02, RUN_Y + 0.02, -0.085], [0, 1, 0]), frame([fx0 - 0.04, RUN_Y + 0.02, 0.09], [0, 1, 0])],
    T_HERB,
    { size: [0.06, 0.09], lean: 60, flow: (_f: unknown, i: number) => (i ? ([0, 0, 1] as V3t) : ([0, 0, -1] as V3t)), cross: true },
  );

  // =============================================================================================================
  // APPLE BOWL
  // =============================================================================================================
  const ax = 1.45;
  b.lathe(BOWL_PROFILE, { at: [ax, RUN_Y, 0], color: PLATEW, segments: 12 });
  const APPLE = ["#b3261e", "#8fa832", "#c9392c"];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    ball(0.035, APPLE[i % 3], [ax + Math.cos(a) * 0.065, RUN_Y + 0.062, Math.sin(a) * 0.065]);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const [px2, pz2] = [ax + Math.cos(a) * 0.03, Math.sin(a) * 0.03];
    ball(0.034, APPLE[(i + 1) % 3], [px2, RUN_Y + 0.105, pz2]);
    cyl(0.003, 0.003, 0.02, 4, DARKW, [px2, RUN_Y + 0.14, pz2]);
  }

  // =============================================================================================================
  // MEAD KEG ON A CRADLE
  // =============================================================================================================
  const kx = -1.42;
  const kegY = RUN_Y + 0.03 + 0.135;
  const KEGP = paint((p, _n, s) => {
    const stave = Math.floor(s[1] / 24);
    const base = stave % 2 ? "#6e4a28" : "#7e5830";
    return mix(base, "#2a1a0e", 0.35 * smoothstep(0.5, 0.8, noise(p, 0.07, 14)));
  });
  b.lathe(KEG_PROFILE, { at: [kx, kegY, 0], axis: [0, 0, 1], color: KEGP, segments: 14 });
  for (const z of [-0.1, 0.1]) b.part(new THREE.TorusGeometry(0.121, 0.007, 5, 16), IRON, { at: [kx, kegY, z] });
  for (const z of [-0.15, 0.15]) b.part(new THREE.TorusGeometry(0.105, 0.006, 5, 16), IRON, { at: [kx, kegY, z] });
  b.part(new THREE.CircleGeometry(0.092, 16), "#ffffff", { at: [kx, kegY, 0.1725], texture: T_KEG });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8), GILT, { at: [kx, kegY - 0.055, 0.205], dir: [0, 0, 1], flat: true });
  box(0.016, 0.05, 0.012, GILT, [kx, kegY - 0.035, 0.236]);
  for (const z of [-0.09, 0.09]) {
    box(0.16, 0.03, 0.05, DARKW, [kx, RUN_Y + 0.015, z]);
    for (const s of [1, -1]) box(0.04, 0.04, 0.05, DARKW, [kx + s * 0.085, RUN_Y + 0.045, z], { rotation: [0, 0, 45] });
  }

  // =============================================================================================================
  // FIR SPRIGS laid on the bare wood
  // =============================================================================================================
  const sprigs: [number, number, V3t][] = [
    [0, 0.37, [1, 0, 0.2]], [0, -0.37, [-1, 0, 0.1]], [-0.66, 0.37, [1, 0, -0.3]], [0.66, -0.37, [-1, 0, 0.3]],
    [-1.5, 0.3, [0.3, 0, -1]], [1.5, -0.3, [-0.2, 0, 1]],
  ];
  b.cards(
    sprigs.map(([x, z]) => frame([x, TOP_Y + 0.001, z], [0, 1, 0])),
    T_FIR,
    { size: 0.13, lean: 90, mirror: true, flow: (_f: unknown, i: number) => sprigs[i][2], vary: 0.15, rng: rng(9) },
  );

  return b.root;
}
```