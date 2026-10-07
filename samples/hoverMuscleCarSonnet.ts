// Retro-future muscle car on four ducted hover thrusters, Overwatch look: clean bevelled panels, navy / pale colour
// blocking with one strong orange accent that carries the stripes, trims, glows and thruster light.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Joint as J } from "../src/skeleton";
import type { OutlinePoint } from "../src/builder";
import { mix, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Hover Muscle Car",
  description:
    "Retro-future muscle car with a long hood, fastback and tail fins, riding on four gimballed ducted hover thrusters with spinning rotors, opening doors, hood, trunk and active spoiler.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: pale body, navy lower, one orange accent.
const PALE = "#e7edf4";
const PALE_SH = "#bccadb";
const NAVY = "#25324d";
const NAVY_LT = "#34466a";
const INK = "#141a29";
const ACCENT = "#ff7a1c";
const ACCENT_DK = "#c4510c";
const GLOW_O = "#ff8a2a";
const GLOW_HOT = "#ffd27a";
const LAMP = "#fff6dc";
const TAIL = "#ff3a1f";
const CHROME = "#cfd9e5";
const STEEL = "#68748b";
const STEEL_DK = "#454f66";
const GLASS_A = "#1f4259";
const GLASS_B = "#3b7896";
const GLASS_C = "#a8dcea";
const SEAT = "#2c3650";
const SEAT_LT = "#46536f";
const RUBBER = "#1b2130";

type P2 = OutlinePoint;
type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "hoverMuscleCar", paintSize: 2048, detail: 0.85 });

  // ------------------------------------------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: [0, 0.62, 0], dir: [0, 0, 1] });
  const hood = b.joint("hood", { parent: body, at: [0, 0.93, 0.64], dir: [0, 0, 1], role: "hinge" });
  const trunk = b.joint("trunk", { parent: body, at: [0, 0.96, -1.6], dir: [0, 0, -1], role: "hinge" });
  const flap = b.joint("spoilerFlap", { parent: body, at: [0, 1.22, -2.3], dir: [0, 0, -1], role: "hinge" });
  const steer = b.joint("steering", { parent: body, at: [0.36, 0.78, 0.45], aim: [0.36, 0.93, 0.36], role: "hinge" });
  const wiperL = b.joint("wiperL", { parent: body, at: [0.36, 0.955, 0.56], dir: [-1, 0, 0], role: "hinge" });
  const wiperR = b.joint("wiperR", { parent: body, at: [-0.04, 0.955, 0.56], dir: [-1, 0, 0], role: "hinge" });
  const door: Record<string, J> = {};
  const mirror: Record<string, J> = {};
  for (const [id, s] of [["L", 1], ["R", -1]] as const) {
    door[id] = b.joint(`door${id}`, { parent: body, at: [s * 0.9, 0.46, 0.55], dir: [0, 1, 0], role: "hinge" });
    mirror[id] = b.joint(`mirror${id}`, { parent: door[id], at: [s * 0.96, 0.96, 0.48], dir: [0, 1, 0], role: "hinge" });
  }
  const POD = [
    ["FL", 1, 1.55],
    ["FR", -1, 1.55],
    ["RL", 1, -1.55],
    ["RR", -1, -1.55],
  ] as const;
  const thruster: Record<string, J> = {};
  const rotor: Record<string, J> = {};
  for (const [id, s, z] of POD) {
    thruster[id] = b.joint(`thruster${id}`, { parent: body, at: [s * 0.8, 0.2, z], dir: [0, -1, 0], role: "hinge" });
    rotor[id] = b.joint(`rotor${id}`, { parent: thruster[id], at: [s * 0.8, 0.25, z], dir: [0, 1, 0], role: "fan" });
  }

  // ------------------------------------------------------------------------------------------------ helpers
  // Merge many small static pieces per bone and colour into one part each.
  const bags = new Map<string, { color: string; bone: J; geos: THREE.BufferGeometry[]; glow: number }>();
  const put = (bone: J, color: string, geo: THREE.BufferGeometry, glowStrength = 0) => {
    const key = `${bone.name}|${color}|${glowStrength}`;
    let bag = bags.get(key);
    if (!bag) bags.set(key, (bag = { color, bone, geos: [], glow: glowStrength }));
    bag.geos.push(geo);
  };
  const box = (w: number, h: number, d: number, at: V, rot: V = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX((rot[0] * Math.PI) / 180);
    g.rotateY((rot[1] * Math.PI) / 180);
    g.rotateZ((rot[2] * Math.PI) / 180);
    return g.translate(at[0], at[1], at[2]);
  };
  const cyl = (r: number, r2: number, h: number, seg: number, at: V, axis: "x" | "y" | "z" = "y") => {
    const g = new THREE.CylinderGeometry(r, r2, h, seg);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    return g.translate(at[0], at[1], at[2]);
  };
  const ball = (r: number, at: V) => new THREE.SphereGeometry(r, 6, 4).translate(at[0], at[1], at[2]);

  const SIDE = { x: [0, 0, 1] as V, y: [0, 1, 0] as V }; // outline [z, y], thickness across the car
  const PLAN = { x: [1, 0, 0] as V, y: [0, 0, 1] as V }; // outline [x, z], thickness vertical

  // ------------------------------------------------------------------------------------------------ paints
  // One livery over every body panel: navy lower band, orange sill line, orange racing stripe over the roofline.
  const bodyPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (p.y < 0.585) return mix(NAVY, NAVY_LT, smoothstep(0.34, 0.58, p.y) * 0.5);
    if (p.y < 0.605) return ACCENT;
    if (n.y > 0.6) {
      if (ax > 0.09 && ax < 0.2) return ACCENT;
      if (ax > 0.215 && ax < 0.232) return NAVY;
    }
    // swoosh over the flanks
    if (Math.abs(n.x) > 0.6) {
      const u = p.y + 0.2 * p.z;
      if (u > 0.9 && u < 0.925) return ACCENT;
      if (u > 0.925 && u < 1.02) return NAVY;
    }
    const dirt = noise(p, 0.5, 3) * 0.5 + smoothstep(0.95, 0.62, p.y) * 0.35;
    return mix(PALE, PALE_SH, dirt);
  });
  const darkPaint = paint((p) => mix(NAVY, INK, noise(p, 0.4, 5) * 0.5));
  const ductPaint = paint((_p, _n, s) => {
    const deg = ((s[1] % 360) + 360) % 360;
    if (s[0] < 0.07) return Math.floor(deg / 15) % 2 ? ACCENT : INK;
    if (s[0] > 0.2 && s[0] < 0.3) return mix(NAVY, NAVY_LT, 0.6);
    return deg % 45 < 5 ? NAVY_LT : mix(NAVY, INK, 0.35);
  });
  const glassPaint = paint((_p, _n, s) => {
    const d = s[0] * 0.9 + s[1] * 1.15;
    const band = (((d % 0.55) + 0.55) % 0.55) / 0.55;
    if (band > 0.1 && band < 0.16) return GLASS_C;
    if (band > 0.2 && band < 0.24) return GLASS_B;
    return mix(GLASS_B, GLASS_A, smoothstep(-0.25, 0.25, s[1]));
  });
  const roofPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y > 0.6) {
      if (ax > 0.09 && ax < 0.2) return ACCENT;
      if (ax > 0.215 && ax < 0.232) return PALE;
    }
    return mix(NAVY, NAVY_LT, noise(p, 0.6, 9) * 0.7);
  });
  const lerpV = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  // ------------------------------------------------------------------------------------------------ textures
  const roundel = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#f3f6fa" stroke="#25324d" stroke-width="6"/>` +
      `<path d="M16 66 L50 30 L84 66 L72 66 L50 44 L28 66Z" fill="#ff7a1c"/>` +
      `<path d="M26 78 L50 54 L74 78 L66 78 L50 62 L34 78Z" fill="#25324d"/></svg>`,
    { size: 192 },
  );
  const plate = svg(
    `<svg viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="8" fill="#f3f6fa" stroke="#25324d" stroke-width="4"/>` +
      `<rect x="8" y="8" width="104" height="10" fill="#ff7a1c"/>` +
      `<text x="60" y="48" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle" fill="#25324d">HOVR-77</text></svg>`,
    { size: 256 },
  );
  const cluster = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#10141f"/>` +
      `<circle cx="22" cy="20" r="15" fill="none" stroke="#ff8a2a" stroke-width="4"/><path d="M22 20 L30 11" stroke="#ffd27a" stroke-width="3"/>` +
      `<circle cx="98" cy="20" r="15" fill="none" stroke="#ff8a2a" stroke-width="4"/><path d="M98 20 L90 28" stroke="#ffd27a" stroke-width="3"/>` +
      `<rect x="44" y="10" width="32" height="5" fill="#ff8a2a"/><rect x="44" y="19" width="22" height="5" fill="#ff8a2a"/><rect x="44" y="28" width="28" height="5" fill="#ffd27a"/></svg>`,
    { size: 256 },
  );
  const screen = svg(
    `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#10141f"/><rect x="3" y="3" width="74" height="44" fill="none" stroke="#ff8a2a" stroke-width="2"/>` +
      `<path d="M8 38 L24 22 L36 30 L54 12 L72 26" fill="none" stroke="#ffd27a" stroke-width="3"/>` +
      `<rect x="8" y="8" width="22" height="4" fill="#ff8a2a"/><circle cx="62" cy="38" r="5" fill="#ff8a2a"/></svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------------------------------------ hull
  const BEVEL = { bevel: 0.085, detail: 0.8 };
  // Front clip with nose.
  b.extrude(
    [
      [0.55, 0.32],
      [2.3, 0.32],
      [2.4, 0.4],
      [2.42, 0.66],
      [2.38, 0.8],
      [2.22, 0.87],
      [1.4, 0.89],
      [0.55, 0.89],
    ] as P2[],
    { at: [0, 0, 0], ...SIDE, thickness: 1.76, ...BEVEL, color: bodyPaint, bone: body, name: "frontClip" },
  );
  // Cabin hull (floor tub) and rear clip.
  b.extrude(
    [
      [-0.95, 0.32],
      [0.55, 0.32],
      [0.55, 0.58],
      [-0.95, 0.58],
    ] as P2[],
    { at: [0, 0, 0], ...SIDE, thickness: 1.76, ...BEVEL, color: bodyPaint, bone: body, name: "cabinHull" },
  );
  b.extrude(
    [
      [-0.95, 0.32],
      [-2.25, 0.32],
      [-2.4, 0.4],
      [-2.43, 0.6],
      [-2.42, 0.82],
      [-2.34, 0.9],
      [-2.15, 0.93],
      [-0.95, 0.93],
    ] as P2[],
    { at: [0, 0, 0], ...SIDE, thickness: 1.76, ...BEVEL, color: bodyPaint, bone: body, name: "rearClip" },
  );

  // Wheel-arch flares around the thrusters.
  const archPts = (z0: number): P2[] => {
    const r = 0.42;
    const cy = 0.1;
    const yb = 0.36;
    const th0 = Math.asin((yb - cy) / r);
    const pts: P2[] = [];
    for (let a = 0; a <= 8; a++) {
      const th = Math.PI - th0 - (a / 8) * (Math.PI - 2 * th0);
      pts.push([z0 + r * Math.cos(th), cy + r * Math.sin(th)]);
    }
    return pts;
  };
  const frontFlare: P2[] = [[0.7, 0.36], ...archPts(1.55), [2.15, 0.36], [2.26, 0.5], [2.22, 0.78], [2.05, 0.88], [0.7, 0.88]];
  const rearFlare: P2[] = [
    [-2.38, 0.5],
    [-2.3, 0.36],
    ...archPts(-1.55),
    [-0.65, 0.36],
    [-0.6, 0.8],
    [-0.72, 0.96],
    [-2.25, 0.96],
    [-2.4, 0.86],
  ];
  for (const s of [1, -1]) {
    b.extrude(frontFlare, { at: [s * 0.93, 0, 0], ...SIDE, thickness: 0.12, bevel: 0.025, detail: 0.7, color: bodyPaint, bone: body, name: "frontFlare" });
    b.extrude(rearFlare, { at: [s * 0.94, 0, 0], ...SIDE, thickness: 0.14, bevel: 0.03, detail: 0.7, color: bodyPaint, bone: body, name: "rearFlare" });
    // arch trim in accent
    for (const z0 of [1.55, -1.55]) {
      const pts = archPts(z0).map((q) => [s * 0.997, q[1] as number, q[0] as number] as V);
      b.sweep(pts, 0.011, { color: ACCENT, bone: body, sides: 4, caps: "flat" });
    }
    // wheel-well liner
    for (const z0 of [1.55, -1.55])
      b.extrude(archPts(z0), { at: [s * 0.885, 0, 0], ...SIDE, thickness: 0.02, color: INK, bone: body, name: "archLiner" });
  }

  // Hood (hinged), power dome, scoop.
  b.extrude(
    [
      [-0.84, 0.64],
      [0.84, 0.64],
      [0.82, 1.4],
      [0.72, 2.15],
      [0.55, 2.32],
      [-0.55, 2.32],
      [-0.72, 2.15],
      [-0.82, 1.4],
    ] as P2[],
    { at: [0, 0.905, 0], ...PLAN, thickness: 0.07, bevel: 0.022, detail: 0.7, color: bodyPaint, bone: hood, name: "hoodPlate" },
  );
  b.extrude(
    [
      [-0.26, 0.95],
      [0.26, 0.95],
      [0.3, 1.5],
      [0.24, 2.0],
      [-0.24, 2.0],
      [-0.3, 1.5],
    ] as P2[],
    { at: [0, 0.978, 0], ...PLAN, thickness: 0.07, bevel: 0.028, detail: 0.8, smoothing: 1, color: bodyPaint, bone: hood, name: "hoodDome" },
  );
  put(hood, INK, box(0.36, 0.045, 0.05, [0, 0.99, 2.0]));
  put(hood, ACCENT, box(0.4, 0.012, 0.012, [0, 1.017, 2.02]));
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) put(hood, INK, box(0.2, 0.008, 0.02, [s * 0.52, 0.944, 1.0 + i * 0.085], [0, s * 24, 0]));
    put(hood, STEEL_DK, cyl(0.014, 0.014, 0.016, 6, [s * 0.74, 0.945, 0.9]));
    put(hood, STEEL_DK, cyl(0.014, 0.014, 0.016, 6, [s * 0.66, 0.945, 2.1]));
  }

  // Cowl vent between hood and windshield.
  put(body, INK, box(1.5, 0.02, 0.06, [0, 0.88, 0.585]));

  // ------------------------------------------------------------------------------------------------ front end
  const frontBumper: P2[] = [
    [-0.88, 2.2],
    [-0.88, 2.4],
    [-0.72, 2.53],
    [0.72, 2.53],
    [0.88, 2.4],
    [0.88, 2.2],
  ];
  b.extrude(frontBumper, { at: [0, 0.44, 0], ...PLAN, thickness: 0.13, bevel: 0.035, detail: 0.7, color: CHROME, bone: body, name: "bumperF" });
  b.extrude(
    [
      [-0.95, 2.2],
      [0.95, 2.2],
      [0.95, 2.4],
      [0.78, 2.62],
      [-0.78, 2.62],
      [-0.95, 2.4],
    ] as P2[],
    { at: [0, 0.325, 0], ...PLAN, thickness: 0.045, bevel: 0.012, detail: 0.6, color: darkPaint, bone: body, name: "splitter" },
  );
  put(body, ACCENT, box(1.5, 0.012, 0.014, [0, 0.35, 2.615]));
  for (const s of [1, -1]) {
    // canard winglets
    b.extrude(
      [
        [0, 0],
        [0.2, 0.02],
        [0.26, 0.2],
        [0.02, 0.2],
      ] as P2[],
      { at: [s * 0.72, 0.4, 2.12], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.02, color: ACCENT, bone: body, name: "canard" },
    );
  }
  for (const s of [1, -1]) {
    put(body, LAMP, cyl(0.04, 0.04, 0.02, 10, [s * 0.5, 0.44, 2.536], "z"), 1.4);
    put(body, STEEL_DK, cyl(0.055, 0.055, 0.016, 10, [s * 0.5, 0.44, 2.53], "z"));
  }
  b.part(new THREE.PlaneGeometry(0.26, 0.13), "#ffffff", { bone: body, at: [0, 0.44, 2.5375], dir: [0, 0, 1], axis: "z", texture: plate });
  for (const s of [1, -1])
    for (const x of [0.3, 0.68, 0.8]) {
      put(body, STEEL_DK, ball(0.016, [s * x, 0.47, 2.535]));
      put(body, STEEL_DK, ball(0.016, [s * x, 0.41, 2.535]));
    }
  // Grille
  put(body, INK, box(0.82, 0.25, 0.04, [0, 0.64, 2.42]));
  for (let i = 0; i < 5; i++) put(body, CHROME, box(0.76, 0.014, 0.02, [0, 0.54 + i * 0.05, 2.445]));
  put(body, ACCENT, box(0.86, 0.016, 0.03, [0, 0.775, 2.43]));
  put(body, ACCENT, box(0.86, 0.016, 0.03, [0, 0.515, 2.43]));
  put(body, ACCENT, box(0.016, 0.28, 0.03, [0.43, 0.645, 2.43]));
  put(body, ACCENT, box(0.016, 0.28, 0.03, [-0.43, 0.645, 2.43]));
  // Roundel badge
  b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone: body, at: [0, 0.645, 2.455], dir: [0, 0, 1], axis: "z", texture: roundel });
  // Headlights: two per side, bezels + glowing lenses
  for (const s of [1, -1]) {
    for (const [x, r] of [
      [0.62, 0.11],
      [0.79, 0.07],
    ] as const) {
      b.lathe(
        [
          [r * 0.66, 0],
          [r * 1.1, 0],
          [r * 1.1, 0.03],
          [r * 0.9, 0.045],
          [r * 0.66, 0.035],
        ] as P2[],
        { at: [s * x, 0.67, 2.395], axis: [0, 0, 1], segments: 14, color: CHROME, bone: body, name: "bezel" },
      );
      put(body, LAMP, cyl(r * 0.66, r * 0.66, 0.03, 12, [s * x, 0.67, 2.43], "z"), 1.6);
    }
    put(body, GLOW_HOT, box(0.26, 0.018, 0.016, [s * 0.62, 0.795, 2.405]), 1.0);
    put(body, ACCENT, box(0.018, 0.14, 0.02, [s * 0.705, 0.67, 2.415]));
  }

  // Front fender gills
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) put(body, INK, box(0.014, 0.2, 0.026, [s * 0.995, 0.68, 0.82 + i * 0.065], [-22, 0, 0]));

  // ------------------------------------------------------------------------------------------------ cabin
  // A-pillar tumblehome: windshield and rear glass slabs, frame rods
  const wsBL: V = [0.84, 0.945, 0.58];
  const wsTL: V = [0.68, 1.26, 0.14];
  const wsTR: V = [-0.68, 1.26, 0.14];
  const wsBR: V = [-0.84, 0.945, 0.58];
  b.slab([wsBL, wsBR, wsTR, wsTL], { color: glassPaint, thickness: 0.016, bone: body, name: "windshield" });
  b.slab([wsTL, wsTR, lerpV(wsTR, wsBR, 0.12), lerpV(wsTL, wsBL, 0.12)], { color: ACCENT, thickness: 0.02, bone: body, name: "visor" });
  const rgBL: V = [0.84, 0.955, -1.58];
  const rgTL: V = [0.68, 1.262, -0.86];
  const rgTR: V = [-0.68, 1.262, -0.86];
  const rgBR: V = [-0.84, 0.955, -1.58];
  b.slab([rgBL, rgTL, rgTR, rgBR], { color: glassPaint, thickness: 0.016, bone: body, name: "rearGlass" });
  for (const s of [1, -1]) {
    b.rod([s * 0.845, 0.94, 0.585], [s * 0.69, 1.265, 0.135], 0.022, { color: NAVY, bone: body, sides: 6, name: "aPillar" });
    b.rod([s * 0.85, 0.955, -1.6], [s * 0.69, 1.268, -0.87], 0.016, { color: NAVY, bone: body, sides: 6, name: "rearGlassFrame" });
    // quarter panel (tumblehome via slanted outline axis)
    b.extrude(
      [
        [-0.46, 0],
        [-0.52, 0.33],
        [-0.62, 0.37],
        [-0.86, 0.375],
        [-1.3, 0.19],
        [-1.62, 0.02],
        [-1.62, 0],
      ] as P2[],
      { at: [s * 0.86, 0.93, 0], x: [0, 0, 1], y: [-s * 0.45, 1, 0], thickness: 0.07, bevel: 0.02, detail: 0.7, color: bodyPaint, bone: body, name: "quarter" },
    );
    // fixed rear door filler
    b.extrude(
      [
        [-0.95, 0.46],
        [-0.46, 0.46],
        [-0.46, 0.93],
        [-0.95, 0.93],
      ] as P2[],
      { at: [s * 0.89, 0, 0], ...SIDE, thickness: 0.07, bevel: 0.015, detail: 0.7, color: bodyPaint, bone: body, name: "filler" },
    );
    // roof drip rails
    put(body, STEEL_DK, box(0.03, 0.022, 1.0, [s * 0.69, 1.248, -0.35], [0, 0, s * 12]));
  }
  // Roof, front header
  b.extrude(
    [
      [-0.66, 0.16],
      [0.66, 0.16],
      [0.72, -0.1],
      [0.72, -0.78],
      [0.64, -0.88],
      [-0.64, -0.88],
      [-0.72, -0.78],
      [-0.72, -0.1],
    ] as P2[],
    { at: [0, 1.258, 0], ...PLAN, thickness: 0.06, bevel: 0.02, detail: 0.7, color: roofPaint, bone: body, name: "roof" },
  );
  put(body, NAVY, box(1.28, 0.03, 0.025, [0, 1.246, 0.17]));
  put(body, NAVY, box(1.2, 0.03, 0.025, [0, 1.25, -0.89]));
  // Wiper arms
  for (const [w, x] of [[wiperL, 0.36], [wiperR, -0.04]] as const) {
    put(w, INK, box(0.34, 0.008, 0.012, [x - 0.17, 0.96, 0.555]));
    put(w, INK, box(0.02, 0.015, 0.02, [x, 0.958, 0.56]));
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) put(body, INK, box(0.012, 0.07, 0.022, [s * 0.887, 0.395, -0.32 + i * 0.14]));
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: body, at: [s * 0.848, 1.06, -0.92], dir: [s * 0.9, 0.43, 0], axis: "z", texture: roundel });
  }
  // Panel seams on the flares, third brake light
  for (const s of [1, -1]) {
    put(body, INK, box(0.01, 0.52, 0.008, [s * 0.992, 0.62, 0.705]));
    put(body, INK, box(0.01, 0.6, 0.008, [s * 1.012, 0.66, -0.64], [0, 0, 0]));
  }
  put(body, GLOW_O, box(1.0, 0.014, 0.014, [0, 1.252, -0.905]), 0.9);
  // Antenna
  b.rod([-0.62, 1.2, -0.95], [-0.7, 1.52, -1.1], [0.01, 0.004], { color: INK, bone: body, sides: 4, name: "antenna" });
  put(body, GLOW_O, ball(0.016, [-0.7, 1.525, -1.1]), 1.5);

  // Doors with windows rolled down, handles, mirrors, roundel decals
  for (const [id, s] of [["L", 1], ["R", -1]] as const) {
    const d = door[id];
    const x = s * 0.89;
    b.extrude(
      [
        [-0.44, 0.46],
        [0.52, 0.46],
        [0.56, 0.62],
        [0.56, 0.93],
        [-0.44, 0.93],
      ] as P2[],
      { at: [x, 0, 0], ...SIDE, thickness: 0.07, bevel: 0.015, detail: 0.7, color: bodyPaint, bone: d, name: `doorPanel${id}` },
    );
    const o = s * 0.926;
    put(d, CHROME, box(0.02, 0.014, 0.98, [o, 0.935, 0.06]));
    put(d, INK, box(0.014, 0.05, 0.16, [o, 0.86, -0.3]));
    put(d, CHROME, box(0.022, 0.026, 0.13, [s * 0.935, 0.862, -0.3]));
    put(d, INK, box(0.01, 0.42, 0.008, [o, 0.7, 0.562]));
    put(d, INK, box(0.01, 0.42, 0.008, [o, 0.7, -0.445]));
    put(d, INK, box(0.01, 0.01, 0.98, [o, 0.468, 0.06]));
    put(d, ACCENT, box(0.012, 0.014, 0.4, [o, 0.655, -0.05]));
    // interior liner + armrest
    put(d, SEAT, box(0.03, 0.34, 0.98, [s * 0.845, 0.76, 0.05]));
    put(d, SEAT_LT, box(0.07, 0.05, 0.45, [s * 0.8, 0.84, -0.1]));
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: d, at: [s * 0.9285, 0.74, 0.2], dir: [s, 0, 0], axis: "z", texture: roundel });
    // mirror
    const m = mirror[id];
    b.extrude(
      [
        [0, 0],
        [0.07, 0.02],
        [0.1, 0.09],
        [0.05, 0.12],
        [-0.02, 0.08],
      ] as P2[],
      { at: [s * 1.0, 0.94, 0.48], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, smoothing: 1, detail: 0.6, color: ACCENT, bone: m, name: `mirrorHousing${id}` },
    );
    put(m, GLASS_C, box(0.075, 0.07, 0.008, [s * 1.0, 1.0, 0.376]));
    put(m, STEEL_DK, box(0.1, 0.03, 0.03, [s * 0.955, 0.948, 0.5]));
  }

  // ------------------------------------------------------------------------------------------------ interior
  put(body, RUBBER, box(1.6, 0.012, 1.45, [0, 0.586, -0.2]));
  put(body, SEAT_LT, box(0.22, 0.14, 0.95, [0, 0.66, -0.05]));
  put(body, INK, box(0.14, 0.012, 0.3, [0, 0.735, 0.15]));
  put(body, ACCENT, box(0.02, 0.13, 0.02, [0, 0.8, 0.12], [-12, 0, 0]));
  put(body, STEEL, ball(0.03, [0, 0.87, 0.115]));
  const seat = (x: number, z: number, wide: number, depth: number, tag: string) => {
    put(body, SEAT, box(wide, 0.1, depth, [x, 0.65, z]));
    put(body, SEAT_LT, box(0.07, 0.14, depth, [x - wide / 2 + 0.03, 0.68, z]));
    put(body, SEAT_LT, box(0.07, 0.14, depth, [x + wide / 2 - 0.03, 0.68, z]));
    put(body, ACCENT, box(wide - 0.06, 0.012, 0.012, [x, 0.705, z + depth / 2 - 0.01]));
    b.extrude(
      [
        [z - 0.22, 0.66],
        [z - 0.34, 0.66],
        [z - 0.46, 1.1],
        [z - 0.3, 1.12],
      ] as P2[],
      { at: [x, 0, 0], ...SIDE, thickness: wide, bevel: 0.025, detail: 0.6, color: SEAT, bone: body, name: `seatBack${tag}` },
    );
    put(body, SEAT_LT, box(0.05, 0.4, 0.1, [x - wide / 2 + 0.02, 0.9, z - 0.35], [-14, 0, 0]));
    put(body, SEAT_LT, box(0.05, 0.4, 0.1, [x + wide / 2 - 0.02, 0.9, z - 0.35], [-14, 0, 0]));
    put(body, ACCENT, box(wide - 0.12, 0.012, 0.012, [x, 0.86, z - 0.37], [-14, 0, 0]));
    put(body, SEAT_LT, box(0.22, 0.11, 0.07, [x, 1.2, z - 0.5], [-14, 0, 0]));
  };
  seat(0.36, -0.06, 0.5, 0.46, "L");
  seat(-0.36, -0.06, 0.5, 0.46, "R");
  seat(0, -0.64, 1.3, 0.34, "Rear");
  // Dash
  b.extrude(
    [
      [0.4, 0.58],
      [0.58, 0.58],
      [0.6, 0.9],
      [0.52, 0.95],
      [0.46, 0.93],
      [0.42, 0.82],
    ] as P2[],
    { at: [0, 0, 0], ...SIDE, thickness: 1.64, bevel: 0.025, detail: 0.6, color: SEAT, bone: body, name: "dash" },
  );
  put(body, ACCENT, box(1.6, 0.012, 0.012, [0, 0.93, 0.455]));
  b.part(new THREE.PlaneGeometry(0.24, 0.08), "#ffffff", { bone: body, at: [0.36, 0.89, 0.428], dir: [0, 0.1, -1], axis: "z", texture: cluster, name: "gauges" });
  glow(b.part(new THREE.PlaneGeometry(0.2, 0.125), "#ffffff", { bone: body, at: [0, 0.85, 0.415], dir: [0, 0.15, -1], axis: "z", texture: screen, name: "screen" }));
  // Steering wheel
  {
    const c = new THREE.Vector3(0.36, 0.93, 0.34);
    const nrm = new THREE.Vector3(0, 0.35, -0.94).normalize();
    const u = new THREE.Vector3(1, 0, 0);
    const v = new THREE.Vector3().crossVectors(nrm, u).normalize();
    const ring: V[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const q = c.clone().addScaledVector(u, 0.15 * Math.cos(a)).addScaledVector(v, 0.15 * Math.sin(a));
      ring.push([q.x, q.y, q.z]);
    }
    b.sweep(ring, 0.014, { closed: true, color: INK, bone: steer, sides: 6 } as never);
    for (const a of [0, 120, 240]) {
      const aa = (a * Math.PI) / 180;
      const q = c.clone().addScaledVector(u, 0.15 * Math.cos(aa)).addScaledVector(v, 0.15 * Math.sin(aa));
      b.rod([c.x, c.y, c.z], [q.x, q.y, q.z], 0.008, { color: STEEL, bone: steer, sides: 4 });
    }
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), ACCENT, { bone: steer, at: [c.x, c.y, c.z], dir: [nrm.x, nrm.y, nrm.z] });
    b.rod([0.36, 0.78, 0.45], [c.x, c.y, c.z], 0.016, { color: STEEL_DK, bone: steer, sides: 6 });
  }
  // rear view mirror
  put(body, INK, box(0.2, 0.05, 0.03, [0, 1.17, 0.2]));
  put(body, STEEL_DK, box(0.02, 0.07, 0.02, [0, 1.21, 0.2]));

  // ------------------------------------------------------------------------------------------------ rear end
  b.extrude(
    [
      [-0.88, -2.2],
      [-0.88, -2.38],
      [-0.72, -2.53],
      [0.72, -2.53],
      [0.88, -2.38],
      [0.88, -2.2],
    ] as P2[],
    { at: [0, 0.44, 0], ...PLAN, thickness: 0.13, bevel: 0.035, detail: 0.7, color: CHROME, bone: body, name: "bumperR" },
  );
  put(body, INK, box(1.64, 0.16, 0.03, [0, 0.78, -2.435]));
  for (const s of [1, -1]) {
    put(body, TAIL, box(0.54, 0.075, 0.025, [s * 0.52, 0.78, -2.455]), 0.9);
    put(body, ACCENT, box(0.54, 0.012, 0.02, [s * 0.52, 0.73, -2.452]));
    for (let i = 0; i < 5; i++) put(body, INK, box(0.01, 0.1, 0.03, [s * (0.27 + i * 0.11), 0.78, -2.46]));
    put(body, LAMP, box(0.08, 0.05, 0.02, [s * 0.12, 0.78, -2.452]), 1.2);
    // exhaust bells, glowing throats
    b.lathe(
      [
        [0.095, 0],
        [0.115, 0],
        [0.155, 0.16],
        [0.135, 0.16],
      ] as P2[],
      { at: [s * 0.42, 0.44, -2.5], axis: [0, 0, -1], segments: 12, color: STEEL, bone: body, name: "nozzle" },
    );
    put(body, GLOW_O, cyl(0.095, 0.095, 0.012, 12, [s * 0.42, 0.44, -2.53], "z"), 1.1);
    b.lathe(
      [
        [0.138, 0],
        [0.162, 0],
        [0.162, 0.02],
        [0.138, 0.02],
      ] as P2[],
      { at: [s * 0.42, 0.44, -2.655], axis: [0, 0, -1], segments: 12, color: ACCENT_DK, bone: body, name: "nozzleRim" },
    );
    // diffuser strakes
    for (let i = 0; i < 4; i++) put(body, INK, box(0.014, 0.075, 0.5, [s * (0.66 + i * 0.07), 0.29, -2.0]));
  }
  b.part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", { bone: body, at: [0, 0.59, -2.456], dir: [0, 0, -1], axis: "z", texture: plate });

  // Trunk lid with ducktail
  b.extrude(
    [
      [-0.8, -1.6],
      [0.8, -1.6],
      [0.8, -2.2],
      [0.7, -2.34],
      [-0.7, -2.34],
      [-0.8, -2.2],
    ] as P2[],
    { at: [0, 0.96, 0], ...PLAN, thickness: 0.06, bevel: 0.02, detail: 0.7, color: bodyPaint, bone: trunk, name: "trunkLid" },
  );
  b.extrude(
    [
      [-2.15, 0.99],
      [-2.46, 0.99],
      [-2.5, 1.12],
      [-2.38, 1.14],
      [-2.2, 1.04],
    ] as P2[],
    { at: [0, 0, 0], ...SIDE, thickness: 1.58, bevel: 0.02, detail: 0.7, color: roofPaint, bone: trunk, name: "ducktail" },
  );
  put(trunk, ACCENT, box(1.4, 0.012, 0.014, [0, 1.145, -2.405], [-5, 0, 0]));
  put(trunk, INK, box(0.014, 0.01, 0.1, [0.8, 0.99, -1.7]));
  // Tail fins with glowing rear edges
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-1.0, 0.86],
        [-1.0, 0.93],
        [-1.7, 1.0],
        [-2.2, 1.2],
        [-2.4, 1.3],
        [-2.47, 1.3],
        [-2.47, 0.95],
        [-2.4, 0.86],
      ] as P2[],
      { at: [s * 0.84, 0, 0], ...SIDE, thickness: 0.05, bevel: 0.012, detail: 0.6, color: darkPaint, bone: body, name: "tailFin" },
    );
    put(body, GLOW_O, box(0.036, 0.34, 0.016, [s * 0.84, 1.12, -2.49]), 1.0);
    put(body, ACCENT, box(0.056, 0.014, 0.1, [s * 0.84, 1.305, -2.43]));
    // fuel cap
  }
  put(body, CHROME, cyl(0.06, 0.06, 0.012, 10, [-1.014, 0.84, -2.1], "x"));
  put(body, ACCENT, cyl(0.035, 0.035, 0.016, 8, [-1.016, 0.84, -2.1], "x"));
  // Active spoiler blade on its own hinge
  b.extrude(
    [
      [0.18, 0.02],
      [0.06, 0.05],
      [-0.15, 0.035],
      [-0.2, 0.0],
      [0.1, -0.025],
    ] as P2[],
    { at: [0, 1.22, -2.36], ...SIDE, thickness: 1.7, bevel: 0.01, detail: 0.5, color: roofPaint, bone: flap, name: "spoilerBlade" },
  );
  put(flap, ACCENT, box(1.7, 0.012, 0.03, [0, 1.257, -2.43]));

  // ------------------------------------------------------------------------------------------------ under body
  b.extrude(
    [
      [-0.78, -2.2],
      [0.78, -2.2],
      [0.78, 2.2],
      [-0.78, 2.2],
    ] as P2[],
    { at: [0, 0.3, 0], ...PLAN, thickness: 0.03, color: INK, bone: body, name: "belly" },
  );
  for (const s of [1, -1]) {
    put(body, GLOW_O, box(0.025, 0.012, 3.9, [s * 0.89, 0.318, 0]), 1.0);
    put(body, GLOW_O, box(0.025, 0.012, 3.9, [s * 0.46, 0.286, 0]), 1.2);
    put(body, ACCENT, box(0.012, 0.02, 1.4, [s * 0.9, 0.5, -0.2]));
  }
  put(body, GLOW_O, box(1.7, 0.012, 0.025, [0, 0.318, 2.28]), 1.0);
  put(body, GLOW_O, box(1.7, 0.012, 0.025, [0, 0.318, -2.28]), 1.0);
  put(body, STEEL_DK, box(0.24, 0.07, 3.6, [0, 0.27, 0]));
  for (let i = 0; i < 6; i++) put(body, STEEL, box(0.3, 0.05, 0.05, [0, 0.27, -1.5 + i * 0.6]));

  // ------------------------------------------------------------------------------------------------ thrusters
  for (const [id, s, z] of POD) {
    const x = s * 0.8;
    const thr = thruster[id];
    const rot = rotor[id];
    b.lathe(
      [
        [0.27, 0.0],
        [0.325, 0.0],
        [0.345, 0.04],
        [0.345, 0.3],
        [0.32, 0.345],
        [0.27, 0.345],
        [0.255, 0.31],
        [0.255, 0.03],
      ] as P2[],
      { at: [x, 0, z], segments: 20, color: ductPaint, bone: thr, name: `duct${id}` },
    );
    glow(
      b.lathe(
        [
          [0.347, 0.15],
          [0.355, 0.15],
          [0.355, 0.19],
          [0.347, 0.19],
        ] as P2[],
        { at: [x, 0, z], segments: 20, color: GLOW_O, bone: thr, name: `ductBand${id}` },
      ),
      1.4,
    );
    b.lathe(
      [
        [0.318, 0.34],
        [0.345, 0.3],
        [0.352, 0.3],
        [0.352, 0.324],
        [0.328, 0.352],
      ] as P2[],
      { at: [x, 0, z], segments: 20, color: ACCENT, bone: thr, name: `ductRim${id}` },
    );
    glow(b.part(new THREE.CylinderGeometry(0.255, 0.255, 0.014, 20), GLOW_O, { bone: thr, at: [x, 0.05, z], name: `glowDisc${id}` }), 1.7);
    glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.016, 14), GLOW_HOT, { bone: thr, at: [x, 0.058, z], name: `glowCore${id}` }), 1.9);
    // ground-effect ring on the floor
    glow(
      b.lathe(
        [
          [0.38, 0],
          [0.46, 0],
          [0.46, 0.008],
          [0.38, 0.008],
        ] as P2[],
        { at: [x, 0.001, z], segments: 20, color: GLOW_O, bone: thr, name: `groundRing${id}` },
      ),
      0.9,
    );
    // stator vanes
    const vanes: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 4; k++) {
      const g = box(0.19, 0.12, 0.012, [0.16, 0, 0]).rotateY((k * Math.PI) / 2 + 0.4).translate(x, 0.14, z);
      vanes.push(g);
    }
    put(thr, STEEL_DK, mergeGeometries(vanes)!);
    // rotor
    const blades: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const g = new THREE.BoxGeometry(0.19, 0.01, 0.075);
      g.rotateX((22 * Math.PI) / 180);
      g.translate(0.16, 0, 0);
      g.rotateY((k * Math.PI) / 4);
      g.translate(x, 0.25, z);
      blades.push(g);
    }
    put(rot, CHROME, mergeGeometries(blades)!);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10), STEEL, { bone: rot, at: [x, 0.25, z] });
    b.part(new THREE.ConeGeometry(0.05, 0.05, 10), ACCENT, { bone: rot, at: [x, 0.29, z] });
    for (const [px, pz, ax] of [[0.37 * s, 0, "x"], [0, 0.37, "z"], [0, -0.37, "z"]] as const) {
      put(thr, STEEL, cyl(0.045, 0.045, 0.07, 8, [x + px, 0.17, z + pz], ax));
      put(thr, ACCENT, cyl(0.028, 0.028, 0.08, 8, [x + px, 0.17, z + pz], ax));
    }
    // flange bolts and mount bracket
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2;
      put(thr, CHROME, ball(0.014, [x + 0.3 * Math.cos(a), 0.348, z + 0.3 * Math.sin(a)]));
    }
    put(thr, STEEL, box(0.14, 0.09, 0.3, [s * 0.5, 0.31, z]));
    put(thr, ACCENT, box(0.145, 0.015, 0.3, [s * 0.5, 0.36, z]));
    // outboard stabiliser fin
    b.extrude(
      [
        [0, 0],
        [0.3, 0],
        [0.42, 0.1],
        [0.0, 0.1],
      ] as P2[],
      { at: [s * 1.13, 0.2, z - 0.06], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, detail: 0.5, color: ACCENT, bone: thr, name: `fin${id}` },
    );
  }

  // ------------------------------------------------------------------------------------------------ flush merged parts
  for (const bag of bags.values()) {
    const part = b.part(mergeGeometries(bag.geos)!, bag.color, { bone: bag.bone, at: [0, 0, 0] });
    if (bag.glow > 0) glow(part, bag.glow);
  }

  return b.root;
}
