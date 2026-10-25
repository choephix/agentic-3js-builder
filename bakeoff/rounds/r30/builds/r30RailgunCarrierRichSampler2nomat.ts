import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  paint,
  noise,
  mix,
  smoothstep,
  resolve,
  stripes,
  grain,
  svg,
} from "../../../../src/index";
import type { ColorInput, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Stabilised Railgun Carrier",
  description:
    "Six-wheeled 6x6 railgun carrier, deployed: four hydraulic stabiliser legs planted, rear recoil spade down, wheels lifted, long glowing rail-and-coil gun elevated over an armoured cab. Low-poly sci-fi military with camo plating, hazard striping and stencilled markings.",
};

type V3 = [number, number, number];
type Ol = Array<[number, number] | [number, number, "sharp"]>;
type PO = {
  rotation?: V3;
  dir?: V3;
  axis?: "x" | "y" | "z";
  up?: V3;
  flat?: boolean;
  texture?: THREE.Texture;
  scale?: number | V3;
};

// ------------------------------------------------------------------ palette
const OLIVE = "#56654a";
const OLIVE_D = "#3b4733";
const SAND = "#a99a6c";
const GUN = "#2d3338";
const GUN_L = "#4b555d";
const STEEL = "#8a949c";
const STEEL_D = "#5c666e";
const DARK = "#1a1d20";
const RUBBER = "#232527";
const YELLOW = "#e6b422";
const BLACK = "#17191b";
const CYAN = "#5ff2ff";
const AMBER = "#ffab2e";
const RED = "#ff3b30";
const GREEN = "#58ff8a";
const LAMP = "#fff2c8";
const COPPER = "#b9763c";

// ------------------------------------------------------------------ textures
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="#14181a" stroke="#e6b422" stroke-width="4"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#5c666e" stroke-width="1.5"/>
  <path d="M37 8 L18 36 H29 L25 57 L47 26 H34 Z" fill="#5ff2ff" stroke="#0b1a1f" stroke-width="2" stroke-linejoin="round"/>
  <path d="M5 32 H14 M50 32 H59" stroke="#e6b422" stroke-width="3"/>
  </svg>`,
  { size: 128 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 160 48" xmlns="http://www.w3.org/2000/svg">
  <text x="4" y="32" textLength="150" lengthAdjust="spacingAndGlyphs" font-family="Impact, Arial Black, sans-serif" font-size="34" font-weight="900" fill="#e9e4c8" opacity="0.92">RG-06</text>
  <rect x="4" y="38" width="150" height="4" fill="#e9e4c8" opacity="0.85"/>
  <rect x="4" y="38" width="30" height="4" fill="#e6b422"/>
  </svg>`,
  { size: 320 },
);
const VOLT = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4 L61 58 H3 Z" fill="#e6b422" stroke="#17191b" stroke-width="5" stroke-linejoin="round"/>
  <path d="M36 16 L22 40 H31 L27 54 L43 30 H34 Z" fill="#17191b"/>
  </svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="48" fill="#06161c"/>
  <g stroke="#1c6a78" stroke-width="0.6">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8 + 4} 0 V48"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 8 + 4} H64"/>`).join("")}</g>
  <circle cx="32" cy="24" r="14" fill="none" stroke="#5ff2ff" stroke-width="1.4"/>
  <path d="M32 6 V42 M14 24 H50" stroke="#5ff2ff" stroke-width="1"/>
  <rect x="4" y="38" width="22" height="5" fill="#5ff2ff"/><rect x="40" y="4" width="18" height="4" fill="#ffab2e"/>
  <circle cx="42" cy="18" r="2.2" fill="#ff3b30"/>
  </svg>`,
  { size: 192 },
);
const KILLS = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">
  ${Array.from({ length: 8 }, (_, i) => `<circle cx="${12 + i * 19}" cy="12" r="6.5" fill="none" stroke="#f2ecd2" stroke-width="2.4"/><path d="M${6 + i * 19} 18 L${18 + i * 19} 6" stroke="#ff3b30" stroke-width="${i < 6 ? 1.6 : 0}"/>`).join("")}
  </svg>`,
  { size: 320 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="61" height="77" rx="5" fill="#e6b422" stroke="#17191b" stroke-width="3"/>
  <path d="M32 9 L54 45 H10 Z" fill="none" stroke="#17191b" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 17 L24 36 H31 L29 43 L40 27 H33 Z" fill="#17191b"/>
  <text x="32" y="62" font-family="Arial Black, Impact, sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="#17191b">KEEP</text>
  <text x="32" y="75" font-family="Arial Black, Impact, sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="#17191b">CLEAR</text>
  </svg>`,
  { size: 192 },
);
const CHARGE = svg(
  `<svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="24" rx="3" fill="#061014"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${4 + i * 6}" y="5" width="4.4" height="14" fill="${i < 9 ? "#5ff2ff" : i < 11 ? "#ffab2e" : "#ff3b30"}"/>`).join("")}</svg>`,
  { size: 160 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 8} 0 h4 l4 8 l-4 8 h-4 l4 -8 z" fill="${i % 2 ? "#f4f1e4" : "#d63a2a"}"/>`).join("")}</svg>`,
  { size: 384 },
);
const PLATE = svg(
  `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="94" height="30" rx="3" fill="#2a2d30" stroke="#9aa3ab" stroke-width="2"/>
  <text x="48" y="14" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#e9e4c8">RG-06 MK.II</text>
  <text x="48" y="26" text-anchor="middle" font-family="monospace" font-size="9" fill="#5ff2ff">480 MJ / 12 KM/S</text>
  </svg>`,
  { size: 288 },
);

// ------------------------------------------------------------------ paints
const tone = (c: string, p: THREE.Vector3) => mix(c, "#101410", 0.18 * noise(p, 0.12, 3));
const CAMO = paint((p) => {
  if (noise(p, 1.6, 5) > 0.6) return tone(SAND, p);
  if (noise(p, 0.9, 12) > 0.62) return tone(OLIVE_D, p);
  return tone(OLIVE, p);
});

/** Riveted armour plating with seams, rivets, mud at the bottom, soot scuffs and sun bleach on top. */
function plated(base: ColorInput, cu: number, cv: number, seam = 0.012, pitch = 0.16) {
  const along = (x: number) => (((x / pitch) % 1 + 1) % 1 - 0.5) * pitch;
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = (((u / cu) % 1 + 1) % 1) * cu;
    const dv = (((v / cv) % 1 + 1) % 1) * cv;
    let c = mix(col, "#d8d0a8", 0.12 * smoothstep(0.6, 1, n.y));
    c = mix(c, [0.12, 0.1, 0.08], 0.28 * smoothstep(0.68, 0.85, noise(p, 0.18, 9)));
    const mud = smoothstep(1.7, 0.6, p.y) * (0.4 + 0.6 * noise(p, 0.3, 2));
    c = mix(c, [0.31, 0.25, 0.18], mud * 0.75);
    if (du < seam || dv < seam) return mix(c, [0.07, 0.08, 0.07], 0.85);
    if (du < seam * 2.3 || dv < seam * 2.3) return mix(c, [1, 0.97, 0.85], 0.16);
    const d = Math.min(Math.hypot(du - 0.05, along(v)), Math.hypot(dv - 0.05, along(u)));
    if (d < 0.01) return mix(c, [1, 0.95, 0.8], 0.4);
    if (d < 0.015) return mix(c, [0.05, 0.05, 0.05], 0.4);
    return c;
  });
}
const HULL = plated(CAMO, 1.3, 0.85);
const CAB = plated(CAMO, 0.9, 0.75, 0.011, 0.14);
const TURRET = plated(CAMO, 0.8, 0.6, 0.01, 0.13);
const HAZARD = stripes(YELLOW, "#1b1b1b", { size: 0.3, axis: [1, 1, 0], width: 0.5, wobble: 0 });
const GUNMETAL = grain("#2a3036", "#4a545c", { size: 0.06, axis: "z" });
const RAIL = paint((p, n) => {
  const base = mix("#39424d", "#8795a4", noise(p, 0.4, 6) * 0.7 + 0.3 * Math.max(n.y, 0));
  const heat = smoothstep(2.4, 5.8, p.z) * Math.min(1, noise(p, 0.25, 5) * 1.6);
  return mix(base, mix("#5a3f7a", "#d9a441", noise(p, 0.2, 2)), heat * 0.6);
});
const TYRE = paint((p) => {
  const mud = smoothstep(0.9, 0.2, p.y) * noise(p, 0.2, 8);
  return mix(mix("#1b1c1e", "#2c2e30", noise(p, 0.15, 2)), "#5b4a35", mud * 0.8);
});
const GLASS = paint((p, n) => {
  if (Math.sin((p.x * 1.2 + p.y * 2.4 + p.z) * 6) > 0.94) return "#7fc3d6";
  return mix("#16303b", "#35687a", noise(p, 0.5, 3) * 0.6 + 0.3 * Math.max(n.y, 0));
});
const STEEL_P = grain(STEEL_D, STEEL, { size: 0.04, axis: "y" });

// ------------------------------------------------------------------ geometry of the body (shared formulas)
const HUB_Y = 0.78;
const hullHalf = (y: number) => 1.4 - 0.13333 * (y - 0.95);
const cabHalf = (y: number) => 1.4 - 0.10714 * (y - 0.95);
const HULL_SLOPE = 0.13333;
const CAB_SLOPE = 0.10714;
const TZ = -1.6; // turret / trunnion z
const GY = 3.85; // trunnion height

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const rand = rng(21);

  const BOX = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const P = (geo: THREE.BufferGeometry, color: ColorInput, at: V3, bone: Joint, o: PO = {}) =>
    b.part(geo, color, { bone, at, ...o });

  /** Extruded panel laid on a tilted side face of the hull or cab. */
  const sidePlate = (
    s: number,
    half: (y: number) => number,
    slope: number,
    y0: number,
    outline: Ol,
    thick: number,
    color: ColorInput,
    bone: Joint,
    lift = 0.005,
  ) =>
    b.extrude(outline, {
      at: [s * (half(y0) + slope * y0 + lift), 0, 0],
      x: [0, 0, 1],
      y: [-s * slope, 1, 0],
      thickness: thick,
      bevel: 0.012,
      bone,
      color,
    });

  // ================================================================ skeleton
  const chassis = b.joint("chassis", { at: [0, 1.4, 0], dir: [0, 1, 0], role: "spine" });
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.45, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("gunPitch", { parent: yaw, at: [0, GY, TZ], dir: [0, 0, 1], role: "hinge" });
  const recoil = b.joint("gunRecoil", { parent: pitch, at: [0, GY, TZ], dir: [0, 0, 1], role: "hinge" });

  // ================================================================ hull and cab bodies
  const hullBody = b.extrude(
    [
      [-4.2, 0.95],
      [-4.4, 1.2],
      [-4.4, 2.1],
      [-4.1, 2.45],
      [1.9, 2.45],
      [1.9, 0.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [2.8, 2.4], bevel: 0.06, bone: chassis, color: HULL },
  );
  const cabBody = b.extrude(
    [
      [1.7, 0.95],
      [1.7, 3.05],
      [2.9, 3.05],
      [3.8, 2.2],
      [4.05, 1.6],
      [4.05, 0.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [2.8, 2.35], bevel: 0.06, bone: chassis, color: CAB },
  );

  // under-chassis
  P(BOX(2.3, 0.1, 7.6), DARK, [0, 0.9, -0.8], chassis);
  for (const s of [1, -1]) {
    P(BOX(0.3, 0.22, 8.0), GUN, [s * 0.9, 0.78, -0.2], chassis);
    P(CYL(0.26, 2.2, 10), STEEL_D, [s * 0.5, 0.64, -1.7], chassis, { dir: [0, 0, 1], flat: true }); // fuel tank
    P(CYL(0.28, 0.06, 10), STEEL, [s * 0.5, 0.64, -0.58], chassis, { dir: [0, 0, 1] });
  }
  b.rod([0, 0.7, 2.6], [0, 0.7, -3.2], 0.07, STEEL, { bone: chassis, sides: 8 }); // driveshaft

  // ================================================================ wheels, axles, fenders
  const AX = [
    { k: "F", z: 2.6 },
    { k: "M", z: -0.3 },
    { k: "R", z: -3.2 },
  ];
  for (const a of AX) {
    P(new THREE.SphereGeometry(0.3, 8, 6), STEEL_D, [0, 0.72, a.z], chassis, { flat: true }); // differential
    for (const s of [1, -1] as const) {
      const side = s > 0 ? "L" : "R";
      const wx = s * 1.62;
      const spin = b.joint(`wheel${a.k}${side}`, {
        parent: chassis,
        at: [wx, HUB_Y, a.z],
        dir: [s, 0, 0],
        role: "hinge",
      });
      // tyre and tread
      P(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 14), TYRE, [wx, HUB_Y, a.z], spin, { dir: [s, 0, 0], flat: true });
      for (let i = 0; i < 12; i++) {
        const ang = ((i + 0.5) / 12) * Math.PI * 2;
        const off = i % 2 ? 0.05 : -0.05;
        P(
          BOX(0.22, 0.08, 0.22),
          TYRE,
          [wx + off, HUB_Y + 0.72 * Math.cos(ang), a.z + 0.72 * Math.sin(ang)],
          spin,
          { rotation: [(ang * 180) / Math.PI, 0, 0] },
        );
      }
      // rim, beadlock ring, bolts, glowing hub ring
      P(CYL(0.46, 0.56, 10), STEEL_P, [wx, HUB_Y, a.z], spin, { dir: [s, 0, 0], flat: true });
      P(CYL(0.4, 0.06, 10), GUN, [wx + s * 0.29, HUB_Y, a.z], spin, { dir: [s, 0, 0], flat: true });
      P(new THREE.TorusGeometry(0.43, 0.035, 5, 12), STEEL, [wx + s * 0.27, HUB_Y, a.z], spin, {
        dir: [s, 0, 0],
        axis: "z",
      });
      P(CYL(0.13, 0.12, 6), STEEL, [wx + s * 0.33, HUB_Y, a.z], spin, { dir: [s, 0, 0], flat: true });
      glow(
        P(new THREE.TorusGeometry(0.21, 0.016, 4, 12), CYAN, [wx + s * 0.325, HUB_Y, a.z], spin, {
          dir: [s, 0, 0],
          axis: "z",
        }),
        1.3,
      );
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        P(CYL(0.025, 0.04, 6), STEEL, [wx + s * 0.31, HUB_Y + 0.31 * Math.cos(ang), a.z + 0.31 * Math.sin(ang)], spin, {
          dir: [s, 0, 0],
        });
      }
      // axle beam and leaf spring
      b.rod([s * 0.25, HUB_Y, a.z], [s * 1.5, HUB_Y, a.z], 0.1, STEEL_D, { bone: chassis, sides: 8 });
      P(BOX(0.14, 0.05, 1.1), STEEL, [s * 0.85, 0.88, a.z], chassis);
      P(BOX(0.2, 0.08, 0.2), GUN, [s * 0.85, 0.82, a.z], chassis);
      // fender arch
      const arch: Ol = [];
      for (let i = 0; i <= 6; i++) {
        const t = (Math.PI * i) / 6;
        arch.push([0.86 * Math.cos(t), 0.86 * Math.sin(t)]);
      }
      for (let i = 6; i >= 0; i--) {
        const t = (Math.PI * i) / 6;
        arch.push([0.74 * Math.cos(t), 0.74 * Math.sin(t)]);
      }
      b.extrude(arch, {
        at: [wx, HUB_Y, a.z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.64,
        bevel: 0.03,
        bone: chassis,
        color: HULL,
      });
      // mud flap
      P(BOX(0.58, 0.46, 0.04), RUBBER, [wx, 0.56, a.z - 0.84], chassis);
      P(BOX(0.58, 0.06, 0.05), YELLOW, [wx, 0.34, a.z - 0.84], chassis);
    }
  }

  // ================================================================ cab
  const cabLen = 1.24;
  const glassC: V3 = [0, 2.654, 3.38];
  P(BOX(1.9, 0.06, cabLen), GLASS, glassC, chassis, { rotation: [43.4, 0, 0] });
  P(BOX(2.1, 0.1, 0.14), BLACK, [0, 3.083, 2.93], chassis, { rotation: [43.4, 0, 0] });
  P(BOX(2.1, 0.1, 0.14), BLACK, [0, 2.233, 3.83], chassis, { rotation: [43.4, 0, 0] });
  P(BOX(0.1, 0.1, cabLen), BLACK, [0, 2.654, 3.38], chassis, { rotation: [43.4, 0, 0] });
  for (const s of [1, -1]) {
    P(BOX(0.14, 0.1, cabLen + 0.12), BLACK, [s * 1.0, 2.654, 3.38], chassis, { rotation: [43.4, 0, 0] });
    // wiper
    P(BOX(0.03, 0.02, 0.75), BLACK, [s * 0.35, 2.7, 3.46], chassis, { rotation: [43.4, s * 12, 0] });
  }
  // armoured brow visor
  P(BOX(2.35, 0.08, 0.5), CAB, [0, 3.14, 3.0], chassis, { rotation: [43.4, 0, 0] });
  // roof equipment
  const roofSurf = b.surface(cabBody);
  for (const h of roofSurf.scatter(14, { rng: rng(3), minDist: 0.35, filter: (q) => q.n.y > 0.8 }))
    b.stick(CYL(0.04, 0.04, 6), STEEL_D, h, { embed: 0.4 });
  P(BOX(1.5, 0.1, 0.2), DARK, [0, 3.14, 2.6], chassis);
  for (const s of [1, -1]) glow(P(BOX(0.55, 0.06, 0.03), AMBER, [s * 0.36, 3.15, 2.71], chassis), 1.3);
  P(CYL(0.28, 0.06, 10), STEEL_D, [-0.7, 3.08, 2.0], chassis, { flat: true }); // hatch
  P(new THREE.TorusGeometry(0.28, 0.03, 5, 12), STEEL, [-0.7, 3.08, 2.0], chassis, { rotation: [90, 0, 0] });
  P(BOX(0.1, 0.04, 0.1), STEEL, [-0.7, 3.13, 2.0], chassis);
  // satcom dish
  P(CYL(0.04, 0.3, 6), STEEL_D, [0.7, 3.2, 2.0], chassis);
  b.lathe(
    [
      [0, 0],
      [0.3, 0.1],
      [0.3, 0.12],
      [0, 0.03],
    ],
    { at: [0.7, 3.38, 2.0], axis: [0.2, 0.85, 0.5], segments: 10, bone: chassis, color: STEEL },
  );
  P(CYL(0.025, 0.2, 5), STEEL_D, [0.76, 3.55, 2.14], chassis, { dir: [0.2, 0.85, 0.5] });
  // whip antennas
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 1.1, 3.05, 1.9], [s * 1.12, 4.2, 1.85], [s * 1.0 + 0.0, 5.0 - (s > 0 ? 0 : 0.3), 1.7]),
      [0.02, 0.006],
      STEEL_D,
      { bone: chassis, sides: 5 },
    );
    P(CYL(0.06, 0.1, 6), DARK, [s * 1.1, 3.1, 1.9], chassis);
  }
  P(new THREE.SphereGeometry(0.035, 5, 4), RED, [1.0, 5.02, 1.7], chassis, { flat: true });

  // doors, windows, mirrors
  const DOOR: Ol = [
    [1.95, 1.2],
    [1.95, 2.98],
    [2.85, 2.98],
    [3.15, 2.7],
    [3.15, 1.2],
  ];
  const WIN: Ol = [
    [2.05, 2.2],
    [2.05, 2.88],
    [2.8, 2.88],
    [3.05, 2.62],
    [3.05, 2.2],
  ];
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`door${side}`, { parent: chassis, at: [s * 1.29, 2.0, 3.15], dir: [0, 1, 0], role: "hinge" });
    sidePlate(s, cabHalf, CAB_SLOPE, 2.0, DOOR, 0.07, CAB, door);
    sidePlate(s, cabHalf, CAB_SLOPE, 2.0, WIN, 0.085, GLASS, door, 0.012);
    P(BOX(0.06, 0.05, 0.22), STEEL, [s * (cabHalf(1.95) + 0.06), 1.95, 2.1], door);
    P(
      new THREE.PlaneGeometry(0.55, 0.55),
      "#ffffff",
      [s * (cabHalf(1.6) + 0.056), 1.6, 2.55],
      door,
      { dir: [s, CAB_SLOPE, 0], axis: "z", texture: EMBLEM },
    );
    P(BOX(0.5, 0.06, 0.4), STEEL_D, [s * 1.45, 1.15, 2.55], chassis); // step
    // mirror
    b.rod([s * 1.2, 2.5, 3.2], [s * 1.75, 2.75, 3.4], 0.025, STEEL_D, { bone: chassis, sides: 5 });
    P(BOX(0.06, 0.3, 0.22), DARK, [s * 1.78, 2.72, 3.42], chassis);
    P(BOX(0.02, 0.26, 0.18), GLASS, [s * 1.745, 2.72, 3.42], chassis);
    // headlights
    P(BOX(0.5, 0.3, 0.12), DARK, [s * 0.98, 1.3, 4.04], chassis);
    glow(P(BOX(0.4, 0.2, 0.04), LAMP, [s * 0.98, 1.3, 4.11], chassis), 1.4);
    glow(P(BOX(0.4, 0.04, 0.03), AMBER, [s * 0.98, 1.12, 4.1], chassis), 1.2);
    // rear tail lamps
    P(BOX(0.4, 0.22, 0.08), DARK, [s * 1.1, 1.7, -4.4], chassis);
    glow(P(BOX(0.32, 0.14, 0.03), RED, [s * 1.1, 1.7, -4.45], chassis), 1.2);
  }
  // nose
  P(BOX(1.3, 0.55, 0.06), DARK, [0, 1.28, 4.06], chassis);
  for (let i = 0; i < 5; i++)
    b.rod([-0.62, 1.05 + i * 0.11, 4.1], [0.62, 1.05 + i * 0.11, 4.1], 0.018, STEEL_D, { bone: chassis, sides: 5 });
  P(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", [0, 1.93, 3.947], chassis, { dir: [0, 0.38, 0.92], axis: "z", texture: EMBLEM });
  // bumper and winch
  P(BOX(2.7, 0.34, 0.36), HAZARD, [0, 0.98, 4.18], chassis);
  P(BOX(2.8, 0.12, 0.46), GUN, [0, 1.2, 4.14], chassis, { rotation: [-12, 0, 0] });
  P(CYL(0.11, 1.0, 8), STEEL, [0, 0.8, 4.3], chassis, { dir: [1, 0, 0] });
  P(BOX(0.5, 0.2, 0.1), DARK, [0, 0.8, 4.4], chassis);
  for (const s of [1, -1]) {
    P(new THREE.TorusGeometry(0.08, 0.025, 5, 8, Math.PI), STEEL, [s * 1.1, 0.9, 4.38], chassis, { rotation: [0, 0, 180] });
    P(CYL(0.025, 0.4, 5), GUN, [s * 1.0, 0.95, 4.0], chassis, { dir: [0, 0, 1] });
  }

  // ================================================================ hull side detail
  for (const s of [1, -1] as const) {
    const sd = s > 0 ? "L" : "R";
    // stencil number
    P(new THREE.PlaneGeometry(1.7, 0.51), "#ffffff", [s * (hullHalf(2.05) + 0.014), 2.05, -0.3], chassis, {
      dir: [s, HULL_SLOPE, 0],
      axis: "z",
      texture: STENCIL,
    });
    // lockers
    for (const lz of [1.15, -1.75]) {
      P(BOX(0.4, 0.7, 1.3), HULL, [s * (hullHalf(2.05) + 0.17), 2.05, lz], chassis);
      P(BOX(0.44, 0.06, 1.34), STEEL_D, [s * (hullHalf(2.05) + 0.17), 2.4, lz], chassis);
      P(BOX(0.05, 0.1, 0.4), HAZARD, [s * (hullHalf(2.05) + 0.4), 2.1, lz], chassis);
      for (const dz of [-0.5, 0.5]) P(BOX(0.06, 0.28, 0.06), STEEL, [s * (hullHalf(2.05) + 0.4), 2.05, lz + dz], chassis);
    }
    // heat-vent on hull side ahead
    P(BOX(0.04, 0.3, 0.8), DARK, [s * (hullHalf(1.9) + 0.01), 1.9, 1.45], chassis);
    for (let i = 0; i < 5; i++)
      P(BOX(0.05, 0.02, 0.76), STEEL_D, [s * (hullHalf(1.9) + 0.02), 1.78 + i * 0.06, 1.45], chassis);
    void sd;
  }
  const hullSurf = b.surface(hullBody);
  for (const h of hullSurf.scatter(36, { rng: rng(5), minDist: 0.4, filter: (q) => q.n.y > 0.8 }))
    b.stick(CYL(0.045, 0.04, 6), STEEL_D, h, { embed: 0.4 });

  // ================================================================ rear deck: generator, cooling, cables
  P(BOX(2.0, 0.7, 1.3), HULL, [0, 2.8, -3.65], chassis);
  P(BOX(2.06, 0.06, 1.36), STEEL_D, [0, 3.17, -3.65], chassis);
  for (let i = 0; i < 8; i++) P(BOX(1.7, 0.05, 0.1), DARK, [0, 3.2 + 0.0, -4.1 + i * 0.1], chassis);
  glow(P(BOX(1.7, 0.4, 0.03), AMBER, [0, 2.8, -4.31], chassis), 1.1);
  for (let i = 0; i < 6; i++) P(BOX(1.8, 0.035, 0.08), GUN, [0, 2.62 + i * 0.07, -4.34], chassis);
  for (const s of [1, -1]) {
    P(CYL(0.1, 0.8, 8), STEEL_D, [s * 0.75, 3.55, -3.25], chassis);
    P(CYL(0.13, 0.05, 8), DARK, [s * 0.75, 3.96, -3.25], chassis);
    P(CYL(0.15, 0.1, 8), GUN, [s * 0.75, 3.22, -3.25], chassis);
  }
  P(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", [0.55, 2.85, -4.345], chassis, { dir: [0, 0, -1], axis: "z", texture: VOLT });
  glow(
    P(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", [-0.55, 2.75, -4.345], chassis, { dir: [0, 0, -1], axis: "z", texture: CHARGE }),
    1.2,
  );
  P(new THREE.PlaneGeometry(2.5, 0.42), "#ffffff", [0, 1.25, -4.405], chassis, { dir: [0, 0, -1], axis: "z", texture: CHEVRON });
  P(BOX(0.5, 0.12, 0.3), STEEL_D, [0, 1.0, -4.5], chassis); // tow hitch
  P(CYL(0.07, 0.2, 8), STEEL, [0, 1.0, -4.62], chassis);
  // jerry cans
  for (let i = 0; i < 3; i++) P(BOX(0.4, 0.5, 0.18), i === 1 ? OLIVE_D : SAND, [-0.3 + i * 0.3, 2.7, -2.82], chassis);
  // main power cables to the turret
  for (const s of [1, -1]) {
    const cab = catmull([
      [s * 0.6, 3.0, -3.0],
      [s * 0.75, 3.15, -2.8],
      [s * 0.55, 3.25, -2.5],
    ]);
    b.sweep(cab, 0.05, DARK, { bone: chassis, sides: 6 });
    b.along(cab, 2, (at) => b.part(BOX(0.12, 0.1, 0.1), STEEL, { frame: at, bone: chassis }));
  }

  // ================================================================ mid deck: slug racks, turret ring
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      const sx = s * 0.78 + (r === 1 ? s * 0.0 : 0);
      const sy = 2.56 + (r === 2 ? 0.17 : 0);
      const px = sx + (r === 0 ? -0.1 : r === 1 ? 0.1 : 0);
      P(CYL(0.085, 1.25, 8), STEEL, [px, sy, 0.95], chassis, { dir: [0, 0, 1] });
      P(CYL(0.09, 0.12, 8), YELLOW, [px, sy, 0.55], chassis, { dir: [0, 0, 1] });
      P(new THREE.ConeGeometry(0.085, 0.22, 8), COPPER, [px, sy, 1.68], chassis, { dir: [0, 0, 1] });
      glow(P(new THREE.SphereGeometry(0.03, 5, 4), CYAN, [px, sy, 1.8], chassis, { flat: true }), 1.2);
    }
    for (const dz of [0.5, 1.4]) P(BOX(0.52, 0.05, 0.06), GUN, [s * 0.78, 2.5, dz], chassis);
  }
  P(new THREE.TorusGeometry(1.27, 0.09, 6, 20), STEEL_D, [0, 2.5, TZ], chassis, { rotation: [90, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    P(CYL(0.035, 0.05, 6), STEEL, [1.27 * Math.cos(a), 2.58, TZ + 1.27 * Math.sin(a)], chassis);
  }

  // ================================================================ turret
  P(CYL(1.25, 0.3, 16), GUN, [0, 2.6, TZ], yaw, { flat: true });
  const platform = b.extrude(
    [
      [-2.8, 2.7],
      [-2.8, 3.05],
      [-2.4, 3.2],
      [-0.6, 3.2],
      [-0.2, 2.95],
      [-0.2, 2.7],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [2.6, 2.2], bevel: 0.05, bone: yaw, color: TURRET },
  );
  for (const h of b.surface(platform).scatter(20, { rng: rng(8), minDist: 0.3, filter: (q) => q.n.y > 0.8 }))
    b.stick(CYL(0.04, 0.04, 6), STEEL_D, h, { embed: 0.4 });
  for (const s of [1, -1] as const) {
    // cheek plates
    b.extrude(
      [
        [-2.3, 3.15],
        [-2.15, 4.35],
        [-0.95, 4.35],
        [-0.9, 3.15],
      ],
      { at: [s * 0.85, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.22, bevel: 0.03, bone: yaw, color: TURRET },
    );
    P(CYL(0.34, 0.12, 10), STEEL_P, [s * 1.0, GY, TZ], yaw, { dir: [1, 0, 0], flat: true });
    P(CYL(0.12, 0.14, 8), GUN, [s * 1.08, GY, TZ], yaw, { dir: [1, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      P(CYL(0.02, 0.05, 5), STEEL, [s * 1.04, GY + 0.27 * Math.cos(a), TZ + 0.27 * Math.sin(a)], yaw, { dir: [1, 0, 0] });
    }
    P(new THREE.PlaneGeometry(0.62, 0.21), "#ffffff", [s * 0.965, 4.12, -1.5], yaw, { dir: [s, 0, 0], axis: "z", texture: PLATE });
    // side stowage bins
    P(BOX(0.42, 0.56, 1.4), TURRET, [s * 1.2, 3.22, -1.5], yaw);
    P(BOX(0.46, 0.05, 1.44), STEEL_D, [s * 1.2, 3.52, -1.5], yaw);
    P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [s * 1.415, 3.2, -1.5], yaw, { dir: [s, 0, 0], axis: "z", texture: VOLT });
    P(BOX(0.05, 0.1, 0.35), HAZARD, [s * 1.43, 3.4, -1.0], yaw);
    glow(P(BOX(0.1, 0.07, 0.1), AMBER, [s * 1.2, 3.58, -0.88], yaw), 1.3);
  }
  // hatch and optics on left bin
  const hatch = b.joint("cupolaHatch", { parent: yaw, at: [1.2, 3.55, -2.0], dir: [1, 0, 0], role: "hinge" });
  P(new THREE.TorusGeometry(0.22, 0.04, 5, 10), STEEL_D, [1.2, 3.55, -2.0], yaw, { rotation: [90, 0, 0] });
  P(CYL(0.22, 0.07, 10), TURRET, [1.2, 3.6, -2.0], hatch, { flat: true });
  P(BOX(0.18, 0.04, 0.06), STEEL, [1.2, 3.65, -2.0], hatch);
  P(BOX(0.3, 0.22, 0.3), DARK, [1.2, 3.74, -1.2], yaw);
  P(CYL(0.07, 0.12, 8), GLASS, [1.2, 3.74, -1.0], yaw, { dir: [0, 0, 1] });
  // rotating AESA radar on right bin
  const radar = b.joint("radar", { parent: yaw, at: [-1.2, 3.5, -1.5], dir: [0, 1, 0], role: "hinge" });
  P(CYL(0.07, 0.8, 8), STEEL_D, [-1.2, 3.9, -1.5], radar);
  P(BOX(0.9, 0.58, 0.12), GUN, [-1.2, 4.4, -1.5], radar);
  glow(P(new THREE.PlaneGeometry(0.78, 0.46), "#ffffff", [-1.2, 4.4, -1.43], radar, { dir: [0, 0, 1], axis: "z", texture: SCREEN }), 0.9);
  P(BOX(0.5, 0.3, 0.1), DARK, [-1.2, 4.4, -1.6], radar);
  // floodlights on platform front corners
  for (const s of [1, -1]) {
    P(BOX(0.22, 0.16, 0.16), DARK, [s * 0.95, 3.3, -0.35], yaw);
    glow(P(BOX(0.18, 0.12, 0.03), LAMP, [s * 0.95, 3.3, -0.26], yaw), 1.3);
  }
  // cables platform -> breech
  for (const s of [1, -1]) {
    const cab = catmull([
      [s * 0.4, 3.2, -2.5],
      [s * 0.55, 3.55, -2.7],
      [s * 0.35, 3.9, -2.85],
    ]);
    b.sweep(cab, 0.045, DARK, { bone: yaw, sides: 6 });
    b.along(cab, 2, (at) => b.part(BOX(0.1, 0.08, 0.08), STEEL, { frame: at, bone: yaw }));
  }

  // ================================================================ the railgun (built level, then elevated)
  const GP = (s: number, h: number, w: number): V3 => [w, GY + h, TZ + s];
  const G = (geo: THREE.BufferGeometry, color: ColorInput, s: number, h: number, w: number, o: PO = {}, bone: Joint = recoil) =>
    P(geo, color, GP(s, h, w), bone, o);

  // trunnion axle and cradle (rides pitch, does not recoil)
  G(CYL(0.2, 1.8, 10), STEEL, 0, 0, 0, { dir: [1, 0, 0], flat: true }, pitch);
  for (const s of [1, -1]) {
    G(BOX(0.1, 1.1, 1.3), GUN_L, 0, 0, s * 0.64, {}, pitch);
    G(CYL(0.1, 0.65, 8), STEEL_D, 0.32, 0.5, s * 0.46, { dir: [0, 0, 1] }, pitch); // recoil buffer
    G(CYL(0.045, 1.4, 6), STEEL, -0.2, 0.5, s * 0.46, { dir: [0, 0, 1] });
  }
  G(BOX(1.38, 0.12, 1.3), GUN_L, 0, 0.6, 0, {}, pitch);
  G(BOX(1.38, 0.12, 1.3), GUN_L, 0, -0.6, 0, {}, pitch);

  // breech block
  G(BOX(1.0, 0.9, 1.55), GUNMETAL, -0.525, 0, 0);
  G(BOX(0.8, 0.06, 1.2), GUN_L, -0.5, 0.48, 0);
  G(BOX(0.9, 0.8, 0.12), GUN, -1.34, 0, 0);
  for (const h of [-0.22, 0, 0.22]) glow(G(BOX(0.7, 0.05, 0.02), CYAN, -1.41, h, 0), 1.4);
  for (const w of [-0.28, 0, 0.28]) {
    G(CYL(0.13, 1.3, 8), COPPER, -0.5, 0.62, w, { dir: [0, 0, 1], flat: true });
    glow(G(CYL(0.09, 0.04, 8), CYAN, -1.16, 0.62, w, { dir: [0, 0, 1] }), 1.3);
    G(CYL(0.15, 0.08, 8), STEEL_D, -0.1, 0.62, w, { dir: [0, 0, 1] });
  }
  // rail pair, plasma channel, copper bus bars, kill tally
  for (const s of [1, -1]) {
    G(BOX(0.24, 0.5, 7.3), RAIL, 3.9, 0, s * 0.2);
    G(BOX(0.04, 0.1, 6.9), COPPER, 3.7, 0.15, s * 0.34);
    G(new THREE.PlaneGeometry(1.5, 0.22), "#ffffff", 3.6, -0.08, s * 0.325, { dir: [s, 0, 0], axis: "z", texture: KILLS });
  }
  glow(G(BOX(0.14, 0.3, 7.25), CYAN, 3.9, 0, 0), 1.5);
  // coil rings, shrinking toward the muzzle
  for (let i = 0; i < 7; i++) {
    const s = 0.9 + i * 1.0;
    const k = 1 - 0.045 * i;
    const hw = 0.5 * k;
    const hh = 0.45 * k;
    const t = 0.1;
    const L = 0.26;
    const col = i % 3 === 0 ? GUN_L : GUN;
    G(BOX(2 * hw + 2 * t, t, L), col, s, hh + t / 2, 0);
    G(BOX(2 * hw + 2 * t, t, L), col, s, -(hh + t / 2), 0);
    for (const w of [1, -1]) G(BOX(t, 2 * hh, L), col, s, 0, w * (hw + t / 2));
    glow(G(BOX(2 * hw - 0.02, 0.025, L + 0.03), CYAN, s, hh - 0.012, 0), 1.3);
    glow(G(BOX(2 * hw - 0.02, 0.025, L + 0.03), CYAN, s, -(hh - 0.012), 0), 1.3);
    if (i === 0 || i === 6) G(BOX(2 * hw + 2 * t + 0.02, 0.05, 0.06), HAZARD, s - 0.1, hh + t / 2 + 0.06, 0);
  }
  // capacitor banks
  [1.4, 2.7, 4.0, 5.3].forEach((s, j) => {
    for (const w of [1, -1] as const) {
      G(BOX(0.34, 0.62, 0.62), GUNMETAL, s, 0, w * 0.78);
      for (let f = 0; f < 4; f++) G(BOX(0.3, 0.03, 0.08), STEEL_D, s - 0.2 + f * 0.13, 0.33, w * 0.78);
      glow(G(BOX(0.04, 0.08, 0.5), GREEN, s, 0.2, w * 0.955), 1.2);
      if (j % 2 === 0)
        glow(
          G(new THREE.PlaneGeometry(0.5, 0.15), "#ffffff", s, -0.12, w * 0.953, { dir: [w, 0, 0], axis: "z", texture: CHARGE }),
          1.2,
        );
      b.rod(GP(s, 0.1, w * 0.61), GP(s, 0.1, w * 0.5), 0.035, COPPER, { bone: recoil, sides: 6 });
    }
  });
  // muzzle shroud
  G(BOX(0.98, 0.12, 0.5), GUN_L, 7.3, 0.38, 0);
  G(BOX(0.98, 0.12, 0.5), GUN_L, 7.3, -0.38, 0);
  for (const w of [1, -1]) G(BOX(0.12, 0.64, 0.5), GUN_L, 7.3, 0, w * 0.43);
  for (const h of [0.31, -0.31]) glow(G(BOX(0.7, 0.04, 0.02), CYAN, 7.56, h, 0), 1.4);
  for (const w of [0.43, -0.43]) glow(G(BOX(0.04, 0.5, 0.02), CYAN, 7.56, 0, w), 1.4);
  // laser rangefinder on top
  G(BOX(0.24, 0.16, 0.5), DARK, 1.5, 0.52, 0);
  glow(G(CYL(0.05, 0.03, 8), RED, 1.77, 0.52, 0, { dir: [0, 0, 1] }), 1.4);

  // ================================================================ stabiliser legs
  for (const pr of [
    { k: "F", z: 1.15 },
    { k: "R", z: -1.75 },
  ]) {
    for (const s of [1, -1] as const) {
      const nm = `${pr.k}${s > 0 ? "L" : "R"}`;
      const z = pr.z;
      const x = s * 2.55;
      const arm = b.joint(`outrigger${nm}`, { parent: chassis, at: [s * 1.25, 1.5, z], dir: [s, 0, 0], role: "hinge" });
      P(CYL(0.3, 0.55, 8), STEEL_D, [s * 1.25, 1.5, z], arm, { rotation: [90, 0, 0], flat: true });
      b.frustumBox([s * 1.2, 1.5, z], [x, 1.5, z], [0.5, 0.46], [0.4, 0.4], { bone: arm, color: HAZARD });
      P(BOX(0.46, 0.08, 0.46), GUN, [s * 1.9, 1.76, z], arm);
      const leg = b.chain(
        `leg${nm}`,
        polyline([
          [x, 1.5, z],
          [x, 1.0, z],
          [x, 0.25, z],
        ]),
        { parent: arm, names: [`leg${nm}`, `leg${nm}Ext`, `leg${nm}Foot`], role: "leg", contact: [x, 0, z] },
      );
      const housing = leg.joints[0];
      const piston = leg.joints[1];
      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      P(CYL(0.28, 0.95, 8), STEEL_P, [x, 1.47, z], housing, { flat: true });
      P(CYL(0.3, 0.08, 8), GUN, [x, 1.97, z], housing, { flat: true });
      P(CYL(0.3, 0.08, 8), GUN, [x, 1.05, z], housing, { flat: true });
      glow(P(BOX(0.12, 0.08, 0.12), GREEN, [x, 2.05, z], housing), 1.3);
      P(new THREE.PlaneGeometry(0.34, 0.42), "#ffffff", [x + s * 0.285, 1.5, z], housing, {
        dir: [s, 0, 0],
        axis: "z",
        texture: WARN,
      });
      P(CYL(0.17, 0.8, 8), STEEL, [x, 0.65, z], piston, { flat: true });
      for (const dy of [0.5, 0.8]) P(CYL(0.19, 0.04, 8), YELLOW, [x, dy, z], piston);
      P(new THREE.SphereGeometry(0.21, 8, 6), STEEL_D, [x, 0.25, z], foot, { flat: true });
      P(new THREE.CylinderGeometry(0.32, 0.58, 0.18, 8), HAZARD, [x, 0.07, z], foot, { flat: true });
      P(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 8), RUBBER, [x, 0.0, z], foot, { flat: true });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        P(CYL(0.035, 0.08, 6), STEEL, [x + 0.45 * Math.cos(a), 0.17, z + 0.45 * Math.sin(a)], foot);
      }
      // hydraulic strut
      b.rod([s * 1.3, 2.15, z], [x - s * 0.1, 1.8, z], 0.1, STEEL_D, { bone: arm, sides: 8 });
      b.rod([s * 1.95, 1.97, z], [x - s * 0.1, 1.8, z], 0.055, STEEL, { bone: arm, sides: 6 });
      // hose
      const hose = catmull([
        [s * 1.35, 1.95, z + 0.2],
        [s * 1.9, 1.7, z + 0.3],
        [x - s * 0.1, 1.88, z + 0.25],
      ]);
      b.sweep(hose, 0.03, RUBBER, { bone: arm, sides: 6 });
      b.along(hose, 3, (at) => b.part(BOX(0.08, 0.08, 0.08), STEEL, { frame: at, bone: arm }));
      glow(P(new THREE.SphereGeometry(0.07, 5, 4), AMBER, [s * 1.5, 1.8, z - 0.3], arm, { flat: true }), 1.3);
    }
  }

  // ================================================================ recoil spade
  const spade = b.joint("spade", { parent: chassis, at: [0, 1.8, -4.4], dir: [0, -0.35, -1], role: "hinge" });
  b.extrude(
    [
      [-1.45, 1.05],
      [1.45, 1.05],
      [1.45, 0.3],
      [1.2, 0.0, "sharp"],
      [0.8, 0.25],
      [0.4, 0.0, "sharp"],
      [0.0, 0.25],
      [-0.4, 0.0, "sharp"],
      [-0.8, 0.25],
      [-1.2, 0.0, "sharp"],
      [-1.45, 0.3],
    ],
    { at: [0, 0, -5.05], x: [1, 0, 0], y: [0, 0.94, 0.34], thickness: 0.16, bevel: 0.03, bone: spade, color: STEEL_P },
  );
  P(BOX(2.9, 0.22, 0.2), HAZARD, [0, 1.0, -4.72], spade, { rotation: [-19.9, 0, 0] });
  P(new THREE.PlaneGeometry(1.4, 0.2), "#ffffff", [0, 0.55, -5.12], spade, { dir: [0, 0.34, -0.94], axis: "z", texture: CHEVRON });
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 1.8, -4.4], [s * 0.9, 0.66, -4.81], 0.1, STEEL_D, { bone: spade, sides: 8 });
    b.rod([s * 0.9, 1.55, -4.45], [s * 0.9, 0.9, -4.8], 0.06, STEEL, { bone: spade, sides: 6 });
    P(CYL(0.16, 0.3, 8), GUN, [s * 0.9, 1.8, -4.4], spade, { dir: [1, 0, 0] });
  }

  // ================================================================ elevate the gun
  b.pose(pitch, { axis: [1, 0, 0], deg: -6 });
  void rand;

  return b.root;
}
