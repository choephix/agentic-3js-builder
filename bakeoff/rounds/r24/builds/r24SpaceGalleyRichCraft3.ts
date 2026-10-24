import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  catmull,
  createBuilder,
  frame,
  mix,
  mottle,
  noise,
  paint,
  resolve,
  rng,
  smoothstep,
  spiral,
  spots,
  stripes,
  svg,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Nostromo Galley",
  description:
    "The commercial towing vessel Nostromo's galley, Alien (1979) style: grimy cream and sage bulkhead panels, steel counters with sink, glowing hob, extractor hood, cold store, CRT terminal, bolted mess table with stools, the drinking bird, Jones' bowl, pipes and hazard markings.",
};

type V = [number, number, number];
type Col = string | Paint;

// ------------------------------------------------------------------ dimensions
const F = 0.06; // deck top
const TOP = F + 0.9; // counter top
const TT = F + 0.76; // mess table top

// ------------------------------------------------------------------ palette
const CREAM = "#d6cfb8";
const SAGE = "#8d9788";
const CABD = "#a9ad99";
const DARK = "#26282a";
const CHAR = "#3a3d3f";
const BLACK = "#121314";
const STEELD = "#5f666b";
const STEELL = "#c3c9cc";
const ORANGE = "#d9782a";
const YELLOW = "#e3b422";
const RED = "#b3302a";
const BLUE = "#2f5d8a";
const LEDG = "#6bff9a";
const LAMP = "#fff0c8";
const EMBER = "#ff7a1f";
const GRIME = "#221f18";
const PIPEW = "#cbc7b5";
const PIPEG = "#7d868a";
const GLASS = "#9fc3c6";
const WATER = "#7fb7d9";
const COFFEE = "#2b1a10";
const BEIGE = "#b7b098";
const MUGW = "#e9e4d3";
const CROCK = "#7b5234";

// ------------------------------------------------------------------ textures
const SIGN = svg(
  `<svg viewBox="0 0 560 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="560" height="100" rx="6" fill="#d8d1ba"/>
  <rect x="5" y="5" width="550" height="90" rx="4" fill="none" stroke="#26282a" stroke-width="3"/>
  <rect x="14" y="14" width="26" height="72" fill="#d9782a"/>
  <text x="58" y="72" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="68" letter-spacing="7" fill="#1b1d1e">GALLEY</text>
  <path d="M388 50 H452 M432 30 L460 50 L432 70" stroke="#1b1d1e" stroke-width="9" fill="none"/>
  <text x="476" y="46" font-family="Arial, sans-serif" font-weight="bold" font-size="19" fill="#1b1d1e">DECK B</text>
  <text x="476" y="72" font-family="Arial, sans-serif" font-weight="bold" font-size="19" fill="#b3302a">SECT 04</text>
</svg>`,
  { size: 1024 },
);

const LOGO = svg(
  `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="140" rx="8" fill="#1e2022"/>
  <rect x="6" y="6" width="288" height="128" rx="5" fill="none" stroke="#d6cfb8" stroke-width="3"/>
  <path d="M40 22 L62 70 L80 36 L98 70 L120 22 L134 22 L104 86 L80 52 L56 86 L26 22Z" fill="#d6cfb8"/>
  <path d="M150 22 L168 22 L184 50 L200 22 L218 22 L192 62 L192 86 L176 86 L176 62Z" fill="#d9782a"/>
  <text x="150" y="108" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#d6cfb8" letter-spacing="2">WEYLAND-YUTANI</text>
  <text x="150" y="126" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9a968a" letter-spacing="2">BUILDING BETTER WORLDS</text>
</svg>`,
  { size: 512 },
);

function crtMarkup() {
  let lines = "";
  for (let y = 0; y < 170; y += 4) lines += `<rect x="0" y="${y}" width="220" height="1.6" fill="#000" opacity="0.3"/>`;
  return `<svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="170" fill="#04100a"/>
  <g font-family="Courier New, monospace" font-weight="bold" fill="#6bff9a">
    <text x="10" y="22" font-size="16">MU/TH/UR 6000</text>
    <text x="10" y="38" font-size="10">GALLEY SUBSYSTEM 04</text>
    <path d="M10 44 H210" stroke="#6bff9a" stroke-width="2"/>
    <text x="10" y="62" font-size="11">* RANGE ...... ONLINE</text>
    <text x="10" y="78" font-size="11">* COLD STORE .. -18 C</text>
    <text x="10" y="94" font-size="11">* WATER RECYC .. 71 PCT</text>
    <text x="10" y="110" font-size="11">* CREW MEAL ... 0600</text>
    <rect x="10" y="120" width="120" height="10" fill="none" stroke="#6bff9a" stroke-width="2"/>
    <rect x="12" y="122" width="82" height="6" fill="#6bff9a"/>
    <text x="10" y="152" font-size="12">READY_</text>
  </g>
  ${lines}
</svg>`;
}
const CRT = svg(crtMarkup(), { size: 512 });

const FRIDGE_LABEL = svg(
  `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="120" rx="6" fill="#d8d1ba"/>
  <rect x="5" y="5" width="290" height="110" rx="4" fill="none" stroke="#1b1d1e" stroke-width="3"/>
  <path d="M10 10 L50 10 L10 50Z M290 110 L250 110 L290 70Z" fill="#e3b422"/>
  <text x="150" y="52" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="30" fill="#1b1d1e">FOOD STORE 02</text>
  <text x="150" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" fill="#b3302a">KEEP DOOR CLOSED</text>
  <text x="150" y="102" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#1b1d1e">CAP. 400 KG  /  -18 C</text>
</svg>`,
  { size: 512 },
);

const DISPLAY = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" fill="#080404"/>
  <text x="50" y="30" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="26" fill="#ff6a3a">-18.4C</text>
</svg>`,
  { size: 256 },
);

function stoveMarkup() {
  let s = `<svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="170" fill="#2b2e30"/><rect x="4" y="4" width="592" height="162" fill="none" stroke="#8a8f90" stroke-width="3"/>`;
  const names = ["REAR L", "REAR R", "FRONT L", "FRONT R"];
  [75, 225, 375, 525].forEach((cx, i) => {
    s += `<circle cx="${cx}" cy="85" r="36" fill="none" stroke="#d6cfb8" stroke-width="3"/>`;
    for (let k = 0; k <= 6; k++) {
      const a = ((-135 + k * 45) * Math.PI) / 180;
      const x1 = cx + Math.sin(a) * 42;
      const y1 = 85 - Math.cos(a) * 42;
      const x2 = cx + Math.sin(a) * 54;
      const y2 = 85 - Math.cos(a) * 54;
      s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#d6cfb8" stroke-width="${k % 3 === 0 ? 4 : 3}"/>`;
    }
    s += `<text x="${cx}" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#d6cfb8">${names[i]}</text>`;
    s += `<circle cx="${cx}" cy="20" r="7" fill="${i % 2 ? "#3b3b3b" : "#b3302a"}"/>`;
  });
  return s + "</svg>";
}
const STOVE = svg(stoveMarkup(), { size: 1024 });

const ROSTER = svg(
  `<svg viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="300" fill="#e9e4cf"/>
  <rect width="220" height="34" fill="#b3302a"/>
  <text x="110" y="23" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#f2eedc">DUTY ROSTER</text>
  <g font-family="Courier New, monospace" font-weight="bold" font-size="14" fill="#2a2a28">
    <text x="12" y="62">DALLAS ...... CAPT</text>
    <text x="12" y="86">KANE ........ EXEC</text>
    <text x="12" y="110">RIPLEY ...... WATCH</text>
    <text x="12" y="134">ASH ......... SCI</text>
    <text x="12" y="158">LAMBERT ..... NAV</text>
    <text x="12" y="182">PARKER ...... ENG</text>
    <text x="12" y="206">BRETT ....... ENG</text>
  </g>
  <path d="M12 220 H208" stroke="#2a2a28" stroke-width="3"/>
  <text x="12" y="244" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#b3302a">GALLEY DUTY: PARKER / BRETT</text>
  <text x="12" y="268" font-family="Arial, sans-serif" font-size="13" fill="#2a2a28">MEALS 0600 / 1200 / 1800</text>
  <path d="M170 150 l8 10 l18 -22" stroke="#2a5a2a" stroke-width="4" fill="none"/>
</svg>`,
  { size: 512 },
);

const CAUTION = svg(
  `<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="100" rx="5" fill="#e3b422"/>
  <rect x="4" y="4" width="232" height="92" rx="3" fill="none" stroke="#151515" stroke-width="4"/>
  <path d="M42 16 L78 80 L6 80Z" fill="#151515"/>
  <rect x="39" y="38" width="6" height="22" fill="#e3b422"/><rect x="39" y="64" width="6" height="6" fill="#e3b422"/>
  <text x="92" y="46" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="28" fill="#151515">CAUTION</text>
  <text x="92" y="76" font-family="Arial, sans-serif" font-weight="bold" font-size="19" fill="#151515">HOT SURFACE</text>
</svg>`,
  { size: 512 },
);

const JONES = svg(
  `<svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="60" rx="8" fill="#e8e2d0"/>
  <rect x="3" y="3" width="174" height="54" rx="6" fill="none" stroke="#1c1c1c" stroke-width="3"/>
  <circle cx="26" cy="36" r="9" fill="#d9782a"/><circle cx="14" cy="22" r="4" fill="#d9782a"/><circle cx="26" cy="17" r="4" fill="#d9782a"/><circle cx="38" cy="22" r="4" fill="#d9782a"/>
  <text x="106" y="42" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="30" fill="#1c1c1c">JONES</text>
</svg>`,
  { size: 512 },
);

const STEAM = svg(
  `<svg viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 158 C4 128 52 108 28 78 C10 52 40 34 30 4 C58 36 22 54 40 80 C58 108 14 128 30 158Z" fill="#eceeee"/>
</svg>`,
  { size: 128 },
);

function grilleMarkup() {
  let s = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="100" fill="#1d1f20"/>`;
  for (let x = 8; x < 114; x += 8) s += `<rect x="${x}" y="8" width="4.5" height="84" fill="#5c6366"/>`;
  s += `<rect x="2" y="2" width="116" height="96" fill="none" stroke="#7b8386" stroke-width="3"/></svg>`;
  return s;
}
const GRILLE = svg(grilleMarkup(), { size: 256 });

const WASTE = svg(
  `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="140" height="100" rx="6" fill="#e3b422"/>
  <rect x="4" y="4" width="132" height="92" rx="4" fill="none" stroke="#151515" stroke-width="4"/>
  <text x="70" y="42" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="30" fill="#151515">WASTE</text>
  <text x="70" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" fill="#151515">DISPOSAL</text>
  <path d="M70 90 V76 M62 82 L70 92 L78 82" stroke="#151515" stroke-width="4" fill="none"/>
</svg>`,
  { size: 256 },
);

// ------------------------------------------------------------------ paints
const STEEL = metal("steel", { polish: 0.45, tarnish: 0.25, seed: 3 });
const STEEL_OLD = metal("steel", { polish: 0.15, tarnish: 0.55, seed: 8 });
const IRON = metal("iron", { seed: 4 });
const COPPER = metal("copper", { verdigris: 0.3, seed: 6 });

const hazard = (dir: V, size = 0.07) =>
  paint((p) => {
    const t = (p.x * dir[0] + p.y * dir[1] + p.z * dir[2]) / size;
    const f = t - Math.floor(t);
    return mix(f < 0.5 ? YELLOW : "#1b1c1d", GRIME, smoothstep(0.55, 0.85, noise(p, 0.12, 21)) * 0.5);
  });
const HAZ = hazard([1, 1, 1]);

const wallBase = paint((p) => {
  if (Math.abs(p.y - 1.02) < 0.014) return ORANGE;
  if (Math.abs(p.y - 1.05) < 0.004 || Math.abs(p.y - 0.99) < 0.004) return DARK;
  const grime =
    smoothstep(0.55, 0.9, noise(p, 0.3, 11)) * 0.35 +
    smoothstep(0.5, 0.06, p.y) * 0.5 +
    smoothstep(2.25, 2.56, p.y) * 0.35;
  return mix(p.y < 1.0 ? SAGE : CREAM, GRIME, Math.min(grime, 0.75));
});
const WALL = panelled(wallBase, { size: 0.45, aspect: 1, rivets: 0.06 });

const DECK = paint((p, n) => {
  if (n.y < 0.5) return CHAR;
  const u = ((p.x % 0.6) + 0.6) % 0.6;
  const v = ((p.z % 0.6) + 0.6) % 0.6;
  if (u < 0.008 || v < 0.008) return "#17191a";
  if (u < 0.016 || v < 0.016) return "#6a6f6e";
  const d1 = (((p.x + p.z) / 0.045) % 1 + 1) % 1;
  const d2 = (((p.x - p.z) / 0.045) % 1 + 1) % 1;
  const c = mix("#4b4f4d", "#5d625f", d1 < 0.2 || d2 < 0.2 ? 1 : 0);
  const dirt =
    smoothstep(0.5, 0.85, noise(p, 0.35, 4)) * 0.5 +
    smoothstep(-0.5, -1.1, p.z) * 0.5 +
    smoothstep(0.62, 0.85, noise(p, 0.12, 9)) * 0.25;
  return mix(c, GRIME, Math.min(dirt, 0.8));
});

const TOPP = metal("steel", { polish: 0.55, tarnish: 0.25, seed: 3 });
const CABB = panelled("#7a8174", { size: 0.3, rivets: 0.05 });
const SPLASH = panelled(STEEL, { size: 0.3, aspect: 0.7, rivets: 0.05 });
const FRIDGE_BODY = panelled(IRON, { size: 0.35, rivets: 0.05 });
const LAM = paint((p, n) => {
  const base = spots("#d9d2ba", "#c3bba0", { size: 0.03, amount: 0.8, seed: 2 }).at(p, n);
  return mix(base, GRIME, smoothstep(0.6, 0.9, noise(p, 0.2, 3)) * 0.3);
});
const VINYLP = mottle("#b8641f", "#8f4c14", { size: 0.06, seed: 5 });
const PIPE1 = paint((p) => mix(PIPEW, GRIME, smoothstep(0.5, 0.9, noise(p, 0.15, 17)) * 0.5));
const PIPE2 = paint((p) => mix(PIPEG, GRIME, smoothstep(0.5, 0.9, noise(p, 0.15, 19)) * 0.5));
const PILLAR = paint((p) => (p.y < F + 0.5 ? HAZ : STEEL_OLD));
const GRATE = paint((p) => (((p.x / 0.03) % 1 + 1) % 1 < 0.5 ? "#0e0f10" : "#5a5f5e"));
const TOWEL = stripes("#e8e2d0", BLUE, { size: 0.04, axis: "x", wobble: 0, width: 0.4 });
const POUCH = stripes(ORANGE, CREAM, { size: 0.03, axis: "z", wobble: 0, width: 0.4 });

// ------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "nostromo_galley", paintSize: 2048 });
  const rand = rng(1979);

  // ---------------- helpers
  const box = (w: number, h: number, d: number, c: Col, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, ...o });
  const cyl = (r: number, h: number, c: Col, at: V, o: any = {}, seg = 12, rt = r) =>
    b.part(new THREE.CylinderGeometry(rt, r, h, seg), c, { at, ...o });
  const ball = (r: number, c: Col, at: V, o: any = {}) => b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, ...o });
  const turn = (outline: [number, number][], c: Col, at: V, o: any = {}) =>
    b.lathe(outline, { at, color: c, segments: 12, ...o });
  const rod = (a: V, e: V, r: number | [number, number], c: Col, o: any = {}) =>
    b.rod(a, e, r, { color: c, sides: 6, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V = [0, 0, 1], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const tube = (pts: V[], r: number | number[], c: Col, o: any = {}) =>
    b.sweep(catmull(pts), r, { color: c, sides: 6, ...o });
  const torus = (r: number, t: number, c: Col, at: V, o: any = {}, arc = Math.PI * 2) =>
    b.part(new THREE.TorusGeometry(r, t, 4, 12, arc), c, { at, ...o });

  // merged little fittings, grouped by colour
  const merged: Record<string, THREE.BufferGeometry[]> = {};
  const keep = (c: string, g: THREE.BufferGeometry) => {
    if (!merged[c]) merged[c] = [];
    merged[c].push(g);
  };
  const bolt = (c: string, x: number, y: number, z: number, axis: "x" | "y" | "z" = "z", r = 0.009) => {
    const g = new THREE.CylinderGeometry(r, r, 0.01, 6);
    if (axis === "z") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    g.translate(x, y, z);
    keep(c, g);
  };

  // cabinet door with stamped inset panel and grime
  const door = (cx: number, cy: number, w: number, h: number, z: number, base: Col, t = 0.025) => {
    const hw = w / 2;
    const hh = h / 2;
    const pnt = paint((p, n) => {
      const col = resolve(base, p, n);
      if (n.z < 0.6) return mix(col, "#101010", 0.55);
      const d = Math.min(hw - Math.abs(p.x - cx), hh - Math.abs(p.y - cy));
      const dirt = smoothstep(0.45, 0.8, noise(p, 0.12, 5)) * 0.35 + smoothstep(0.35, 0.0, p.y - F) * 0.35;
      let out = mix(col, "#1d1b14", dirt);
      if (d < 0.005) out = mix(out, "#0e0e0d", 0.6);
      else if (d > 0.03 && d < 0.036) out = mix(out, "#101010", 0.45);
      else if (d > 0.036 && d < 0.042) out = mix(out, "#ffffff", 0.2);
      return out;
    });
    return box(w, h, t, pnt, [cx, cy, z]);
  };

  // pull bar standing off a door face at zf
  const pull = (x: number, y: number, zf: number, len: number, vert: boolean) => {
    const a: V = vert ? [x, y - len / 2, zf + 0.03] : [x - len / 2, y, zf + 0.03];
    const e: V = vert ? [x, y + len / 2, zf + 0.03] : [x + len / 2, y, zf + 0.03];
    b.capsule(a, e, 0.011, { color: STEEL, sides: 6 });
    for (const q of [a, e]) rod([q[0], q[1], zf], q, 0.008, DARK);
  };

  // =========================================================== deck and bulkhead
  box(3.7, F, 2.64, DECK, [0, F / 2, 0.18]);
  box(3.7, 0.012, 0.1, hazard([1, 0, 1]), [0, F + 0.003, 1.44]);

  box(3.74, 2.62, 0.1, CHAR, [0, 1.31, -1.09]);
  for (const x of [-1.35, -0.45, 0.45, 1.35]) box(0.89, 2.5, 0.04, WALL, [x, F + 1.25, -1.02]);
  box(3.74, 0.12, 0.26, CHAR, [0, 2.62, -0.95]);

  for (const s of [-1, 1]) {
    box(0.12, 2.62, 0.22, PILLAR, [s * 1.79, 1.31, -0.93]);
    box(0.2, 0.04, 0.3, CHAR, [s * 1.77, F + 0.02, -0.93]);
    for (const dx of [-0.07, 0.07])
      for (const dz of [-0.1, 0.1]) bolt(STEELL, s * 1.77 + dx, F + 0.045, -0.93 + dz, "y");
    for (const y of [0.8, 1.4, 2.0]) bolt(STEELL, s * 1.79, y, -0.815, "z");
    // light strips
    box(1.04, 0.07, 0.12, CHAR, [s * 0.95, 2.52, -0.94]);
    glow(box(0.98, 0.04, 0.012, LAMP, [s * 0.95, 2.52, -0.878]), 1.2);
    for (const dx of [-0.5, 0.5]) bolt(STEELL, s * 0.95 + dx, 2.52, -0.88, "z", 0.01);
  }

  // =========================================================== pipes
  cyl(0.045, 3.66, PIPE1, [0, 2.4, -0.955], { dir: [1, 0, 0] }, 10);
  cyl(0.03, 3.66, PIPE2, [0, 2.4, -0.875], { dir: [1, 0, 0] }, 8);
  for (const x of [-1.5, -0.9, 0.9, 1.5]) {
    cyl(0.052, 0.03, STEELD, [x, 2.4, -0.955], { dir: [1, 0, 0] }, 10);
    cyl(0.037, 0.03, STEELD, [x, 2.4, -0.875], { dir: [1, 0, 0] }, 8);
    box(0.04, 0.05, 0.06, STEELD, [x, 2.4, -0.99]);
  }
  cyl(0.048, 0.06, RED, [-0.2, 2.4, -0.955], { dir: [1, 0, 0] }, 10);
  cyl(0.048, 0.06, YELLOW, [0.2, 2.4, -0.955], { dir: [1, 0, 0] }, 10);
  cyl(0.048, 0.06, BLUE, [1.1, 2.4, -0.955], { dir: [1, 0, 0] }, 10);
  // valve wheel on the front pipe
  rod([-1.65, 2.43, -0.875], [-1.65, 2.5, -0.875], 0.008, STEELD);
  torus(0.036, 0.005, RED, [-1.65, 2.51, -0.875], { dir: [0, 1, 0], axis: "z" });
  cyl(0.012, 0.014, RED, [-1.65, 2.51, -0.875], {}, 6);
  // feeder drops into cabinet and cold store
  cyl(0.025, 0.34, PIPE2, [-1.62, 2.23, -0.875], {}, 8);
  ball(0.036, PIPEG, [-1.62, 2.4, -0.875]);
  cyl(0.04, 0.015, STEELD, [-1.62, 2.07, -0.875], {}, 8);
  cyl(0.025, 0.41, PIPE2, [0.75, 2.195, -0.875], {}, 8);
  ball(0.036, PIPEG, [0.75, 2.4, -0.875]);
  cyl(0.04, 0.015, STEELD, [0.75, 2.0, -0.875], {}, 8);

  // wall signage
  plane(1.2, 0.214, SIGN, [1.2, 2.17, -0.995]);
  plane(0.3, 0.14, LOGO, [1.58, 1.68, -0.995]);

  // =========================================================== counter run
  box(0.25, 0.76, 0.58, CABB, [-1.575, 0.54, -0.71]);
  box(0.6, 0.52, 0.58, CABB, [-1.15, 0.42, -0.71]);
  box(1.35, 0.76, 0.58, CABB, [-0.175, 0.54, -0.71]);
  box(2.14, 0.1, 0.5, CHAR, [-0.6, F + 0.05, -0.74]);
  box(0.25, 0.04, 0.64, TOPP, [-1.575, TOP - 0.02, -0.68]);
  box(1.35, 0.04, 0.64, TOPP, [-0.175, TOP - 0.02, -0.68]);
  box(0.6, 0.04, 0.08, TOPP, [-1.15, TOP - 0.02, -0.96]);
  box(0.6, 0.04, 0.14, TOPP, [-1.15, TOP - 0.02, -0.43]);

  const DZ = -0.4075;
  const DF = -0.395;
  // sink doors
  door(-1.49, 0.54, 0.41, 0.74, DZ, CABD);
  door(-1.06, 0.54, 0.41, 0.74, DZ, CABD);
  pull(-1.3, 0.56, DF, 0.2, true);
  pull(-1.25, 0.56, DF, 0.2, true);
  // drawers
  for (const cy of [0.29, 0.54, 0.79]) {
    door(-0.7, cy, 0.32, 0.24, DZ, CABD);
    pull(-0.7, cy, DF, 0.16, false);
  }
  // oven
  door(-0.2, 0.43, 0.66, 0.52, DZ, STEEL);
  pull(-0.2, 0.62, DF, 0.5, false);
  box(0.48, 0.3, 0.008, DARK, [-0.2, 0.4, -0.396]);
  box(0.44, 0.26, 0.01, "#141b1d", [-0.2, 0.4, -0.393]);
  glow(box(0.36, 0.012, 0.004, EMBER, [-0.2, 0.305, -0.387]), 0.9);
  // stove fascia
  door(-0.2, 0.805, 0.66, 0.21, DZ, STEEL);
  plane(0.6, 0.17, STOVE, [-0.2, 0.805, -0.393]);
  for (const kx of [-0.425, -0.275, -0.125, 0.025]) {
    cyl(0.024, 0.03, DARK, [kx, 0.805, -0.38], { dir: [0, 0, 1] }, 10);
    box(0.004, 0.02, 0.004, "#e8e2cd", [kx, 0.817, -0.363]);
  }
  // narrow door
  door(0.32, 0.54, 0.35, 0.74, DZ, CABD);
  pull(0.2, 0.58, DF, 0.2, true);
  plane(0.2, 0.083, CAUTION, [0.33, 0.8, -0.393]);
  for (const x of [-1.68, 0.48]) for (const y of [0.25, 0.85]) bolt(STEELL, x, y, DF, "z");

  // =========================================================== sink
  box(0.56, 0.02, 0.4, STEEL_OLD, [-1.15, 0.71, -0.71]);
  box(0.02, 0.26, 0.42, STEEL_OLD, [-1.44, 0.83, -0.71]);
  box(0.02, 0.26, 0.42, STEEL_OLD, [-0.86, 0.83, -0.71]);
  box(0.58, 0.26, 0.02, STEEL_OLD, [-1.15, 0.83, -0.91]);
  box(0.58, 0.26, 0.02, STEEL_OLD, [-1.15, 0.83, -0.51]);
  cyl(0.035, 0.008, BLACK, [-1.15, 0.724, -0.71], {}, 10);
  box(0.05, 0.004, 0.008, STEELD, [-1.15, 0.729, -0.71]);
  box(0.008, 0.004, 0.05, STEELD, [-1.15, 0.729, -0.71]);
  // gooseneck faucet
  cyl(0.035, 0.03, STEEL, [-1.15, TOP + 0.015, -0.96], {}, 10);
  tube(
    [
      [-1.15, TOP + 0.03, -0.96],
      [-1.15, TOP + 0.2, -0.96],
      [-1.15, TOP + 0.29, -0.93],
      [-1.15, TOP + 0.29, -0.85],
      [-1.15, TOP + 0.24, -0.78],
    ],
    0.014,
    STEEL,
  );
  cyl(0.02, 0.04, STEEL_OLD, [-1.15, TOP + 0.21, -0.78], {}, 8);
  for (const s of [-1, 1]) {
    rod([-1.15 + s * 0.03, TOP + 0.06, -0.96], [-1.15 + s * 0.1, TOP + 0.06, -0.96], 0.008, STEELD);
    ball(0.022, s > 0 ? RED : BLUE, [-1.15 + s * 0.11, TOP + 0.06, -0.96]);
  }

  // =========================================================== hob and cookware
  box(0.66, 0.02, 0.52, STEEL_OLD, [-0.2, TOP + 0.01, -0.68]);
  const burners: [number, number][] = [
    [-0.35, -0.8],
    [-0.05, -0.8],
    [-0.35, -0.56],
    [-0.05, -0.56],
  ];
  for (const [bx, bz] of burners) {
    turn(
      [
        [0, 0],
        [0.08, 0],
        [0.078, 0.012],
        [0, 0.012],
      ],
      CHAR,
      [bx, TOP + 0.02, bz],
      { segments: 10 },
    );
    const coil = b.sweep(
      spiral([bx, TOP + 0.036, bz], [bx + 0.062, TOP + 0.036, bz], [0, 1, 0], { turns: 2.3, r1: 0.012, pitch: 0 }),
      0.004,
      { color: EMBER, sides: 5 },
    );
    glow(coil, 1.6);
  }
  const py = TOP + 0.032;
  // stock pot
  turn(
    [
      [0, 0],
      [0.11, 0],
      [0.115, 0.005],
      [0.12, 0.22],
      [0.11, 0.22],
      [0.105, 0.015],
      [0, 0.015],
    ],
    STEEL_OLD,
    [-0.35, py, -0.8],
  );
  turn(
    [
      [0, 0],
      [0.125, 0],
      [0.125, 0.008],
      [0.08, 0.03],
      [0, 0.04],
    ],
    STEEL,
    [-0.35, py + 0.22, -0.8],
  );
  ball(0.018, BLACK, [-0.35, py + 0.265, -0.8]);
  for (const s of [-1, 1]) box(0.045, 0.02, 0.025, DARK, [-0.35 + s * 0.138, py + 0.18, -0.8]);
  // kettle
  turn(
    [
      [0, 0],
      [0.085, 0],
      [0.09, 0.01],
      [0.075, 0.12],
      [0.05, 0.15],
      [0, 0.155],
    ],
    COPPER,
    [-0.05, py, -0.8],
    { segments: 10 },
  );
  ball(0.014, BLACK, [-0.05, py + 0.165, -0.8]);
  rod([0.02, py + 0.1, -0.8], [0.115, py + 0.165, -0.8], [0.016, 0.009], COPPER);
  torus(0.07, 0.007, DARK, [-0.05, py + 0.15, -0.8], {}, Math.PI);
  // frying pan with eggs
  turn(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.04],
      [0.115, 0.042],
      [0.095, 0.01],
      [0, 0.01],
    ],
    IRON,
    [-0.05, py, -0.56],
  );
  rod([0.06, py + 0.03, -0.53], [0.2, py + 0.035, -0.45], 0.011, DARK);
  ball(0.014, DARK, [0.205, py + 0.036, -0.446]);
  for (const [ex, ez] of [
    [-0.075, -0.575],
    [-0.02, -0.54],
  ]) {
    turn(
      [
        [0, 0],
        [0.04, 0],
        [0.042, 0.004],
        [0.03, 0.008],
        [0, 0.008],
      ],
      "#f2efe2",
      [ex, py + 0.011, ez],
      { segments: 8 },
    );
    ball(0.014, "#f0b323", [ex, py + 0.02, ez], { scale: [1, 0.7, 1] });
  }

  // =========================================================== counter clutter
  const canister = (x: number, z: number, h: number, c: string) => {
    const body = paint((p) => {
      const y = p.y - TOP;
      return y > 0.3 * h && y < 0.78 * h ? CREAM : c;
    });
    turn(
      [
        [0, 0],
        [0.055, 0],
        [0.058, 0.01],
        [0.058, h],
        [0, h],
      ],
      body,
      [x, TOP, z],
      { segments: 10 },
    );
    turn(
      [
        [0, 0],
        [0.062, 0],
        [0.062, 0.015],
        [0.022, 0.026],
        [0, 0.026],
      ],
      DARK,
      [x, TOP + h, z],
      { segments: 10 },
    );
  };
  canister(-1.62, -0.9, 0.22, "#6b7a4f");
  canister(-1.54, -0.72, 0.16, ORANGE);
  canister(-1.63, -0.58, 0.12, "#7d3b2a");

  // utensil crock
  turn(
    [
      [0, 0],
      [0.05, 0],
      [0.055, 0.01],
      [0.055, 0.12],
      [0.048, 0.12],
      [0.045, 0.015],
      [0, 0.015],
    ],
    CROCK,
    [-0.62, TOP, -0.9],
    { segments: 10 },
  );
  rod([-0.62, TOP + 0.1, -0.9], [-0.65, TOP + 0.26, -0.93], 0.007, STEEL);
  rod([-0.62, TOP + 0.1, -0.9], [-0.58, TOP + 0.24, -0.92], 0.007, STEEL);
  rod([-0.63, TOP + 0.1, -0.9], [-0.62, TOP + 0.27, -0.88], 0.007, DARK);
  ball(0.022, STEEL, [-0.65, TOP + 0.28, -0.93], { scale: [1, 1, 0.5] });
  ball(0.02, STEEL, [-0.58, TOP + 0.26, -0.92], { scale: [0.6, 1.1, 0.4] });
  // soap
  cyl(0.03, 0.14, "#2f6b7a", [-0.77, TOP + 0.07, -0.93], {}, 8);
  cyl(0.008, 0.04, DARK, [-0.77, TOP + 0.16, -0.93], {}, 6);
  rod([-0.77, TOP + 0.18, -0.93], [-0.74, TOP + 0.18, -0.93], 0.007, DARK);

  // coffee machine
  const cmx = 0.31;
  box(0.26, 0.03, 0.24, CHAR, [cmx, TOP + 0.015, -0.8]);
  box(0.22, 0.34, 0.07, BEIGE, [cmx, TOP + 0.2, -0.945]);
  box(0.24, 0.07, 0.2, BEIGE, [cmx, TOP + 0.33, -0.86]);
  cyl(0.02, 0.03, DARK, [cmx, TOP + 0.28, -0.82], {}, 8);
  turn(
    [
      [0, 0],
      [0.05, 0],
      [0.058, 0.02],
      [0.055, 0.13],
      [0.05, 0.13],
      [0.047, 0.02],
      [0, 0.012],
    ],
    GLASS,
    [cmx, TOP + 0.03, -0.82],
    { segments: 10 },
  );
  cyl(0.045, 0.07, COFFEE, [cmx, TOP + 0.075, -0.82], {}, 10);
  torus(0.035, 0.006, BLACK, [cmx + 0.058, TOP + 0.1, -0.82], { rotation: [0, 0, -90] }, Math.PI);
  glow(box(0.02, 0.012, 0.01, LEDG, [cmx - 0.07, TOP + 0.36, -0.757]), 1.4);
  box(0.08, 0.03, 0.006, DARK, [cmx + 0.02, TOP + 0.33, -0.758]);

  // =========================================================== backsplash and tool rail
  box(2.2, 0.5, 0.01, SPLASH, [-0.6, 1.21, -0.995]);
  rod([-1.7, 1.3, -0.96], [-0.9, 1.3, -0.96], 0.008, STEEL);
  for (const x of [-1.68, -1.3, -0.92]) rod([x, 1.3, -0.99], [x, 1.3, -0.96], 0.008, DARK);
  const ladle: [number, number][] = [
    [-0.006, 0],
    [0.006, 0],
    [0.006, -0.19],
    [0.03, -0.2],
    [0.042, -0.23],
    [0.042, -0.26],
    [0.03, -0.285],
    [0, -0.295],
    [-0.03, -0.285],
    [-0.042, -0.26],
    [-0.042, -0.23],
    [-0.03, -0.2],
    [-0.006, -0.19],
  ];
  const spatula: [number, number][] = [
    [-0.006, 0],
    [0.006, 0],
    [0.006, -0.17],
    [0.04, -0.19],
    [0.04, -0.28],
    [-0.04, -0.28],
    [-0.04, -0.19],
    [-0.006, -0.17],
  ];
  b.extrude(ladle, { at: [-1.6, 1.3, -0.955], x: [1, 0, 0], thickness: 0.006, color: STEEL });
  b.extrude(spatula, { at: [-1.46, 1.3, -0.955], x: [1, 0, 0], thickness: 0.006, color: DARK });
  // whisk
  rod([-1.32, 1.3, -0.955], [-1.32, 1.18, -0.955], 0.006, STEEL);
  for (const a of [0, 60, 120])
    b.part(new THREE.TorusGeometry(0.03, 0.0025, 4, 10), STEEL, { at: [-1.32, 1.1, -0.955], rotation: [0, a, 0], scale: [0.6, 1.5, 1] });
  // hanging towel
  box(0.16, 0.26, 0.01, TOWEL, [-1.08, 1.17, -0.955]);
  box(0.16, 0.03, 0.02, TOWEL, [-1.08, 1.29, -0.955]);
  // roster
  plane(0.22, 0.3, ROSTER, [-0.7, 1.31, -0.985]);
  ball(0.008, RED, [-0.7, 1.45, -0.98]);

  // =========================================================== upper cabinets
  box(0.85, 0.6, 0.3, CABB, [-1.275, 1.76, -0.85]);
  door(-1.49, 1.76, 0.41, 0.58, -0.6875, CABD);
  door(-1.06, 1.76, 0.41, 0.58, -0.6875, CABD);
  pull(-1.3, 1.62, -0.675, 0.14, true);
  pull(-1.25, 1.62, -0.675, 0.14, true);
  glow(box(0.7, 0.012, 0.04, LAMP, [-1.275, 1.452, -0.8]), 1);
  box(0.3, 0.6, 0.3, CABB, [0.35, 1.76, -0.85]);
  door(0.35, 1.76, 0.28, 0.58, -0.6875, CABD);
  pull(0.28, 1.62, -0.675, 0.14, true);

  // open shelf with cans and jars
  box(0.27, 0.02, 0.28, STEELD, [-0.715, 1.6, -0.86]);
  box(0.27, 0.02, 0.28, STEELD, [-0.715, 1.84, -0.86]);
  const canP = (y0: number, c: string) => paint((p) => (p.y - y0 < 0.012 || p.y - y0 > 0.098 ? STEELL : c));
  [-0.79, -0.715, -0.64].forEach((x, i) =>
    cyl(0.035, 0.11, canP(1.61, ["#7d3b2a", "#6b7a4f", "#c9a13a"][i]), [x, 1.665, -0.86], {}, 10),
  );
  [-0.79, -0.75, -0.71].forEach((x, i) => {
    cyl(0.02, 0.09, [GLASS, "#c9a13a", "#a65a2a"][i], [x, 1.895, -0.88], {}, 8);
    cyl(0.022, 0.015, BLACK, [x, 1.947, -0.88], {}, 8);
  });
  box(0.08, 0.14, 0.05, POUCH, [-0.64, 1.92, -0.88]);

  // =========================================================== extractor hood
  b.extrude(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.07],
      [0.3, 0.38],
      [0, 0.38],
    ],
    { at: [-0.2, 1.5, -1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.76, color: STEEL },
  );
  box(0.3, 0.68, 0.3, STEEL_OLD, [-0.2, 2.22, -0.85]);
  box(0.76, 0.04, 0.02, DARK, [-0.2, 1.52, -0.38]);
  b.part(new THREE.PlaneGeometry(0.7, 0.58), "#ffffff", {
    at: [-0.2, 1.498, -0.69],
    dir: [0, -1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: GRILLE,
  });
  for (const s of [-1, 1]) glow(box(0.1, 0.008, 0.07, LAMP, [-0.2 + s * 0.26, 1.494, -0.55]), 1.3);

  // =========================================================== cold store
  box(0.8, 0.08, 0.62, CHAR, [1.0, F + 0.04, -0.69]);
  box(0.8, 1.85, 0.7, FRIDGE_BODY, [1.0, 1.065, -0.65]);
  door(1.0, 0.73, 0.78, 1.1, -0.28, STEEL, 0.04);
  door(1.0, 1.625, 0.78, 0.65, -0.28, STEEL, 0.04);
  pull(1.33, 0.85, -0.26, 0.45, true);
  pull(1.33, 1.62, -0.26, 0.3, true);
  box(0.04, 0.06, 0.03, RED, [1.33, 1.2, -0.245]);
  for (const y of [0.3, 1.1, 1.4, 1.85]) box(0.03, 0.07, 0.03, DARK, [0.61, y, -0.255]);
  plane(0.3, 0.12, FRIDGE_LABEL, [0.97, 1.82, -0.258]);
  box(0.12, 0.06, 0.01, DARK, [1.0, 1.6, -0.262]);
  glow(plane(0.1, 0.04, DISPLAY, [1.0, 1.6, -0.2565]), 1.2);

  // =========================================================== CRT terminal
  box(0.34, 0.03, 0.2, CHAR, [1.58, 1.2, -0.9]);
  box(0.3, 0.02, 0.1, BEIGE, [1.58, 1.225, -0.87]);
  const keys: THREE.BufferGeometry[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      keys.push(new THREE.BoxGeometry(0.026, 0.01, 0.022).translate(1.58 + (c - 3.5) * 0.033, 1.24, -0.9 + r * 0.03));
  const keyMerged = mergeGeometries(keys);
  if (keyMerged) b.part(keyMerged, "#bdb7a2", { at: [0, 0, 0] });
  box(0.28, 0.24, 0.2, BEIGE, [1.58, 1.35, -0.895]);
  box(0.3, 0.26, 0.03, "#b9b29a", [1.58, 1.35, -0.795]);
  for (let i = 0; i < 4; i++) keep(DARK, new THREE.BoxGeometry(0.2, 0.006, 0.01).translate(1.58, 1.465, -0.93 + i * 0.03));
  glow(plane(0.22, 0.17, CRT, [1.58, 1.365, -0.7795]), 0.9);
  cyl(0.01, 0.015, DARK, [1.68, 1.255, -0.775], { dir: [0, 0, 1] }, 8);
  glow(ball(0.007, LEDG, [1.5, 1.255, -0.78]), 1.5);
  tube(
    [
      [1.66, 1.2, -0.96],
      [1.68, 1.05, -0.97],
      [1.69, 0.7, -0.97],
      [1.7, 0.3, -0.95],
      [1.7, F + 0.012, -0.88],
    ],
    0.012,
    BLACK,
  );

  // =========================================================== waste bin
  const bin = turn(
    [
      [0, 0],
      [0.12, 0],
      [0.14, 0.03],
      [0.14, 0.5],
      [0.15, 0.52],
      [0.15, 0.55],
      [0.12, 0.6],
      [0, 0.61],
    ],
    paint((p) => (p.y > F + 0.14 && p.y < F + 0.2 ? HAZ : mix("#4f5a46", GRIME, smoothstep(0.5, 0.9, noise(p, 0.1, 7)) * 0.5))),
    [1.57, F, -0.6],
    { segments: 10 },
  );
  b.decal(bin, WASTE, { at: [1.57, F + 0.34, -0.46], dir: [0, 0, 1], size: [0.12, 0.086] });
  box(0.1, 0.02, 0.06, DARK, [1.57, F + 0.012, -0.44]);
  rod([1.57, F + 0.58, -0.46], [1.57, F + 0.6, -0.42], 0.01, DARK);

  // =========================================================== fire extinguisher
  const ex: V = [-1.78, F + 0.28, -0.76];
  turn(
    [
      [0, 0],
      [0.052, 0],
      [0.06, 0.02],
      [0.06, 0.3],
      [0.046, 0.34],
      [0.026, 0.355],
      [0, 0.355],
    ],
    RED,
    ex,
    { segments: 10 },
  );
  cyl(0.03, 0.04, BLACK, [ex[0], ex[1] + 0.375, ex[2]], {}, 8);
  rod([ex[0] - 0.05, ex[1] + 0.41, ex[2]], [ex[0] + 0.04, ex[1] + 0.4, ex[2]], 0.007, BLACK);
  cyl(0.02, 0.01, STEELL, [ex[0], ex[1] + 0.3, ex[2] + 0.06], { dir: [0, 0, 1] }, 8);
  for (const y of [0.1, 0.22]) torus(0.063, 0.006, BLACK, [ex[0], ex[1] + y, ex[2]], { dir: [0, 1, 0], axis: "z" });
  tube(
    [
      [ex[0], ex[1] + 0.385, ex[2] + 0.02],
      [ex[0], ex[1] + 0.4, ex[2] + 0.075],
      [ex[0], ex[1] + 0.3, ex[2] + 0.095],
      [ex[0], ex[1] + 0.2, ex[2] + 0.095],
      [ex[0], ex[1] + 0.13, ex[2] + 0.085],
    ],
    0.009,
    BLACK,
  );
  b.spike([ex[0], ex[1] + 0.13, ex[2] + 0.085], [0, -1, 0], 0.07, 0.02, { color: BLACK, sides: 6 });

  // =========================================================== mess table
  box(1.7, 0.04, 0.8, LAM, [0, TT - 0.02, 0.65]);
  for (const s of [-1, 1]) {
    box(1.72, 0.046, 0.014, STEEL, [0, TT - 0.023, 0.65 + s * 0.407]);
    box(0.014, 0.046, 0.8, STEEL, [s * 0.857, TT - 0.023, 0.65]);
    cyl(0.04, 0.72, STEELD, [s * 0.55, 0.42, 0.65], {}, 10);
    cyl(0.13, 0.02, STEELD, [s * 0.55, F + 0.01, 0.65], {}, 12);
    cyl(0.08, 0.015, STEELD, [s * 0.55, TT - 0.0475, 0.65], {}, 10);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      bolt(STEELL, s * 0.55 + Math.cos(a) * 0.1, F + 0.022, 0.65 + Math.sin(a) * 0.1, "y");
    }
  }
  box(1.2, 0.04, 0.08, CHAR, [0, TT - 0.06, 0.65]);

  const stool = (x: number, z: number) => {
    cyl(0.1, 0.015, STEELD, [x, F + 0.0075, z], {}, 12);
    cyl(0.028, 0.38, STEELL, [x, F + 0.19, z], {}, 8);
    turn(
      [
        [0, 0],
        [0.15, 0],
        [0.17, 0.02],
        [0.17, 0.045],
        [0.14, 0.065],
        [0, 0.065],
      ],
      VINYLP,
      [x, 0.44, z],
      { segments: 12 },
    );
    torus(0.168, 0.007, STEELD, [x, 0.47, z], { dir: [0, 1, 0], axis: "z" });
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      bolt(STEELL, x + Math.cos(a) * 0.07, F + 0.017, z + Math.sin(a) * 0.07, "y");
    }
  };
  for (const x of [-0.5, 0, 0.5]) {
    stool(x, 0.06);
    stool(x, 1.24);
  }

  // ---- trays
  const tray = (x: number, z: number, g: string, br: string, or: string) => {
    box(0.34, 0.012, 0.24, STEEL, [x, TT + 0.006, z]);
    for (const s of [-1, 1]) {
      box(0.34, 0.02, 0.01, STEEL, [x, TT + 0.016, z + s * 0.115]);
      box(0.01, 0.02, 0.24, STEEL, [x + s * 0.165, TT + 0.016, z]);
    }
    box(0.008, 0.016, 0.22, STEELD, [x + 0.04, TT + 0.02, z]);
    box(0.2, 0.016, 0.008, STEELD, [x - 0.06, TT + 0.02, z]);
    ball(0.045, g, [x - 0.07, TT + 0.022, z - 0.055], { scale: [1, 0.35, 0.9] });
    ball(0.045, br, [x - 0.07, TT + 0.022, z + 0.055], { scale: [1, 0.35, 0.9] });
    ball(0.05, or, [x + 0.11, TT + 0.024, z], { scale: [0.8, 0.45, 1.5] });
    rod([x + 0.0, TT + 0.016, z + 0.095], [x + 0.1, TT + 0.016, z + 0.095], 0.004, STEELL);
  };
  tray(-0.5, 0.48, "#7aa04a", "#8a5a32", "#d98a2a");
  tray(-0.45, 0.88, "#c9a13a", "#6b3a22", "#7aa04a");

  // ---- mugs
  const mug = (x: number, z: number, c: string) => {
    turn(
      [
        [0, 0],
        [0.038, 0],
        [0.04, 0.01],
        [0.04, 0.09],
        [0.036, 0.09],
        [0.034, 0.012],
        [0, 0.012],
      ],
      c,
      [x, TT, z],
      { segments: 10 },
    );
    cyl(0.033, 0.003, COFFEE, [x, TT + 0.078, z], {}, 10);
    torus(0.025, 0.006, c, [x + 0.04, TT + 0.05, z], { rotation: [0, 0, -90] }, Math.PI);
  };
  mug(-0.16, 0.5, MUGW);
  mug(0.25, 0.92, BLUE);
  mug(-0.1, 0.94, ORANGE);
  mug(0.1, 0.4, MUGW);

  // ---- thermos, shakers, pouches
  turn(
    [
      [0, 0],
      [0.045, 0],
      [0.05, 0.01],
      [0.05, 0.24],
      [0.04, 0.26],
      [0.04, 0.28],
      [0, 0.28],
    ],
    BLUE,
    [0.0, TT, 0.7],
    { segments: 10 },
  );
  cyl(0.043, 0.03, RED, [0.0, TT + 0.295, 0.7], {}, 10);
  for (const [x, c] of [
    [0.14, "#d8e6e8"],
    [0.19, "#d8e6e8"],
  ] as [number, string][]) {
    turn(
      [
        [0, 0],
        [0.02, 0],
        [0.022, 0.01],
        [0.02, 0.06],
        [0.012, 0.075],
        [0, 0.075],
      ],
      c,
      [x, TT, 0.62],
      { segments: 8 },
    );
    cyl(0.014, 0.012, STEEL, [x, TT + 0.081, 0.62], {}, 8);
  }
  for (let i = 0; i < 3; i++) box(0.1, 0.02, 0.07, POUCH, [0.3 + i * 0.01, TT + 0.01 + i * 0.02, 0.52]);

  // ---- drinking bird
  const bx = 0.58;
  const bz = 0.62;
  cyl(0.05, 0.008, CHAR, [bx, TT + 0.004, bz], {}, 10);
  for (const s of [-1, 1]) rod([bx + s * 0.03, TT, bz], [bx + s * 0.03, TT + 0.1, bz], 0.004, STEELD);
  rod([bx - 0.03, TT + 0.1, bz], [bx + 0.03, TT + 0.1, bz], 0.004, STEELL);
  ball(0.03, RED, [bx, TT + 0.047, bz]);
  rod([bx, TT + 0.05, bz], [bx, TT + 0.22, bz], 0.006, "#8fbfc0");
  ball(0.02, RED, [bx, TT + 0.23, bz]);
  b.spike([bx, TT + 0.225, bz + 0.015], [0, 0, 1], 0.045, 0.013, { color: BLACK, sides: 6 });
  for (const s of [-1, 1]) ball(0.005, BLACK, [bx + s * 0.013, TT + 0.238, bz + 0.015]);
  cyl(0.032, 0.004, BLACK, [bx, TT + 0.248, bz], {}, 10);
  cyl(0.018, 0.03, BLACK, [bx, TT + 0.265, bz], {}, 10);
  b.extrude(
    [
      [0, 0],
      [0.03, 0.02],
      [0.04, 0.05],
      [0.0, 0.03],
    ],
    { at: [bx, TT + 0.22, bz - 0.015], x: [0, 0, -1], thickness: 0.004, color: ORANGE },
  );
  turn(
    [
      [0, 0],
      [0.03, 0],
      [0.032, 0.06],
      [0.028, 0.06],
      [0.027, 0.006],
      [0, 0.006],
    ],
    GLASS,
    [bx, TT, bz + 0.11],
    { segments: 8 },
  );
  cyl(0.026, 0.04, WATER, [bx, TT + 0.026, bz + 0.11], {}, 8);

  // ---- crumbs
  for (let i = 0; i < 16; i++) {
    const g = new THREE.BoxGeometry(0.008 + rand() * 0.008, 0.005, 0.008 + rand() * 0.008);
    g.rotateY(rand() * Math.PI);
    g.translate(-0.8 + rand() * 1.6, TT + 0.003, 0.3 + rand() * 0.7);
    keep("#8a5a32", g);
  }

  // =========================================================== floor items
  box(0.3, 0.008, 0.22, CHAR, [-1.15, F + 0.004, 0.7]);
  const bowl = turn(
    [
      [0, 0],
      [0.06, 0],
      [0.09, 0.045],
      [0.085, 0.045],
      [0.056, 0.012],
      [0, 0.012],
    ],
    STEEL,
    [-1.15, F + 0.008, 0.7],
    { segments: 10 },
  );
  ball(0.045, "#8a5a32", [-1.15, F + 0.026, 0.7], { scale: [1, 0.3, 1] });
  b.decal(bowl, JONES, { at: [-1.15, F + 0.03, 0.775], dir: [0, 0, 1], size: [0.09, 0.03] });
  box(0.5, 0.006, 0.24, GRATE, [-0.6, F + 0.003, -0.2]);

  // =========================================================== flush merged fittings
  for (const [c, list] of Object.entries(merged)) {
    const g = mergeGeometries(list);
    if (g) b.part(g, c, { at: [0, 0, 0] });
  }

  // =========================================================== steam wisps
  b.cards(
    [frame([-0.35, py + 0.27, -0.8], [0, 1, 0]), frame([-0.31, py + 0.27, -0.78], [0, 1, 0])],
    STEAM,
    { size: [0.1, 0.26], lean: 0, flow: [0, 0, 1], bend: 25, cross: true, vary: 0.3, rng: rand, color: "#ffffff" },
  );
  b.cards([frame([0.07, py + 0.17, -0.8], [0, 1, 0])], STEAM, {
    size: [0.07, 0.18],
    lean: 10,
    flow: [1, 0, 0.3],
    bend: 20,
    cross: true,
    rng: rand,
    color: "#ffffff",
  });

  return b.root;
}
