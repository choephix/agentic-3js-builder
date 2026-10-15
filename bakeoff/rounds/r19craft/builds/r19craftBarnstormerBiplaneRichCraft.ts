// Barnstormer biplane, whimsical: a chubby red-and-cream open-cockpit biplane with a butter-yellow cowl, a big
// wooden propeller, a mustachioed pilot with a streaming scarf, a teddy-bear passenger cheering in the front seat,
// bunting between the wings, a pennant on the fin and a banner on the flank. Everything that moves has a hinge joint.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG } from "../../../../src/math";
import { grain, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A tubby, cheerful barnstorming biplane: red fuselage with a teal pinstripe, butter-yellow cowl, cream fabric wings with rib stitching and teal ailerons, a bear passenger, a mustachioed pilot with a flapping scarf, bunting and a pennant. Hinged propeller, wheels, tail wheel, rudder, elevators and four ailerons.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#d93a2b";
const RED_HI = "#f0553f";
const RED_SH = "#a82a2f";
const CREAM = "#fff1cf";
const CREAM_HI = "#fffaf0";
const CREAM_SH = "#ead6a6";
const CREAM_COOL = "#efe3c9";
const TEAL = "#22a69c";
const TEAL_SH = "#1a7f86";
const TEAL_HI = "#46cdbd";
const YELLOW = "#ffc733";
const YELLOW_HI = "#ffd95c";
const YELLOW_SH = "#e8a21f";
const NAVY = "#27325e";
const LEATHER = "#8a5230";
const LEATHER_D = "#5e3520";
const WOOD = "#d89a56";
const WOOD_D = "#a86d37";
const BRASS = "#e9b449";
const STEEL = "#aab4c2";
const STEEL_D = "#5c6578";
const DARK = "#2b2433";
const SKIN = "#f2b78d";
const BEAR = "#b97b46";
const BEAR_L = "#e6b585";
const PINK = "#f48fa8";
const GLASS = "#a5eef0";
const WIRE = "#3b3a4a";
const TIRE_A = "#34303f";
const TIRE_B = "#46404f";

const fract = (x: number) => x - Math.floor(x);

type Plan = { S: number; zc: number; y: number; c: number; rt: number; xa0: number; ac: number; th: number };

/** Plan-view outline (x across, y forward) of a rounded-tip wing or stabiliser with a notch for each hinged flap. */
function planOutline(P: Plan): OutlinePoint[] {
  const f = P.c / 2;
  const r = -P.c / 2;
  const h = r + P.ac;
  const xo = P.S - P.rt;
  const pts: OutlinePoint[] = [
    [-xo, f],
    [xo, f],
  ];
  for (const a of [60, 30, 0, -30, -60]) pts.push([xo + P.rt * Math.cos(a * DEG), (P.c / 2) * Math.sin(a * DEG)]);
  pts.push([xo, r], [xo, h], [P.xa0, h], [P.xa0, r], [-P.xa0, r], [-P.xa0, h], [-xo, h], [-xo, r]);
  for (const a of [-60, -30, 0, 30, 60]) pts.push([-xo - P.rt * Math.cos(a * DEG), (P.c / 2) * Math.sin(a * DEG)]);
  return pts;
}

/** The hinged flap that fills one notch of `planOutline`. */
function flapOutline(P: Plan, s: number): OutlinePoint[] {
  const g = 0.014;
  const r = -P.c / 2 + g;
  const h = -P.c / 2 + P.ac - g;
  const xo = P.S - P.rt - g;
  const xi = P.xa0 + g;
  return [
    [s * xi, r],
    [s * xo, r],
    [s * xo, h],
    [s * xi, h],
  ];
}

const starPath = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + "Z";

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const body = b.joint("body", { at: [0, 1.43, 0.3] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.4, 3.5], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.4, -3.54], dir: [0, 1, 0], role: "hinge" });
  const pennant = b.joint("pennant", { parent: body, at: [0, 3.0, -3.4], dir: [0, 0, -1], role: "hinge" });
  const swivel = b.joint("tailSwivel", { parent: body, at: [0, 0.4, -3.22], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: swivel, at: [0, 0.17, -3.22], dir: [1, 0, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, 2.36, -0.5], dir: [0, 1, 0], role: "head" });
  const bearHead = b.joint("bearHead", { parent: body, at: [0, 2.34, 0.7], dir: [0, 1, 0], role: "head" });
  const scarf = b.chain(
    "scarf",
    catmull([
      [0, 2.38, -0.62],
      [0.02, 2.42, -1.0],
      [-0.03, 2.56, -1.45],
      [0.03, 2.5, -1.95],
    ]),
    { parent: body, role: "tail", up: [1, 0, 0] },
  );

  // Merged detail bits (one part per colour).
  const brassBits: THREE.BufferGeometry[] = [];
  const steelBits: THREE.BufferGeometry[] = [];
  const darkBits: THREE.BufferGeometry[] = [];
  const sph = (r: number, x: number, y: number, z: number, sx = 6, sy = 4) =>
    new THREE.SphereGeometry(r, sx, sy).translate(x, y, z);
  const cylZ = (r1: number, r2: number, h: number, x: number, y: number, z: number, seg = 8) =>
    new THREE.CylinderGeometry(r1, r2, h, seg).rotateX(Math.PI / 2).translate(x, y, z);

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const ROUNDEL = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="${NAVY}"/>
      <circle cx="50" cy="50" r="39" fill="${CREAM}"/>
      <circle cx="50" cy="50" r="30" fill="${RED}"/>
      <path d="${starPath(50, 51, 24, 10)}" fill="${YELLOW}" stroke="${NAVY}" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
  const FIN_STAR = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="${CREAM}" stroke="${RED}" stroke-width="5"/>
      <path d="${starPath(50, 52, 34, 14)}" fill="${RED}" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="${CREAM}"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="${RED}" stroke-width="5"/>
      <g stroke="${RED}" stroke-width="4.5" stroke-linecap="round">
        <path d="M32 9 L32 55"/><path d="M12 20.5 L52 43.5"/><path d="M12 43.5 L52 20.5"/>
      </g>
      <circle cx="32" cy="32" r="7.5" fill="${BRASS}" stroke="${WOOD_D}" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 240 70">
      <path d="M8 12 L232 12 L222 35 L232 58 L8 58 L18 35Z" fill="${CREAM}" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"/>
      <path d="${starPath(30, 35, 9, 4)}" fill="${YELLOW}" stroke="${NAVY}" stroke-width="1.5"/>
      <path d="${starPath(210, 35, 9, 4)}" fill="${YELLOW}" stroke="${NAVY}" stroke-width="1.5"/>
      <text x="120" y="46" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="30" letter-spacing="2" fill="${RED}">AIR CIRCUS</text>
    </svg>`,
    { size: 512 },
  );
  const FACE = svg(
    `<svg viewBox="0 0 100 80">
      <ellipse cx="22" cy="52" rx="11" ry="6.5" fill="#ff8fa0"/>
      <ellipse cx="78" cy="52" rx="11" ry="6.5" fill="#ff8fa0"/>
      <ellipse cx="33" cy="31" rx="7.5" ry="9.5" fill="${DARK}"/>
      <ellipse cx="67" cy="31" rx="7.5" ry="9.5" fill="${DARK}"/>
      <circle cx="35.5" cy="27" r="3" fill="#ffffff"/>
      <circle cx="69.5" cy="27" r="3" fill="#ffffff"/>
      <path d="M22 18 Q33 10 44 16" stroke="${LEATHER_D}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M56 16 Q67 10 78 18" stroke="${LEATHER_D}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M32 58 Q50 80 68 58 Z" fill="#8a2630"/>
      <path d="M37 59 Q50 64 63 59 L61 63 Q50 67 39 63Z" fill="#ffffff"/>
      <path d="M50 47 Q38 39 20 51 Q34 54 50 51 Q66 54 80 51 Q62 39 50 47Z" fill="${LEATHER_D}"/>
    </svg>`,
    { size: 256 },
  );
  const flagTex = (c: string) =>
    svg(
      `<svg viewBox="0 0 32 40"><path d="M1 40 L31 40 L16 2Z" fill="${c}" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/></svg>`,
      { size: 64 },
    );
  const FLAGS = [flagTex(RED), flagTex(YELLOW), flagTex(TEAL), flagTex(CREAM), flagTex(PINK)];

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const yc = (z: number) => (z > -1.8 ? 1.43 : 1.45 + (-1.8 - z) * 0.07);
  const fusePaint = paint((p, n) => {
    const band = p.y - yc(p.z) + 0.03;
    if (Math.abs(fract((p.z + 0.1) / 0.9) - 0.5) > 0.49) return n.y < -0.45 ? CREAM_SH : RED_SH;
    if (Math.abs(band) < 0.05) return TEAL;
    if (Math.abs(band) < 0.072) return CREAM;
    if (n.y < -0.45) return CREAM;
    if (n.y > 0.65) return RED_HI;
    return RED;
  });
  const cowlPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.y - 1.4);
    if (p.z > 2.3 && r < 0.57) return DARK;
    if (p.z > 2.95) return CREAM;
    if (Math.abs(p.z - 2.8) < 0.03) return RED;
    if (n.y > 0.6) return YELLOW_HI;
    if (n.y < -0.4) return YELLOW_SH;
    return YELLOW;
  });
  const wingPaint = (P: Plan, up: boolean, accent: string) =>
    paint((p, n) => {
      const ax = Math.abs(p.x);
      const dz = p.z - P.zc;
      const tip = P.S * 0.11;
      if (Math.abs(n.y) < 0.55) return n.z > 0.4 ? RED : accent;
      if (ax > P.S - tip) return accent;
      if (ax > P.S - tip * 1.25) return CREAM_HI;
      if (dz > P.c / 2 - 0.21 * P.c) return accent;
      if (dz > P.c / 2 - 0.25 * P.c) return CREAM_HI;
      if (Math.abs(fract(ax / (P.S * 0.13)) - 0.5) > 0.47) return up ? CREAM_SH : "#d9c9a6";
      return up ? CREAM : CREAM_COOL;
    });
  const flapPaint = paint((p, n) => {
    if (Math.abs(n.y) < 0.55) return TEAL_SH;
    if (Math.abs(fract(Math.abs(p.x) / 0.4) - 0.5) > 0.465) return CREAM;
    return n.y > 0 ? TEAL : "#1f8f8f";
  });
  const finPaint = paint((_p, n) => {
    if (n.y > 0.5) return CREAM;
    return n.x < -0.5 ? TEAL_SH : TEAL;
  });
  const rudderPaint = paint((p, n) => {
    if (n.y > 0.6) return CREAM;
    const k = Math.floor((p.y - 1.35) / 0.3);
    return [RED, CREAM, TEAL][((k % 3) + 3) % 3];
  });
  const tirePaint = paint((_p, _n, s) => (Math.floor(s[0] * 22) % 2 ? TIRE_A : TIRE_B));
  const propPaint = paint((_p, _n, s) => {
    const r = Math.abs(s[1]);
    if (r > 1.0) return RED;
    if (r > 0.9) return YELLOW;
    if (r > 0.86) return CREAM;
    return fract(s[0] / 0.045) < 0.12 ? WOOD_D : WOOD;
  });
  const spinnerPaint = paint((_p, _n, s) => (s[0] > 0.07 && s[0] < 0.12 ? RED : s[0] > 0.34 ? YELLOW_HI : BRASS));
  const flagPaint = paint((p) => ((Math.floor(p.z / 0.09) + Math.floor(p.y / 0.065)) % 2 === 0 ? RED : CREAM));
  const scarfPaint = paint((_p, _n, s) => (Math.floor(s[0] * 9) % 2 ? YELLOW : RED));
  const strutPaint = grain(WOOD, WOOD_D, { size: 0.03, axis: "y" });
  const redPlain = RED;

  // -------------------------------------------------------------------------------------------------------------
  // Fuselage: a round, tubby teardrop with an upswept tail
  const fuse = b.loft(
    [
      { at: [0, 1.4, 2.5], w: 1.1, h: 1.1 },
      { at: [0, 1.4, 2.35], w: 1.12, h: 1.12 },
      { at: [0, 1.42, 1.7], w: 1.22, h: 1.24 },
      { at: [0, 1.43, 0.9], w: 1.24, h: 1.28 },
      { at: [0, 1.43, 0.0], w: 1.14, h: 1.2 },
      { at: [0, 1.43, -0.8], w: 1.0, h: 1.08 },
      { at: [0, 1.45, -1.8], w: 0.76, h: 0.82 },
      { at: [0, 1.5, -2.9], w: 0.38, h: 0.4 },
      { at: [0, 1.59, -3.8], w: 0.12, h: 0.14 },
    ],
    { bone: body, color: fusePaint, sides: 12, name: "fuselage" },
  );

  // Cowling: a yellow shell with an engine and seven cylinder heads inside
  b.lathe(
    [
      [0.5, 0],
      [0.6, 0.12],
      [0.66, 0.4],
      [0.65, 0.75],
      [0.6, 0.93],
      [0.53, 0.93],
      [0.55, 0.75],
      [0.53, 0.4],
      [0.42, 0.12],
      [0.4, 0],
    ],
    { at: [0, 1.4, 2.1], axis: [0, 0, 1], segments: 16, color: cowlPaint, bone: body, name: "cowl" },
  );
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 14), STEEL_D, {
    bone: body,
    at: [0, 1.4, 2.6],
    dir: [0, 0, 1],
    name: "engineBarrel",
  });
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.2, 10), BRASS, { bone: body, at: [0, 1.4, 3.08], dir: [0, 0, 1] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.2;
    const x = 0.36 * Math.cos(a);
    const y = 1.4 + 0.36 * Math.sin(a);
    steelBits.push(cylZ(0.095, 0.095, 0.16, x, y, 3.06, 8));
    steelBits.push(cylZ(0.12, 0.12, 0.03, x, y, 3.1, 8));
    darkBits.push(cylZ(0.04, 0.04, 0.03, x, y, 3.13, 6));
  }
  // Cowl rivets
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    brassBits.push(sph(0.02, 0.665 * Math.cos(a), 1.4 + 0.665 * Math.sin(a), 2.5));
  }
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    brassBits.push(sph(0.017, 0.565 * Math.cos(a), 1.4 + 0.565 * Math.sin(a), 3.03));
  }

  // Exhaust pipes
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.5, 1.15, 2.75],
        [s * 0.7, 1.08, 2.4],
        [s * 0.74, 1.05, 1.9],
      ]),
      0.045,
      { color: STEEL_D, bone: body, sides: 6, name: s > 0 ? "exhaustL" : "exhaustR" },
    );

  // Propeller and spinner
  const propOutline: OutlinePoint[] = [
    [0.06, 0.1],
    [0.13, 0.35],
    [0.2, 0.75],
    [0.17, 1.02],
    [0, 1.1],
    [-0.17, 1.02],
    [-0.2, 0.75],
    [-0.13, 0.35],
    [-0.06, 0.1],
    [-0.06, -0.1],
    [-0.13, -0.35],
    [-0.2, -0.75],
    [-0.17, -1.02],
    [0, -1.1],
    [0.17, -1.02],
    [0.2, -0.75],
    [0.13, -0.35],
    [0.06, -0.1],
  ];
  const ca = Math.cos(20 * DEG);
  const sa = Math.sin(20 * DEG);
  b.extrude(propOutline, {
    at: [0, 1.4, 3.5],
    x: [ca, sa, 0],
    y: [-sa, ca, 0],
    thickness: 0.05,
    bevel: 0.015,
    color: propPaint,
    bone: prop,
    name: "propBlades",
  });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.33, 0.1],
      [0.3, 0.25],
      [0.2, 0.4],
      [0.08, 0.49],
      [0, 0.52],
    ],
    { at: [0, 1.4, 3.22], axis: [0, 0, 1], segments: 12, smoothing: 1, color: spinnerPaint, bone: prop, name: "spinner" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Cockpits, windscreens, headrest
  const cockpit = (z: number, y: number) => {
    b.part(new THREE.CylinderGeometry(1, 1, 0.22, 16), LEATHER, { bone: body, at: [0, y, z], scale: [0.32, 1, 0.38] });
    b.part(new THREE.TorusGeometry(1, 0.1, 6, 18), CREAM, {
      bone: body,
      at: [0, y + 0.11, z],
      rotation: [90, 0, 0],
      scale: [0.32, 0.38, 0.35],
    });
    b.part(new THREE.CylinderGeometry(1, 1, 0.02, 16), DARK, {
      bone: body,
      at: [0, y + 0.106, z],
      scale: [0.3, 1, 0.36],
    });
  };
  cockpit(0.7, 2.03);
  cockpit(-0.5, 1.95);

  const windscreen = (z: number, y: number, k: number) => {
    const scaled = (pts: Array<[number, number]>): OutlinePoint[] => pts.map(([px, py]) => [px * k, py * k]);
    const dirY: [number, number, number] = [0, 1, -0.45];
    b.extrude(
      scaled([
        [-0.34, -0.03],
        [0.34, -0.03],
        [0.32, 0.22],
        [0.16, 0.34],
        [-0.16, 0.34],
        [-0.32, 0.22],
      ]),
      { at: [0, y, z], x: [1, 0, 0], y: dirY, thickness: 0.04, bevel: 0.012, color: BRASS, bone: body },
    );
    b.extrude(
      scaled([
        [-0.3, 0],
        [0.3, 0],
        [0.28, 0.2],
        [0.14, 0.3],
        [-0.14, 0.3],
        [-0.28, 0.2],
      ]),
      { at: [0, y, z], x: [1, 0, 0], y: dirY, thickness: 0.06, bevel: 0.015, color: GLASS, bone: body },
    );
  };
  windscreen(1.08, 2.07, 1);
  windscreen(-0.12, 2.0, 0.9);

  b.part(new THREE.SphereGeometry(1, 10, 8), RED, { bone: body, at: [0, 1.88, -1.3], scale: [0.26, 0.13, 0.6] });

  // -------------------------------------------------------------------------------------------------------------
  // Wings
  const UP: Plan = { S: 4.6, zc: 0.2, y: 3.05, c: 1.6, rt: 0.6, xa0: 1.7, ac: 0.42, th: 0.16 };
  const LO: Plan = { S: 4.1, zc: 0.1, y: 1.25, c: 1.5, rt: 0.55, xa0: 1.4, ac: 0.4, th: 0.16 };
  const ST: Plan = { S: 1.35, zc: -3.3, y: 1.52, c: 0.95, rt: 0.42, xa0: 0.12, ac: 0.3, th: 0.07 };

  const wingSet = (P: Plan, main: Paint, flapPrefix: string, thick: number) => {
    b.extrude(planOutline(P), {
      at: [0, P.y, P.zc],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: P.th,
      bevel: P.th * 0.35,
      color: main,
      bone: body,
      name: `${flapPrefix}Wing`,
    });
    const hingeZ = P.zc - P.c / 2 + P.ac;
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const j = b.joint(`${flapPrefix}${side}`, {
        parent: body,
        at: [s * P.xa0, P.y, hingeZ],
        dir: [s, 0, 0],
        role: "hinge",
      });
      b.extrude(flapOutline(P, s), {
        at: [0, P.y, P.zc],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: P.th * thick,
        bevel: P.th * thick * 0.3,
        color: flapPaint,
        bone: j,
        name: `${flapPrefix}${side}Surface`,
      });
    }
  };
  wingSet(UP, wingPaint(UP, true, RED), "aileronU", 0.82);
  wingSet(LO, wingPaint(LO, false, RED), "aileronL", 0.82);
  wingSet(ST, wingPaint(ST, true, TEAL), "elevator", 0.85);

  // Wing roundels
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", {
      bone: body,
      at: [s * 2.65, UP.y + UP.th / 2 + 0.004, UP.zc],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: ROUNDEL,
    });
    b.part(new THREE.PlaneGeometry(0.85, 0.85), "#ffffff", {
      bone: body,
      at: [s * 2.45, LO.y - LO.th / 2 - 0.004, LO.zc],
      dir: [0, -1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: ROUNDEL,
    });
  }
  // Fuel cap on the top wing, navigation lights at the tips
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), BRASS, { bone: body, at: [0, UP.y + UP.th / 2, UP.zc] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), RED, { bone: body, at: [0, UP.y + UP.th / 2 + 0.02, UP.zc] });
  glow(
    b.part(new THREE.SphereGeometry(0.09, 8, 6), "#ff3b3b", { bone: body, at: [UP.S - 0.08, UP.y, UP.zc] }),
    1.4,
  );
  glow(
    b.part(new THREE.SphereGeometry(0.09, 8, 6), "#37e07a", { bone: body, at: [-(UP.S - 0.08), UP.y, UP.zc] }),
    1.4,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Struts, cabane and flying wires
  for (const s of [1, -1]) {
    const x = s * 2.3;
    b.frustumBox([x, LO.y, 0.58], [x, UP.y, 0.72], [0.07, 0.2], [0.07, 0.2], { color: strutPaint, bone: body });
    b.frustumBox([x, LO.y, -0.08], [x, UP.y, 0.02], [0.07, 0.2], [0.07, 0.2], { color: strutPaint, bone: body });
    // cabane
    b.frustumBox([s * 0.4, 1.9, 1.0], [s * 0.65, UP.y, 0.72], [0.08, 0.16], [0.08, 0.16], { color: RED, bone: body });
    b.frustumBox([s * 0.45, 1.8, -0.2], [s * 0.7, UP.y, 0.0], [0.08, 0.16], [0.08, 0.16], { color: RED, bone: body });
    // flying wires: out to the strut tops and bottoms, and drag wires inside the bay
    b.rod([s * 0.55, LO.y, 0.58], [x, UP.y - 0.05, 0.72], 0.011, WIRE, { bone: body, sides: 4 });
    b.rod([s * 0.7, UP.y - 0.05, 0.72], [x, LO.y + 0.05, 0.58], 0.011, WIRE, { bone: body, sides: 4 });
    b.rod([x, UP.y - 0.05, 0.72], [x, LO.y + 0.05, -0.08], 0.009, WIRE, { bone: body, sides: 4 });
    b.rod([x, UP.y - 0.05, 0.02], [x, LO.y + 0.05, 0.58], 0.009, WIRE, { bone: body, sides: 4 });
    // brass fittings where struts meet the wings
    for (const [fx, fz] of [
      [x, 0.58],
      [x, -0.08],
    ])
      brassBits.push(sph(0.05, fx, LO.y + LO.th / 2 + 0.005, fz, 6, 4));
    for (const [fx, fz] of [
      [x, 0.72],
      [x, 0.02],
    ])
      brassBits.push(sph(0.05, fx, UP.y - UP.th / 2 - 0.005, fz, 6, 4));
  }

  // Tail bracing wires and tail plane
  for (const s of [1, -1]) {
    b.rod([0, 2.5, -3.15], [s * 1.1, 1.55, -3.1], 0.009, WIRE, { bone: body, sides: 4 });
    b.rod([s * 1.1, 1.5, -3.1], [0, 1.28, -3.0], 0.009, WIRE, { bone: body, sides: 4 });
  }

  // Fin (fixed), rudder (hinged) and the fin stars
  b.extrude(
    [
      [-2.8, 1.5],
      [-3.15, 2.55],
      [-3.5, 2.65],
      [-3.52, 1.45],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.025, smoothing: 1, color: finPaint, bone: body, name: "fin" },
  );
  b.extrude(
    [
      [-3.56, 1.4],
      [-3.56, 2.62],
      [-3.85, 2.78],
      [-4.2, 2.55],
      [-4.3, 2.0],
      [-4.15, 1.55],
      [-3.9, 1.4],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.025, smoothing: 1, color: rudderPaint, bone: rudder, name: "rudderSurface" },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone: body,
      at: [s * 0.049, 2.0, -3.25],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      axis: "z",
      texture: FIN_STAR,
    });

  // Pennant on a pole atop the fin
  b.rod([0, 2.5, -3.4], [0, 3.1, -3.4], 0.014, WOOD_D, { bone: body, sides: 6 });
  brassBits.push(sph(0.032, 0, 3.115, -3.4, 6, 4));
  b.extrude(
    [
      [-3.41, 3.06],
      [-4.0, 2.96],
      [-3.85, 2.89],
      [-4.0, 2.82],
      [-3.41, 2.72],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.015, color: flagPaint, bone: pennant, name: "pennantCloth" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Landing gear
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wheel = b.joint(`wheel${side}`, { parent: body, at: [s * 1.0, 0.5, 0.75], dir: [s, 0, 0], role: "hinge" });
    b.part(new THREE.TorusGeometry(0.36, 0.14, 8, 16), tirePaint, {
      bone: wheel,
      at: [s * 1.0, 0.5, 0.75],
      dir: [1, 0, 0],
      axis: "z",
    });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 12), RED, { bone: wheel, at: [s * 1.0, 0.5, 0.75], dir: [1, 0, 0] });
    b.part(new THREE.CircleGeometry(0.27, 14), "#ffffff", {
      bone: wheel,
      at: [s * 1.127, 0.5, 0.75],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUB,
    });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), BRASS, { bone: wheel, at: [s * 1.135, 0.5, 0.75] });
    // V gear legs
    b.rod([s * 0.35, 1.0, 1.0], [s * 0.85, 0.52, 0.8], 0.055, NAVY, { bone: body, sides: 8 });
    b.rod([s * 0.35, 1.0, 0.4], [s * 0.85, 0.52, 0.72], 0.055, NAVY, { bone: body, sides: 8 });
    // shock absorber collars
    b.rod([s * 0.58, 0.77, 0.9], [s * 0.66, 0.69, 0.88], 0.075, BRASS, { bone: body, sides: 8 });
  }
  b.rod([-0.85, 0.5, 0.76], [0.85, 0.5, 0.76], 0.035, STEEL_D, { bone: body, sides: 8, name: "axle" });

  // Tail wheel on a curved leaf spring
  b.sweep(
    catmull([
      [0, 1.25, -2.7],
      [0, 0.9, -2.95],
      [0, 0.6, -3.15],
      [0, 0.42, -3.22],
    ]),
    [0.05, 0.035],
    { color: NAVY, bone: body, sides: 8, name: "tailSpring" },
  );
  b.part(new THREE.TorusGeometry(0.1, 0.07, 6, 12), TIRE_A, { bone: tailWheel, at: [0, 0.17, -3.22], dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), CREAM, { bone: tailWheel, at: [0, 0.17, -3.22], dir: [1, 0, 0] });
  for (const s of [1, -1]) b.rod([s * 0.085, 0.42, -3.22], [s * 0.085, 0.17, -3.22], 0.018, STEEL, { bone: swivel, sides: 6 });
  b.rod([-0.085, 0.42, -3.22], [0.085, 0.42, -3.22], 0.02, STEEL, { bone: swivel, sides: 6 });

  // -------------------------------------------------------------------------------------------------------------
  // Pilot (rear cockpit)
  b.capsule([0, 1.98, -0.5], [0, 2.18, -0.52], 0.2, LEATHER, { bone: body, sides: 10 });
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, 2.2, -0.52], [s * 0.05, 2.1, -0.28], 0.06, LEATHER, { bone: body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), LEATHER_D, { bone: body, at: [s * 0.045, 2.11, -0.28] });
  }
  b.rod([0, 1.95, -0.28], [0, 2.14, -0.28], 0.018, STEEL_D, { bone: body, sides: 6 });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), DARK, { bone: body, at: [0, 2.16, -0.28] });
  for (const y of [2.0, 2.08, 2.16]) brassBits.push(sph(0.018, 0, y, -0.31));
  b.part(new THREE.TorusGeometry(0.15, 0.05, 6, 10), YELLOW, { bone: body, at: [0, 2.37, -0.5], rotation: [90, 0, 0] });
  b.sweep(scarf, (t) => [0.075 * (1 - 0.25 * t), 0.013], { section: "box", color: scarfPaint, caps: "flat", name: "scarfRibbon" });

  const head = b.part(new THREE.SphereGeometry(0.2, 12, 8), SKIN, { bone: pilotHead, at: [0, 2.52, -0.5], name: "pilotSkull" });
  b.part(new THREE.SphereGeometry(0.215, 10, 6, 0, Math.PI * 2, 0, 1.3), LEATHER_D, { bone: pilotHead, at: [0, 2.53, -0.5] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), LEATHER_D, {
      bone: pilotHead,
      at: [s * 0.195, 2.5, -0.5],
      scale: [0.035, 0.09, 0.08],
    });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), SKIN, { bone: pilotHead, at: [s * 0.2, 2.47, -0.5] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), BRASS, {
      bone: pilotHead,
      at: [s * 0.085, 2.66, -0.34],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 10), GLASS, {
      bone: pilotHead,
      at: [s * 0.085, 2.66, -0.318],
      dir: [0, 0, 1],
    });
  }
  b.part(new THREE.TorusGeometry(0.205, 0.016, 4, 14), DARK, { bone: pilotHead, at: [0, 2.64, -0.5], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#f29a79", { bone: pilotHead, at: [0, 2.525, -0.3] });
  b.decal(head, FACE, { at: [0, 2.52, -0.25], dir: [0, 0, 1], size: [0.3, 0.24], bone: pilotHead, name: "pilotFace" });

  // -------------------------------------------------------------------------------------------------------------
  // Teddy-bear passenger (front cockpit), arms up
  b.part(new THREE.SphereGeometry(1, 10, 8), BEAR, { bone: body, at: [0, 2.18, 0.7], scale: [0.23, 0.25, 0.21] });
  b.part(new THREE.SphereGeometry(1, 8, 6), BEAR_L, { bone: body, at: [0, 2.16, 0.87], scale: [0.14, 0.17, 0.05] });
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, 2.28, 0.7], [s * 0.36, 2.55, 0.74], 0.06, BEAR, { bone: body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BEAR, { bone: body, at: [s * 0.37, 2.57, 0.74] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BEAR_L, { bone: body, at: [s * 0.37, 2.58, 0.8] });
  }
  b.part(new THREE.TorusGeometry(0.14, 0.04, 6, 10), RED, { bone: body, at: [0, 2.34, 0.7], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.19, 12, 8), BEAR, { bone: bearHead, at: [0, 2.52, 0.7], name: "bearSkull" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BEAR, { bone: bearHead, at: [s * 0.14, 2.67, 0.7] });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), PINK, { bone: bearHead, at: [s * 0.14, 2.67, 0.74] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), DARK, { bone: bearHead, at: [s * 0.075, 2.56, 0.865] });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), "#ffffff", { bone: bearHead, at: [s * 0.068, 2.572, 0.89] });
    b.part(new THREE.TorusGeometry(0.052, 0.014, 5, 10), BRASS, { bone: bearHead, at: [s * 0.075, 2.67, 0.84] });
    b.part(new THREE.CircleGeometry(0.045, 10), GLASS, { bone: bearHead, at: [s * 0.075, 2.67, 0.845], dir: [0, 0, 1], axis: "z" });
  }
  b.part(new THREE.TorusGeometry(0.195, 0.012, 4, 14), DARK, { bone: bearHead, at: [0, 2.67, 0.7], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(1, 8, 6), BEAR_L, { bone: bearHead, at: [0, 2.47, 0.87], scale: [0.1, 0.075, 0.08] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), DARK, { bone: bearHead, at: [0, 2.5, 0.945] });

  // -------------------------------------------------------------------------------------------------------------
  // Fuselage banner on both flanks
  for (const s of [1, -1])
    b.decal(fuse, BANNER, {
      at: [s * 0.6, 1.46, -1.4],
      dir: [s, 0, 0],
      size: [1.5, 0.44],
      segments: 16,
      bone: body,
      name: s > 0 ? "bannerL" : "bannerR",
    });

  // -------------------------------------------------------------------------------------------------------------
  // Bunting strung between the interplane struts
  for (const s of [1, -1]) {
    const x = s * 2.3;
    const rope = catmull([
      [x, 2.5, 0.677],
      [x, 2.32, 0.33],
      [x, 2.5, -0.011],
    ]);
    b.sweep(rope, 0.008, { color: WIRE, bone: body, sides: 4, caps: "flat", name: "buntingRope" });
    const hooks = Array.from({ length: 5 }, (_, i) => frame(rope.at((i + 0.5) / 5), [0, 1, 0]));
    b.cards(hooks, FLAGS, { size: [0.12, 0.16], lean: 180, flow: [1, 0, 0], bone: body, vary: 0.08 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Flush merged detail bits
  b.part(mergeGeometries(brassBits)!, BRASS, { bone: body, at: [0, 0, 0], name: "brassBits" });
  b.part(mergeGeometries(steelBits)!, STEEL, { bone: body, at: [0, 0, 0], name: "cylinderHeads" });
  b.part(mergeGeometries(darkBits)!, DARK, { bone: body, at: [0, 0, 0], name: "sparkPlugs" });
  b.part(new THREE.SphereGeometry(0.001, 3, 2), redPlain, { bone: body, at: [0, 1.4, 1.5] });

  return b.root;
}
