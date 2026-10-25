```ts
import * as THREE from "three";
import { createBuilder, svg, paint, catmull, countershade, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal, gaugeTexture } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Riot Interceptor RX-7",
  description: "Corporate riot-control armored interceptor with roof water cannon, tank and neon light bars, cyberpunk style.",
};

const NAVY = "#1d2338", DARK = "#0b0d16", STEEL = "#5a6178", CYAN = "#19f3ff", MAG = "#ff2bd6", RED = "#ff2a4d",
  BLUE = "#2a6bff", YEL = "#ffd21a", WHITE = "#e9f4ff";

function hazard(w: number, h: number) {
  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#ffd21a"/>`;
  for (let x = -h; x < w; x += 8) s += `<polygon points="${x},${h} ${x + 4},${h} ${x + 4 + h},0 ${x + h},0" fill="#111"/>`;
  return svg(s + `<rect width="${w}" height="${h}" fill="none" stroke="#111" stroke-width="2"/></svg>`, { size: 256 });
}
const HAZ = hazard(64, 12);
const LOGO = svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0b0d16" stroke="#19f3ff" stroke-width="5"/>
<polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="none" stroke="#ff2bd6" stroke-width="3"/>
<path d="M32 66 L50 28 L68 66 M38 54 H62" stroke="#ffd21a" stroke-width="7" fill="none" stroke-linejoin="round"/></svg>`, { size: 128 });
const SIDE = svg(`<svg viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">
<rect x="2" y="2" width="316" height="76" rx="6" fill="#0b0d16" stroke="#19f3ff" stroke-width="3"/>
<text x="16" y="38" font-family="Arial Black,sans-serif" font-weight="bold" font-size="28" fill="#ffffff">RIOT SUPPRESSION</text>
<text x="16" y="66" font-family="monospace" font-weight="bold" font-size="20" fill="#ff2bd6">KANGTAO SECURITY // UNIT 07</text>
<rect x="270" y="10" width="40" height="8" fill="#ffd21a"/><rect x="270" y="22" width="40" height="4" fill="#19f3ff"/></svg>`, { size: 512 });
const GLASS = svg(`<svg viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a4a"/><stop offset="1" stop-color="#05060d"/></linearGradient></defs>
<rect width="160" height="50" fill="url(#g)"/><path d="M0 40 L60 0 H80 L20 50 H0Z" fill="#19f3ff" opacity="0.18"/>
<path d="M10 12 H50 M10 20 H36" stroke="#19f3ff" stroke-width="1.5"/><circle cx="140" cy="12" r="5" fill="none" stroke="#ff2bd6" stroke-width="1.5"/>
<text x="100" y="44" font-family="monospace" font-size="7" fill="#19f3ff">THREAT 87%</text></svg>`, { size: 512 });
const SGLASS = svg(`<svg viewBox="0 0 110 40" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="40" fill="#07101e"/>
<path d="M0 30 L30 0 H44 L14 40 H0Z" fill="#19f3ff" opacity="0.2"/>
<path d="M0 10H110M0 20H110M0 30H110" stroke="#000" stroke-width="3"/></svg>`, { size: 256 });
const PLATE = svg(`<svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="24" rx="3" fill="#f2f2e6" stroke="#111" stroke-width="2"/>
<text x="40" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#111">NC-4471</text><rect x="2" y="2" width="76" height="4" fill="#ff2bd6"/></svg>`, { size: 128 });
const TANKL = svg(`<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="none"/>
<text x="60" y="26" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="22" fill="#19f3ff">H2O // HP</text>
<rect x="6" y="32" width="108" height="4" fill="#ffd21a"/></svg>`, { size: 256 });
const GAUGE = gaugeTexture({ needle: 70, label: "BAR" });

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const HULL = panelled(countershade("#2f3a5e", "#10142a"), { size: 0.45, rivets: 0.09 });
  const TANK = countershade("#c9d2e4", "#5b6585");
  const IRON = metal("iron");

  const box = (sz: number[], col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(sz[0], sz[1], sz[2]), col, { at, ...o });
  const cyl = (r: number, h: number, col: any, at: number[], dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at, dir });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
  const neon = (sz: number[], col: string, at: number[], k = 1.4) => glow(box(sz, col, at), k);

  // ---- hull
  b.extrude([[-2.7, 0.5], [2.75, 0.5], [2.85, 0.8], [2.8, 1.1], [1.2, 1.45], [-2.7, 1.45], [-2.76, 0.9]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.06, color: HULL });
  b.extrude([[1.1, 1.4], [0.55, 2.1], [-1.0, 2.15], [-1.2, 1.4]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: HULL });
  box([1.9, 0.12, 5.4], DARK, [0, 0.46, 0]); // skid plate
  // windshield + side glass
  plane(1.65, 0.78, GLASS, [0, 1.76, 0.83], [0, 0.62, 0.79], [0, 0.78, -0.62]);
  glow(b.part(new THREE.PlaneGeometry(1.65, 0.78), "#ffffff", { at: [0, 1.761, 0.832], dir: [0, 0.62, 0.79], axis: "z", up: [0, 0.78, -0.62], texture: GLASS }), 0.5);
  box([1.7, 0.1, 0.1], DARK, [0, 1.38, 1.12]); // wiper tray

  for (const s of [1, -1]) {
    plane(1.1, 0.4, SGLASS, [s * 0.955, 1.78, -0.05], [s, 0, 0]);
    for (let i = 0; i < 4; i++) box([0.04, 0.5, 0.05], STEEL, [s * 0.97, 1.78, -0.5 + i * 0.3]);
    box([0.04, 0.05, 1.3], STEEL, [s * 0.97, 2.03, -0.05]);
    box([0.04, 0.05, 1.3], STEEL, [s * 0.97, 1.55, -0.05]);
    // door seams, handles
    for (const z of [0.55, -1.05]) box([0.02, 0.95, 0.025], DARK, [s * 1.055, 0.98, z]);
    box([0.04, 0.05, 0.22], YEL, [s * 1.07, 1.15, 0.4]);
    box([0.02, 0.02, 4.9], DARK, [s * 1.055, 0.78, -0.1]);
    // side decals
    plane(1.6, 0.4, SIDE, [s * 1.058, 0.98, -1.8], [s, 0, 0]);
    plane(0.3, 0.3, LOGO, [s * 1.058, 0.95, 0.12], [s, 0, 0]);
    // neon
    neon([0.03, 0.04, 4.6], MAG, [s * 1.07, 0.6, -0.1]);
    neon([0.03, 0.03, 4.2], CYAN, [s * 1.07, 1.33, -0.1]);
    // mirrors
    b.rod([s * 0.95, 1.85, 0.7], [s * 1.2, 1.9, 0.8], 0.02, STEEL);
    box([0.08, 0.3, 0.2], DARK, [s * 1.22, 1.88, 0.8]);
    neon([0.02, 0.2, 0.14], CYAN, [s * 1.265, 1.88, 0.8]);
    // fenders + wheels
    for (const z of [1.9, -1.0, -2.15]) {
      box([0.5, 0.08, 1.3], DARK, [s * 1.2, 1.17, z]);
      box([0.06, 0.4, 1.3], DARK, [s * 1.43, 0.97, z]);
      const x = s * 1.17;
      cyl(0.55, 0.38, "#14151b", [x, 0.55, z], [1, 0, 0], 16);
      for (const dx of [-0.1, 0, 0.1]) cyl(0.56, 0.04, "#050507", [x + dx, 0.55, z], [1, 0, 0], 16);
      cyl(0.34, 0.4, IRON, [x, 0.55, z], [1, 0, 0], 12);
      cyl(0.14, 0.44, STEEL, [x, 0.55, z], [1, 0, 0], 8);
      glow(b.part(new THREE.TorusGeometry(0.27, 0.02, 4, 16), MAG, { at: [s * 1.375, 0.55, z], dir: [s, 0, 0], axis: "z" }), 1.4);
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        cyl(0.028, 0.05, YEL, [s * 1.385, 0.55 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], [s, 0, 0], 6);
      }
    }
    // front lights, bar guards
    neon([0.55, 0.1, 0.05], WHITE, [s * 0.7, 1.0, 2.84], 1.6);
    neon([0.3, 0.03, 0.05], CYAN, [s * 0.7, 0.9, 2.845]);
    b.rod([s * 0.85, 0.7, 3.0], [s * 0.7, 1.35, 2.75], 0.045, STEEL);
    b.rod([s * 0.4, 0.7, 3.0], [s * 0.4, 1.3, 2.78], 0.04, STEEL);
    // rear
    neon([0.6, 0.1, 0.05], RED, [s * 0.7, 1.05, -2.78], 1.6);
    cyl(0.07, 0.35, STEEL, [s * 0.55, 0.62, -2.9], [0, 0, 1], 8);
    // roof speakers, spotlights
    b.part(new THREE.ConeGeometry(0.1, 0.3, 8), STEEL, { at: [s * 0.7, 2.28, -0.95], dir: [0, 0.4, 1] });
    box([0.12, 0.12, 0.14], DARK, [s * 0.98, 1.95, 0.7]);
    neon([0.08, 0.08, 0.04], WHITE, [s * 0.98, 1.95, 0.78], 1.6);
  }

  // ---- front
  box([2.2, 0.35, 0.3], DARK, [0, 0.72, 2.95]);
  plane(2.0, 0.28, HAZ, [0, 0.72, 3.105], [0, 0, 1]);
  box([1.5, 0.35, 0.05], DARK, [0, 0.95, 2.83]);
  for (let i = 0; i < 6; i++) neon([1.4, 0.015, 0.03], i % 2 ? CYAN : MAG, [0, 0.82 + i * 0.05, 2.855], 1.0);
  plane(0.4, 0.4, LOGO, [0, 1.25, 2.0 - 0.0], [0, 0.35, 0.94], [0, 0.94, -0.35]).position.y += 0;
  for (let i = -2; i <= 2; i++) box([0.04, 0.02, 0.8], DARK, [i * 0.3, 1.38 - Math.abs(i) * 0.0, 1.8]);
  // ---- roof light bar
  box([1.8, 0.12, 0.24], DARK, [0, 2.2, 0.35]);
  for (let i = 0; i < 8; i++) neon([0.2, 0.09, 0.2], i % 2 ? BLUE : RED, [-0.77 + i * 0.22, 2.29, 0.35], 1.8);
  neon([1.4, 0.05, 0.03], WHITE, [0, 2.2, 0.48], 1.6);
  for (const s of [1, -1]) neon([0.05, 0.05, 0.2], i2(s), [s * 0.92, 2.2, 0.35], 1.6);
  function i2(s: number) { return s > 0 ? RED : BLUE; }
  // antennas
  b.rod([0.6, 2.15, -1.0], [0.75, 2.9, -1.1], [0.015, 0.008], DARK);
  b.rod([-0.6, 2.15, -1.0], [-0.55, 2.6, -1.1], [0.015, 0.008], DARK);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [0.75, 2.92, -1.1] }), 2);

  // ---- water cannon turret
  const tz = -0.3;
  b.lathe([[0, 0], [0.42, 0], [0.42, 0.08], [0.32, 0.14], [0.3, 0.22], [0, 0.22]], { at: [0, 2.12, tz], color: IRON });
  glow(b.part(new THREE.TorusGeometry(0.4, 0.015, 4, 20), CYAN, { at: [0, 2.2, tz], dir: [0, 1, 0], axis: "z" }), 1.5);
  box([0.56, 0.36, 0.7], NAVY, [0, 2.5, tz]);
  box([0.6, 0.06, 0.74], STEEL, [0, 2.7, tz]);
  for (const s of [1, -1]) {
    plane(0.22, 0.22, GAUGE, [s * 0.285, 2.52, tz - 0.12], [s, 0, 0]);
    box([0.02, 0.2, 0.3], DARK, [s * 0.285, 2.5, tz + 0.18]);
  }
  cyl(0.11, 1.5, STEEL, [0, 2.55, tz + 1.0], [0, 0, 1], 10);
  for (const z of [0.5, 1.0, 1.4]) cyl(0.125, 0.05, DARK, [0, 2.55, tz + z + 0.2], [0, 0, 1], 10);
  for (const z of [0.7, 1.2]) glow(cyl(0.118, 0.04, CYAN, [0, 2.55, tz + z + 0.2], [0, 0, 1], 10), 1.5);
  b.lathe([[0, 0], [0.13, 0], [0.13, 0.08], [0.2, 0.14], [0.2, 0.3], [0.12, 0.36], [0.09, 0.4], [0, 0.4]],
    { at: [0, 2.55, tz + 1.74], axis: [0, 0, 1], color: metal("steel") });
  box([0.12, 0.14, 0.16], DARK, [0.22, 2.64, tz - 0.05]);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0.22, 2.64, tz + 0.04] }), 2);
  plane(0.3, 0.3, LOGO, [0, 2.5, tz + 0.352], [0, 0, 1]);

  // ---- tank
  const tkz = -1.95;
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.3, 14), TANK, { at: [0, 1.95, tkz], dir: [0, 0, 1] });
  for (const e of [1, -1]) b.part(new THREE.SphereGeometry(0.5, 10, 6), TANK, { at: [0, 1.95, tkz + e * 0.65], scale: [1, 1, 0.5] });
  for (const z of [-0.5, -0.17, 0.17, 0.5]) cyl(0.515, 0.05, STEEL, [0, 1.95, tkz + z], [0, 0, 1], 14);
  for (const s of [1, -1]) {
    plane(0.9, 0.3, TANKL, [s * 0.512, 1.98, tkz], [s, 0, 0]);
    box([0.1, 0.4, 0.3], STEEL, [s * 0.35, 1.7, tkz + 0.75]);
  }
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 8), DARK, { at: [0, 2.47, tkz] });
  glow(box([0.3, 0.04, 1.0], CYAN, [0, 2.45, tkz], 1.0), 1.2);
  b.sweep(catmull([[0.2, 2.35, tkz + 0.4], [0.45, 2.5, tkz + 0.7], [0.4, 2.6, tz - 0.4], [0.1, 2.5, tz - 0.3]]), 0.04, { color: "#111318" });

  // ---- rear
  plane(0.5, 0.15, PLATE, [0, 0.95, -2.785], [0, 0, -1]);
  box([2.0, 0.3, 0.2], DARK, [0, 0.66, -2.85]);
  plane(1.9, 0.22, HAZ, [0, 0.66, -2.953], [0, 0, -1]);
  box([0.2, 0.15, 0.2], STEEL, [0, 0.6, -3.0]);

  // ---- underglow
  glow(b.part(new THREE.PlaneGeometry(1.9, 4.8), CYAN, { at: [0, 0.38, 0], dir: [0, -1, 0], axis: "z" }), 1.2);

  return b.root;
}
```