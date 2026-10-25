/*
BUILD SHEET: RG-06 "Longbow" six-wheeled railgun carrier, stabilisers deployed
Proportions: length 11.1 m (rail tip z=+6.7 to rear z=-4.4), width 6.1 m with stabiliser pads out
(hull 2.3 m, over wheels 3.5 m), height 4.6 m at the rail tip (hull roof 3.05 m). Faces +Z.
Parts:
- Chassis box 2.3x0.9x8.6 at y 1.0-1.9, sill strips, axle rods + diff spheres (3 axles, z=2.6/0.2/-2.4)
- 6 wheels: 12-sided tyre r0.65 w0.55, merged tread blocks, steel hub + drawn hub decal; fenders
- Cab: extruded side profile 2.3 wide, sloped windscreen with drawn HUD visor, vent, headlights, bumper
- Turret: extruded wedge 2.1 wide, 3.1 long, ring, side capacitor tubes, smoke launchers, hatches
- Railgun: 10 degree elevated; twin rails 0.22x0.3x8.5, glowing inner strip, 7 tapering coil rings,
  breech block, trunnion + cradle supports, muzzle brake with glowing tips
- Rear generator block with vent grilles, 2 exhaust stacks, whip antennas, tail lights
- 4 stabiliser legs (z=1.4 and -3.8, x=+-2.55): box arm, brace, hydraulic sleeve, chrome piston, pad
- Toolboxes, radar dish, beacon, tow hooks
Palette: olive camo #5a6540/#434c30/#7a7152 hull; gunmetal #2c3036 rails/frames; steel #6b727c;
 chrome #b9c0c9; tyre #17181b; hazard yellow #f2b705 / black; glow cyan #5fe8ff; warm lamp #ffd88a;
 red lamp #ff3b2e; orange beacon #ff8a1c.
Signature features: glowing twin-rail coil gun with tapering capacitor rings; deployed stabiliser
 outriggers with hydraulic pistons and hazard pads; camo-painted riveted-panel hull with drawn
 emblem, stencil and HUD visor textures.
*/
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, mottle, paint, mix } from "../../../../src/index";
import { panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "RG-06 Longbow Railgun Carrier",
  description: "Six-wheeled low-poly sci-fi military railgun carrier braced on four stabiliser legs.",
};

const GUN = "#2c3036", STEEL = "#6b727c", CHROME = "#b9c0c9", TYRE = "#17181b", HAZ = "#f2b705";
const CYAN = "#5fe8ff", LAMP = "#ffd88a", RED = "#ff3b2e", ORANGE = "#ff8a1c", DARK = "#1d2024", ACC = "#d9861c";

const CAMO = mottle(mottle("#5a6540", "#7a7152", { size: 0.9, seed: 3 }), "#434c30", { size: 0.55, seed: 8 });
const HULL = panelled(CAMO, { size: 0.9, aspect: 0.6, rivets: 0.12 });
const ROOF = paint((p, n) => mix(CAMO.at(p, n), "#8f957a", Math.max(0, n.y) * 0.25));

// ---------- textures ----------
const HAZARD = svg(`<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#f2b705"/>
${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#15161a"/>`).join("")}
<rect width="64" height="16" fill="none" stroke="#15161a" stroke-width="1.5"/></svg>`, { size: 256 });
const EMBLEM = svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="#14161a" stroke="#e8e2c8" stroke-width="3"/>
<path d="M32 10 L37 26 L54 26 L40 36 L45 52 L32 42 L19 52 L24 36 L10 26 L27 26Z" fill="#e8e2c8"/>
<path d="M8 40 L26 30 M56 40 L38 30" stroke="#d9861c" stroke-width="4" stroke-linecap="round"/><rect x="29" y="14" width="6" height="30" fill="#d9861c"/></svg>`, { size: 192 });
const STENCIL = svg(`<svg viewBox="0 0 120 32" xmlns="http://www.w3.org/2000/svg"><text x="60" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e8e2c8" stroke="#14161a" stroke-width="0.8">RG-06</text></svg>`, { size: 384 });
const VISOR = svg(`<svg viewBox="0 0 128 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5560"/><stop offset="1" stop-color="#0b161c"/></linearGradient></defs>
<rect width="128" height="40" rx="3" fill="url(#g)" stroke="#14161a" stroke-width="3"/><path d="M0 40 L50 0" stroke="#8fe6f5" stroke-opacity="0.25" stroke-width="6"/>
<path d="M14 30 H40 M88 30 H114 M64 8 V14 M56 11 H72" stroke="#5fe8ff" stroke-width="1.6" fill="none"/><circle cx="64" cy="22" r="7" fill="none" stroke="#5fe8ff" stroke-width="1.4"/><path d="M60 22 H68 M64 18 V26" stroke="#5fe8ff" stroke-width="1"/>
<rect x="2" y="17" width="3" height="3" fill="#5fe8ff"/></svg>`, { size: 384 });
const SIDEWIN = svg(`<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 2 H30 L38 22 H2Z" fill="#12222a" stroke="#14161a" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 20 L18 4 H22 L10 20Z" fill="#5fe8ff" fill-opacity="0.2"/></svg>`, { size: 160 });
const HUB = svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="31" fill="#59606a" stroke="#1a1c20" stroke-width="2"/><circle cx="32" cy="32" r="21" fill="#7b838e" stroke="#1a1c20" stroke-width="1.5"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * Math.PI) / 4; return `<circle cx="${32 + 15 * Math.cos(a)}" cy="${32 + 15 * Math.sin(a)}" r="2.6" fill="#1f2328"/>`; }).join("")}
<circle cx="32" cy="32" r="7" fill="#d9861c" stroke="#1a1c20" stroke-width="1.5"/></svg>`, { size: 128 });
const VENT = svg(`<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" rx="2" fill="#15171a" stroke="#6b727c" stroke-width="2"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="4" y="${4 + i * 4.4}" width="56" height="2.4" fill="#3b4048"/>`).join("")}</svg>`, { size: 192 });
const WARN = svg(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 3 L30 28 H2Z" fill="#f2b705" stroke="#14161a" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 11 L12 18 H16 L14 24 L21 16 H17Z" fill="#14161a"/></svg>`, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  const box = (sx: number, sy: number, sz: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at, ...o });
  const cyl = (r: number, len: number, at: number[], dir: number[], color: any, sides = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { at, dir, flat: true, ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });

  // ---------- chassis ----------
  box(2.3, 0.9, 8.6, [0, 1.45, -0.1], HULL);
  box(2.0, 0.12, 8.2, [0, 0.95, -0.1], GUN);
  for (const s of [1, -1]) {
    box(0.08, 0.16, 8.6, [s * 1.17, 1.15, -0.1], ACC);
    box(0.3, 0.6, 1.0, [s * 1.3, 1.45, -1.1], GUN);          // toolbox
    box(0.32, 0.08, 1.05, [s * 1.3, 1.78, -1.1], ACC);
    box(0.06, 0.06, 0.5, [s * 1.47, 1.5, -1.1], CHROME);
  }
  // bumper & lamps
  box(2.5, 0.35, 0.35, [0, 1.2, 4.35], GUN);
  decal(HAZARD, 2.3, 0.25, [0, 1.2, 4.53], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.18, 0.06, [s * 0.85, 1.6, 4.23], LAMP), 1.4);
    glow(box(0.3, 0.14, 0.05, [s * 1.0, 1.55, -4.42], RED), 1.4);
    b.rod([s * 0.5, 1.1, 4.5], [s * 0.5, 1.1, 4.8], 0.05, CHROME, { sides: 6 });
    box(0.2, 0.2, 0.16, [s * 0.5, 1.1, 4.85], ACC);
  }

  // ---------- wheels ----------
  const treadGeos: THREE.BufferGeometry[] = [];
  const axles = [2.6, 0.2, -2.4];
  for (const z of axles) {
    b.rod([-1.45, 0.7, z], [1.45, 0.7, z], 0.09, STEEL, { sides: 6 });
    b.part(new THREE.SphereGeometry(0.24, 8, 6), GUN, { at: [0, 0.7, z], flat: true });
    box(0.5, 0.2, 0.3, [0, 0.9, z], STEEL);
    for (const s of [1, -1]) {
      const x = s * 1.45;
      cyl(0.65, 0.55, [x, 0.7, z], [1, 0, 0], TYRE, 12);
      cyl(0.3, 0.6, [x, 0.7, z], [1, 0, 0], STEEL, 10);
      decal(HUB, 0.56, 0.56, [s * 1.755, 0.7, z], [s, 0, 0]);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.5, 0.1, 0.22);
        g.rotateX(a);
        g.translate(x, 0.7 + 0.665 * Math.cos(a), z + 0.665 * Math.sin(a));
        treadGeos.push(g);
      }
      // fender
      box(0.62, 0.08, 1.7, [x, 1.52, z], HULL);
      box(0.06, 0.2, 1.7, [s * 1.76, 1.42, z], GUN);
    }
  }
  b.part(mergeGeometries(treadGeos)!, "#25272c", { at: [0, 0, 0] });

  // ---------- cab ----------
  const cabProfile: [number, number][] = [[-0.9, 0], [1.0, 0], [1.0, 0.5], [0.45, 1.15], [-0.9, 1.15]];
  b.extrude(cabProfile, { at: [0, 1.9, 3.1], x: [0, 0, 1], thickness: 2.3, bevel: 0.04, color: HULL });
  const wn = new THREE.Vector3(0, 0.55, 0.65).normalize();
  decal(VISOR, 2.0, 0.86, [0, 2.625 + wn.y * 0.02, 3.825 + wn.z * 0.02], wn.toArray());
  decal(VENT, 1.5, 0.4, [0, 2.15, 4.105], [0, 0, 1]);
  box(2.0, 0.08, 1.3, [0, 3.07, 2.55], ROOF);
  for (const s of [1, -1]) {
    decal(SIDEWIN, 0.9, 0.55, [s * 1.16, 2.5, 3.0], [s, 0, 0]);
    box(0.06, 0.04, 0.5, [s * 1.18, 2.15, 2.65], CHROME);
    box(0.1, 0.5, 0.1, [s * 1.2, 2.6, 3.6], GUN);   // mirror stalk
    box(0.05, 0.3, 0.18, [s * 1.27, 2.7, 3.6], DARK);
  }
  glow(cyl(0.1, 0.12, [0.85, 3.17, 3.0], [0, 1, 0], ORANGE, 8), 1.6);
  // radar mast + dish
  b.rod([-0.85, 3.1, 2.6], [-0.85, 3.55, 2.6], 0.04, STEEL, { sides: 6 });
  b.lathe([[0, 0], [0.28, 0.1], [0.3, 0.13], [0.25, 0.13], [0, 0.05]], { at: [-0.85, 3.55, 2.6], axis: [0.3, 0.7, 0.55], color: CHROME, segments: 8 });
  b.rod([-0.85, 3.58, 2.6], [-0.78, 3.72, 2.76], 0.02, GUN, { sides: 5 });

  // ---------- turret ----------
  cyl(1.05, 0.14, [0, 1.97, -1.6], [0, 1, 0], GUN, 14);
  const turProfile: [number, number][] = [[-1.5, 0], [1.4, 0], [1.6, 0.4], [1.2, 0.95], [-0.6, 1.05], [-1.5, 0.8]];
  b.extrude(turProfile, { at: [0, 2.0, -1.6], x: [0, 0, 1], thickness: 2.1, bevel: 0.05, color: HULL });
  for (const s of [1, -1]) {
    cyl(0.22, 2.0, [s * 1.3, 2.25, -1.6], [0, 0, 1], GUN, 10);
    for (const z of [-2.3, -1.6, -0.9]) glow(cyl(0.235, 0.07, [s * 1.3, 2.25, z], [0, 0, 1], CYAN, 10), 1.4);
    b.part(new THREE.SphereGeometry(0.22, 8, 5), STEEL, { at: [s * 1.3, 2.25, -0.6], flat: true });
    for (const z of [-2.3, -0.9]) box(0.25, 0.1, 0.12, [s * 1.18, 2.25, z], STEEL);
    decal(EMBLEM, 0.55, 0.55, [s * 1.065, 2.74, -2.45], [s, 0, 0]);
    decal(STENCIL, 1.0, 0.27, [s * 1.065, 2.7, -1.35], [s, 0, 0]);
    decal(WARN, 0.3, 0.3, [s * 1.065, 2.55, -0.45], [s, 0, 0]);
    for (const z of [-1.0, -0.82, -0.64]) cyl(0.05, 0.4, [s * 1.12, 2.9, z], [s * 0.3, 0.8, 0.2], DARK, 6);
    cyl(0.33, 0.08, [s * 0.95, 3.07, -2.3], [0, 1, 0], STEEL, 10);
    box(0.2, 0.05, 0.05, [s * 0.95, 3.13, -2.3], ACC);
    b.rod([s * 0.95, 3.1, -2.8], [s * 1.05, 4.1, -3.0], 0.02, GUN, { sides: 4 }); // small whip
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [s * 1.05, 4.12, -3.0] }), 1.6);
  }
  box(1.6, 0.4, 0.15, [0, 2.45, -3.12], GUN);
  decal(HAZARD, 1.4, 0.2, [0, 2.45, -3.2], [0, 0, -1]);

  // ---------- railgun ----------
  const PITCH = (10 * Math.PI) / 180;
  const P0 = new THREE.Vector3(0, 3.25, -0.7);
  const D = new THREE.Vector3(0, Math.sin(PITCH), Math.cos(PITCH));
  const U = new THREE.Vector3(0, Math.cos(PITCH), -Math.sin(PITCH));
  const R = (t: number, x = 0, y = 0) => P0.clone().addScaledVector(D, t).addScaledVector(U, y).add(new THREE.Vector3(x, 0, 0));
  const gb = (sx: number, sy: number, sz: number, t: number, x: number, y: number, color: any) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: R(t, x, y), dir: D, up: [0, 1, 0], axis: "z" });

  cyl(0.25, 1.3, [0, 3.25, -0.7], [1, 0, 0], STEEL, 10);
  for (const s of [1, -1]) box(0.22, 0.45, 0.55, [s * 0.6, 3.05, -0.8], GUN);
  for (const s of [1, -1]) {
    gb(0.22, 0.3, 8.5, 2.75, s * 0.3, 0, "#3a3f47");
    gb(0.24, 0.05, 8.5, 2.75, s * 0.3, 0.165, STEEL);
  }
  glow(gb(0.16, 0.1, 7.5, 3.4, 0, 0, CYAN), 1.5);
  gb(1.1, 0.8, 0.7, -1.2, 0, 0, "#3b4048");
  gb(0.7, 0.5, 0.2, -1.62, 0, 0, ACC);
  decal(WARN, 0.01, 0.01, [0, -10, 0], [0, 1, 0]); // (keeps texture cached; hidden under floor-level? no) 
  for (let i = 0; i < 7; i++) {
    const t = 0.9 + i * 0.95, k = 1 - i * 0.045;
    gb(1.0 * k, 0.12, 0.24, t, 0, 0.3 * k, GUN);
    gb(1.0 * k, 0.12, 0.24, t, 0, -0.3 * k, GUN);
    for (const s of [1, -1]) gb(0.12, 0.72 * k, 0.24, t, s * 0.5 * k, 0, GUN);
    glow(gb(0.7 * k, 0.04, 0.26, t, 0, 0.37 * k, CYAN), 1.5);
    for (const s of [1, -1]) glow(gb(0.04, 0.4 * k, 0.26, t, s * 0.57 * k, 0, CYAN), 1.2);
  }
  gb(0.95, 0.55, 0.55, 7.25, 0, 0, STEEL);
  gb(0.5, 0.12, 0.57, 7.25, 0, 0.1, DARK);
  for (const s of [1, -1]) glow(gb(0.2, 0.26, 0.05, 7.54, s * 0.3, 0, CYAN), 2);
  gb(0.5, 0.3, 0.4, 0.2, 0, 0.45, ACC);

  // ---------- rear generator ----------
  box(2.0, 0.85, 1.2, [0, 2.325, -3.8], HULL);
  decal(VENT, 1.6, 0.6, [0, 2.3, -4.405], [0, 0, -1]);
  for (const s of [1, -1]) {
    decal(VENT, 0.9, 0.45, [s * 1.005, 2.3, -3.8], [s, 0, 0]);
    cyl(0.1, 0.65, [s * 0.6, 3.0, -4.0], [0, 1, 0], GUN, 8);
    cyl(0.12, 0.08, [s * 0.6, 3.33, -4.0], [0, 1, 0], DARK, 8);
    b.rod([s * 0.9, 2.7, -4.2], [s * 1.0, 4.9, -4.3], 0.025, GUN, { sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), RED, { at: [s * 1.0, 4.93, -4.3] }), 1.6);
    box(0.3, 0.3, 0.2, [s * 0.45, 1.65, -4.5], GUN);
  }
  box(1.2, 0.08, 0.5, [0, 2.78, -3.5], STEEL);

  // ---------- stabiliser legs ----------
  for (const s of [1, -1])
    for (const z of [1.4, -3.8]) {
      const ex = s * 2.55;
      b.rod([s * 1.1, 1.6, z], [ex, 1.6, z], 0.15, GUN, { section: "box" });
      b.rod([s * 1.15, 1.15, z], [s * 2.4, 1.5, z], 0.07, STEEL, { sides: 6 });
      box(0.5, 0.45, 0.5, [s * 1.35, 1.55, z], "#3a3f47");
      b.rod([ex, 1.75, z], [ex, 0.8, z], 0.17, STEEL, { sides: 8 });
      b.rod([ex, 0.85, z], [ex, 0.2, z], 0.1, CHROME, { sides: 8 });
      cyl(0.5, 0.15, [ex, 0.075, z], [0, 1, 0], GUN, 10);
      cyl(0.3, 0.05, [ex, 0.17, z], [0, 1, 0], ACC, 10);
      b.part(new THREE.SphereGeometry(0.14, 6, 5), STEEL, { at: [ex, 0.22, z], flat: true });
      decal(HAZARD, 0.5, 0.12, [ex, 1.0, z + 0.175], [0, 0, 1]);
    }

  return b.root;
}
