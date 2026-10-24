import * as THREE from "three";
import { createBuilder, mix, paint, polyline, catmull, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Neon Rider Arcade Cabinet",
  description:
    "A 1980s upright arcade cabinet in synthwave style: sunset-grid side art, glowing marquee and CRT screen, neon pinstripes, a two-player control panel with joysticks and lit buttons, coin door, and a vented back door.",
};

type V = [number, number, number];
type Col = string | ReturnType<typeof metal>;
type Opt = { dir?: V; axis?: "x" | "y" | "z"; up?: V; texture?: THREE.Texture };

// ---------------------------------------------------------------------------------------------------------------
// Palette
const INK = "#07030f";
const BODY = "#1b0e35";
const DARK = "#0e0620";
const MAG = "#ff2fa8";
const CYAN = "#2ee9ff";
const YEL = "#ffd84a";
const ORG = "#ff8a3d";
const CHR = "#cfd6e8";
const SLOT = "#3b2a68";
const SCREW = "#3a3355";

// ---------------------------------------------------------------------------------------------------------------
// Cabinet side profile (z, y): +z is the player's side
const PROFILE: [number, number][] = [
  [-0.38, 0],
  [0.3, 0],
  [0.3, 0.12],
  [0.42, 0.12],
  [0.42, 0.9],
  [0.64, 0.97],
  [0.64, 1.03],
  [0.4, 1.06],
  [0.22, 1.52],
  [0.34, 1.56],
  [0.34, 1.84],
  [-0.27, 1.84],
  [-0.38, 1.2],
];
const SIDE_X = 0.3075;
const SIDE_T = 0.035;

// Monitor slope (from H up to I) and control-panel top (from G back to H)
const H0 = { z: 0.4, y: 1.06 };
const I0 = { z: 0.22, y: 1.52 };
const SL = Math.hypot(I0.z - H0.z, I0.y - H0.y);
const TS: V = [0, (I0.y - H0.y) / SL, (I0.z - H0.z) / SL];
const NS: V = [0, -TS[2], TS[1]];
const slope = (u: number, v: number, d = 0): V => [u, H0.y + TS[1] * v + NS[1] * d, H0.z + TS[2] * v + NS[2] * d];

const G0 = { z: 0.64, y: 1.03 };
const CPL = Math.hypot(H0.z - G0.z, H0.y - G0.y);
const CPN: V = [0, -(H0.z - G0.z) / CPL, (H0.y - G0.y) / CPL];
/** x across (model +x = player's left... player's right is +x), w 0 front .. 1 back, d out of the panel */
const cp = (x: number, w: number, d = 0): V => [
  x,
  G0.y + (H0.y - G0.y) * w + CPN[1] * d,
  G0.z + (H0.z - G0.z) * w + CPN[2] * d,
];

// Back slant (from M up to L)
const M0 = { z: -0.38, y: 1.2 };
const L0 = { z: -0.27, y: 1.84 };
const BL = Math.hypot(L0.z - M0.z, L0.y - M0.y);
const BT: V = [0, (L0.y - M0.y) / BL, (L0.z - M0.z) / BL];
const BN: V = [0, -BT[2] * -1 * -1, BT[1]].map((v, i) => (i === 2 ? -Math.abs(v) : v)) as V;

// Control layout shared by the geometry and the panel drawing
type Pl = { sx: number; ball: string; btns: [number, number][]; start: [number, number]; label: string; col: string };
const PLAYERS: Pl[] = [
  { sx: -0.21, ball: MAG, btns: [[-0.13, 0.66], [-0.085, 0.53], [-0.04, 0.42]], start: [-0.03, 0.15], label: "1P START", col: CYAN },
  { sx: 0.21, ball: CYAN, btns: [[0.13, 0.66], [0.085, 0.53], [0.04, 0.42]], start: [0.03, 0.15], label: "2P START", col: MAG },
];
const BTN: [string, string][] = [
  [MAG, "#ff9ada"],
  [YEL, "#fff3a8"],
  [CYAN, "#b8f7ff"],
];

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings
const chromeStops = `<stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#8fe9ff"/><stop offset="0.5" stop-color="#2a1b7a"/><stop offset="0.55" stop-color="#ff62c0"/><stop offset="1" stop-color="#ffd1ee"/>`;

function screenSvg(): string {
  let hl = "";
  for (let k = 1; k <= 9; k++) {
    const y = (190 + 160 * (k / 9) ** 2).toFixed(1);
    hl += `<line x1="0" y1="${y}" x2="440" y2="${y}"/>`;
  }
  let vl = "";
  for (let i = -9; i <= 9; i++) vl += `<line x1="220" y1="190" x2="${220 + i * 70}" y2="350"/>`;
  let dash = "";
  for (let k = 0; k < 6; k++) {
    const ya = 190 + 160 * (k / 6) ** 2;
    const yb = 190 + 160 * ((k + 0.55) / 6) ** 2;
    const wa = 0.5 + (ya - 190) * 0.035;
    const wb = 0.5 + (yb - 190) * 0.035;
    dash += `<polygon points="${220 - wa},${ya} ${220 + wa},${ya} ${220 + wb},${yb} ${220 - wb},${yb}"/>`;
  }
  let stars = "";
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + 31) % 440;
    const y = (i * 53 + 7) % 110;
    stars += `<circle cx="${x}" cy="${y}" r="${i % 5 === 0 ? 1.6 : 0.9}" fill="#ffffff" opacity="0.85"/>`;
  }
  const gaps = [[140, 2], [150, 3.5], [160, 5], [170, 6.5], [180, 8]]
    .map(([y, h]) => `<rect x="140" y="${y}" width="160" height="${h}" fill="url(#sky)"/>`)
    .join("");
  return `<svg viewBox="0 0 440 350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="190"><stop offset="0" stop-color="#0b0330"/><stop offset="0.55" stop-color="#5a1196"/><stop offset="1" stop-color="#ff4fa3"/></linearGradient>
    <linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="76" x2="0" y2="200"><stop offset="0" stop-color="#ffe85a"/><stop offset="1" stop-color="#ff2f93"/></linearGradient>
    <linearGradient id="flr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0b6b"/><stop offset="1" stop-color="#0c0322"/></linearGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000" fill-opacity="0.25"/></pattern>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
  </defs>
  <rect width="440" height="190" fill="url(#sky)"/>
  ${stars}
  <circle cx="220" cy="138" r="62" fill="url(#sun)"/>
  ${gaps}
  <polygon points="0,190 0,150 28,168 60,128 96,176 128,152 160,190" fill="#1a0540" stroke="#35e8ff" stroke-width="1.5"/>
  <polygon points="440,190 440,150 412,168 380,128 344,176 312,152 280,190" fill="#1a0540" stroke="#35e8ff" stroke-width="1.5"/>
  <rect y="190" width="440" height="160" fill="url(#flr)"/>
  <g stroke="#ff4fd8" stroke-width="1.4" opacity="0.8">${hl}${vl}</g>
  <polygon points="212,190 228,190 400,350 40,350" fill="#0b0320"/>
  <polyline points="212,190 40,350" stroke="#ffd84a" stroke-width="2.5" fill="none"/>
  <polyline points="228,190 400,350" stroke="#ffd84a" stroke-width="2.5" fill="none"/>
  <g fill="#f4eaff">${dash}</g>
  <line x1="0" y1="190" x2="440" y2="190" stroke="#fff1ff" stroke-width="2"/>
  <ellipse cx="220" cy="328" rx="62" ry="8" fill="#000" opacity="0.55"/>
  <rect x="160" y="300" width="20" height="26" rx="4" fill="#0a0410"/>
  <rect x="260" y="300" width="20" height="26" rx="4" fill="#0a0410"/>
  <rect x="158" y="292" width="124" height="28" rx="7" fill="#ff2f93"/>
  <polygon points="178,292 190,266 250,266 262,292" fill="#b0166a"/>
  <polygon points="190,289 197,271 243,271 250,289" fill="#14052e"/>
  <polyline points="200,285 208,274" stroke="#2ee9ff" stroke-width="2" fill="none"/>
  <rect x="160" y="258" width="120" height="6" fill="#2ee9ff"/>
  <rect x="180" y="264" width="4" height="8" fill="#2ee9ff"/>
  <rect x="256" y="264" width="4" height="8" fill="#2ee9ff"/>
  <rect x="164" y="300" width="26" height="8" fill="#ff2a2a"/>
  <rect x="250" y="300" width="26" height="8" fill="#ff2a2a"/>
  <rect x="205" y="304" width="30" height="10" fill="#f4eaff"/>
  <rect x="207" y="306" width="26" height="1.6" fill="#14052e"/>
  <g font-family="monospace" font-weight="bold" font-size="15">
    <text x="14" y="24" fill="#2ee9ff">SCORE</text><text x="14" y="42" fill="#ffd84a">004250</text>
    <text x="426" y="24" fill="#2ee9ff" text-anchor="end">HI-SCORE</text><text x="426" y="42" fill="#ffd84a" text-anchor="end">099999</text>
    <text x="14" y="338" fill="#ff4fd8">SPEED 188</text>
    <text x="426" y="338" fill="#ff4fd8" text-anchor="end">LAP 2/3</text>
    <text x="220" y="30" fill="#ffffff" text-anchor="middle">TIME 45</text>
  </g>
  <rect width="440" height="350" fill="url(#scan)"/>
  <rect width="440" height="350" fill="url(#vig)"/>
</svg>`;
}

function marqueeSvg(): string {
  const gaps = [[110, 3], [125, 5], [142, 7], [160, 9], [178, 11]]
    .map(([y, h]) => `<rect x="170" y="${y}" width="220" height="${h}" fill="#000"/>`)
    .join("");
  let hl = "";
  for (let k = 1; k <= 6; k++) {
    const y = 185 + 65 * (k / 6) ** 2;
    hl += `<line x1="0" y1="${y.toFixed(1)}" x2="560" y2="${y.toFixed(1)}"/>`;
  }
  let vl = "";
  for (let i = -10; i <= 10; i++) vl += `<line x1="280" y1="185" x2="${280 + i * 70}" y2="250"/>`;
  let stars = "";
  for (let i = 0; i < 46; i++)
    stars += `<circle cx="${(i * 113 + 19) % 560}" cy="${(i * 37 + 11) % 100}" r="${i % 6 === 0 ? 1.8 : 1}" fill="#fff" opacity="0.9"/>`;
  const palm = `<path d="M40 190 Q50 140 36 92" stroke="#12042c" stroke-width="7" fill="none"/>
    <g stroke="#12042c" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M36 92 Q10 70 -14 96"/><path d="M36 92 Q20 56 -2 52"/><path d="M36 92 Q44 54 70 50"/><path d="M36 92 Q62 70 86 98"/><path d="M36 92 Q30 76 22 70"/>
    </g>`;
  return `<svg viewBox="0 0 560 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0330"/><stop offset="0.6" stop-color="#4b0f8e"/><stop offset="1" stop-color="#ff4fa3"/></linearGradient>
    <linearGradient id="sn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe85a"/><stop offset="1" stop-color="#ff2f93"/></linearGradient>
    <linearGradient id="ch" x1="0" y1="0" x2="0" y2="1">${chromeStops}</linearGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46107e"/><stop offset="1" stop-color="#0b0220"/></linearGradient>
    <mask id="cut"><rect width="560" height="250" fill="#fff"/>${gaps}</mask>
    <filter id="bl"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="560" height="250" fill="url(#bg)"/>
  ${stars}
  <circle cx="280" cy="120" r="108" fill="#ff2fa8" opacity="0.5" filter="url(#bl)"/>
  <circle cx="280" cy="120" r="95" fill="url(#sn)" mask="url(#cut)"/>
  <rect y="185" width="560" height="65" fill="url(#fl)"/>
  <g stroke="#ff4fd8" stroke-width="1.5" opacity="0.8">${hl}${vl}</g>
  <line x1="0" y1="185" x2="560" y2="185" stroke="#fff1ff" stroke-width="2"/>
  ${palm}
  <g transform="translate(560,0) scale(-1,1)">${palm}</g>
  <text x="283" y="153" text-anchor="middle" textLength="470" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-style="italic" font-weight="900" font-size="88" fill="#2ee9ff">NEON RIDER</text>
  <text x="280" y="150" text-anchor="middle" textLength="470" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-style="italic" font-weight="900" font-size="88" fill="url(#ch)" stroke="#ff2fa8" stroke-width="3" paint-order="stroke">NEON RIDER</text>
  <text x="280" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="17" letter-spacing="5" fill="#ffd84a">- 1 OR 2 PLAYERS -</text>
  <text x="280" y="226" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" letter-spacing="8" fill="#ffffff" opacity="0.9">INSERT COIN</text>
  <rect x="4" y="4" width="552" height="242" rx="10" fill="none" stroke="#2ee9ff" stroke-width="3"/>
  <rect x="10" y="10" width="540" height="230" rx="7" fill="none" stroke="#ff2fa8" stroke-width="1.5"/>
</svg>`;
}

function logoSvg(): string {
  return `<svg viewBox="0 0 560 160" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1">${chromeStops}</linearGradient></defs>
  <text x="283" y="97" text-anchor="middle" textLength="480" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-style="italic" font-weight="900" font-size="94" fill="#2ee9ff">NEON RIDER</text>
  <text x="280" y="93" text-anchor="middle" textLength="480" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Black', sans-serif" font-style="italic" font-weight="900" font-size="94" fill="url(#ch)" stroke="#ff2fa8" stroke-width="4" paint-order="stroke">NEON RIDER</text>
  <rect x="40" y="118" width="480" height="5" fill="#ff2fa8"/>
  <rect x="80" y="128" width="400" height="3" fill="#2ee9ff"/>
  <text x="280" y="156" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" letter-spacing="10" fill="#ffd84a">ARCADE 1984</text>
</svg>`;
}

function panelSvg(): string {
  const tx = (x: number) => ((x + 0.29) * 1000).toFixed(1);
  const ty = (w: number) => ((1 - w) * 242).toFixed(1);
  let marks = "";
  for (const pl of PLAYERS) {
    const cx = tx(pl.sx);
    const cy = ty(0.5);
    marks += `<circle cx="${cx}" cy="${cy}" r="48" fill="none" stroke="${pl.col}" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="${pl.col}" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M${cx} ${(+cy - 60).toFixed(1)} l-7 10 h14z M${cx} ${(+cy + 60).toFixed(1)} l-7 -10 h14z M${(+cx - 60).toFixed(1)} ${cy} l10 -7 v14z M${(+cx + 60).toFixed(1)} ${cy} l-10 -7 v14z" fill="${pl.col}"/>
      <text x="${cx}" y="${(+cy + 80).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="${pl.col}">${pl.label.startsWith("1") ? "PLAYER 1" : "PLAYER 2"}</text>`;
    pl.btns.forEach(([x, w], i) => {
      marks += `<circle cx="${tx(x)}" cy="${ty(w)}" r="26" fill="none" stroke="${BTN[i][0]}" stroke-width="3"/>`;
    });
    marks += `<circle cx="${tx(pl.start[0])}" cy="${ty(pl.start[1])}" r="26" fill="none" stroke="${pl.col}" stroke-width="3"/>
      <text x="${tx(pl.start[0])}" y="${(+ty(pl.start[1]) + 40).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#f4eaff">${pl.label}</text>`;
  }
  let grid = "";
  for (let i = 0; i <= 14; i++) grid += `<line x1="${i * 41.4}" y1="0" x2="${i * 41.4}" y2="242"/>`;
  for (let j = 0; j <= 6; j++) grid += `<line x1="0" y1="${j * 40.3}" x2="580" y2="${j * 40.3}"/>`;
  return `<svg viewBox="0 0 580 242" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0c4f"/><stop offset="1" stop-color="#0f0522"/></linearGradient>
    <linearGradient id="ps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe85a"/><stop offset="1" stop-color="#ff2f93"/></linearGradient>
  </defs>
  <rect width="580" height="242" fill="url(#pb)"/>
  <g stroke="#7b2cff" stroke-width="1" opacity="0.35">${grid}</g>
  <circle cx="290" cy="76" r="34" fill="url(#ps)"/>
  <rect x="250" y="84" width="80" height="3" fill="#2a0c4f"/><rect x="254" y="94" width="72" height="4" fill="#2a0c4f"/><rect x="262" y="105" width="56" height="5" fill="#2a0c4f"/>
  <polyline points="230,120 290,96 350,120" stroke="#2ee9ff" stroke-width="3" fill="none"/>
  <text x="290" y="146" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-style="italic" font-size="20" fill="#f4eaff" letter-spacing="3">NEON RIDER</text>
  ${marks}
  <rect x="3" y="3" width="574" height="236" rx="6" fill="none" stroke="#ff2fa8" stroke-width="3"/>
</svg>`;
}

function backSvg(): string {
  let slots = "";
  for (let r = 0; r < 12; r++)
    for (let c = 0; c < 2; c++)
      slots += `<rect x="${24 + c * 84}" y="${24 + r * 14}" width="68" height="7" rx="3" fill="#050210" stroke="#241545" stroke-width="1.2"/>`;
  let bars = "";
  for (let i = 0; i < 22; i++) bars += `<rect x="${130 + i * 3}" y="326" width="${i % 3 === 0 ? 2 : 1}" height="14" fill="#111"/>`;
  return `<svg viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="360" rx="8" fill="#0c0818" stroke="#2a1a50" stroke-width="3"/>
  ${slots}
  <rect x="20" y="200" width="160" height="62" rx="4" fill="#ffd84a"/>
  <polygon points="40,252 58,214 76,252" fill="#111" /><rect x="56" y="224" width="4" height="14" fill="#ffd84a"/><rect x="56" y="242" width="4" height="4" fill="#ffd84a"/>
  <text x="86" y="224" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#111">WARNING</text>
  <text x="86" y="238" font-family="Arial, sans-serif" font-size="8" fill="#111">HIGH VOLTAGE 120V</text>
  <text x="86" y="250" font-family="Arial, sans-serif" font-size="8" fill="#111">NO USER PARTS</text>
  <rect x="20" y="276" width="160" height="56" rx="4" fill="#d9d0f0"/>
  <text x="28" y="292" font-family="monospace" font-weight="bold" font-size="11" fill="#1b0e35">NEON RIDER  NR-84</text>
  <text x="28" y="306" font-family="monospace" font-size="9" fill="#1b0e35">SER 840213  120V 60HZ</text>
  ${bars}
</svg>`;
}

function coinSvg(): string {
  return `<svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd04a"/><stop offset="1" stop-color="#ff7a2a"/></linearGradient></defs>
  <rect x="1" y="1" width="118" height="34" rx="8" fill="url(#g)" stroke="#fff3a8" stroke-width="2"/>
  <text x="60" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="19" fill="#3a0a00">INSERT COIN</text>
</svg>`;
}

function creditSvg(): string {
  return `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="30" rx="3" fill="#190205"/>
  <text x="50" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" letter-spacing="2" fill="#ff3030">CREDIT 02</text>
</svg>`;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints
const HOR = 0.78;
const SUN = { z: 0, y: 1.1, r: 0.32 };
const skyAt = (y: number) => mix(mix("#ff4fa0", "#3a0f80", smoothstep(HOR, 1.25, y)), "#0a0425", smoothstep(1.15, 1.85, y));

/** Side art: synthwave sunset, mountains, grid floor and stars, drawn in the profile's (z, y) meters. */
const sideArt = paint((_p, n, s) => {
  if (Math.abs(n.x) < 0.6) return "#120728";
  const z = s[0];
  const y = s[1];
  if (y < HOR) {
    const d = HOR - y;
    const dd = Math.max(d, 0.001);
    let c = mix("#4a0f7a", "#0d0420", smoothstep(0, 0.6, d));
    c = mix(c, "#ff4fa0", (1 - smoothstep(0, 0.12, d)) * 0.8);
    const u = 9 * Math.sqrt(d / 0.7);
    const hd = (Math.abs(u - Math.round(u)) * Math.sqrt(0.7 * dd)) / 4.5;
    const vx = (z / dd) * 0.25;
    const vd = (Math.abs(vx - Math.round(vx)) * dd) / 0.25;
    if (d > 0.02 && (hd < 0.0032 || vd < 0.0032 + 0.003 * d))
      c = mix(c, mix("#ff4fd8", "#35e8ff", smoothstep(0, 0.5, d)), 0.92);
    if (Math.abs(y - HOR) < 0.004) return "#fff1ff";
    return c;
  }
  let c = skyAt(y);
  if (y > 1.3) {
    const iz = Math.floor(z / 0.06);
    const iy = Math.floor(y / 0.06);
    const hh = Math.sin(iz * 127.1 + iy * 311.7 + (n.x > 0 ? 0 : 91.3)) * 43758.5453;
    const f = hh - Math.floor(hh);
    if (f > 0.82) {
      const jz = (((f * 13) % 1) - 0.5) * 0.03;
      const jy = (((f * 29) % 1) - 0.5) * 0.03;
      if (Math.hypot(z - ((iz + 0.5) * 0.06 + jz), y - ((iy + 0.5) * 0.06 + jy)) < 0.0035 * (0.5 + f)) c = mix("#ffffff", "#ffffff", 0);
    }
  }
  if (Math.hypot(z - SUN.z, y - SUN.y) < SUN.r) {
    const t = (SUN.y + SUN.r - y) / (2 * SUN.r);
    const q = y / 0.05;
    const cut = y < SUN.y - 0.02 && q - Math.floor(q) < (0.5 * (SUN.y - y)) / SUN.r;
    if (!cut) c = mix(mix("#ffe45c", "#ff9a3c", smoothstep(0, 0.5, t)), "#ff2e93", smoothstep(0.45, 1, t));
  }
  const tri = Math.abs((((z * 6) % 1) + 1) % 1 - 0.5) * 2;
  const mh =
    (0.015 + 0.075 * (0.4 + 0.6 * tri) * (0.35 + 0.65 * Math.abs(Math.sin(z * 3.1 + 0.7)))) *
    smoothstep(0.1, 0.3, Math.abs(z));
  const top = HOR + mh;
  if (y < top) c = top - y < 0.004 ? mix("#35e8ff", "#35e8ff", 0) : mix("#1a0540", "#1a0540", 0);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "arcade_cabinet" });

  const STEEL = metal("steel");

  const put = (geo: THREE.BufferGeometry, color: Col, at: V, o: Opt = {}) => b.part(geo, color, { at, ...o });
  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, seg = 10) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const lit = (a: V, c: V, color: string, r = 0.005, k = 1.3) => glow(b.capsule(a, c, r, color, { sides: 6 }), k);
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, n: V, up: V = [0, 1, 0]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir: n, axis: "z", up, texture: tex });

  const T_SCREEN = svg(screenSvg(), { size: 512 });
  const T_MARQ = svg(marqueeSvg(), { size: 640 });
  const T_LOGO = svg(logoSvg(), { size: 512 });
  const T_PANEL = svg(panelSvg(), { size: 640 });
  const T_BACK = svg(backSvg(), { size: 400 });
  const T_COIN = svg(coinSvg(), { size: 128 });
  const T_CREDIT = svg(creditSvg(), { size: 128 });

  // ---- Body ----------------------------------------------------------------------------------------------------
  b.extrude(PROFILE, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.58, color: BODY });
  for (const s of [1, -1])
    b.extrude(PROFILE, {
      at: [s * SIDE_X, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: SIDE_T,
      bevel: 0.003,
      color: sideArt,
    });
  put(bx(0.66, 0.02, 0.66), DARK, [0, 1.85, 0.04]);

  // ---- Side logos and neon pinstripes ----------------------------------------------------------------------------
  const yz = (z: number, y: number, s: number): V => [s * 0.3275, y, z];
  const trims: [string, [number, number][]][] = [
    [CYAN, [[-0.36, 0.03], [-0.36, 1.2], [-0.255, 1.82], [0.32, 1.82], [0.32, 1.585]]],
    [MAG, [[-0.36, 0.03], [0.28, 0.03], [0.28, 0.095], [0.4, 0.095], [0.4, 0.88], [0.5, 0.945]]],
    [ORG, [[0.375, 1.085], [0.205, 1.515]]],
  ];
  for (const s of [1, -1]) {
    glow(decal(0.56, 0.16, T_LOGO, [s * 0.3262, 1.64, 0.0], [s, 0, 0]), 0.9);
    for (const [col, pts] of trims)
      glow(b.sweep(polyline(pts.map(([z, y]) => yz(z, y, s))), 0.0045, { color: col, sides: 6 }), 1.3);
  }

  // ---- Front: neon stripes, kick plate, speakers, credits, coin door -------------------------------------------
  glow(put(bx(0.58, 0.008, 0.003), CYAN, [0, 0.17, 0.4215]), 1.2);
  glow(put(bx(0.58, 0.008, 0.003), MAG, [0, 0.19, 0.4215]), 1.2);
  glow(put(bx(0.58, 0.006, 0.003), ORG, [0, 0.88, 0.4215]), 1.2);
  lit([-0.28, 0.085, 0.303], [0.28, 0.085, 0.303], MAG, 0.004, 1.2);

  for (const sx of [1, -1]) {
    put(bx(0.08, 0.26, 0.008), INK, [sx * 0.2, 0.55, 0.424]);
    for (let i = 0; i < 9; i++) put(bx(0.062, 0.007, 0.004), SLOT, [sx * 0.2, 0.45 + i * 0.025, 0.4295]);
  }
  put(bx(0.108, 0.038, 0.004), INK, [0, 0.82, 0.422]);
  glow(decal(0.1, 0.03, T_CREDIT, [0, 0.82, 0.4245], [0, 0, 1]), 1);

  // Coin door
  const pf = 0.436;
  put(bx(0.27, 0.37, 0.008), INK, [0, 0.55, 0.424]);
  put(bx(0.24, 0.34, 0.01), STEEL, [0, 0.55, 0.431]);
  lit([-0.135, 0.365, 0.43], [0.135, 0.365, 0.43], CYAN, 0.003, 1.2);
  lit([-0.135, 0.735, 0.43], [0.135, 0.735, 0.43], CYAN, 0.003, 1.2);
  lit([-0.135, 0.365, 0.43], [-0.135, 0.735, 0.43], CYAN, 0.003, 1.2);
  lit([0.135, 0.365, 0.43], [0.135, 0.735, 0.43], CYAN, 0.003, 1.2);
  for (const sx of [1, -1]) {
    put(bx(0.075, 0.11, 0.01), INK, [sx * 0.06, 0.62, pf + 0.005]);
    glow(put(bx(0.006, 0.045, 0.004), ORG, [sx * 0.06, 0.64, pf + 0.012]), 1.2);
    put(cyl(0.012, 0.012, 0.008, 10), CHR, [sx * 0.06, 0.52, pf + 0.004], { dir: [0, 0, 1] });
    put(bx(0.06, 0.035, 0.012), INK, [sx * 0.06, 0.46, pf + 0.006]);
    put(bx(0.05, 0.02, 0.004), SLOT, [sx * 0.06, 0.46, pf + 0.013]);
    for (const sy of [1, -1]) put(cyl(0.005, 0.005, 0.004, 6), SCREW, [sx * 0.108, 0.55 + sy * 0.15, pf + 0.002], { dir: [0, 0, 1] });
  }
  put(cyl(0.013, 0.013, 0.008, 10), CHR, [0, 0.62, pf + 0.004], { dir: [0, 0, 1] });
  put(bx(0.003, 0.012, 0.003), INK, [0, 0.62, pf + 0.009]);
  glow(decal(0.1, 0.03, T_COIN, [0, 0.695, pf + 0.0012], [0, 0, 1]), 1);

  // ---- Control panel ---------------------------------------------------------------------------------------------
  decal(0.58, CPL, T_PANEL, cp(0, 0.5, 0.002), CPN, [0, 0, -1]);
  lit([-0.285, 1.0, 0.646], [0.285, 1.0, 0.646], MAG, 0.0055, 1.3);
  lit([-0.285, 1.062, 0.402], [0.285, 1.062, 0.402], CYAN, 0.004, 1.3);

  const button = (x: number, w: number, c: string, hi: string, k = 0.8) => {
    put(cyl(0.0215, 0.0215, 0.006, 12), DARK, cp(x, w, 0.005), { dir: CPN });
    glow(put(cyl(0.0165, 0.0175, 0.014, 12), c, cp(x, w, 0.013), { dir: CPN }), k);
    put(cyl(0.011, 0.011, 0.002, 10), hi, cp(x, w, 0.0205), { dir: CPN });
  };
  const stick = (x: number, w: number, ball: string) => {
    put(cyl(0.04, 0.04, 0.006, 16), DARK, cp(x, w, 0.005), { dir: CPN });
    put(cyl(0.031, 0.031, 0.002, 14), CHR, cp(x, w, 0.0085), { dir: CPN });
    put(new THREE.ConeGeometry(0.024, 0.035, 8), INK, cp(x, w, 0.026), { dir: CPN });
    b.capsule(cp(x, w, 0.03), cp(x, w, 0.1), 0.0065, CHR, { sides: 8 });
    put(new THREE.SphereGeometry(0.023, 10, 8), ball, cp(x, w, 0.118));
    put(new THREE.SphereGeometry(0.0065, 6, 4), "#ffffff", cp(x - 0.009, w - 0.05, 0.135));
  };
  for (const pl of PLAYERS) {
    stick(pl.sx, 0.5, pl.ball);
    pl.btns.forEach(([x, w], i) => button(x, w, BTN[i][0], BTN[i][1]));
    button(pl.start[0], pl.start[1], pl.col, "#ffffff", 0.6);
  }

  // ---- Monitor bezel and screen ----------------------------------------------------------------------------------
  const sPart = (geo: THREE.BufferGeometry, color: Col, at: V) =>
    put(geo, color, at, { dir: NS, axis: "z", up: [0, 1, 0] });
  sPart(bx(0.58, 0.46, 0.006), INK, slope(0, 0.25, 0.003));
  const v0 = 0.247;
  glow(decal(0.44, 0.35, T_SCREEN, slope(0, v0, 0.0075), NS), 0.85);
  sPart(bx(0.5, 0.03, 0.01), DARK, slope(0, v0 + 0.19, 0.011));
  sPart(bx(0.5, 0.03, 0.01), DARK, slope(0, v0 - 0.19, 0.011));
  for (const s of [1, -1]) {
    sPart(bx(0.03, 0.35, 0.01), DARK, slope(s * 0.235, v0, 0.011));
    for (const sy of [1, -1]) put(cyl(0.004, 0.004, 0.003, 6), SCREW, slope(s * 0.24, v0 + sy * 0.19, 0.017), { dir: NS });
  }
  const sx0 = 0.222;
  const sy0 = 0.177;
  lit(slope(-sx0, v0 + sy0, 0.0145), slope(sx0, v0 + sy0, 0.0145), CYAN, 0.0028, 1.2);
  lit(slope(-sx0, v0 - sy0, 0.0145), slope(sx0, v0 - sy0, 0.0145), CYAN, 0.0028, 1.2);
  lit(slope(-sx0, v0 - sy0, 0.0145), slope(-sx0, v0 + sy0, 0.0145), MAG, 0.0028, 1.2);
  lit(slope(sx0, v0 - sy0, 0.0145), slope(sx0, v0 + sy0, 0.0145), MAG, 0.0028, 1.2);
  lit([-0.28, 1.528, 0.262], [0.28, 1.528, 0.262], CYAN, 0.006, 1.4);

  // ---- Marquee -------------------------------------------------------------------------------------------------------
  glow(decal(0.56, 0.25, T_MARQ, [0, 1.7, 0.3425], [0, 0, 1]), 1);
  lit([-0.285, 1.831, 0.348], [0.285, 1.831, 0.348], CYAN, 0.004, 1.3);
  lit([-0.285, 1.569, 0.348], [0.285, 1.569, 0.348], CYAN, 0.004, 1.3);
  lit([-0.285, 1.569, 0.348], [-0.285, 1.831, 0.348], MAG, 0.004, 1.3);
  lit([0.285, 1.569, 0.348], [0.285, 1.831, 0.348], MAG, 0.004, 1.3);
  for (const sx of [1, -1]) for (const sy of [1, -1]) put(cyl(0.005, 0.005, 0.004, 6), SCREW, [sx * 0.272, 1.7 + sy * 0.12, 0.3435], { dir: [0, 0, 1] });

  // ---- Back ------------------------------------------------------------------------------------------------------------
  decal(0.42, 0.756, T_BACK, [0, 0.6, -0.382], [0, 0, -1]);
  for (const sx of [1, -1]) for (const y of [0.24, 0.96]) put(cyl(0.005, 0.005, 0.004, 6), SCREW, [sx * 0.19, y, -0.383], { dir: [0, 0, -1] });
  put(bx(0.02, 0.12, 0.012), CHR, [0.17, 0.62, -0.392]);
  put(bx(0.012, 0.012, 0.014), CHR, [0.17, 0.57, -0.386]);
  put(bx(0.012, 0.012, 0.014), CHR, [0.17, 0.67, -0.386]);
  for (const y of [0.3, 0.9]) put(bx(0.03, 0.04, 0.012), SLOT, [-0.225, y, -0.386]);
  put(bx(0.07, 0.045, 0.02), INK, [-0.15, 0.13, -0.39]);
  for (const sx of [1, -1]) put(bx(0.006, 0.014, 0.01), CHR, [-0.15 + sx * 0.014, 0.13, -0.401]);
  put(bx(0.006, 0.01, 0.01), CHR, [-0.15, 0.115, -0.401]);
  for (let i = 0; i < 6; i++) {
    const v = 0.09 + i * 0.09;
    const at: V = [0, M0.y + BT[1] * v + BN[1] * 0.006, M0.z + BT[2] * v + BN[2] * 0.006];
    put(bx(0.4, 0.012, 0.012), INK, at, { dir: BN, axis: "z", up: [0, 1, 0] });
  }
  b.sweep(
    catmull([[-0.15, 0.13, -0.4], [-0.15, 0.12, -0.45], [-0.15, 0.06, -0.49], [-0.16, 0.008, -0.53], [-0.19, 0.008, -0.6], [-0.25, 0.008, -0.66]]),
    0.007,
    { color: INK, sides: 6 },
  );
  put(bx(0.03, 0.02, 0.04), INK, [-0.27, 0.011, -0.685]);
  for (const sx of [1, -1]) put(bx(0.004, 0.004, 0.02), CHR, [-0.27 + sx * 0.009, 0.011, -0.715]);

  return b.root;
}
