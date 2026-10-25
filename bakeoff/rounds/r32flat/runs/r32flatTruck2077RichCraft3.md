```ts
import * as THREE from "three";
import { createBuilder, svg, patches, stripes, scales, catmull } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ares-77 Armored Cyber Truck",
  description:
    "Low-poly cyberpunk militarized 6x6 truck from 2077: wedge-armored cab, turreted railgun, missile pods, radar, neon underglow, rigged wheels, turret and guns.",
};

// ---- palette
const NEON_C = "#19f0ff";
const NEON_M = "#ff2bd6";
const AMBER = "#ffb020";
const RED = "#ff2a3a";
const WHITE = "#eaffff";
const DARK = "#12151b";
const DARK2 = "#1b2029";
const STEEL = "#4a5262";
const BLACK = "#08090c";
const YEL = "#f4c20d";

// ---- textures
const GLASS = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06232c"/><stop offset="1" stop-color="#0b6a7a"/></linearGradient></defs>
  <rect width="100" height="40" fill="url(#g)"/>
  <polygon points="10,40 30,0 42,0 22,40" fill="#ffffff" opacity="0.18"/><polygon points="50,40 62,0 68,0 56,40" fill="#ffffff" opacity="0.12"/>
  <path d="M4 8 H30 M4 12 H20 M70 30 H96 M80 34 H96" stroke="#19f0ff" stroke-width="1.4" fill="none"/>
  <circle cx="78" cy="14" r="7" fill="none" stroke="#ff2bd6" stroke-width="1.4"/><path d="M78 4 V24 M68 14 H88" stroke="#ff2bd6" stroke-width="1"/>
  <text x="6" y="36" font-family="monospace" font-size="5" fill="#19f0ff">TGT LOCK // 2077</text>
  <rect x="0" y="0" width="100" height="40" fill="none" stroke="#02090c" stroke-width="3"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#14001f" stroke="#ff2bd6" stroke-width="5"/>
  <polygon points="50,16 82,34 82,66 50,84 18,66 18,34" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <path d="M30 40 L50 28 L70 40 M30 52 L50 40 L70 52" stroke="#ffb020" stroke-width="5" fill="none" stroke-linejoin="round"/>
  <text x="50" y="76" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#eaffff">77</text></svg>`,
  { size: 192 },
);
const UNIT = svg(
  `<svg viewBox="0 0 220 50"><rect x="2" y="2" width="216" height="46" fill="#0a0c10" opacity="0.85" stroke="#ffb020" stroke-width="2"/>
  <path d="M6 44 L22 6 M20 44 L36 6 M34 44 L50 6" stroke="#f4c20d" stroke-width="7"/>
  <text x="62" y="30" font-family="monospace" font-weight="bold" font-size="22" fill="#ffb020">ARES-77 // HAUL</text>
  <text x="62" y="43" font-family="monospace" font-size="9" fill="#19f0ff">NEO-TOKYO ARMED LOGISTICS DIV.</text></svg>`,
  { size: 512 },
);
const PLATE = svg(
  `<svg viewBox="0 0 100 50"><rect x="2" y="2" width="96" height="46" rx="6" fill="#e9e6d0" stroke="#111" stroke-width="3"/>
  <text x="50" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#111">NX-2077</text>
  <text x="50" y="44" text-anchor="middle" font-family="monospace" font-size="7" fill="#c0188f">NEO CITY</text></svg>`,
  { size: 128 },
);
const RIM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#394050" stroke="#0b0d11" stroke-width="3"/>
  <circle cx="50" cy="50" r="36" fill="#1c212b" stroke="#19f0ff" stroke-width="2"/>
  <path d="M50 50 L50 8 M50 50 L90 37 M50 50 L75 85 M50 50 L25 85 M50 50 L10 37" stroke="#59627a" stroke-width="9"/>
  <circle cx="50" cy="50" r="13" fill="#2c3240" stroke="#0b0d11" stroke-width="2"/>
  <g fill="#f4c20d"><circle cx="50" cy="38" r="2.6"/><circle cx="61" cy="46" r="2.6"/><circle cx="57" cy="59" r="2.6"/><circle cx="43" cy="59" r="2.6"/><circle cx="39" cy="46" r="2.6"/></g></svg>`,
  { size: 192 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#021016" stroke="#19f0ff" stroke-width="3"/>
  <polyline points="6,40 20,30 32,36 46,16 60,28 74,12 94,22" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <polyline points="6,50 24,46 40,52 58,42 80,48 94,40" fill="none" stroke="#ff2bd6" stroke-width="2"/>
  <circle cx="86" cy="10" r="4" fill="#ff2a3a"/><text x="8" y="12" font-family="monospace" font-size="8" fill="#19f0ff">SYS OK</text></svg>`,
  { size: 192 },
);

// ---- paints
const CAMO = patches("#27303b", ["#34413f", "#1d242e", "#3a3f4c"], { size: 0.55, gap: 0.02, seed: 3 });
const HULLP = panelled(CAMO, { size: 0.45, aspect: 0.6, rivets: 0.07 });
const TIRE = scales("#17191f", "#0a0b0d", { size: 0.13, seed: 5 });
const HAZ = stripes("#14161a", "#f4c20d", { size: 0.14, axis: [1, 0, 1], width: 0.5, wobble: 0.05 });
const GUNM = metal("iron", { polish: 0.5 });
const STEELP = metal("steel", { tarnish: 0.4 });

export default function build() {
  const b = createBuilder({ name: "ares77", paintSize: 2048 });
  const hull = b.joint("hull", { at: [0, 1.2, 0] });

  type O = { bone?: any; rot?: [number, number, number]; dir?: number[]; axis?: "x" | "y" | "z"; tex?: any; seg?: number; rt?: number };
  const place = (at: number[], o: O) => {
    const opt: any = { at, bone: o.bone ?? hull };
    if (o.rot) opt.rotation = o.rot;
    if (o.dir) opt.dir = o.dir;
    if (o.axis) opt.axis = o.axis;
    if (o.tex) opt.texture = o.tex;
    return opt;
  };
  const bx = (w: number, h: number, d: number, color: any, at: number[], o: O = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, place(at, o));
  const cy = (r: number, h: number, color: any, at: number[], o: O = {}) =>
    b.part(new THREE.CylinderGeometry(o.rt ?? r, r, h, o.seg ?? 10), color, place(at, o));
  const ball = (r: number, color: any, at: number[], o: O = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, place(at, o));
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], bone?: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone: bone ?? hull });
  const gl = <T,>(p: T, s = 1.2) => glow(p as any, s) as T;

  // ================= chassis & body
  bx(2.0, 0.2, 6.0, DARK, [0, 0.75, 0]);
  b.part(new THREE.BoxGeometry(2.3, 0.9, 6.9), HULLP, { at: [0, 1.25, 0.05], bone: hull });
  // frame rails & leaf springs
  for (const s of [1, -1]) {
    bx(0.12, 0.16, 6.4, STEEL, [s * 0.75, 0.62, 0]);
    for (const z of [2.4, -0.4, -2.1]) bx(0.12, 0.08, 1.2, DARK2, [s * 0.8, 0.5, z]);
  }
  // underglow strips
  for (const s of [1, -1]) {
    gl(bx(0.04, 0.05, 5.6, NEON_C, [s * 1.165, 0.87, 0]), 1.6);
    gl(bx(0.04, 0.05, 5.6, NEON_M, [s * 1.165, 0.8, 0]), 1.2);
  }

  // ================= cab
  const cab = b.extrude(
    [
      [0.85, 1.7],
      [3.5, 1.7],
      [3.5, 2.1],
      [2.75, 2.2],
      [2.15, 2.85],
      [0.95, 2.85],
      [0.85, 2.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: HULLP, bone: hull },
  );
  void cab;
  // windshield + side windows
  gl(
    b.part(new THREE.PlaneGeometry(2.0, 0.8), "#ffffff", {
      at: [0, 2.525 + 0.012 * 0.678, 2.45 + 0.012 * 0.734],
      dir: [0, 0.678, 0.734],
      axis: "z",
      texture: GLASS,
      bone: hull,
    }),
    0.5,
  );
  for (const s of [1, -1]) {
    gl(decal(GLASS, 1.2, 0.5, [s * 1.162, 2.45, 1.6], [s, 0, 0]), 0.45);
    decal(EMBLEM, 0.42, 0.42, [s * 1.163, 1.93, 1.55], [s, 0, 0]);
    // door seams, handle, mirror
    bx(0.03, 0.9, 0.03, BLACK, [s * 1.16, 2.2, 0.95]);
    bx(0.03, 0.9, 0.03, BLACK, [s * 1.16, 2.2, 2.25]);
    bx(0.05, 0.05, 0.3, AMBER, [s * 1.17, 2.05, 1.0]);
    b.rod([s * 1.15, 2.5, 2.2], [s * 1.5, 2.55, 2.3], 0.025, DARK2, { bone: hull });
    bx(0.08, 0.3, 0.2, DARK, [s * 1.52, 2.5, 2.3]);
    gl(bx(0.02, 0.22, 0.16, NEON_C, [s * 1.565, 2.5, 2.3]), 1);
  }
  // windshield visor & roof gear
  bx(2.3, 0.06, 0.35, DARK, [0, 2.88, 2.12], { rot: [-42, 0, 0] });
  b.part(new THREE.BoxGeometry(2.1, 0.1, 1.3), STEELP, { at: [0, 2.9, 1.5], bone: hull });
  gl(bx(0.8, 0.07, 0.12, RED, [0.5, 2.98, 2.0]), 1.8);
  gl(bx(0.8, 0.07, 0.12, "#2a6bff", [-0.5, 2.98, 2.0]), 1.8);
  bx(0.3, 0.2, 0.3, DARK, [0, 3.0, 1.2]);
  gl(cy(0.1, 0.06, WHITE, [0, 3.12, 1.2]), 1.5);
  // hood vents, grille, headlights
  for (let i = 0; i < 5; i++) gl(bx(0.5, 0.02, 0.05, AMBER, [(i - 2) * 0.35 * 0.0 + (i % 2 ? 0.35 : -0.35), 2.115, 2.8 + i * 0.12]), 1);
  bx(1.4, 0.4, 0.06, DARK, [0, 1.9, 3.52]);
  for (let i = 0; i < 4; i++) gl(bx(1.25, 0.02, 0.02, NEON_C, [0, 1.76 + i * 0.1, 3.555]), 1.2);
  for (const s of [1, -1]) {
    gl(bx(0.34, 0.15, 0.06, WHITE, [s * 0.95, 1.92, 3.52]), 2);
    bx(0.4, 0.04, 0.08, DARK, [s * 0.95, 2.03, 3.52]);
    bx(0.06, 0.12, 0.5, DARK2, [s * 1.18, 2.15, 3.2]);
  }

  // ================= ram wedge & front
  b.extrude(
    [
      [-1.3, 0],
      [1.3, 0],
      [0.9, 0.55],
      [-0.9, 0.55],
    ],
    { at: [0, 0.8, 3.5], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.4, color: HAZ, bone: hull },
  );
  gl(bx(1.5, 0.04, 0.04, NEON_M, [0, 1.1, 4.04]), 2);
  cy(0.12, 2.0, DARK, [0, 1.2, 3.6], { dir: [1, 0, 0], seg: 8 }); // winch drum
  for (const s of [1, -1]) {
    cy(0.04, 0.5, STEEL, [s * 0.5, 1.45, 3.65], { dir: [0, 1, 0], seg: 6 });
    gl(ball(0.06, AMBER, [s * 1.35, 1.0, 3.7]), 1.5);
  }

  // ================= wheels
  const wheelJoints: any[] = [];
  let wi = 0;
  for (const s of [1, -1]) {
    for (const z of [2.4, -0.4, -2.1]) {
      const wj = b.joint(`wheel${s > 0 ? "L" : "R"}${(wi++ % 3) + 1}`, { parent: hull, at: [s * 1.45, 0.62, z], dir: [1, 0, 0] });
      wheelJoints.push(wj);
      const at = [s * 1.45, 0.62, z];
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 14), TIRE, { at, dir: [1, 0, 0], bone: wj });
      cy(0.4, 0.58, STEELP, at, { dir: [1, 0, 0], bone: wj, seg: 12 });
      decal(RIM, 0.8, 0.8, [s * 1.45 + s * 0.3, 0.62, z], [s, 0, 0], wj);
      gl(
        b.part(new THREE.TorusGeometry(0.43, 0.025, 4, 16), NEON_C, { at: [s * 1.45 + s * 0.29, 0.62, z], dir: [s, 0, 0], axis: "z", bone: wj }),
        1.4,
      );
      // fender, flap
      bx(0.8, 0.12, 1.6, HULLP, [s * 1.45, 1.38, z]);
      bx(0.05, 0.28, 1.6, DARK, [s * 1.86, 1.28, z]);
      gl(bx(0.04, 0.04, 1.5, NEON_M, [s * 1.89, 1.42, z]), 1.3);
      bx(0.6, 0.45, 0.05, BLACK, [s * 1.45, 0.95, z - 0.78]);
      // axle stub
      cy(0.1, 1.3, DARK2, [s * 0.8, 0.62, z], { dir: [1, 0, 0], seg: 6 });
    }
  }
  for (const z of [2.4, -0.4, -2.1]) ball(0.22, STEEL, [0, 0.62, z]);

  // ================= fuel tanks & flank gear
  cy(0.3, 1.0, metal("copper", { tarnish: 0.5 }), [1.45, 0.95, 1.0], { dir: [0, 0, 1], seg: 10 });
  for (const dz of [-0.35, 0.35]) cy(0.31, 0.06, DARK, [1.45, 0.95, 1.0 + dz], { dir: [0, 0, 1], seg: 10 });
  bx(0.5, 0.45, 0.9, DARK2, [-1.45, 0.95, 1.0]);
  gl(bx(0.04, 0.3, 0.6, NEON_C, [-1.71, 0.95, 1.0]), 1.4);
  for (const s of [1, -1]) bx(0.3, 0.06, 0.5, STEEL, [s * 1.4, 1.3, 1.0]);

  // ================= cargo container
  b.part(new THREE.BoxGeometry(2.3, 0.8, 3.8), HULLP, { at: [0, 2.1, -1.5], bone: hull });
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) bx(0.06, 0.72, 0.12, DARK2, [s * 1.18, 2.1, -3.2 + i * 0.5]);
    decal(UNIT, 2.0, 0.455, [s * 1.215, 2.1, -1.0], [s, 0, 0]);
    gl(decal(SCREEN, 0.5, 0.3, [s * 1.215, 2.25, -2.6], [s, 0, 0]), 1);
    bx(0.12, 0.1, 3.8, HAZ, [s * 1.1, 2.55, -1.5]);
    for (let i = 0; i < 3; i++) gl(bx(0.03, 0.03, 0.4, NEON_M, [s * 1.19, 1.8, -3.0 + i * 0.7]), 1.3);
  }
  // rear: door lines, lights, plate, bumper, thrusters
  bx(0.05, 0.75, 0.04, BLACK, [0, 2.1, -3.41]);
  gl(bx(2.0, 0.1, 0.03, RED, [0, 1.5, -3.41]), 1.8);
  bx(2.4, 0.35, 0.3, HAZ, [0, 1.0, -3.55]);
  decal(PLATE, 0.5, 0.25, [0, 1.35, -3.43], [0, 0, -1]);
  cy(0.07, 0.25, DARK, [0, 0.9, -3.8], { dir: [0, 0, 1], seg: 8 }); // hitch
  ball(0.1, STEEL, [0, 0.9, -3.95]);
  for (const s of [1, -1]) {
    cy(0.16, 0.4, DARK, [s * 0.7, 0.8, -3.6], { dir: [0, 0, 1], seg: 8 });
    gl(cy(0.12, 0.05, NEON_C, [s * 0.7, 0.8, -3.82], { dir: [0, 0, 1], seg: 8 }), 2);
    // roll cage
    b.rod([s * 1.0, 2.5, -3.3], [s * 1.0, 3.1, -3.3], 0.04, STEEL, { bone: hull });
  }
  b.rod([1.0, 3.1, -3.3], [-1.0, 3.1, -3.3], 0.04, STEEL, { bone: hull });
  gl(bx(0.2, 0.08, 0.1, RED, [0, 3.18, -3.3]), 2);

  // ================= exhaust stacks (between cab and bed)
  for (const s of [1, -1]) {
    cy(0.09, 1.7, STEELP, [s * 1.0, 2.55, 0.62], { seg: 8 });
    cy(0.13, 0.08, DARK, [s * 1.0, 3.42, 0.62], { seg: 8 });
    gl(cy(0.08, 0.02, AMBER, [s * 1.0, 3.47, 0.62], { seg: 8 }), 1.6);
    for (const y of [2.0, 2.6]) cy(0.115, 0.08, DARK2, [s * 1.0, y, 0.62], { seg: 8 });
  }

  // ================= turret
  const turret = b.joint("turret", { parent: hull, at: [0, 2.5, -1.4], dir: [0, 1, 0] });
  cy(0.75, 0.15, STEELP, [0, 2.575, -1.4], { bone: turret, seg: 12 });
  b.extrude(
    [
      [-0.75, 0],
      [0.55, 0],
      [0.8, 0.22],
      [0.5, 0.6],
      [-0.55, 0.6],
      [-0.75, 0.38],
    ],
    { at: [0, 2.65, -1.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.1, color: HULLP, bone: turret },
  );
  for (const s of [1, -1]) {
    decal(EMBLEM, 0.4, 0.4, [s * 0.556, 2.95, -1.4], [s, 0, 0], turret);
    bx(0.1, 0.3, 0.6, DARK, [s * 0.6, 2.9, -1.2], { bone: turret });
  }
  ball(0.16, DARK2, [0.7, 3.1, -1.5], { bone: turret });
  gl(ball(0.08, RED, [0.72, 3.1, -1.37], { bone: turret }), 2);
  bx(0.4, 0.2, 0.5, DARK2, [-0.45, 3.35, -1.6], { bone: turret });
  gl(bx(0.3, 0.04, 0.04, NEON_C, [-0.45, 3.35, -1.34], { bone: turret }), 1.6);
  const gun = b.joint("gun", { parent: turret, at: [0, 2.98, -0.9], dir: [0, 0, 1] });
  bx(0.95, 0.42, 0.5, GUNM, [0, 2.98, -0.55], { bone: gun });
  for (const s of [1, -1]) {
    cy(0.065, 1.6, GUNM, [s * 0.22, 2.98, 0.1], { dir: [0, 0, 1], seg: 8, bone: gun });
    cy(0.1, 0.35, DARK, [s * 0.22, 2.98, 0.75], { dir: [0, 0, 1], seg: 8, bone: gun });
    gl(cy(0.085, 0.04, NEON_M, [s * 0.22, 2.98, 0.94], { dir: [0, 0, 1], seg: 8, bone: gun }), 2.2);
    for (const z of [-0.3, 0.1, 0.5]) gl(cy(0.075, 0.025, NEON_C, [s * 0.22, 2.98, z], { dir: [0, 0, 1], seg: 8, bone: gun }), 1.6);
  }
  bx(0.2, 0.12, 1.4, STEEL, [0, 3.08, 0.0], { bone: gun });

  // ================= missile pods
  const d = [0, 0.574, 0.819];
  const u = [0, 0.819, -0.574];
  for (const s of [1, -1]) {
    const base = [s * 0.8, 3.05, -2.9];
    bx(0.5, 0.3, 0.8, DARK2, [s * 0.8, 2.62, -2.9]);
    b.part(new THREE.BoxGeometry(0.75, 0.55, 1.1), HULLP, { at: base, dir: d, axis: "z", bone: hull });
    for (const ox of [-0.22, 0, 0.22])
      for (const k of [-0.13, 0.13]) {
        const c = [base[0] + ox + u[0] * k, base[1] + u[1] * k, base[2] + u[2] * k];
        cy(0.085, 1.25, DARK, c, { dir: d, seg: 8 });
        gl(cy(0.06, 0.03, AMBER, [c[0], c[1] + d[1] * 0.63, c[2] + d[2] * 0.63], { dir: d, seg: 8 }), 1.8);
      }
    gl(bx(0.6, 0.03, 0.03, RED, [s * 0.8, 2.78, -3.37]), 1.5);
  }

  // ================= radar, antennas
  cy(0.04, 0.8, DARK2, [-0.8, 2.9, -0.1], { seg: 6 });
  b.lathe(
    [
      [0, 0],
      [0.3, 0.12],
      [0.3, 0.14],
      [0, 0.04],
    ],
    { at: [-0.8, 3.3, -0.1], axis: [0, 0.5, 1], color: STEELP, bone: hull, segments: 10 },
  );
  b.rod([-0.8, 3.3, -0.1], [-0.8, 3.52, 0.12], 0.015, STEEL, { bone: hull });
  gl(ball(0.04, RED, [-0.8, 3.53, 0.13]), 2);
  for (let i = 0; i < 3; i++) {
    const x = 0.65 + i * 0.12;
    const h = 1.3 + i * 0.5;
    b.rod([x, 2.5, -0.1], [x, 2.5 + h, -0.1 + i * 0.05], 0.012, DARK2, { bone: hull });
    gl(ball(0.035, i === 1 ? NEON_M : RED, [x, 2.5 + h, -0.1 + i * 0.05]), 2);
  }
  bx(0.4, 0.25, 0.4, DARK, [0.8, 2.62, -0.1]);

  // ================= cables / hoses
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.95, 2.55, 0.4], [s * 0.85, 2.3, 0.5], [s * 0.95, 1.85, 0.6], [s * 0.95, 1.7, 0.85]]), 0.03, { color: DARK2, bone: hull });
    b.sweep(catmull([[s * 0.5, 2.9, 0.9], [s * 0.45, 3.15, 0.5], [s * 0.7, 2.7, 0.0], [s * 0.7, 2.5, -0.2]]), 0.025, { color: s > 0 ? NEON_C : NEON_M, bone: hull });
  }
  // tow cable on bumper
  b.sweep(catmull([[-0.9, 1.3, 4.0], [-0.5, 1.15, 4.05], [0.5, 1.35, 4.05], [0.9, 1.3, 4.0]]), 0.03, { color: STEEL, bone: hull });

  // spotlights on A-pillars
  for (const s of [1, -1]) {
    cy(0.1, 0.12, DARK, [s * 1.0, 2.9, 2.3], { dir: [0, 0, 1], seg: 8 });
    gl(cy(0.08, 0.02, WHITE, [s * 1.0, 2.9, 2.37], { dir: [0, 0, 1], seg: 8 }), 2);
  }

  return b.root;
}
```