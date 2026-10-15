import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby, cheerful open-cockpit biplane with a smiling radiator, goggled pilot and dog passenger, striped tail, pennants and rigging wires.",
  style: "whimsical",
  commit: "88fc1f0",
};

// palette
const RED = "#e8473a";
const TEAL = "#27b3ae";
const CREAM = "#ffeab0";
const CREAM_D = "#f3cf82";
const GOLD = "#f5b82e";
const BRASS = "#d9a441";
const WOOD = "#c58a4b";
const DARK = "#3a2a38";
const WIRE = "#5a4a58";
const LEATHER = "#7a4a2c";
const SKIN = "#f2b48c";
const TIRE = "#3b3340";
const GLASS = "#9fe3f2";

const C_RED = cel(RED);
const C_TEAL = cel(TEAL);
const C_CREAM = cel(CREAM);
const C_CREAM_D = cel(CREAM_D);
const C_GOLD = cel(GOLD);

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${INK}"/><circle cx="50" cy="50" r="44" fill="#27b3ae"/><circle cx="50" cy="50" r="33" fill="#fff4d8"/><circle cx="50" cy="50" r="25" fill="#e8473a"/><polygon points="50,24 56,42 76,42 60,54 66,74 50,62 34,74 40,54 24,42 44,42" fill="#f5b82e" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);

const SMILE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#d9a441"/><circle cx="50" cy="50" r="44" fill="#2a1f35"/><g stroke="#4b3a58" stroke-width="3"><line x1="12" y1="30" x2="88" y2="30"/><line x1="8" y1="42" x2="92" y2="42"/><line x1="8" y1="58" x2="92" y2="58"/><line x1="12" y1="70" x2="88" y2="70"/></g><path d="M20 56 Q50 92 80 56" fill="none" stroke="#f5b82e" stroke-width="7" stroke-linecap="round"/><circle cx="34" cy="38" r="6" fill="#fff4d8"/><circle cx="66" cy="38" r="6" fill="#fff4d8"/></svg>`,
  { size: 256 },
);

const NAME = svg(
  `<svg viewBox="0 0 260 60"><text x="130" y="45" font-family="sans-serif" font-weight="bold" font-size="44" text-anchor="middle" fill="#8a2a22" stroke="#fff4d8" stroke-width="2">HOT BISCUIT</text></svg>`,
  { size: 768 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormerBiplane" });

  const P = (g: THREE.BufferGeometry, c: string | ReturnType<typeof paint>, at: number[], o: PartOptions = {}) =>
    b.part(g, c, { at, ...o });
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- fuselage ----------
  const fusPaint = paint((p, n) => {
    if (Math.abs(p.y - 1.42) < 0.035 && n.y < 0.75 && p.z > -2.2) return C_GOLD;
    if (n.y < 0.6 && Math.abs(n.x) > 0.4 && Math.abs((p.z + 10) % 0.55) < 0.012) return "#b83228";
    if (p.z < -2.0) return C_TEAL;
    if (p.y < 0.98) return C_CREAM;
    return C_RED;
  });
  const fus = b.loft(
    [
      { at: [0, 1.5, -3.2], w: 0.08, h: 0.16 },
      { at: [0, 1.45, -2.6], w: 0.25, h: 0.4 },
      { at: [0, 1.4, -2.0], w: 0.45, h: 0.62 },
      { at: [0, 1.32, -1.0], w: 0.8, h: 0.95 },
      { at: [0, 1.25, 0.0], w: 1.0, h: 1.15 },
      { at: [0, 1.25, 1.0], w: 1.08, h: 1.2 },
      { at: [0, 1.25, 1.65], w: 1.1, h: 1.2 },
    ],
    { color: fusPaint, sides: 10 },
  );

  // cowl
  P(new THREE.CylinderGeometry(0.58, 0.63, 0.56, 10), C_TEAL, [0, 1.25, 1.9], { dir: [0, 0, 1] });
  P(new THREE.TorusGeometry(0.6, 0.045, 5, 12), BRASS, [0, 1.25, 2.15]);
  P(new THREE.TorusGeometry(0.62, 0.04, 5, 12), BRASS, [0, 1.25, 1.65]);
  P(new THREE.CircleGeometry(0.56, 16), "#ffffff", [0, 1.25, 2.168], { texture: SMILE });
  P(sphere(0.17, 8, 6), BRASS, [0, 1.25, 2.28], { scale: [1, 1, 1.3] });
  P(sphere(0.06, 6, 4), GOLD, [0, 1.25, 2.47]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    P(sphere(0.022, 5, 3), GOLD, [Math.sin(a) * 0.5, 1.25 + Math.cos(a) * 0.5, 2.19]);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const x = Math.sin(a), y = Math.cos(a);
    P(box(0.16, 0.03, 0.16), DARK, [x * 0.6, 1.25 + y * 0.6, 1.76], { dir: [x, y, 0], axis: "y" });
  }
  // exhaust stubs
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++) {
      const y = 1.5 - k * 0.2;
      const z = 1.95 - k * 0.08;
      b.capsule([s * 0.5, y, z], [s * 0.86, y - 0.1, z - 0.22], 0.05, DARK);
      P(sphere(0.035, 5, 3), "#d85a2a", [s * 0.88, y - 0.1, z - 0.24]);
    }

  // propeller
  const ang = (22 * Math.PI) / 180;
  const blade: Array<[number, number]> = (
    [
      [-0.12, 0],
      [-0.2, 0.7],
      [-0.1, 1.2],
      [0.1, 1.2],
      [0.2, 0.7],
      [0.12, 0],
      [0.2, -0.7],
      [0.1, -1.2],
      [-0.1, -1.2],
      [-0.2, -0.7],
    ] as Array<[number, number]>
  ).map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)]);
  b.extrude(blade, {
    at: [0, 1.25, 2.36],
    x: [1, 0, 0],
    thickness: 0.05,
    bevel: 0.012,
    color: paint((p, _n, s) => (Math.hypot(s[0], s[1]) > 0.95 ? C_GOLD : p.z > 99 ? C_RED : cel(LEATHER))),
  });

  // cockpits
  for (const z of [-0.45, 0.75]) {
    P(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 10), DARK, [0, 1.84, z], { scale: [1, 1, 1.15] });
    P(new THREE.TorusGeometry(0.3, 0.045, 5, 12), LEATHER, [0, 1.85, z], { dir: [0, 1, 0], axis: "z", scale: [1, 1.15, 1] });
  }
  // windscreens
  for (const z of [-0.12, 1.12]) {
    P(box(0.58, 0.26, 0.025), GLASS, [0, 2.0, z], { rotation: [-22, 0, 0] });
    P(box(0.62, 0.025, 0.04), BRASS, [0, 2.13, z - 0.02], { rotation: [-22, 0, 0] });
    P(box(0.62, 0.025, 0.04), BRASS, [0, 1.87, z + 0.02], { rotation: [-22, 0, 0] });
  }
  // headrest hump
  b.capsule([0, 1.8, -0.8], [0, 1.78, -1.4], [0.2, 0.08], C_RED);

  // ---------- decals ----------
  for (const s of [1, -1]) {
    const r = b.surface(fus).around([0, 1.3, -1.3]).at(s * 90, 0)!;
    b.decal(fus, ROUNDEL, { at: r, size: [0.55, 0.55] });
    const t = b.surface(fus).around([0, 0.85, 0.7]).at(s * 90, 0)!;
    b.decal(fus, NAME, { at: t, size: [1.3, 0.3] });
  }

  // ---------- wings ----------
  const wingPaint = (half: number, chord: number, top: boolean) =>
    paint((_p, n, s) => {
      const ax = Math.abs(s[0]);
      if (Math.abs(n.y) < 0.5) return C_TEAL;
      if (ax > half - 0.55) return C_RED;
      const aileron = ax > half * 0.45 && s[1] < -chord * 0.22;
      if (aileron && Math.abs(s[1] + chord * 0.22) < 0.012) return "#9a6a40";
      if ((ax + 0.3) % 0.75 < 0.035) return "#d7ab62";
      if (top && s[1] > chord * 0.28) return C_CREAM;
      return aileron ? C_CREAM_D : C_CREAM;
    });
  const wingOutline = (half: number, chord: number): Array<[number, number]> => [
    [-half, -chord / 2],
    [half, -chord / 2],
    [half, chord / 2],
    [-half, chord / 2],
  ];
  const UY = 2.55;
  const LY = 0.95;
  b.extrude(wingOutline(4, 1.3), {
    at: [0, UY, 0.35],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.12,
    bevel: 0.04,
    smoothing: 2,
    color: wingPaint(4, 1.3, true),
  });
  b.extrude(wingOutline(3.5, 1.0), {
    at: [0, LY, 0.35],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.1,
    bevel: 0.035,
    smoothing: 2,
    color: wingPaint(3.5, 1.0, false),
  });
  for (const s of [1, -1]) {
    // roundels on wings
    P(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", [s * 2.4, UY + 0.066, 0.3], {
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: ROUNDEL,
    });
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [s * 2.2, LY - 0.056, 0.35], {
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: ROUNDEL,
    });
    // wing-tip lights
    glow(P(sphere(0.08, 6, 4), s > 0 ? "#ff5a4a" : "#5aff8a", [s * 4.03, UY, 0.35]), 1.4);
    // pennants
    b.rod([s * 3.6, UY + 0.06, 0.45], [s * 3.6, UY + 0.6, 0.45], 0.015, WOOD, { sides: 4 });
    b.extrude(
      [
        [0, 0],
        [0.75, 0.11],
        [0.05, 0.26],
      ],
      {
        at: [s * 3.6, UY + 0.34, 0.45],
        x: [0, 0, -1],
        thickness: 0.012,
        color: s > 0 ? RED : GOLD,
      },
    );
    P(sphere(0.03, 5, 3), BRASS, [s * 3.6, UY + 0.62, 0.45]);

    // cabane struts
    for (const [z, zw] of [
      [0.7, 0.7],
      [0.0, 0.0],
    ]) {
      b.rod([s * 0.4, 1.75, z], [s * 0.7, UY - 0.05, zw], 0.045, WOOD, { sides: 6 });
    }
    // interplane struts and wires
    for (const x of [1.7, 3.3]) {
      for (const z of [0.75, 0.0]) {
        b.rod([s * x, LY, z], [s * x, UY, z], 0.05, WOOD, { sides: 6 });
        b.rod([s * x, LY + 0.04, z], [s * x, LY + 0.14, z], 0.065, BRASS, { sides: 6 });
        b.rod([s * x, UY - 0.14, z], [s * x, UY - 0.04, z], 0.065, BRASS, { sides: 6 });
      }
    }
    b.rod([s * 1.7, UY - 0.1, 0.75], [s * 3.3, LY + 0.1, 0.75], 0.012, WIRE, { sides: 4 });
    b.rod([s * 3.3, UY - 0.1, 0.75], [s * 1.7, LY + 0.1, 0.75], 0.012, WIRE, { sides: 4 });
    b.rod([s * 0.5, LY + 0.1, 0.4], [s * 1.7, UY - 0.1, 0.4], 0.012, WIRE, { sides: 4 });
    b.rod([s * 3.3, UY - 0.1, 0.0], [s * 1.7, LY + 0.1, 0.0], 0.012, WIRE, { sides: 4 });
    // bay top-to-bottom front/rear link
    b.rod([s * 1.7, UY - 0.3, 0.75], [s * 1.7, UY - 0.3, 0.0], 0.02, WIRE, { sides: 4 });

    // landing gear
    b.rod([s * 0.35, 0.8, 0.7], [s * 0.95, 0.45, 1.25], 0.06, WOOD, { sides: 6 });
    b.rod([s * 0.3, 0.8, 1.5], [s * 0.95, 0.45, 1.25], 0.06, WOOD, { sides: 6 });
    P(new THREE.TorusGeometry(0.33, 0.12, 6, 14), TIRE, [s * 0.95, 0.45, 1.25], { dir: [1, 0, 0], axis: "z" });
    P(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 8), CREAM, [s * 0.95, 0.45, 1.25], { dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 6), RED, [s * 0.95, 0.45, 1.25], { dir: [1, 0, 0] });
    P(sphere(0.07, 6, 4), BRASS, [s * 1.07, 0.45, 1.25]);

    // tail braces
    b.rod([0, 2.35, -3.0], [s * 1.15, 1.52, -2.75], 0.012, WIRE, { sides: 4 });
    b.rod([0, 1.2, -2.5], [s * 1.0, 1.48, -2.7], 0.02, WIRE, { sides: 4 });

    // pilot arms and gloves
    b.capsule([s * 0.26, 1.82, -0.5], [s * 0.3, 1.92, -0.1], 0.07, LEATHER);
    P(sphere(0.075, 6, 4), "#f1d6a0", [s * 0.3, 1.93, -0.07]);
    // goggles on pilot
    P(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), GLASS, [s * 0.09, 2.17, -0.2], { dir: [0, 0, 1] });
    P(new THREE.TorusGeometry(0.075, 0.018, 4, 8), BRASS, [s * 0.09, 2.17, -0.2]);
    // dog
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), GLASS, [s * 0.08, 2.1, 0.93], { dir: [0, 0, 1] });
    P(new THREE.TorusGeometry(0.06, 0.016, 4, 8), BRASS, [s * 0.08, 2.1, 0.93]);
    P(sphere(0.12, 6, 4), "#8a5230", [s * 0.2, 1.93, 0.72], { scale: [0.55, 1.3, 0.8], rotation: [0, 0, -s * 14] });
  }
  b.rod([-0.5, 1.75, 0.7], [0.5, 1.75, 0.7], 0.02, WIRE, { sides: 4 });

  // landing axle
  b.rod([-0.95, 0.45, 1.25], [0.95, 0.45, 1.25], 0.05, DARK, { sides: 6 });
  // tail skid
  b.capsule([0, 1.2, -2.6], [0, 0.045, -2.95], 0.045, WOOD, { sides: 6 });

  // ---------- tail ----------
  b.extrude(
    [
      [-1.3, -0.4],
      [1.3, -0.4],
      [1.0, 0.4],
      [-1.0, 0.4],
    ],
    {
      at: [0, 1.5, -2.8],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.08,
      bevel: 0.025,
      smoothing: 1,
      color: paint((_p, n, s) => (Math.abs(n.y) < 0.5 ? C_TEAL : s[1] < -0.05 ? C_RED : C_CREAM)),
    },
  );
  b.extrude(
    [
      [-0.5, 0],
      [0.4, 0],
      [0.25, 0.55],
      [-0.1, 1.0],
      [-0.4, 1.05],
      [-0.55, 0.6],
    ],
    {
      at: [0, 1.5, -2.8],
      x: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.02,
      smoothing: 1,
      color: paint((_p, _n, s) => {
        if (s[0] > -0.15) return C_CREAM;
        const k = Math.floor(s[1] / 0.2) % 3;
        return k === 0 ? C_RED : k === 1 ? C_CREAM : C_TEAL;
      }),
    },
  );

  // ---------- pilot ----------
  const px = 0, pz = -0.45;
  P(sphere(0.3, 8, 6), LEATHER, [px, 1.78, pz], { scale: [1, 0.9, 0.9] });
  P(sphere(0.21, 8, 6), SKIN, [px, 2.1, pz]);
  P(sphere(0.235, 8, 6), LEATHER, [px, 2.15, pz - 0.02], { scale: [1, 0.8, 1] });
  P(sphere(0.04, 5, 3), "#e89a78", [px, 2.08, pz + 0.21]);
  P(new THREE.TorusGeometry(0.22, 0.02, 4, 10), DARK, [px, 2.17, pz], { dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) P(sphere(0.05, 5, 3), LEATHER, [s * 0.22, 2.1, pz], { scale: [0.6, 1, 1] });
  b.extrude(
    [
      [0, 0],
      [0.5, 0.15],
      [1.1, 0.05],
      [1.7, 0.2],
      [1.7, 0.4],
      [1.1, 0.25],
      [0.5, 0.35],
      [0, 0.12],
    ],
    {
      at: [0, 1.86, pz - 0.15],
      x: [0, 0, -1],
      thickness: 0.035,
      bevel: 0.01,
      color: paint((_p, _n, s) => (Math.floor(s[0] / 0.18) % 2 ? C_GOLD : C_RED)),
    },
  );
  b.torus;
  P(sphere(0.1, 6, 4), GOLD, [px, 1.93, pz - 0.18]);

  // ---------- dog passenger ----------
  const dz = 0.75;
  P(sphere(0.28, 8, 6), "#d9a066", [0, 1.78, dz], { scale: [1, 0.9, 0.9] });
  P(sphere(0.2, 8, 6), "#d9a066", [0, 2.0, dz]);
  P(sphere(0.11, 6, 4), "#f6dcb0", [0, 1.96, dz + 0.2], { scale: [1, 0.8, 1.1] });
  P(sphere(0.045, 5, 3), DARK, [0, 1.99, dz + 0.31]);
  P(sphere(0.03, 5, 3), "#ee7090", [0, 1.88, dz + 0.28], { scale: [1, 0.6, 1] });
  P(new THREE.TorusGeometry(0.2, 0.018, 4, 10), DARK, [0, 2.07, dz], { dir: [0, 1, 0], axis: "z" });
  P(sphere(0.18, 8, 6), "#c9524a", [0, 1.8, dz - 0.3], { scale: [1, 0.2, 0.9] });

  return b.root;
}
