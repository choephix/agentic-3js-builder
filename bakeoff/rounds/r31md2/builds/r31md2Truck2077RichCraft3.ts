import * as THREE from "three";
import { createBuilder, svg, patches, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";
import { paint, stripes } from "../../../../src/index";

export const meta = {
  name: "ARES-77 Strike Truck",
  description:
    "Low-poly cyberpunk 8x8 militarized heavy truck from 2077: camo-plated cab-over hull, roof sensor suite, rotating twin-rail turret, missile pods, neon underglow and hazard bumpers.",
};

// ---------- palette ----------
const DARK = "#14171b";
const STEEL = "#4d555e";
const GUN = "#2b2f35";
const RUBBER = "#0f1012";
const CYAN = "#19e6ff";
const MAG = "#ff2a8a";
const ORANGE = "#ff6a1a";
const RED = "#ff2b2b";
const YELLOW = "#f2c230";
const GLASS = "#0b2230";
const OLIVE = "#4a5238";
const WHITE = "#e8edf0";

const HULL = panelled(
  patches("#2a3238", ["#222a30", "#323b40", "#2c343a", "#262e2c"], { size: 0.55, gap: 0.0, seed: 3 }),
  { size: 0.5, aspect: 0.6, rivets: 0.1 },
);
const HULL2 = patches("#303840", ["#262d33", "#39424a", "#2b3238"], { size: 0.35, gap: 0.0, seed: 8 });
const TIRE = stripes(RUBBER, "#26282c", { size: 0.09, axis: "x", width: 0.5, wobble: 0.1 });

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#15171a"/>${Array.from(
    { length: 9 },
    (_, i) => `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#f2c230"/>`,
  ).join("")}</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#14171b" stroke="#ff6a1a" stroke-width="5"/>
  <polygon points="50,18 80,34 50,86 20,34" fill="none" stroke="#19e6ff" stroke-width="3"/>
  <path d="M28 38 L50 46 L72 38 L66 56 L50 52 L34 56 Z" fill="#ff6a1a"/>
  <rect x="38" y="60" width="24" height="5" fill="#e8edf0"/>
  <text x="50" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#ff2a8a">77</text>
  </svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 200 50">
  <text x="8" y="28" font-family="monospace" font-weight="bold" font-size="22" fill="#e8edf0">ARES-77</text>
  <text x="8" y="44" font-family="monospace" font-size="10" fill="#ff6a1a">// HEAVY STRIKE LOGISTICS</text>
  <g fill="#ff2a8a"><polygon points="130,8 142,8 152,24 140,24"/><polygon points="148,8 160,8 170,24 158,24"/><polygon points="166,8 178,8 188,24 176,24"/></g>
  <g fill="#e8edf0">${Array.from({ length: 14 }, (_, i) => `<rect x="${128 + i * 4.5}" y="32" width="${i % 3 ? 2 : 3.5}" height="14"/>`).join("")}</g>
  </svg>`,
  { size: 512 },
);
const HUD = svg(
  `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#06222c"/>
  <g stroke="#19e6ff" stroke-width="0.8" fill="none"><circle cx="50" cy="25" r="11"/><circle cx="50" cy="25" r="4"/>
  <path d="M50 8 V16 M50 34 V42 M30 25 H40 M60 25 H70"/><path d="M4 8 H24 V12 M96 8 H76 V12 M4 42 H24 V38 M96 42 H76 V38"/></g>
  <g fill="#19e6ff"><rect x="6" y="16" width="14" height="1.6"/><rect x="6" y="20" width="9" height="1.6"/><rect x="6" y="24" width="12" height="1.6"/>
  <rect x="80" y="16" width="12" height="1.6"/><rect x="84" y="20" width="8" height="1.6"/></g>
  <text x="72" y="40" font-family="monospace" font-size="5" fill="#ff2a8a">TGT LOCK 2077</text></svg>`,
  { size: 384 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#1a1d22"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#19e6ff" stroke-width="4"/>
  ${[0, 1, 2, 3, 4].map((i) => `<polygon points="50,50 ${50 + 40 * Math.sin((i * 72 - 14) * 0.01745)},${50 - 40 * Math.cos((i * 72 - 14) * 0.01745)} ${50 + 40 * Math.sin((i * 72 + 14) * 0.01745)},${50 - 40 * Math.cos((i * 72 + 14) * 0.01745)}" fill="#3c434c"/>`).join("")}
  <circle cx="50" cy="50" r="12" fill="#ff6a1a"/><circle cx="50" cy="50" r="5" fill="#14171b"/>
  ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${50 + 28 * Math.sin((i * 72 + 36) * 0.01745)}" cy="${50 - 28 * Math.cos((i * 72 + 36) * 0.01745)}" r="3" fill="#e8edf0"/>`).join("")}
  </svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ares77", paintSize: 2048 });
  const D = Math.PI / 180;

  // ---------- skeleton ----------
  const chassis = b.joint("chassis", { at: [0, 1, 0] });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.3, -1.2], dir: [0, 1, 0], role: "hinge" });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.15, -1.2], dir: [0, 0, 1], role: "hinge" });
  const wheelJoints: Record<string, any> = {};

  // ---------- helpers ----------
  const bx = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) => {
    const opt: any = { at, bone: o.bone ?? chassis };
    if (o.rot) opt.rotation = o.rot;
    if (o.texture) opt.texture = o.texture;
    return b.part(new THREE.BoxGeometry(w, h, d), color, opt);
  };
  const cy = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) => {
    const opt: any = { at, bone: o.bone ?? chassis };
    if (o.dir) opt.dir = o.dir;
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, opt);
  };
  const neon = (w: number, h: number, d: number, color: string, at: number[], s = 1.4, o: any = {}) =>
    glow(bx(w, h, d, color, at, o), s);
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone: o.bone ?? chassis });
  const xf = (origin: number[], rot: number[], local: number[]) =>
    new THREE.Vector3(...local)
      .applyEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ"))
      .add(new THREE.Vector3(...origin))
      .toArray();
  const rod = (a: number[], c: number[], r: number, color: string, bone: any = chassis) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  // ---------- frame, axles, suspension ----------
  for (const s of [1, -1]) {
    bx(0.25, 0.3, 7.6, DARK, [s * 0.8, 0.85, -0.2]);
    bx(0.08, 0.2, 7.0, STEEL, [s * 0.95, 0.85, -0.2]);
  }
  bx(2.2, 0.12, 7.2, GUN, [0, 0.98, -0.2]);
  for (const z of [3, 1.8, 0.5, -0.8, -2.2, -3.6]) bx(1.6, 0.18, 0.18, DARK, [0, 0.85, z]);
  const axleZ = [2.6, 1.3, -1.9, -3.2];
  for (const z of axleZ) {
    cy(0.1, 0.1, 2.9, 8, STEEL, [0, 0.6, z], { dir: [1, 0, 0] });
    cy(0.22, 0.22, 0.4, 8, GUN, [0, 0.6, z], { dir: [1, 0, 0] });
    cy(0.28, 0.28, 0.2, 8, STEEL, [0, 0.6, z + 0.0], { dir: [0, 0, 1] });
    for (const s of [1, -1]) {
      bx(0.22, 0.08, 1.1, STEEL, [s * 0.95, 0.78, z]);
      cy(0.07, 0.07, 0.4, 6, ORANGE, [s * 0.95, 0.98, z + 0.35]);
      cy(0.07, 0.07, 0.4, 6, ORANGE, [s * 0.95, 0.98, z - 0.35]);
    }
    cy(0.04, 0.04, 2.0, 6, DARK, [0, 0.9, z - 0.3], { dir: [1, 0, 0] });
  }
  rod([0, 0.7, 2.6], [0, 0.7, -3.2], 0.06, GUN);

  // ---------- wheels ----------
  const names = [
    ["wheelFL", "wheelFR"],
    ["wheelF2L", "wheelF2R"],
    ["wheelR1L", "wheelR1R"],
    ["wheelR2L", "wheelR2R"],
  ];
  axleZ.forEach((z, ai) => {
    for (const s of [1, -1]) {
      const x = s * 1.4;
      const j = b.joint(names[ai][s > 0 ? 0 : 1], { parent: chassis, at: [x, 0.6, z], dir: [s, 0, 0] });
      wheelJoints[j.name] = j;
      b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.55, 14), TIRE, { at: [x, 0.59, z], dir: [1, 0, 0], bone: j });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.59, 12), STEEL, { at: [x, 0.59, z], dir: [1, 0, 0], bone: j });
      b.part(new THREE.CircleGeometry(0.36, 16), "#ffffff", {
        at: [x + s * 0.3, 0.59, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: HUB,
        bone: j,
      });
      glow(
        b.part(new THREE.TorusGeometry(0.4, 0.02, 4, 16), CYAN, {
          at: [x + s * 0.296, 0.59, z],
          dir: [s, 0, 0],
          axis: "z",
          bone: j,
        }),
        1.5,
      );
      // fender and flap
      bx(0.78, 0.08, 1.45, HULL2, [x, 1.28, z]);
      bx(0.78, 0.3, 0.06, HULL2, [x, 1.1, z + 0.72], { rot: [-20, 0, 0] });
      bx(0.78, 0.3, 0.06, HULL2, [x, 1.1, z - 0.72], { rot: [20, 0, 0] });
      bx(0.04, 0.3, 1.45, ORANGE, [x + s * 0.4, 1.25, z]);
      if (ai >= 2) bx(0.6, 0.45, 0.04, DARK, [x, 0.45, z - 0.78]);
    }
  });

  // ---------- cab ----------
  const cabOutline: [number, number][] = [
    [0.2, 1.3],
    [3.4, 1.3],
    [3.5, 1.8],
    [3.0, 2.15],
    [2.3, 2.85],
    [0.6, 2.9],
    [0.2, 2.7],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.06, color: HULL, bone: chassis });
  // windshield + HUD
  bx(2.0, 0.03, 0.92, GLASS, [0, 2.515, 2.665], { rot: [45, 0, 0] });
  glow(plane(1.9, 0.85, HUD, [0, 2.55, 2.7], [0, 0.707, 0.707]), 0.9);
  bx(2.1, 0.06, 0.06, DARK, [0, 2.17, 3.0], { rot: [45, 0, 0] });
  bx(2.1, 0.06, 0.06, DARK, [0, 2.84, 2.32], { rot: [45, 0, 0] });
  bx(0.06, 0.06, 1.0, DARK, [0, 2.5, 2.65], { rot: [45, 0, 0] });
  // visor over windshield
  bx(2.3, 0.06, 0.4, HULL2, [0, 2.97, 2.2], { rot: [-10, 0, 0] });
  for (const s of [1, -1]) {
    bx(0.03, 0.55, 1.4, GLASS, [s * 1.16, 2.3, 1.5]);
    bx(0.04, 0.05, 1.45, DARK, [s * 1.17, 2.6, 1.5]);
    bx(0.04, 0.05, 1.45, DARK, [s * 1.17, 2.02, 1.5]);
    bx(0.04, 1.5, 0.04, DARK, [s * 1.17, 1.9, 0.8]);
    bx(0.04, 1.5, 0.04, DARK, [s * 1.17, 1.9, 2.3]);
    bx(0.05, 0.05, 0.25, STEEL, [s * 1.18, 1.95, 2.15]);
    plane(0.62, 0.62, EMBLEM, [s * 1.165, 1.65, 1.55], [s, 0, 0]);
    // armor slats on lower door
    for (let i = 0; i < 4; i++) bx(0.06, 0.08, 1.9, GUN, [s * 1.18, 1.38 + i * 0.1, 1.6 + 0.0]);
    // mirrors
    rod([s * 1.15, 2.35, 3.1], [s * 1.5, 2.45, 3.2], 0.025, GUN);
    bx(0.12, 0.35, 0.2, DARK, [s * 1.55, 2.45, 3.2]);
    neon(0.02, 0.2, 0.12, CYAN, [s * 1.55, 2.45, 3.31], 1.4);
    // headlights, fog, hooks
    neon(0.9, 0.14, 0.06, WHITE, [s * 0.75, 1.65, 3.5], 1.8);
    neon(0.3, 0.05, 0.06, MAG, [s * 1.0, 1.52, 3.52], 1.5);
    bx(0.3, 0.12, 0.1, GUN, [s * 0.7, 0.95, 3.55]);
    neon(0.2, 0.06, 0.04, YELLOW, [s * 0.7, 0.95, 3.61], 1.6);
    bx(0.12, 0.2, 0.3, YELLOW, [s * 1.0, 0.8, 3.8]);
    // exhaust stacks
    cy(0.1, 0.1, 1.5, 8, STEEL, [s * 1.2, 2.75, -0.2]);
    cy(0.13, 0.13, 0.08, 8, GUN, [s * 1.2, 3.5, -0.2]);
    glow(cy(0.09, 0.09, 0.03, 8, ORANGE, [s * 1.2, 3.54, -0.2]), 1.6);
    bx(0.04, 1.0, 0.3, GUN, [s * 1.1, 2.6, -0.2]);
    for (let i = 0; i < 3; i++) cy(0.14, 0.14, 0.05, 8, DARK, [s * 1.2, 2.3 + i * 0.4, -0.2]);
    // side vents & grab handles
    for (let i = 0; i < 5; i++) bx(0.03, 0.04, 0.4, DARK, [s * 1.17, 1.42 + i * 0.07, 0.55 - 0.0]);
    rod([s * 1.2, 1.5, 0.6], [s * 1.2, 2.5, 0.6], 0.02, STEEL);
  }
  // front fascia
  bx(1.7, 0.7, 0.1, DARK, [0, 1.62, 3.47]);
  for (let i = 0; i < 5; i++) neon(1.5, 0.025, 0.04, CYAN, [0, 1.4 + i * 0.12, 3.53], 1.1);
  bx(2.7, 0.45, 0.5, "#ffffff", [0, 0.75, 3.5], { texture: HAZARD });
  bx(2.4, 0.2, 0.3, GUN, [0, 1.05, 3.55]);
  bx(2.5, 0.12, 0.35, STEEL, [0, 1.15, 3.6], { rot: [-25, 0, 0] });
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) rod([x, 0.5, 3.74], [x, 1.5, 3.68], 0.025, STEEL);
  cy(0.12, 0.12, 1.6, 8, GUN, [0, 0.95, 3.82], { dir: [1, 0, 0] });
  // roof
  bx(2.2, 0.1, 1.8, HULL2, [0, 2.95, 1.4]);
  neon(0.5, 0.08, 0.2, MAG, [-0.6, 3.04, 2.7], 1.8);
  neon(0.5, 0.08, 0.2, CYAN, [0, 3.04, 2.7], 1.8);
  neon(0.5, 0.08, 0.2, MAG, [0.6, 3.04, 2.7], 1.8);
  bx(1.8, 0.04, 0.3, DARK, [0, 3.0, 2.7]);
  // sat dish
  rod([0.7, 2.98, 0.9], [0.7, 3.3, 0.9], 0.04, STEEL);
  b.lathe(
    [
      [0, 0],
      [0.32, 0.14],
      [0.32, 0.16],
      [0, 0.04],
    ],
    { at: [0.7, 3.3, 0.9], axis: [0, 0.8, 0.6], segments: 10, color: STEEL, bone: chassis },
  );
  rod([0.7, 3.32, 0.9], [0.7 + 0, 3.62, 0.9 + 0.2], 0.012, GUN);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { at: [0.7, 3.63, 1.1], bone: chassis }), 2);
  // antennas
  for (const [x, z, h] of [[-1.0, 0.5, 1.4], [1.0, 0.6, 1.0], [-0.9, 1.6, 0.8], [1.35, -4.0, 1.5], [-1.35, -4.0, 1.2]] as number[][]) {
    const base = z < -3 ? 2.0 : 2.97;
    rod([x, base, z], [x, base + h, z], 0.012, GUN);
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), x > 0 ? RED : CYAN, { at: [x, base + h, z], bone: chassis }), 2);
  }
  // sensor pod (lidar)
  cy(0.16, 0.16, 0.2, 8, GUN, [-0.7, 3.1, 0.7]);
  neon(0.26, 0.04, 0.04, CYAN, [-0.7, 3.12, 0.84], 1.6);
  // roof rails
  for (const s of [1, -1]) {
    rod([s * 1.05, 3.0, 0.4], [s * 1.05, 3.0, 2.2], 0.02, STEEL);
    for (const z of [0.4, 1.3, 2.2]) rod([s * 1.05, 2.95, z], [s * 1.05, 3.0, z], 0.02, STEEL);
  }

  // ---------- armored hull / cargo bed ----------
  b.part(new THREE.BoxGeometry(2.6, 0.7, 4.3), HULL, { at: [0, 1.65, -2.0], bone: chassis });
  b.part(new THREE.BoxGeometry(2.2, 0.3, 3.8), HULL2, { at: [0, 2.15, -2.1], bone: chassis });
  bx(2.4, 0.12, 4.0, GUN, [0, 1.3, -2.0]);
  for (const s of [1, -1]) {
    plane(2.3, 0.575, STENCIL, [s * 1.305, 1.75, -2.4], [s, 0, 0]);
    neon(0.03, 0.04, 3.9, CYAN, [s * 1.31, 1.4, -2.0], 1.4);
    neon(0.03, 0.04, 3.9, MAG, [s * 1.31, 1.95, -2.0], 1.2);
    for (let i = 0; i < 8; i++) bx(0.05, 0.6, 0.06, GUN, [s * 1.3, 1.65, -3.95 + i * 0.55]);
    // slanted side armor on deck
    bx(0.08, 0.35, 3.6, HULL, [s * 1.1, 2.2, -2.1], { rot: [0, 0, -s * 15] });
    // skirts with battery cells
    bx(0.08, 0.5, 1.9, HULL2, [s * 1.28, 1.08, -0.2]);
    for (let i = 0; i < 4; i++) neon(0.03, 0.22, 0.3, CYAN, [s * 1.33, 1.08, -0.9 + i * 0.45], 1.3);
    // jerry cans, tool boxes
    for (let i = 0; i < 2; i++) {
      bx(0.2, 0.36, 0.3, OLIVE, [s * 1.42, 1.62, -0.45 - i * 0.4]);
      bx(0.06, 0.05, 0.14, GUN, [s * 1.42, 1.84, -0.45 - i * 0.4]);
    }
    bx(0.25, 0.35, 0.8, GUN, [s * 1.45, 1.55, -2.0]);
    // missile pods
    const o = [s * 0.75, 2.5, -3.2];
    const rot = [-25, 0, 0];
    bx(0.9, 0.7, 1.4, GUN, o, { rot });
    bx(0.94, 0.06, 1.44, ORANGE, xf(o, rot, [0, 0.36, 0]), { rot });
    const dirv = xf([0, 0, 0], rot, [0, 0, 1]);
    for (const [lx, ly] of [[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.17], [0.2, 0.17]]) {
      cy(0.14, 0.14, 0.1, 8, DARK, xf(o, rot, [lx, ly, 0.71]), { dir: dirv });
      glow(cy(0.05, 0.05, 0.02, 6, RED, xf(o, rot, [lx, ly, 0.76]), { dir: dirv }), 1.4);
    }
    rod(xf(o, rot, [0.0, -0.35, 0.5]), [s * 0.75, 2.0, -2.6], 0.04, STEEL);
    rod(xf(o, rot, [0.0, -0.35, -0.5]), [s * 0.75, 2.0, -3.8], 0.04, STEEL);
    // tail lights
    neon(0.9, 0.12, 0.05, RED, [s * 0.7, 1.65, -4.17], 1.6);
    bx(0.5, 0.35, 0.3, GUN, [s * 1.0, 0.95, -4.3]);
  }
  // deck hatches and vents
  for (let i = 0; i < 3; i++) {
    bx(0.7, 0.05, 0.7, STEEL, [-0.0, 2.33, -3.6 + i * 0.0 - (i - 1) * 0.0 - 0.0], { rot: [0, 0, 0] }).position.x += 0;
  }
  bx(0.9, 0.06, 0.6, GUN, [0, 2.32, -0.6]);
  for (let i = 0; i < 5; i++) bx(0.7, 0.03, 0.04, DARK, [0, 2.36, -0.75 + i * 0.1]);
  // rear bumper & hitch
  bx(2.7, 0.4, 0.3, "#ffffff", [0, 0.95, -4.35], { texture: HAZARD });
  bx(0.3, 0.2, 0.3, STEEL, [0, 0.8, -4.6]);
  cy(0.08, 0.08, 0.1, 8, YELLOW, [0, 0.8, -4.78], { dir: [0, 0, 1] });
  // rear ramp seams / back door
  bx(2.0, 0.55, 0.04, DARK, [0, 1.65, -4.17]);
  neon(1.6, 0.03, 0.03, MAG, [0, 1.9, -4.2], 1.2);
  // underglow
  neon(0.05, 0.04, 6.0, MAG, [-1.1, 0.87, -0.2], 1.6);
  neon(0.05, 0.04, 6.0, MAG, [1.1, 0.87, -0.2], 1.6);

  // ---------- turret ----------
  cy(1.05, 1.1, 0.12, 14, GUN, [0, 2.36, -1.2], { bone: turret });
  glow(
    b.part(new THREE.TorusGeometry(1.0, 0.025, 4, 20), CYAN, { at: [0, 2.43, -1.2], dir: [0, 1, 0], axis: "z", bone: turret }),
    1.6,
  );
  const turOutline: [number, number][] = [
    [-2.1, 2.42],
    [-0.3, 2.42],
    [-0.15, 2.7],
    [-0.5, 3.05],
    [-1.8, 3.05],
    [-2.15, 2.75],
  ];
  b.extrude(turOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.5, bevel: 0.05, color: HULL, bone: turret });
  for (const s of [1, -1]) {
    bx(0.45, 0.4, 1.0, GUN, [s * 0.45, 3.15, -1.25], { bone: gun });
    bx(0.05, 0.3, 0.8, ORANGE, [s * 0.69, 3.15, -1.25], { bone: gun });
    // barrel assembly
    cy(0.11, 0.11, 1.6, 8, STEEL, [s * 0.45, 3.15, 0.0], { dir: [0, 0, 1], bone: gun });
    cy(0.065, 0.065, 4.4, 8, GUN, [s * 0.45, 3.15, 0.8], { dir: [0, 0, 1], bone: gun });
    for (let i = 0; i < 4; i++) cy(0.09, 0.09, 0.06, 8, DARK, [s * 0.45, 3.15, -0.5 + i * 0.4], { dir: [0, 0, 1], bone: gun });
    bx(0.2, 0.2, 0.3, DARK, [s * 0.45, 3.15, 3.05], { bone: gun });
    glow(bx(0.12, 0.02, 0.2, CYAN, [s * 0.45, 3.26, 3.05], { bone: gun }), 1.5);
    neon(0.03, 0.03, 1.2, CYAN, [s * 0.45, 3.28, -0.4], 1.5, { bone: gun });
    // side sensor pods & smoke launchers
    cy(0.1, 0.1, 0.3, 8, GUN, [s * 0.85, 2.85, -0.6], { dir: [0, 0, 1], bone: turret });
    for (let i = 0; i < 3; i++) cy(0.045, 0.045, 0.25, 6, DARK, [s * 0.88, 2.6 + i * 0.1, -2.1], { dir: [s * 0.5, 0.3, -1], bone: turret });
  }
  bx(0.5, 0.35, 0.5, STEEL, [0, 3.0, -0.35], { bone: turret });
  neon(0.35, 0.12, 0.05, MAG, [0, 3.0, -0.08], 1.8, { bone: turret });
  bx(0.4, 0.3, 0.35, OLIVE, [0, 3.22, -2.0], { bone: turret });
  b.sweep(catmull([[0.4, 2.9, -2.1], [0.5, 2.7, -1.6], [0.45, 3.1, -1.2]]), 0.02, { color: YELLOW, bone: turret });
  b.sweep(catmull([[-0.4, 2.8, -2.1], [-0.5, 2.6, -1.8], [-0.7, 2.45, -1.4]]), 0.025, { color: DARK, bone: turret });
  // turret emblem
  plane(0.5, 0.5, EMBLEM, [0.76, 2.75, -1.2], [1, 0, 0], { bone: turret });
  plane(0.5, 0.5, EMBLEM, [-0.76, 2.75, -1.2], [-1, 0, 0], { bone: turret });

  // ---------- cables and hoses ----------
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 1.1, 1.2, 0.2], [s * 1.15, 1.0, -0.4], [s * 1.1, 1.1, -1.2]]), 0.03, { color: DARK, bone: chassis });
    b.sweep(catmull([[s * 0.9, 2.3, -0.1], [s * 0.95, 2.5, -0.4], [s * 0.7, 2.4, -0.9]]), 0.025, { color: MAG, bone: chassis });
  }

  // simple paint to keep unused import honest: weathered stripe on rear
  bx(2.0, 0.08, 0.04, paint(() => "#7a2a2a"), [0, 2.0, -4.18]);

  return b.root;
}
