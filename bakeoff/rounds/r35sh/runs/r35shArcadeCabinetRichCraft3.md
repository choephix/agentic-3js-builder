```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, cells, svg, rng, catmull } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Drive Arcade Cabinet",
  description:
    "A 1980s upright arcade cabinet in synthwave style: sunset-grid side art, backlit marquee, glowing CRT, two-player control deck with neon buttons, coin door, and neon-edged panels.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BLACK = "#07030f";
const DEEP = "#0b0418";
const PLUM = "#1b0b3a";
const PINK = "#ff4fa8";
const MAGENTA = "#ff2bd6";
const CYAN = "#19f0ff";
const YELLOW = "#ffe14a";
const ORANGE = "#ff8a3d";
const RED = "#ff2d4a";
const CHROME = "#c9cfe6";
const STEEL = "#7d83a0";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Geometry constants (meters; +Z front, +X the cabinet's left)
const SIDE_X = 0.315;
const PROFILE: [number, number][] = [
  // [z, y] side silhouette, front to the right
  [-0.45, 0],
  [0.38, 0],
  [0.38, 0.78],
  [0.47, 0.86],
  [0.47, 0.95],
  [0.28, 1.0],
  [0.17, 1.52],
  [0.31, 1.52],
  [0.31, 1.82],
  [-0.22, 1.82],
  [-0.45, 1.15],
];

// Control deck frame
const PANEL_FRONT = V(0, 0.95, 0.47);
const PANEL_BACK = V(0, 1.0, 0.28);
const N_PANEL = V(0, 0.19, 0.05).normalize();
const onDeck = (x: number, u: number, lift = 0) => {
  const p = PANEL_FRONT.clone().lerp(PANEL_BACK, u);
  p.x = x;
  return p.addScaledVector(N_PANEL, lift);
};

// Screen bezel board frame (slopes back)
const T_B = V(0, 0.52, -0.11).normalize();
const N_B = V(0, 0.11, 0.52).normalize();
const C_B = V(0, 1.26, 0.225);
const onBoard = (x: number, v: number, lift = 0) =>
  V(x, C_B.y, C_B.z).addScaledVector(T_B, v).addScaledVector(N_B, lift);

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings

function bandsRects(x: number, w: number, y0: number, y1: number, h0: number, gap0: number) {
  let s = "";
  let y = y0;
  let h = h0;
  let gap = gap0;
  while (y < y1) {
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    y += h + gap;
    h = Math.max(3, h - 3);
    gap += 3;
  }
  return s;
}

function sideSvg() {
  const r = rng(11);
  let stars = "";
  for (let i = 0; i < 50; i++)
    stars += `<circle cx="${(r() * 830).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(1.5 + r() * 2.5).toFixed(1)}" fill="#ffffff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  const bands = `<rect x="150" y="150" width="530" height="190"/>` + bandsRects(150, 530, 345, 470, 24, 6);
  let grid = "";
  for (let k = -10; k <= 10; k++)
    grid += `<line x1="415" y1="470" x2="${415 + k * 180}" y2="780" stroke="#7a1a8a" stroke-width="7"/>`;
  for (let k = 1; k <= 9; k++) {
    const y = 470 + 310 * Math.pow(k / 9, 2);
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="830" y2="${y.toFixed(1)}" stroke="#7a1a8a" stroke-width="7"/>`;
  }
  for (let k = -10; k <= 10; k++)
    grid += `<line x1="415" y1="470" x2="${415 + k * 180}" y2="780" stroke="#ff3ec8" stroke-width="2.6"/>`;
  for (let k = 1; k <= 9; k++) {
    const y = 470 + 310 * Math.pow(k / 9, 2);
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="830" y2="${y.toFixed(1)}" stroke="#ff3ec8" stroke-width="2.6"/>`;
  }
  const palm = (x: number, h: number, lean: number) => {
    const tx = x + lean;
    const ty = 470 - h;
    let s = `<path d="M${x} 790 Q${x + lean * 0.2} ${470 - h * 0.4} ${tx} ${ty}" stroke="#07020f" stroke-width="18" fill="none" stroke-linecap="round"/>`;
    for (const [dx, dy] of [[-120, -30], [-90, 40], [-60, -80], [60, -80], [100, 35], [130, -25], [0, -100]])
      s += `<path d="M${tx} ${ty} Q${tx + dx * 0.5} ${ty + dy - 40} ${tx + dx} ${ty + dy + 30}" stroke="#07020f" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    return s;
  };
  return `<svg viewBox="0 0 830 780" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10052a"/><stop offset="0.45" stop-color="#4a1280"/><stop offset="0.6" stop-color="#ff2bd6"/></linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a"/><stop offset="0.55" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
    <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a55"/><stop offset="1" stop-color="#090119"/></linearGradient>
    <clipPath id="bands">${bands}</clipPath>
  </defs>
  <rect width="830" height="470" fill="url(#sky)"/>
  ${stars}
  <circle cx="415" cy="400" r="235" fill="url(#sun)" clip-path="url(#bands)"/>
  <path d="M0 470 L70 400 L130 440 L220 345 L300 430 L330 410 L400 470Z" fill="#1c0646" stroke="#19f0ff" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M430 470 L520 385 L590 440 L660 330 L740 430 L790 405 L830 450 L830 470Z" fill="#1c0646" stroke="#ff4fa8" stroke-width="3.5" stroke-linejoin="round"/>
  <rect y="470" width="830" height="310" fill="url(#gnd)"/>
  ${grid}
  <rect y="466" width="830" height="7" fill="#19f0ff"/>
  ${palm(90, 300, 50)}
  ${palm(760, 250, -40)}
  <rect y="758" width="830" height="22" fill="#ff4fa8"/>
  <rect y="744" width="830" height="8" fill="#19f0ff"/>
</svg>`;
}

function marqueeSvg() {
  const r = rng(21);
  let stars = "";
  for (let i = 0; i < 34; i++)
    stars += `<circle cx="${(r() * 560).toFixed(0)}" cy="${(r() * 120).toFixed(0)}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  let grid = "";
  for (let k = -9; k <= 9; k++) grid += `<line x1="280" y1="165" x2="${280 + k * 80}" y2="240" stroke="#ff3ec8" stroke-width="1.8"/>`;
  for (let k = 1; k <= 6; k++) {
    const y = 165 + 75 * Math.pow(k / 6, 2);
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="560" y2="${y.toFixed(1)}" stroke="#ff3ec8" stroke-width="1.8"/>`;
  }
  const bands = `<rect x="170" y="38" width="220" height="86"/>` + bandsRects(170, 220, 130, 165, 10, 4);
  const title = (extra: string) =>
    `<text x="280" y="150" text-anchor="middle" textLength="470" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-weight="900" font-size="100" ${extra}>NEON DRIVE</text>`;
  return `<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12043a"/><stop offset="0.6" stop-color="#5a1294"/><stop offset="1" stop-color="#ff4fa8"/></linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#bfeaff"/><stop offset="0.5" stop-color="#5a6bb8"/><stop offset="0.56" stop-color="#ffb3ea"/><stop offset="1" stop-color="#ff4fd0"/></linearGradient>
    <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a55"/><stop offset="1" stop-color="#0a0220"/></linearGradient>
    <clipPath id="bands">${bands}</clipPath>
  </defs>
  <rect width="560" height="240" fill="#0a0220"/>
  <rect width="560" height="165" fill="url(#sky)"/>
  ${stars}
  <circle cx="280" cy="130" r="92" fill="url(#sun)" clip-path="url(#bands)"/>
  <path d="M0 165 L50 118 L95 150 L150 100 L200 150 L225 135 L260 165Z" fill="#1c0646" stroke="#19f0ff" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M300 165 L345 125 L395 152 L450 96 L505 148 L530 128 L560 150 L560 165Z" fill="#1c0646" stroke="#ff4fa8" stroke-width="2.5" stroke-linejoin="round"/>
  <rect y="165" width="560" height="75" fill="url(#gnd)"/>
  ${grid}
  <rect y="163" width="560" height="4" fill="#19f0ff"/>
  <g transform="translate(24.7 0) skewX(-10)">
    <g transform="translate(5 5)">${title(`fill="#ff2bd6"`)}</g>
    ${title(`fill="none" stroke="#19f0ff" stroke-width="7" stroke-linejoin="round"`)}
    ${title(`fill="url(#chrome)" stroke="#2a0d5c" stroke-width="1.5"`)}
  </g>
  <text x="280" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" letter-spacing="4" fill="#ffe14a">★ 1 OR 2 PLAYERS ★</text>
  <text x="280" y="226" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" letter-spacing="3" fill="#ffffff">© 1984 TURBOWAVE AMUSEMENTS</text>
  <rect x="3" y="3" width="554" height="234" fill="none" stroke="#ff4fa8" stroke-width="3"/>
</svg>`;
}

function screenSvg() {
  const r = rng(5);
  let stars = "";
  for (let i = 0; i < 30; i++)
    stars += `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 110).toFixed(0)}" r="${(0.6 + r() * 1.2).toFixed(1)}" fill="#fff"/>`;
  let grid = "";
  for (let k = -9; k <= 9; k++) grid += `<line x1="200" y1="170" x2="${200 + k * 75}" y2="300" stroke="#c21fd8" stroke-width="1.2"/>`;
  for (let k = 1; k <= 7; k++) {
    const y = 170 + 130 * Math.pow(k / 7, 2);
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="400" y2="${y.toFixed(1)}" stroke="#c21fd8" stroke-width="1.2"/>`;
  }
  let dashes = "";
  for (let k = 0; k < 6; k++) {
    const t0 = Math.pow(k / 6, 2);
    const t1 = Math.pow((k + 0.55) / 6, 2);
    const y0 = 170 + 130 * t0;
    const y1 = 170 + 130 * t1;
    const w0 = 0.6 + 5 * t0;
    const w1 = 0.6 + 5 * t1;
    dashes += `<polygon points="${200 - w0},${y0} ${200 + w0},${y0} ${200 + w1},${y1} ${200 - w1},${y1}" fill="#ffe14a"/>`;
  }
  const bands = `<rect x="130" y="68" width="140" height="56"/>` + bandsRects(130, 140, 129, 170, 10, 4);
  const palm = (x: number, d: number) =>
    `<path d="M${x} 300 Q${x + 8 * d} 250 ${x + 15 * d} 205" stroke="#07020f" stroke-width="5" fill="none"/>` +
    [[-26, 4], [-18, -14], [18, -14], [28, 6], [0, -22]]
      .map(([dx, dy]) => `<path d="M${x + 15 * d} 205 Q${x + 15 * d + dx * 0.5} ${205 + dy - 10} ${x + 15 * d + dx} ${205 + dy + 6}" stroke="#07020f" stroke-width="3" fill="none"/>`)
      .join("");
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0230"/><stop offset="0.55" stop-color="#6a1596"/><stop offset="1" stop-color="#ff4fa8"/></linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
    <clipPath id="bands">${bands}</clipPath>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.6" fill="#000" opacity="0.3"/></pattern>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#sky)"/>
  ${stars}
  <circle cx="200" cy="128" r="58" fill="url(#sun)" clip-path="url(#bands)"/>
  <path d="M0 170 L35 138 L65 158 L100 120 L135 165 L150 170Z" fill="#1a0640" stroke="#19f0ff" stroke-width="1.6"/>
  <path d="M250 170 L280 140 L310 160 L345 118 L380 150 L400 135 L400 170Z" fill="#1a0640" stroke="#ff4fa8" stroke-width="1.6"/>
  <rect y="170" width="400" height="130" fill="#12042e"/>
  ${grid}
  <polygon points="197,170 203,170 330,300 70,300" fill="#1b1035"/>
  <line x1="197" y1="170" x2="70" y2="300" stroke="#19f0ff" stroke-width="2.5"/>
  <line x1="203" y1="170" x2="330" y2="300" stroke="#ff4fa8" stroke-width="2.5"/>
  ${dashes}
  <rect y="168" width="400" height="3" fill="#19f0ff"/>
  ${palm(40, 1)}${palm(360, -1)}
  <rect x="170" y="243" width="60" height="4" fill="#19f0ff"/>
  <path d="M178 250 L186 236 L214 236 L222 250Z" fill="#7a1a9a"/>
  <path d="M184 249 L189 240 L211 240 L216 249Z" fill="#19f0ff"/>
  <rect x="168" y="250" width="64" height="22" rx="4" fill="#ff2bd6"/>
  <rect x="172" y="255" width="13" height="5" fill="#ff2d4a"/><rect x="215" y="255" width="13" height="5" fill="#ff2d4a"/>
  <rect x="170" y="270" width="12" height="8" fill="#0a0418"/><rect x="218" y="270" width="12" height="8" fill="#0a0418"/>
  <g font-family="monospace" font-weight="bold" font-size="14">
    <text x="10" y="20" fill="#ffe14a">SCORE 012480</text>
    <text x="390" y="20" text-anchor="end" fill="#19f0ff">HI 099999</text>
    <text x="10" y="292" fill="#ffffff">187 KPH</text>
    <text x="390" y="292" text-anchor="end" fill="#ffffff">TIME 42</text>
    <text x="200" y="42" text-anchor="middle" font-size="12" fill="#ffffff">STAGE 3</text>
  </g>
  <rect width="400" height="300" fill="url(#scan)"/>
  <rect width="400" height="300" fill="url(#vig)"/>
</svg>`;
}

function bezelSvg() {
  const hole = "M78 93H522Q530 93 530 101V430Q530 438 522 438H78Q70 438 70 430V101Q70 93 78 93Z";
  const screw = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="9" fill="#9aa0bc" stroke="#2a2a44" stroke-width="2"/><path d="M${x - 5} ${y - 2} L${x + 5} ${y + 2}" stroke="#2a2a44" stroke-width="2"/>`;
  return `<svg viewBox="0 0 600 530" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a38"/><stop offset="1" stop-color="#090315"/></linearGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#7fb4ff"/><stop offset="1" stop-color="#ff7ad9"/></linearGradient></defs>
  <path fill-rule="evenodd" fill="url(#bz)" d="M0 0H600V530H0Z ${hole}"/>
  <rect x="10" y="10" width="580" height="510" fill="none" stroke="#ff4fa8" stroke-width="3"/>
  <polygon points="22,150 52,150 22,230 22,230" fill="#ff2bd6"/>
  <polygon points="22,240 52,240 22,320" fill="#19f0ff"/>
  <polygon points="22,330 52,330 22,410" fill="#ffe14a"/>
  <polygon points="578,150 548,150 578,230" fill="#ff2bd6"/>
  <polygon points="578,240 548,240 578,320" fill="#19f0ff"/>
  <polygon points="578,330 548,330 578,410" fill="#ffe14a"/>
  <text x="300" y="68" text-anchor="middle" textLength="340" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-size="44" fill="url(#chrome)" stroke="#2a0d5c" stroke-width="1">NEON DRIVE</text>
  <text x="300" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" letter-spacing="6" fill="#19f0ff">1P  ●  INSERT COIN  ●  2P</text>
  ${screw(34, 34)}${screw(566, 34)}${screw(34, 496)}${screw(566, 496)}
</svg>`;
}

function controlSvg() {
  const sx = (x: number) => 300 + 1000 * x;
  const sy = (u: number) => 196 - 196 * u;
  let rings = "";
  for (const s of [-1, 1]) {
    rings += `<circle cx="${sx(s * 0.22)}" cy="${sy(0.5)}" r="40" fill="none" stroke="#19f0ff" stroke-width="3"/>`;
    rings += `<circle cx="${sx(s * 0.22)}" cy="${sy(0.5)}" r="50" fill="none" stroke="#ff4fa8" stroke-width="2.5" stroke-dasharray="6 6"/>`;
    rings += `<text x="${sx(s * 0.22)}" y="${sy(0.5) + 78}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#ffe14a">${s < 0 ? "P1" : "P2"}</text>`;
    const us = [0.45, 0.58, 0.45];
    for (let i = 0; i < 3; i++)
      rings += `<circle cx="${sx(s * (0.145 - i * 0.04))}" cy="${sy(us[i])}" r="24" fill="#150a2c" stroke="${i === 1 ? "#ffe14a" : "#ff2bd6"}" stroke-width="3"/>`;
    rings += `<circle cx="${sx(s * 0.03)}" cy="${sy(0.3)}" r="19" fill="#150a2c" stroke="#ffffff" stroke-width="2"/>`;
    rings += `<text x="${sx(s * 0.03)}" y="${sy(0.3) + 34}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#ffffff">${s < 0 ? "1P START" : "2P START"}</text>`;
  }
  return `<svg viewBox="0 0 600 196" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0d5c"/><stop offset="1" stop-color="#0b0418"/></linearGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ff7ad9"/></linearGradient></defs>
  <rect width="600" height="196" fill="url(#dk)"/>
  <polygon points="0,196 120,0 150,0 30,196" fill="#ff2bd6" opacity="0.35"/>
  <polygon points="600,196 480,0 450,0 570,196" fill="#19f0ff" opacity="0.35"/>
  ${rings}
  <text x="300" y="38" text-anchor="middle" textLength="190" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-size="30" fill="url(#chrome)">NEON DRIVE</text>
  <rect x="5" y="5" width="590" height="186" fill="none" stroke="#ff4fa8" stroke-width="3"/>
  <rect x="11" y="11" width="578" height="174" fill="none" stroke="#19f0ff" stroke-width="1.5"/>
</svg>`;
}

function coinSvg() {
  const screw = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="7" fill="#b8bdd4" stroke="#3a3f5a" stroke-width="2"/><path d="M${x - 4} ${y + 2} L${x + 4} ${y - 2}" stroke="#3a3f5a" stroke-width="2"/>`;
  return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d93b0"/><stop offset="0.5" stop-color="#4a4f6c"/><stop offset="1" stop-color="#2c3048"/></linearGradient></defs>
  <rect width="200" height="260" rx="12" fill="url(#st)" stroke="#12142a" stroke-width="4"/>
  ${screw(14, 14)}${screw(186, 14)}${screw(14, 246)}${screw(186, 246)}
  <rect x="26" y="28" width="68" height="90" rx="8" fill="#12142a"/>
  <rect x="106" y="28" width="68" height="90" rx="8" fill="#12142a"/>
  <rect x="40" y="42" width="40" height="22" rx="4" fill="#ff2d4a"/>
  <rect x="120" y="42" width="40" height="22" rx="4" fill="#19f0ff"/>
  <text x="60" y="105" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="20" fill="#ffe14a">25¢</text>
  <text x="140" y="105" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="20" fill="#ffe14a">25¢</text>
  <rect x="22" y="130" width="156" height="30" rx="5" fill="#12142a" stroke="#ffe14a" stroke-width="2"/>
  <text x="100" y="152" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="17" letter-spacing="2" fill="#ffe14a">INSERT COIN</text>
  <circle cx="65" cy="200" r="22" fill="#12142a"/><circle cx="135" cy="200" r="22" fill="#12142a"/>
  <text x="65" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#e8ecff">RETURN</text>
  <text x="135" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#e8ecff">RETURN</text>
</svg>`;
}

function frontSvg() {
  const cols = ["#ffe14a", "#ffb347", "#ff7a59", "#ff4fa8", "#d62bd6", "#7a3bff"];
  let stripes = "";
  for (let i = 0; i < 6; i++) stripes += `<rect x="0" y="${470 + i * 30}" width="600" height="${24 - i * 3}" fill="${cols[i]}"/>`;
  return `<svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0d5c"/><stop offset="1" stop-color="#0b0418"/></linearGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#8fc4ff"/><stop offset="1" stop-color="#ff7ad9"/></linearGradient></defs>
  <rect width="600" height="700" fill="url(#bg)"/>
  <rect x="14" y="0" width="5" height="700" fill="#ff4fa8"/><rect x="581" y="0" width="5" height="700" fill="#ff4fa8"/>
  <rect x="26" y="0" width="3" height="700" fill="#19f0ff"/><rect x="571" y="0" width="3" height="700" fill="#19f0ff"/>
  <text x="300" y="86" text-anchor="middle" textLength="380" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-size="64" fill="url(#chrome)" stroke="#12062b" stroke-width="2">NEON DRIVE</text>
  <rect x="80" y="104" width="440" height="4" fill="#19f0ff"/>
  <rect x="120" y="116" width="360" height="3" fill="#ff4fa8"/>
  ${stripes}
  <text x="300" y="688" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" letter-spacing="4" fill="#ffffff">© 1984 TURBOWAVE</text>
</svg>`;
}

function labelSvg() {
  let code = "";
  const r = rng(3);
  for (let i = 0; i < 38; i++) code += `<rect x="${12 + i * 3.4}" y="70" width="${(1 + r() * 1.6).toFixed(1)}" height="18" fill="#111"/>`;
  return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="100" rx="6" fill="#e9e4d4" stroke="#222" stroke-width="2"/>
  <text x="12" y="22" font-family="monospace" font-weight="bold" font-size="13" fill="#111">NEON DRIVE</text>
  <text x="12" y="38" font-family="monospace" font-size="10" fill="#111">MODEL ND-84   120V 60Hz</text>
  <text x="12" y="52" font-family="monospace" font-size="10" fill="#111">SER.NO. 0042-84  2.5A</text>
  <text x="12" y="63" font-family="monospace" font-size="8" fill="#a00">WARNING: UNPLUG BEFORE SERVICE</text>
  ${code}
</svg>`;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "arcade_cabinet", paintSize: 2048 });
  type Fill = string | Paint;

  // Paints
  const bodyPaint = paint((p, n) => {
    const base = mix("#0b0418", "#2a0d5c", smoothstep(0.1, 1.7, p.y));
    const c = mix(base, MAGENTA, smoothstep(0.3, 0, p.y) * 0.45);
    const lit = 0.85 + 0.15 * Math.max(n.y, 0);
    return [c[0] * lit, c[1] * lit, c[2] * lit] as [number, number, number];
  });
  const sidePaint = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return "#0a0316";
    const y = p.y;
    const base = mix("#10052a", "#3b0f6e", smoothstep(0.7, 1.75, y));
    if (y > 0.8) {
      const d = y + p.z * 0.55;
      const f = (((d / 0.16) % 1) + 1) % 1;
      if (f < 0.1) return MAGENTA;
      if (f > 0.14 && f < 0.19) return CYAN;
      const c = cells(p, 0.06, 5);
      if (c.d1 < 0.12 && c.id > 0.55) return "#ffffff";
    }
    return base;
  });

  // Textures
  const TEX = {
    side: svg(sideSvg(), { size: 1024 }),
    marquee: svg(marqueeSvg(), { size: 768 }),
    screen: svg(screenSvg(), { size: 768 }),
    bezel: svg(bezelSvg(), { size: 768 }),
    control: svg(controlSvg(), { size: 1024 }),
    coin: svg(coinSvg(), { size: 256 }),
    front: svg(frontSvg(), { size: 768 }),
    label: svg(labelSvg(), { size: 256 }),
  };

  // Helpers
  const box = (w: number, h: number, d: number, color: Fill, at: THREE.Vector3, dir?: THREE.Vector3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, dir ? { at, dir } : { at });
  const cyl = (r: number, h: number, seg: number, color: Fill, at: THREE.Vector3, dir: THREE.Vector3) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, flat: true });
  const sph = (r: number, color: Fill, at: THREE.Vector3, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, { at, flat: true });
  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: THREE.Vector3,
    normal: THREE.Vector3,
    up: THREE.Vector3,
    flipU = false,
  ) => {
    const g = new THREE.PlaneGeometry(w, h);
    if (flipU) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    return b.part(g, "#ffffff", { at, dir: normal, up, axis: "z", texture: tex });
  };
  const neon = (pts: THREE.Vector3[], r: number, color: string, strength = 1.3) => {
    for (let i = 0; i < pts.length - 1; i++) glow(b.rod(pts[i], pts[i + 1], r, color, { sides: 6 }), strength);
    for (const p of pts) glow(sph(r * 1.05, color, p, 6, 4), strength);
  };
  const screw = (at: THREE.Vector3, dir: THREE.Vector3, r = 0.005) => cyl(r, 0.004, 6, CHROME, at, dir);

  const FWD = V(0, 0, 1);
  const BACK = V(0, 0, -1);
  const UP = V(0, 1, 0);

  // ---------------------------------------------------------------- side panels with synthwave art
  for (const s of [1, -1]) {
    b.extrude(PROFILE, { at: [s * SIDE_X, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: sidePaint });
    decal(TEX.side, 0.83, 0.78, V(s * (SIDE_X + 0.017), 0.39, -0.035), V(s, 0, 0), UP, s < 0);
    // neon T-molding along the silhouette
    const front = [
      [0.38, 0.02], [0.38, 0.78], [0.47, 0.86], [0.47, 0.95], [0.28, 1.0], [0.17, 1.52], [0.31, 1.52], [0.31, 1.82], [-0.22, 1.82],
    ].map(([z, y]) => V(s * (SIDE_X + 0.016), y, z));
    neon(front, 0.006, PINK, 1.4);
    const rear = [[-0.22, 1.82], [-0.45, 1.15], [-0.45, 0.02]].map(([z, y]) => V(s * (SIDE_X + 0.016), y, z));
    neon(rear, 0.006, CYAN, 1.4);
  }

  // ---------------------------------------------------------------- base, front
  box(0.6, 0.03, 0.83, DEEP, V(0, 0.015, -0.035));
  box(0.6, 0.08, 0.02, DEEP, V(0, 0.04, 0.355));
  glow(box(0.56, 0.008, 0.006, PINK, V(0, 0.05, 0.366)), 1.4);
  glow(box(0.56, 0.006, 0.006, CYAN, V(0, 0.03, 0.366)), 1.4);
  box(0.6, 0.7, 0.02, bodyPaint, V(0, 0.43, 0.365));
  decal(TEX.front, 0.6, 0.7, V(0, 0.43, 0.378), FWD, UP);

  // coin door
  box(0.2, 0.26, 0.009, "#3a3f5a", V(0, 0.5, 0.3795));
  decal(TEX.coin, 0.2, 0.26, V(0, 0.5, 0.3855), FWD, UP);
  glow(box(0.008, 0.036, 0.004, RED, V(-0.04, 0.56, 0.3878)), 1.5);
  glow(box(0.008, 0.036, 0.004, CYAN, V(0.04, 0.56, 0.3878)), 1.5);
  glow(cyl(0.014, 0.01, 10, ORANGE, V(-0.035, 0.43, 0.39), FWD), 0.9);
  glow(cyl(0.014, 0.01, 10, CYAN, V(0.035, 0.43, 0.39), FWD), 0.9);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) screw(V(sx * 0.088, 0.5 + sy * 0.118, 0.3875), FWD);

  // ---------------------------------------------------------------- control deck
  const skirtN = V(0, -0.09, 0.08).normalize();
  box(0.6, 0.02, 0.1204, PLUM, V(0, 0.82, 0.425).addScaledVector(skirtN, -0.01), skirtN);
  box(0.6, 0.09, 0.02, "#12062b", V(0, 0.905, 0.46));
  box(0.6, 0.03, 0.1965, "#0f0722", onDeck(0, 0.5, -0.015), N_PANEL);
  decal(TEX.control, 0.6, 0.1965, onDeck(0, 0.5, 0.003), N_PANEL, V(0, 0, -1));
  for (let i = 0; i < 13; i++) {
    const x = -0.27 + i * 0.045;
    glow(sph(0.006, i % 2 ? CYAN : PINK, V(x, 0.905, 0.4705), 6, 4), 1.4);
  }
  glow(box(0.6, 0.006, 0.006, MAGENTA, V(0, 0.862, 0.474)), 1.2);

  const btnCols: Record<number, string[]> = { [-1]: [PINK, YELLOW, CYAN], [1]: [CYAN, YELLOW, PINK] };
  const us = [0.45, 0.58, 0.45];
  for (const s of [-1, 1]) {
    // joystick
    const sx = s * 0.22;
    box(0.07, 0.004, 0.07, CHROME, onDeck(sx, 0.5, 0.002), N_PANEL);
    b.lathe(
      [[0, 0], [0.032, 0], [0.032, 0.004], [0.013, 0.018], [0.013, 0.022], [0, 0.022]],
      { at: onDeck(sx, 0.5, 0.004), axis: N_PANEL, segments: 8, color: "#150a2c" },
    );
    b.rod(onDeck(sx, 0.5, 0.01), onDeck(sx, 0.5, 0.07), 0.006, CHROME, { sides: 6 });
    glow(sph(0.021, s < 0 ? PINK : CYAN, onDeck(sx, 0.5, 0.088), 10, 8), 0.7);
    // buttons
    for (let i = 0; i < 3; i++) {
      const x = s * (0.145 - i * 0.04);
      cyl(0.019, 0.008, 10, "#150a2c", onDeck(x, us[i], 0.004), N_PANEL);
      glow(cyl(0.0155, 0.014, 10, btnCols[s][i], onDeck(x, us[i], 0.013), N_PANEL), 0.9);
    }
    // start button
    cyl(0.015, 0.006, 8, "#150a2c", onDeck(s * 0.03, 0.3, 0.003), N_PANEL);
    glow(cyl(0.011, 0.01, 8, s < 0 ? CYAN : PINK, onDeck(s * 0.03, 0.3, 0.009), N_PANEL), 1.0);
  }

  // ---------------------------------------------------------------- screen bezel
  box(0.6, 0.02, 0.5315, "#0d0620", onBoard(0, 0, -0.01), N_B);
  decal(TEX.screen, 0.46, 0.345, onBoard(0, 0, 0.002), N_B, UP);
  decal(TEX.bezel, 0.6, 0.5315, onBoard(0, 0, 0.004), N_B, UP);
  glow(b.parts ? ({} as never) : ({} as never), 1);
  const hx = 0.23;
  const hv = 0.1725;
  const ring = [[-hx, -hv], [hx, -hv], [hx, hv], [-hx, hv], [-hx, -hv]].map(([x, v]) => onBoard(x, v, 0.005));
  neon(ring, 0.003, CYAN, 1.5);
  for (const sx of [-1, 1]) for (const sv of [-1, 1]) screw(onBoard(sx * 0.275, sv * 0.235, 0.006), N_B, 0.006);

  // ---------------------------------------------------------------- marquee
  box(0.6, 0.3, 0.02, "#0d0620", V(0, 1.67, 0.3));
  glow(decal(TEX.marquee, 0.56, 0.24, V(0, 1.67, 0.312), FWD, UP), 1.0);
  neon(
    [[-0.288, 1.543], [0.288, 1.543], [0.288, 1.797], [-0.288, 1.797], [-0.288, 1.543]].map(([x, y]) => V(x, y, 0.315)),
    0.004,
    CYAN,
    1.5,
  );
  box(0.6, 0.02, 0.14, "#12062b", V(0, 1.51, 0.24));
  glow(box(0.58, 0.006, 0.006, PINK, V(0, 1.503, 0.307)), 1.4);
  box(0.6, 0.02, 0.53, "#12062b", V(0, 1.81, 0.045));

  // ---------------------------------------------------------------- back
  box(0.6, 1.15, 0.02, bodyPaint, V(0, 0.575, -0.44));
  const bkN = V(0, 0.325, -0.946).normalize();
  box(0.6, 0.02, 0.708, bodyPaint, V(0, 1.485, -0.335).addScaledVector(bkN, -0.01), bkN);
  box(0.46, 0.7, 0.006, PLUM, V(0, 0.62, -0.452));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) screw(V(sx * 0.21, 0.62 + sy * 0.32, -0.456), BACK);
  box(0.03, 0.1, 0.012, CHROME, V(-0.16, 0.62, -0.459));
  for (let i = 0; i < 7; i++) box(0.4, 0.007, 0.004, BLACK, V(0, 1.02 + i * 0.014, -0.4505));
  decal(TEX.label, 0.16, 0.1, V(0.1, 0.38, -0.4575), BACK, UP);
  box(0.09, 0.07, 0.03, "#15152a", V(-0.12, 0.3, -0.47));
  b.sweep(
    catmull([[-0.12, 0.3, -0.488], [-0.12, 0.2, -0.54], [-0.13, 0.08, -0.58], [-0.14, 0.008, -0.62], [-0.12, 0.008, -0.7]]),
    0.007,
    { color: BLACK, sides: 6 },
  );
  box(0.02, 0.014, 0.03, "#15152a", V(-0.12, 0.008, -0.71));

  // ---------------------------------------------------------------- feet & trim details
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.012, 0.004, 8, STEEL, V(sx * 0.27, 0.002, sz * 0.38 - 0.035), UP);
  const topEdge = [-0.28, -0.14, 0, 0.14, 0.28];
  for (const x of topEdge) glow(sph(0.006, x === 0 ? YELLOW : MAGENTA, V(x, 1.82, 0.31), 6, 4), 1.4);

  return b.root;
}
```