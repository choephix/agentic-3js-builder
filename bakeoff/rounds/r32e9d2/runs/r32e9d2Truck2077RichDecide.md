```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { mottle, countershade } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Wraith-77 Armored Hauler",
  description:
    "Low-poly cyberpunk militarized 6x6 truck from 2077: armored cab, sealed cargo container, missile rack, remote turret, neon underglow and hazard-striped bumpers.",
};

type V = [number, number, number];

// ---- palette ----
const GUN = "#23272e";
const BLACK = "#101216";
const STEEL = "#4b525e";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffc400";
const RED = "#ff2a2a";
const ORANGE = "#ff8a1c";
const OLIVE = "#46503f";

// ---- textures ----
const HAZARD = (() => {
  let g = "";
  for (let i = -2; i < 10; i++)
    g += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 13},0 ${i * 10 + 8},0"/>`;
  return svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="${YELLOW}"/><g fill="#111">${g}</g><rect width="64" height="16" fill="none" stroke="#111" stroke-width="2"/></svg>`,
    { size: 256 },
  );
})();

const SIDE = svg(
  `<svg viewBox="0 0 200 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="64" fill="#1b2128"/>
  <rect x="2" y="2" width="196" height="60" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
  <path d="M6 58 H60 L68 50 H130" stroke="${CYAN}" stroke-width="1.5" fill="none"/>
  <path d="M194 6 H150 L142 14 H100" stroke="${MAGENTA}" stroke-width="1.5" fill="none"/>
  <text x="12" y="30" font-family="monospace" font-weight="bold" font-size="20" fill="${CYAN}">WRAITH-77</text>
  <text x="12" y="44" font-family="monospace" font-size="9" fill="#9fb4c4">NEO-ARMA LOGISTICS // CLASS IX</text>
  <g fill="#c8d6e0">${Array.from({ length: 24 }, (_, i) => `<rect x="${120 + i * 3}" y="40" width="${1 + (i * 7) % 2}" height="12"/>`).join("")}</g>
  <circle cx="165" cy="26" r="13" fill="none" stroke="${MAGENTA}" stroke-width="2"/>
  <path d="M165 15 L172 30 H158Z" fill="${MAGENTA}"/>
  <rect x="100" y="12" width="40" height="3" fill="${YELLOW}"/>
  <rect x="100" y="18" width="24" height="3" fill="${YELLOW}"/>
  <g fill="${CYAN}"><circle cx="8" cy="8" r="1.6"/><circle cx="192" cy="56" r="1.6"/></g>
  </svg>`,
  { size: 1024 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,3 58,17 58,47 32,61 6,47 6,17" fill="#14181e" stroke="${CYAN}" stroke-width="3"/>
  <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="none" stroke="${MAGENTA}" stroke-width="2"/>
  <path d="M20 40 L32 18 L44 40 L32 34Z" fill="${YELLOW}"/>
  <text x="32" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="${CYAN}">77</text></svg>`,
  { size: 256 },
);

const GRILL = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" fill="#0a0c10"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${3 + i * 7.6}" y="3" width="4" height="18" fill="${i % 2 ? CYAN : "#1c6f7a"}"/>`).join("")}
  <rect width="64" height="24" fill="none" stroke="#333b46" stroke-width="2"/></svg>`,
  { size: 256 },
);

const HUD = svg(
  `<svg viewBox="0 0 128 56" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="56" fill="#08262e"/>
  <rect width="128" height="56" fill="url(#g)"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f6a7c" stop-opacity="0.8"/><stop offset="1" stop-color="#021218" stop-opacity="0.2"/></linearGradient></defs>
  <path d="M0 40 H30 L38 32 H90 L98 40 H128" stroke="${CYAN}" stroke-width="1" fill="none"/>
  <circle cx="64" cy="22" r="10" fill="none" stroke="${CYAN}" stroke-width="0.8"/>
  <path d="M64 8 V14 M64 30 V36 M50 22 H56 M72 22 H78" stroke="${CYAN}" stroke-width="0.8"/>
  <text x="6" y="10" font-family="monospace" font-size="6" fill="${CYAN}">SPD 084  HDG 271</text>
  <text x="88" y="10" font-family="monospace" font-size="6" fill="${MAGENTA}">THREAT: LOW</text>
  <path d="M0 0 L40 56 M128 0 L88 56" stroke="#0b3d4a" stroke-width="0.6"/></svg>`,
  { size: 512 },
);

const PLATE = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" rx="2" fill="#e8e8e0" stroke="#111" stroke-width="2"/>
  <rect x="3" y="3" width="58" height="5" fill="${MAGENTA}"/>
  <text x="32" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#111">KRX-2077</text></svg>`,
  { size: 256 },
);

const WARN = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,28 2,28" fill="${YELLOW}" stroke="#111" stroke-width="2"/>
  <rect x="14.5" y="10" width="3" height="10" fill="#111"/><circle cx="16" cy="23.5" r="1.8" fill="#111"/></svg>`,
  { size: 128 },
);

// ---- paints ----
const HULL = panelled(metal("iron", { tarnish: 0.5, seed: 3 }), { size: 0.35, rivets: 0.07 });
const ARMOR = panelled(mottle(OLIVE, "#2f362c", { size: 0.5, seed: 5 }), { size: 0.45, aspect: 0.8, rivets: 0.08 });
const CAB = panelled(countershade("#3c4350", "#1d2128", { level: 0.1 }), { size: 0.4, rivets: 0.08 });
const DARKM = metal("iron", { polish: 0.1, tarnish: 0.6, seed: 9 });
const STEELM = metal("steel", { polish: 0.2, tarnish: 0.4 });

export default function build() {
  const b = createBuilder({ name: "wraith77" });

  const P = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { at, flat: true, ...o });
  const box = (s: V, color: any, at: V, o: any = {}) => P(new THREE.BoxGeometry(s[0], s[1], s[2]), color, at, o);
  const cyl = (r: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0], r2?: number) =>
    P(new THREE.CylinderGeometry(r, r2 ?? r, h, seg), color, at, { dir });
  const lit = <T,>(p: T, k = 1) => glow(p as any, k) as T;
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const sph = (r: number, color: any, at: V, ws = 8, hs = 6) => P(new THREE.SphereGeometry(r, ws, hs), color, at);

  // ================= wheels =================
  const WR = 0.65;
  const wheelZ = [2.4, -1.55, -3.0];
  const wheel = (s: number, zc: number) => {
    const x = s * 1.3;
    cyl(0.6, 0.5, 14, BLACK, [x, WR, zc], [1, 0, 0]);
    for (let i = 0; i < 14; i++) {
      const th = (i / 14) * Math.PI * 2;
      box([0.52, 0.09, 0.2], "#07080a", [x, WR + 0.62 * Math.cos(th), zc + 0.62 * Math.sin(th)], {
        rotation: [(th * 180) / Math.PI, 0, 0],
      });
    }
    const ox = s * 0.27;
    cyl(0.36, 0.06, 10, STEELM, [x + ox, WR, zc], [s, 0, 0]);
    cyl(0.5, 0.03, 12, GUN, [x + ox * 0.9, WR, zc], [s, 0, 0]);
    lit(P(new THREE.TorusGeometry(0.43, 0.025, 4, 14), CYAN, [x + s * 0.285, WR, zc], { dir: [s, 0, 0], axis: "z" }), 1.4);
    cyl(0.1, 0.09, 8, DARKM, [x + s * 0.32, WR, zc], [s, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const th = (i / 6) * Math.PI * 2;
      cyl(0.035, 0.05, 6, YELLOW, [x + s * 0.31, WR + 0.25 * Math.cos(th), zc + 0.25 * Math.sin(th)], [s, 0, 0]);
    }
  };
  for (const s of [1, -1]) for (const z of wheelZ) wheel(s, z);

  // axles, diffs, driveshaft
  for (const z of wheelZ) {
    cyl(0.1, 2.5, 8, DARKM, [0, WR, z], [1, 0, 0]);
    sph(0.24, STEELM, [0, WR, z], 8, 6);
  }
  cyl(0.06, 6.0, 8, STEEL, [0, 0.85, -0.3], [0, 0, 1]);

  // fenders
  for (const s of [1, -1])
    for (const z of wheelZ) {
      box([0.8, 0.1, 1.5], HULL, [s * 1.3, 1.37, z]);
      box([0.06, 0.28, 1.5], GUN, [s * 1.66, 1.25, z]);
      lit(box([0.02, 0.03, 1.4], YELLOW, [s * 1.7, 1.38, z]), 1);
    }
  // mud flaps
  for (const s of [1, -1]) box([0.7, 0.5, 0.05], BLACK, [s * 1.3, 0.95, -3.72]);

  // ================= chassis =================
  for (const s of [1, -1]) {
    box([0.26, 0.32, 7.2], GUN, [s * 0.55, 1.02, -0.2]);
    lit(box([0.04, 0.04, 6.8], MAGENTA, [s * 0.8, 0.7, -0.2]), 1.4); // underglow
  }
  for (let i = 0; i < 7; i++) box([1.4, 0.15, 0.2], DARKM, [0, 1.0, -3.4 + i * 1.0]);
  box([1.7, 0.1, 6.6], HULL, [0, 0.76, -0.2]); // skid plate
  lit(box([1.5, 0.03, 6.0], MAGENTA, [0, 0.69, -0.2]), 0.9);
  // fuel tanks + skirts
  for (const s of [1, -1]) {
    cyl(0.3, 1.3, 10, STEELM, [s * 1.0, 1.0, 0.45], [0, 0, 1]);
    for (const dz of [-0.35, 0.35]) cyl(0.31, 0.06, 10, YELLOW, [s * 1.0, 1.0, 0.45 + dz], [0, 0, 1]);
    box([0.06, 0.42, 2.5], ARMOR, [s * 1.28, 1.15, 0.45]);
  }

  // ================= cab =================
  const cabOutline: [number, number, "sharp"][] = [
    [0.7, 1.3, "sharp"], [3.1, 1.3, "sharp"], [3.1, 1.8, "sharp"], [2.9, 2.0, "sharp"],
    [2.2, 2.1, "sharp"], [1.75, 2.95, "sharp"], [0.9, 3.0, "sharp"], [0.7, 2.85, "sharp"],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: CAB });
  // windshield & side windows
  lit(decal(HUD, 2.0, 0.92, [0, 2.54, 1.98], [0, 0.884, 0.468]), 0.55);
  for (const s of [1, -1]) {
    lit(box([0.03, 0.5, 0.85], "#0b3a46", [s * 1.16, 2.45, 1.45]), 0.5);
    box([0.05, 0.06, 0.95], GUN, [s * 1.17, 2.72, 1.45]);
    box([0.05, 0.06, 0.95], GUN, [s * 1.17, 2.18, 1.45]);
    // door plate + emblem
    box([0.05, 0.65, 0.95], ARMOR, [s * 1.17, 1.68, 1.45]);
    decal(EMBLEM, 0.5, 0.5, [s * 1.2, 1.68, 1.45], [s, 0, 0]);
    box([0.07, 0.04, 0.22], GUN, [s * 1.2, 1.9, 1.05]); // handle
    // side step
    box([0.2, 0.06, 1.0], STEEL, [s * 1.25, 1.2, 1.5]);
    // mirror
    cyl(0.02, 0.35, 5, STEEL, [s * 1.3, 2.35, 2.2], [s, 0.2, 0]);
    box([0.1, 0.3, 0.22], GUN, [s * 1.48, 2.4, 2.2]);
    lit(box([0.02, 0.22, 0.16], CYAN, [s * 1.43, 2.4, 2.2]), 1.0);
    // armored vents on hood sides
    box([0.04, 0.2, 0.7], GUN, [s * 1.16, 1.62, 2.55]);
    lit(box([0.02, 0.04, 0.6], ORANGE, [s * 1.19, 1.62, 2.55]), 1.2);
    // headlights
    lit(box([0.6, 0.14, 0.05], "#e8ffff", [s * 0.8, 1.6, 3.12]), 2.0);
    box([0.7, 0.04, 0.07], GUN, [s * 0.8, 1.72, 3.12]);
    // roof searchlights
    cyl(0.09, 0.22, 8, GUN, [s * 0.85, 3.12, 2.0], [0, 0.4, 1]);
    lit(cyl(0.075, 0.02, 8, "#ffffff", [s * 0.85, 3.12 + 0.02, 2.0 + 0.1], [0, 0.4, 1]), 2);
    // hood vents
    for (let i = 0; i < 3; i++) lit(box([0.28, 0.02, 0.1], CYAN, [s * 0.55, 2.07, 2.35 + i * 0.2]), 1.2);
    // antennas
    cyl(0.015, 1.5, 5, STEEL, [s * 1.05, 3.7, 0.9]);
    lit(sph(0.05, MAGENTA, [s * 1.05, 4.46, 0.9], 6, 4), 2);
  }
  // grille
  lit(decal(GRILL, 1.0, 0.38, [0, 1.55, 3.115], [0, 0, 1]), 0.8);
  // roof gear
  box([1.7, 0.12, 0.28], GUN, [0, 3.06, 1.55]);
  lit(box([0.7, 0.07, 0.3], CYAN, [-0.5, 3.1, 1.56]), 1.6);
  lit(box([0.7, 0.07, 0.3], MAGENTA, [0.5, 3.1, 1.56]), 1.6);
  P(new THREE.SphereGeometry(0.24, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEELM, [0, 3.0, 1.0]);
  lit(sph(0.07, RED, [0, 3.2, 1.12], 6, 4), 2);
  box([2.0, 0.06, 0.4], GUN, [0, 2.97, 2.2], { rotation: [-18, 0, 0] }); // roof visor
  // rear cab wall details
  box([2.0, 1.4, 0.08], GUN, [0, 2.0, 0.66]);
  decal(WARN, 0.3, 0.3, [-0.7, 2.6, 0.615], [0, 0, -1]);

  // ================= front bumper =================
  b.extrude(
    [[2.9, 0.85, "sharp"], [3.7, 1.0, "sharp"], [3.78, 1.45, "sharp"], [3.3, 1.5, "sharp"], [2.9, 1.4, "sharp"]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.04, color: HULL },
  );
  decal(HAZARD, 2.3, 0.3, [0, 1.2, 3.785], [0, 0, 1]);
  decal(PLATE, 0.5, 0.19, [0, 1.38, 3.79], [0, 0, 1]);
  for (let i = 0; i < 5; i++) {
    const x = -1.0 + i * 0.5;
    P(new THREE.ConeGeometry(0.07, 0.35, 5), STEEL, [x, 1.1, 3.95], { dir: [0, 0, 1] });
  }
  // winch
  cyl(0.11, 1.5, 8, DARKM, [0, 0.98, 3.55], [1, 0, 0]);
  cyl(0.125, 0.06, 8, YELLOW, [0.4, 0.98, 3.55], [1, 0, 0]);
  cyl(0.125, 0.06, 8, YELLOW, [-0.4, 0.98, 3.55], [1, 0, 0]);
  for (const s of [1, -1]) {
    box([0.16, 0.16, 0.3], RED, [s * 1.0, 0.95, 3.8]);
    cyl(0.06, 0.25, 6, STEEL, [s * 1.2, 1.28, 3.82], [0, 0, 1]);
    lit(box([0.3, 0.05, 0.05], MAGENTA, [s * 1.05, 1.47, 3.8]), 1.5);
  }

  // ================= cargo container =================
  const CL = 4.1, CZ = -1.85;
  box([2.5, 1.6, CL], ARMOR, [0, 2.15, CZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box([0.14, 1.7, 0.14], GUN, [sx * 1.25, 2.15, CZ + (sz * CL) / 2]);
  for (const y of [1.38, 2.92]) {
    box([2.6, 0.1, CL + 0.1], GUN, [0, y, CZ]);
  }
  for (let i = 0; i < 6; i++) box([2.55, 0.05, 0.1], GUN, [0, 2.97, CZ - 1.7 + i * 0.68]);
  for (const s of [1, -1]) {
    decal(SIDE, 3.7, 1.15, [s * 1.255, 2.3, CZ], [s, 0, 0]);
    // vertical ribs and glow
    for (let i = 0; i < 6; i++) box([0.05, 1.3, 0.06], GUN, [s * 1.27, 2.2, CZ - 1.9 + i * 0.76]);
    lit(box([0.03, 0.04, 3.9], CYAN, [s * 1.27, 1.58, CZ]), 1.6);
    // jerry cans
    for (let i = 0; i < 3; i++) {
      box([0.18, 0.4, 0.34], OLIVE, [s * 1.35, 1.62, -0.05 - i * 0.0 + (i - 1) * 0.0 - 0.0 + 0 * i - 0.02 * i + (-0.0)] as V, {});
    }
  }
  // fix can spread (second pass handled above by identical coordinates avoided): stack cans visibly
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      box([0.18, 0.4, 0.3], i === 1 ? YELLOW : RED, [s * 1.37, 1.62, -0.55 + i * 0.0 - 0.0 + (i - 1) * 0.0] as V, {
        scale: [1, 1, 1],
      });
    }
  // rear door
  box([2.3, 1.4, 0.08], HULL, [0, 2.15, CZ - CL / 2 - 0.04]);
  decal(HAZARD, 2.2, 0.28, [0, 1.65, CZ - CL / 2 - 0.09], [0, 0, -1]);
  decal(EMBLEM, 0.6, 0.6, [0, 2.45, CZ - CL / 2 - 0.09], [0, 0, -1]);
  decal(PLATE, 0.5, 0.19, [0.7, 1.5, CZ - CL / 2 - 0.09 - 0.0], [0, 0, -1]);
  for (const s of [1, -1]) {
    box([0.12, 1.3, 0.12], GUN, [s * 0.5, 2.15, CZ - CL / 2 - 0.12]); // door bars
    lit(box([0.35, 0.16, 0.06], RED, [s * 1.0, 1.45, CZ - CL / 2 - 0.1]), 1.8); // taillights
    cyl(0.03, 1.4, 5, STEEL, [s * 0.5, 0.0, 0].map((v, i) => (i === 1 ? 2.15 : i === 2 ? CZ - CL / 2 - 0.2 : v)) as V);
  }
  // rear bumper & hitch
  box([2.6, 0.3, 0.3], HULL, [0, 1.1, -4.0]);
  decal(HAZARD, 2.5, 0.2, [0, 1.1, -4.16], [0, 0, -1]);
  cyl(0.1, 0.3, 8, STEELM, [0, 0.95, -4.25], [0, 0, 1]);
  // ladder
  for (const s of [1, -1]) cyl(0.025, 1.6, 5, STEEL, [s * 0.9, 2.15, -3.97]);
  for (let i = 0; i < 6; i++) cyl(0.02, 1.8, 5, STEEL, [0, 1.5 + i * 0.25, -3.97], [1, 0, 0]);

  // ================= exhaust stacks =================
  for (const s of [1, -1]) {
    cyl(0.1, 2.3, 8, STEELM, [s * 1.05, 2.5, 0.42]);
    box([0.1, 1.2, 0.3], GUN, [s * 1.05, 2.2, 0.28]);
    lit(P(new THREE.TorusGeometry(0.1, 0.03, 4, 8), ORANGE, [s * 1.05, 3.65, 0.42], { dir: [0, 1, 0], axis: "z", rotation: [90, 0, 0] }), 1.6);
    for (const y of [1.8, 2.5]) cyl(0.125, 0.08, 8, DARKM, [s * 1.05, y, 0.42]);
  }

  // ================= remote turret =================
  const TZ = -0.9, TY = 3.0;
  cyl(0.55, 0.14, 12, GUN, [0, TY + 0.05, TZ]);
  cyl(0.5, 0.06, 12, YELLOW, [0, TY + 0.14, TZ]);
  box([0.95, 0.42, 1.0], HULL, [0, TY + 0.4, TZ]);
  box([0.7, 0.2, 0.7], GUN, [0, TY + 0.68, TZ - 0.1], { rotation: [0, 0, 0] });
  for (const s of [1, -1]) {
    cyl(0.07, 1.7, 8, STEELM, [s * 0.22, TY + 0.4, TZ + 1.0], [0, 0, 1]);
    cyl(0.1, 0.25, 8, GUN, [s * 0.22, TY + 0.4, TZ + 1.9], [0, 0, 1]);
    cyl(0.12, 0.5, 8, DARKM, [s * 0.22, TY + 0.4, TZ + 0.35], [0, 0, 1]);
    box([0.1, 0.35, 0.5], OLIVE, [s * 0.55, TY + 0.4, TZ - 0.1]); // ammo box
    lit(box([0.02, 0.05, 0.3], ORANGE, [s * 0.6, TY + 0.4, TZ - 0.1]), 1);
  }
  lit(box([0.3, 0.16, 0.08], CYAN, [0, TY + 0.75, TZ + 0.45]), 2.2); // sensor eye
  cyl(0.02, 0.8, 5, STEEL, [0.3, TY + 1.1, TZ - 0.4]);
  lit(sph(0.04, RED, [0.3, TY + 1.5, TZ - 0.4], 6, 4), 2);

  // ================= missile rack =================
  const MZ = -2.95, MY = 3.05;
  box([2.0, 0.18, 1.6], GUN, [0, MY, MZ]);
  const d = new THREE.Vector3(0, 0.5, 0.85).normalize();
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++) {
      const x = -0.72 + c * 0.48;
      const y = MY + 0.3 + r * 0.38;
      const center: V = [x, y + 0.2, MZ - 0.1];
      cyl(0.17, 1.3, 8, r ? HULL : GUN, center, [d.x, d.y, d.z]);
      const tip: V = [center[0] + d.x * 0.66, center[1] + d.y * 0.66, center[2] + d.z * 0.66];
      cyl(0.15, 0.04, 8, BLACK, tip, [d.x, d.y, d.z]);
      lit(P(new THREE.ConeGeometry(0.08, 0.2, 6), c % 2 ? RED : ORANGE, [tip[0] - d.x * 0.03, tip[1] - d.y * 0.03, tip[2] - d.z * 0.03], { dir: [d.x, d.y, d.z] }), 1.8);
      cyl(0.18, 0.06, 8, YELLOW, [center[0] - d.x * 0.3, center[1] - d.y * 0.3, center[2] - d.z * 0.3], [d.x, d.y, d.z]);
    }
  for (const s of [1, -1]) {
    box([0.1, 0.5, 0.1], STEEL, [s * 0.95, MY + 0.3, MZ - 0.6]);
    cyl(0.02, 1.0, 5, STEEL, [s * 1.15, 3.5, -3.7]);
    lit(sph(0.04, CYAN, [s * 1.15, 4.02, -3.7], 6, 4), 2);
  }
  decal(WARN, 0.35, 0.35, [0, MY + 0.02, MZ + 0.82], [0, 1, 0], { up: [0, 0, 1] });

  return b.root;
}
```