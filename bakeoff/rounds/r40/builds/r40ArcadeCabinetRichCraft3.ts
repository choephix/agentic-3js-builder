import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, rng, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Neon Drive '84 Arcade Cabinet",
  description:
    "Upright 1980s arcade cabinet in synthwave style: glowing sunset side art, neon T-molding, lit marquee, CRT with a night-race game, two-player control deck with lit buttons, and a coin door.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const PINK = "#ff2e97";
const CYAN = "#22e5ff";
const YEL = "#ffe66d";
const ORG = "#ff9a3c";
const VIO = "#7a2cff";
const NIGHT = "#0d0920";
const BLK = "#07050f";
const PLUM = "#1d1238";
const CHROME = "#cfd6ea";

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters). Front is +Z, left is +X.
const W = 0.66; // overall width
const T = 0.035; // side panel thickness
const XS = W / 2 - T / 2; // side panel centre x
const IN = W / 2 - T; // half width between the side panels (0.295)

// Side profile (z, y), drawn counter-clockwise: bottom back, bottom front, up the front, over the top, down the back.
const SIDE: [number, number][] = [
  [-0.42, 0], // A
  [0.3, 0], // B
  [0.3, 0.09], // C
  [0.4, 0.09], // D
  [0.4, 0.78], // E
  [0.5, 0.92], // F
  [0.5, 1.0], // G  control deck lip
  [0.26, 1.06], // H  deck back
  [0.14, 1.56], // I  monitor top
  [0.3, 1.58], // J  marquee underside
  [0.3, 1.82], // K
  [-0.42, 1.82], // L
];
const EDGE_COLORS = [CYAN, PINK, PINK, PINK, PINK, PINK, CYAN, CYAN, CYAN, PINK, CYAN, PINK];

// Control deck slope
const DF: [number, number] = [0.5, 1.0];
const DB: [number, number] = [0.26, 1.06];
const DECK_N = new THREE.Vector3(0, 0.97, 0.2425).normalize();
const deckPoint = (x: number, v: number, h: number) =>
  new THREE.Vector3(
    x,
    DF[1] + (DB[1] - DF[1]) * v + DECK_N.y * h,
    DF[0] + (DB[0] - DF[0]) * v + DECK_N.z * h,
  );

// Monitor slope
const MON_MID = new THREE.Vector3(0, 1.31, 0.2);
const MON_N = new THREE.Vector3(0, 0.2334, 0.9724).normalize();
const monPoint = (h: number) => MON_MID.clone().addScaledVector(MON_N, h);

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers
function stars(r: () => number, n: number, w: number, h: number, rmin: number, col = "#ffffff") {
  let s = "";
  for (let i = 0; i < n; i++)
    s += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(rmin + r() * rmin).toFixed(2)}" fill="${col}" fill-opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  return s;
}

const sidePath = () =>
  "M" + SIDE.map(([z, y]) => `${((0.5 - z) * 100).toFixed(1)} ${((1.82 - y) * 100).toFixed(1)}`).join(" L") + " Z";

function sideArt(mirror: boolean) {
  const rnd = rng(11);
  let grid = "";
  for (let i = -6; i <= 6; i++)
    grid += `<line x1="46" y1="135" x2="${46 + i * 14}" y2="182" stroke="${PINK}" stroke-width="0.55" stroke-opacity="0.95"/>`;
  for (const y of [136.5, 139, 142.5, 147.5, 155, 166, 180])
    grid += `<line x1="0" y1="${y}" x2="92" y2="${y}" stroke="${CYAN}" stroke-width="0.5" stroke-opacity="0.9"/>`;
  const body = `
    <g clip-path="url(#c)">
      <rect width="92" height="182" fill="url(#sky)"/>
      ${stars(rnd, 70, 92, 105, 0.28)}
      <circle cx="46" cy="116" r="31" fill="url(#sun)" mask="url(#cut)"/>
      <path d="M0 135 L9 120 L16 128 L29 106 L40 130 L52 118 L64 131 L77 110 L92 128 L92 135Z" fill="#150833" stroke="${CYAN}" stroke-width="0.5"/>
      <rect y="135" width="92" height="47" fill="url(#floor)"/>
      ${grid}
      <rect y="134.4" width="92" height="1.1" fill="#ffb3d9"/>
      <path d="M0 30 L92 8 L92 12 L0 34Z" fill="${PINK}"/>
      <path d="M0 36 L92 14 L92 16.5 L0 38.5Z" fill="${CYAN}"/>
      <path d="M0 41 L92 19 L92 20.4 L0 42.4Z" fill="${YEL}"/>
    </g>`;
  return svg(
    `<svg viewBox="0 0 92 182" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="c"><path d="${sidePath()}"/></clipPath>
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="135">
        <stop offset="0" stop-color="#090421"/><stop offset="0.5" stop-color="#2a0b5e"/>
        <stop offset="0.8" stop-color="#8c1a95"/><stop offset="1" stop-color="#ff4d94"/>
      </linearGradient>
      <linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="85" x2="0" y2="147">
        <stop offset="0" stop-color="#ffe66d"/><stop offset="0.5" stop-color="#ff7a3c"/><stop offset="1" stop-color="#ff2e97"/>
      </linearGradient>
      <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="135" x2="0" y2="182">
        <stop offset="0" stop-color="#4a0f7e"/><stop offset="1" stop-color="#14062e"/>
      </linearGradient>
      <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="92" height="182">
        <rect width="92" height="182" fill="#fff"/>
        <rect y="116" width="92" height="1.2" fill="#000"/><rect y="121" width="92" height="1.8" fill="#000"/>
        <rect y="126.5" width="92" height="2.4" fill="#000"/><rect y="131.5" width="92" height="3.2" fill="#000"/>
      </mask>
    </defs>
    ${mirror ? `<g transform="translate(92 0) scale(-1 1)">` : "<g>"}${body}</g>
  </svg>`,
    { size: 1024 },
  );
}

function frontArt() {
  let slots = "";
  for (let i = 0; i < 5; i++) slots += `<rect x="7" y="${(3.4 + i * 1.3).toFixed(1)}" width="45" height="0.5" fill="#5a34a0"/>`;
  let grid = "";
  for (let i = -6; i <= 6; i++)
    grid += `<line x1="29.5" y1="62" x2="${29.5 + i * 9}" y2="68" stroke="${PINK}" stroke-width="0.35"/>`;
  for (const y of [63, 64.5, 66.5])
    grid += `<line x1="0" y1="${y}" x2="59" y2="${y}" stroke="${CYAN}" stroke-width="0.3"/>`;
  return svg(
    `<svg viewBox="0 0 59 68" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150833"/><stop offset="0.7" stop-color="#2c0c5a"/><stop offset="1" stop-color="#5a1170"/></linearGradient>
      <linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="49" x2="0" y2="63"><stop offset="0" stop-color="#ffe66d"/><stop offset="1" stop-color="#ff2e97"/></linearGradient>
      <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="59" height="68"><rect width="59" height="68" fill="#fff"/>
        <rect y="55" width="59" height="0.5" fill="#000"/><rect y="58" width="59" height="0.8" fill="#000"/><rect y="60.5" width="59" height="1.1" fill="#000"/></mask>
    </defs>
    <rect width="59" height="68" fill="url(#bg)"/>
    <rect x="5" y="2" width="49" height="8" rx="1" fill="#07040f" stroke="${CYAN}" stroke-width="0.4"/>
    ${slots}
    <path d="M0 12.6H59" stroke="${PINK}" stroke-width="0.7"/><path d="M0 14.1H59" stroke="${CYAN}" stroke-width="0.4"/>
    <text x="29.5" y="19.2" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="3.6" fill="${YEL}" textLength="30" lengthAdjust="spacingAndGlyphs">INSERT COIN</text>
    <rect y="48" width="59" height="20" fill="#1a0838"/>
    <circle cx="29.5" cy="63" r="14" fill="url(#sun)" mask="url(#cut)"/>
    <path d="M0 62 L8 56 L13 60 L20 54 L26 60 L33 57 L41 60 L47 55 L59 62Z" fill="#150833" stroke="${CYAN}" stroke-width="0.3"/>
    <rect y="62" width="59" height="6" fill="#2a0a58"/>
    ${grid}
    <rect x="0.4" y="0.4" width="58.2" height="67.2" fill="none" stroke="${PINK}" stroke-width="0.5"/>
  </svg>`,
    { size: 640 },
  );
}

function deckArt() {
  const ring = (x: number, y: number, r: number, c: string, w = 2.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const label = (x: number, y: number, t: string, c: string, sz = 14) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${sz}" fill="${c}">${t}</text>`;
  const p = (x: number) => (x + 0.295) * 1000;
  const v = (vv: number) => (1 - vv) * 247;
  let marks = "";
  for (const [s, c1, c2] of [
    [-1, PINK, CYAN],
    [1, CYAN, PINK],
  ] as const) {
    marks += ring(p(s * 0.22), v(0.5), 46, c1) + ring(p(s * 0.22), v(0.5), 38, c2, 1.2);
    marks += ring(p(s * 0.12), v(0.4), 27, c1) + ring(p(s * 0.055), v(0.62), 27, c2);
    marks += label(p(s * 0.22), 206, s < 0 ? "1P" : "2P", c1, 15);
  }
  marks += ring(p(-0.03), v(0.3), 20, YEL, 2) + ring(p(0.03), v(0.3), 20, ORG, 2);
  marks += label(p(-0.03), 206, "1", YEL, 12) + label(p(0.03), 206, "2", ORG, 12);
  return svg(
    `<svg viewBox="0 0 590 247" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1d0d45"/><stop offset="1" stop-color="#0d0722"/></linearGradient></defs>
    <rect width="590" height="247" fill="url(#g)"/>
    <path d="M0 240H590" stroke="${PINK}" stroke-width="5"/><path d="M0 230H590" stroke="${CYAN}" stroke-width="2"/>
    <path d="M0 8H590" stroke="${CYAN}" stroke-width="3"/><path d="M0 16H590" stroke="${PINK}" stroke-width="1.5"/>
    <text x="295" y="58" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="26" fill="${PINK}" fill-opacity="0.75" textLength="250" lengthAdjust="spacingAndGlyphs">NEON DRIVE</text>
    <path d="M60 70 L295 70 M295 70 L530 70" stroke="${VIO}" stroke-width="1.5"/>
    ${marks}
  </svg>`,
    { size: 1024 },
  );
}

function screenArt() {
  const r = rng(5);
  let dashes = "";
  for (let i = 0; i < 5; i++) {
    const y0 = 22 + 17 * Math.pow(i / 5, 1.8);
    const y1 = 22 + 17 * Math.pow((i + 0.5) / 5, 1.8);
    const h0 = 0.05 + (y0 - 22) * 0.05;
    const h1 = 0.05 + (y1 - 22) * 0.05;
    dashes += `<polygon points="${24 - h0},${y0} ${24 + h0},${y0} ${24 + h1},${y1} ${24 - h1},${y1}" fill="${YEL}"/>`;
  }
  let poles = "";
  for (const t of [0.2, 0.4, 0.62, 0.85]) {
    const y = 22 + 17 * Math.pow(t, 1.6);
    const hw = 1.2 + (y - 22) * 0.93;
    const ht = 0.8 + (y - 22) * 0.55;
    const wd = 0.2 + (y - 22) * 0.06;
    for (const sgn of [-1, 1])
      poles += `<rect x="${(24 + sgn * (hw + 1.2) - wd / 2).toFixed(2)}" y="${(y - ht).toFixed(2)}" width="${wd.toFixed(2)}" height="${ht.toFixed(2)}" fill="${sgn < 0 ? PINK : CYAN}"/>`;
  }
  let grid = "";
  for (let i = -5; i <= 5; i++)
    grid += `<line x1="24" y1="22" x2="${24 + i * 9}" y2="39" stroke="${PINK}" stroke-width="0.14" stroke-opacity="0.8"/>`;
  for (const y of [23, 24.6, 26.6, 29.2, 32.6, 37])
    grid += `<line x1="0" y1="${y}" x2="48" y2="${y}" stroke="${PINK}" stroke-width="0.12" stroke-opacity="0.7"/>`;
  const txt = (x: number, y: number, t: string, c: string, sz = 2.4, anchor = "start") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${sz}" fill="${c}">${t}</text>`;
  return svg(
    `<svg viewBox="0 0 48 39" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="22"><stop offset="0" stop-color="#07031a"/><stop offset="0.55" stop-color="#3a0d73"/><stop offset="1" stop-color="#ff3d8f"/></linearGradient>
      <linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="0" y2="24"><stop offset="0" stop-color="#ffe66d"/><stop offset="1" stop-color="#ff2e97"/></linearGradient>
      <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="39"><rect width="48" height="39" fill="#fff"/>
        <rect y="17" width="48" height="0.4" fill="#000"/><rect y="19" width="48" height="0.7" fill="#000"/><rect y="20.8" width="48" height="1.1" fill="#000"/></mask>
      <pattern id="sl" width="48" height="0.8" patternUnits="userSpaceOnUse"><rect width="48" height="0.35" fill="#000" fill-opacity="0.3"/></pattern>
      <radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>
    </defs>
    <rect width="48" height="22" fill="url(#sky)"/>
    ${stars(r, 34, 48, 14, 0.12)}
    <circle cx="24" cy="17" r="8" fill="url(#sun)" mask="url(#cut)"/>
    <path d="M0 22 L5 17 L8 20 L13 15 L17 20 L22 18 L26 21 L31 16 L36 20 L41 15.5 L48 21 L48 22Z" fill="#150833" stroke="${CYAN}" stroke-width="0.2"/>
    <rect y="22" width="48" height="17" fill="#13052e"/>
    ${grid}
    <polygon points="22.8,22 25.2,22 41,39 7,39" fill="#241050" stroke="${CYAN}" stroke-width="0.25"/>
    ${dashes}${poles}
    <ellipse cx="24" cy="37.6" rx="6.2" ry="0.9" fill="#000" fill-opacity="0.55"/>
    <rect x="19" y="36.3" width="2.2" height="1.7" fill="#07050f"/><rect x="26.8" y="36.3" width="2.2" height="1.7" fill="#07050f"/>
    <rect x="19.5" y="33.2" width="9" height="3.5" rx="0.8" fill="${PINK}"/>
    <polygon points="21,33.2 22.2,30.8 25.8,30.8 27,33.2" fill="#5b1fa8"/>
    <polygon points="22,32.9 22.6,31.4 25.4,31.4 26,32.9" fill="${CYAN}" fill-opacity="0.85"/>
    <rect x="20" y="32.5" width="8" height="0.5" fill="${CYAN}"/>
    <rect x="19.8" y="34.3" width="2.3" height="0.9" fill="#ff3030"/><rect x="25.9" y="34.3" width="2.3" height="0.9" fill="#ff3030"/>
    <rect x="22.8" y="35.4" width="2.4" height="0.7" fill="#fff" fill-opacity="0.8"/>
    ${txt(1.5, 3.4, "1UP", PINK)}${txt(1.5, 6.1, "004210", YEL, 2.6)}
    ${txt(24, 3.4, "HI-SCORE", CYAN, 2.4, "middle")}${txt(24, 6.1, "099990", "#ffffff", 2.6, "middle")}
    ${txt(46.5, 3.4, "LAP", PINK, 2.4, "end")}${txt(46.5, 6.1, "2/3", YEL, 2.6, "end")}
    ${txt(1.5, 37.8, "SPEED", CYAN, 1.9)}${txt(1.5, 37.8 - 2.1, "188", YEL, 2.6)}
    <rect width="48" height="39" fill="url(#sl)"/>
    <rect width="48" height="39" fill="url(#vg)"/>
    <polygon points="3,0 14,0 4,39 0,39 0,8" fill="#fff" fill-opacity="0.06"/>
  </svg>`,
    { size: 768 },
  );
}

function bezelArt() {
  const hole =
    "M9.5 7.2 H49.5 Q52.5 7.2 52.5 10.2 V41.2 Q52.5 44.2 49.5 44.2 H9.5 Q6.5 44.2 6.5 41.2 V10.2 Q6.5 7.2 9.5 7.2Z";
  const ring =
    "M9.5 6.5 H49.5 Q53.2 6.5 53.2 10.2 V41.2 Q53.2 44.9 49.5 44.9 H9.5 Q5.8 44.9 5.8 41.2 V10.2 Q5.8 6.5 9.5 6.5Z";
  return svg(
    `<svg viewBox="0 0 59 51.4" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1236"/><stop offset="1" stop-color="#06030d"/></linearGradient></defs>
    <path fill-rule="evenodd" fill="url(#b)" d="M0 0H59V51.4H0Z ${hole}"/>
    <path d="${ring}" fill="none" stroke="${PINK}" stroke-width="0.55"/>
    <rect x="1.3" y="1.3" width="56.4" height="48.8" rx="2" fill="none" stroke="${CYAN}" stroke-width="0.4"/>
    <text x="29.5" y="4.7" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-style="italic" font-size="3" fill="${PINK}" textLength="24" lengthAdjust="spacingAndGlyphs">NEON DRIVE</text>
    <text x="8" y="48.6" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="2.2" fill="${CYAN}">PLAYER 1</text>
    <text x="51" y="48.6" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="2.2" fill="${CYAN}">PLAYER 2</text>
    <text x="29.5" y="48.6" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="2.2" fill="${YEL}">CREDITS 00</text>
    <polygon points="2.4,25.7 4.8,22.7 4.8,28.7" fill="${PINK}"/><polygon points="56.6,25.7 54.2,22.7 54.2,28.7" fill="${PINK}"/>
    <polygon points="2.4,18 4.2,16 4.2,20" fill="${CYAN}"/><polygon points="56.6,18 54.8,16 54.8,20" fill="${CYAN}"/>
    <polygon points="2.4,33.4 4.2,31.4 4.2,35.4" fill="${CYAN}"/><polygon points="56.6,33.4 54.8,31.4 54.8,35.4" fill="${CYAN}"/>
  </svg>`,
    { size: 768 },
  );
}

function marqueeArt() {
  const r = rng(9);
  let grid = "";
  for (let i = -8; i <= 8; i++)
    grid += `<line x1="29.5" y1="17" x2="${29.5 + i * 7}" y2="24" stroke="${PINK}" stroke-width="0.2"/>`;
  for (const y of [17.8, 18.8, 20.2, 22.2])
    grid += `<line x1="0" y1="${y}" x2="59" y2="${y}" stroke="${CYAN}" stroke-width="0.18"/>`;
  return svg(
    `<svg viewBox="0 0 59 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="17"><stop offset="0" stop-color="#0a0420"/><stop offset="0.6" stop-color="#4a0f8a"/><stop offset="1" stop-color="#ff3d8f"/></linearGradient>
      <linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="0" y2="18"><stop offset="0" stop-color="#ffe66d"/><stop offset="1" stop-color="#ff2e97"/></linearGradient>
      <linearGradient id="chrome" gradientUnits="userSpaceOnUse" x1="0" y1="5" x2="0" y2="14"><stop offset="0" stop-color="#22e5ff"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="0.55" stop-color="#ffc9e8"/><stop offset="1" stop-color="#ff2e97"/></linearGradient>
      <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="59" height="24"><rect width="59" height="24" fill="#fff"/>
        <rect y="12.6" width="59" height="0.35" fill="#000"/><rect y="14.2" width="59" height="0.55" fill="#000"/><rect y="15.7" width="59" height="0.8" fill="#000"/></mask>
    </defs>
    <rect width="59" height="17" fill="url(#sky)"/>
    ${stars(r, 40, 59, 10, 0.14)}
    <circle cx="29.5" cy="12.5" r="9" fill="url(#sun)" mask="url(#cut)"/>
    <path d="M0 17 L7 12 L11 15 L17 10 L22 15 L37 15 L43 11 L49 15 L53 12.5 L59 17Z" fill="#150833" stroke="${CYAN}" stroke-width="0.2"/>
    <rect y="17" width="59" height="7" fill="#1b0642"/>
    ${grid}
    <text x="30.3" y="14.2" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic" font-size="10.5" fill="#3a0b7a" stroke="#3a0b7a" stroke-width="0.9" textLength="52" lengthAdjust="spacingAndGlyphs">NEON DRIVE</text>
    <text x="29.5" y="13.4" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-style="italic" font-size="10.5" fill="url(#chrome)" stroke="${PINK}" stroke-width="0.35" textLength="52" lengthAdjust="spacingAndGlyphs">NEON DRIVE</text>
    <text x="29.5" y="21.6" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="2.3" fill="${YEL}" textLength="36" lengthAdjust="spacingAndGlyphs">THE ULTIMATE NIGHT RACE</text>
    <rect x="0.4" y="0.4" width="58.2" height="23.2" fill="none" stroke="${PINK}" stroke-width="0.5"/>
  </svg>`,
    { size: 900 },
  );
}

function backLabel() {
  let stripes = "";
  for (let i = 0; i < 12; i++)
    stripes += `<polygon points="${i * 4},0 ${i * 4 + 2},0 ${i * 4 - 4},3 ${i * 4 - 6},3" fill="#000"/>`;
  return svg(
    `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="30" rx="1.5" fill="${YEL}"/>
    <rect x="1.5" y="1.5" width="37" height="27" fill="#12091f"/>
    <text x="20" y="9" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="4.4" fill="${PINK}">NEON DRIVE</text>
    <text x="20" y="14.6" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="2.6" fill="${CYAN}">MODEL ND-84   120V 60HZ</text>
    <text x="20" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="2.6" fill="#ffffff">SERIAL 0084-1337</text>
    <text x="20" y="25" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="3" fill="${YEL}">HIGH VOLTAGE</text>
  </svg>`,
    { size: 384 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "arcade_cabinet" });

  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const box = (w: number, h: number, d: number, color: ColorInput, at: THREE.Vector3, extra: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...extra });
  const cyl = (
    r: number,
    h: number,
    color: ColorInput,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    seg = 12,
    extra: object = {},
  ) => b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...extra });
  const plane = (
    w: number,
    h: number,
    tex: THREE.Texture,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    strength = 0,
    up?: THREE.Vector3,
  ) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      axis: "z",
      texture: tex,
      ...(up ? { up } : {}),
    });
    if (strength > 0) glow(part, strength);
    return part;
  };
  const neon = (a: THREE.Vector3, c: THREE.Vector3, color: string, r = 0.006, k = 1.3) =>
    glow(b.capsule(a, c, r, { color, sides: 6 }), k);

  const FWD = P(0, 0, 1);

  // ---- Paints ----------------------------------------------------------------------------------------------------
  const SIDE_PAINT = paint((p, n) => {
    const g = smoothstep(0, 1.8, p.y);
    const base = mix("#3a1275", "#0e0724", g);
    const nz = noise(p, 0.07, 3);
    const tint = mix(base, "#5a1fa0", 0.12 * nz);
    return n.z > 0.5 ? mix(tint, "#ff2e97", 0.18) : tint;
  });
  const BODY_PAINT = paint((p) => mix("#150b30", "#0a0618", noise(p, 0.1, 7)));
  const STEEL = metal("steel", { polish: 0.3, tarnish: 0.1 });

  // ---- Textures --------------------------------------------------------------------------------------------------
  const TEX_SIDE = [sideArt(false), sideArt(true)]; // index 0: left (+X); 1: right (-X)
  const TEX_FRONT = frontArt();
  const TEX_DECK = deckArt();
  const TEX_SCREEN = screenArt();
  const TEX_BEZEL = bezelArt();
  const TEX_MARQUEE = marqueeArt();
  const TEX_LABEL = backLabel();

  // ---- Side panels, side art and neon T-molding --------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.extrude(SIDE, {
      at: P(s * XS, 0, 0),
      x: [0, 0, 1],
      thickness: T,
      bevel: 0.004,
      color: SIDE_PAINT,
    });
    plane(0.92, 1.82, TEX_SIDE[s > 0 ? 0 : 1], P(s * (XS + T / 2 + 0.0008), 0.91, 0.04), P(s, 0, 0), 0.55);
    for (let i = 0; i < SIDE.length; i++) {
      const [z0, y0] = SIDE[i];
      const [z1, y1] = SIDE[(i + 1) % SIDE.length];
      neon(P(s * (XS + T / 2 + 0.0015), y0, z0), P(s * (XS + T / 2 + 0.0015), y1, z1), EDGE_COLORS[i], 0.006, 1.25);
    }
  }

  // ---- Back --------------------------------------------------------------------------------------------------------
  box(2 * IN, 1.82, 0.02, BODY_PAINT, P(0, 0.91, -0.41));
  box(0.46, 0.7, 0.008, PLUM, P(0, 0.58, -0.4235));
  for (let i = 0; i < 9; i++) box(0.36, 0.008, 0.004, BLK, P(0, 0.8 - i * 0.022, -0.4285));
  for (const [sx, sy] of [
    [-0.2, 0.25],
    [0.2, 0.25],
    [-0.2, 0.9],
    [0.2, 0.9],
  ])
    cyl(0.006, 0.004, CHROME, P(sx, sy, -0.4275), P(0, 0, -1), 8);
  plane(0.16, 0.12, TEX_LABEL, P(0.1, 0.34, -0.4285), P(0, 0, -1));
  box(0.06, 0.045, 0.014, BLK, P(-0.15, 0.2, -0.4285));
  box(0.012, 0.012, 0.006, "#ff3030", P(-0.12, 0.2, -0.4365));
  b.sweep(
    catmull([
      [-0.15, 0.2, -0.44],
      [-0.15, 0.13, -0.5],
      [-0.2, 0.01, -0.58],
      [-0.12, 0.01, -0.72],
    ]),
    0.008,
    { color: "#0a0a10", sides: 6 },
  );
  box(0.03, 0.016, 0.045, "#0a0a10", P(-0.12, 0.009, -0.745));

  // ---- Lower front: panel, kick plate, art, coin door ------------------------------------------------------------
  box(2 * IN, 0.69, 0.03, BODY_PAINT, P(0, 0.435, 0.385));
  plane(0.59, 0.68, TEX_FRONT, P(0, 0.44, 0.4012), FWD, 0.35);
  box(2 * IN, 0.09, 0.02, BLK, P(0, 0.045, 0.29));
  glow(box(0.5, 0.012, 0.006, PINK, P(0, 0.05, 0.302)), 1.4);
  glow(box(2 * IN, 0.008, 0.008, CYAN, P(0, 0.094, 0.399)), 1.3);

  // coin door
  const dz = 0.4135;
  b.part(new THREE.BoxGeometry(0.19, 0.25, 0.012), STEEL, { at: P(0, 0.44, 0.4075) });
  for (const [sx, sy] of [
    [-0.083, 0.325],
    [0.083, 0.325],
    [-0.083, 0.555],
    [0.083, 0.555],
  ])
    cyl(0.005, 0.004, CHROME, P(sx, sy, dz + 0.002), FWD, 8);
  box(0.03, 0.012, 0.004, "#c9a43a", P(0, 0.455, dz + 0.002)); // lock cam
  for (const s of [-1, 1]) {
    const c = s < 0 ? PINK : CYAN;
    box(0.07, 0.11, 0.008, "#1b1535", P(s * 0.045, 0.51, 0.4175));
    glow(cyl(0.022, 0.004, c, P(s * 0.045, 0.535, 0.4235), FWD, 12), 1.1);
    cyl(0.013, 0.004, BLK, P(s * 0.045, 0.535, 0.4255), FWD, 10);
    glow(box(0.014, 0.058, 0.003, YEL, P(s * 0.045, 0.49, 0.4225)), 1.2);
    box(0.005, 0.05, 0.003, BLK, P(s * 0.045, 0.49, 0.424));
    glow(cyl(0.011, 0.006, ORG, P(s * 0.045, 0.435, 0.4235), FWD, 10), 1.0);
  }
  box(0.1, 0.05, 0.01, "#05030a", P(0, 0.355, 0.4195));
  box(0.09, 0.034, 0.004, STEEL, P(0, 0.352, 0.4255));

  // ---- Control deck ---------------------------------------------------------------------------------------------
  b.extrude(
    [
      [0.4, 0.78],
      [0.5, 0.92],
      [0.5, 1.0],
      [0.26, 1.06],
      [0.26, 0.8],
    ],
    { at: P(0, 0, 0), x: [0, 0, 1], thickness: 2 * IN, color: NIGHT },
  );
  plane(0.59, 0.2474, TEX_DECK, deckPoint(0, 0.5, 0.0015), DECK_N, 0.7, P(0, 0, -1));
  neon(P(-IN, 0.997, 0.503), P(IN, 0.997, 0.503), PINK, 0.005, 1.3);
  neon(P(-IN, 0.925, 0.503), P(IN, 0.925, 0.503), CYAN, 0.004, 1.2);

  const BTN: [number, number][] = [
    [0, 0],
    [0.021, 0],
    [0.021, 0.004],
    [0.019, 0.01],
    [0.014, 0.0125],
    [0, 0.0115],
  ];
  for (const s of [-1, 1]) {
    const c1 = s < 0 ? PINK : CYAN;
    const c2 = s < 0 ? CYAN : PINK;
    const sx = s * 0.22;
    // joystick
    cyl(0.034, 0.006, BLK, deckPoint(sx, 0.5, 0.003), DECK_N, 14);
    b.part(new THREE.CylinderGeometry(0.012, 0.03, 0.022, 10), "#15101f", {
      at: deckPoint(sx, 0.5, 0.017),
      dir: DECK_N,
    });
    cyl(0.005, 0.08, CHROME, deckPoint(sx, 0.5, 0.05), DECK_N, 8);
    b.part(new THREE.SphereGeometry(0.025, 10, 8), c1, { at: deckPoint(sx, 0.5, 0.098) });
    glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), "#ffffff", { at: deckPoint(sx, 0.5, 0.115) }), 1);
    // action buttons
    for (const [bx, bv, bc] of [
      [s * 0.12, 0.4, c1],
      [s * 0.055, 0.62, c2],
    ] as const) {
      cyl(0.027, 0.004, BLK, deckPoint(bx, bv, 0.002), DECK_N, 12);
      glow(b.lathe(BTN, { at: deckPoint(bx, bv, 0.004), axis: DECK_N, segments: 12, color: bc }), 0.9);
    }
  }
  // start buttons
  for (const [sx, c] of [
    [-0.03, YEL],
    [0.03, ORG],
  ] as const) {
    cyl(0.016, 0.004, BLK, deckPoint(sx, 0.3, 0.002), DECK_N, 10);
    glow(cyl(0.012, 0.008, c, deckPoint(sx, 0.3, 0.007), DECK_N, 10), 1.1);
  }

  // ---- Monitor wedge, screen and bezel ----------------------------------------------------------------------------
  b.extrude(
    [
      [0.26, 1.06],
      [0.14, 1.56],
      [-0.35, 1.56],
      [-0.35, 1.06],
    ],
    { at: P(0, 0, 0), x: [0, 0, 1], thickness: 2 * IN, color: "#0a0716" },
  );
  plane(0.48, 0.39, TEX_SCREEN, monPoint(0.0025), MON_N, 1.0, P(0, 1, 0));
  plane(0.59, 0.5142, TEX_BEZEL, monPoint(0.0045), MON_N, 0.8, P(0, 1, 0));

  // ---- Marquee and cap ----------------------------------------------------------------------------------------------
  b.extrude(
    [
      [0.14, 1.56],
      [0.3, 1.58],
      [0.3, 1.82],
      [-0.4, 1.82],
      [-0.4, 1.56],
    ],
    { at: P(0, 0, 0), x: [0, 0, 1], thickness: 2 * IN, color: NIGHT },
  );
  plane(0.59, 0.24, TEX_MARQUEE, P(0, 1.7, 0.3012), FWD, 1.1);
  neon(P(-IN, 1.813, 0.305), P(IN, 1.813, 0.305), PINK, 0.005, 1.4);
  neon(P(-IN, 1.587, 0.305), P(IN, 1.587, 0.305), CYAN, 0.005, 1.4);
  for (const s of [-1, 1]) neon(P(s * (IN - 0.002), 1.587, 0.305), P(s * (IN - 0.002), 1.813, 0.305), CYAN, 0.004, 1.2);

  box(0.7, 0.02, 0.76, "#1a0b3d", P(0, 1.83, -0.05));
  neon(P(-0.35, 1.842, 0.33), P(0.35, 1.842, 0.33), CYAN, 0.004, 1.3);
  neon(P(-0.35, 1.842, 0.33), P(-0.35, 1.842, -0.43), PINK, 0.004, 1.2);
  neon(P(0.35, 1.842, 0.33), P(0.35, 1.842, -0.43), PINK, 0.004, 1.2);
  neon(P(-0.35, 1.842, -0.43), P(0.35, 1.842, -0.43), CYAN, 0.004, 1.2);
  for (let i = 0; i < 7; i++) box(0.4, 0.004, 0.012, BLK, P(0, 1.841, -0.28 + i * 0.03));

  return b.root;
}
