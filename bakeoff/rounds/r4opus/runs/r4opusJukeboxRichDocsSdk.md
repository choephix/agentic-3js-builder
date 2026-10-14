```ts
import * as THREE from "three";
import { createBuilder, paint, cells, grain, polyline, arc, bezier, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Starlite 1950s Diner Jukebox",
  description:
    "A walnut-and-chrome 1950s jukebox: concentric glowing arches in red, amber and teal, a glass dome over a fan of records with a picker arm and turntable, chrome selection buttons with title cards, a starburst speaker grille and a coin slot with a coin half inserted.",
};

const D2R = Math.PI / 180;
const YC = 1.08; // arch centre height
const HALF = 0.44; // half width of the cabinet

// ---------- palette ----------
const CREAM = "#f1e4c3";
const PLINTH = "#2a1710";
const BACKING = "#2b1328";
const RED_ENAMEL = "#d0202a";
const BLACK = "#121212";
const BRASS = "#c99a3c";
const COPPER = "#b8693a";

// chrome: banded studio reflections keyed on the normal, with diagonal streaks on front faces
const CHROME = paint((p, n) => {
  if (n.z > 0.85 && (((p.x + p.y * 0.7) % 0.11) + 0.11) % 0.11 < 0.022) return "#f4f8fb";
  const k = n.y * 0.9 + n.x * 0.3;
  return k > 0.55 ? "#ffffff" : k > 0.18 ? "#dde3ea" : k > -0.12 ? "#aab3be" : k > -0.45 ? "#eef2f6" : "#58616c";
});

const WOOD = grain("#5e2f16", "#7d4524", { size: 0.035, axis: "y" });

const glow = (core: string, mid: string, edge: string, bubbles: boolean) =>
  paint((p, n) => {
    if (bubbles && p.y < 1.04) {
      const c = cells(p, 0.03, 11);
      if (c.d1 < 0.0055) return core;
      if (c.d1 < 0.0078) return edge;
    }
    return n.z > 0.9 ? core : n.z > 0.45 ? mid : edge;
  });

const RED_GLOW = glow("#ffd9c4", "#ff4636", "#a8101a", false);
const AMBER_GLOW = glow("#fff6cc", "#ffb22c", "#c2640a", true);
const TEAL_GLOW = glow("#dcfff8", "#2ee0c8", "#0a7a82", false);

function vinyl(cx: number, cy: number, cz: number, flat: boolean, label: string, R: number) {
  return paint((p) => {
    const dx = p.x - cx;
    const dy = flat ? p.z - cz : p.y - cy;
    const r = Math.hypot(dx, dy);
    if (r < 0.0035) return "#080808";
    if (r < 0.022) return Math.abs(dy) < 0.0035 ? "#fff4d6" : label;
    if (r < 0.025) return "#f3ead2";
    if (r > R - 0.004) return "#0c0c0c";
    const ang = Math.atan2(dy, dx);
    const sheen = Math.abs(Math.cos(ang - 0.7)) > 0.93;
    const g = Math.floor(r / 0.005) % 2 === 0;
    return sheen ? (g ? "#4b4b55" : "#3a3a42") : g ? "#1b1b1e" : "#28282c";
  });
}

// ---------- 2D helpers ----------
function rrect2(w: number, h: number, r: number, n = 3): [number, number][] {
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, 90],
    [-w / 2 + r, -h / 2 + r, 180],
    [w / 2 - r, -h / 2 + r, 270],
  ];
  for (const [cx, cy, a0] of corners)
    for (let k = 0; k <= n; k++) {
      const a = (a0 + (90 * k) / n) * D2R;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return pts;
}

function starOutline(ro: number, ri: number, points: number): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (90 + (180 / points) * i) * D2R;
    const r = i % 2 === 0 ? ro : ri;
    out.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

function gearOutline(teeth: number, ro: number, ri: number): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    out.push([ri * Math.cos(a0), ri * Math.sin(a0)]);
    out.push([ro * Math.cos(a0 + step * 0.25), ro * Math.sin(a0 + step * 0.25)]);
    out.push([ro * Math.cos(a0 + step * 0.5), ro * Math.sin(a0 + step * 0.5)]);
    out.push([ri * Math.cos(a0 + step * 0.75), ri * Math.sin(a0 + step * 0.75)]);
  }
  return out;
}

function archPath(R: number, z: number, y0: number) {
  return polyline([
    [-R, y0, z],
    [-R, YC, z],
  ])
    .concat(arc([0, YC, z], [-R, YC, z], [0, 0, -1], 180))
    .concat(
      polyline([
        [R, YC, z],
        [R, y0, z],
      ]),
    );
}

function loopIn(center: THREE.Vector3, ex: THREE.Vector3, ey: THREE.Vector3, w: number, h: number, r: number) {
  return polyline(
    rrect2(w, h, r).map(([x, y]) => center.clone().addScaledVector(ex, x).addScaledVector(ey, y)),
    { closed: true },
  );
}

// ---------- SVG drawings ----------
function grilleSvg() {
  const W = 520;
  const H = 380;
  const cx = 260;
  const cy = 190;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#3a0a15"/>`;
  for (let y = 3; y < H; y += 7) s += `<rect x="0" y="${y}" width="${W}" height="2" fill="#57121f"/>`;
  for (let x = 3; x < W; x += 7) s += `<rect x="${x}" y="0" width="2" height="${H}" fill="#4a0f1b"/>`;
  for (let k = 0; k < 16; k++) {
    const a = (k * 22.5 + 11.25) * D2R;
    const w = 3.2 * D2R;
    const R = k % 2 ? 300 : 190;
    const p1 = `${(cx + R * Math.cos(a - w)).toFixed(1)},${(cy + R * Math.sin(a - w)).toFixed(1)}`;
    const p2 = `${(cx + R * Math.cos(a + w)).toFixed(1)},${(cy + R * Math.sin(a + w)).toFixed(1)}`;
    s += `<polygon points="${cx},${cy} ${p1} ${p2}" fill="#d49a2c"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="92" fill="none" stroke="#d49a2c" stroke-width="5"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#b07a22" stroke-width="3"/>`;
  s += `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none" stroke="#e0b048" stroke-width="6"/>`;
  return s + `</svg>`;
}

function titlesSvg() {
  const songs = [
    ["ROCKET", "ROLL"],
    ["SODA POP", "STOMP"],
    ["CHERRY", "TWIST"],
    ["NEON", "NIGHTS"],
    ["JUKE JOINT", "JIVE"],
    ["MILKSHAKE", "MAMBO"],
    ["BLUE MOON", "HOP"],
    ["CHROME", "HEART"],
    ["SATURDAY", "SPIN"],
    ["DOO-WOP", "DINER"],
  ];
  const letters = "ABCDEFGHJK";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 100"><rect width="500" height="100" fill="#1d1d22"/>`;
  songs.forEach(([a, b2], i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = 5 + col * 99;
    const y = 4 + row * 48;
    const stripe = (col + row) % 2 ? "#1a9e92" : "#c8202a";
    s += `<rect x="${x}" y="${y}" width="92" height="44" rx="3" fill="#fbf5e6"/>`;
    s += `<rect x="${x}" y="${y}" width="92" height="9" rx="2" fill="${stripe}"/>`;
    s += `<text x="${x + 46}" y="${y + 8}" font-family="Arial, Helvetica, sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">${letters[col * 2 + row]}${i + 1}</text>`;
    s += `<text x="${x + 46}" y="${y + 23}" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#2a1d1a" text-anchor="middle">${a}</text>`;
    s += `<text x="${x + 46}" y="${y + 36}" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#8a1a1f" text-anchor="middle">${b2}</text>`;
  });
  return s + `</svg>`;
}

function lettersSvg() {
  const letters = "ABCDEFGHJK";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 22"><rect width="500" height="22" rx="4" fill="#f3e8cc"/>`;
  for (let i = 0; i < 10; i++)
    s += `<text x="${25 + 50 * i}" y="17" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#b0171f" text-anchor="middle">${letters[i]}</text>`;
  return s + `</svg>`;
}

function plaqueSvg(text: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 36"><rect width="150" height="36" rx="7" fill="#b3141f"/><rect x="4" y="4" width="142" height="28" rx="5" fill="none" stroke="#f6e7c1" stroke-width="2.5"/><text x="75" y="24" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#f6e7c1" text-anchor="middle">${text}</text></svg>`;
}

const NEON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
<text x="150" y="58" font-family="'Brush Script MT', 'Segoe Script', cursive" font-style="italic" font-weight="bold" font-size="54" fill="#ff3fa4" stroke="#ff3fa4" stroke-width="7" text-anchor="middle">Starlite</text>
<text x="150" y="58" font-family="'Brush Script MT', 'Segoe Script', cursive" font-style="italic" font-weight="bold" font-size="54" fill="#fff0fb" text-anchor="middle">Starlite</text>
<polygon points="262,10 266,22 278,26 266,30 262,42 258,30 246,26 258,22" fill="#fff6b0"/>
</svg>`;

const GLASS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
<path d="M52 94 Q58 52 80 8" stroke="#ffffff" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M70 92 Q76 56 94 16" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<path d="M140 74 Q146 52 152 30" stroke="#ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
</svg>`;

const COIN_LABEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16"><text x="20" y="13" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">10¢</text></svg>`;

export default function build() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  // ---------- base ----------
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.6), PLINTH, { at: [0, 0.055, 0] });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.026, 10), CHROME, { at: [sx * 0.41, 0.013, sz * 0.26] });
  b.rod([-0.45, 0.065, 0.305], [0.45, 0.065, 0.305], 0.013, { color: CHROME, sides: 10 });

  // ---------- cabinet ----------
  const cabOutline: OutlinePoint[] = [
    [-HALF, 0.08],
    [HALF, 0.08],
  ];
  for (let k = 0; k <= 18; k++) {
    const a = 10 * k * D2R;
    cabOutline.push([HALF * Math.cos(a), YC + HALF * Math.sin(a)]);
  }
  const cabinet = b.extrude(cabOutline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.56,
    bevel: 0.025,
    color: WOOD,
    name: "cabinet",
  });
  const cabSurf = b.surface(cabinet);
  b.sweep(cabSurf.loop([0, 0.585, 0], { lift: 0.004 }), 0.007, { color: CHROME, sides: 8 });
  b.sweep(cabSurf.loop([0, 0.13, 0], { lift: 0.004 }), 0.008, { color: CHROME, sides: 8 });

  // back vents
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.5, 0.014, 0.012), "#1b0f0a", { at: [0, 0.32 + i * 0.05, -0.282] });

  // dark backing band behind the glowing arches
  const band: OutlinePoint[] = [[-HALF, 0.13]];
  for (let k = 0; k <= 18; k++) {
    const a = (180 - 10 * k) * D2R;
    band.push([HALF * Math.cos(a), YC + HALF * Math.sin(a)]);
  }
  band.push([HALF, 0.13], [0.28, 0.13]);
  for (let k = 0; k <= 18; k++) {
    const a = 10 * k * D2R;
    band.push([0.28 * Math.cos(a), YC + 0.28 * Math.sin(a)]);
  }
  band.push([-0.28, 0.13]);
  b.extrude(band, { at: [0, 0, 0.285], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, color: BACKING, name: "archBacking" });

  // ---------- glowing arches ----------
  const arches: [number, number, number, ReturnType<typeof paint>, boolean][] = [
    [0.438, 0.292, 0.01, CHROME, false],
    [0.408, 0.306, 0.021, RED_GLOW, true],
    [0.38, 0.298, 0.006, CHROME, false],
    [0.352, 0.306, 0.021, AMBER_GLOW, true],
    [0.324, 0.298, 0.006, CHROME, false],
    [0.297, 0.304, 0.017, TEAL_GLOW, true],
    [0.278, 0.295, 0.009, CHROME, false],
  ];
  for (const [R, z, r, col, isGlow] of arches) {
    b.sweep(archPath(R, z, isGlow ? 0.15 : 0.14), r, { color: col, sides: isGlow ? 10 : 8 });
    if (isGlow)
      for (const s of [1, -1])
        b.part(new THREE.CylinderGeometry(r + 0.006, r + 0.007, 0.04, 10), CHROME, { at: [s * R, 0.16, z] });
  }

  // ---------- speaker grille with starburst ----------
  const GC = new THREE.Vector3(0, 0.355, 0.297);
  b.part(new THREE.PlaneGeometry(0.52, 0.38), "#ffffff", {
    at: [0, 0.355, 0.289],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(grilleSvg(), { size: 512 }),
    name: "grille",
  });
  b.sweep(
    loopIn(new THREE.Vector3(0, 0.355, 0.292), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), 0.53, 0.39, 0.025),
    0.008,
    { color: CHROME, sides: 8 },
  );
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5 * D2R;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    let L = Math.min(Math.abs(c) > 1e-6 ? 0.245 / Math.abs(c) : 9, Math.abs(sn) > 1e-6 ? 0.175 / Math.abs(sn) : 9) - 0.014;
    if (k % 2) L = Math.min(L * 0.62, 0.15);
    const d = new THREE.Vector3(c, sn, 0);
    b.capsule(GC.clone().addScaledVector(d, 0.056), GC.clone().addScaledVector(d, L), [0.0055, 0.003], {
      color: CHROME,
      sides: 6,
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.054, 0],
      [0.054, 0.004],
      [0.04, 0.012],
      [0, 0.014],
    ],
    { at: [0, 0.355, 0.289], axis: [0, 0, 1], segments: 16, color: CHROME, name: "medallion" },
  );
  b.extrude(starOutline(0.042, 0.018, 8), {
    at: [0, 0.355, 0.306],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.002,
    color: "#e2b040",
    name: "grilleStar",
  });
  b.part(new THREE.SphereGeometry(0.014, 10, 6), RED_ENAMEL, { at: [0, 0.355, 0.311], flat: true });

  // ---------- coin entry and plaques ----------
  b.extrude(rrect2(0.1, 0.062, 0.012), {
    at: [0, 0.585, 0.293],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    color: CHROME,
    name: "coinPlate",
  });
  b.part(new THREE.BoxGeometry(0.006, 0.034, 0.006), BLACK, { at: [-0.02, 0.59, 0.3] });
  b.sweep(
    loopIn(new THREE.Vector3(-0.02, 0.59, 0.301), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), 0.016, 0.046, 0.006),
    0.0025,
    { color: CHROME, sides: 6 },
  );
  b.part(new THREE.CylinderGeometry(0.0115, 0.0115, 0.002, 14), "#d2d6da", { at: [-0.02, 0.597, 0.302], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.009, 0.0095, 0.008, 10), RED_ENAMEL, { at: [0.024, 0.574, 0.303], dir: [0, 0, 1] });
  b.part(new THREE.PlaneGeometry(0.04, 0.016), "#2a2a2a", {
    at: [0.024, 0.6, 0.3015],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(COIN_LABEL_SVG, { size: 128 }),
  });
  for (const [x, text] of [
    [-0.16, "SELECT · PLAY"],
    [0.16, "6 PLAYS 25¢"],
  ] as [number, string][])
    b.part(new THREE.PlaneGeometry(0.15, 0.036), "#ffffff", {
      at: [x, 0.585, 0.299],
      dir: [0, 0, 1],
      axis: "z",
      texture: svg(plaqueSvg(text), { size: 256 }),
    });

  // ---------- selection desk ----------
  b.extrude(
    [
      [0, 0],
      [0.11, 0],
      [0.11, 0.03],
      [0.04, 0.24],
      [0, 0.24],
    ],
    { at: [0, 0.62, 0.26], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.53, bevel: 0.008, color: CREAM, name: "desk" },
  );
  b.rod([-0.264, 0.636, 0.372], [0.264, 0.636, 0.372], 0.009, { color: CHROME, sides: 8 });
  const P1 = new THREE.Vector3(0, 0.65, 0.37);
  const P2 = new THREE.Vector3(0, 0.86, 0.3);
  const E2 = P2.clone().sub(P1).normalize();
  const NS = new THREE.Vector3(0, -E2.z, E2.y);
  const EX = new THREE.Vector3(1, 0, 0);
  const slant = (x: number, u: number, off: number) =>
    new THREE.Vector3(x, 0, 0).add(P1.clone().lerp(P2, u)).addScaledVector(NS, off);

  b.part(new THREE.PlaneGeometry(0.5, 0.1), "#ffffff", {
    at: slant(0, 0.73, 0.002),
    dir: NS,
    up: E2,
    axis: "z",
    texture: svg(titlesSvg(), { size: 1024 }),
    name: "titleCards",
  });
  b.sweep(loopIn(slant(0, 0.73, 0.004), EX, E2, 0.515, 0.115, 0.012), 0.005, { color: CHROME, sides: 6 });
  b.part(new THREE.PlaneGeometry(0.5, 0.02), "#ffffff", {
    at: slant(0, 0.4, 0.002),
    dir: NS,
    up: E2,
    axis: "z",
    texture: svg(lettersSvg(), { size: 512 }),
  });
  for (let i = 0; i < 10; i++) {
    const x = -0.225 + 0.05 * i;
    for (const [u, cap] of [
      [0.255, "#f6efdc"],
      [0.095, "#d22a2a"],
    ] as [number, string][]) {
      b.part(new THREE.CylinderGeometry(0.016, 0.017, 0.012, 10), CHROME, { at: slant(x, u, 0.004), dir: NS });
      b.part(new THREE.CylinderGeometry(0.011, 0.012, 0.008, 10), cap, { at: slant(x, u, 0.013), dir: NS, flat: true });
    }
  }

  // ---------- window chamber ----------
  const winOutline: OutlinePoint[] = [
    [-0.275, 0.88],
    [0.275, 0.88],
  ];
  for (let k = 0; k <= 12; k++) {
    const a = 15 * k * D2R;
    winOutline.push([0.275 * Math.cos(a), YC + 0.275 * Math.sin(a)]);
  }
  const winPaint = paint((p) => {
    const c = cells(p, 0.04, 9);
    if (c.d1 < 0.004) return "#d6ecff";
    const d = Math.hypot(p.x, p.y - 1.0);
    const ray = Math.abs(Math.cos(Math.atan2(p.y - 0.93, p.x) * 8)) > 0.86;
    const base = d < 0.1 ? "#3f6f8f" : d < 0.17 ? "#2c4f72" : d < 0.24 ? "#1f3858" : "#152540";
    return ray && d > 0.1 ? (d < 0.17 ? "#35608a" : "#24426a") : base;
  });
  b.extrude(winOutline, { at: [0, 0, 0.284], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: winPaint, name: "windowBack" });
  b.rod([-0.28, 0.875, 0.296], [0.28, 0.875, 0.296], 0.008, { color: CHROME, sides: 8 });
  b.part(new THREE.PlaneGeometry(0.3, 0.08), "#ffffff", {
    at: [0, 1.275, 0.291],
    dir: [0, 0, 1],
    axis: "z",
    texture: svg(NEON_SVG, { size: 512 }),
    name: "neonSign",
  });

  // carousel rail with indicator lamps
  const rail = arc(
    [0, 0.93, 0.336],
    [-0.29 * Math.sin(62 * D2R), 0.93 + 0.29 * Math.cos(62 * D2R), 0.336],
    [0, 0, -1],
    124,
  );
  b.sweep(rail, 0.005, { color: CHROME, sides: 6 });
  b.along(rail, 9, (pt) => b.part(new THREE.SphereGeometry(0.008, 8, 6), "#ffcf5a", { at: pt }));

  // fan of records
  const labels = ["#e8392f", "#f2b632", "#21b8a8", "#f4e9cf", "#ff7a2a", "#3a78d8", "#e85aa0"];
  for (let i = 0; i < 7; i++) {
    const a = (-54 + 18 * i) * D2R;
    const cx = 0.2 * Math.sin(a);
    const cy = 0.93 + 0.2 * Math.cos(a);
    const cz = 0.33 - 0.007 * Math.abs(i - 3);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.004, 24), vinyl(cx, cy, cz, false, labels[i], 0.075), {
      at: [cx, cy, cz],
      dir: [0, 0, 1],
      name: `record${i + 1}`,
    });
  }

  // picker mechanism: gears, arm, gripper on the centre record
  b.extrude(gearOutline(14, 0.036, 0.029), {
    at: [-0.2, 0.93, 0.299],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: BRASS,
    name: "gearBig",
  });
  b.extrude(gearOutline(9, 0.022, 0.016), {
    at: [-0.144, 0.915, 0.291],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: COPPER,
    name: "gearSmall",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10), CHROME, { at: [-0.2, 0.93, 0.305], dir: [0, 0, 1] });
  b.sweep(bezier([-0.2, 0.93, 0.312], [-0.19, 1.06, 0.35], [-0.07, 1.0, 0.345], [0, 1.03, 0.336]), [0.008, 0.006], {
    color: CHROME,
    sides: 8,
  });
  b.part(new THREE.BoxGeometry(0.024, 0.012, 0.026), CHROME, { at: [0, 1.033, 0.33] });
  for (const dz of [-0.0065, 0.0065])
    b.part(new THREE.BoxGeometry(0.016, 0.028, 0.004), CHROME, { at: [0, 1.055, 0.33 + dz] });
  b.part(new THREE.SphereGeometry(0.006, 8, 6), RED_ENAMEL, { at: [0, 1.024, 0.344] });

  // turntable with the playing record
  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.06, 0.01],
      [0.05, 0.022],
      [0, 0.022],
    ],
    { at: [0, 0.884, 0.34], segments: 16, color: CHROME, name: "turntableBase" },
  );
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.008, 24), "#2c2c30", { at: [0, 0.909, 0.34] });
  b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.003, 24), vinyl(0, 0.9145, 0.34, true, "#e8392f", 0.067), {
    at: [0, 0.9145, 0.34],
    name: "playingRecord",
  });
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.014, 6), CHROME, { at: [0, 0.92, 0.34] });

  // tone arm
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.022, 0.008],
      [0.012, 0.016],
      [0.008, 0.04],
      [0, 0.04],
    ],
    { at: [0.12, 0.884, 0.38], segments: 12, color: CHROME, name: "toneArmBase" },
  );
  b.sweep(
    polyline([
      [0.12, 0.93, 0.38],
      [0.07, 0.932, 0.396],
      [0.03, 0.93, 0.376],
    ]),
    0.0045,
    { color: CHROME, sides: 6 },
  );
  b.part(new THREE.BoxGeometry(0.014, 0.008, 0.022), CHROME, { at: [0.026, 0.925, 0.37] });
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.018, 10), "#3a3a40", { at: [0.142, 0.93, 0.374], dir: [1, 0, -0.3] });

  // glass dome: highlight streaks on a front half-ellipsoid, the glass itself clear
  b.part(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI, 0, 136 * D2R), "#e2f4ff", {
    at: [0, YC, 0.284],
    scale: [0.27, 0.27, 0.2],
    texture: svg(GLASS_SVG, { size: 256 }),
    name: "glassDome",
  });

  // ---------- crown fin ----------
  b.extrude(
    [
      [-0.22, -0.01],
      [0.16, -0.01],
      [0.2, 0.012],
      [0.06, 0.032],
      [-0.1, 0.09],
      [-0.2, 0.07],
    ],
    { at: [0, 1.515, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: CHROME, name: "crownFin" },
  );
  b.part(new THREE.SphereGeometry(0.014, 10, 6), RED_ENAMEL, { at: [0, 1.522, 0.205], flat: true });

  // ---------- sides: porthole lights and speed lines ----------
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0.062, 0],
        [0.086, 0],
        [0.086, 0.01],
        [0.072, 0.02],
        [0.062, 0.014],
      ],
      { at: [s * 0.44, 1.02, 0], axis: [s, 0, 0], segments: 18, color: CHROME, name: `porthole${s > 0 ? "L" : "R"}` },
    );
    const sideGlow = paint((p) => {
      const d = Math.hypot(p.y - 1.02, p.z);
      const ray = Math.abs(Math.cos(Math.atan2(p.y - 1.02, p.z) * 4)) > 0.9;
      return d < 0.02 ? "#fff3c4" : ray ? "#ffd970" : d < 0.042 ? "#ffc43d" : "#e07a12";
    });
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.012, 16), sideGlow, { at: [s * 0.444, 1.02, 0], dir: [s, 0, 0] });
    b.extrude(starOutline(0.026, 0.011, 4), {
      at: [s * 0.453, 1.02, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.006,
      color: CHROME,
    });
    [0.36, 0.3, 0.24].forEach((L, i) => {
      const y = 0.3 + i * 0.045;
      b.capsule([s * 0.446, y, 0.2], [s * 0.446, y, 0.2 - L], 0.008, { color: CHROME, sides: 8 });
      b.part(new THREE.SphereGeometry(0.012, 8, 6), RED_ENAMEL, { at: [s * 0.447, y, 0.21], flat: true });
    });
  }

  return b.root;
}
```