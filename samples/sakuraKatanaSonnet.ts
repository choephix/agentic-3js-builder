// Sakura katana and saya on a lacquered two-tier stand: Inazuma-flavoured Genshin / anime look.
// Violet lacquer, gold filigree, blossom fittings, lilac electro glow, cel-shaded paints.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Sakura Katana and Saya on Lacquer Stand",
  description:
    "A curved katana with blossom tsuba, wrapped hilt and glowing lilac runes, its empty saya beside it, resting on a violet and crimson lacquer stand with gold sakura maki-e, tassels and drifting petals.",
  style: "Genshin/anime mix",
  commit: "88fc1f0",
};

// ---------- palette ----------
const GOLD = cel("#ffd35a", "#c98a2c");
const GOLD_DK = cel("#e0a63a", "#a8681f");
const VIOLET = cel("#4b35ac", "#2a1c6a");
const DEEP = cel("#2d2174", "#1a1248");
const CRIM = cel("#d8456f", "#8f2358");
const PINK = cel("#ffbdd6", "#e684b0");
const CREAM = cel("#fff5ee", "#e9cbd8");
const LILAC_GLOW = "#d9a8ff";
const PINK_GLOW = "#ffc2de";

// ---------- layout (meters; sword axis along X, tsuka toward -X) ----------
const Y0 = 0.5; // katana axis height
const YS = 0.255; // saya axis height
const XH = -0.2; // habaki / koiguchi
const LB = 0.66; // visible blade length
const SORI = 0.06; // drop of the tip below the straight line from the habaki
const XT = XH + LB;
const ZC = -0.065; // stand posts sit behind the swords
const POSTS = [-0.14, 0.3];

const yc = (x: number) => {
  const u = Math.max(0, (x - XH) / LB);
  return -SORI * u * u;
};
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const halfW = (u: number) => 0.0165 - 0.004 * Math.min(Math.max(u, 0), 1);
const K0 = 0.9;
function bladeSection(u: number) {
  const uu = Math.min(Math.max(u, 0), 1);
  const hw = halfW(uu);
  let ry = hw;
  let rx = 0.004 - 0.0007 * uu;
  if (uu > K0) {
    const k = Math.pow((uu - K0) / (1 - K0), 1.5);
    ry = Math.max(hw * (1 - k), 0.0006);
    rx = Math.max(rx * (1 - 0.8 * k), 0.0008);
  }
  return { rx, ry, hw, shift: -(hw - ry) };
}
const sayaR = (x: number): [number, number] => {
  const k = Math.min(Math.max((x - XH) / 0.655, 0), 1);
  return [0.0158 - 0.0035 * k, 0.0205 - 0.0055 * k];
};

// ---------- outlines ----------
function sakura(r: number, k = 5): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  const per = r > 0.02 ? 7 : r > 0.011 ? 5 : 3;
  for (let i = 0; i < k; i++) {
    const a0 = (i / k) * Math.PI * 2 + Math.PI / 2;
    for (let j = 0; j < per; j++) {
      const f = -1 + (2 * j + 1) / per;
      const ang = a0 + f * (Math.PI / k);
      const lobe = 0.42 + 0.58 * Math.pow(Math.max(1 - Math.pow(Math.abs(f), 1.8), 0), 0.6);
      const rho = r * (lobe - 0.22 * Math.exp(-Math.pow(f / 0.14, 2)));
      out.push([rho * Math.cos(ang), rho * Math.sin(ang)]);
    }
  }
  return out;
}
function petalOutline(r: number): OutlinePoint[] {
  return [
    [0, 0, "sharp"],
    [0.34 * r, 0.4 * r],
    [0.5 * r, 0.76 * r],
    [0.3 * r, 1.0 * r],
    [0.1 * r, 0.95 * r],
    [0, 0.82 * r, "sharp"],
    [-0.1 * r, 0.95 * r],
    [-0.3 * r, 1.0 * r],
    [-0.5 * r, 0.76 * r],
    [-0.34 * r, 0.4 * r],
  ];
}
function rrect(w: number, d: number, rad: number): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  const hx = w / 2;
  const hy = d / 2;
  const corners: Array<[number, number, number]> = [
    [hx - rad, hy - rad, 0],
    [-hx + rad, hy - rad, 90],
    [-hx + rad, -hy + rad, 180],
    [hx - rad, -hy + rad, 270],
  ];
  for (const [cx, cy, a] of corners)
    for (let i = 0; i <= 3; i++) {
      const t = ((a + (i / 3) * 90) * Math.PI) / 180;
      out.push([cx + rad * Math.cos(t), cy + rad * Math.sin(t)]);
    }
  return out;
}
function crescent(rIn: number, t0: number): OutlinePoint[] {
  const a0 = (160 * Math.PI) / 180;
  const a1 = (380 * Math.PI) / 180;
  const n = 14;
  const outer: OutlinePoint[] = [];
  const inner: OutlinePoint[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const a = a0 + (a1 - a0) * s;
    const t = t0 * (0.3 + 0.7 * Math.sin(Math.PI * s));
    outer.push([(rIn + t) * Math.cos(a), (rIn + t) * Math.sin(a)]);
    inner.push([rIn * Math.cos(a), rIn * Math.sin(a)]);
  }
  return [...outer, ...inner.reverse()];
}

// ---------- textures ----------
function blossomSvg(cx: number, cy: number, r: number, rot: number) {
  let s = "";
  for (let i = 0; i < 5; i++)
    s += `<g transform="translate(${cx} ${cy}) rotate(${rot + i * 72})"><path d="M0 0 C${-0.55 * r} ${-0.3 * r},${-0.66 * r} ${-0.95 * r},${-0.17 * r} ${-r} L0 ${-0.84 * r} L${0.17 * r} ${-r} C${0.66 * r} ${-0.95 * r},${0.55 * r} ${-0.3 * r},0 0Z" fill="#ffcade" stroke="#f08db4" stroke-width="0.9"/><path d="M0 ${-0.12 * r} L0 ${-0.6 * r}" stroke="#f6a2c4" stroke-width="0.7"/></g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${0.2 * r}" fill="#ffd35a" stroke="#c98a2c" stroke-width="0.7"/>`;
  for (let i = 0; i < 5; i++) {
    const a = ((rot + 36 + i * 72) * Math.PI) / 180;
    s += `<circle cx="${cx + Math.sin(a) * 0.4 * r}" cy="${cy - Math.cos(a) * 0.4 * r}" r="${0.06 * r}" fill="#ffd35a"/>`;
  }
  return s;
}
const BRANCH = svg(
  `<svg viewBox="0 0 490 118" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="480" height="108" rx="10" fill="none" stroke="#ffd35a" stroke-width="2.6"/>
  <rect x="11" y="11" width="468" height="96" rx="7" fill="none" stroke="#f3b74a" stroke-width="1.4"/>
  <path d="M10 92 Q40 84 70 92 T130 92 T190 92 T250 92 T310 92 T370 92 T430 92 T480 92" fill="none" stroke="#e9a947" stroke-width="1.8"/>
  <path d="M10 104 Q40 96 70 104 T130 104 T190 104 T250 104 T310 104 T370 104 T430 104 T480 104" fill="none" stroke="#e9a947" stroke-width="1.8"/>
  <path d="M20 96 C80 78 110 44 180 52 S300 84 360 48 S440 40 478 20" fill="none" stroke="#ffd35a" stroke-width="4.4" stroke-linecap="round"/>
  <path d="M110 66 C120 46 140 34 168 30" fill="none" stroke="#ffd35a" stroke-width="3" stroke-linecap="round"/>
  <path d="M250 70 C262 90 282 98 306 96" fill="none" stroke="#ffd35a" stroke-width="3" stroke-linecap="round"/>
  <path d="M368 46 C380 28 402 20 428 18" fill="none" stroke="#ffd35a" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 86 C70 98 86 102 100 100" fill="none" stroke="#ffd35a" stroke-width="2.4" stroke-linecap="round"/>
  ${blossomSvg(176, 38, 17, 10)}
  ${blossomSvg(98, 62, 13, 40)}
  ${blossomSvg(312, 94, 15, 25)}
  ${blossomSvg(246, 62, 12, 60)}
  ${blossomSvg(430, 26, 17, 5)}
  ${blossomSvg(382, 54, 12, 50)}
  ${blossomSvg(60, 90, 10, 15)}
  ${blossomSvg(468, 22, 9, 30)}
  <circle cx="150" cy="30" r="5" fill="#ff9cc6" stroke="#e96b9f" stroke-width="1"/>
  <circle cx="294" cy="82" r="4.5" fill="#ff9cc6" stroke="#e96b9f" stroke-width="1"/>
  <circle cx="338" cy="60" r="4" fill="#ff9cc6" stroke="#e96b9f" stroke-width="1"/>
  <circle cx="404" cy="20" r="4.5" fill="#ff9cc6" stroke="#e96b9f" stroke-width="1"/>
  <g fill="#ffd8e8" stroke="#f08db4" stroke-width="0.8">
    <path d="M30 40 q6 -9 12 0 q-6 11 -12 0z"/><path d="M208 90 q6 -9 12 0 q-6 11 -12 0z"/>
    <path d="M338 30 q6 -9 12 0 q-6 11 -12 0z"/><path d="M120 94 q6 -9 12 0 q-6 11 -12 0z"/>
  </g>
</svg>`,
  { size: 2048 },
);
const PETAL_A = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffa6c8"/><stop offset="0.6" stop-color="#ffcfe2"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs>
  <path d="M20 4 C6 12 1 30 12 44 L20 38 L28 44 C39 30 34 12 20 4Z" fill="url(#g)" stroke="#f08db4" stroke-width="1.4"/><path d="M20 36 L20 14" stroke="#f08db4" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const PETAL_B = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f2b4ff"/><stop offset="1" stop-color="#fff6fb"/></linearGradient></defs>
  <path d="M20 4 C6 12 1 30 12 44 L20 38 L28 44 C39 30 34 12 20 4Z" fill="url(#g)" stroke="#d99be8" stroke-width="1.4"/><path d="M20 36 L20 14" stroke="#d99be8" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
// Hanging fringe: the attached end is the drawing's bottom, the frayed tips are at the top.
const strands = (n: number, w: number, h: number) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * w;
    const sway = (i % 2 ? 1 : -1) * 1.6;
    s += `<path d="M${x} ${h} C${x + sway} ${h * 0.6},${x - sway} ${h * 0.3},${x + sway * 0.6} 3" fill="none" stroke="url(#f)" stroke-width="${(w / n) * 0.72}" stroke-linecap="round"/>`;
  }
  return s;
};
const FRINGE = svg(
  `<svg viewBox="0 0 48 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="f" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="0"><stop offset="0" stop-color="#ff8fbd"/><stop offset="0.55" stop-color="#c97bff"/><stop offset="1" stop-color="#8f6dff"/></linearGradient></defs>${strands(8, 48, 120)}</svg>`,
  { size: 256 },
);
const FRINGE_GOLD = svg(
  `<svg viewBox="0 0 48 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="f" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="0"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs>${strands(6, 48, 120)}</svg>`,
  { size: 256 },
);

// ---------- paints ----------
const BLADE = cel(
  paint((p, _n) => {
    const u = (p.x - XH) / LB;
    const sec = bladeSection(u);
    const mune = Y0 + yc(p.x) - sec.hw;
    const f = (p.y - mune) / (2 * sec.ry);
    const uu = Math.min(Math.max(u, 0), 1);
    const fh =
      0.58 +
      0.06 * Math.sin(p.x * 140) +
      0.035 * Math.sin(p.x * 330 + 1) +
      0.03 * Math.abs(Math.sin(p.x * 57)) -
      0.42 * smoothstep(0.9, 1.0, uu);
    if (Math.abs(u - K0) * LB < 0.0012 && f < fh) return "#f1e8ff";
    if (f > fh) return "#fbfdff";
    if (f > fh - 0.045) return "#d8c6ff";
    if (u > 0.12 && u < 0.78 && f > 0.28 && f < 0.34) return "#5a6fb8";
    if (f < 0.07) return "#6f84c4";
    const g = noise(new THREE.Vector3(p.x / 9, p.y, p.z), 0.006, 4);
    return g > 0.55 ? "#7c93d6" : "#8aa1e2";
  }),
);
// tsuka-ito: crossing violet wraps over pearly rayskin, diamonds showing.
const TSUKA_Y = Y0;
const TSUKA = cel(
  paint((p, _n) => {
    const along = -(p.x + 0.255);
    if (along < 0.006 || along > 0.228) return "#2d2174";
    const a = (Math.atan2(p.y - TSUKA_Y, p.z) / (Math.PI * 2)) * 4;
    const w = along / 0.0225;
    const l1 = (((w + a) % 1) + 1) % 1;
    const l2 = (((w - a) % 1) + 1) % 1;
    if (l1 < 0.5) return Math.abs(l1 - 0.5) < 0.05 || l1 < 0.05 ? "#2d2174" : "#7a4ae0";
    if (l2 < 0.5) return Math.abs(l2 - 0.5) < 0.05 || l2 < 0.05 ? "#2d2174" : "#5a36b8";
    const dots = cells(p, 0.0042, 11);
    return dots.d1 < 0.22 ? "#d9d0ea" : "#fbf4ea";
  }),
);
const SAYA = cel(
  paint((p, n) => {
    const u = (p.x - XH) / 0.655;
    if (n.y > 0.93) return "#ffd35a";
    if (Math.abs(u - 0.5) < 0.012 || Math.abs(u - 0.54) < 0.006) return "#ffd35a";
    const c = cells(p, 0.011, 9);
    if (c.d1 < 0.13 && hash(c.id) > 0.3 + 0.55 * u) return "#ffd978";
    const base = mix("#3a2a9e", "#c24fb0", smoothstep(0.05, 1, u));
    return base;
  }),
);
const BASE1 = cel(
  paint((p, n) => {
    const c = cells(p, 0.016, 5);
    if (n.y > 0.5 && c.d1 < 0.09 && hash(c.id) > 0.4) return "#ffd978";
    if (n.y < 0.5 && Math.abs(p.y - 0.05) < 0.0035) return "#e0a63a";
    return "#4b35ac";
  }),
);
const BASE2 = cel(
  paint((p, n) => {
    const c = cells(p, 0.02, 21);
    if (n.y > 0.5 && c.d1 < 0.06 && hash(c.id) > 0.5) return "#ffb1cd";
    return mix("#cf3f6b", "#a52a5c", noise(p, 0.12, 2));
  }),
);
const ROPE = cel(
  paint((_p, _n, s) => {
    const f = (((s[1] / 180 - 18 * s[0]) % 1) + 1) % 1;
    return f < 0.5 ? "#f4e7ff" : "#8c5fe8";
  }),
);
const ROPE_P = cel(
  paint((_p, _n, s) => {
    const f = (((s[1] / 180 - 10 * s[0]) % 1) + 1) % 1;
    return f < 0.5 ? "#ffd1e4" : "#d8548c";
  }),
);
const POST = cel(
  paint((p, n, s) => {
    if (Math.abs(n.x) < 0.5) return s[1] > 0.5 && s[1] < 0.53 ? "#ffd35a" : "#3a2a8c";
    const c = cells(p, 0.014, 17);
    const edge = Math.abs(s[0]) > 0.0212 && Math.abs(s[0]) < 0.0245 && s[1] > 0.2 && s[1] < 0.52;
    if (edge || (Math.abs(s[0]) < 0.0046 && s[1] > 0.2 && s[1] < 0.52 && Math.abs(Math.sin(s[1] * 160)) > 0.6)) return "#ffd35a";
    if (c.d1 < 0.09 && hash(c.id) > 0.5) return "#ffd978";
    return "#4b35ac";
  }),
);

const SHOJI = svg(
  `<svg viewBox="0 0 50 66" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="w" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffc98a"/><stop offset="1" stop-color="#fff0c8"/></linearGradient></defs>
  <rect width="50" height="66" fill="url(#w)"/>
  <g fill="none" stroke="#3a2a8c" stroke-width="3.2"><rect x="1.6" y="1.6" width="46.8" height="62.8"/><path d="M25 0V66M0 22H50M0 44H50"/></g>
  ${blossomSvg(12, 11, 6, 0)}${blossomSvg(38, 33, 6, 36)}${blossomSvg(12, 55, 6, 12)}
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "sakuraKatana", paintSize: 2048 });
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const katana = b.joint("katana", { parent: stand, at: [XH, Y0, 0], dir: [1, 0, 0] });
  const saya = b.joint("saya", { parent: stand, at: [XH, YS, 0], dir: [1, 0, 0] });
  const R = { bone: stand };
  const K = { bone: katana };
  const S = { bone: saya };
  const rand = rng(11);
  const merged = (geos: THREE.BufferGeometry[]) => mergeGeometries(geos)!;
  const sphereAt = (r: number, p: [number, number, number], sc: [number, number, number] = [1, 1, 1], w = 8, h = 6) =>
    new THREE.SphereGeometry(r, w, h).scale(sc[0], sc[1], sc[2]).translate(p[0], p[1], p[2]);
  const along = (x0: number, x1: number, y: number, n = 8, z = 0) => {
    const pts: number[][] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      pts.push([x, y + yc(x), z]);
    }
    return catmull(pts);
  };

  // =====================================================================
  // STAND: feet, two lacquer tiers, gold banding, maki-e top
  // =====================================================================
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.lathe(
        [
          [0, 0],
          [0.024, 0],
          [0.031, 0.008],
          [0.029, 0.022],
          [0.014, 0.032],
          [0, 0.034],
        ],
        { at: [sx * 0.47, 0, sz * 0.105], segments: 10, color: VIOLET, ...R },
      );
      b.lathe(
        [
          [0, 0.0],
          [0.0245, 0.0],
          [0.0255, 0.004],
          [0.0245, 0.008],
          [0, 0.008],
        ],
        { at: [sx * 0.47, 0.001, sz * 0.105], segments: 10, color: GOLD, ...R },
      );
      // corner gold bosses on the lower tier
      b.part(new THREE.SphereGeometry(0.0115, 8, 6), GOLD, { at: [sx * 0.527, 0.073, sz * 0.127], scale: [1, 0.7, 1], ...R });
    }
  b.extrude(rrect(1.1, 0.3, 0.04), { at: [0, 0.05, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, bevel: 0.004, color: BASE1, ...R });
  b.extrude(rrect(1.108, 0.308, 0.044), { at: [0, 0.05, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0085, bevel: 0.002, color: GOLD, ...R });
  b.extrude(rrect(0.98, 0.236, 0.032), { at: [0, 0.085, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.003, color: BASE2, ...R });
  b.extrude(rrect(0.988, 0.244, 0.035), { at: [0, 0.085, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0075, bevel: 0.0015, color: GOLD, ...R });
  // maki-e branch on the top tier
  b.part(new THREE.PlaneGeometry(0.96, 0.2304), "#ffffff", {
    at: [0, 0.1008, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: BRANCH,
    ...R,
  });
  // row of gold studs along the front lip of the upper tier and small crimson inlays on the lower tier front
  {
    const studs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 17; i++) {
      const x = -0.48 + (i * 0.96) / 16;
      studs.push(sphereAt(0.0042, [x, 0.0905, 0.1255], [1, 1, 0.5], 6, 4));
      studs.push(sphereAt(0.0042, [x, 0.0905, -0.1255], [1, 1, 0.5], 6, 4));
    }
    b.part(merged(studs), GOLD, { at: [0, 0, 0], ...R });
    const dots: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const x = -0.44 + i * 0.11;
      dots.push(new THREE.CylinderGeometry(0.0085, 0.0085, 0.002, 6).rotateX(Math.PI / 2).translate(x, 0.05, 0.1515));
      dots.push(new THREE.CylinderGeometry(0.0085, 0.0085, 0.002, 6).rotateX(Math.PI / 2).translate(x, 0.05, -0.1515));
    }
    b.part(merged(dots), CRIM, { at: [0, 0, 0], ...R });
    const pinkDots: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const x = -0.44 + i * 0.11;
      pinkDots.push(sphereAt(0.0036, [x, 0.05, 0.1535], [1, 1, 0.6], 6, 4));
      pinkDots.push(sphereAt(0.0036, [x, 0.05, -0.1535], [1, 1, 0.6], 6, 4));
    }
    glow(b.part(merged(pinkDots), LILAC_GLOW, { at: [0, 0, 0], ...R }), 1);
  }

  // lidded box and folded silk on the left end of the stand
  {
    const bx = -0.38;
    const bz = -0.045;
    b.lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.036, 0.004],
        [0.036, 0.02],
        [0.034, 0.022],
        [0, 0.022],
      ],
      { at: [bx, 0.1, bz], segments: 14, color: DEEP, ...R },
    );
    b.lathe(
      [
        [0, 0.022],
        [0.0375, 0.022],
        [0.0375, 0.026],
        [0.034, 0.034],
        [0.02, 0.04],
        [0, 0.041],
      ],
      { at: [bx, 0.1, bz], segments: 14, color: CRIM, ...R },
    );
    b.lathe(
      [
        [0.0345, 0.0225],
        [0.0385, 0.0225],
        [0.0385, 0.0262],
        [0.0345, 0.0262],
      ],
      { at: [bx, 0.1, bz], segments: 14, color: GOLD, ...R },
    );
    glow(b.part(new THREE.SphereGeometry(0.009, 8, 6), LILAC_GLOW, { at: [bx, 0.143, bz], scale: [1, 0.8, 1], ...R }), 1);
    b.extrude(sakura(0.019), { at: [bx, 0.1412, bz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0024, color: GOLD, ...R });
    b.extrude(sakura(0.014), { at: [bx, 0.1421, bz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0028, color: PINK, ...R });
    // folded silk cloth
    b.extrude(rrect(0.09, 0.062, 0.006), { at: [-0.285, 0.1085, 0.045], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0165, bevel: 0.0025, color: cel("#f2e7ff", "#c3a9ec"), ...R });
    b.extrude(rrect(0.092, 0.02, 0.004), { at: [-0.285, 0.1085, 0.045], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0175, bevel: 0.002, color: PINK, ...R });
    b.extrude(rrect(0.07, 0.056, 0.006), { at: [-0.285, 0.1185, 0.045], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0035, bevel: 0.0012, color: cel("#c7a6ff", "#8d6fd6"), ...R });
  }

  // =====================================================================
  // CUP SUPPORTS
  // =====================================================================
  const restKatana = POSTS.map((x) => {
    const u = (x - XH) / LB;
    return Y0 + yc(x) - bladeSection(u).ry;
  });
  const restSaya = POSTS.map((x) => YS + yc(x) - sayaR(x)[1]);
  POSTS.forEach((xi, i) => {
    // pedestal
    b.extrude(rrect(0.075, 0.19, 0.02), { at: [xi, 0.109, ZC], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.019, bevel: 0.002, color: DEEP, ...R });
    b.extrude(rrect(0.081, 0.196, 0.022), { at: [xi, 0.1045, ZC], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.0072, bevel: 0.0012, color: GOLD, ...R });
    // post plate
    const half = (pts: Array<[number, number]>): OutlinePoint[] => [
      ...pts.map(([u, y]) => [u, y] as OutlinePoint),
      ...pts
        .slice()
        .reverse()
        .map(([u, y]) => [-u, y] as OutlinePoint),
    ];
    const post = half([
      [0.07, 0.118],
      [0.07, 0.124],
      [0.05, 0.135],
      [0.034, 0.16],
      [0.027, 0.2],
      [0.027, 0.52],
      [0.04, 0.545],
      [0.046, 0.57],
      [0.034, 0.592],
      [0.016, 0.612],
    ]);
    post.splice(10, 0, [0, 0.634, "sharp"]);
    b.extrude(post, { at: [xi, 0, ZC], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.034, bevel: 0.003, color: POST, ...R });
    // gold trim bands
    for (const by of [0.17, 0.3, 0.4, 0.52])
      b.part(new THREE.BoxGeometry(0.0375, 0.005, 0.064), GOLD, { at: [xi, by, ZC], ...R });
    // crest ornaments
    b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, { at: [xi, 0.642, ZC], ...R });
    // gold inlay down the front and back walls
    for (const sz of [-1, 1]) b.part(new THREE.BoxGeometry(0.013, 0.31, 0.0016), GOLD, { at: [xi, 0.36, ZC + sz * 0.0272], ...R });
    // front & back rosettes and gems
    for (const sx of [-1, 1]) {
      const fx = xi + sx * 0.0172;
      b.extrude(sakura(0.019), { at: [fx, 0.585, ZC], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0034, bevel: 0.0006, color: GOLD, ...R });
      b.extrude(sakura(0.0135), { at: [fx, 0.585, ZC], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0042, color: PINK, ...R });
      glow(b.part(merged([sphereAt(0.0055, [fx + sx * 0.0018, 0.585, ZC], [0.55, 1, 1])]), LILAC_GLOW, { at: [0, 0, 0], ...R }), 1.2);
      for (const fy of [0.235, 0.455]) {
        b.extrude(sakura(0.0125), { at: [fx, fy, ZC], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0034, color: GOLD, ...R });
      }
    }
    // two cup arms (upper katana, lower saya)
    const tiers: Array<{ rest: number; rl: number; tint: string }> = [
      { rest: restKatana[i], rl: 0.0165, tint: "k" },
      { rest: restSaya[i], rl: 0.0188, tint: "s" },
    ];
    for (const tier of tiers) {
      const cy = tier.rest + tier.rl;
      const t0 = 0.011;
      const R0 = tier.rl + 0.003 + t0;
      b.extrude(crescent(tier.rl + 0.003, t0), { at: [xi, cy, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.032, bevel: 0.0025, color: VIOLET, ...R });
      b.extrude(crescent(tier.rl, 0.003), { at: [xi, cy, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.039, color: CRIM, ...R });
      // gold rim on the horns
      for (const sz of [-1, 1]) {
        const a = ((sz > 0 ? 25 : 155) * Math.PI) / 180 * (sz > 0 ? 1 : 1);
        const rr = tier.rl + 0.003 + t0 * 0.35;
        b.part(new THREE.SphereGeometry(0.0062, 6, 5), GOLD, { at: [xi, cy + rr * Math.sin(a) + 0.0005, sz * rr * Math.cos(a)], scale: [1.6, 1, 1], ...R });
      }
      const bottom = cy - R0 + 0.002;
      b.sweep(bezier([xi, bottom - 0.052, ZC + 0.012], [xi, bottom - 0.05, -0.02], [xi, bottom - 0.02, 0], [xi, bottom, 0]), [0.0125, 0.008], {
        color: VIOLET,
        sides: 8,
        caps: "flat",
        ...R,
      });
      b.extrude(sakura(0.0155), { at: [xi + 0.0152, bottom - 0.03, -0.012], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.003, color: GOLD, ...R });
      b.extrude(sakura(0.0155), { at: [xi - 0.0152, bottom - 0.03, -0.012], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.003, color: GOLD, ...R });
    }
  });

  // =====================================================================
  // KATANA
  // =====================================================================
  {
    // blade
    const x0 = -0.21;
    const bladePath = along(x0, XT, Y0, 14);
    b.sweep(bladePath, (t) => {
      const u = (x0 + t * (XT - x0) - XH) / LB;
      const s = bladeSection(u);
      return [s.rx, s.ry];
    }, {
      shift: (t) => [0, bladeSection((x0 + t * (XT - x0) - XH) / LB).shift],
      section: { ngon: 6 },
      up: [0, 1, 0],
      caps: { start: "flat", end: "flat" },
      color: BLADE,
      name: "blade",
      ...K,
    });
    // habaki
    b.sweep(polyline([[-0.234, Y0, 0], [-0.184, Y0, 0]]), (t) => [0.0076 - 0.001 * t, 0.0188 - 0.0008 * t], {
      section: "box",
      up: [0, 1, 0],
      caps: "flat",
      color: GOLD,
      name: "habaki",
      ...K,
    });
    b.sweep(polyline([[-0.186, Y0, 0], [-0.1835, Y0, 0]]), [0.0082, 0.0194], { section: "box", up: [0, 1, 0], caps: "flat", color: GOLD_DK, ...K });
    // tsuba
    const TS: [number, number, number] = [-0.239, Y0, 0];
    b.extrude(sakura(0.045), { at: TS, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.006, bevel: 0.0008, color: GOLD, name: "tsuba", ...K });
    b.extrude(sakura(0.039), { at: TS, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0072, bevel: 0.0006, color: DEEP, ...K });
    b.extrude(sakura(0.0165), { at: TS, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0082, bevel: 0.0005, color: GOLD, ...K });
    const gems: THREE.BufferGeometry[] = [];
    const petals: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
      for (const sx of [-1, 1]) {
        const y = Y0 + 0.0285 * Math.sin(a);
        const z = 0.0285 * Math.cos(a);
        gems.push(sphereAt(0.0036, [TS[0] + sx * 0.0041, y, z], [0.55, 1, 1], 6, 4));
        const y2 = Y0 + 0.0215 * Math.sin(a + 0.63);
        const z2 = 0.0215 * Math.cos(a + 0.63);
        petals.push(sphereAt(0.0022, [TS[0] + sx * 0.0042, y2, z2], [0.4, 1, 1], 6, 4));
      }
    }
    glow(b.part(merged(gems), LILAC_GLOW, { at: [0, 0, 0], ...K }), 1.3);
    b.part(merged(petals), GOLD, { at: [0, 0, 0], ...K });
    // fuchi, tsuka, kashira
    b.sweep(polyline([[-0.241, Y0, 0], [-0.262, Y0, 0]]), [0.0139, 0.0169], { caps: "flat", sides: 12, color: GOLD, name: "fuchi", ...K });
    b.sweep(polyline([[-0.2425, Y0, 0], [-0.246, Y0, 0]]), [0.0144, 0.0174], { caps: "flat", sides: 12, color: GOLD_DK, ...K });
    b.sweep(
      polyline([[-0.255, Y0, 0], [-0.375, Y0, 0], [-0.488, Y0, 0]]),
      (t) => {
        const sw = 1 + 0.07 * Math.sin(Math.PI * t);
        return [0.0124 * sw, 0.0152 * sw];
      },
      { caps: "flat", sides: 12, color: TSUKA, name: "tsuka", ...K },
    );
    b.sweep(polyline([[-0.474, Y0, 0], [-0.498, Y0, 0]]), (t) => [0.0141 - 0.001 * t, 0.0169 - 0.001 * t], { caps: "flat", sides: 12, color: GOLD, name: "kashira", ...K });
    b.sweep(polyline([[-0.4735, Y0, 0], [-0.4775, Y0, 0]]), [0.0148, 0.0176], { caps: "flat", sides: 12, color: GOLD_DK, ...K });
    b.extrude(sakura(0.0118), { at: [-0.4985, Y0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0034, color: CRIM, ...K });
    b.extrude(sakura(0.0072), { at: [-0.4995, Y0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0036, color: PINK, ...K });
    glow(b.part(sphereAt(0.0036, [-0.5028, Y0, 0], [0.55, 1, 1], 8, 6), LILAC_GLOW, { at: [0, 0, 0], ...K }), 1.5);
    // menuki + mekugi
    b.extrude(sakura(0.0085), { at: [-0.355, Y0, 0.0136], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0032, bevel: 0.0004, color: GOLD, ...K });
    b.extrude(sakura(0.0042), { at: [-0.355, Y0, 0.0136], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0042, color: CRIM, ...K });
    b.extrude(sakura(0.0085), { at: [-0.395, Y0, -0.0136], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.0032, bevel: 0.0004, color: GOLD, ...K });
    b.extrude(sakura(0.0042), { at: [-0.395, Y0, -0.0136], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.0042, color: CRIM, ...K });
    b.part(merged([sphereAt(0.0024, [-0.44, Y0, 0.0137], [1, 1, 0.5], 6, 4), sphereAt(0.0024, [-0.44, Y0, -0.0137], [1, 1, 0.5], 6, 4)]), GOLD, { at: [0, 0, 0], ...K });

    // blade glow runes: dashes along both flats and a blossom near the habaki
    const dashes: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 13; k++) {
      const u = 0.17 + k * 0.047;
      const x = XH + u * LB;
      const sec = bladeSection(u);
      const y = Y0 + yc(x) - sec.hw + 0.46 * 2 * sec.ry;
      const slope = Math.atan(-2 * SORI * u / LB);
      const len = k % 3 === 0 ? 0.022 : 0.012;
      for (const sz of [-1, 1])
        dashes.push(new THREE.BoxGeometry(len, 0.0026, 0.0008).rotateZ(slope).translate(x, y, sz * (0.866 * sec.rx + 0.0002)));
    }
    glow(b.part(merged(dashes), LILAC_GLOW, { at: [0, 0, 0], ...K, name: "runes" }), 1.4);
    {
      const u = 0.075;
      const x = XH + u * LB;
      const sec = bladeSection(u);
      const y = Y0 + yc(x) - sec.hw + 0.45 * 2 * sec.ry;
      const z = 0.866 * sec.rx + 0.0002;
      glow(b.extrude(sakura(0.0065), { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.0009, color: PINK_GLOW, ...K }), 1.3);
      glow(b.extrude(sakura(0.0065), { at: [x, y, -z], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.0009, color: PINK_GLOW, ...K }), 1.3);
    }

    // kashira ring and tassel
    const kx = -0.496;
    b.part(new THREE.TorusGeometry(0.0062, 0.0013, 5, 10), GOLD, { at: [kx, Y0 - 0.0225, 0], ...K });
    const ky = Y0 - 0.0285;
    b.sweep(catmull([[kx, ky, 0], [kx - 0.001, ky - 0.012, 0.002], [kx, ky - 0.024, 0]]), 0.0021, { color: ROPE, sides: 6, caps: "none", ...K });
    b.part(new THREE.SphereGeometry(0.0072, 8, 6), GOLD, { at: [kx, ky - 0.03, 0], scale: [1, 1.15, 1], ...K });
    b.part(new THREE.CylinderGeometry(0.0042, 0.0055, 0.012, 8), cel("#7a4ae0", "#4b2fa8"), { at: [kx, ky - 0.042, 0], ...K });
    b.part(new THREE.SphereGeometry(0.0112, 8, 6), PINK, { at: [kx, ky - 0.0575, 0], scale: [1, 1.15, 1], ...K });
    b.part(new THREE.TorusGeometry(0.0098, 0.0019, 5, 10).rotateX(Math.PI / 2), GOLD, { at: [kx, ky - 0.0685, 0], ...K });
    const skirtTop = ky - 0.0705;
    const ringA = b.ring(frame([kx, skirtTop, 0], [0, 1, 0]), { count: 9, radius: 0.0072 });
    b.cards(ringA.items.map((it) => frame(it.at, [0, 1, 0])), FRINGE, {
      size: [0.0165, 0.16],
      lean: 180,
      flow: (_f, i) => [Math.cos((i / 9) * Math.PI * 2), 0, Math.sin((i / 9) * Math.PI * 2)],
      bone: katana,
      sink: 0,
    });
    const ringB = b.ring(frame([kx, skirtTop + 0.004, 0], [0, 1, 0]), { count: 7, radius: 0.0045 });
    b.cards(ringB.items.map((it) => frame(it.at, [0, 1, 0])), FRINGE_GOLD, {
      size: [0.0145, 0.12],
      lean: 180,
      flow: (_f, i) => [Math.cos(((i + 0.5) / 7) * Math.PI * 2), 0, Math.sin(((i + 0.5) / 7) * Math.PI * 2)],
      bone: katana,
      sink: 0,
    });
  }

  // =====================================================================
  // SAYA
  // =====================================================================
  {
    const xs = XH;
    const xe = 0.455;
    const path = along(xs, xe, YS, 12);
    const rad = (t: number) => sayaR(xs + t * (xe - xs));
    b.sweep(path, rad, { caps: { start: "flat", end: "none" }, sides: 12, color: SAYA, name: "sayaBody", ...S, up: [0, 1, 0] });
    // koiguchi collar and bands
    const collar = (x0: number, x1: number, grow: number, color: typeof GOLD) =>
      b.sweep(along(x0, x1, YS, 2), (t) => {
        const [rx, ry] = sayaR(x0 + t * (x1 - x0));
        return [rx + grow, ry + grow];
      }, { caps: "flat", sides: 12, color, up: [0, 1, 0], ...S });
    collar(XH, XH + 0.034, 0.0013, GOLD);
    collar(XH + 0.034, XH + 0.0375, 0.0019, GOLD_DK);
    collar(XH + 0.0395, XH + 0.0435, 0.0013, DEEP);
    collar(XH + 0.2, XH + 0.206, 0.0013, GOLD);
    collar(XH + 0.2085, XH + 0.2115, 0.0013, GOLD_DK);
    collar(XH + 0.4, XH + 0.404, 0.0012, GOLD);
    // kojiri
    b.sweep(along(0.415, xe, YS, 3), (t) => {
      const [rx, ry] = sayaR(0.415 + t * (xe - 0.415));
      return [rx + 0.0011, ry + 0.0011];
    }, { caps: { start: "flat", end: "round" }, sides: 12, color: GOLD, up: [0, 1, 0], name: "kojiri", ...S });
    collar(0.411, 0.4155, 0.0021, GOLD_DK);
    {
      const gem: THREE.BufferGeometry[] = [];
      for (const gx of [XH + 0.017, 0.44])
        for (const sz of [-1, 1]) {
          const [rx] = sayaR(gx);
          gem.push(sphereAt(0.0032, [gx, YS + yc(gx), sz * (rx + 0.0013)], [1, 1, 0.5], 6, 4));
        }
      glow(b.part(merged(gem), LILAC_GLOW, { at: [0, 0, 0], ...S }), 1.3);
    }
    // blossoms on both flats
    for (let k = 0; k < 6; k++) {
      const x = -0.115 + k * 0.088;
      const r = 0.0105 - k * 0.0006;
      const [rx] = sayaR(x);
      const slope = (yc(x + 0.002) - yc(x - 0.002)) / 0.004;
      const len = Math.hypot(1, slope);
      const tx: [number, number, number] = [1 / len, slope / len, 0];
      const ty: [number, number, number] = [-slope / len, 1 / len, 0];
      const y = YS + yc(x) + (k % 2 ? 0.003 : -0.003);
      for (const sz of [-1, 1]) {
        const z = sz * (rx - 0.0016 * 0 - 0.0008);
        const xd: [number, number, number] = sz > 0 ? tx : [-tx[0], -tx[1], 0];
        b.extrude(sakura(r), { at: [x, y, z], x: xd, y: ty, thickness: 0.0034, bevel: 0.0004, color: GOLD, ...S });
        b.extrude(sakura(r * 0.74), { at: [x, y, z], x: xd, y: ty, thickness: 0.0042, color: k % 2 ? PINK : CREAM, ...S });
        b.part(sphereAt(r * 0.2, [x, y, z + sz * 0.0021], [1, 1, 0.6], 6, 4), GOLD, { at: [0, 0, 0], ...S });
      }
    }
    // kurigata and sageo
    const kgx = -0.095;
    const kgy = YS + yc(kgx) - sayaR(kgx)[1];
    b.part(new THREE.BoxGeometry(0.034, 0.013, 0.011), GOLD, { at: [kgx, kgy - 0.0022, 0], ...S });
    b.part(new THREE.BoxGeometry(0.0375, 0.0035, 0.0125), GOLD_DK, { at: [kgx, kgy - 0.0075, 0], ...S });
    b.part(new THREE.TorusGeometry(0.0048, 0.0013, 5, 8), GOLD, { at: [kgx, kgy - 0.0125, 0], ...S });
    const cord = catmull([
      [kgx, kgy - 0.0155, 0],
      [kgx + 0.003, kgy - 0.04, 0.004],
      [kgx + 0.012, 0.145, 0.034],
      [kgx + 0.03, 0.115, 0.07],
      [kgx + 0.05, 0.1055, 0.092],
      [kgx + 0.082, 0.1055, 0.066],
      [kgx + 0.118, 0.1055, 0.052],
      [kgx + 0.152, 0.1055, 0.082],
      [kgx + 0.168, 0.1055, 0.108],
    ]);
    b.sweep(cord, 0.0042, { color: ROPE, sides: 6, caps: "round", bone: stand });
    // tassel at the cord end hanging over the front lip
    const ex = kgx + 0.168;
    b.part(new THREE.SphereGeometry(0.0065, 8, 6), GOLD, { at: [ex, 0.1056, 0.1175], ...R });
    b.part(new THREE.SphereGeometry(0.0078, 8, 6), ROPE_P, { at: [ex, 0.0995, 0.1225], scale: [1, 1.1, 1], ...R });
    const ringC = b.ring(frame([ex, 0.094, 0.1225], [0, 1, 0]), { count: 7, radius: 0.0045 });
    b.cards(ringC.items.map((it) => frame(it.at, [0, 1, 0])), FRINGE, {
      size: [0.0135, 0.05],
      lean: 180,
      flow: (_f, i) => [Math.cos((i / 7) * Math.PI * 2), 0, Math.sin((i / 7) * Math.PI * 2)],
      bone: stand,
      sink: 0,
    });
  }

  // =====================================================================
  // PETALS: lying on the lacquer, and a few drifting in the air
  // =====================================================================
  {
    const lying: Frame[] = [];
    for (let i = 0; i < 26; i++) {
      const onTop = rand() < 0.65;
      const x = (rand() * 2 - 1) * 0.5;
      const z = onTop ? (rand() * 2 - 1) * 0.108 : (rand() < 0.5 ? 1 : -1) * (0.125 + rand() * 0.02);
      lying.push(frame([x, onTop ? 0.1 : 0.0705, z], [0, 1, 0]));
    }
    b.cards(lying, [PETAL_A, PETAL_A, PETAL_B], {
      size: [0.022, 0.026],
      lean: 90,
      flow: () => {
        const a = rand() * Math.PI * 2;
        return [Math.cos(a), 0, Math.sin(a)];
      },
      mirror: true,
      vary: 0.3,
      rng: rng(5),
      bone: stand,
      sink: 0,
    });
    const drift: Array<[number, number, number]> = [
      [0.12, 0.575, 0.05],
      [0.33, 0.54, -0.06],
      [0.43, 0.6, 0.03],
      [-0.06, 0.6, 0.07],
      [0.22, 0.62, -0.02],
      [0.4, 0.37, 0.07],
      [0.05, 0.43, 0.09],
    ];
    drift.forEach((at, i) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28));
      const xd = new THREE.Vector3(1, 0, 0).applyQuaternion(q).toArray() as [number, number, number];
      const yd = new THREE.Vector3(0, 1, 0).applyQuaternion(q).toArray() as [number, number, number];
      glow(b.extrude(petalOutline(0.026 + rand() * 0.008), { at, x: xd, y: yd, thickness: 0.0014, smoothing: 1, color: i % 2 ? LILAC_GLOW : PINK_GLOW, ...R }), 1.1);
    });
  }

  // gold rosette and ring handle on each short end of the lower tier
  for (const sx of [-1, 1]) {
    b.extrude(sakura(0.017), { at: [sx * 0.5548, 0.05, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0036, color: GOLD, ...R });
    b.extrude(sakura(0.0115), { at: [sx * 0.5548, 0.05, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.0044, color: CRIM, ...R });
    b.part(new THREE.TorusGeometry(0.0125, 0.002, 5, 10).rotateY(Math.PI / 2), GOLD, { at: [sx * 0.5588, 0.044, 0], ...R });
  }
  // drifting motes of light
  {
    const motes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const y = 0.3 + rand() * 0.34;
      let z = (rand() * 2 - 1) * 0.13;
      if (Math.abs(z) < 0.05 && y > 0.4 && y < 0.54) z += Math.sign(z || 1) * 0.08;
      motes.push(sphereAt(0.0028 + rand() * 0.002, [(rand() * 2 - 1) * 0.45, y, z], [1, 1, 1], 5, 4));
    }
    glow(b.part(merged(motes), PINK_GLOW, { at: [0, 0, 0], ...R }), 1.3);
  }

  // little glowing lantern in the back-left corner
  {
    const lx = -0.47;
    const lz = -0.07;
    b.extrude(rrect(0.066, 0.066, 0.008), { at: [lx, 0.106, lz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, bevel: 0.0015, color: DEEP, ...R });
    b.extrude(rrect(0.074, 0.074, 0.01), { at: [lx, 0.1115, lz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.003, color: GOLD, ...R });
    glow(b.part(new THREE.BoxGeometry(0.05, 0.068, 0.05), "#ffffff", { at: [lx, 0.147, lz], texture: SHOJI, ...R }), 1);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) b.part(new THREE.BoxGeometry(0.007, 0.074, 0.007), VIOLET, { at: [lx + sx * 0.0275, 0.147, lz + sz * 0.0275], ...R });
    b.extrude(rrect(0.074, 0.074, 0.006), { at: [lx, 0.1855, lz], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.005, bevel: 0.001, color: GOLD, ...R });
    b.part(new THREE.ConeGeometry(0.058, 0.04, 4), CRIM, { at: [lx, 0.208, lz], rotation: [0, 45, 0], ...R });
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), GOLD, { at: [lx, 0.2335, lz], ...R });
    glow(b.part(new THREE.SphereGeometry(0.004, 6, 4), PINK_GLOW, { at: [lx, 0.2425, lz], ...R }), 1.2);
  }

  void INK;
  return b.root;
}
