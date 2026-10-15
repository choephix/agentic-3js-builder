import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { paint } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { V3 } from "../../../../src/math";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby storybook barnstormer biplane: candy-red hull with teal band, striped wings, big round cowling and wheels, a goggled pilot with a streaming scarf and a teddy-bear passenger.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e8452c";
const CREAM = "#fff1cf";
const TEAL = "#2bb3b0";
const YELLOW = "#ffc933";
const LEATHER = "#8a4b2a";
const WOOD = "#b5703a";
const BRASS = "#d9a441";
const TIRE = "#3a3340";
const GLASS = "#9fe8f5";
const SKIN = "#f4b78a";
const RIB = "#e9c58a";
const PLUM = "#6d2b4f";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormerBiplane" });
  const P = (g: THREE.BufferGeometry, c: ColorInput, at: V3, o: PartOptions = {}) => b.part(g, c, { at, ...o });
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#2bb3b0"/><circle cx="50" cy="50" r="37" fill="#fff1cf"/><polygon points="50,18 58,40 82,40 63,54 70,78 50,63 30,78 37,54 18,40 42,40" fill="#ffc933" stroke="#e8452c" stroke-width="3"/><circle cx="50" cy="50" r="8" fill="#e8452c"/></svg>`,
    { size: 192 },
  );
  const BADGE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff1cf" stroke="#2bb3b0" stroke-width="7"/><text x="50" y="72" font-size="68" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#e8452c">7</text></svg>`,
    { size: 192 },
  );
  const HUB = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#fff1cf"/><g stroke="#e8452c" stroke-width="5"><line x1="32" y1="32" x2="32" y2="3"/><line x1="32" y1="32" x2="57" y2="46"/><line x1="32" y1="32" x2="7" y2="46"/></g><circle cx="32" cy="32" r="9" fill="#ffc933" stroke="#8a4b2a" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const hullPaint = cel(
    paint((p, n) => {
      if (n.y < -0.3) return CREAM;
      if (Math.abs(p.z + 0.95) < 0.008 || Math.abs(p.z - 0.25) < 0.008 || Math.abs(p.z + 2.0) < 0.008) return INK;
      if (Math.abs(p.z + 1.65) < 0.09 + 0.05 * zigzag(p.y / 0.14)) return TEAL;
      if (Math.abs(p.y - 0.98) < 0.03 && p.z > -2.4 && p.z < 1.6) return CREAM;
      return RED;
    }),
  );
  const wingPaint = (span: number, zc: number) =>
    cel(
      paint((p, n) => {
        const ax = Math.abs(p.x);
        if (Math.abs(n.y) < 0.5) return RED;
        if (ax > span - 0.55) return RED;
        const dz = p.z - zc;
        const inAil = ax > 1.3 - 0.012 && ax < span - 0.6 + 0.012 && dz < -0.25 + 0.012;
        if (inAil && (Math.abs(dz + 0.25) < 0.012 || Math.abs(ax - 1.3) < 0.012 || Math.abs(ax - (span - 0.6)) < 0.012))
          return INK;
        const f = ((ax % 0.45) + 0.45) % 0.45;
        if (f < 0.022) return RIB;
        if (dz > 0.4 - 0.05 * zigzag(p.x / 0.1)) return "#ffe08a";
        return CREAM;
      }),
    );
  const cowlPaint = cel(paint((p) => (p.z > 2.2 ? CREAM : p.z < 1.72 ? TEAL : RED)));
  const finPaint = cel(
    paint((_p, _n, s) => {
      if (s[0] < 0.45) return RED;
      const k = Math.floor(s[1] / 0.19) % 3;
      return k === 0 ? RED : k === 1 ? CREAM : TEAL;
    }),
  );
  const stabPaint = cel(paint((_p, _n, s) => (Math.abs(s[0]) > 1.0 ? TEAL : RED)));
  const bladePaint = cel(paint((_p, _n, s) => (s[0] > 0.82 ? YELLOW : WOOD)));
  const scarfPaint = cel(paint((_p, _n, s) => (Math.floor(s[0] * 14) % 2 ? CREAM : RED)));

  // ---------- fuselage ----------
  const fus = b.loft(
    [
      { at: [0, 1.35, -3.3], w: 0.12, h: 0.16 },
      { at: [0, 1.3, -2.4], w: 0.35, h: 0.5 },
      { at: [0, 1.2, -1.2], w: 0.75, h: 0.9 },
      { at: [0, 1.15, 0.0], w: 0.95, h: 1.1 },
      { at: [0, 1.12, 1.0], w: 1.05, h: 1.15 },
      { at: [0, 1.1, 1.65], w: 1.1, h: 1.15 },
    ],
    { color: hullPaint, sides: 12 },
  );
  for (const s of [1, -1])
    b.decal(fus, BADGE, { at: [s * 0.4, 1.15, -1.05], dir: [s, 0, 0], size: [0.55, 0.55] });
  // turtledeck behind pilot
  P(sph(1, 10, 8), cel(RED), [0, 1.7, -1.2], { scale: [0.3, 0.2, 0.55] });

  // ---------- cowling & engine ----------
  b.lathe(
    [
      [0, 0],
      [0.58, 0],
      [0.64, 0.12],
      [0.64, 0.45],
      [0.58, 0.65],
      [0.5, 0.75],
      [0.3, 0.78],
      [0, 0.78],
    ],
    { at: [0, 1.1, 1.6], axis: [0, 0, 1], smoothing: 1, segments: 14, color: cowlPaint },
  );
  P(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10).rotateX(Math.PI / 2), BRASS, [0, 1.1, 2.4]);
  const rivetGeos: THREE.BufferGeometry[] = [];
  for (const z of [1.76, 2.03])
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      rivetGeos.push(sph(0.022, 5, 4).translate(Math.sin(a) * 0.645, 1.1 + Math.cos(a) * 0.645, z));
    }
  b.part(mergeGeometries(rivetGeos), BRASS, { at: [0, 0, 0] });
  // cylinder heads poking around the hub
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.2;
    P(sph(0.09, 7, 5), TEAL, [Math.sin(a) * 0.42, 1.1 + Math.cos(a) * 0.42, 2.37]);
    P(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6).rotateX(Math.PI / 2), BRASS, [Math.sin(a) * 0.42, 1.1 + Math.cos(a) * 0.42, 2.45]);
  }
  // louvres and exhausts
  for (const s of [1, -1]) {
    for (const z of [1.85, 1.95, 2.05]) P(new THREE.BoxGeometry(0.03, 0.2, 0.045), INK, [s * 0.635, 1.1, z]);
    b.capsule([s * 0.62, 0.92, 2.05], [s * 0.7, 0.82, 1.35], 0.05, { color: YELLOW });
    P(sph(0.065, 6, 4), BRASS, [s * 0.62, 0.92, 2.07]);
  }
  // propeller
  const ang = 0.35;
  for (const d of [1, -1])
    b.extrude(
      [
        [0.05, -0.07],
        [0.6, -0.11],
        [1.0, -0.2],
        [1.05, 0],
        [1.0, 0.2],
        [0.6, 0.11],
        [0.05, 0.07],
      ],
      {
        at: [0, 1.1, 2.46],
        x: [d * Math.sin(ang), d * Math.cos(ang), 0],
        y: [d * Math.cos(ang), -d * Math.sin(ang), 0],
        thickness: 0.045,
        bevel: 0.012,
        color: bladePaint,
      },
    );
  b.spike([0, 1.1, 2.4], [0, 0, 1], 0.32, 0.17, { color: cel(CREAM) });
  P(sph(0.06, 6, 4), RED, [0, 1.1, 2.74]);

  // ---------- wings ----------
  const wingOutline = (span: number, chord: number): Array<[number, number]> => {
    const r = chord / 2;
    return [
      [-span, -r * 0.7],
      [-span + 0.4, -r],
      [span - 0.4, -r],
      [span, -r * 0.7],
      [span, r * 0.7],
      [span - 0.4, r],
      [-span + 0.4, r],
      [-span, r * 0.7],
    ];
  };
  b.extrude(wingOutline(3.9, 1.3), {
    at: [0, 2.3, 0.45],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.1,
    bevel: 0.03,
    smoothing: 1,
    color: wingPaint(3.9, 0.45),
  });
  b.extrude(wingOutline(3.5, 1.0), {
    at: [0, 0.85, 0.55],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.09,
    bevel: 0.028,
    smoothing: 1,
    color: wingPaint(3.5, 0.55),
  });
  // emblems on upper wing
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", [s * 2.5, 2.358, 0.4], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: EMBLEM });
    P(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", [s * 2.5, 2.242, 0.4], { dir: [0, -1, 0], axis: "z", up: [0, 0, 1], texture: EMBLEM });
    // walkway pads on lower wing
    P(new THREE.BoxGeometry(0.55, 0.012, 0.8), LEATHER, [s * 0.85, 0.9, 0.55]);
    // wingtip lights
    glow(P(sph(0.07, 6, 5), s > 0 ? "#ff4a4a" : "#4aff7a", [s * 3.95, 2.3, 0.45]), 1.5);
    // pennants
    b.rod([s * 3.7, 2.35, 0.45], [s * 3.7, 2.85, 0.45], 0.018, BRASS);
    b.extrude(
      [
        [0, 0],
        [0.5, 0.1],
        [0, 0.2],
      ],
      { at: [s * 3.7, 2.62, 0.45], x: [0, 0, -1], thickness: 0.015, color: s > 0 ? YELLOW : TEAL },
    );
    P(sph(0.03, 5, 4), RED, [s * 3.7, 2.87, 0.45]);
  }

  // ---------- struts, cabane, wires ----------
  for (const s of [1, -1]) {
    for (const x of [1.8, 3.2])
      for (const z of [0.95, 0.15]) {
        b.rod([s * x, 0.88, z], [s * (x + 0.05), 2.27, z], 0.045, WOOD);
        P(sph(0.06, 6, 4), BRASS, [s * x, 0.9, z]);
        P(sph(0.06, 6, 4), BRASS, [s * (x + 0.05), 2.24, z]);
      }
    for (const z of [0.95, 0.15]) {
      b.rod([s * 1.8, 0.9, z], [s * 3.25, 2.25, z], 0.012, INK);
      b.rod([s * 3.2, 0.9, z], [s * 1.85, 2.25, z], 0.012, INK);
      b.rod([s * 0.35, 1.6, z], [s * 1.8, 0.9, z], 0.012, INK);
    }
    b.rod([s * 0.3, 1.55, 0.9], [s * 0.7, 2.27, 0.9], 0.05, WOOD);
    b.rod([s * 0.3, 1.55, 0.2], [s * 0.6, 2.27, 0.2], 0.05, WOOD);
  }

  // ---------- tail ----------
  b.extrude(
    [
      [0, 0],
      [0.05, 0.55],
      [0.35, 0.95],
      [0.8, 0.95],
      [0.85, 0.5],
      [0.85, 0],
    ],
    { at: [0, 1.3, -2.4], x: [0, 0, -1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: finPaint },
  );
  b.extrude(
    [
      [-1.35, 0.1],
      [-1.4, 0.65],
      [-1.0, 0.85],
      [1.0, 0.85],
      [1.4, 0.65],
      [1.35, 0.1],
      [0.5, 0],
      [-0.5, 0],
    ],
    { at: [0, 1.3, -2.4], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: stabPaint },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 1.26, -2.8], [s * 0.1, 0.98, -2.8], 0.025, WOOD);
    b.rod([s * 1.3, 1.3, -2.9], [0, 2.2, -2.95], 0.01, INK);
  }
  // tail wheel
  b.rod([0, 1.15, -2.85], [0, 0.22, -3.25], 0.035, WOOD);
  P(new THREE.TorusGeometry(0.13, 0.07, 5, 10), TIRE, [0, 0.2, -3.25], { rotation: [0, 90, 0] });
  P(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8).rotateZ(Math.PI / 2), CREAM, [0, 0.2, -3.25]);

  // ---------- landing gear ----------
  b.rod([-1.0, 0.51, 1.0], [1.0, 0.51, 1.0], 0.05, BRASS);
  for (const s of [1, -1]) {
    b.rod([s * 0.35, 0.72, 1.4], [s * 0.98, 0.52, 1.0], 0.045, WOOD);
    b.rod([s * 0.35, 0.72, 0.6], [s * 0.98, 0.52, 1.0], 0.045, WOOD);
    P(new THREE.TorusGeometry(0.38, 0.13, 6, 14), TIRE, [s * 1.0, 0.51, 1.0], { rotation: [0, 90, 0] });
    P(new THREE.CylinderGeometry(0.27, 0.27, 0.22, 12).rotateZ(Math.PI / 2), CREAM, [s * 1.0, 0.51, 1.0]);
    P(new THREE.CircleGeometry(0.27, 12), "#ffffff", [s * 1.114, 0.51, 1.0], { dir: [s, 0, 0], axis: "z", texture: HUB });
    P(sph(0.07, 6, 4), YELLOW, [s * 1.0, 0.51, 1.0]);
  }

  // ---------- cockpits ----------
  const cockpit = (z: number) => {
    P(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 10), INK, [0, 1.7, z]);
    P(new THREE.TorusGeometry(0.28, 0.05, 5, 12), LEATHER, [0, 1.7, z], { rotation: [90, 0, 0] });
    P(new THREE.BoxGeometry(0.5, 0.24, 0.025), GLASS, [0, 1.86, z + 0.38], { rotation: [-20, 0, 0] });
    b.rod([-0.25, 1.72, z + 0.36], [-0.25, 1.82, z + 0.4], 0.015, BRASS);
    b.rod([0.25, 1.72, z + 0.36], [0.25, 1.82, z + 0.4], 0.015, BRASS);
  };
  cockpit(-0.55);
  cockpit(0.6);

  // pilot
  const pz = -0.55;
  P(sph(1, 10, 8), LEATHER, [0, 1.72, pz], { scale: [0.24, 0.22, 0.2] });
  P(sph(0.17, 10, 8), SKIN, [0, 2.0, pz]);
  P(new THREE.SphereGeometry(0.188, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHER, [0, 2.02, pz], { rotation: [-8, 0, 0] });
  P(new THREE.TorusGeometry(0.18, 0.018, 4, 12), LEATHER, [0, 2.04, pz], { rotation: [90, 0, 0] });
  P(sph(0.035, 5, 4), "#e8967a", [0, 1.98, pz + 0.17]);
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 8).rotateX(Math.PI / 2), BRASS, [s * 0.075, 2.03, pz + 0.165]);
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 8).rotateX(Math.PI / 2), GLASS, [s * 0.075, 2.03, pz + 0.175]);
    P(sph(0.045, 5, 4), LEATHER, [s * 0.18, 2.0, pz]);
    P(sph(0.03, 5, 4), PLUM, [s * 0.03, 1.94, pz + 0.17], { scale: [2, 0.8, 0.8] });
    b.capsule([s * 0.22, 1.78, pz], [s * 0.12, 1.8, pz + 0.25], 0.055, LEATHER);
    P(sph(0.06, 6, 5), "#5b3018", [s * 0.12, 1.8, pz + 0.27]);
  }
  b.rod([0, 1.62, pz + 0.27], [0, 1.82, pz + 0.27], 0.02, INK);
  // scarf
  const wave = (s: number) =>
    b.membrane(
      [
        [s * 0.07, 1.88, pz - 0.05],
        [s * 0.07, 1.93, pz - 0.55],
        [s * 0.09, 2.02, pz - 1.15],
        [s * 0.11, 1.98, pz - 1.75],
        [s * 0.14, 2.08, pz - 2.0],
      ].map((q) => q),
      [
        [s * 0.07, 1.88, pz - 0.05],
        [s * 0.07, 1.93, pz - 0.55],
        [s * 0.09, 2.02, pz - 1.15],
        [s * 0.11, 1.98, pz - 1.75],
        [s * 0.14, 2.08, pz - 2.0],
      ],
      { thickness: 0.01, color: scarfPaint },
    );
  void wave;
  b.membrane(
    [
      [-0.07, 1.88, pz - 0.1],
      [-0.07, 1.93, pz - 0.6],
      [-0.09, 2.02, pz - 1.2],
      [-0.11, 1.98, pz - 1.7],
      [-0.12, 2.08, pz - 1.95],
    ],
    [
      [0.07, 1.88, pz - 0.1],
      [0.07, 1.93, pz - 0.6],
      [0.09, 2.02, pz - 1.2],
      [0.11, 1.98, pz - 1.7],
      [0.12, 2.08, pz - 1.95],
    ],
    { thickness: 0.012, color: scarfPaint },
  );
  P(new THREE.TorusGeometry(0.14, 0.04, 5, 10), RED, [0, 1.88, pz], { rotation: [90, 0, 0] });

  // teddy bear passenger
  const bz = 0.6;
  const FUR = "#d9a36b";
  P(sph(1, 10, 8), FUR, [0, 1.72, bz], { scale: [0.26, 0.22, 0.22] });
  P(sph(0.2, 10, 8), FUR, [0, 1.96, bz]);
  P(sph(0.09, 8, 6), CREAM, [0, 1.92, bz + 0.17], { scale: [1.1, 0.85, 1] });
  P(sph(0.03, 5, 4), INK, [0, 1.95, bz + 0.26]);
  for (const s of [1, -1]) {
    P(sph(0.07, 6, 5), FUR, [s * 0.15, 2.13, bz]);
    P(sph(0.04, 5, 4), "#f4a3b5", [s * 0.15, 2.13, bz + 0.04]);
    P(sph(0.025, 5, 4), INK, [s * 0.075, 2.0, bz + 0.18]);
    b.capsule([s * 0.24, 1.76, bz], [s * 0.3, 1.88, bz + 0.1], 0.05, FUR);
  }
  P(new THREE.BoxGeometry(0.09, 0.05, 0.03), RED, [0.05, 1.82, bz + 0.2], { rotation: [0, 0, -15] });
  P(new THREE.BoxGeometry(0.09, 0.05, 0.03), RED, [-0.05, 1.82, bz + 0.2], { rotation: [0, 0, 15] });

  // mail sack behind pilot
  P(sph(1, 8, 6), "#c9a36a", [0, 1.78, -1.55], { scale: [0.26, 0.2, 0.28] });
  P(new THREE.ConeGeometry(0.06, 0.14, 6), "#c9a36a", [0, 1.98, -1.55]);
  b.rod([-0.08, 1.9, -1.55], [0.08, 1.9, -1.55], 0.02, RED);

  return b.root;
}
