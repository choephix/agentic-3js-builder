```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, stripes } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot-Control Interceptor",
  description:
    "Armored corporate riot-suppression truck with a roof water cannon, tank, strobing light bars and neon underglow, Cyberpunk 2077 style.",
};

const CYAN = "#19f0ff";
const MAGENTA = "#ff2a9d";
const YELLOW = "#ffd400";
const RED = "#ff2030";
const BLUE = "#2a50ff";
const DARK = "#0b0d14";
const STEEL = "#4a5266";
const GUN = "#222a3c";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (w: number, h: number, l: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { at, ...o });
  const gbox = (w: number, h: number, l: number, color: string, at: number[], s = 1.3) =>
    glow(box(w, h, l, color, at), s);
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });

  // ---------- paints
  const HULL = paint((p, n) => {
    let c = mix("#141a29", "#2d3a58", smoothstep(-0.2, 1, n.y) * 0.8);
    const fz = ((p.z / 1.3) % 1 + 1) % 1;
    const fy = ((p.y / 0.55) % 1 + 1) % 1;
    if (fz < 0.012 || fz > 0.988 || fy < 0.012 || fy > 0.988) c = mix(c, "#05060a", 0.8);
    const grime = smoothstep(1.3, 0.55, p.y) * (0.35 + 0.5 * noise(p, 0.35, 3));
    c = mix(c, "#0a0a0d", Math.min(grime, 0.85));
    if (n.y > 0.7) c = mix(c, "#4a5a80", 0.25 * noise(p, 0.5, 8));
    return c;
  });
  const HAZARD = stripes(YELLOW, DARK, { size: 0.28, axis: [1, 1, 0], width: 0.5, wobble: 0 });
  const TANK = paint((p, n) => mix("#1c4fa8", "#6fb4ff", smoothstep(-0.5, 1, n.y) * 0.8 + 0.1 * noise(p, 0.2, 2)));

  // ---------- textures
  const WIND = svg(
    `<svg viewBox="0 0 190 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a3c"/><stop offset="1" stop-color="#050912"/></linearGradient></defs>
    <rect width="190" height="120" fill="url(#g)"/>
    <path d="M0 80 L70 20 L90 20 L20 120 Z" fill="#19f0ff" opacity="0.12"/>
    <path d="M10 100 H70 M120 12 H180 M130 22 H170" stroke="#19f0ff" stroke-width="2" opacity="0.8"/>
    <rect x="125" y="60" width="50" height="30" fill="none" stroke="#ff2a9d" stroke-width="2"/>
    <text x="130" y="80" font-family="monospace" font-size="12" fill="#ff2a9d">TARGET 04</text>
    <circle cx="40" cy="45" r="14" fill="none" stroke="#19f0ff" stroke-width="2"/><path d="M40 25V65M20 45H60" stroke="#19f0ff" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 180 70"><rect width="180" height="70" fill="#10141f"/>
    <rect x="0" y="0" width="180" height="8" fill="#ffd400"/><rect x="0" y="62" width="180" height="8" fill="#ffd400"/>
    <path d="M16 18 L36 18 L46 36 L36 54 L16 54 L26 36Z" fill="#ff2a9d"/>
    <text x="58" y="36" font-family="sans-serif" font-weight="bold" font-size="20" fill="#ffffff">KANGTAO</text>
    <text x="58" y="54" font-family="sans-serif" font-weight="bold" font-size="12" fill="#19f0ff">PUBLIC ORDER DIV.</text></svg>`,
    { size: 384 },
  );
  const REAR = svg(
    `<svg viewBox="0 0 180 100"><rect width="180" height="100" fill="#0b0d14"/>
    <rect x="4" y="4" width="172" height="92" fill="none" stroke="#ffd400" stroke-width="4"/>
    <text x="90" y="44" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffd400">RIOT</text>
    <text x="90" y="74" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ff2a9d">CONTROL</text></svg>`,
    { size: 256 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 100 50"><path d="M10 45 L50 25 L90 45 M10 30 L50 10 L90 30" stroke="#19f0ff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
  const TANKTAG = svg(
    `<svg viewBox="0 0 90 30"><rect width="90" height="30" fill="#0b1a33"/><text x="45" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#19f0ff">AQUA-9</text></svg>`,
    { size: 192 },
  );
  const SIDEGLASS = svg(
    `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#071622"/><path d="M0 50 L40 0 L55 0 L15 60Z" fill="#19f0ff" opacity="0.15"/><rect x="2" y="2" width="96" height="56" fill="none" stroke="#19f0ff" stroke-width="2" opacity="0.5"/></svg>`,
    { size: 128 },
  );

  // ---------- hull
  b.extrude(
    [
      [-2.7, 0.6],
      [2.8, 0.6],
      [2.8, 1.0],
      [2.6, 1.35],
      [1.4, 1.5],
      [0.4, 2.15],
      [-0.6, 2.2],
      [-2.7, 2.0],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.04, color: HULL, name: "hull" },
  );
  // chassis/floor
  box(2.0, 0.3, 5.2, DARK, [0, 0.62, 0]);
  // skirts
  for (const s of [1, -1]) {
    box(0.1, 0.28, 3.8, GUN, [s * 1.17, 0.74, 0]);
    // fender covers
    for (const z of [1.7, 0, -1.7]) box(0.7, 0.1, 1.3, GUN, [s * 1.2, 1.12, z]);
  }

  // ---------- glass
  const wn: number[] = [0, 0.84, 0.54];
  b.part(new THREE.PlaneGeometry(2.1, 1.19), "#ffffff", {
    at: [0, 1.83 + 0.011, 0.9 + 0.011],
    dir: wn,
    axis: "z",
    texture: WIND,
  });
  glow(
    box(2.1, 0.05, 0.05, CYAN, [0, 2.17, 0.38], 1.2),
    1.2,
  );
  const win = [
    [-0.2, 1.55],
    [1.1, 1.55],
    [0.85, 1.76],
    [0.3, 2.0],
    [-0.2, 2.0],
  ] as [number, number][];
  for (const s of [1, -1]) {
    b.extrude(win, { at: [s * 1.15, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, color: "#0b2233" });
    // door logo
    b.part(new THREE.PlaneGeometry(1.8, 0.7), "#ffffff", {
      at: [s * 1.162, 1.2, -1.3],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOGO,
    });
    // neon sill lines
    gbox(0.03, 0.04, 3.4, s > 0 ? MAGENTA : CYAN, [s * 1.165, 0.9, 0.0], 1.5);
    gbox(0.03, 0.04, 3.4, s > 0 ? CYAN : MAGENTA, [s * 1.165, 1.66 - 0.0, -1.3], 0.0001);
    // mirrors
    box(0.05, 0.05, 0.25, GUN, [s * 1.3, 1.55, 1.2]);
    box(0.08, 0.28, 0.2, DARK, [s * 1.4, 1.55, 1.2]);
    // wheels
    for (const z of [1.7, 0, -1.7]) {
      cyl(0.55, 0.5, 14, "#0e0f13", [s * 1.2, 0.55, z], [1, 0, 0]);
      cyl(0.3, 0.54, 10, STEEL, [s * 1.2, 0.55, z], [1, 0, 0]);
      cyl(0.08, 0.58, 8, DARK, [s * 1.2, 0.55, z], [1, 0, 0]);
      glow(
        b.part(new THREE.TorusGeometry(0.38, 0.025, 4, 16), CYAN, {
          at: [s * 1.2 + s * 0.26, 0.55, z],
          dir: [s, 0, 0],
          axis: "z",
        }),
        1.6,
      );
    }
    // headlights + taillights
    gbox(0.6, 0.12, 0.06, "#e8f6ff", [s * 0.78, 0.88, 2.81], 1.6);
    gbox(0.7, 0.07, 0.06, RED, [s * 0.7, 1.85, -2.71], 1.5);
    // antennas
    b.rod([s * 0.9, 2.2, -0.5], [s * 0.9, 3.0, -0.5], 0.015, DARK);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 0.9, 3.02, -0.5] }), 2);
    // front push-bar posts
    box(0.12, 0.5, 0.12, STEEL, [s * 0.9, 0.55, 2.8]);
    // hood neon spikes
    gbox(0.04, 0.03, 0.6, MAGENTA, [s * 0.75, 1.42, 2.0], 1.5);
  }
  // hood strip & chevrons
  gbox(1.6, 0.03, 0.06, CYAN, [0, 1.39, 2.45], 1.5);
  b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
    at: [0, 1.45, 1.95],
    dir: [0, 0.99, 0.12],
    axis: "z",
    up: [0, 0, 1],
    texture: CHEV,
  });
  glow(b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", { at: [0, 1.46, 1.95], dir: [0, 0.99, 0.12], axis: "z", up: [0, 0, 1], texture: CHEV }), 1.4);
  // visor slit
  gbox(0.8, 0.05, 0.06, CYAN, [0, 0.9, 2.81], 1.4);

  // plow
  b.extrude(
    [
      [-1.25, 0.25],
      [1.25, 0.25],
      [1.35, 0.8],
      [-1.35, 0.8],
    ],
    { at: [0, 0, 2.88], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.03, color: HAZARD, name: "plow" },
  );
  box(2.2, 0.15, 0.4, DARK, [0, 0.3, 2.9]);

  // rear
  box(2.3, 0.3, 0.2, GUN, [0, 0.75, -2.8]);
  b.part(new THREE.PlaneGeometry(1.8, 1.0), "#ffffff", { at: [0, 1.25, -2.711], dir: [0, 0, -1], axis: "z", texture: REAR });
  gbox(1.9, 0.04, 0.05, MAGENTA, [0, 0.98, -2.72], 1.5);

  // underglow
  for (const s of [1, -1]) gbox(0.06, 0.04, 3.6, MAGENTA, [s * 0.95, 0.46, 0], 1.6);
  gbox(1.7, 0.04, 0.06, CYAN, [0, 0.46, 1.8], 1.6);
  gbox(1.7, 0.04, 0.06, CYAN, [0, 0.46, -1.8], 1.6);

  // ---------- roof light bar
  box(2.0, 0.08, 0.34, DARK, [0, 2.2, 0.15]);
  for (let i = 0; i < 10; i++) {
    const x = -0.9 + i * 0.2;
    gbox(0.17, 0.14, 0.26, i === 4 || i === 5 ? "#ffffff" : i < 5 ? RED : BLUE, [x, 2.3, 0.15], 2);
  }
  box(2.0, 0.02, 0.36, STEEL, [0, 2.38, 0.15]);
  // roof vents
  for (const s of [1, -1]) box(0.4, 0.06, 0.5, GUN, [s * 0.6, 2.21, -0.35]);

  // ---------- tank
  cyl(0.5, 1.4, 12, TANK, [0, 2.5, -2.0], [0, 0, 1]);
  for (const z of [-2.65, -1.35, -2.0]) cyl(0.53, 0.06, 12, STEEL, [0, 2.5, z], [0, 0, 1]);
  for (const s of [1, -1]) {
    gbox(0.03, 0.06, 1.0, CYAN, [s * 0.505, 2.35, -2.0], 1.4);
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", { at: [s * 0.51, 2.65, -2.0], dir: [s, 0, 0], axis: "z", texture: TANKTAG });
  }
  box(0.9, 0.12, 0.9, GUN, [0, 2.1, -2.0]);

  // ---------- water cannon
  b.lathe(
    [
      [0, 0],
      [0.55, 0],
      [0.55, 0.2],
      [0.4, 0.2],
      [0, 0.2],
    ],
    { at: [0, 2.18, -0.9], color: STEEL, segments: 12 },
  );
  box(0.8, 0.45, 0.9, GUN, [0, 2.62, -0.9]);
  box(0.84, 0.08, 0.5, YELLOW, [0, 2.88, -1.0]);
  const bs = [0, 2.65, -0.5];
  const be = [0, 2.8, 1.1];
  b.rod(bs, be, 0.13, "#2f3a52", { caps: "flat" });
  for (const t of [0.2, 0.5, 0.8]) {
    const p = [0, 2.65 + 0.15 * t, -0.5 + 1.6 * t];
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10), YELLOW, { at: p, dir: [0, 0.15, 1.6] });
  }
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.2, 0.15],
      [0.25, 0.4],
      [0.17, 0.4],
      [0, 0.3],
    ],
    { at: be, axis: [0, 0.15, 1.6], color: GUN, segments: 10 },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 10), CYAN, {
      at: [0, 2.8 + 0.37 * 0.094, 1.1 + 0.37 * 0.995],
      dir: [0, 0.15, 1.6],
    }),
    2,
  );
  // hose
  b.sweep(
    [
      [0.25, 2.4, -1.4],
      [0.5, 2.8, -1.25],
      [0.15, 2.7, -1.2],
    ],
    0.05,
    { color: DARK },
  );
  // turret side lamps
  for (const s of [1, -1]) gbox(0.04, 0.1, 0.3, MAGENTA, [s * 0.41, 2.62, -0.8], 1.6);

  return b.root;
}
```