// Dragonbone soul scythe, League of Legends style: a vertebra-ringed dragonbone shaft on a stone plinth, a dragon
// skull crowning it with an open jaw that feeds a floating soul-flame, and a big crescent blade with a glowing
// soul-edge and runes. Saturated teal/violet glow accents against ivory bone, gold and dark plum.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A tall dragonbone scythe on a stone plinth: vertebra shaft, gold fittings, a horned dragon skull with an open jaw releasing a soul-flame, and a crescent blade with a glowing soul edge and runes.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette (cel-shaded ivories, golds and plums; glow colours stay flat)
const BONE = cel(mottle("#f6ecd0", "#e8d6a8", { size: 0.06, contrast: 0.8 }));
const BONE_D = cel("#cdb685", "#8f7452");
const SHAFT = cel(grain("#f3e8cb", "#d9c595", { size: 0.02, axis: "y" }));
const TOOTH = cel("#fff8e4", "#d9c8a0");
const GOLD = cel("#f4b92f", "#b3601c");
const DARK = cel("#2c1f52", "#150e2c");
const NIGHT = cel("#171027", "#0b0716");
const LEATHER = cel(stripes("#2b1d49", "#563493", { size: 0.03, axis: "y", width: 0.5 }));
const STONE = cel(mottle("#4a4068", "#39304f", { size: 0.09, contrast: 1 }));
const CLOTH = cel("#7a34e0", "#4a1aa8");
const TEAL = "#4ff6e6";
const VIOLET = "#b36cff";
const CORE = "#e9fffb";
const ICE = "#a8fbff";

const rune = (d: string, c: string) =>
  svg(
    `<svg viewBox="0 0 32 32"><path d="${d}" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
const RUNES = [
  rune("M16 3 V29 M9 9 L16 15 L23 9 M9 21 L16 27 L23 21", TEAL),
  rune("M8 4 L24 4 L8 28 L24 28 M12 16 H20", TEAL),
  rune("M16 3 L27 16 L16 29 L5 16 Z M16 10 V22", TEAL),
];

// Blade centreline in (forward u, up v) relative to the blade hub at y = 1.9
const HUB_Y = 1.9;
const bu = (s: number) => -0.05 + 1.05 * s;
const bv = (s: number) => 0.12 - 0.5 * s * s;
const bw = (s: number) => 0.19 * Math.pow(Math.max(1 - s, 0), 0.7) * (0.45 + 0.55 * Math.sin(Math.min(s * 3, 1) * (Math.PI / 2)));
const bl = (s: number) => Math.hypot(1.05, s);
const bnu = (s: number) => s / bl(s);
const bnv = (s: number) => 1.05 / bl(s);
const btu = (s: number) => 1.05 / bl(s);
const btv = (s: number) => -s / bl(s);
const bladeAt = (s: number, o: number): [number, number] => [bu(s) + bnu(s) * bw(s) * o, bv(s) + bnv(s) * bw(s) * o];

/** Crescent band of the blade between offsets a (lower, edge side) and b (upper, spine side), in widths. */
function crescent(a: number, b: number, s0: number, s1: number, count = 14): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const tip = s1 >= 1;
  for (let i = 0; i <= count; i++) {
    const s = s0 + ((s1 - s0) * i) / count;
    const p = bladeAt(s, b);
    if (i === count && tip) pts.push([p[0], p[1], "sharp"]);
    else pts.push([p[0], p[1]]);
  }
  for (let i = count - (tip ? 1 : 0); i >= 0; i--) {
    const s = s0 + ((s1 - s0) * i) / count;
    const p = bladeAt(s, a);
    pts.push([p[0], p[1]]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const jaw = b.joint("jaw", { parent: root, at: [0, 1.9, -0.06], dir: [0, -0.2, -1], role: "jaw" });
  const charm = b.joint("charm", { parent: root, at: [0.05, 1.17, 0], dir: [0, -1, 0], role: "hinge" });
  const R = { bone: root };
  const H = [0, 1.93, -0.02];

  // ---------------------------------------------------------------- plinth
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.04],
      [0.26, 0.075],
      [0.26, 0.1],
      [0.2, 0.13],
      [0, 0.13],
    ],
    { at: [0, 0, 0], segments: 16, color: STONE, ...R, name: "plinth" },
  );
  glow(
    b.lathe(
      [
        [0.15, 0],
        [0.19, 0],
        [0.19, 0.004],
        [0.15, 0.004],
      ],
      { at: [0, 0.13, 0], segments: 16, color: VIOLET, ...R, name: "plinthRing" },
    ),
  );
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    glow(
      b.part(new THREE.SphereGeometry(0.014, 6, 4), TEAL, { at: [0.3 * Math.cos(a), 0.02, 0.3 * Math.sin(a)], ...R }),
    );
  }
  // bone claws gripping the shaft foot
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [0.17 * c, 0.115, 0.17 * s],
        [0.11 * c, 0.22, 0.11 * s],
        [0.06 * c, 0.36, 0.06 * s],
        [0.034 * c, 0.46, 0.034 * s],
      ]),
      [0.03, 0.005],
      { color: BONE, caps: { start: "flat", end: "point" }, sides: 6, ...R },
    );
    b.part(new THREE.SphereGeometry(0.026, 6, 4), BONE_D, { at: [0.17 * c, 0.13, 0.17 * s], ...R });
  }
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.045, 0.03],
      [0.032, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0.13, 0], segments: 10, color: GOLD, ...R },
  );

  // ---------------------------------------------------------------- shaft
  b.sweep(
    [
      [0, 0.1, 0],
      [0, 1.95, 0],
    ],
    0.022,
    { color: SHAFT, caps: "flat", sides: 8, ...R, name: "shaft" },
  );
  const vertebrae = [0.22, 0.3, 0.66, 0.74, 0.82, 1.1, 1.24, 1.32, 1.4, 1.48, 1.56, 1.64, 1.72];
  for (const y of vertebrae) {
    b.lathe(
      [
        [0, -0.028],
        [0.034, -0.022],
        [0.044, 0],
        [0.034, 0.022],
        [0, 0.028],
      ],
      { at: [0, y, 0], segments: 8, color: BONE_D, ...R },
    );
    for (const s of [1, -1])
      b.spike([s * 0.036, y, 0], [s, 0.4, 0], 0.055, 0.011, { color: BONE, sides: 5, ...R });
  }
  // grips
  for (const [y0, y1] of [
    [0.4, 0.6],
    [0.88, 1.06],
  ]) {
    b.sweep(
      [
        [0, y0, 0],
        [0, y1, 0],
      ],
      0.03,
      { color: LEATHER, caps: "flat", sides: 8, ...R },
    );
    for (const y of [y0, y1]) {
      b.part(new THREE.TorusGeometry(0.032, 0.007, 5, 10), GOLD, { at: [0, y, 0], rotation: [90, 0, 0], ...R });
    }
  }
  // charm ring on the shaft
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD, { at: [0, 1.17, 0], rotation: [90, 0, 0], ...R });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [0.03, 1.17, 0], ...R });

  // ---------------------------------------------------------------- skull
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.05, 0.04],
      [0.035, 0.08],
      [0, 0.08],
    ],
    { at: [0, 1.8, 0], segments: 10, color: GOLD, ...R, name: "neckCollar" },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), BONE, { at: H, scale: [0.062, 0.058, 0.085], ...R, name: "cranium" });
  // upper jaw / snout
  b.sweep(
    [
      [0, 1.925, -0.07],
      [0, 1.92, -0.18],
      [0, 1.905, -0.28],
    ],
    (t) => [0.046 - 0.02 * t, 0.04 - 0.018 * t],
    { color: BONE, sides: 8, ...R, name: "snout" },
  );
  for (const s of [1, -1]) {
    // nostrils, brow ridges, cheek flanges
    b.part(new THREE.SphereGeometry(0.007, 5, 4), NIGHT, { at: [s * 0.012, 1.93, -0.295], ...R });
    b.spike([s * 0.05, 1.962, -0.07], [s * 0.4, 0.35, -1], 0.07, 0.017, { color: BONE_D, sides: 6, ...R });
    b.spike([s * 0.058, 1.92, 0.0], [s, 0, 0.4], 0.075, 0.021, { color: BONE_D, sides: 6, ...R });
    // eyes
    b.part(new THREE.SphereGeometry(0.02, 6, 5), NIGHT, { at: [s * 0.042, 1.945, -0.085], ...R });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), TEAL, { at: [s * 0.046, 1.947, -0.095], ...R }), 1.4);
    // horns, swept up and back beside the blade root
    b.sweep(
      catmull([
        [s * 0.045, 1.97, 0.0],
        [s * 0.1, 2.02, 0.06],
        [s * 0.17, 2.1, 0.07],
        [s * 0.2, 2.21, 0.02],
      ]),
      [0.028, 0.004],
      {
        bands: [
          [0.78, BONE],
          [1, GOLD],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
        ...R,
        name: `horn${s > 0 ? "L" : "R"}`,
      },
    );
    // fangs and teeth
    b.spike([s * 0.028, 1.89, -0.15], [0, -1, 0.1], 0.055, 0.01, { color: TOOTH, sides: 5, ...R });
    for (const z of [-0.2, -0.245, -0.27])
      b.spike([s * 0.024, 1.888, z], [0, -1, 0], 0.03, 0.007, { color: TOOTH, sides: 5, ...R });
    b.spike([s * 0.026, 1.895, -0.17], [0, 1, 0], 0.035, 0.008, { color: TOOTH, sides: 5, bone: jaw });
    for (const z of [-0.21, -0.25])
      b.spike([s * 0.02, 1.887, z], [0, 1, 0], 0.026, 0.006, { color: TOOTH, sides: 5, bone: jaw });
  }
  b.sweep(
    [
      [0, 1.9, -0.06],
      [0, 1.885, -0.17],
      [0, 1.876, -0.27],
    ],
    (t) => [0.04 - 0.018 * t, 0.022 - 0.008 * t],
    { color: BONE_D, sides: 8, bone: jaw, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.016, 5, 4), GOLD, { at: [0, 1.9, -0.06], bone: jaw });
  b.pose(jaw, { axis: [1, 0, 0], deg: -20 });

  // ---------------------------------------------------------------- soul orb
  const C = [0, 1.82, -0.37];
  glow(b.part(new THREE.SphereGeometry(0.046, 10, 8), TEAL, { at: C, ...R }), 1.2);
  glow(b.part(new THREE.SphereGeometry(0.028, 8, 6), CORE, { at: C, ...R }), 1.5);
  for (const deg of [30, 150, 270]) {
    const rx = Math.cos((deg * Math.PI) / 180);
    const ry = Math.sin((deg * Math.PI) / 180);
    b.sweep(
      catmull([
        [0, 1.9, -0.27],
        [C[0] + rx * 0.07, C[1] + ry * 0.07, C[2] + 0.03],
        [C[0] + rx * 0.06, C[1] + ry * 0.06, C[2] - 0.06],
        [C[0] + rx * 0.03, C[1] + ry * 0.03, C[2] - 0.085],
      ]),
      [0.014, 0.004],
      { color: BONE, caps: { start: "flat", end: "point" }, sides: 5, ...R },
    );
  }
  glow(b.part(new THREE.TorusGeometry(0.07, 0.004, 4, 16), VIOLET, { at: C, rotation: [60, 0, 30], ...R }));
  glow(b.part(new THREE.TorusGeometry(0.08, 0.003, 4, 16), TEAL, { at: C, rotation: [-20, 70, 0], ...R }));
  for (const [x, col] of [
    [-0.03, VIOLET],
    [0, TEAL],
    [0.03, VIOLET],
  ] as const) {
    glow(
      b.sweep(
        catmull([
          [x, 1.86, -0.37],
          [x * 1.6, 1.93, -0.38],
          [x * 0.5, 2.02, -0.37],
        ]),
        [0.018, 0],
        { color: col, caps: { start: "flat", end: "point" }, sides: 5, ...R },
      ),
      1.3,
    );
  }
  for (const p of [
    [0.09, 1.78, -0.32],
    [-0.1, 1.9, -0.41],
    [0.06, 2.04, -0.3],
    [-0.07, 1.72, -0.4],
  ])
    glow(b.part(new THREE.IcosahedronGeometry(0.011, 0), p[0] > 0 ? TEAL : VIOLET, { at: p, flat: true, ...R }));

  // ---------------------------------------------------------------- blade
  const hub: [number, number, number] = [0, HUB_Y, 0];
  const plate = { at: hub, x: [0, 0, 1], y: [0, 1, 0], ...R };
  b.extrude(crescent(-0.65, 0.35, 0, 1, 16), { ...plate, thickness: 0.03, bevel: 0.003, color: BONE, name: "bladeBody" });
  b.extrude(crescent(-0.35, 0.2, 0.04, 0.9, 14), { ...plate, thickness: 0.036, color: DARK, name: "bladeInlay" });
  b.extrude(crescent(0.2, 0.27, 0.04, 0.9, 14), { ...plate, thickness: 0.04, color: GOLD, name: "goldSpine" });
  b.extrude(crescent(-0.43, -0.35, 0.04, 0.9, 14), { ...plate, thickness: 0.04, color: GOLD, name: "goldInner" });
  glow(
    b.extrude(crescent(-0.65, -0.52, 0.03, 0.985, 18), {
      ...plate,
      thickness: 0.026,
      color: ICE,
      name: "soulEdge",
    }),
    1.1,
  );
  b.extrude(crescent(-0.78, 0.5, 0, 0.09, 4), { ...plate, thickness: 0.046, color: GOLD, name: "bladeCollar" });
  // spine spurs
  for (const s of [0.18, 0.3, 0.42, 0.54, 0.66, 0.78]) {
    const p = bladeAt(s, 0.35);
    const w = bw(s);
    b.spike(
      [0, HUB_Y + p[1], p[0]],
      [0, 0.8 * bnv(s) - 0.5 * btv(s), 0.8 * bnu(s) - 0.5 * btu(s)],
      0.04 + 0.5 * w,
      0.012 + 0.05 * w,
      { color: BONE_D, sides: 5, ...R },
    );
  }
  // runes on the inlay, both faces
  [0.2, 0.35, 0.5, 0.64, 0.77].forEach((s, i) => {
    const p = bladeAt(s, -0.075);
    const size = Math.min(0.05, bw(s) * 0.7);
    for (const sx of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          at: [sx * 0.0195, HUB_Y + p[1], p[0]],
          dir: [sx, 0, 0],
          axis: "z",
          texture: RUNES[i % 3],
          ...R,
        }),
      );
  });
  // soul motes drifting off the blade
  for (const p of [
    [0.05, 1.96, 0.62],
    [-0.06, 1.8, 0.88],
    [0.04, 1.62, 1.02],
  ])
    glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), TEAL, { at: p, flat: true, ...R }));

  // ---------------------------------------------------------------- hanging soul charm
  const cb = { bone: charm };
  [1.14, 1.115, 1.09].forEach((y, i) =>
    b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 8), GOLD, {
      at: [0.05, y, 0],
      rotation: i % 2 ? [0, 90, 0] : [0, 0, 0],
      ...cb,
    }),
  );
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.026, 0.02],
      [0.012, 0.03],
      [0, 0.03],
    ],
    { at: [0.05, 1.045, 0], segments: 8, color: GOLD, ...cb },
  );
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), VIOLET, { at: [0.05, 1.02, 0], ...cb }), 1.2);
  glow(b.part(new THREE.SphereGeometry(0.015, 6, 4), CORE, { at: [0.05, 1.02, 0], ...cb }), 1.4);
  b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 10), GOLD, { at: [0.05, 1.02, 0], rotation: [90, 0, 0], ...cb });
  for (const dx of [-0.014, 0.014]) {
    b.extrude(
      [
        [-0.012, 0],
        [0.012, 0],
        [0.02, -0.2],
        [0, -0.27, "sharp"],
        [-0.02, -0.2],
      ],
      { at: [0.05 + dx, 0.99, 0], x: [1, 0, 0], thickness: 0.004, color: CLOTH, ...cb },
    );
  }

  return b.root;
}
