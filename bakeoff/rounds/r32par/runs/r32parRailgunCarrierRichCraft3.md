```ts
import * as THREE from "three";
import { createBuilder, svg, paint, noise, mix, smoothstep, mottle, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a pitched twin-rail railgun, glowing coil rings, and four deployed hydraulic stabiliser legs.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- palette ----------
  const STEEL = "#6b727d";
  const DARKSTEEL = "#2f343c";
  const CHROME = "#b9c2cc";
  const BLACK = "#17181b";
  const TIRE = "#1d1e21";
  const OLIVE = "#56613f";
  const CYAN = "#58f0ff";
  const AMBER = "#ffb02e";
  const RED = "#ff3b2e";
  const GREEN = "#6dff7a";

  const CAMO = paint((p, n) => {
    const v = noise(p, 0.8, 4);
    const c = v < 0.38 ? "#3f4a35" : v < 0.7 ? "#5a6646" : "#7b7a55";
    const dirt = smoothstep(1.4, 0.8, p.y) * 0.55 * (0.5 + noise(p, 0.25, 9));
    const lit = mix(c, "#4b4234", dirt);
    return mix(lit, "#b4bb98", 0.14 * smoothstep(0.4, 1, n.y));
  });
  const METAL = mottle("#444b55", "#626b77", { size: 0.5, seed: 3 });

  // ---------- textures ----------
  let stripesSvg = "";
  for (let k = 0; k < 5; k++) stripesSvg += `<path d="M${-32 + k * 28} 64 L${k * 28} 0 L${k * 28 + 14} 0 L${-18 + k * 28} 64Z" fill="#141414"/>`;
  const HAZARD = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f2c200"/>${stripesSvg}</svg>`, { size: 96 });
  const ROUNDEL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14181a"/><circle cx="32" cy="32" r="25" fill="#d9d4bd"/><circle cx="32" cy="32" r="19" fill="#2c3a2a"/><path d="M32 12 L37 26 L52 26 L40 35 L45 50 L32 41 L19 50 L24 35 L12 26 L27 26Z" fill="#d9d4bd" stroke="#14181a" stroke-width="2"/></svg>`,
    { size: 160 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 80 32"><rect width="80" height="32" rx="3" fill="#d8d2bd" stroke="#14181a" stroke-width="3"/><text x="40" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19" fill="#1b1f22">RG-06</text></svg>`,
    { size: 192 },
  );
  const WINDSHIELD = svg(
    `<svg viewBox="0 0 100 56"><rect width="100" height="56" fill="#0f1822" stroke="#14181a" stroke-width="5"/><rect x="6" y="6" width="88" height="44" fill="#2a4d63"/><path d="M12 50 L38 6 L50 6 L24 50Z" fill="#8fc7de" opacity="0.8"/><path d="M58 50 L76 6 L82 6 L64 50Z" fill="#8fc7de" opacity="0.6"/><rect x="48" y="4" width="4" height="48" fill="#14181a"/></svg>`,
    { size: 192 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#14181a"/><rect x="4" y="4" width="56" height="24" fill="#2a4d63"/><path d="M8 28 L26 4 L34 4 L16 28Z" fill="#8fc7de" opacity="0.8"/></svg>`,
    { size: 128 },
  );
  let bars = "";
  for (let i = 0; i < 6; i++) bars += `<rect x="6" y="${8 + i * 8}" width="68" height="4" fill="#3f4650"/>`;
  const GRILLE = svg(`<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#15171a" stroke="#050506" stroke-width="3"/>${bars}</svg>`, { size: 128 });
  let slats = "";
  for (let i = 0; i < 9; i++) slats += `<rect x="4" y="${4 + i * 6}" width="72" height="3" fill="#050607"/>`;
  const VENTS = svg(`<svg viewBox="0 0 80 58"><rect width="80" height="58" fill="#2b3037" stroke="#111" stroke-width="3"/>${slats}</svg>`, { size: 128 });
  const WARN = svg(
    `<svg viewBox="0 0 64 56"><path d="M32 3 L61 53 L3 53Z" fill="#f2c200" stroke="#141414" stroke-width="5" stroke-linejoin="round"/><rect x="29" y="20" width="6" height="17" fill="#141414"/><rect x="29" y="41" width="6" height="6" fill="#141414"/></svg>`,
    { size: 96 },
  );
  let rings = "";
  for (let i = 0; i < 6; i++) rings += `<circle cx="${10 + i * 20}" cy="10" r="7" fill="none" stroke="#e8e2c8" stroke-width="3"/><circle cx="${10 + i * 20}" cy="10" r="2.5" fill="#e8e2c8"/>`;
  const KILLS = svg(`<svg viewBox="0 0 120 20">${rings}</svg>`, { size: 192 });

  // ---------- helpers ----------
  const box = (size: V, at: V, color: any, opt: any = {}) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: V, dir: any, color: any, opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, ...opt });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, opt: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...opt });
  const bolt = (at: V, dir: V, r = 0.04) => cyl(r, r, 0.05, 6, at, dir, CHROME);

  // ---------- hull ----------
  b.extrude(
    [[-4.4, 0.85], [4.6, 0.85], [4.6, 1.7], [4.2, 1.9], [-4.2, 1.9], [-4.4, 1.7]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.05, color: CAMO },
  );
  // belly skid plate and axles
  box([2.0, 0.12, 8.2], [0, 0.82, 0], DARKSTEEL);
  const AX = [3.0, 0.8, -1.4];
  for (const z of AX) {
    box([3.0, 0.22, 0.24], [0, 0.74, z], DARKSTEEL);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), STEEL, { at: [0, 0.74, z] });
  }

  // wheels
  const wheel = (s: number, z: number) => {
    const cx = s * 1.45;
    cyl(0.7, 0.7, 0.55, 14, [cx, 0.74, z], [1, 0, 0], TIRE, { flat: true });
    for (let i = 0; i < 14; i++) {
      const th = (i / 14) * 360;
      const r = (th * Math.PI) / 180;
      box([0.52, 0.1, 0.22], [cx, 0.74 + Math.cos(r) * 0.73, z + Math.sin(r) * 0.73], "#101113", { rotation: [th, 0, 0] });
    }
    cyl(0.44, 0.44, 0.6, 10, [cx, 0.74, z], [1, 0, 0], STEEL, { flat: true });
    cyl(0.2, 0.24, 0.68, 8, [cx, 0.74, z], [1, 0, 0], "#c98a2c");
    for (let i = 0; i < 6; i++) {
      const r = (i / 6) * Math.PI * 2;
      bolt([s * 1.77, 0.74 + Math.cos(r) * 0.3, z + Math.sin(r) * 0.3], [s, 0, 0], 0.045);
    }
    // fender
    box([0.78, 0.1, 1.75], [cx, 1.55, z], CAMO);
    box([0.1, 0.22, 1.75], [s * 1.84, 1.45, z], CAMO);
  };
  for (const s of [1, -1]) for (const z of AX) wheel(s, z);

  // ---------- cab ----------
  b.extrude(
    [[2.2, 1.9], [4.3, 1.9], [4.3, 2.5], [3.6, 3.15], [2.4, 3.15], [2.2, 2.9]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.05, color: CAMO },
  );
  box([2.2, 0.1, 1.4], [0, 3.2, 3.0], METAL);
  plane(1.7, 0.95, WINDSHIELD, [0, 2.835, 3.964], [0, 0.73, 0.68]);
  for (const s of [1, -1]) {
    plane(1.0, 0.5, SIDEWIN, [s * 1.12, 2.65, 3.1], [s, 0, 0]);
    // mirrors
    b.rod([s * 1.1, 2.7, 4.05], [s * 1.5, 2.8, 4.15], 0.025, { color: DARKSTEEL });
    box([0.08, 0.32, 0.22], [s * 1.52, 2.8, 4.15], BLACK);
    // exhaust stacks
    cyl(0.1, 0.1, 1.1, 8, [s * 0.95, 2.45, 1.95], [0, 1, 0], DARKSTEEL);
    cyl(0.14, 0.14, 0.08, 8, [s * 0.95, 3.02, 1.95], [0, 1, 0], BLACK);
    // headlights and front
    glow(box([0.42, 0.2, 0.1], [s * 0.85, 1.35, 4.62], "#fff4c0"), 1.4);
    box([0.5, 0.3, 0.06], [s * 0.85, 1.35, 4.6], BLACK);
    // tail lights
    glow(box([0.26, 0.2, 0.1], [s * 0.95, 1.45, -4.45], RED), 1.3);
    // tool bins on deck
    box([0.5, 0.3, 1.0], [s * 0.8, 2.05, 1.4], CAMO);
    bolt([s * 0.8, 2.21, 1.1], [0, 1, 0]);
    bolt([s * 0.8, 2.21, 1.7], [0, 1, 0]);
  }
  // light bar
  box([1.3, 0.1, 0.22], [0, 3.31, 3.4], BLACK);
  for (const x of [-0.5, 0, 0.5]) glow(box([0.3, 0.1, 0.2], [x, 3.38, 3.4], AMBER), 1.3);
  // antennas
  b.spike([0.8, 3.2, 2.5], [0, 1, 0], 1.6, 0.025, { color: BLACK });
  b.spike([-0.8, 3.2, 2.5], [0.1, 1, 0], 1.0, 0.025, { color: BLACK });
  // front bumper + grille
  box([2.4, 0.36, 0.3], [0, 1.0, 4.75], "#f2c200", { texture: HAZARD });
  plane(0.9, 0.55, GRILLE, [0, 1.4, 4.62], [0, 0, 1]);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.3, 6, [s * 0.5, 0.78, 4.7], [0, 0, 1], CHROME);
  // rear
  box([2.4, 0.3, 0.3], [0, 1.0, -4.55], DARKSTEEL);
  plane(1.6, 0.6, VENTS, [0, 1.35, -4.41], [0, 0, -1]);
  cyl(0.1, 0.1, 0.3, 8, [0, 0.85, -4.7], [0, 0, 1], CHROME);

  // hull side decals
  for (const s of [1, -1]) {
    plane(0.8, 0.8, ROUNDEL, [s * 1.12, 1.4, -0.3], [s, 0, 0]);
    plane(0.9, 0.36, LABEL, [s * 1.12, 1.4, 1.5], [s, 0, 0]);
    plane(0.5, 0.44, WARN, [s * 1.12, 1.4, -3.4], [s, 0, 0]);
  }

  // ---------- turret ----------
  cyl(1.2, 1.3, 0.2, 12, [0, 2.0, -1.0], [0, 1, 0], DARKSTEEL);
  b.extrude(
    [[-2.3, 2.1], [1.0, 2.1], [1.0, 2.55], [0.3, 2.95], [-1.7, 2.95], [-2.3, 2.6]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.05, color: CAMO },
  );
  for (const s of [1, -1]) {
    plane(0.9, 0.15, KILLS, [s * 1.02, 2.5, -0.9], [s, 0, 0]);
    plane(0.5, 0.44, WARN, [s * 1.02, 2.5, -1.8], [s, 0, 0]);
    // cheeks and trunnions
    box([0.3, 1.0, 1.6], [s * 0.85, 3.45, -1.4], CAMO);
    cyl(0.22, 0.22, 0.36, 8, [s * 1.0, 3.86, -1.4], [1, 0, 0], STEEL);
    // sensors
    b.part(new THREE.SphereGeometry(0.22, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [s * 0.7, 2.95, 0.35] });
    glow(box([0.08, 0.08, 0.08], [s * 0.9, 2.98, -2.1], s > 0 ? GREEN : RED), 1.5);
    // capacitor drums
    cyl(0.35, 0.35, 1.4, 10, [s * 0.7, 2.6, -3.6], [0, 1, 0], STEEL, { flat: true });
    glow(cyl(0.37, 0.37, 0.1, 10, [s * 0.7, 2.6, -3.6], [0, 1, 0], CYAN), 1.6);
    cyl(0.37, 0.37, 0.1, 10, [s * 0.7, 3.25, -3.6], [0, 1, 0], DARKSTEEL);
    cyl(0.37, 0.37, 0.1, 10, [s * 0.7, 1.98, -3.6], [0, 1, 0], DARKSTEEL);
    b.sweep(
      catmull([[s * 0.7, 3.3, -3.6], [s * 0.8, 3.75, -3.4], [s * 0.5, 3.9, -3.0], [s * 0.3, 3.75, -2.75]]),
      0.05,
      { color: BLACK, sides: 6 },
    );
  }

  // ---------- railgun ----------
  const ang = (8 * Math.PI) / 180;
  const d: V = [0, Math.sin(ang), Math.cos(ang)];
  const O: V = [0, 3.75, -2.2];
  const along = (t: number, lat = 0, dy = 0): V => [lat, O[1] + d[1] * t + dy, O[2] + d[2] * t];

  b.part(new THREE.BoxGeometry(1.3, 0.95, 2.6), CAMO, { at: along(1.2), dir: d, axis: "z" });
  b.part(new THREE.BoxGeometry(1.1, 1.1, 0.9), METAL, { at: along(-0.5), dir: d, axis: "z" });
  glow(b.part(new THREE.BoxGeometry(0.5, 0.12, 0.08), CYAN, { at: along(-0.5, 0, 0.56), dir: d, axis: "z" }), 1.5);
  // rails
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.26, 0.3, 6.0), STEEL, { at: along(4.7, s * 0.3), dir: d, axis: "z" });
    b.part(new THREE.BoxGeometry(0.08, 0.34, 6.0), CHROME, { at: along(4.7, s * 0.3, 0.0), dir: d, axis: "z" });
  }
  glow(b.part(new THREE.BoxGeometry(0.2, 0.06, 5.7), CYAN, { at: along(4.6), dir: d, axis: "z" }), 1.6);
  // coil rings
  for (let i = 0; i < 8; i++) {
    const t = 2.9 + i * 0.58;
    b.lathe([[0.46, -0.12], [0.62, -0.12], [0.62, 0.12], [0.46, 0.12]], { at: along(t), axis: d, segments: 8, color: DARKSTEEL });
    glow(b.lathe([[0.6, -0.035], [0.65, -0.035], [0.65, 0.035], [0.6, 0.035]], { at: along(t), axis: d, segments: 8, color: CYAN }), 1.7);
  }
  // muzzle shroud
  b.lathe([[0.4, -0.2], [0.7, -0.2], [0.7, 0.2], [0.4, 0.2]], { at: along(7.55), axis: d, segments: 8, color: STEEL });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.16, 0.5, 0.4), DARKSTEEL, { at: along(7.55, s * 0.45), dir: d, axis: "z" });
  // elevation rams
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 3.0, -0.6], [s * 0.5, 3.55, 0.17], 0.09, { color: CHROME });
    cyl(0.14, 0.14, 0.5, 8, [s * 0.5, 3.12, -0.5], [0, 0.6, 0.6], DARKSTEEL);
  }

  // ---------- stabiliser legs ----------
  const leg = (s: number, z: number) => {
    const x = s * 2.4;
    box([1.35, 0.32, 0.45], [s * 1.75, 1.25, z], CAMO);
    plane(1.0, 0.36, HAZARD, [s * 1.75, 1.42, z], [0, 1, 0], { up: [1, 0, 0] });
    cyl(0.22, 0.22, 1.0, 8, [x, 1.3, z], [0, 1, 0], DARKSTEEL);
    cyl(0.12, 0.12, 0.85, 8, [x, 0.5, z], [0, 1, 0], CHROME);
    b.part(new THREE.SphereGeometry(0.17, 6, 4), STEEL, { at: [x, 0.22, z] });
    cyl(0.5, 0.62, 0.16, 8, [x, 0.08, z], [0, 1, 0], DARKSTEEL, { flat: true });
    for (const a of [0, 120, 240]) {
      const r = (a * Math.PI) / 180;
      box([0.08, 0.14, 0.3], [x + Math.sin(r) * 0.3, 0.22, z + Math.cos(r) * 0.3], STEEL, { rotation: [0, a, 0] });
    }
    b.rod([s * 1.1, 1.8, z], [s * 2.3, 1.0, z], 0.07, { color: STEEL });
    b.sweep(catmull([[s * 1.1, 1.55, z + 0.2], [s * 1.7, 1.78, z + 0.25], [x, 1.6, z + 0.12]]), 0.035, { color: BLACK, sides: 6 });
    glow(box([0.08, 0.08, 0.08], [x, 1.85, z + 0.2], AMBER), 1.4);
  };
  for (const s of [1, -1]) for (const z of [1.9, -2.8]) leg(s, z);

  return b.root;
}
```