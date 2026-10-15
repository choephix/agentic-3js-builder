import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { glow } from "../../../../kits/glow";
import { countershade, gradient, grain, mottle, noise, paint, patches, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline, spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Tinkerer Gnome",
  description:
    "A knee-high gnome inventor with a rosy nose, handlebar moustache and a droopy red hat with goggles, hauling a patchwork backpack bristling with gadgets: gears, a pressure gauge, a spyglass, a crank, a propeller, a bellows, a kettle and a glowing lantern.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const add = (p: readonly number[], d: readonly number[], k = 1): V => [
  p[0] + d[0] * k,
  p[1] + d[1] * k,
  p[2] + d[2] * k,
];
const norm = (d: readonly number[]): V => {
  const l = Math.hypot(d[0], d[1], d[2]) || 1;
  return [d[0] / l, d[1] / l, d[2] / l];
};
const ball = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
const torus = (r: number, t: number) => new THREE.TorusGeometry(r, t, 4, 8);

/** A flat cog: trapezoid teeth, a hexagonal axle hole, extruded `thick` along local z. */
function gearGeo(rOut: number, rIn: number, teeth: number, thick: number, hole: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: THREE.Vector2[] = [];
  for (let t = 0; t < teeth; t++) {
    for (const [f, r] of [
      [0, rIn],
      [0.16, rOut],
      [0.5, rOut],
      [0.68, rIn],
    ] as const) {
      const a = (t + f) * step;
      pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
  }
  const shape = new THREE.Shape(pts);
  const hp: THREE.Vector2[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    hp.push(new THREE.Vector2(Math.cos(a) * hole, Math.sin(a) * hole));
  }
  shape.holes.push(new THREE.Path(hp));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  return geo;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN = "#f3b894";
const SKIN_D = "#dc9070";
const NOSE = "#f08f7a";
const NOSE_L = "#ffc3ad";
const BLUSH = "#f0806f";
const BEARD = "#f6f1e6";
const BEARD_D = "#d9d0be";
const WHITE = "#fbf7ee";
const HAT = "#d8423c";
const HAT_L = "#ee6a4f";
const HAT_D = "#a32f37";
const TUNIC = "#3fa0a4";
const TUNIC_L = "#62c3bd";
const TUNIC_D = "#27747f";
const TUNIC_STAIN = "#2f858b";
const TROUSER = "#e0a93d";
const TROUSER_D = "#b8842a";
const LEATHER = "#9b6035";
const LEATHER_D = "#6f4125";
const LEATHER_L = "#c18552";
const DARKB = "#4a2d1f";
const GLOVE = "#cf9552";
const MUD = "#6c5038";
const BRASS = "#eab84c";
const BRASS_D = "#b98630";
const COPPER = "#d9794a";
const COPPER_D = "#a8532f";
const STEEL = "#c4ced6";
const STEEL_D = "#7d8a96";
const OLIVE = "#8da34f";
const SAND = "#dcbc6c";
const RUST = "#c5683c";
const TEAL_M = "#4f9aa0";
const STITCH = "#4a3426";
const GLASS = "#7ff2e0";
const GLASS_Y = "#ffd36b";
const PINK = "#f4a6b8";
const BLUE = "#4a7fd0";
const CREAM = "#fff1d0";
const DARK = "#2a2030";
const GREEN = "#6cc070";
const YELLOW = "#f7d34a";
const WOOD = "#b07a46";
const WOOD_D = "#7e5330";
const PUFF = "#f2f5f7";

// ---------------------------------------------------------------------------------------------------------------
// Textures

const dialTicks = [210, 180, 150, 120, 90, 60, 30, 0, -30]
  .map((a) => {
    const r = (a * Math.PI) / 180;
    return `<line x1="${(32 + 17 * Math.cos(r)).toFixed(2)}" y1="${(32 - 17 * Math.sin(r)).toFixed(2)}" x2="${(32 + 13 * Math.cos(r)).toFixed(2)}" y2="${(32 - 13 * Math.sin(r)).toFixed(2)}"/>`;
  })
  .join("");

const GAUGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="31" fill="#fff3d6"/>
<circle cx="32" cy="32" r="29" fill="none" stroke="#3a2b2f" stroke-width="3"/>
<path d="M12.95 43 A22 22 0 0 1 17.86 15.15" fill="none" stroke="#5fbf6a" stroke-width="5"/>
<path d="M17.86 15.15 A22 22 0 0 1 46.14 15.15" fill="none" stroke="#f2cf4a" stroke-width="5"/>
<path d="M46.14 15.15 A22 22 0 0 1 51.05 43" fill="none" stroke="#e0463c" stroke-width="5"/>
<g stroke="#3a2b2f" stroke-width="1.8">${dialTicks}</g>
<line x1="32" y1="32" x2="27.9" y2="16.5" stroke="#d63a35" stroke-width="2.6" stroke-linecap="round"/>
<circle cx="32" cy="32" r="4" fill="#3a2b2f"/>
<circle cx="32" cy="32" r="1.5" fill="#eab84c"/>
</svg>`,
  { size: 128 },
);

const patchTeeth = Array.from({ length: 8 }, (_, i) => `<rect x="-1.9" y="-10.6" width="3.8" height="4.4" fill="#ffd25a" transform="rotate(${i * 45})"/>`).join("");
const HATPATCH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect x="1.5" y="1.5" width="29" height="29" rx="4" fill="#4aa3df"/>
<rect x="3.5" y="3.5" width="25" height="25" rx="3" fill="none" stroke="#fff1d0" stroke-width="1.4" stroke-dasharray="3 2"/>
<g transform="translate(16 16)">${patchTeeth}<circle r="7.6" fill="#ffd25a"/><circle r="3.4" fill="#4aa3df"/></g>
</svg>`,
  { size: 128 },
);

const BLUEPRINT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
<rect x="0" y="0" width="64" height="48" fill="#2e5ea8"/>
<g stroke="#5f90d8" stroke-width="0.8"><line x1="0" y1="12" x2="64" y2="12"/><line x1="0" y1="24" x2="64" y2="24"/><line x1="0" y1="36" x2="64" y2="36"/><line x1="16" y1="0" x2="16" y2="48"/><line x1="32" y1="0" x2="32" y2="48"/><line x1="48" y1="0" x2="48" y2="48"/></g>
<g fill="none" stroke="#f2f6ff" stroke-width="1.1"><circle cx="21" cy="24" r="11"/><circle cx="21" cy="24" r="4.5"/><circle cx="46" cy="16" r="6"/><path d="M33 26 L44 36 L58 36"/><path d="M28 10 L40 6 L52 10"/><path d="M8 42 L30 42"/></g>
<path d="M56 48 L64 40 L64 48 Z" fill="#9cc0f0"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const WRENCH: OutlinePoint[] = [
  [0, -0.012],
  [0.15, -0.012],
  [0.17, -0.032],
  [0.225, -0.032],
  [0.238, -0.018],
  [0.238, -0.008],
  [0.205, -0.008],
  [0.205, 0.008],
  [0.238, 0.008],
  [0.238, 0.018],
  [0.225, 0.032],
  [0.17, 0.032],
  [0.15, 0.012],
  [0, 0.012],
];

const BLADE: OutlinePoint[] = [
  [0.015, -0.016],
  [0.07, -0.026],
  [0.125, -0.015],
  [0.132, 0],
  [0.125, 0.015],
  [0.07, 0.026],
  [0.015, 0.016],
];

const KETTLE: OutlinePoint[] = [
  [0, -0.06],
  [0.058, -0.06],
  [0.082, -0.02],
  [0.085, 0.01],
  [0.07, 0.04],
  [0.04, 0.056],
  [0.024, 0.06],
  [0.024, 0.07],
  [0, 0.075],
];

/** An accordion profile along the lathe axis: wooden boards, six leather folds. */
function bellowsProfile(): OutlinePoint[] {
  const pts: OutlinePoint[] = [
    [0, 0],
    [0.07, 0],
    [0.07, 0.014],
    [0.052, 0.014],
  ];
  let y = 0.014;
  for (let i = 0; i < 6; i++) {
    pts.push([0.09, y + 0.017], [0.052, y + 0.034]);
    y += 0.034;
  }
  pts.push([0.07, y], [0.07, y + 0.014], [0, y + 0.014]);
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  const P = (geo: THREE.BufferGeometry, color: Col, bone: Joint, at: readonly number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });
  const R = (
    a: readonly number[],
    c: readonly number[],
    r: number | [number, number],
    color: Col,
    bone: Joint,
    o: SweepOptions = {},
  ) => b.rod(a, c, r, color, { bone, sides: 6, smooth: false, ...o });
  const lathe = (
    outline: OutlinePoint[],
    at: readonly number[],
    bone: Joint,
    color: Col,
    o: { axis?: readonly number[]; segments?: number } = {},
  ) => b.lathe(outline, { at, bone, color, segments: o.segments ?? 8, ...(o.axis ? { axis: o.axis } : {}) });

  // -------------------------------------------------------------------------------------------------------------
  // Paints

  const skinP = countershade(SKIN, SKIN_D, { level: -0.35 });
  const tunicBase = countershade(
    stripes(TUNIC, TUNIC_L, { size: 0.045, axis: "y", width: 0.22, wobble: 0.12, seed: 4 }),
    TUNIC_D,
    { level: -0.2 },
  );
  const tunicP = paint((p) => (noise(p, 0.09, 7) > 0.66 && p.y < 0.62 ? TUNIC_STAIN : tunicBase));
  const trouserP = countershade(
    stripes(TROUSER, TROUSER_D, { size: 0.04, axis: "x", width: 0.2, wobble: 0.1, seed: 5 }),
    TROUSER_D,
    { level: -0.3 },
  );
  const hatP = countershade(
    stripes(HAT, HAT_L, { size: 0.075, axis: "y", width: 0.3, wobble: 0.2, seed: 2 }),
    HAT_D,
    { level: -0.1 },
  );
  const bootP = gradient(LEATHER, MUD, [0, 0.13, 0], [0, 0.0, 0]);
  const apronP = mottle(LEATHER, LEATHER_D, { size: 0.06, contrast: 0.8, seed: 3 });
  const beardP = grain(BEARD, BEARD_D, { size: 0.02, axis: "y", seed: 2 });
  const packP = patches(STITCH, [OLIVE, SAND, RUST, TEAL_M], { size: 0.07, gap: 0.07, seed: 11 });
  const lidP = mottle(RUST, "#a84c2c", { size: 0.05, seed: 8 });
  const bedP = stripes(BLUE, CREAM, { size: 0.04, axis: "x", width: 0.4, wobble: 0.05, seed: 6 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: spine, neck, head, jaw

  const hips = b.joint("hips", { at: [0, 0.44, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, 0],
      [0, 0.63, 0.01],
      [0, 0.76, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[1];
  const top = spine.joints[2];
  const neck = b.joint("neck", { parent: top, at: [0, 0.78, 0.005], aim: [0, 0.85, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.85, 0.02], aim: [0, 0.96, 0.04], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.875, 0.05], aim: [0, 0.835, 0.17], role: "jaw" });

  // Floppy hat: a sweep along a chain so the tip can droop and flop.
  const hatPts: V[] = [
    [0, 0.975, 0.025],
    [0, 1.07, 0.015],
    [0, 1.17, -0.01],
    [0, 1.25, -0.06],
    [0, 1.29, -0.14],
    [0, 1.26, -0.22],
  ];
  const hat = b.chain("hat", catmull(hatPts), { parent: head, names: ["hat1", "hat2", "hat3", "hat4", "hat5"] });

  // Beard: a hanging chain from the jaw.
  const beardPts: V[] = [
    [0, 0.84, 0.12],
    [0, 0.77, 0.175],
    [0, 0.7, 0.2],
    [0, 0.64, 0.2],
    [0, 0.58, 0.18],
  ];
  const beardChain = b.chain("beard", catmull(beardPts), {
    parent: jaw,
    names: ["beard1", "beard2", "beard3", "beard4"],
  });

  const torsoBones = [hips, spine];

  // -------------------------------------------------------------------------------------------------------------
  // Torso: round belly tunic, hem, belt, apron

  const torso = b.loft(
    [
      { at: [0, 0.39, 0], w: 0.27, h: 0.24 },
      { at: [0, 0.49, 0.01], w: 0.31, h: 0.28 },
      { at: [0, 0.61, 0.01], w: 0.28, h: 0.25 },
      { at: [0, 0.72, 0], w: 0.25, h: 0.19 },
      { at: [0, 0.8, 0.01], w: 0.11, h: 0.11 },
    ],
    { bone: torsoBones, color: tunicP, sides: 8, smooth: false },
  );
  const skin = b.surface(torso);

  R([0, 0.77, 0.005], [0, 0.85, 0.02], 0.05, skinP, neck);

  // hem trim, belt, studs
  b.sweep(skin.loop([0, 0.41, 0], { lift: 0.008 }), 0.014, { color: CREAM, sides: 6, smooth: false });
  b.sweep(skin.loop([0, 0.47, 0.01], { lift: 0.028 }), 0.02, { color: DARKB, sides: 6, smooth: false });
  b.along(skin.loop([0, 0.47, 0.01], { lift: 0.047 }), 16, (at) =>
    b.part(ball(0.01, 5, 3), BRASS, { at, flat: true }),
  );
  const buckleHit = skin.ray([0, 0.47, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(box(0.07, 0.016, 0.055), BRASS, buckleHit.moved([0, 0.05, 0]), { embed: 0.2, flat: true });
    b.stick(box(0.045, 0.018, 0.03), DARKB, buckleHit.moved([0, 0.056, 0]), { embed: 0.2, flat: true });
  }

  // leather apron with stitched edges, pocket and tools
  b.sweep(
    catmull([
      [0, 0.725, 0.108],
      [0, 0.61, 0.148],
      [0, 0.49, 0.163],
      [0, 0.395, 0.135],
    ]),
    (t) => [0.065 + 0.03 * t, 0.009],
    { bone: torsoBones, color: apronP, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.062, 0.725, 0.119],
        [s * 0.076, 0.61, 0.159],
        [s * 0.088, 0.49, 0.174],
        [s * 0.094, 0.395, 0.146],
      ]),
      0.004,
      { bone: torsoBones, color: CREAM, sides: 4, smooth: false },
    );
  }
  P(box(0.085, 0.055, 0.014), LEATHER_L, chest, [0, 0.535, 0.173]);
  P(box(0.088, 0.016, 0.018), LEATHER_D, chest, [0, 0.558, 0.175]);
  for (const s of [1, -1]) P(ball(0.007, 5, 3), BRASS, chest, [s * 0.038, 0.532, 0.182]);
  // screwdriver, pencil, ruler, pliers poking from the pocket
  R([0.052, 0.54, 0.172], [0.052, 0.6, 0.172], 0.005, STEEL, chest, { sides: 5 });
  R([0.052, 0.6, 0.172], [0.052, 0.65, 0.172], 0.012, RUST, chest, { sides: 6 });
  R([0.022, 0.54, 0.176], [0.026, 0.615, 0.176], 0.008, YELLOW, chest, { sides: 6 });
  P(cone(0.008, 0.02, 6), DARK, chest, [0.0268, 0.627, 0.176]);
  P(cyl(0.008, 0.008, 0.014, 6), PINK, chest, [0.0225, 0.534, 0.176]);
  P(box(0.018, 0.13, 0.005), CREAM, chest, [-0.024, 0.595, 0.172]);
  for (let k = 0; k < 5; k++) P(box(0.01, 0.003, 0.006), DARK, chest, [-0.029, 0.55 + k * 0.022, 0.1755]);
  R([-0.055, 0.54, 0.172], [-0.047, 0.625, 0.172], 0.006, STEEL_D, chest, { sides: 5 });
  R([-0.045, 0.54, 0.172], [-0.057, 0.625, 0.172], 0.006, STEEL_D, chest, { sides: 5 });
  R([-0.047, 0.598, 0.172], [-0.047, 0.64, 0.172], 0.009, HAT, chest, { sides: 5 });
  R([-0.057, 0.598, 0.172], [-0.06, 0.64, 0.172], 0.009, HAT, chest, { sides: 5 });

  // backpack straps over the shoulders
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.095, 0.73, -0.14],
        [s * 0.1, 0.766, -0.05],
        [s * 0.105, 0.77, 0.02],
        [s * 0.118, 0.725, 0.075],
        [s * 0.122, 0.65, 0.097],
        [s * 0.122, 0.565, 0.12],
      ]),
      [0.026, 0.007],
      { bone: torsoBones, color: LEATHER_D, section: "box", caps: "flat" },
    );
    P(box(0.05, 0.032, 0.012), BRASS, chest, [s * 0.124, 0.6, 0.108], { dir: norm([s * 0.2, 0, 1]), axis: "z" });
  }

  // brass cog brooch
  P(gearGeo(0.03, 0.024, 8, 0.01, 0.007), BRASS, chest, [0.095, 0.667, 0.098], {
    dir: norm([0.5, 0, 0.85]),
    axis: "z",
  });

  // tool belt
  const belt = (deg: number, e: number, y = 0.47): V => {
    const a = (deg * Math.PI) / 180;
    return [Math.sin(a) * (0.155 + e), y, 0.01 + Math.cos(a) * (0.15 + e)];
  };
  const beltN = (deg: number): V => {
    const a = (deg * Math.PI) / 180;
    return [Math.sin(a), 0, Math.cos(a)];
  };
  for (const deg of [50, -45]) {
    const n = beltN(deg);
    P(box(0.075, 0.06, 0.05), LEATHER, hips, belt(deg, 0.03), { dir: n, axis: "z" });
    P(box(0.08, 0.03, 0.056), LEATHER_D, hips, belt(deg, 0.032, 0.5), { dir: n, axis: "z" });
    P(ball(0.008, 5, 3), BRASS, hips, belt(deg, 0.06, 0.494));
  }
  // vial rack with glowing potions
  P(box(0.1, 0.022, 0.034), DARKB, hips, belt(100, 0.02, 0.45), { dir: beltN(100), axis: "z" });
  [88, 100, 112].forEach((deg, i) => {
    const c = belt(deg, 0.025, 0.475);
    glow(P(cyl(0.011, 0.011, 0.06, 6), [GREEN, PINK, GLASS][i], hips, c), 1.2);
    P(cyl(0.008, 0.01, 0.014, 6), WOOD, hips, add(c, [0, 1, 0], 0.037));
  });
  // wrench hanging from the left hip
  b.extrude(WRENCH, {
    at: [0.165, 0.47, -0.07],
    x: [0, -1, 0],
    y: [0, 0, 1],
    thickness: 0.012,
    bevel: 0.002,
    color: STEEL,
    bone: hips,
  });
  P(ball(0.012, 5, 3), STEEL_D, hips, [0.168, 0.465, -0.07]);
  // hammer on the right hip
  R([-0.17, 0.3, -0.03], [-0.17, 0.49, -0.03], 0.011, WOOD, hips, { sides: 6 });
  P(box(0.036, 0.036, 0.1), STEEL, hips, [-0.17, 0.5, -0.03]);
  P(cone(0.016, 0.045, 5), STEEL_D, hips, [-0.17, 0.5, -0.1], { dir: [0, 0, -1] });
  P(box(0.04, 0.02, 0.012), DARK, hips, [-0.17, 0.5, 0.025]);
  P(box(0.04, 0.02, 0.02), LEATHER_D, hips, [-0.158, 0.47, -0.03]);
  // tape measure
  P(cyl(0.035, 0.035, 0.026, 10), YELLOW, hips, belt(-80, 0.03), { dir: beltN(-80) });
  P(cyl(0.015, 0.015, 0.03, 6), DARK, hips, belt(-80, 0.03), { dir: beltN(-80) });
  P(box(0.02, 0.012, 0.008), STEEL_D, hips, belt(-80, 0.052, 0.45), { dir: beltN(-80), axis: "z" });

  // -------------------------------------------------------------------------------------------------------------
  // Arms and hands

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const S: V = [s * 0.145, 0.715, 0];
    const E: V = [s * 0.255, 0.595, 0.015];
    const W: V = [s * 0.325, 0.47, 0.045];
    const arm = b.chain(`arm${L}`, polyline([S, E, W]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.044, 0.04], { color: tunicP, sides: 6, smooth: false });
    const [shoulder, elbow, hand] = arm.joints;
    P(ball(0.06, 7, 5), tunicP, shoulder, S);
    P(box(0.045, 0.05, 0.012), LEATHER_L, elbow, [E[0], E[1], E[2] - 0.043]);
    const d = norm([W[0] - E[0], W[1] - E[1], W[2] - E[2]]);
    P(cyl(0.057, 0.053, 0.04, 7), CREAM, hand, add(W, d, -0.008), { dir: d });
    P(cyl(0.06, 0.06, 0.012, 7), BRASS_D, hand, add(W, d, -0.03), { dir: d });
    const palm: V = [W[0] + s * 0.012, W[1] - 0.035, W[2] + 0.012];
    P(ball(0.046, 7, 5), GLOVE, hand, palm, { scale: [1, 1.05, 0.85] });
    P(box(0.07, 0.014, 0.01), LEATHER_L, hand, [palm[0], palm[1] + 0.02, palm[2] + 0.034]);
    // three fingers and a thumb, each its own digit chain
    [
      ["index", -0.026, 0.05],
      ["middle", 0, 0.058],
      ["ring", 0.026, 0.05],
    ].forEach(([name, ox, len]) => {
      const K: V = [W[0] + s * 0.012 + (ox as number), W[1] - 0.052, W[2] + 0.02];
      const F = b.chain(`${name}${L}`, polyline([K, add(K, [0, -(len as number), 0.018])]), {
        parent: hand,
        names: [`${name}${L}1`, `${name}${L}2`],
        role: "digit",
      });
      b.sweep(F, [0.016, 0.012], { color: GLOVE, sides: 5, smooth: false });
    });
    const T0: V = [W[0] - s * 0.024, W[1] - 0.03, W[2] + 0.03];
    const thumb = b.chain(`thumb${L}`, polyline([T0, add(T0, [-s * 0.012, -0.04, 0.04])]), {
      parent: hand,
      names: [`thumb${L}1`, `thumb${L}2`],
      role: "digit",
    });
    b.sweep(thumb, [0.019, 0.014], { color: GLOVE, sides: 5, smooth: false });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs and boots

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const Hp: V = [s * 0.085, 0.43, 0];
    const K: V = [s * 0.09, 0.27, 0.015];
    const A: V = [s * 0.09, 0.09, 0];
    const leg = b.chain(`leg${L}`, polyline([Hp, K, A]), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.05],
    });
    b.sweep(leg, [0.062, 0.052, 0.05], { color: trouserP, sides: 6, smooth: false });
    const [, knee, ankle] = leg.joints;
    const toe = b.joint(`toe${L}`, { parent: ankle, at: [s * 0.09, 0.05, 0.07], aim: [s * 0.09, 0.04, 0.16] });
    P(box(0.06, 0.07, 0.012), LEATHER_L, knee, [s * 0.09, 0.27, 0.058]);
    P(ball(0.005, 4, 3), BRASS, knee, [s * 0.075, 0.285, 0.065]);
    P(ball(0.005, 4, 3), BRASS, knee, [s * 0.105, 0.255, 0.065]);
    // boot: shaft and heel on the ankle, forefoot on the toe
    P(cyl(0.066, 0.07, 0.13, 7), bootP, ankle, [s * 0.09, 0.115, 0]);
    P(cyl(0.074, 0.07, 0.036, 7), LEATHER_L, ankle, [s * 0.09, 0.185, 0]);
    P(cyl(0.072, 0.072, 0.02, 7), DARKB, ankle, [s * 0.09, 0.135, 0]);
    P(box(0.032, 0.032, 0.012), BRASS, ankle, [s * 0.09, 0.135, 0.071]);
    P(box(0.016, 0.016, 0.014), DARKB, ankle, [s * 0.09, 0.135, 0.073]);
    P(ball(1, 7, 5), bootP, ankle, [s * 0.09, 0.062, -0.005], { scale: [0.068, 0.055, 0.075] });
    P(ball(1, 7, 5), bootP, toe, [s * 0.09, 0.06, 0.09], { scale: [0.068, 0.054, 0.078] });
    P(ball(1, 6, 4), LEATHER_L, toe, [s * 0.09, 0.07, 0.15], { scale: [0.05, 0.04, 0.045] });
    P(box(0.136, 0.022, 0.15), DARKB, ankle, [s * 0.09, 0.011, -0.002]);
    P(box(0.13, 0.022, 0.15), DARKB, toe, [s * 0.09, 0.011, 0.105]);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  P(ball(1, 9, 7), skinP, head, [0, 0.915, 0.04], { scale: [0.14, 0.135, 0.135] });
  // big rosy nose
  P(ball(1, 7, 5), NOSE, head, [0, 0.9, 0.19], { scale: [0.05, 0.047, 0.053] });
  P(ball(0.011, 5, 3), NOSE_L, head, [0.016, 0.918, 0.236]);
  // eyes
  for (const s of [1, -1]) {
    P(ball(1, 7, 5), WHITE, head, [s * 0.052, 0.925, 0.162], { scale: [0.03, 0.034, 0.026] });
    P(ball(1, 6, 4), DARK, head, [s * 0.052, 0.923, 0.181], { scale: [0.019, 0.022, 0.015] });
    P(ball(0.007, 4, 3), WHITE, head, [s * 0.052 + 0.007, 0.932, 0.192]);
    // bushy brows
    b.rod([s * 0.014, 0.958, 0.168], [s * 0.088, 0.964, 0.14], [0.017, 0.009], BEARD, {
      bone: head,
      sides: 5,
      smooth: false,
    });
    // blush
    P(ball(0.028, 6, 4), BLUSH, head, [s * 0.1, 0.885, 0.128], {
      dir: norm([s * 0.6, 0, 0.8]),
      axis: "z",
      scale: [1, 1, 0.35],
    });
    // pointy ears with pink insides
    const base: V = [s * 0.13, 0.92, 0.02];
    const ed = norm([s * 0.9, 0.35, -0.2]);
    P(cone(0.04, 0.13, 5), SKIN, head, add(base, ed, 0.06), { dir: ed, up: [0, 0, 1], scale: [1, 1, 0.4] });
    P(cone(0.026, 0.09, 5), PINK, head, add(base, [s * 0.9, 0.35, 0.05 - 0.2 * 0], 0.05), {
      dir: ed,
      up: [0, 0, 1],
      scale: [1, 1, 0.4],
    });
    // moustache with upturned curls
    b.sweep(
      catmull([
        [0, 0.866, 0.205],
        [s * 0.05, 0.859, 0.2],
        [s * 0.095, 0.85, 0.165],
        [s * 0.128, 0.856, 0.125],
        [s * 0.14, 0.876, 0.1],
        [s * 0.132, 0.892, 0.092],
      ]),
      [0.034, 0.032, 0.026, 0.02, 0.014, 0.006],
      { bone: head, color: BEARD, sides: 6, smooth: false },
    );
    // side whiskers sweeping down into the beard
    b.sweep(
      catmull([
        [s * 0.128, 0.93, 0.02],
        [s * 0.125, 0.885, 0.08],
        [s * 0.095, 0.85, 0.13],
        [s * 0.045, 0.835, 0.15],
      ]),
      [0.02, 0.034, 0.04, 0.034],
      { bone: head, color: beardP, sides: 6, smooth: false },
    );
  }
  // mouth: dark opening, teeth, and a lip on the jaw
  P(ball(1, 6, 4), DARK, head, [0, 0.852, 0.168], { scale: [0.034, 0.014, 0.02] });
  P(box(0.02, 0.008, 0.006), CREAM, head, [0, 0.859, 0.181]);
  P(ball(1, 7, 5), skinP, jaw, [0, 0.83, 0.09], { scale: [0.075, 0.05, 0.075] });
  P(ball(1, 6, 4), PINK, jaw, [0, 0.842, 0.168], { scale: [0.03, 0.011, 0.02] });

  // beard: a faceted lock with brass band and spiky strands
  const beard = b.loft(
    [
      { at: beardPts[0], w: 0.2, h: 0.1 },
      { at: beardPts[1], w: 0.22, h: 0.11 },
      { at: beardPts[2], w: 0.19, h: 0.1 },
      { at: beardPts[3], w: 0.11, h: 0.08 },
      { at: beardPts[4], w: 0.03, h: 0.03 },
    ],
    { bone: beardChain, color: beardP, sides: 6, smooth: false },
  );
  const beardSkin = b.surface(beard);
  [
    [0, 0.8],
    [0.06, 0.78],
    [-0.06, 0.78],
    [0, 0.72],
    [0.07, 0.71],
    [-0.07, 0.71],
    [0, 0.66],
    [0.035, 0.65],
    [-0.035, 0.65],
  ].forEach(([x, y], i) => {
    const h = beardSkin.ray([x, y, 0.7], [0, 0, -1]);
    if (h)
      b.spike(h.moved([0, -0.012, 0]), [x * 0.4, -1, 0.3], 0.085, 0.022, {
        color: i % 2 ? BEARD_D : BEARD,
        sides: 5,
        smooth: false,
      });
  });
  P(cyl(0.062, 0.058, 0.022, 7), BRASS, beardChain.joints[3], [0, 0.628, 0.2], { scale: [1, 1, 0.75] });
  P(ball(0.012, 5, 3), BRASS_D, beardChain.joints[3], [0, 0.628, 0.245]);

  // -------------------------------------------------------------------------------------------------------------
  // Hat: sweep, brim, band, goggles, patch, pencil and bell

  b.sweep(hat, [0.16, 0.145, 0.12, 0.095, 0.065, 0.04, 0.012], {
    color: hatP,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  lathe(
    [
      [0.12, -0.005],
      [0.19, -0.012],
      [0.205, 0.006],
      [0.19, 0.018],
      [0.12, 0.012],
    ],
    [0, 0.975, 0.025],
    head,
    HAT_D,
    { segments: 10 },
  );
  lathe(
    [
      [0.148, -0.002],
      [0.168, -0.002],
      [0.168, 0.034],
      [0.148, 0.034],
    ],
    [0, 0.978, 0.025],
    head,
    LEATHER_D,
    { segments: 10 },
  );
  P(ball(0.032, 6, 4), BRASS, hat.joints[4], [0, 1.255, -0.235]);
  P(ball(0.008, 4, 3), BRASS_D, hat.joints[4], [0, 1.225, -0.235]);
  // goggles on the hat front
  for (const s of [1, -1]) {
    const n = norm([s * 0.4, 0.3, 0.88]);
    const surf: V = [s * 0.055, 1.04, 0.146];
    P(cyl(0.042, 0.044, 0.03, 8), BRASS, head, add(surf, n, 0.008), { dir: n });
    P(cyl(0.046, 0.046, 0.008, 8), BRASS_D, head, add(surf, n, 0.026), { dir: n });
    glow(P(cyl(0.031, 0.031, 0.012, 8), GLASS, head, add(surf, n, 0.027), { dir: n }), 1.3);
    P(ball(0.006, 4, 3), WHITE, head, add(surf, norm([s * 0.2, 0.9, 0.4]), 0.04));
  }
  R([-0.018, 1.04, 0.168], [0.018, 1.04, 0.168], 0.01, LEATHER_D, head, { sides: 5 });
  // stitched cog patch
  P(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", head, [0.136, 1.08, 0.015], {
    dir: norm([0.94, 0.33, 0.03]),
    axis: "z",
    texture: HATPATCH,
    flat: false,
  });
  // pencil stuck in the hat band
  const pd = norm([-0.5, 0.55, 0.45]);
  const pb: V = [-0.11, 0.985, 0.085];
  R(pb, add(pb, pd, 0.13), 0.008, YELLOW, head, { sides: 6, caps: "flat" });
  P(cone(0.008, 0.024, 6), DARK, head, add(pb, pd, 0.142), { dir: pd });
  P(cyl(0.008, 0.008, 0.016, 6), PINK, head, add(pb, pd, -0.006), { dir: pd });

  // -------------------------------------------------------------------------------------------------------------
  // Backpack

  const pack = b.joint("pack", { parent: chest, at: [0, 0.6, -0.2], dir: [0, 1, 0] });
  const lid = b.joint("packLid", { parent: pack, at: [0, 0.8, -0.385], aim: [0, 0.8, -0.255], role: "hinge" });
  const BK = -0.383;

  b.frustumBox([0, 0.37, -0.255], [0, 0.8, -0.255], [0.34, 0.27], [0.3, 0.25], { color: packP, bone: pack });
  P(box(0.32, 0.03, 0.26), DARKB, pack, [0, 0.355, -0.255]);
  for (const s of [1, -1]) {
    for (const k of [1, -1]) {
      R([s * 0.17, 0.37, -0.255 + k * 0.135], [s * 0.15, 0.8, -0.255 + k * 0.125], 0.009, LEATHER_D, pack, {
        sides: 5,
      });
    }
    R([s * 0.17, 0.37, -0.39], [s * 0.17, 0.37, -0.12], 0.009, LEATHER_D, pack, { sides: 5 });
    R([s * 0.15, 0.8, -0.38], [s * 0.15, 0.8, -0.13], 0.009, LEATHER_D, pack, { sides: 5 });
  }
  R([-0.17, 0.37, -0.39], [0.17, 0.37, -0.39], 0.009, LEATHER_D, pack, { sides: 5 });
  R([-0.15, 0.8, -0.38], [0.15, 0.8, -0.38], 0.009, LEATHER_D, pack, { sides: 5 });
  R([-0.17, 0.37, -0.12], [0.17, 0.37, -0.12], 0.009, LEATHER_D, pack, { sides: 5 });

  // lid with straps and corner plates
  P(box(0.35, 0.05, 0.29), lidP, lid, [0, 0.825, -0.255]);
  for (const s of [1, -1]) {
    P(box(0.04, 0.01, 0.292), LEATHER_D, lid, [s * 0.09, 0.853, -0.255]);
    P(box(0.045, 0.034, 0.012), BRASS, lid, [s * 0.09, 0.82, -0.402]);
    P(box(0.018, 0.018, 0.014), DARKB, lid, [s * 0.09, 0.82, -0.409]);
    for (const k of [1, -1]) P(box(0.04, 0.008, 0.04), BRASS_D, lid, [s * 0.155, 0.853, -0.255 + k * 0.125]);
  }
  // rolled bedroll
  P(cyl(0.062, 0.062, 0.36, 8), bedP, lid, [0, 0.9, -0.27], { dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    P(cyl(0.056, 0.056, 0.012, 8), CREAM, lid, [s * 0.18, 0.9, -0.27], { dir: [1, 0, 0] });
    P(cyl(0.03, 0.03, 0.014, 6), BLUE, lid, [s * 0.18, 0.9, -0.27], { dir: [1, 0, 0] });
    P(cyl(0.067, 0.067, 0.022, 8), LEATHER_D, lid, [s * 0.1, 0.9, -0.27], { dir: [1, 0, 0] });
    P(box(0.03, 0.012, 0.03), BRASS, lid, [s * 0.1, 0.969, -0.27]);
  }
  // antenna with a glowing bulb
  const antenna = b.chain(
    "antenna",
    polyline([
      [0.11, 0.85, -0.355],
      [0.11, 0.97, -0.355],
      [0.12, 1.09, -0.36],
    ]),
    { parent: lid, names: ["antenna1", "antenna2", "antenna3"] },
  );
  b.sweep(antenna, [0.016, 0.011, 0.007], { color: BRASS, sides: 6, smooth: false });
  P(cyl(0.022, 0.022, 0.014, 6), BRASS_D, antenna.joints[1], [0.11, 0.97, -0.355]);
  P(cyl(0.03, 0.02, 0.02, 6), BRASS_D, antenna.joints[2], [0.12, 1.1, -0.36]);
  glow(P(ball(0.03, 6, 5), GLASS_Y, antenna.joints[2], [0.12, 1.13, -0.36]), 1.4);
  // propeller on a mast
  const prop = b.joint("prop", { parent: lid, at: [-0.11, 0.975, -0.355], dir: [0, 1, 0], role: "hinge" });
  R([-0.11, 0.85, -0.355], [-0.11, 0.965, -0.355], 0.01, BRASS, lid, { sides: 6 });
  P(cyl(0.02, 0.02, 0.03, 6), BRASS, prop, [-0.11, 0.975, -0.355]);
  P(ball(0.013, 5, 3), BRASS_D, prop, [-0.11, 0.995, -0.355]);
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3;
    b.extrude(BLADE, {
      at: [-0.11, 0.975, -0.355],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.008,
      bevel: 0.002,
      color: [HAT_L, CREAM, HAT_L][k],
      bone: prop,
    });
  }

  // back face: meshing gears
  const gearA = b.joint("gearA", { parent: pack, at: [-0.045, 0.62, -0.391], dir: [0, 0, -1], role: "hinge" });
  const gearB = b.joint("gearB", { parent: pack, at: [0.035, 0.69, -0.391], dir: [0, 0, -1], role: "hinge" });
  const gearC = b.joint("gearC", { parent: pack, at: [0.07, 0.755, -0.391], dir: [0, 0, -1], role: "hinge" });
  P(gearGeo(0.09, 0.07, 10, 0.024, 0.02), COPPER, gearA, [-0.045, 0.62, -0.391], { dir: [0, 0, -1], axis: "z" });
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3 + 0.5;
    P(cyl(0.014, 0.014, 0.004, 6), COPPER_D, gearA, [-0.045 + Math.cos(a) * 0.044, 0.62 + Math.sin(a) * 0.044, -0.404], {
      dir: [0, 0, -1],
    });
  }
  P(cyl(0.018, 0.018, 0.012, 6), BRASS, gearA, [-0.045, 0.62, -0.408], { dir: [0, 0, -1] });
  P(gearGeo(0.055, 0.043, 8, 0.024, 0.012), STEEL, gearB, [0.035, 0.69, -0.391], { dir: [0, 0, -1], axis: "z" });
  P(cyl(0.013, 0.013, 0.012, 6), BRASS, gearB, [0.035, 0.69, -0.408], { dir: [0, 0, -1] });
  P(gearGeo(0.035, 0.027, 7, 0.024, 0.008), BRASS, gearC, [0.07, 0.755, -0.391], { dir: [0, 0, -1], axis: "z" });
  P(cyl(0.008, 0.008, 0.012, 6), STEEL_D, gearC, [0.07, 0.755, -0.408], { dir: [0, 0, -1] });

  // pressure gauge
  P(cyl(0.048, 0.048, 0.02, 10), BRASS, pack, [0.08, 0.535, -0.39], { dir: [0, 0, -1] });
  P(new THREE.CircleGeometry(0.04, 12), "#ffffff", pack, [0.08, 0.535, -0.4015], {
    dir: [0, 0, -1],
    axis: "z",
    texture: GAUGE,
    flat: false,
  });
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    P(ball(0.005, 4, 3), BRASS_D, pack, [0.08 + Math.cos(a) * 0.044, 0.535 + Math.sin(a) * 0.044, -0.4]);
  }
  R([0.08, 0.49, -0.39], [0.08, 0.44, -0.39], 0.01, BRASS, pack, { sides: 6 });

  // copper pipe run with fittings, valve and puffs of steam
  const pipePts: V[] = [
    [-0.14, 0.74, -0.395],
    [-0.15, 0.66, -0.395],
    [-0.152, 0.5, -0.395],
    [-0.13, 0.43, -0.395],
    [-0.05, 0.415, -0.395],
    [0.02, 0.42, -0.395],
  ];
  b.sweep(catmull(pipePts), 0.014, { bone: pack, color: COPPER, sides: 6, smooth: false });
  for (const [x, y, z] of [pipePts[0], pipePts[2], pipePts[3], pipePts[5]]) P(ball(0.021, 6, 4), BRASS, pack, [x, y, z]);
  P(cyl(0.02, 0.02, 0.014, 6), BRASS_D, pack, [-0.145, 0.7, -0.395]);
  P(cyl(0.02, 0.02, 0.014, 6), BRASS_D, pack, [-0.151, 0.58, -0.395]);
  R([0.02, 0.42, -0.395], [0.02, 0.45, -0.395], 0.008, BRASS, pack, { sides: 6 });
  P(cyl(0.028, 0.028, 0.008, 8), HAT, pack, [0.02, 0.458, -0.395]);
  P(ball(0.024, 6, 4), PUFF, pack, [0.02, 0.487, -0.405]);
  P(ball(0.03, 6, 4), PUFF, pack, [0.005, 0.517, -0.412]);
  P(ball(0.02, 6, 4), PUFF, pack, [-0.02, 0.545, -0.418]);

  // spring coil
  b.sweep(
    spiral([0.11, 0.39, -0.405], [0.132, 0.39, -0.405], [0, 1, 0], { turns: 4, pitch: 0.016, r1: 0.022 }),
    0.0055,
    { bone: pack, color: STEEL, sides: 4, smooth: false },
  );
  P(cyl(0.03, 0.03, 0.008, 8), BRASS_D, pack, [0.11, 0.384, -0.405]);
  P(cyl(0.03, 0.03, 0.008, 8), BRASS_D, pack, [0.11, 0.458, -0.405]);

  // telescoping spyglass lashed up the left edge
  const SG: V = [0.145, 0, -0.409];
  P(cyl(0.03, 0.03, 0.16, 8), LEATHER, pack, [SG[0], 0.48, SG[2]]);
  P(cyl(0.024, 0.024, 0.14, 8), BRASS, pack, [SG[0], 0.63, SG[2]]);
  P(cyl(0.019, 0.019, 0.09, 8), BRASS_D, pack, [SG[0], 0.745, SG[2]]);
  P(cyl(0.034, 0.034, 0.012, 8), BRASS_D, pack, [SG[0], 0.56, SG[2]]);
  P(cyl(0.028, 0.028, 0.012, 8), BRASS_D, pack, [SG[0], 0.7, SG[2]]);
  P(cyl(0.022, 0.022, 0.02, 8), DARKB, pack, [SG[0], 0.795, SG[2]]);
  glow(P(cyl(0.015, 0.015, 0.006, 8), GLASS, pack, [SG[0], 0.806, SG[2]]), 1.3);
  P(cyl(0.034, 0.034, 0.018, 8), DARKB, pack, [SG[0], 0.44, SG[2]]);
  P(cyl(0.022, 0.022, 0.018, 8), DARKB, pack, [SG[0], 0.74, SG[2]]);
  P(box(0.02, 0.02, 0.012), BRASS, pack, [SG[0], 0.44, SG[2] - 0.034]);

  // pinned blueprint on the right side
  P(new THREE.PlaneGeometry(0.13, 0.1), "#ffffff", pack, [-0.1735, 0.7, -0.19], {
    dir: [-1, 0, 0],
    axis: "z",
    texture: BLUEPRINT,
    flat: false,
  });
  P(ball(0.008, 5, 3), RED_PIN(), pack, [-0.178, 0.735, -0.165]);

  // crank on the right side
  const crank = b.joint("crank", { parent: pack, at: [-0.185, 0.7, -0.3], dir: [-1, 0, 0], role: "hinge" });
  P(cyl(0.036, 0.036, 0.014, 8), BRASS_D, pack, [-0.178, 0.7, -0.3], { dir: [1, 0, 0] });
  P(cyl(0.01, 0.01, 0.05, 6), STEEL_D, pack, [-0.2, 0.7, -0.3], { dir: [1, 0, 0] });
  P(gearGeo(0.035, 0.028, 8, 0.01, 0.006), STEEL, crank, [-0.213, 0.7, -0.3], { dir: [-1, 0, 0], axis: "z" });
  R([-0.222, 0.7, -0.3], [-0.222, 0.635, -0.3], 0.008, BRASS, crank, { sides: 6 });
  R([-0.222, 0.635, -0.3], [-0.272, 0.635, -0.3], 0.014, WOOD, crank, { sides: 6 });
  P(ball(0.016, 5, 4), WOOD_D, crank, [-0.274, 0.635, -0.3]);

  // copper kettle strapped to the right side
  const KC: V = [-0.255, 0.5, -0.27];
  lathe(KETTLE, KC, pack, COPPER);
  P(cyl(0.09, 0.09, 0.014, 8), DARKB, pack, [KC[0], KC[1] + 0.005, KC[2]]);
  P(cyl(0.04, 0.032, 0.014, 6), COPPER_D, pack, [KC[0], KC[1] + 0.062, KC[2]]);
  P(ball(0.016, 5, 4), BRASS, pack, [KC[0], KC[1] + 0.085, KC[2]]);
  b.sweep(
    catmull([
      [KC[0], 0.49, -0.2],
      [KC[0], 0.52, -0.175],
      [KC[0], 0.565, -0.155],
      [KC[0], 0.585, -0.135],
    ]),
    [0.022, 0.014, 0.01],
    { bone: pack, color: COPPER, sides: 6, smooth: false },
  );
  b.sweep(
    catmull([
      [KC[0] - 0.075, 0.51, KC[2]],
      [KC[0] - 0.055, 0.575, KC[2]],
      [KC[0], 0.605, KC[2]],
      [KC[0] + 0.055, 0.575, KC[2]],
      [KC[0] + 0.075, 0.51, KC[2]],
    ]),
    0.006,
    { bone: pack, color: DARKB, sides: 4, smooth: false },
  );
  P(cyl(0.01, 0.01, 0.05, 6), WOOD, pack, [KC[0], 0.605, KC[2]], { dir: [1, 0, 0] });
  for (const k of [-1, 1]) P(box(0.05, 0.014, 0.02), LEATHER_D, pack, [-0.185, 0.5, KC[2] + k * 0.05]);

  // bellows on the left side
  const BC: V = [0.255, 0.64, -0.14];
  lathe(bellowsProfile(), BC, pack, LEATHER_L, { axis: [0, 0, -1] });
  for (const z of [-0.14, -0.14 - 0.246 - 0.014]) P(cyl(0.078, 0.078, 0.016, 8), WOOD, pack, [BC[0], BC[1], z], { dir: [0, 0, 1] });
  P(cyl(0.012, 0.022, 0.07, 6), BRASS, pack, [BC[0], BC[1], -0.436], { dir: [0, 0, -1] });
  P(cyl(0.02, 0.02, 0.016, 6), BRASS_D, pack, [BC[0], BC[1], -0.4], { dir: [0, 0, 1] });
  for (const k of [-1, 1]) {
    P(ball(0.008, 4, 3), BRASS, pack, [BC[0] + k * 0.06, BC[1] + 0.05, -0.131]);
    P(box(0.12, 0.014, 0.03), LEATHER_D, pack, [0.2, 0.64, -0.2 - k * 0.07]);
  }

  // hanging lantern (swings on its own joint)
  const lantern = b.joint("lantern", { parent: pack, at: [0.215, 0.5, -0.3], dir: [0, -1, 0], role: "hinge" });
  P(torus(0.014, 0.004), BRASS_D, lantern, [0.215, 0.49, -0.3], { rotation: [0, 90, 0] });
  P(torus(0.015, 0.004), BRASS, lantern, [0.215, 0.472, -0.3]);
  P(cone(0.045, 0.035, 4), BRASS, lantern, [0.215, 0.446, -0.3], { rotation: [0, 45, 0] });
  glow(P(box(0.05, 0.07, 0.05), GLASS_Y, lantern, [0.215, 0.395, -0.3]), 1.3);
  P(box(0.062, 0.016, 0.062), BRASS, lantern, [0.215, 0.352, -0.3]);
  P(box(0.056, 0.01, 0.056), BRASS_D, lantern, [0.215, 0.43, -0.3]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) R([0.215 + sx * 0.026, 0.36, -0.3 + sz * 0.026], [0.215 + sx * 0.026, 0.43, -0.3 + sz * 0.026], 0.004, BRASS, lantern, { sides: 4 });

  return b.root;
}

function RED_PIN() {
  return "#e0463c";
}
