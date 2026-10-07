import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { Part } from "../src/parts";
import type { Hit } from "../src/surface";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, noise, paint, smoothstep } from "../src/paint";
import type { ColorInput } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, INK, shadowOf, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Humpback Whale",
  description:
    "A celestial humpback whale gliding half a metre above the floor: sapphire cel-shaded back with a toothed sky-blue crest and gold edge line, pleated cream throat, gold-trimmed serrated flukes, knobbed white pectoral fins, baleen behind a slightly open jaw, and glowing aqua rune drops with crystal barnacles.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (every colour is a lit tone and a hard hue-shifted shadow tone, picked by the normal against the key light)

const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const tone = (n: THREE.Vector3, lit: string, shade?: string): ColorInput =>
  n.dot(LIGHT) > 0.1 ? lit : (shade ?? shadowOf(lit));

const SAPPH = "#3f78e2";
const SAPPH_S = "#2b4fb9";
const INDIGO = "#2b4cb8";
const INDIGO_S = "#1c2f88";
const SKY = "#92dcfa";
const SKY_S = "#5fa8e4";
const CREAM = "#fff6e2";
const CREAM_S = "#e6e0f4";
const PLEAT = "#bfd4f4";
const PLEAT_S = "#b3bfe8";
const STAR = "#a9ccff";
const STAR_S = "#7092e6";
const GOLD = "#ffc93c";
const GOLD_S = "#d98820";
const GUM = "#b4455f";
const GUM_S = "#8a3050";
const ROSE = "#f38fa8";
const ROSE_S = "#c9617f";
const AQUA = "#4ff3e2";
const GOLD_C = GOLD;
const CREAM_C = "#fff1d4";

// ---------------------------------------------------------------------------------------------------------------
// Body profile tables. z runs tail (-) to snout (+); heights are relative to the spine height YC.

const YC = 2.29;
const TAIL_Z = -7.3;
const HINGE_Z = 3.95;

/** [z, full width, full height] of the trunk. */
const BODY = [
  [-7.3, 0.5, 0.55],
  [-6.4, 0.85, 1.0],
  [-5.4, 1.35, 1.55],
  [-4.3, 1.95, 2.1],
  [-3.0, 2.6, 2.7],
  [-1.6, 3.2, 3.2],
  [0.0, 3.6, 3.5],
  [1.6, 3.75, 3.55],
  [2.8, 3.5, 3.3],
  [3.6, 3.2, 3.0],
  [3.95, 3.1, 2.82],
];

/** [z, full width, top, mouth line, bottom] of the head, relative to YC. */
const HEAD = [
  [3.7, 3.15, 1.45, -0.15, -1.45],
  [4.4, 3.0, 1.33, -0.17, -1.4],
  [5.0, 2.6, 1.12, -0.17, -1.24],
  [5.7, 2.05, 0.86, -0.15, -0.94],
  [6.3, 1.5, 0.58, -0.1, -0.66],
  [6.7, 0.95, 0.33, -0.04, -0.44],
  [6.9, 0.4, 0.15, 0.0, -0.28],
];

function interp(rows: number[][], z: number, col: number) {
  if (z <= rows[0][0]) return rows[0][col];
  for (let i = 1; i < rows.length; i++) {
    if (z <= rows[i][0]) {
      const a = rows[i - 1];
      const c = rows[i];
      return a[col] + ((c[col] - a[col]) * (z - a[0])) / (c[0] - a[0]);
    }
  }
  return rows[rows.length - 1][col];
}

const spineY = (z: number) => (z < -1.5 ? YC + 0.55 * Math.pow((-1.5 - z) / 5.8, 1.7) : YC);
const topH = (z: number) => (z <= HINGE_Z ? interp(BODY, z, 2) / 2 : interp(HEAD, z, 2));
const halfW = (z: number) => (z <= 3.7 ? interp(BODY, z, 1) / 2 : interp(HEAD, z, 1) / 2);
const mouthM = (z: number) => interp(HEAD, z, 3);
const hash1 = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Where the cream belly meets the blue back, relative to the spine: a slow wave that runs into the mouth line. */
function edgeRel(z: number) {
  const wave = 0.11 * Math.sin(z * 1.55 + 0.7) + 0.045 * Math.sin(z * 3.9 + 1.9);
  const flank = topH(z) * (-0.3 + wave);
  const k = smoothstep(2.3, 4.0, z);
  return flank * (1 - k) + mouthM(z) * k;
}

function bellyColor(p: THREE.Vector3, n: THREE.Vector3): ColorInput {
  const z = p.z;
  const lowerB = interp(HEAD, z, 4);
  const hl = (mouthM(z) - lowerB) * 0.72;
  const cy = z > 3.8 ? YC + lowerB + hl : spineY(z);
  const hh = z > 3.8 ? hl : interp(BODY, z, 2) / 2;
  const theta = Math.atan2(p.x / Math.max(0.3, halfW(z)), -(p.y - cy) / Math.max(0.2, hh));
  const q = theta / 0.12 + 0.5;
  const k = Math.floor(q);
  const f = q - k;
  const endZ = -1.2 - 1.6 * hash1(k);
  if (z > endZ && z < 6.6 && Math.abs(theta) < 1.3 && Math.abs(f - 0.5) < 0.1) return tone(n, PLEAT, PLEAT_S);
  if (p.z < 3.2 && noise(p, 0.8, 9) > 0.64) return tone(n, "#d4e2f8", "#b7c1ea");
  return tone(n, CREAM, CREAM_S);
}

/** Tapering wave-crest strokes on the tail and the head, where the flank decals do not reach. */
function onSwoosh(z: number, y: number, th: number) {
  const runs: Array<[number, number, number, number]> = [
    [-6.9, -3.1, 0.2, 0.0],
    [-6.4, -3.4, 0.46, 1.7],
    [-6.0, -3.6, 0.7, 3.1],
    [3.0, 5.7, 0.62, 0.9],
    [3.3, 5.3, 0.82, 2.6],
  ];
  for (const [z0, z1, frac, ph] of runs) {
    if (z < z0 || z > z1) continue;
    const u = (z - z0) / (z1 - z0);
    const env = Math.pow(Math.sin(Math.PI * u), 0.8);
    const yc = th * frac + 0.09 * Math.sin(z * 1.9 + ph);
    if (Math.abs(y - yc) < 0.045 * env) return true;
  }
  return false;
}

/** The whole-body coat: belly, gold edge line, toothed sky crest, sapphire back with star dots, indigo top. */
function coatColor(p: THREE.Vector3, n: THREE.Vector3): ColorInput {
  const z = p.z;
  const y = p.y - spineY(z);
  const d = y - edgeRel(z);
  const inHead = z > 4.3;
  if (d < (inHead ? -0.02 : -0.045)) return bellyColor(p, n);
  if (!inHead && d < -0.012) return tone(n, GOLD, GOLD_S);
  if (d < 0.008) return INK;
  const sky = 0.05 + 0.11 * zigzag(z / 0.5);
  if (d < sky) return tone(n, SKY, SKY_S);
  const th = topH(z);
  if (onSwoosh(z, y, th)) return tone(n, SKY, SKY_S);
  if (y > th * (0.58 + 0.07 * Math.sin(z * 1.2 + 1)) && z < 6.2) {
    const st = cells(p, 0.5, 8);
    return st.d1 < 0.27 && st.id < 0.6 ? tone(n, "#86abf6", "#5a76d6") : tone(n, INDIGO, INDIGO_S);
  }
  const c = cells(p, 0.55, 5);
  if (c.d1 < 0.27 && c.id < 0.6) return tone(n, STAR, STAR_S);
  return tone(n, SAPPH, SAPPH_S);
}

const BODY_PAINT = paint((p, n) => coatColor(p, n));

const UPPER_PAINT = paint((p, n) => {
  if (p.z > 3.75) {
    const dm = p.y - YC - mouthM(p.z);
    if (Math.abs(dm) < 0.03) return INK;
    if (dm < 0) return tone(n, GUM, GUM_S);
  }
  return coatColor(p, n);
});

const LOWER_PAINT = paint((p, n) => {
  if (p.z > 3.75) {
    const dm = p.y - YC - mouthM(p.z);
    if (Math.abs(dm) < 0.03) return INK;
    if (dm > 0) return tone(n, ROSE, ROSE_S);
  }
  return coatColor(p, n);
});

const FIN_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.y) <= 0.12) return tone(n, GOLD, GOLD_S);
  if (n.y < 0) return Math.abs((s[1] * 9) % 1 - 0.5) > 0.42 ? tone(n, PLEAT, PLEAT_S) : tone(n, CREAM, CREAM_S);
  if (s[0] > 0.8 + 0.06 * zigzag(s[1] * 5)) return tone(n, CREAM, CREAM_S);
  if (s[1] < 0.16 + 0.1 * zigzag(s[0] * 6)) return tone(n, SKY, SKY_S);
  return tone(n, SAPPH, SAPPH_S);
});

const LEAD_PAINT = paint((_p, n, s) => {
  if (s[0] > 0.8) return tone(n, CREAM, CREAM_S);
  return n.y > -0.2 ? tone(n, SKY, SKY_S) : tone(n, CREAM, CREAM_S);
});

const FLUKE_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.6) return tone(n, GOLD, GOLD_S);
  if (n.y < 0) {
    const a = Math.atan2(s[1], s[0] + 0.35) * 11;
    return Math.abs((a % 1) - 0.5) > 0.4 ? tone(n, PLEAT, PLEAT_S) : tone(n, CREAM, CREAM_S);
  }
  if (s[1] < -0.66 - 0.12 * zigzag(s[0] * 3)) return tone(n, SKY, SKY_S);
  return tone(n, SAPPH, SAPPH_S);
});

const DORSAL_PAINT = paint((_p, n, s) => {
  if (Math.abs(n.x) < 0.6) return tone(n, GOLD, GOLD_S);
  if (s[1] > 0.5 + 0.05 * zigzag(s[0] * 8)) return tone(n, SKY, SKY_S);
  return tone(n, SAPPH, SAPPH_S);
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const f1 = (v: number) => v.toFixed(1);

function spiralPoints(cx: number, cy: number, r0: number, turns: number, dir: number, phase: number) {
  const steps = Math.round(28 * turns);
  const out: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = phase + dir * t * turns * Math.PI * 2;
    const r = r0 * (1 - t * 0.86);
    out.push(`${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`);
  }
  return out.join(" ");
}

/** Gold cloud-scroll filigree: a flowing wave with a curl on every crest and trough, framed by two thin rules. */
function scrollSvg(n: number) {
  const W = n * 120;
  const H = 150;
  const strokes: string[] = [];
  let wave = `M 0 75`;
  for (let i = 0; i < n; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    wave += ` C ${120 * i + 35} ${75 - 52 * s}, ${120 * i + 85} ${75 - 52 * s}, ${120 * (i + 1)} 75`;
    const cx = 120 * i + 60;
    const cy = 75 - 39 * s - s * 20;
    strokes.push(`<polyline points="${spiralPoints(cx, cy, 20, 1.7, s, s > 0 ? 0.6 : 3.7)}" fill="none"/>`);
  }
  strokes.push(`<path d="${wave}" fill="none"/>`);
  strokes.push(`<line x1="0" y1="10" x2="${W}" y2="10"/><line x1="0" y1="140" x2="${W}" y2="140"/>`);
  const dots: string[] = [];
  for (let i = 0; i <= n; i++) dots.push(`<circle cx="${120 * i}" cy="75" r="6"/>`);
  for (let i = 0; i < n * 2; i++) dots.push(`<circle cx="${30 + 60 * i}" cy="${i % 2 ? 125 : 25}" r="4"/>`);
  const body = strokes.join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
      `<g stroke="#7a470c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="#7a470c">${body}${dots.join("")}</g>` +
      `<g stroke="#ffd24d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="#ffd24d">${body}${dots.join("")}</g>` +
      `</svg>`,
    { size: Math.min(2048, W * 2.4) },
  );
}

/** Glowing teardrop runes with ripple dots between them. */
function dropsSvg(n: number) {
  const W = n * 90;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = 45 + 90 * i;
    const y = 58 + (i % 2 ? -12 : 12);
    const k = i % 2 ? 0.8 : 1;
    parts.push(
      `<path transform="translate(${x} ${y}) scale(${k})" d="M 0 -32 C 6 -18, 17 -6, 17 8 A 17 17 0 1 1 -17 8 C -17 -6, -6 -18, 0 -32 Z" fill="#46ecdc" stroke="#c7fff7" stroke-width="3.5"/>` +
        `<ellipse transform="translate(${x - 6 * k} ${y + 4 * k}) rotate(20)" cx="0" cy="0" rx="4.5" ry="8" fill="#f2fffd"/>` +
        `<circle cx="${x + 45}" cy="${58 - (i % 2 ? -12 : 12)}" r="5" fill="#5ff7e8"/>` +
        `<path d="M ${x + 12} ${y + 34} q 20 8 40 0" fill="none" stroke="#46ecdc" stroke-width="4" stroke-linecap="round"/>`,
    );
  }
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 110">${parts.join("")}</svg>`, {
    size: Math.min(2048, W * 2.6),
  });
}

/** Gold rays fanning out of the fluke root with aqua droplets at their ends (root on the left, tip right). */
const FLUKE_ENDS: Array<[number, number]> = [
  [214, 120],
  [188, 128],
  [158, 136],
  [126, 138],
  [94, 133],
  [62, 122],
  [32, 108],
];

function flukeGoldSvg() {
  const lines = FLUKE_ENDS.map(([ex, ey]) => `<path d="M 4 55 Q ${f1(ex * 0.55)} ${f1(24 + ey * 0.14)}, ${ex} ${ey}"/>`);
  const body = lines.join("");
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 165">` +
      `<g fill="none" stroke-linecap="round"><g stroke="#7a470c" stroke-width="7">${body}</g><g stroke="#ffd24d" stroke-width="3.2">${body}</g></g>` +
      `</svg>`,
    { size: 920 },
  );
}

function flukeAquaSvg() {
  const dots = FLUKE_ENDS.map(
    ([ex, ey], i) =>
      `<circle cx="${ex - 8}" cy="${ey - 5}" r="${i % 2 ? 4.5 : 6}" fill="#5ff7e8" stroke="#d9fffa" stroke-width="1.6"/>`,
  );
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 165">${dots.join("")}</svg>`, { size: 920 });
}

/** One baleen plate: dark blade, cream fringe along the bottom. */
function baleenSvg() {
  const fringe: string[] = [];
  for (let i = 0; i < 9; i++) fringe.push(`<line x1="${6 + i * 3.6}" y1="50" x2="${8 + i * 3.4}" y2="78"/>`);
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">` +
      `<polygon points="5,0 35,0 33,56 7,56" fill="#33365e"/>` +
      `<polygon points="5,0 35,0 34,12 6,12" fill="#4a4f86"/>` +
      `<g stroke="#eadfc4" stroke-width="1.8" stroke-linecap="round">${fringe.join("")}</g>` +
      `</svg>`,
    { size: 160 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "humpbackWhale", paintSize: 2048 });
  const rand = rng(11);

  // ----- skeleton --------------------------------------------------------------------------------------------
  const core = b.joint("pelvis", { at: [0, spineY(-2), -2], dir: [0, 0, 1], role: "spine" });
  const front = b.chain(
    "spine",
    catmull([
      [0, YC, -2],
      [0, YC, 0],
      [0, YC, 1.8],
      [0, YC, HINGE_Z],
    ]),
    { parent: core, count: 4, role: "spine", group: "body" },
  );
  const back = b.chain(
    "tail",
    catmull(
      [-2, -3.2, -4.3, -5.4, -6.4, TAIL_Z].map((z) => [0, spineY(z), z]),
    ),
    { parent: core, count: 6, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7"], role: "tail", group: "body" },
  );
  const neckEnd = front.joints[front.joints.length - 1];
  const head = b.joint("head", { parent: neckEnd, at: [0, YC, HINGE_Z], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, YC + mouthM(HINGE_Z), HINGE_Z - 0.05],
    dir: [0, 0, 1],
    role: "jaw",
    group: "head",
  });
  const tailTip = back.joints[back.joints.length - 1];
  const flukeY = spineY(TAIL_Z);
  const flukeJoints = [1, -1].map((s) =>
    b.joint(s > 0 ? "flukeL" : "flukeR", {
      parent: tailTip,
      at: [s * 0.1, flukeY, TAIL_Z + 0.15],
      dir: [s, 0, -0.1],
      role: "hinge",
      group: "fluke",
    }),
  );
  const [flukeL, flukeR] = flukeJoints;

  // ----- trunk -----------------------------------------------------------------------------------------------
  const body = b.loft(
    BODY.map(([z, w, h]) => ({ at: [0, spineY(z), z], w, h })),
    { bone: [back, core, front], color: BODY_PAINT, sides: 14, name: "trunk", group: "body" },
  );
  const bodySkin = b.surface(body);

  // ----- head: clamshell upper and lower jaw -----------------------------------------------------------------
  const upperRows = HEAD.map(([z, w, T, M]) => {
    const hu = (T - M) * 0.72;
    return { at: [0, YC + T - hu, z], w, h: 2 * hu };
  });
  const lowerRows = HEAD.map(([z, w, , M, B], i) => {
    const hl = (M - B) * 0.72;
    const zz = i === HEAD.length - 1 ? z + 0.08 : z;
    const taper = i === 0 ? 0.84 : i === 1 ? 0.94 : 1;
    return { at: [0, YC + B + hl, zz], w: (i === HEAD.length - 1 ? w * 1.05 : w) * taper, h: 2 * hl };
  });
  const upper = b.loft(upperRows, { bone: head, color: UPPER_PAINT, sides: 14, name: "upperJaw", group: "head" });
  const lower = b.loft(lowerRows, { bone: jaw, color: LOWER_PAINT, sides: 14, name: "lowerJaw", group: "head" });
  const upperSkin = b.surface(upper);
  const lowerSkin = b.surface(lower);

  // baleen behind the lips
  const baleen = baleenSvg();
  const plates: Frame[] = [];
  for (const s of [1, -1])
    for (let z = 4.55; z < 6.35; z += 0.065) {
      const x = s * 0.76 * (interp(HEAD, z, 1) / 2) * 0.92;
      plates.push(frame([x, YC + mouthM(z) + 0.04, z], [0, 1, 0]));
    }
  b.cards(plates, baleen, { size: [0.17, 0.44], lean: 180, flow: [0, 0, 1], bone: head, vary: 0.15, rng: rand, name: "baleen" });

  // eyes: big anime eyes on the cheeks
  const eye = animeEye({ iris: "#ffbc2a", irisLight: "#fff29a", blush: "#ff9dba" });
  for (const s of [1, -1]) {
    const at = upperSkin.around([0, YC + 0.3, 4.4]).at(s * 90, 0);
    if (!at) throw new Error("no eye surface");
    b.decal(upperSkin, eye, { at, size: [0.66, 0.9], mirror: s > 0, segments: 10, roll: -s * 6, name: s > 0 ? "eyeL" : "eyeR" });
  }

  // tubercle knobs along the snout and chin
  const KNOB = new THREE.SphereGeometry(0.075, 6, 5);
  for (let i = 0; i < 7; i++) {
    const z = 4.55 + i * 0.32;
    const hit = upperSkin.ray([0, 8, z], [0, -1, 0]);
    if (hit) b.stick(KNOB, CREAM_C, hit, { embed: 0.35, scale: [1 - i * 0.05, 0.8, 1 - i * 0.05] });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 4.9 + i * 0.4;
      const hit = upperSkin.ray([s * 3, YC + mouthM(z) + 0.3, z], [-s, 0, 0]);
      if (hit) b.stick(KNOB, CREAM_C, hit, { embed: 0.4, scale: [0.8, 0.8, 0.8] });
    }
  for (let i = 0; i < 5; i++) {
    const hit = lowerSkin.ray([0, -4, 5.0 + i * 0.4], [0, 1, 0]);
    if (hit) b.stick(KNOB, CREAM_C, hit, { embed: 0.35, scale: [0.9, 0.8, 0.9] });
  }

  // blowhole slits flanked by gold splashguard ridges
  for (const s of [1, -1]) {
    const a = bodySkin.ray([s * 0.34, 8, 3.28], [0, -1, 0]);
    const c = bodySkin.ray([s * 0.14, 8, 2.78], [0, -1, 0]);
    if (a && c) b.capsule(a.moved([0, 0.012, 0]), c.moved([0, 0.012, 0]), 0.04, { color: INK, sides: 5, name: "blowhole" });
    for (const d of [0.17, -0.17]) {
      const g0 = bodySkin.ray([s * 0.34 + d, 8, 3.34], [0, -1, 0]);
      const g1 = bodySkin.ray([s * 0.14 + d, 8, 2.72], [0, -1, 0]);
      if (g0 && g1) b.capsule(g0.moved([0, 0.02, 0]), g1.moved([0, 0.02, 0]), [0.03, 0.045], { color: GOLD_C, sides: 5, name: "splashguard" });
    }
  }

  // gold brows sweeping back over the eyes
  for (const s of [1, -1]) {
    const rows: Array<[number, number]> = [
      [5.0, 0.82],
      [4.7, 0.94],
      [4.35, 0.98],
      [3.95, 0.9],
    ];
    const marks = rows.map(([z, dy]) => upperSkin.ray([s * 4, YC + dy, z], [-s, 0, 0])).filter((h): h is Hit => h !== null);
    const brow = catmull(marks.map((h) => h.moved([0, 0.03, 0])));
    b.sweep(brow, [0.05, 0.012], { color: GOLD_C, sides: 5, caps: { start: "round", end: "point" }, name: "brow" });
  }

  // ----- gold crest scutes and glow rings on the tail --------------------------------------------------------
  b.along(
    body,
    7,
    (at) => {
      b.spike(at, at, 0.2, 0.065, { color: GOLD_C, sides: 5 });
    },
    { from: 0.04, to: 0.25 },
  );
  b.along(
    body,
    4,
    (at) => {
      b.spike(at, at, 0.14, 0.05, { color: GOLD_C, sides: 5 });
    },
    { from: 0.32, to: 0.44 },
  );
  const bead = new THREE.SphereGeometry(0.055, 6, 5);
  b.along(
    body,
    22,
    (at) => {
      b.stick(bead, GOLD_C, at, { embed: 0.4 });
    },
    { from: 0.47, to: 0.8 },
  );
  const ringAt = (z: number, color: string, r: number, glowing: boolean) => {
    const path = bodySkin.loop([0, spineY(z), z], { dir: [0, 0, 1], lift: 0.01 });
    const ring = b.sweep(path, r, { color, sides: 5, name: "tailRing" });
    if (glowing) glow(ring, 1.3);
  };
  ringAt(-4.9, GOLD_C, 0.045, false);
  ringAt(-5.08, AQUA, 0.03, true);
  ringAt(-5.26, GOLD_C, 0.045, false);
  ringAt(-6.1, GOLD_C, 0.035, false);
  ringAt(-6.25, AQUA, 0.024, true);
  ringAt(-6.4, GOLD_C, 0.035, false);

  // ----- dorsal fin ------------------------------------------------------------------------------------------
  const dorsalZ = -4.15;
  const dorsalTop = spineY(dorsalZ) + interp(BODY, dorsalZ, 2) / 2;
  const dorsalOutline: OutlinePoint[] = (
    [
      [0.55, -0.3],
      [0.55, 0.0],
      [0.44, 0.22],
      [0.2, 0.52],
      [-0.1, 0.82, "sharp"],
      [-0.18, 0.52],
      [-0.32, 0.27],
      [-0.6, 0.0],
      [-0.6, -0.3],
    ] as OutlinePoint[]
  ).map((pt) => (pt.length === 3 ? [pt[0] * 1.3, pt[1] * 1.3, pt[2]] : [pt[0] * 1.3, pt[1] * 1.3]) as OutlinePoint);
  b.extrude(dorsalOutline, {
    at: [0, dorsalTop - 0.05, dorsalZ],
    thickness: 0.15,
    bevel: 0.03,
    smoothing: 1,
    color: DORSAL_PAINT,
    bone: back.joints[2],
    name: "dorsalFin",
  });

  // ----- flukes ----------------------------------------------------------------------------------------------
  const F = 1.3;
  const trailBase: Array<[number, number]> = [
    [2.35, -0.78],
    [1.95, -0.98],
    [1.35, -1.06],
    [0.75, -0.95],
    [0.35, -0.76],
    [0.0, -0.52],
  ];
  const trailPath = catmull(trailBase.map(([u, v]) => [u * F, 0, v * F]));
  const trailing: Array<[number, number]> = [];
  const TEETH = 9;
  for (let i = 0; i <= TEETH * 2; i++) {
    const p = trailPath.at(i / (TEETH * 2));
    const tooth = i % 2 === 1 ? -0.13 * (1 - 0.35 * (i / (TEETH * 2))) : 0;
    trailing.push([p.x, p.z + tooth]);
  }
  const flukeOutline: OutlinePoint[] = [
    [-0.2, 0.55 * F],
    [0.7 * F, 0.52 * F],
    [1.4 * F, 0.22 * F],
    [1.95 * F, -0.22 * F],
    [2.35 * F, -0.78 * F, "sharp"],
    ...trailing.slice(1).map(([u, v]): OutlinePoint => [u, v, "sharp"]),
    [-0.2, -0.5 * F],
  ];
  const flukeZ = TAIL_Z + 0.2;
  const goldF = flukeGoldSvg();
  const aquaF = flukeAquaSvg();
  for (const s of [1, -1]) {
    const bone = s > 0 ? flukeL : flukeR;
    const plate = b.extrude(flukeOutline, {
      at: [0, flukeY, flukeZ],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.06, 0.26],
      bevel: 0.025,
      color: FLUKE_PAINT,
      bone,
      name: s > 0 ? "flukeL" : "flukeR",
    });
    b.sweep(
      trailing.map(([u, v]) => [s * u, flukeY, flukeZ + v]),
      0.036,
      { color: GOLD_C, sides: 5, bone, name: "flukeRim" },
    );
    const at = (dy: number) => [s * 1.15 * F, flukeY + dy, flukeZ - 0.275 * F];
    const size: [number, number] = [2.3 * F, 1.65 * F];
    b.decal(plate, goldF, { at: at(0.2), dir: [0, 1, 0], up: [0, 0, 1], size, mirror: s > 0, segments: 16, name: "flukeGoldTop" });
    glow(
      b.decal(plate, aquaF, {
        at: at(0.2),
        dir: [0, 1, 0],
        up: [0, 0, 1],
        size,
        mirror: s > 0,
        segments: 16,
        lift: 0.004,
        name: "flukeAquaTop",
      }),
      1.2,
    );
    b.decal(plate, goldF, { at: at(-0.2), dir: [0, -1, 0], up: [0, 0, 1], size, mirror: s < 0, segments: 16, name: "flukeGoldUnder" });
  }

  // ----- pectoral fins ---------------------------------------------------------------------------------------
  const lead = [
    [1.05, YC - 1.15, 3.45],
    [2.5, YC - 1.4, 3.0],
    [4.1, YC - 1.6, 2.1],
    [5.7, YC - 1.55, 0.75],
  ];
  const cdir = [-0.47, 0, -0.88];
  const chord = [1.05, 1.6, 1.25, 0.16];
  const finGold = scrollSvg(3);
  const knobGeo = new THREE.SphereGeometry(0.11, 6, 5);
  const shoulder = new THREE.SphereGeometry(1, 10, 8);
  const finEdges: Record<string, Frame> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = lead.map(([x, y, z]) => [s * x, y, z]);
    const trail = lead.map(([x, y, z], i) => [s * (x + chord[i] * cdir[0]), y - 0.05 * chord[i], z + chord[i] * cdir[2]]);
    const fin = b.chain("fin" + side, catmull(pts), {
      parent: neckEnd,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: "fin" + side,
    });
    const edge = b.sweep(fin, (t) => 0.18 - 0.1 * t, {
      color: LEAD_PAINT,
      caps: { start: "round", end: "point" },
      sides: 8,
      name: "finEdge" + side,
    });
    const web = b.membrane(fin, catmull(trail), { thickness: 0.1, color: FIN_PAINT, rows: 6, name: "finWeb" + side });
    b.part(shoulder, BODY_PAINT, {
      bone: neckEnd,
      at: [s * 1.0, lead[0][1] + 0.1, 3.35],
      scale: [0.5, 0.36, 0.75],
      name: "shoulder" + side + "Pad",
    });
    // leading-edge tubercles
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + i * 0.095;
      const k = 1 - 0.35 * t;
      b.stick(knobGeo, CREAM_C, edge.at(t, 90 * s), { embed: 0.5, scale: [k, k, k] });
    }
    finEdges[side] = edge.at(0.55, 0);
    // filigree on the upper face
    const mid = fin.at(0.5).at;
    b.decal(web, finGold, {
      at: [mid.x + 0.3 * cdir[0] * s, mid.y + 0.1, mid.z + 0.55 * cdir[2]],
      dir: [0, 1, 0],
      up: [-cdir[0] * s, 0, -cdir[2]],
      size: [2.8, 1.16],
      mirror: s > 0,
      segments: 16,
      name: "finGold" + side,
    });
    b.decal(web, finGold, {
      at: [mid.x + 0.3 * cdir[0] * s, mid.y - 0.1, mid.z + 0.55 * cdir[2]],
      dir: [0, -1, 0],
      up: [-cdir[0] * s, 0, -cdir[2]],
      size: [2.8, 1.16],
      mirror: s < 0,
      segments: 16,
      name: "finGoldUnder" + side,
    });
  }

  // ----- crystal barnacles -----------------------------------------------------------------------------------
  const crystalCone = new THREE.ConeGeometry(0.1, 0.46, 6);
  const socket = new THREE.CylinderGeometry(0.17, 0.2, 0.06, 8);
  const crystals: Part[] = [];
  const cluster = (hit: Frame, scale: number) => {
    b.stick(socket, GOLD_C, hit, { embed: 0.3, scale: [scale, 1, scale], flat: true });
    const stems: Array<[number, number, number]> = [
      [0, 0, 1],
      [0.11, 0.05, 0.7],
      [-0.09, 0.1, 0.55],
    ];
    for (const [dx, dz, k] of stems) {
      const base = hit.moved([dx * scale, 0.03, dz * scale]);
      crystals.push(
        b.stick(crystalCone, AQUA, base, {
          embed: 0.1,
          scale: [scale * k, scale * k * (1 + rand() * 0.3), scale * k],
          spin: rand() * 360,
          flat: true,
        }),
      );
    }
  };
  for (const s of [1, -1]) {
    const a = lowerSkin.ray([s * 3, YC - 0.85, 5.2], [-s, 0, 0]);
    if (a) cluster(a, 1.1);
    const a2 = lowerSkin.ray([s * 3, YC - 0.6, 6.0], [-s, 0, 0]);
    if (a2) cluster(a2, 0.8);
    const c = upperSkin.ray([s * 3, YC + 0.95, 5.1], [-s, -0.25, 0]);
    if (c) cluster(c, 0.9);
    const d = bodySkin.ray([s * 4, YC + 0.75, 2.3], [-s, 0, 0]);
    if (d) cluster(d, 1.15);
    cluster(finEdges[s > 0 ? "L" : "R"], 1.0);
  }
  for (const c of crystals) glow(c, 1.3);

  // ----- flank decals: gold filigree and glowing rune drops ---------------------------------------------------
  const flankGold = scrollSvg(6);
  const flankDrops = dropsSvg(7);
  for (const s of [1, -1]) {
    b.decal(body, flankGold, {
      at: [s * 1.7, YC + 0.28, -0.1],
      dir: [s, 0, 0],
      size: [5.6, 1.17],
      segments: 30,
      mirror: s < 0,
      name: s > 0 ? "flankGoldL" : "flankGoldR",
    });
    glow(
      b.decal(body, flankDrops, {
        at: [s * 1.5, YC + 1.15, -0.2],
        dir: [s, 0, 0],
        size: [4.6, 0.8],
        segments: 28,
        mirror: s < 0,
        lift: 0.004,
        name: s > 0 ? "flankDropsL" : "flankDropsR",
      }),
      1.2,
    );
  }
  // a rune strip down the belly
  glow(
    b.decal(body, flankDrops, {
      at: [0, YC - 1.8, 0.2],
      dir: [0, -1, 0],
      up: [1, 0, 0],
      size: [4.6, 0.8],
      segments: 28,
      lift: 0.004,
      name: "bellyDrops",
    }),
    1.1,
  );

  // ----- open the mouth a little -----------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}


