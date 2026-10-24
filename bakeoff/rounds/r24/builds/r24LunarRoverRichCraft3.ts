import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { arc, createBuilder, grain, mix, mottle, noise, paint, resolve, rgb, smoothstep, stripes, svg } from "../../../../src/index";
import type { ColorInput, Rgb } from "../../../../src/index";

export const meta = {
  name: "Apollo Lunar Roving Vehicle",
  description:
    "NASA Apollo LRV in archival realism: tubular aluminium chassis, wire-mesh chevron wheels, dust-stained fenders, gold-foil battery pallet, umbrella high-gain antenna, TV camera, display console, hand controller, webbing seats and a rear tool rack.",
};

type V = [number, number, number];
const v = (x: number, y: number, z: number): V => [x, y, z];
type Opt = { rotation?: V; dir?: V; up?: V; axis?: "x" | "y" | "z"; texture?: THREE.Texture; flat?: boolean };

// ---------------------------------------------------------------- dimensions (meters)
const WR = 0.41; // wheel radius
const WW = 0.23; // wheel width
const WX = 0.915; // wheel centre x
const WZ = 1.145; // wheel centre |z|
const SIDES = [1, -1] as const;

/** Chassis rail half-width at a given z (the end sections taper in). */
function railX(z: number) {
  const a = Math.abs(z);
  return a <= 0.62 ? 0.5 : 0.5 - 0.08 * Math.min(1, (a - 0.62) / 0.68);
}

// ---------------------------------------------------------------- colours
const ALU_L = "#c7c9cb";
const ALU_D = "#a2a5a9";
const BLACK = "#1b1c1f";
const DARK = "#3a3b40";
const STEEL = "#9ea3aa";
const CHROME = "#dde0e5";
const CREAM = "#dcd6c2";
const BRONZE = "#b69a52";
const RED = "#b3262d";

// ---------------------------------------------------------------- paints
const DUST = rgb("#8b857a");
const shade = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];

/** Lunar dust: gathers low on the vehicle and on upward faces. */
function dusty(base: ColorInput, amount = 1) {
  return paint((p, n) => {
    const low = smoothstep(0.8, 0.05, p.y);
    const k = Math.min(
      0.8,
      (low * (0.3 + 0.9 * noise(p, 0.1, 11)) + 0.2 * smoothstep(0.3, 0.9, n.y) * noise(p, 0.05, 12)) * amount,
    );
    return mix(resolve(base, p, n), DUST, k);
  });
}

function foil(lo: string, hi: string, glint: string, seed: number) {
  return paint((p, n) => {
    const a = noise(p, 0.06, seed);
    const c = noise(p, 0.02, seed + 5);
    const t = smoothstep(0.3, 0.75, a * 0.55 + c * 0.55);
    const base = mix(lo, hi, t);
    const lit = mix(base, glint, smoothstep(0.62, 0.9, c) * 0.55);
    return shade(lit, 0.82 + 0.18 * smoothstep(-0.8, 0.5, n.y));
  });
}

const ALU = dusty(grain("#cfd1d3", "#a9acb1", { size: 0.025, axis: "z" }));
const WHITE = dusty(mottle("#e9e7df", "#d3d1c7", { size: 0.18, seed: 4 }));
const FENDER = dusty(mottle("#dedcd2", "#c4c2b6", { size: 0.12, seed: 7 }), 1.5);
const TITAN = dusty("#6d7178", 1.3);
const GOLD = foil("#86581a", "#e8bb50", "#fff0b0", 3);
const SILVERFOIL = foil("#8d9096", "#e1e4e8", "#ffffff", 9);
const RADIATOR = stripes("#e6e4dc", "#4a4b50", { size: 0.034, axis: "x", width: 0.45, wobble: 0 });
const SINK = stripes("#d3d1c8", "#2f3034", { size: 0.04, axis: "x", width: 0.4, wobble: 0 });
const DISH = paint((p, _n, s) => {
  const rib = (((s[1] % 22.5) + 22.5) % 22.5) < 1.6;
  const ring = (((s[0] / 0.04) % 1) + 1) % 1 < 0.1;
  if (rib || ring) return "#5f5b52";
  return mix("#cbc2a8", "#a79f88", noise(p, 0.1, 2));
});

// ---------------------------------------------------------------- wheel geometry
function chevrons(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const n = 20;
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    for (const sx of SIDES) {
      const g = new THREE.BoxGeometry(0.1, 0.012, 0.028);
      g.applyMatrix4(new THREE.Matrix4().makeRotationY(sx * 0.6));
      g.translate(sx * 0.045, WR - 0.002, 0);
      g.applyMatrix4(new THREE.Matrix4().makeRotationX(th));
      parts.push(g);
    }
  }
  return mergeGeometries(parts)!;
}

function bolts(sx: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(0.011, 0.011, 0.02, 6);
    g.rotateZ(-Math.PI / 2);
    g.translate(sx * 0.16, 0.075 * Math.cos(a), 0.075 * Math.sin(a));
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

// ---------------------------------------------------------------- textures
function meshSvg() {
  const W = 220;
  const H = 20;
  let d = "";
  for (let i = -H; i < W + H; i += 4) d += `M${i} 0L${i + H} ${H}M${i + H} 0L${i} ${H}`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="#ffffff" stroke-width="0.9" fill="none"/></svg>`;
}

function gauge(cx: number, cy: number, label: string, ang: number) {
  let t = "";
  for (let i = 0; i <= 8; i++) {
    const a = ((-120 + i * 30) * Math.PI) / 180;
    t += `<path d="M${cx + 12 * Math.sin(a)} ${cy - 12 * Math.cos(a)}L${cx + 14.5 * Math.sin(a)} ${cy - 14.5 * Math.cos(a)}" stroke="#dddddd" stroke-width="1"/>`;
  }
  const a = (ang * Math.PI) / 180;
  return `<circle cx="${cx}" cy="${cy}" r="16" fill="#101113" stroke="#9a9c9f" stroke-width="1.5"/>${t}
    <path d="M${cx} ${cy}L${cx + 11 * Math.sin(a)} ${cy - 11 * Math.cos(a)}" stroke="#f3a12b" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="2" fill="#cccccc"/>
    <text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="4.2" fill="#dddddd" font-family="Arial, sans-serif">${label}</text>`;
}

function displaySvg() {
  let sw = "";
  for (let i = 0; i < 8; i++) {
    sw += `<rect x="${14 + i * 21}" y="86" width="9" height="13" rx="1.5" fill="#55575c" stroke="#111"/>
      <rect x="${16 + i * 21}" y="${i % 3 === 0 ? 88 : 92}" width="5" height="5" fill="${i % 4 === 1 ? "#d9822b" : "#c9cbc9"}"/>`;
  }
  return `<svg viewBox="0 0 190 110" xmlns="http://www.w3.org/2000/svg">
    <rect width="190" height="110" rx="5" fill="#2b2d31"/>
    <rect x="3" y="3" width="184" height="104" rx="4" fill="none" stroke="#8d9094" stroke-width="1.5"/>
    ${gauge(34, 34, "SPEED", -40)}${gauge(76, 34, "HEADING", 30)}${gauge(118, 34, "PITCH", 5)}${gauge(158, 34, "POWER", 60)}
    <rect x="14" y="58" width="60" height="18" rx="2" fill="#0b0c0d" stroke="#777"/>
    <text x="44" y="71" text-anchor="middle" font-size="11" fill="#ffb347" font-family="monospace">002.4</text>
    <rect x="84" y="58" width="60" height="18" rx="2" fill="#0b0c0d" stroke="#777"/>
    <text x="114" y="71" text-anchor="middle" font-size="11" fill="#ffb347" font-family="monospace">187°</text>
    <circle cx="164" cy="67" r="7" fill="#b3262d" stroke="#111" stroke-width="1.5"/>
    <text x="14" y="56" font-size="4" fill="#ddd" font-family="Arial, sans-serif">RANGE KM</text>
    <text x="84" y="56" font-size="4" fill="#ddd" font-family="Arial, sans-serif">BEARING</text>
    ${sw}
  </svg>`;
}

function flagSvg() {
  let st = "";
  for (let i = 0; i < 13; i++)
    st += `<rect y="${(i * 100) / 13}" width="190" height="${100 / 13 + 0.3}" fill="${i % 2 ? "#f4f1ea" : "#b22234"}"/>`;
  let stars = "";
  for (let r = 0; r < 9; r++) {
    const cnt = r % 2 ? 5 : 6;
    for (let c = 0; c < cnt; c++)
      stars += `<circle cx="${(r % 2 ? 12.6 : 6.3) + c * 12.6}" cy="${3.2 + r * 5.9}" r="1.3" fill="#ffffff"/>`;
  }
  return `<svg viewBox="0 0 190 100" xmlns="http://www.w3.org/2000/svg">${st}<rect width="76" height="53.8" fill="#3c3b6e"/>${stars}</svg>`;
}

function webSvg() {
  let s = `<rect width="64" height="64" fill="#a9a28c"/>`;
  for (let j = 0; j < 8; j++)
    for (let i = 0; i < 8; i++)
      s += `<rect x="${i * 8}" y="${j * 8}" width="${(i + j) % 2 ? 6.8 : 8}" height="${(i + j) % 2 ? 8 : 6.8}" fill="${(i + j) % 2 ? "#e3dcc6" : "#d0c9b2"}"/>`;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function floorSvg() {
  let h = "";
  for (let y = 6; y < 122; y += 6)
    for (let x = 6; x < 98; x += 6) h += `<circle cx="${x}" cy="${y}" r="1.7" fill="#3b3d40"/>`;
  return `<svg viewBox="0 0 100 124" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="124" fill="#c4c6c8"/><rect x="1" y="1" width="98" height="122" fill="none" stroke="#7d8084" stroke-width="2"/>${h}</svg>`;
}

const NASA_SVG = `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="31" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="32" letter-spacing="3" fill="#c8202f">NASA</text></svg>`;

const PLATE_SVG = `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="158" height="38" rx="3" fill="#e6e1d2" stroke="#222" stroke-width="1.5"/>
  <text x="80" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#1a1a1a">LUNAR ROVING VEHICLE</text>
  <text x="80" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="6.5" fill="#333">MODEL 1 · BOEING / GM-DRL · LRV-1</text></svg>`;

const LENS_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#0b0b0e"/><circle cx="50" cy="50" r="38" fill="#141a2a" stroke="#4a5a7a" stroke-width="3"/>
  <circle cx="50" cy="50" r="24" fill="#0d1018" stroke="#2c3550" stroke-width="2"/><circle cx="50" cy="50" r="10" fill="#1d2a48"/>
  <ellipse cx="38" cy="36" rx="9" ry="5" fill="#b8c8ee" opacity="0.7"/></svg>`;

// ================================================================= build
export default function build() {
  const b = createBuilder({ name: "lunar_roving_vehicle" });

  const MESH = svg(meshSvg(), { size: 1024 });
  const DISPLAY = svg(displaySvg(), { size: 768 });
  const FLAG = svg(flagSvg(), { size: 256 });
  const WEB = svg(webSvg(), { size: 256 });
  const FLOOR = svg(floorSvg(), { size: 512 });
  const NASA = svg(NASA_SVG, { size: 384 });
  const PLATE = svg(PLATE_SVG, { size: 512 });
  const LENS = svg(LENS_SVG, { size: 128 });

  const tube = (a: V, c: V, r = 0.013, color: ColorInput = ALU_L) => b.capsule(a, c, r, color, { sides: 6 });
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r0: number, r1: number, h: number, color: ColorInput, at: V, dir: V, seg = 12, o: Opt = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir, ...o });
  const decal = (tex: THREE.Texture, at: V, dir: V, w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });

  // ------------------------------------------------------------- chassis
  // centre section: ladder truss
  for (const s of SIDES) {
    tube(v(s * 0.5, 0.5, -0.62), v(s * 0.5, 0.5, 0.62), 0.02);
    tube(v(s * 0.5, 0.66, -0.62), v(s * 0.5, 0.66, 0.62), 0.02);
    for (const z of [-0.62, 0, 0.62]) tube(v(s * 0.5, 0.5, z), v(s * 0.5, 0.66, z), 0.014);
    tube(v(s * 0.5, 0.5, -0.62), v(s * 0.5, 0.66, 0), 0.012);
    tube(v(s * 0.5, 0.5, 0.62), v(s * 0.5, 0.66, 0), 0.012);
  }
  for (const z of [-0.62, 0, 0.62]) {
    tube(v(-0.5, 0.5, z), v(0.5, 0.5, z), 0.016);
    tube(v(-0.5, 0.66, z), v(0.5, 0.66, z), 0.016);
  }
  // side panels with decals
  for (const s of SIDES) {
    box(0.012, 0.19, 0.95, ALU, v(s * 0.514, 0.58, 0));
    decal(NASA, v(s * 0.5205, 0.595, -0.22), v(s, 0, 0), 0.3, 0.1);
    decal(FLAG, v(s * 0.5205, 0.595, 0.26), v(s, 0, 0), 0.17, 0.09);
  }
  // end sections
  for (const sz of SIDES) {
    const z0 = sz * 0.62;
    const z1 = sz * 1.3;
    const z2 = sz * 0.96;
    for (const s of SIDES) {
      tube(v(s * 0.5, 0.5, z0), v(s * railX(z1), 0.5, z1), 0.02);
      tube(v(s * 0.5, 0.66, z0), v(s * railX(z1), 0.66, z1), 0.02);
      tube(v(s * railX(z2), 0.5, z2), v(s * railX(z2), 0.66, z2), 0.014);
      tube(v(s * railX(z1), 0.5, z1), v(s * railX(z1), 0.66, z1), 0.014);
      tube(v(s * 0.5, 0.5, z0), v(s * railX(z2), 0.66, z2), 0.012);
      tube(v(s * railX(z2), 0.5, z2), v(s * railX(z1), 0.66, z1), 0.012);
      // bumper
      tube(v(s * railX(z1), 0.54, z1), v(s * 0.4, 0.56, sz * 1.45), 0.016);
    }
    for (const z of [z2, z1]) {
      tube(v(-railX(z), 0.5, z), v(railX(z), 0.5, z), 0.016);
      tube(v(-railX(z), 0.66, z), v(railX(z), 0.66, z), 0.016);
    }
    tube(v(-0.4, 0.56, sz * 1.45), v(0.4, 0.56, sz * 1.45), 0.018, ALU_D);
    // cross panel with plaque
    box(0.84, 0.17, 0.012, ALU, v(0, 0.58, z1));
    // pallet deck
    box(0.86, 0.014, 0.64, ALU, v(0, 0.668, z2));
  }
  decal(NASA, v(0, 0.59, 1.3065), v(0, 0, 1), 0.34, 0.11);
  decal(PLATE, v(0, 0.59, -1.3065), v(0, 0, -1), 0.4, 0.1);
  decal(FLAG, v(0.3, 0.59, -1.3065), v(0, 0, -1), 0.14, 0.074);

  // floor
  box(1.0, 0.014, 1.24, "#ffffff", v(0, 0.618, 0), { texture: FLOOR });
  // drive control electronics under the floor
  b.part(new THREE.BoxGeometry(0.52, 0.14, 0.52), SINK, { at: v(0, 0.42, 0) });
  for (const s of SIDES) box(0.02, 0.1, 0.5, DARK, v(s * 0.27, 0.42, 0));

  // ------------------------------------------------------------- wheels, suspension, fenders
  for (const sx of SIDES)
    for (const sz of SIDES) {
      const cx = sx * WX;
      const cz = sz * WZ;
      const c: V = v(cx, WR, cz);
      const ax: V = v(1, 0, 0);
      // wire mesh tyre over a dark drum
      b.part(new THREE.CylinderGeometry(WR, WR, WW, 26, 1, true), "#b9bbbd", { at: c, dir: ax, texture: MESH });
      cyl(0.335, 0.335, 0.2, DARK, c, ax, 18);
      b.part(chevrons(), TITAN, { at: c, flat: true });
      // outer disc, hub, bolts, cap
      cyl(0.2, 0.2, 0.02, ALU, v(cx + sx * 0.105, WR, cz), ax, 18);
      cyl(0.11, 0.13, 0.05, ALU, v(cx + sx * 0.13, WR, cz), ax, 12);
      b.part(bolts(sx), STEEL, { at: c, flat: true });
      cyl(0.05, 0.05, 0.03, CHROME, v(cx + sx * 0.16, WR, cz), ax, 8);
      // harmonic drive motor housing, inboard
      cyl(0.115, 0.115, 0.14, WHITE, v(cx - sx * 0.17, WR, cz), ax, 14);
      cyl(0.122, 0.122, 0.02, DARK, v(cx - sx * 0.13, WR, cz), ax, 14);
      cyl(0.06, 0.06, 0.03, BRONZE, v(cx - sx * 0.25, WR, cz), ax, 10);
      // knuckle + steering motor
      tube(v(sx * 0.66, 0.22, cz), v(sx * 0.66, 0.67, cz), 0.022, ALU_D);
      tube(v(sx * 0.66, WR, cz), v(cx - sx * 0.22, WR, cz), 0.03, ALU_D);
      cyl(0.055, 0.055, 0.09, BRONZE, v(sx * 0.66, 0.71, cz), v(0, 1, 0), 10);
      // A-arms
      const zin = cz - sz * 0.3;
      const zout = cz + sz * 0.12;
      for (const zz of [zin, zout]) {
        tube(v(sx * 0.66, 0.65, cz), v(sx * railX(zz), 0.66, zz), 0.014);
        tube(v(sx * 0.66, 0.24, cz), v(sx * railX(zz), 0.5, zz), 0.014);
      }
      // damper
      const zs = cz - sz * 0.17;
      tube(v(sx * 0.6, 0.33, cz), v(sx * 0.55, 0.5, zs), 0.022, DARK);
      tube(v(sx * 0.55, 0.5, zs), v(sx * railX(zs), 0.66, zs), 0.011, CHROME);
      // fender: swept box arc over the wheel
      const R = 0.465;
      const e = (15 * Math.PI) / 180;
      b.sweep(
        arc(c, v(cx, WR + R * Math.sin(e), cz + R * Math.cos(e)), v(-1, 0, 0), 150),
        (): [number, number] => [0.15, 0.006],
        { section: "box", caps: "flat", color: FENDER },
      );
      tube(v(cx - sx * 0.12, WR + 0.46, cz), v(sx * 0.66, 0.68, cz), 0.011, ALU_D);
      tube(v(cx - sx * 0.12, WR + 0.44, cz + sz * 0.17), v(sx * 0.66, 0.68, cz), 0.009, ALU_D);
    }

  // ------------------------------------------------------------- seats
  for (const s of SIDES) {
    const sx = s * 0.31;
    const yP = 0.74;
    const zF = 0.04;
    const zB = -0.34;
    const topAt = (t: number): V => v(sx + t * 0.2, 1.06, -0.42);
    for (const t of SIDES) {
      const x = sx + t * 0.2;
      tube(v(x, yP, zB), v(x, yP, zF), 0.012);
      tube(v(x, yP, zB), topAt(t), 0.012);
      tube(v(x, yP, zF), v(x, 0.62, zF), 0.012);
      tube(v(x, yP, zB), v(x, 0.62, zB), 0.012);
      tube(v(x, 0.9, -0.38), v(x, 0.62, -0.6), 0.011);
    }
    tube(v(sx - 0.2, yP, zF), v(sx + 0.2, yP, zF), 0.012);
    tube(v(sx - 0.2, yP, zB), v(sx + 0.2, yP, zB), 0.012);
    tube(topAt(-1), topAt(1), 0.012);
    tube(v(sx - 0.2, 0.9, -0.38), v(sx + 0.2, 0.9, -0.38), 0.01);
    tube(v(sx - 0.2, 0.62, zF), v(sx + 0.2, 0.62, zF), 0.01);
    // webbing
    b.part(new THREE.PlaneGeometry(0.4, 0.38), "#ffffff", { at: v(sx, yP + 0.004, -0.15), dir: v(0, 1, 0), up: v(0, 0, 1), axis: "z", texture: WEB });
    const n: V = v(0, 0.24, 0.97);
    b.part(new THREE.PlaneGeometry(0.4, 0.28), "#ffffff", { at: v(sx, 0.9 + 0.001, -0.38 + 0.004), dir: n, axis: "z", texture: WEB });
    b.part(new THREE.PlaneGeometry(0.4, 0.28), "#ffffff", { at: v(sx, 0.9, -0.38 - 0.004), dir: v(0, -0.24, -0.97), axis: "z", texture: WEB });
    // lap belt
    for (const t of SIDES) box(0.17, 0.005, 0.045, CREAM, v(sx + t * 0.1, yP + 0.012, -0.05));
    box(0.045, 0.014, 0.045, STEEL, v(sx, yP + 0.016, -0.05));
    // footrest
    b.part(new THREE.BoxGeometry(0.26, 0.012, 0.24), "#ffffff", { at: v(sx, 0.67, 0.37), rotation: v(-15, 0, 0), texture: FLOOR });
    for (const t of SIDES) tube(v(sx + t * 0.11, 0.62, 0.3), v(sx + t * 0.11, 0.664, 0.32), 0.01);
    box(0.2, 0.008, 0.03, BLACK, v(sx, 0.69, 0.45), { rotation: v(-15, 0, 0) });
  }

  // ------------------------------------------------------------- hand controller + console
  tube(v(0, 0.62, 0.07), v(0, 0.86, 0.1), 0.017, ALU_D);
  cyl(0.04, 0.03, 0.06, BLACK, v(0, 0.65, 0.07), v(0, 1, 0), 10);
  tube(v(-0.07, 0.88, 0.1), v(0.07, 0.88, 0.1), 0.013, DARK);
  for (const s of SIDES) tube(v(s * 0.05, 0.88, 0.1), v(s * 0.095, 0.88, 0.1), 0.02, BLACK);
  cyl(0.012, 0.012, 0.03, RED, v(0, 0.9, 0.1), v(0, 1, 0), 8);

  for (const s of SIDES) {
    tube(v(s * 0.13, 0.66, 0.62), v(s * 0.11, 0.97, 0.72), 0.014);
    tube(v(s * 0.13, 0.66, 0.5), v(s * 0.13, 0.66, 0.62), 0.012);
  }
  box(0.44, 0.27, 0.06, DARK, v(0, 1.06, 0.74), { rotation: v(20, 0, 0) });
  const cn = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0); // placeholder for clarity
  void cn;
  const panelN: V = v(0, Math.sin((20 * Math.PI) / 180), -Math.cos((20 * Math.PI) / 180));
  b.part(new THREE.PlaneGeometry(0.4, 0.235), "#ffffff", {
    at: v(0, 1.06 + panelN[1] * 0.032, 0.74 + panelN[2] * 0.032),
    dir: panelN,
    axis: "z",
    texture: DISPLAY,
  });
  // sun compass on top
  cyl(0.035, 0.04, 0.02, ALU_D, v(0, 1.2, 0.74), v(0, 1, 0), 12);
  tube(v(0, 1.21, 0.74), v(0, 1.28, 0.74), 0.004, CHROME);
  cyl(0.012, 0.012, 0.012, BLACK, v(0, 1.285, 0.74), v(0, 1, 0), 6);

  // ------------------------------------------------------------- front pallet
  for (const s of SIDES) {
    const x = s * 0.28;
    box(0.26, 0.26, 0.52, GOLD, v(x, 0.8, 0.92));
    for (const dz of [-0.16, 0.16]) box(0.27, 0.268, 0.012, ALU_L, v(x, 0.8, 0.92 + dz));
    box(0.24, 0.012, 0.42, RADIATOR, v(x, 0.936, 0.92));
    box(0.04, 0.03, 0.04, BLACK, v(x + s * 0.06, 0.95, 1.08));
  }
  box(0.26, 0.22, 0.48, SILVERFOIL, v(0, 0.78, 0.92));
  for (const dz of [-0.15, 0.15]) box(0.27, 0.228, 0.012, BLACK, v(0, 0.78, 0.92 + dz));
  box(0.24, 0.012, 0.4, WHITE, v(0, 0.896, 0.92));

  // high-gain antenna (umbrella dish)
  const dishPos = new THREE.Vector3(0, 1.3, 0.9);
  const axis = new THREE.Vector3(0, 0.93, -0.37).normalize();
  const axisA = axis.toArray() as V;
  tube(v(0, 0.9, 0.9), v(0, 1.28, 0.9), 0.016, WHITE);
  cyl(0.04, 0.04, 0.04, ALU_D, v(0, 0.91, 0.9), v(0, 1, 0), 10);
  cyl(0.03, 0.03, 0.05, ALU_D, v(0, 1.29, 0.9), axisA, 10);
  b.lathe(
    [
      [0, 0],
      [0.14, 0.025],
      [0.28, 0.085],
      [0.405, 0.17],
      [0.4, 0.178],
      [0.275, 0.095],
      [0.14, 0.034],
      [0, 0.01],
    ],
    { at: dishPos.toArray() as V, axis: axisA, segments: 20, color: DISH },
  );
  const rimC = dishPos.clone().addScaledVector(axis, 0.172);
  b.part(new THREE.TorusGeometry(0.405, 0.006, 5, 28), ALU_D, { at: rimC.toArray() as V, dir: axisA, axis: "z" });
  const tip = dishPos.clone().addScaledVector(axis, 0.36);
  tube(dishPos.toArray() as V, tip.toArray() as V, 0.01, WHITE);
  cyl(0.032, 0.046, 0.05, WHITE, tip.toArray() as V, axisA, 10);
  const U = new THREE.Vector3(1, 0, 0);
  const W = axis.clone().cross(U).normalize();
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    const rim = rimC.clone().addScaledVector(U, 0.4 * Math.cos(a)).addScaledVector(W, 0.4 * Math.sin(a));
    b.capsule(rim.toArray() as V, tip.toArray() as V, 0.004, ALU_D, { sides: 5 });
  }

  // low-gain antenna
  tube(v(0.44, 0.68, 1.12), v(0.44, 1.5, 1.12), 0.008, CHROME);
  cyl(0.03, 0.03, 0.14, WHITE, v(0.44, 1.5, 1.12), v(0, 1, 0), 10);
  b.spike(v(0.44, 1.57, 1.12), v(0, 1, 0), 0.08, 0.025, { color: WHITE });
  box(0.05, 0.03, 0.05, DARK, v(0.44, 0.7, 1.12));

  // TV camera
  tube(v(-0.28, 0.93, 1.08), v(-0.28, 1.0, 1.08), 0.014, ALU_D);
  box(0.12, 0.12, 0.26, WHITE, v(-0.28, 1.08, 1.08));
  box(0.13, 0.02, 0.1, ALU_D, v(-0.28, 1.15, 1.1));
  tube(v(-0.32, 1.17, 1.02), v(-0.24, 1.17, 1.02), 0.008, BLACK);
  cyl(0.05, 0.05, 0.08, BLACK, v(-0.28, 1.08, 1.25), v(0, 0, 1), 12);
  cyl(0.056, 0.056, 0.015, RED, v(-0.28, 1.08, 1.215), v(0, 0, 1), 12);
  b.part(new THREE.CircleGeometry(0.04, 16), "#ffffff", { at: v(-0.28, 1.08, 1.2915), dir: v(0, 0, 1), axis: "z", texture: LENS });

  // ------------------------------------------------------------- rear rack and stowage
  const rz = -1.08;
  for (const s of SIDES) tube(v(s * 0.4, 0.67, rz), v(s * 0.4, 1.42, rz), 0.014);
  for (const y of [0.82, 1.1, 1.42]) tube(v(-0.4, y, rz - 0.05), v(0.4, y, rz - 0.05), 0.012);
  for (const x of [-0.26, -0.09, 0.09, 0.26])
    for (const y of [0.82, 1.1]) box(0.045, 0.03, 0.04, BLACK, v(x, y, rz - 0.025));
  // tool 0: scoop
  tube(v(-0.26, 0.72, rz), v(-0.26, 1.22, rz), 0.013, DARK);
  b.extrude(
    [[-0.035, 0], [0.035, 0], [0.045, 0.08], [0.02, 0.13], [-0.02, 0.13], [-0.045, 0.08]],
    { at: v(-0.26, 1.22, rz), x: v(1, 0, 0), thickness: 0.006, smoothing: 1, color: STEEL },
  );
  // tool 1: rake
  tube(v(-0.09, 0.72, rz), v(-0.09, 1.3, rz), 0.013, DARK);
  tube(v(-0.145, 1.3, rz), v(-0.035, 1.3, rz), 0.009, STEEL);
  for (let i = 0; i < 5; i++) b.spike(v(-0.145 + i * 0.0275, 1.3, rz), v(0, 0, 1), 0.06, 0.006, { color: STEEL });
  // tool 2: tongs
  tube(v(0.09, 0.72, rz), v(0.09, 1.1, rz), 0.013, DARK);
  for (const s of SIDES) tube(v(0.09, 1.1, rz), v(0.09 + s * 0.035, 1.36, rz), 0.007, STEEL);
  // tool 3: extension handle with T grip
  tube(v(0.26, 0.72, rz), v(0.26, 1.38, rz), 0.012, ALU_L);
  tube(v(0.2, 1.38, rz), v(0.32, 1.38, rz), 0.012, BLACK);
  // stowed cargo
  for (const s of SIDES) {
    box(0.16, 0.2, 0.11, CREAM, v(s * 0.27, 0.78, -0.86));
    box(0.12, 0.03, 0.08, ALU_D, v(s * 0.27, 0.9, -0.86));
    tube(v(s * 0.2, 0.69, -1.2), v(s * 0.2, 0.69, -0.94), 0.02, WHITE);
  }
  box(0.2, 0.16, 0.2, WHITE, v(0, 0.76, -0.86));
  box(0.22, 0.01, 0.22, RADIATOR, v(0, 0.845, -0.86));
  cyl(0.05, 0.05, 0.1, ALU_L, v(0, 0.72, -1.2), v(1, 0, 0), 10);

  return b.root;
}
