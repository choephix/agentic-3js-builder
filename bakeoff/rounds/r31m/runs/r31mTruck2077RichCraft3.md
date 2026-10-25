```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, mottle, paint, catmull } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ares-77 Armored Hauler",
  description:
    "Low-poly cyberpunk 6x6 militarized truck from 2077: armored cab, panelled cargo container, roof turret, missile pods, neon underglow, HUD glass and decals. Wheels, turret and gun are separate joints.",
};

type V = [number, number, number];
const D = Math.PI / 180;

// ---- palette ----
const GUN = "#2a2f3a";
const DARK = "#14171d";
const STEEL = "#8b93a3";
const YEL = "#f2b705";
const MAG = "#ff2d95";
const CYAN = "#19e6ff";
const ORG = "#ff7a1a";
const RED = "#ff2030";
const TIRE = "#1b1c20";
const RUB = "#2c2e34";
const BRASS = "#b88a3c";
const TANK = "#4a5346";
const OLV = "#4a5648";

// ---- textures ----
function hazardTex() {
  let s = "";
  for (let i = -2; i < 14; i++)
    s += `<polygon points="${i * 12},20 ${i * 12 + 6},20 ${i * 12 + 26},0 ${i * 12 + 20},0" fill="#f2b705"/>`;
  return svg(`<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="20" fill="#14171d"/>${s}</svg>`, { size: 256 });
}
const HAZARD = hazardTex();
const WINDSHIELD = svg(
  `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06222e"/><stop offset="1" stop-color="#0b4a5c"/></linearGradient></defs>
  <rect width="220" height="100" fill="url(#g)"/>
  <polygon points="20,0 60,0 30,100 -10,100" fill="#19e6ff" opacity="0.18"/>
  <polygon points="90,0 105,0 75,100 60,100" fill="#19e6ff" opacity="0.12"/>
  <polygon points="170,0 205,0 175,100 140,100" fill="#ff2d95" opacity="0.12"/>
  <g stroke="#ff2d95" fill="none" stroke-width="1.6"><circle cx="110" cy="50" r="18"/><path d="M110 24V38M110 62V76M84 50H98M122 50H136"/></g>
  <text x="10" y="14" font-family="monospace" font-size="8" fill="#19e6ff">SPD 088 // HDG 274</text>
  <text x="150" y="92" font-family="monospace" font-size="8" fill="#ffc400">TGT LOCK 03</text>
  <rect x="8" y="76" width="40" height="5" fill="#19e6ff" opacity="0.7"/><rect x="8" y="84" width="26" height="5" fill="#ff2d95" opacity="0.7"/>
  </svg>`,
  { size: 512 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#07252f"/><stop offset="1" stop-color="#0d5368"/></linearGradient></defs>
  <rect width="100" height="60" rx="6" fill="url(#g)" stroke="#0b0d11" stroke-width="5"/>
  <polygon points="15,3 35,3 20,57 0,57" fill="#19e6ff" opacity="0.2"/><polygon points="50,3 58,3 43,57 35,57" fill="#19e6ff" opacity="0.14"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#10141a" stroke="#ff2d95" stroke-width="4"/>
  <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="none" stroke="#19e6ff" stroke-width="2.5"/>
  <polyline points="26,68 50,28 74,68" fill="none" stroke="#f2b705" stroke-width="8" stroke-linejoin="miter"/>
  <polyline points="36,76 50,54 64,76" fill="none" stroke="#ff2d95" stroke-width="6"/>
  <circle cx="50" cy="22" r="3.5" fill="#19e6ff"/><circle cx="16" cy="50" r="3" fill="#19e6ff"/><circle cx="84" cy="50" r="3" fill="#19e6ff"/>
  <path d="M16 50H30M84 50H70" stroke="#19e6ff" stroke-width="2"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="236" height="56" rx="6" fill="#0d1015" stroke="#f2b705" stroke-width="3"/>
  <text x="14" y="38" font-family="monospace" font-weight="bold" font-size="30" fill="#f2b705">ARES-77</text>
  <text x="152" y="26" font-family="monospace" font-size="9" fill="#ff2d95">LOGISTICS</text>
  <text x="152" y="42" font-family="monospace" font-size="9" fill="#19e6ff">// 2077 //</text>
  <rect x="150" y="47" width="80" height="4" fill="#f2b705"/></svg>`,
  { size: 384 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="40" fill="#0b0d11"/>
  <g stroke="#19e6ff" stroke-width="2.6"><path d="M6 8H44M76 8H114M6 16H44M76 16H114M6 24H44M76 24H114M6 32H44M76 32H114"/></g>
  <polygon points="60,3 74,20 60,37 46,20" fill="#10141a" stroke="#ff2d95" stroke-width="3"/><circle cx="60" cy="20" r="4" fill="#ff2d95"/></svg>`,
  { size: 256 },
);
const HEADLIGHT = svg(
  `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="30" rx="4" fill="#0b0d11"/>
  <polygon points="4,24 56,5 56,16 14,27" fill="#aef6ff"/><polygon points="14,22 50,9 50,13 18,24" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const RETICLE = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g stroke="#ff2030" fill="none" stroke-width="3.5">
  <circle cx="30" cy="30" r="21"/><path d="M30 2V14M30 46V58M2 30H14M46 30H58"/></g><circle cx="30" cy="30" r="3.5" fill="#ff2030"/></svg>`,
  { size: 128 },
);
const HOLO = svg(
  `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="90" fill="#04141c"/>
  <rect x="3" y="3" width="194" height="84" fill="none" stroke="#19e6ff" stroke-width="3"/>
  <text x="100" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="52" fill="#19e6ff">2077</text>
  <text x="100" y="78" text-anchor="middle" font-family="monospace" font-size="10" fill="#ff2d95">NO FUTURE? DRIVE.</text>
  <g fill="#000000" opacity="0.35"><rect y="10" width="200" height="2"/><rect y="30" width="200" height="2"/><rect y="50" width="200" height="2"/><rect y="70" width="200" height="2"/></g></svg>`,
  { size: 384 },
);
const DOORLINES = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#0b0d11" stroke-width="2">
  <rect x="2" y="2" width="96" height="56"/><path d="M50 2V58M2 30H98"/></g>
  <rect x="44" y="26" width="4" height="8" fill="#0b0d11"/><rect x="52" y="26" width="4" height="8" fill="#0b0d11"/>
  <g fill="#f2b705"><circle cx="9" cy="9" r="2.4"/><circle cx="91" cy="9" r="2.4"/><circle cx="9" cy="51" r="2.4"/><circle cx="91" cy="51" r="2.4"/></g></svg>`,
  { size: 256 },
);

// ---- paints ----
const camo = mottle("#566348", "#3c4736", { size: 0.6, contrast: 1.3, seed: 3 });
const cabClean = panelled(camo, { size: 0.55, aspect: 0.8, rivets: 0.07 });
const cabDirty = panelled(mottle("#3f3e35", "#2d2c27", { size: 0.3, seed: 8 }), { size: 0.55, aspect: 0.8, rivets: 0.07 });
const bedClean = panelled(metal("iron", { tarnish: 0.5, polish: 0.15 }), { size: 0.6, aspect: 0.6, rivets: 0.07 });
const bedDirty = panelled(mottle("#35342e", "#262520", { size: 0.35, seed: 5 }), { size: 0.6, aspect: 0.6, rivets: 0.07 });
import { noise } from "agentic-3js-builder";
const CABP = paint((p) => (p.y < 1.3 + 0.25 * noise(p, 0.5, 2) ? cabDirty : cabClean));
const BEDP = paint((p) => (p.y < 1.75 + 0.25 * noise(p, 0.5, 4) ? bedDirty : bedClean));
const ROOFP = metal("steel", { tarnish: 0.35, polish: 0.2 });

export default function build() {
  const b = createBuilder({ name: "ares77" });
  const body = b.joint("body", { at: [0, 1, 0] });
  const J: Record<string, ReturnType<typeof b.joint>> = { body };

  // ---- batching: many small pieces merged per bone / colour / glow ----
  const BAT = new Map<string, THREE.BufferGeometry[]>();
  function put(c: string, geo: THREE.BufferGeometry, pos: V, rot: V, g: number, bn: string) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1)));
    const key = `${c}|${g}|${bn}`;
    const l = BAT.get(key);
    if (l) l.push(geo);
    else BAT.set(key, [geo]);
  }
  const box = (c: string, s: V, pos: V, rot: V = [0, 0, 0], g = 0, bn = "body") =>
    put(c, new THREE.BoxGeometry(s[0], s[1], s[2]), pos, rot, g, bn);
  const cyl = (c: string, r: number, len: number, seg: number, pos: V, rot: V = [0, 0, 0], g = 0, bn = "body", r2 = r) =>
    put(c, new THREE.CylinderGeometry(r, r2, len, seg), pos, rot, g, bn);
  const cone = (c: string, r: number, len: number, seg: number, pos: V, rot: V = [0, 0, 0], g = 0, bn = "body") =>
    put(c, new THREE.ConeGeometry(r, len, seg), pos, rot, g, bn);
  const ball = (c: string, r: number, pos: V, g = 0, bn = "body") =>
    put(c, new THREE.SphereGeometry(r, 8, 6), pos, [0, 0, 0], g, bn);
  const ring = (c: string, r: number, tube: number, pos: V, rot: V, g = 0, bn = "body") =>
    put(c, new THREE.TorusGeometry(r, tube, 4, 16), pos, rot, g, bn);

  const decal = (tex: ReturnType<typeof svg>, w: number, h: number, pos: V, dir: V, g = 0, bn = body) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: bn, at: pos, dir, axis: "z", texture: tex });
    if (g > 0) glow(p, g);
    return p;
  };

  // ---- joints ----
  const WZ: Record<string, number> = { F: 2.7, M: -1.4, R: -3.0 };
  for (const side of ["L", "R"])
    for (const k of ["F", "M", "R"]) {
      const s = side === "L" ? 1 : -1;
      J[`wheel${k}${side}`] = b.joint(`wheel${k}${side}`, { parent: body, at: [s * 1.55, 0.62, WZ[k]], dir: [s, 0, 0] });
    }
  const turret = b.joint("turret", { parent: body, at: [0, 3.05, -0.9], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.6, -0.6], dir: [0, 0, 1] });
  J.turret = turret;
  J.gun = gun;

  // ---- wheels ----
  for (const side of ["L", "R"])
    for (const k of ["F", "M", "R"]) {
      const s = side === "L" ? 1 : -1;
      const wb = `wheel${k}${side}`;
      const z = WZ[k];
      const cx = s * 1.55;
      cyl(TIRE, 0.65, 0.56, 12, [cx, 0.62, z], [0, 0, 90], 0, wb);
      cyl(RUB, 0.54, 0.585, 12, [cx, 0.62, z], [0, 0, 90], 0, wb);
      cyl(GUN, 0.36, 0.62, 8, [cx, 0.62, z], [0, 0, 90], 0, wb);
      cone(STEEL, 0.14, 0.14, 8, [s * 1.9, 0.62, z], [0, 0, -90 * s], 0, wb);
      ring(CYAN, 0.45, 0.028, [s * 1.85, 0.62, z], [0, 90, 0], 1.5, wb);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(STEEL, 0.03, 0.07, 6, [s * 1.87, 0.62 + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27], [0, 0, 90], 0, wb);
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box(TIRE, [0.5, 0.1, 0.22], [cx, 0.62 + Math.cos(a) * 0.67, z + Math.sin(a) * 0.67], [(a * 180) / Math.PI, 0, 0], 0, wb);
      }
    }

  // ---- chassis ----
  for (const s of [1, -1]) {
    box(GUN, [0.28, 0.3, 8.6], [s * 0.55, 1.0, 0]);
    box(RUB, [0.05, 0.4, 0.4], [s * 1.0, 0.95, 0]);
    box(CYAN, [0.05, 0.04, 7], [s * 0.38, 0.82, 0], [0, 0, 0], 1.5);
    box(MAG, [0.04, 0.04, 2.4], [s * 1.41, 0.84, 0.65], [0, 0, 0], 1.6);
    cyl(TANK, 0.3, 2.0, 8, [s * 0.95, 0.95, 0.6], [90, 0, 0]);
    for (const dz of [-0.6, 0, 0.6]) cyl(DARK, 0.32, 0.08, 8, [s * 0.95, 0.95, 0.6 + dz], [90, 0, 0]);
    // skirts
    box(GUN, [0.1, 0.55, 2.5], [s * 1.45, 1.1, 0.65]);
    for (let i = 0; i < 5; i++) box(STEEL, [0.04, 0.05, 0.05], [s * 1.51, 1.3, -0.4 + i * 0.5]);
    // fenders, mud flaps, shocks per wheel
    for (const k of ["F", "M", "R"]) {
      const z = WZ[k];
      box(GUN, [0.8, 0.1, 1.5], [s * 1.62, 1.4, z]);
      box(GUN, [0.06, 0.32, 1.5], [s * 2.0, 1.2, z]);
      box(GUN, [0.8, 0.1, 0.4], [s * 1.62, 1.28, z + 0.85], [-35, 0, 0]);
      box(GUN, [0.8, 0.1, 0.4], [s * 1.62, 1.28, z - 0.85], [35, 0, 0]);
      box(CYAN, [0.04, 0.04, 1.5], [s * 2.0, 1.04, z], [0, 0, 0], 1.4);
      box(DARK, [0.55, 0.5, 0.04], [s * 1.6, 0.92, z - 0.76]);
      cyl(BRASS, 0.05, 0.55, 6, [s * 1.0, 1.0, z], [0, 0, s * 12]);
      box(STEEL, [0.12, 0.05, 1.4], [s * 0.9, 0.78, z]);
    }
  }
  for (const z of [3.6, 1.0, -0.4, -2.2, -4.0]) box(GUN, [1.5, 0.2, 0.25], [0, 0.95, z]);
  for (const k of ["F", "M", "R"]) {
    cyl(STEEL, 0.09, 3.0, 8, [0, 0.62, WZ[k]], [0, 0, 90]);
    ball(GUN, 0.22, [0, 0.62, WZ[k]]);
  }
  cyl(STEEL, 0.06, 7, 6, [0, 0.76, 0], [90, 0, 0]);
  box(DARK, [2.4, 0.3, 5.8], [0, 1.3, -1.35]);

  // ---- cab ----
  const CAB: [number, number][] = [
    [1.9, 1.0],
    [4.4, 1.0],
    [4.4, 1.7],
    [3.7, 2.0],
    [3.1, 2.9],
    [1.9, 2.9],
  ];
  b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: CABP, bone: body });
  // windshield
  decal(WINDSHIELD, 2.2, 1.0, [0, 2.462, 3.417], [0, 0.555, 0.832], 0.7);
  for (const x of [-1.12, 0, 1.12]) box(GUN, [0.08, 1.12, 0.06], [x, 2.47, 3.43], [-33.7, 0, 0]);
  box(GUN, [2.5, 0.07, 0.45], [0, 2.96, 3.22]);
  box(CYAN, [2.2, 0.03, 0.04], [0, 2.94, 3.45], [0, 0, 0], 1.4);
  box(GUN, [2.4, 0.1, 0.1], [0, 1.96, 3.78], [0, 0, 0]);
  // hood
  box(GUN, [2.3, 0.06, 0.3], [0, 1.99, 3.72], [-23, 0, 0]);
  for (const x of [-0.7, 0, 0.7]) {
    box(DARK, [0.5, 0.04, 0.5], [x, 1.935, 3.98], [23.2, 0, 0]);
    for (const dz of [-0.12, 0.0, 0.12]) box(YEL, [0.4, 0.02, 0.03], [x, 1.95 - dz * 0.43, 3.98 + dz], [23.2, 0, 0], 1.0);
  }
  // front fascia
  decal(GRILLE, 1.3, 0.5, [0, 1.35, 4.405], [0, 0, 1]);
  for (const s of [1, -1]) decal(HEADLIGHT, 0.5, 0.25, [s * 0.95, 1.4, 4.405], [0, 0, 1], 1.6);
  box(MAG, [2.3, 0.04, 0.04], [0, 1.66, 4.41], [0, 0, 0], 1.6);
  box(GUN, [2.3, 0.22, 0.1], [0, 1.1, 4.43]);
  // bumper
  box(GUN, [2.8, 0.45, 0.5], [0, 0.85, 4.5]);
  decal(HAZARD, 2.6, 0.3, [0, 0.87, 4.755], [0, 0, 1]);
  for (let i = 0; i < 7; i++) cone(STEEL, 0.07, 0.4, 6, [-1.2 + i * 0.4, 0.95, 4.95], [90, 0, 0]);
  cyl(GUN, 0.12, 1.1, 8, [0, 0.55, 4.85], [0, 0, 90]);
  box(STEEL, [0.08, 0.2, 0.08], [0, 0.45, 5.0]);
  for (const s of [1, -1]) {
    cyl(DARK, 0.12, 0.2, 8, [s * 1.3, 1.25, 4.5]);
    ring(CYAN, 0.12, 0.02, [s * 1.3, 1.36, 4.5], [90, 0, 0], 1.6);
    box(AMBER, [0.1, 0.1, 0.06], [s * 1.35, 0.9, 4.77], [0, 0, 0], 1.4);
  }
  // doors & plates
  for (const s of [1, -1]) {
    box(GUN, [0.1, 0.65, 1.6], [s * 1.25, 1.78, 2.8]);
    box(DARK, [0.02, 0.62, 0.02], [s * 1.305, 1.78, 2.15]);
    box(DARK, [0.02, 0.62, 0.02], [s * 1.305, 1.78, 3.45]);
    box(DARK, [0.02, 0.02, 1.3], [s * 1.305, 1.78, 2.8]);
    box(STEEL, [0.05, 0.06, 0.22], [s * 1.33, 1.95, 2.45]);
    decal(EMBLEM, 0.45, 0.45, [s * 1.307, 1.7, 3.0], [s, 0, 0]);
    decal(SIDEWIN, 0.95, 0.5, [s * 1.211, 2.5, 2.62], [s, 0, 0], 0.5);
    // mirrors
    box(GUN, [0.3, 0.05, 0.05], [s * 1.35, 2.35, 3.5]);
    box(GUN, [0.06, 0.3, 0.2], [s * 1.5, 2.4, 3.5]);
    box(CYAN, [0.02, 0.2, 0.12], [s * 1.535, 2.4, 3.5], [0, 0, 0], 1.0);
    // exhaust stacks
    cyl(STEEL, 0.1, 1.9, 8, [s * 1.05, 2.45, 1.75]);
    cyl(GUN, 0.14, 0.5, 8, [s * 1.05, 2.0, 1.75]);
    cyl(DARK, 0.13, 0.08, 8, [s * 1.05, 3.42, 1.75]);
    cyl(ORG, 0.07, 0.03, 8, [s * 1.05, 3.46, 1.75], [0, 0, 0], 2.0);
    // rear antennas
    cyl(STEEL, 0.02, 1.4, 5, [s * 1.2, 3.7, -4.1]);
    box(GUN, [0.12, 0.1, 0.12], [s * 1.2, 3.0, -4.1]);
    ball(s > 0 ? MAG : CYAN, 0.05, [s * 1.2, 4.4, -4.1], 2.0);
    // cab roof antenna
    cyl(STEEL, 0.015, 1.3, 5, [s * 1.0, 3.55, 1.95]);
    ball(s > 0 ? CYAN : MAG, 0.04, [s * 1.0, 4.2, 1.95], 2.0);
  }
  // roof
  box(ROOFP as unknown as string, [2.2, 0.06, 1.1], [0, 2.93, 2.5]);
  for (let i = 0; i < 8; i++) box(i % 2 ? CYAN : MAG, [0.26, 0.06, 0.1], [(i - 3.5) * 0.28, 2.99, 3.04], [0, 0, 0], 1.8);
  cyl(GUN, 0.05, 0.2, 6, [0.65, 3.0, 2.4]);
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.5, 0.2],
      [0.5, 0.23],
      [0.1, 0.04],
      [0, 0.04],
    ],
    { at: [0.65, 3.08, 2.4], axis: [0, 0.85, 0.5], segments: 10, bone: body, color: STEEL },
  );
  ball(RED, 0.04, [0.65, 3.4, 2.6], 2.0);
  box(GUN, [0.4, 0.2, 0.4], [-0.6, 3.05, 2.3]);
  ball(CYAN, 0.12, [-0.6, 3.22, 2.3], 1.2);
  // gap fill
  box(DARK, [1.8, 1.3, 0.3], [0, 2.15, 1.75]);

  // ---- cargo container ----
  b.part(new THREE.BoxGeometry(2.6, 1.5, 5.9), BEDP, { bone: body, at: [0, 2.2, -1.35] });
  b.part(new THREE.BoxGeometry(2.3, 0.08, 5.4), ROOFP, { bone: body, at: [0, 2.99, -1.5] });
  for (const s of [1, -1]) {
    for (const z of [1.45, -0.2, -2.55, -4.2]) box(GUN, [0.06, 1.5, 0.12], [s * 1.33, 2.2, z]);
    box(GUN, [0.06, 0.1, 5.9], [s * 1.33, 2.93, -1.35]);
    box(GUN, [0.06, 0.1, 5.9], [s * 1.33, 1.5, -1.35]);
    box(CYAN, [0.04, 0.04, 5.8], [s * 1.36, 1.57, -1.35], [0, 0, 0], 1.5);
    box(MAG, [0.04, 0.04, 5.8], [s * 1.36, 2.87, -1.35], [0, 0, 0], 1.5);
    box(GUN, [0.06, 0.1, 5.4], [s * 1.2, 3.08, -1.5]);
    decal(EMBLEM, 1.3, 1.3, [s * 1.347, 2.2, -1.5], [s, 0, 0]);
    decal(PLATE, 1.6, 0.4, [s * 1.347, 2.6, -3.3], [s, 0, 0], 0.4);
    decal(PLATE, 1.2, 0.3, [s * 1.347, 2.6, 0.45], [s, 0, 0], 0.4);
    decal(HAZARD, 5.6, 0.22, [s * 1.347, 1.78, -1.35], [s, 0, 0]);
    // missile pods
    box(GUN, [0.9, 0.55, 1.5], [s * 0.85, 3.28, -2.4]);
    box(YEL, [0.92, 0.04, 0.3], [s * 0.85, 3.57, -2.4]);
    for (const dx of [-0.2, 0.2])
      for (const y of [3.17, 3.4]) {
        cyl(DARK, 0.1, 0.05, 8, [s * 0.85 + dx, y, -1.64], [90, 0, 0]);
        cone(RED, 0.08, 0.16, 6, [s * 0.85 + dx, y, -1.6], [90, 0, 0]);
      }
    box(GUN, [0.3, 0.1, 0.5], [s * 0.85, 3.02, -2.4]);
    // fans
    cyl(DARK, 0.3, 0.06, 8, [s * 0.7, 3.07, -3.8]);
    ring(CYAN, 0.3, 0.02, [s * 0.7, 3.1, -3.8], [90, 0, 0], 1.4);
    for (const a of [0, 60, 120]) box(STEEL, [0.5, 0.02, 0.08], [s * 0.7, 3.1, -3.8], [0, a, 0]);
    // holo sign rods
    cyl(GUN, 0.03, 0.45, 6, [s * 0.65, 3.2, -4.08]);
    // rear lights
    box(RED, [0.3, 0.3, 0.08], [s * 1.05, 1.8, -4.33], [0, 0, 0], 1.8);
    box(RED, [0.3, 0.3, 0.08], [s * 1.05, 2.55, -4.33], [0, 0, 0], 1.8);
  }
  // roof turret ring and fittings
  cyl(GUN, 0.65, 0.16, 12, [0, 3.1, -0.9]);
  box(DARK, [1.3, 0.2, 0.9], [0, 3.1, -3.0]);
  for (let i = 0; i < 6; i++) box(DARK, [0.6, 0.05, 0.05], [0, 3.07, -0.5 - i * 0.0 + 1.0 + i * 0.1 - 0.0], [0, 0, 0]);
  // rear
  box(GUN, [2.8, 0.4, 0.4], [0, 1.2, -4.45]);
  box(RED, [2.4, 0.04, 0.04], [0, 1.0, -4.67], [0, 0, 0], 1.5);
  cyl(STEEL, 0.1, 0.3, 8, [0, 1.2, -4.75], [90, 0, 0]);
  decal(DOORLINES, 2.4, 1.3, [0, 2.1, -4.305], [0, 0, -1]);
  decal(HAZARD, 2.6, 0.25, [0, 1.62, -4.306], [0, 0, -1]);
  // holo sign
  decal(HOLO, 1.6, 0.72, [0, 3.7, -4.05], [0, 0, 1], 1.3);
  decal(HOLO, 1.6, 0.72, [0, 3.7, -4.07], [0, 0, -1], 1.3);

  // ---- turret ----
  box(STEEL, [1.0, 0.08, 1.0], [0, 3.2, -0.9], [0, 0, 0], 0, "turret");
  box(OLV, [1.1, 0.55, 1.3], [0, 3.5, -0.9], [0, 0, 0], 0, "turret");
  box(DARK, [0.5, 0.2, 0.3], [0, 3.92, -1.15], [0, 0, 0], 0, "turret");
  ball(RED, 0.05, [-0.12, 3.96, -1.0], 2.0, "turret");
  ball(RED, 0.05, [0.12, 3.96, -1.0], 2.0, "turret");
  cyl(GUN, 0.3, 0.2, 8, [0, 3.85, -0.8], [0, 0, 0], 0, "turret");
  for (const s of [1, -1]) {
    box(GUN, [0.06, 0.5, 1.2], [s * 0.62, 3.55, -0.9], [0, 0, s * 12], 0, "turret");
    box(OLV, [0.3, 0.4, 0.5], [s * 0.75, 3.4, -1.15], [0, 0, 0], 0, "turret");
    box(BRASS, [0.05, 0.25, 0.12], [s * 0.92, 3.4, -0.9], [0, 0, 0], 0, "turret");
    cyl(STEEL, 0.06, 2.0, 8, [s * 0.28, 3.6, 0.4], [90, 0, 0], 0, "gun");
    cyl(GUN, 0.1, 0.9, 8, [s * 0.28, 3.6, -0.1], [90, 0, 0], 0, "gun");
    for (const z of [0.7, 1.0]) cyl(DARK, 0.075, 0.06, 8, [s * 0.28, 3.6, z], [90, 0, 0], 0, "gun");
    cyl(DARK, 0.09, 0.2, 8, [s * 0.28, 3.6, 1.45], [90, 0, 0], 0, "gun");
    cyl(ORG, 0.045, 0.04, 6, [s * 0.28, 3.6, 1.57], [90, 0, 0], 2.0, "gun");
  }
  box(GUN, [0.9, 0.3, 0.4], [0, 3.6, -0.3], [0, 0, 0], 0, "gun");
  decal(RETICLE, 0.4, 0.4, [0, 3.42, -0.248], [0, 0, 1], 1.2, turret);

  // ---- cables ----
  b.sweep(
    catmull([
      [0.3, 3.0, -0.5],
      [0.4, 3.1, 0.6],
      [0.2, 2.98, 1.8],
    ]),
    0.03,
    { color: DARK, bone: body, section: { ngon: 5 } },
  );
  b.sweep(
    catmull([
      [-0.3, 3.0, -0.5],
      [-0.5, 3.12, 0.6],
      [-0.5, 2.98, 1.8],
    ]),
    0.03,
    { color: MAG, bone: body, section: { ngon: 5 } },
  );
  b.sweep(
    catmull([
      [-1.0, 3.1, -3.7],
      [-1.1, 3.2, -2.0],
      [-0.9, 3.1, -0.9],
    ]),
    0.025,
    { color: DARK, bone: body, section: { ngon: 5 } },
  );

  // ---- flush batches ----
  for (const [key, list] of BAT) {
    const [color, gs, bn] = key.split("|");
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const part = b.part(merged, color, { bone: J[bn], at: [0, 0, 0], flat: true });
    if (+gs > 0) glow(part, +gs);
  }
  return b.root;
}
const AMBER = "#ffb02e";
```