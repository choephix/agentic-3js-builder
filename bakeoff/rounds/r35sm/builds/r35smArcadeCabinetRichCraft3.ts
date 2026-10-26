import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description:
    "A 1980s upright arcade cabinet in synthwave style: neon-edged sun side art, glowing marquee and CRT screen, coin door, joystick and buttons.",
};

const DEG = Math.PI / 180;
const DEEP = "#120629";
const PURPLE = "#3b1670";
const MAG = "#ff2e9a";
const CYAN = "#2ff3ff";
const YEL = "#ffd23f";
const ORANGE = "#ff7a2f";
const BLACK = "#0a0414";

export default function build() {
  const b = createBuilder({ name: "arcade" });

  // ---------- paints ----------
  const bodyPaint = paint((p) => {
    const base = mix(DEEP, PURPLE, smoothstep(0, 1.7, p.y));
    return mix(base, BLACK, noise(p, 0.05, 3) * 0.35);
  });
  const sidePaint = paint((p, n, s) => {
    if (Math.abs(n.x) < 0.5) return BLACK;
    const [z, y] = s;
    const base = mix(DEEP, "#4a1a80", smoothstep(0, 1.8, y));
    const d = Math.hypot(z + 0.02, y - 1.0);
    if (d < 0.27) {
      const t = (y - 0.73) / 0.54;
      const slit = y < 0.98 && (y * 100) % 4.5 < (1 - t) * 3.2;
      if (!slit) return mix(MAG, YEL, Math.min(Math.max(t, 0), 1));
    }
    if (d < 0.285 && d >= 0.27) return CYAN;
    const yy = y + 0.18 * z;
    if (y < 0.62) {
      if (Math.abs(yy - 0.42) < 0.014) return CYAN;
      if (Math.abs(yy - 0.47) < 0.014) return MAG;
      if (Math.abs(yy - 0.52) < 0.014) return ORANGE;
    }
    if (y > 1.25 && noise(p, 0.035, 8) > 0.74) return "#ffffff";
    return base;
  });

  // ---------- textures ----------
  const INV = ["..x.....x..", "...x...x...", "..xxxxxxx..", ".xx.xxx.xx.", "xxxxxxxxxxx", "x.xxxxxxx.x", "x.x.....x.x", "...xx.xx..."];
  const invader = (x: number, y: number, s: number, c: string) => {
    let d = "";
    INV.forEach((row, j) => {
      for (let i = 0; i < row.length; i++)
        if (row[i] === "x") d += `M${(x + i * s).toFixed(2)} ${(y + j * s).toFixed(2)}h${s}v${s}h${-s}z`;
    });
    return `<path d="${d}" fill="${c}"/>`;
  };
  let aliens = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++) aliens += invader(6 + c * 8, 6 + r * 4.2, 0.55, [MAG, CYAN, YEL][r]);
  let gridLines = "";
  for (let i = -9; i <= 9; i++) gridLines += `<line x1="25" y1="23" x2="${25 + i * 7}" y2="38" stroke="${CYAN}" stroke-width="0.25"/>`;
  for (let k = 1; k <= 6; k++) {
    const y = 23 + 15 * (k / 6) ** 2;
    gridLines += `<line x1="0" y1="${y.toFixed(2)}" x2="50" y2="${y.toFixed(2)}" stroke="${MAG}" stroke-width="0.3"/>`;
  }
  let slits = "";
  for (let k = 0; k < 5; k++) slits += `<rect x="14" y="${(19 + k * 0.9).toFixed(2)}" width="22" height="${(0.15 + k * 0.17).toFixed(2)}" fill="#3a0c52"/>`;
  const SCREEN = svg(
    `<svg viewBox="0 0 50 38" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0320"/><stop offset="1" stop-color="#6a1280"/></linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${YEL}"/><stop offset="1" stop-color="${MAG}"/></linearGradient>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
    </defs>
    <rect width="50" height="23" fill="url(#sky)"/>
    <rect y="23" width="50" height="15" fill="#12062a"/>
    <circle cx="25" cy="23" r="10" fill="url(#sun)"/>${slits}
    <path d="M0 23 L6 17 L10 20 L15 14 L20 23 M30 23 L36 15 L41 20 L45 16 L50 23" fill="#1d0640" stroke="${CYAN}" stroke-width="0.35"/>
    ${gridLines}${aliens}
    <path d="M22 35 h6 l-1 -1.6 h-1 l-1 -2 l-1 2 h-1z" fill="${CYAN}"/>
    <rect x="24.8" y="26" width="0.5" height="3" fill="#fff"/>
    <text x="2" y="3" font-family="monospace" font-weight="bold" font-size="2.6" fill="${CYAN}">1UP 004200</text>
    <text x="48" y="3" text-anchor="end" font-family="monospace" font-weight="bold" font-size="2.6" fill="${MAG}">HI 099999</text>
    <rect width="50" height="38" fill="url(#vig)"/>
    </svg>`,
    { size: 512 },
  );
  const MARQUEE = svg(
    `<svg viewBox="0 0 62 22" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14052e"/><stop offset="1" stop-color="#6a1280"/></linearGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${YEL}"/><stop offset="1" stop-color="${MAG}"/></linearGradient></defs>
    <rect width="62" height="22" fill="url(#m)"/>
    <circle cx="31" cy="22" r="14" fill="url(#s)"/>
    <rect x="0" y="15" width="62" height="0.8" fill="#14052e"/><rect x="0" y="17.5" width="62" height="1.3" fill="#14052e"/><rect x="0" y="20" width="62" height="2" fill="#14052e"/>
    <g fill="#fff"><circle cx="6" cy="4" r="0.4"/><circle cx="14" cy="8" r="0.3"/><circle cx="52" cy="5" r="0.4"/><circle cx="57" cy="10" r="0.3"/><circle cx="45" cy="3" r="0.3"/><circle cx="20" cy="3" r="0.3"/></g>
    <text x="32.2" y="13.2" text-anchor="middle" font-family="Impact, sans-serif" font-style="italic" font-weight="bold" font-size="10" fill="${MAG}">STAR RUNNER</text>
    <text x="31" y="12" text-anchor="middle" font-family="Impact, sans-serif" font-style="italic" font-weight="bold" font-size="10" fill="#fff" stroke="${CYAN}" stroke-width="0.5">STAR RUNNER</text>
    <text x="31" y="19.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="2.6" fill="${CYAN}">1 OR 2 PLAYERS</text>
    </svg>`,
    { size: 512 },
  );
  const FRONT = svg(
    `<svg viewBox="0 0 65 78" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1670"/><stop offset="1" stop-color="#120629"/></linearGradient></defs>
    <rect width="65" height="78" fill="url(#f)"/>
    <path d="M0 8 L65 8 M0 11 L65 11" stroke="${MAG}" stroke-width="0.8"/><path d="M0 14 L65 14" stroke="${CYAN}" stroke-width="0.8"/>
    <rect x="21" y="21" width="23" height="32" rx="2" fill="#1b1b28" stroke="#8d93a8" stroke-width="1.2"/>
    <rect x="24" y="25" width="17" height="3" rx="1" fill="#05050a"/><rect x="24" y="31" width="17" height="3" rx="1" fill="#05050a"/>
    <rect x="25" y="38" width="6" height="8" rx="1" fill="#c8cddc"/><rect x="34" y="38" width="6" height="8" rx="1" fill="#c8cddc"/>
    <text x="32.5" y="50.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="3" fill="${YEL}">25c</text>
    <text x="32.5" y="63" text-anchor="middle" font-family="Impact, sans-serif" font-style="italic" font-size="6" fill="${CYAN}">INSERT COIN</text>
    <path d="M4 70 L61 70" stroke="${MAG}" stroke-width="0.8"/>
    <path d="M4 20 L16 20 L16 60 L4 60 Z M49 20 L61 20 L61 60 L49 60 Z" fill="none" stroke="${CYAN}" stroke-width="0.6"/>
    <g stroke="${MAG}" stroke-width="0.4"><path d="M7 26 h6 M7 32 h6 M7 38 h6 M7 44 h6 M7 50 h6 M52 26 h6 M52 32 h6 M52 38 h6 M52 44 h6 M52 50 h6"/></g>
    </svg>`,
    { size: 512 },
  );
  const DECK = svg(
    `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0840"/><stop offset="1" stop-color="#4a1a80"/></linearGradient></defs>
    <rect width="64" height="24" fill="url(#d)"/>
    <rect x="1.5" y="1.5" width="61" height="21" rx="2" fill="none" stroke="${CYAN}" stroke-width="0.7"/>
    <circle cx="16" cy="13" r="8" fill="none" stroke="${MAG}" stroke-width="0.7"/><circle cx="16" cy="13" r="4.5" fill="none" stroke="${MAG}" stroke-width="0.4"/>
    <text x="16" y="5.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="2.4" fill="${YEL}">PLAYER 1</text>
    <text x="44" y="5.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="2.4" fill="${YEL}">FIRE</text>
    <path d="M32 3 L32 21" stroke="${MAG}" stroke-width="0.4" stroke-dasharray="1 1"/>
    <path d="M36 21 h24" stroke="${CYAN}" stroke-width="0.4"/>
    </svg>`,
    { size: 512 },
  );

  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });

  // ---------- body ----------
  const profile: [number, number][] = [
    [-0.4, 0], [0.4, 0], [0.4, 0.78], [0.5, 0.9], [0.5, 1.02], [0.28, 1.06], [0.34, 1.5],
    [0.4, 1.56], [0.4, 1.82], [-0.3, 1.82], [-0.3, 1.2], [-0.4, 1.0],
  ];
  for (const s of [1, -1])
    b.extrude(profile, { at: [s * 0.34, 0, 0], x: [0, 0, 1], thickness: 0.03, color: sidePaint, name: "side" });

  // neon edge lines on both sides
  for (const s of [1, -1])
    profile.forEach((p, i) => {
      const q = profile[(i + 1) % profile.length];
      glow(b.capsule([s * 0.358, p[1], p[0]], [s * 0.358, q[1], q[0]], 0.006, { color: i % 2 ? MAG : CYAN, sides: 6 }), 1.3);
    });

  // front lower panel + art
  box(0.65, 0.78, 0.02, bodyPaint, [0, 0.39, 0.39]);
  b.part(new THREE.PlaneGeometry(0.65, 0.78), "#ffffff", { at: [0, 0.39, 0.4015], texture: FRONT });
  // coin slots glow
  for (const x of [-0.04, 0.04]) glow(b.part(new THREE.BoxGeometry(0.03, 0.012, 0.004), "#ff3030", { at: [x * 0.7, 0.575, 0.404] }), 1);
  glow(b.part(new THREE.BoxGeometry(0.03, 0.012, 0.004), YEL, { at: [0.045, 0.575, 0.404] }), 1);
  glow(b.capsule([-0.3, 0.05, 0.407], [0.3, 0.05, 0.407], 0.007, { color: CYAN, sides: 6 }), 1.4);
  glow(b.capsule([-0.3, 0.075, 0.407], [0.3, 0.075, 0.407], 0.004, { color: MAG, sides: 6 }), 1.4);

  // control panel lip and deck
  box(0.65, 0.156, 0.03, "#c01a7a", [0, 0.84, 0.45], [39.8, 0, 0]);
  glow(b.capsule([-0.3, 0.915, 0.5], [0.3, 0.915, 0.5], 0.006, { color: CYAN, sides: 6 }), 1.3);
  const TH = 10 * DEG;
  const dN = new THREE.Vector3(0, Math.cos(TH), Math.sin(TH));
  const dB = new THREE.Vector3(0, Math.sin(TH), -Math.cos(TH));
  const deckC = new THREE.Vector3(0, 1.02, 0.39);
  box(0.65, 0.04, 0.24, bodyPaint, [0, 1.02, 0.39], [10, 0, 0]);
  const deckPt = (u: number, v: number, h: number) =>
    deckC.clone().addScaledVector(dN, 0.02 + h).addScaledVector(dB, v).add(new THREE.Vector3(u, 0, 0));
  b.part(new THREE.PlaneGeometry(0.62, 0.23), "#ffffff", {
    at: deckPt(0, 0, 0.002),
    dir: dN,
    axis: "z",
    up: dB,
    texture: DECK,
  });
  // joystick
  const jx = 0.16;
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.01, 10), BLACK, { at: deckPt(jx, 0.005, 0.005), dir: dN });
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.08, 6), "#cfd3e0", { at: deckPt(jx, 0.005, 0.045), dir: dN });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), "#ff2244", { at: deckPt(jx, 0.005, 0.09) });
  // buttons (player's right = world -X, so fire buttons at -x)
  const cols = [MAG, CYAN, YEL, ORANGE, "#7dff6a", "#ffffff"];
  let k = 0;
  for (const v of [0.035, -0.035])
    for (const u of [-0.07, -0.16, -0.25]) {
      const c = cols[k++ % cols.length];
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.008, 10), BLACK, { at: deckPt(u, v + 0.0, 0.004), dir: dN });
      glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 10), c, { at: deckPt(u, v, 0.012), dir: dN }), 0.7);
    }
  for (const [u, c] of [[0.0, CYAN], [-0.01, MAG]] as [number, string][]) {
    if (c === MAG) continue;
    glow(b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 8), c, { at: deckPt(u + 0.02, -0.095, 0.008), dir: dN }), 0.9);
  }
  glow(b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 8), MAG, { at: deckPt(-0.03, -0.095, 0.008), dir: dN }), 0.9);

  // monitor bezel and screen
  const a2 = Math.atan2(0.06, 0.44);
  const len2 = Math.hypot(0.06, 0.44);
  const n2 = new THREE.Vector3(0, -Math.sin(a2), Math.cos(a2));
  const mc = new THREE.Vector3(0, 1.28, 0.31);
  const bezelC = mc.clone().addScaledVector(n2, -0.005);
  box(0.65, len2, 0.03, "#07030f", [bezelC.x, bezelC.y, bezelC.z], [a2 / DEG, 0, 0]);
  const scrC = mc.clone().addScaledVector(n2, 0.0112);
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.38), "#ffffff", {
      at: [scrC.x, scrC.y + 0.0, scrC.z],
      rotation: [a2 / DEG, 0, 0],
      texture: SCREEN,
    }),
    1,
  );
  // screen frame neon
  const fr = (u: number, v: number) => {
    const up = new THREE.Vector3(0, Math.cos(a2), Math.sin(a2));
    return mc.clone().addScaledVector(n2, 0.014).addScaledVector(up, v).add(new THREE.Vector3(u, 0, 0)).toArray();
  };
  const fc: [number, number][] = [[-0.265, -0.2], [0.265, -0.2], [0.265, 0.2], [-0.265, 0.2]];
  fc.forEach((p, i) => {
    const q = fc[(i + 1) % 4];
    glow(b.capsule(fr(p[0], p[1]), fr(q[0], q[1]), 0.004, { color: MAG, sides: 6 }), 1.2);
  });

  // marquee
  box(0.65, 0.26, 0.7, bodyPaint, [0, 1.69, 0.05]);
  box(0.65, 0.07, 0.08, BLACK, [0, 1.53, 0.37]);
  glow(b.part(new THREE.PlaneGeometry(0.62, 0.22), "#ffffff", { at: [0, 1.69, 0.4025], texture: MARQUEE }), 1.1);
  const mr: [number, number][] = [[-0.315, 1.575], [0.315, 1.575], [0.315, 1.805], [-0.315, 1.805]];
  mr.forEach((p, i) => {
    const q = mr[(i + 1) % 4];
    glow(b.capsule([p[0], p[1], 0.406], [q[0], q[1], 0.406], 0.006, { color: i % 2 ? MAG : CYAN, sides: 6 }), 1.4);
  });

  // back
  box(0.65, 1.1, 0.02, bodyPaint, [0, 0.55, -0.39]);
  box(0.65, 0.23, 0.02, bodyPaint, [0, 1.1, -0.35], [26.6, 0, 0]);
  box(0.65, 0.65, 0.02, bodyPaint, [0, 1.5, -0.29]);
  box(0.65, 0.02, 0.7, bodyPaint, [0, 1.81, 0.05]);
  // back vent glow slits
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.BoxGeometry(0.3, 0.01, 0.004), i % 2 ? MAG : CYAN, { at: [0, 0.55 + i * 0.05, -0.401] }), 0.8);

  return b.root;
}
