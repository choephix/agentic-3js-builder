import * as THREE from "three";
import { createBuilder, polyline, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Astro Grid Arcade Cabinet",
  description:
    "A 1980s upright arcade cabinet in synthwave style: neon-outlined navy sides with a striped sunset, mountains and perspective grid, a glowing sunset-grid CRT, a lit marquee, joysticks, buttons and a coin door.",
};

// Palette
const NAVY = "#14102e";
const DEEP = "#0b0820";
const PURPLE = "#241060";
const PURPLE2 = "#2b1470";
const MAGENTA = "#ff2d95";
const CYAN = "#4df3ff";
const YELLOW = "#ffd23f";
const CHROME = "#cfd3e6";
const BLACK = "#07031c";

export default function build() {
  const b = createBuilder({ name: "arcade" });

  // ---------- helpers ----------
  const box = (size: [number, number, number], color: string, at: [number, number, number], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const neonBox = (size: [number, number, number], color: string, at: [number, number, number], s = 1, opts: any = {}) =>
    glow(box(size, color, at, opts), s);
  const cyl = (r: number, h: number, color: string, at: [number, number, number], seg = 14, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, ...opts });

  // ---------- side profile (z, y) ----------
  const PROFILE: [number, number][] = [
    [-0.42, 0], [0.38, 0], [0.38, 0.8], [0.46, 0.92], [0.46, 1.0], [0.22, 1.02],
    [0.17, 1.5], [0.3, 1.54], [0.3, 1.84], [-0.28, 1.84], [-0.42, 1.7],
  ];
  const scaled = (k: number): [number, number][] =>
    PROFILE.map(([z, y]) => [z * k, 0.92 + (y - 0.92) * k] as [number, number]);

  // sun band: slice of a circle between relative heights ya..yb
  const sunBand = (cz: number, cy: number, R: number, ya: number, yb: number): [number, number][] => {
    const n = 5;
    const ys: number[] = [];
    for (let i = 0; i <= n; i++) {
      const y = ya + ((yb - ya) * i) / n;
      ys.push(Math.max(-R * 0.999, Math.min(R * 0.999, y)));
    }
    const half = (y: number) => Math.sqrt(R * R - y * y);
    const right = ys.map((y) => [cz + half(y), cy + y] as [number, number]);
    const left = ys.map((y) => [cz - half(y), cy + y] as [number, number]).reverse();
    return [...right, ...left];
  };

  // ---------- cabinet sides ----------
  for (const s of [1, -1]) {
    const X = s * 0.3;
    b.extrude(PROFILE, { at: [X, 0, 0], x: [0, 0, 1], thickness: 0.04, color: NAVY });

    // neon outlines
    for (const [k, col] of [[0.95, CYAN], [0.88, MAGENTA]] as [number, string][]) {
      const pts = scaled(k).map(([z, y]) => [s * 0.3205, y, z] as [number, number, number]);
      glow(b.sweep(polyline(pts, { closed: true }), 0.006, { color: col, sides: 6 }), 1.2);
    }

    // sunset
    const sx = s * 0.3225;
    const cz = 0.0, cy = 1.12, R = 0.2;
    const bands: [number, number, string][] = [
      [0.1, 0.2, "#ffe14d"], [0.0, 0.1, "#ffb43c"], [-0.07, -0.0, "#ff7a45"],
      [-0.13, -0.08, "#ff4d7a"], [-0.17, -0.14, MAGENTA], [-0.2, -0.18, "#d4189a"],
    ];
    for (const [ya, yb, col] of bands)
      glow(b.extrude(sunBand(cz, cy, R, ya, yb), { at: [sx, 0, 0], x: [0, 0, 1], thickness: 0.004, color: col }), 0.9);

    // mountains
    const mx = s * 0.3265;
    b.extrude([[-0.27, 0.8], [-0.12, 0.99], [0.02, 0.8]], { at: [mx, 0, 0], x: [0, 0, 1], thickness: 0.004, color: "#2a0f5a" });
    b.extrude([[-0.06, 0.8], [0.12, 0.94], [0.28, 0.8]], { at: [mx, 0, 0], x: [0, 0, 1], thickness: 0.004, color: "#3a1280" });
    b.extrude([[-0.15, 0.95], [-0.12, 0.99], [-0.09, 0.95]], { at: [s * 0.3285, 0, 0], x: [0, 0, 1], thickness: 0.003, color: "#ffd0ee" });

    // perspective grid
    for (const y of [0.78, 0.74, 0.69, 0.63, 0.56, 0.47, 0.37])
      neonBox([0.003, 0.004, 0.52], CYAN, [sx, y, 0], 0.9);
    for (const zt of [-0.26, -0.13, 0, 0.13, 0.26])
      glow(b.rod([sx, 0.8, 0], [sx, 0.33, zt * 1.0], 0.0022, { color: CYAN, sides: 4 }), 0.9);
  }

  // ---------- back ----------
  box([0.6, 1.7, 0.03], NAVY, [0, 0.85, -0.405]);
  box([0.56, 0.03, 0.2], DEEP, [0, 1.77, -0.35], { rotation: [-45, 0, 0] });
  box([0.6, 0.03, 0.58], DEEP, [0, 1.835, 0.01]);
  for (let i = 0; i < 6; i++) box([0.3, 0.012, 0.01], BLACK, [0, 1.15 + i * 0.035, -0.422]);
  neonBox([0.4, 0.01, 0.006], MAGENTA, [0, 0.5, -0.422], 0.8);
  // power cord
  b.sweep(
    polyline([[0.12, 0.2, -0.43], [0.12, 0.1, -0.5], [0.2, 0.012, -0.58], [0.3, 0.012, -0.7]] as [number, number, number][]),
    0.009, { color: BLACK, sides: 6 },
  );

  // ---------- front lower body ----------
  box([0.56, 0.8, 0.02], DEEP, [0, 0.4, 0.37]);
  box([0.6, 0.2, 0.02], "#0b0820", [0, 0.1, 0.385]);
  neonBox([0.6, 0.01, 0.01], MAGENTA, [0, 0.205, 0.393], 1.2);
  neonBox([0.6, 0.008, 0.01], CYAN, [0, 0.02, 0.393], 1);
  for (const s of [1, -1]) neonBox([0.01, 0.55, 0.01], MAGENTA, [s * 0.285, 0.5, 0.39], 1.1);

  // coin door
  box([0.2, 0.34, 0.012], "#1b1840", [0, 0.5, 0.389]);
  box([0.2, 0.012, 0.014], CYAN, [0, 0.67, 0.389], {});
  for (const s of [1, -1]) {
    neonBox([0.05, 0.07, 0.004], YELLOW, [s * 0.045, 0.57, 0.396], 0.9);
    box([0.008, 0.04, 0.003], BLACK, [s * 0.045, 0.57, 0.399]);
    cyl(0.014, 0.006, CHROME, [s * 0.045, 0.5, 0.397], 10, { dir: [0, 0, 1] });
  }
  neonBox([0.07, 0.035, 0.004], "#ff2d55", [0, 0.42, 0.396], 0.9);
  box([0.05, 0.02, 0.003], BLACK, [0, 0.42, 0.399]);
  cyl(0.012, 0.008, "#9aa0b8", [0, 0.6 - 0.07, 0.396], 8, { dir: [0, 0, 1] });

  // lip under control panel
  box([0.56, 0.144, 0.03], PURPLE2, [0, 0.86, 0.42], { rotation: [34, 0, 0] });

  // ---------- control panel ----------
  box([0.6, 0.05, 0.28], PURPLE, [0, 0.97, 0.32]);
  neonBox([0.6, 0.008, 0.008], MAGENTA, [0, 0.994, 0.46], 1.2);
  neonBox([0.5, 0.003, 0.004], CYAN, [0, 0.9965, 0.43], 1);
  neonBox([0.5, 0.003, 0.004], CYAN, [0, 0.9965, 0.2], 1);

  const stickCols = ["#ff2d55", CYAN];
  [-1, 1].forEach((s, i) => {
    const sx = s * 0.2;
    // ring + base
    glow(cyl(0.046, 0.002, MAGENTA, [sx, 0.9965, 0.33], 20), 1);
    cyl(0.032, 0.014, "#111122", [sx, 1.001, 0.33], 14);
    cyl(0.007, 0.08, CHROME, [sx, 1.045, 0.33], 8);
    b.part(new THREE.SphereGeometry(0.026, 10, 8), stickCols[i], { at: [sx, 1.09, 0.33] });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ffffff", { at: [sx - s * 0.008, 1.1, 0.34] });
    // action buttons
    const btn: [number, number, string][] = [
      [s * 0.12, 0.3, MAGENTA], [s * 0.075, 0.345, CYAN], [s * 0.1, 0.26, YELLOW],
      [s * 0.04, 0.3, "#8cff6a"],
    ];
    for (const [bx, bz, col] of btn) {
      cyl(0.023, 0.008, BLACK, [bx, 0.9985, bz], 12);
      glow(cyl(0.018, 0.012, col, [bx, 1.004, bz], 12), 0.7);
    }
    // start button
    cyl(0.017, 0.008, BLACK, [s * 0.02, 0.9985, 0.41], 10);
    glow(cyl(0.013, 0.01, i ? CYAN : "#ff2d55", [s * 0.02, 1.003, 0.41], 10), 0.9);
  });

  // ---------- monitor ----------
  const c: [number, number, number] = [0, 1.27, 0.17];
  box([0.56, 0.54, 0.06], "#0a0818", c, { rotation: [-6, 0, 0] });
  box([0.5, 0.012, 0.062], CYAN, [0, 1.275 - 0.255, 0.1995 - 0.03], { rotation: [-6, 0, 0] });

  const SCREEN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 76">
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0225"/><stop offset="0.6" stop-color="#5a0f7a"/><stop offset="1" stop-color="#ff3d8f"/></linearGradient>
      <linearGradient id="u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff2d95"/></linearGradient>
      <clipPath id="c"><rect x="0" y="0" width="92" height="44"/></clipPath>
    </defs>
    <rect width="92" height="76" fill="#12032e"/>
    <rect width="92" height="44" fill="url(#s)"/>
    <g fill="#ffffff"><circle cx="8" cy="9" r="0.5"/><circle cx="30" cy="5" r="0.4"/><circle cx="70" cy="12" r="0.5"/><circle cx="84" cy="4" r="0.4"/><circle cx="55" cy="8" r="0.4"/></g>
    <g clip-path="url(#c)">
      <circle cx="46" cy="40" r="19" fill="url(#u)"/>
      <rect x="20" y="33" width="52" height="1" fill="#7a1a80"/><rect x="20" y="36.5" width="52" height="1.5" fill="#7a1a80"/><rect x="20" y="40" width="52" height="2" fill="#7a1a80"/>
      <polygon points="0,44 14,30 26,44" fill="#2a0f5a"/><polygon points="62,44 76,28 92,44" fill="#2a0f5a"/>
    </g>
    <rect y="44" width="92" height="32" fill="#12032e"/>
    <g stroke="#4df3ff" stroke-width="0.5" fill="none">
      <path d="M0 45H92M0 47.5H92M0 51H92M0 56H92M0 63H92M0 72H92"/>
      <path d="M46 44L-40 76M46 44L-10 76M46 44L18 76M46 44L46 76M46 44L74 76M46 44L102 76M46 44L132 76"/>
    </g>
    <text x="46" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#ffffff" stroke="#ff2d95" stroke-width="0.6">INSERT COIN</text>
    <text x="4" y="7" font-family="monospace" font-size="4.5" fill="#4df3ff">1UP 004200</text>
    <text x="88" y="7" text-anchor="end" font-family="monospace" font-size="4.5" fill="#ffd23f">HI 099990</text>
    <polygon points="46,62 41,71 46,69 51,71" fill="#ffd23f" stroke="#ff2d95" stroke-width="0.6"/>
  </svg>`,
    { size: 512 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.48, 0.397), "#ffffff", {
      at: [0, 1.2733, 0.2018], rotation: [-6, 0, 0], texture: SCREEN,
    }),
    1,
  );
  // filler between monitor and marquee
  box([0.56, 0.06, 0.16], DEEP, [0, 1.53, 0.2]);

  // ---------- marquee ----------
  box([0.6, 0.3, 0.58], DEEP, [0, 1.69, 0.01]);
  const MARQ = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 52">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0536"/><stop offset="1" stop-color="#5a0f7a"/></linearGradient>
      <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.5" stop-color="#ff9ad0"/><stop offset="1" stop-color="#ff2d95"/></linearGradient>
    </defs>
    <rect width="112" height="52" fill="url(#bg)"/>
    <circle cx="56" cy="30" r="22" fill="#ff2d95" opacity="0.45"/>
    <g stroke="#4df3ff" stroke-width="0.5" opacity="0.8"><path d="M0 40H112M0 44H112M0 49H112M56 36L-10 52M56 36L20 52M56 36L56 52M56 36L92 52M56 36L122 52"/></g>
    <text x="56" y="28" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-style="italic" font-size="22" textLength="100" lengthAdjust="spacingAndGlyphs" fill="url(#t)" stroke="#07031c" stroke-width="1.6" paint-order="stroke">ASTRO GRID</text>
    <text x="56" y="12" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6" fill="#4df3ff">- 1985 -</text>
    <text x="56" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="5.5" fill="#ffd23f">1 OR 2 PLAYERS</text>
    <g fill="#ffffff"><circle cx="8" cy="8" r="0.7"/><circle cx="100" cy="10" r="0.7"/><circle cx="90" cy="20" r="0.5"/><circle cx="14" cy="22" r="0.5"/></g>
  </svg>`,
    { size: 768 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.56, 0.26), "#ffffff", { at: [0, 1.69, 0.3025], texture: MARQ }), 1);
  // marquee frame
  neonBox([0.6, 0.012, 0.012], CYAN, [0, 1.826, 0.302], 1.2);
  neonBox([0.6, 0.012, 0.012], MAGENTA, [0, 1.554, 0.302], 1.2);
  for (const s of [1, -1]) neonBox([0.012, 0.28, 0.012], CYAN, [s * 0.287, 1.69, 0.302], 1.2);
  neonBox([0.6, 0.008, 0.008], MAGENTA, [0, 1.84, 0.29], 1.1);

  return b.root;
}
