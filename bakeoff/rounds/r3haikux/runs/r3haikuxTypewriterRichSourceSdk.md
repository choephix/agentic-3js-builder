```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, paint, rng, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Racing-green 1930s typewriter",
  description:
    "A portable typewriter in glossy racing green: round keys with cream letters on chrome rims in four staggered rows, a semicircle of type bars behind them, a chrome carriage-return lever, a black platen with a half-typed letter, and a brass maker's badge on the front.",
};

const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---- colour --------------------------------------------------------------

const GREEN = "#0b4a2d";
const GREEN_DEEP = "#04251a";
const GREEN_SHEEN = "#2f7d55";
const DECK = "#0a1711";
const CREAM = "#eadfb8";
const BLACK = "#0e1012";
const KEYCAP = "#1b1f1d";

/** Chrome, faked from the surface normal alone: bright sky, dark floor, a hard white glint. */
const chrome = paint((_p, n) => {
  const sky = smoothstep(-0.1, 0.5, n.y);
  const floor = smoothstep(0.05, -0.4, n.y);
  const glint = Math.exp(-((n.y - 0.22) ** 2) / 0.004);
  const base = mix(mix("#5b676e", "#eef4f6", sky), "#15191c", floor);
  return mix(base, "#ffffff", 0.75 * glint);
});

const LIGHT = [0.3, 0.84, 0.45];

/**
 * Racing-green enamel: a sheen and a sharp glint from one light (the glint catches the bevels), a horizon reflection
 * along the flanks, a cream coachline, and a dark panel where the keys sit.
 */
const enamel = paint((p, n) => {
  const lit = Math.max(0, n.x * LIGHT[0] + n.y * LIGHT[1] + n.z * LIGHT[2]);
  let c = mix(GREEN_DEEP, GREEN, smoothstep(-0.5, 0.5, n.y));
  c = mix(c, GREEN_SHEEN, 0.3 * lit ** 4);
  c = mix(c, "#f2f8f2", 0.8 * lit ** 30);
  const flank = smoothstep(0.55, 0.9, Math.abs(n.x));
  const horizon = Math.exp(-(((n.y - 0.12) / 0.15) ** 2));
  c = mix(c, GREEN_SHEEN, 0.45 * flank * horizon);
  const well = smoothstep(0.8, 0.95, n.y) * smoothstep(-0.035, -0.02, p.z) * (1 - smoothstep(0.158, 0.168, p.z));
  c = mix(c, DECK, well);
  const coachline = flank * (1 - smoothstep(0.0022, 0.0034, Math.abs(p.y - 0.083)));
  return mix(c, CREAM, coachline);
});

// ---- key and paper geometry ------------------------------------------------

/** Chrome bezel: a ring around the cap, its inner lip sitting above the cap top. Profile: [distance from axis, height]. */
const RIM = [
  [0.0095, 0],
  [0.0125, 0],
  [0.0131, 0.0018],
  [0.0124, 0.0044],
  [0.0095, 0.0051],
];
/** The black cap, dished slightly, recessed inside the bezel. */
const CAP = [
  [0, 0],
  [0.0093, 0],
  [0.0093, 0.0028],
  [0.0086, 0.0046],
  [0, 0.0046],
];
/** Four staggered rows, top to bottom of the keyboard: each row starts half a key further right than the one above. */
const ROWS = [
  { keys: "1234567890", offset: 0, v: 0.15 },
  { keys: "QWERTYUIOP", offset: 0.5, v: 0.122 },
  { keys: "ASDFGHJKL", offset: 1, v: 0.094 },
  { keys: "ZXCVBNM", offset: 1.5, v: 0.066 },
];
const PITCH = 0.0275;
const ATLAS_COLS = 10;
const ATLAS_ROWS = 4;
const KEY_LETTERS = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function typewriter() {
  const b = createBuilder({ name: "typewriter", paintSize: 2048 });

  // ---- skeleton: the frame, the carriage that carries the platen, the carriage-return lever ----
  b.joint("frame", { at: [0, 0, 0] });
  const platenAt = V(0, 0.238, -0.085);
  const carriage = b.joint("carriage", { at: platenAt, parent: "frame" });
  const leverAt = V(0.16, 0.225, -0.1);
  const lever = b.joint("lever", { at: leverAt, parent: carriage, role: "hinge" });

  // ---- textures ------------------------------------------------------------------

  // One sheet holds all 36 keytop letters, 10 to a row; each key's disc is mapped onto its own tile.
  const keyAtlas = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400">` +
      `<g font-family="Futura, 'Century Gothic', 'Trebuchet MS', Arial, sans-serif" font-size="56" font-weight="600" ` +
      `fill="#f1e7c6" text-anchor="middle">` +
      [...KEY_LETTERS]
        .map(
          (ch, i) =>
            `<text x="${(i % ATLAS_COLS) * 100 + 50}" y="${Math.floor(i / ATLAS_COLS) * 100 + 71}">${ch}</text>`,
        )
        .join("") +
      `</g></svg>`,
    { size: 1024 },
  );

  // The letter half typed: monospace glyphs, each nudged by hand, lines filling the upper half of the sheet.
  const jit = rng(7);
  const wobble = (k: number) => (jit() - 0.5) * k;
  const LETTER = [
    "Mr. R. Ashcombe,",
    "14 Milton Road,",
    "",
    "Dear Sir,",
    "Your order of the 4th inst. has been",
    "received, and the machine will be sent",
    "by the 12th. I regret the delay, which is",
    "owing to the strike at the works. We hope",
  ];
  const typed = LETTER.map((line, row) => {
    const y0 = 22 + row * 8.2;
    const xs: string[] = [];
    const ys: string[] = [];
    for (let i = 0; i < line.length; i++) {
      xs.push((18 + i * 3.36 + wobble(0.3)).toFixed(2));
      ys.push((y0 + wobble(0.5)).toFixed(2));
    }
    const ink = (0.8 + jit() * 0.15).toFixed(2);
    return `<text x="${xs.join(" ")}" y="${ys.join(" 