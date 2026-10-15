import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Part } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Anemo Sky Island",
  description:
    "A floating sky island: cel-shaded strata rock with glowing teal crystals and hanging roots, a ruined marble arch with gold trim and a hanging lantern, a rune circle, a waterfall pouring off the rim into mist, blossom, round and pine trees, a banner with tassels, flowers, grass tufts and drifting wind ribbons.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const MARBLE = "#f1ead8";
const MARBLE_D = "#cfc5ac";
const STONE = "#d9c7a3";
const STONE_L = "#ebdcbb";
const STONE_D = "#a8926f";
const MOSS = "#79c957";
const GOLD = "#f0bd3c";
const GOLD_D = "#b8821f";
const GOLD_L = "#ffe38a";
const TEAL = "#2fc7b8";
const TEAL_L = "#8ff2e4";
const TEAL_D = "#1f8c9c";
const BARK = "#8a5a44";
const BARK_D = "#5e3b2e";
const LEAF_G = "#4fae5c";
const WARM = "#ffd36b";
const WATER_HI = "#e8fbff";
const CLOUD = "#f6fbff";
const CREAM = "#fff4d6";

// Paints
const ROCK = cel(
  paint((p, n) => {
    const w = noise(p, 0.5, 5);
    const band = Math.floor(p.y * 9 + w * 2.5) % 2;
    const base = mix("#a08fb2", "#dcc59f", smoothstep(0.05, 1.3, p.y));
    const c = band ? mix(base, "#ffffff", 0.08) : mix(base, "#66587a", 0.12);
    return n.y > 0.7 && p.y > 1.2 ? "#6fb85a" : c;
  }),
);
const GRASS = cel(mottle("#8be35f", "#5fcb62", { size: 0.22, seed: 2 }));
const MARBLEP = cel(
  paint((p, n) => (n.y > 0.6 && noise(p, 0.06, 4) > 0.5 ? MOSS : mix(MARBLE, MARBLE_D, noise(p, 0.2, 2) * 0.7))),
);
const BRICK = cel(
  paint((p, n) => {
    const row = Math.floor(p.y / 0.05);
    const u = (Math.abs(n.x) > 0.5 ? p.z : p.x) + (row % 2) * 0.04;
    const fu = ((u / 0.09) % 1 + 1) % 1;
    const fv = ((p.y / 0.05) % 1 + 1) % 1;
    if (n.y > 0.6) return noise(p, 0.05, 3) > 0.45 ? MOSS : STONE_L;
    return fv < 0.12 || fu < 0.07 ? STONE_D : mix(STONE, STONE_L, noise(p, 0.06, 1));
  }),
);
const TRUNK = cel(grain(BARK, BARK_D, { size: 0.012 }));
const RIVER = cel(stripes("#6fd8ff", WATER_HI, { size: 0.05, axis: "z", width: 0.4, wobble: 0.6, seed: 4 }));
const POOL = cel(mottle("#58cbf5", "#a6ecff", { size: 0.08, seed: 6 }));
const BLOSSOM = cel(mottle("#ffb3cd", "#ffdbe8", { size: 0.1, seed: 3 }));
const ROUNDLEAF = cel(mottle("#58c466", "#8bde6b", { size: 0.12, seed: 5 }));
const PINELEAF = cel(mottle("#3f9d65", "#5cb872", { size: 0.1, seed: 8 }));
const BUSH = cel(mottle("#52b85e", "#7bd96a", { size: 0.08, seed: 9 }));
const CLOTH = cel(
  paint((_p, _n, s) => (s[1] > -0.025 || s[1] < -0.145 || s[0] < 0.02 ? GOLD : TEAL)),
);

// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 40">
  <path d="M3 40 Q7 20 2 4 Q13 18 15 40Z" fill="#4fb85a"/>
  <path d="M10 40 Q13 14 14 0 Q22 16 22 40Z" fill="#7ed957"/>
  <path d="M18 40 Q24 22 30 6 Q31 24 27 40Z" fill="#5fcb62"/>
  <path d="M13 40 Q15 24 14 8" stroke="#b6f08a" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg viewBox="0 0 32 32">
  <path d="M16 31 Q1 18 16 1 Q31 18 16 31Z" fill="#ffffff"/>
  <path d="M16 29 L16 7" stroke="#d6d6d6" stroke-width="2"/>
  <path d="M16 20 L9 14 M16 20 L23 14 M16 14 L11 9 M16 14 L21 9" stroke="#e2e2e2" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 96 },
);
const PETAL = svg(
  `<svg viewBox="0 0 32 32">
  <path d="M16 31 Q2 22 5 8 Q10 3 16 9 Q22 3 27 8 Q30 22 16 31Z" fill="#ffffff"/>
  <path d="M16 28 L16 12" stroke="#e4e4e4" stroke-width="1.6"/>
  </svg>`,
  { size: 96 },
);
const VINE = svg(
  `<svg viewBox="0 0 24 64">
  <path d="M12 0 Q8 20 13 40 Q15 52 11 62" stroke="#3f9d55" stroke-width="2.4" fill="none"/>
  <path d="M12 12 Q4 10 2 16 Q8 18 12 12Z M13 26 Q21 24 23 30 Q16 32 13 26Z M11 40 Q3 40 2 46 Q9 47 11 40Z M13 52 Q20 52 22 58 Q15 58 13 52Z" fill="#62c862"/>
  <path d="M12 12 L5 14 M13 26 L20 28" stroke="#3f9d55" stroke-width="1" fill="none"/>
  </svg>`,
  { size: 128 },
);
const RUNES = svg(
  `<svg viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="58" fill="none" stroke="#8ff2e4" stroke-width="4"/>
  <circle cx="64" cy="64" r="48" fill="none" stroke="#2fc7b8" stroke-width="3"/>
  <circle cx="64" cy="64" r="22" fill="none" stroke="#8ff2e4" stroke-width="3"/>
  <path d="M64 8 L64 30 M64 98 L64 120 M8 64 L30 64 M98 64 L120 64" stroke="#8ff2e4" stroke-width="4"/>
  <path d="M64 30 Q78 44 64 64 Q50 84 64 98" stroke="#2fc7b8" stroke-width="4" fill="none"/>
  <path d="M30 64 Q44 50 64 64 Q84 78 98 64" stroke="#2fc7b8" stroke-width="4" fill="none"/>
  <path d="M22 40 l6 6 l-6 6 M106 76 l-6 6 l6 6 M40 106 l6 -6 l6 6 M76 22 l6 6 l6 -6" stroke="#8ff2e4" stroke-width="3" fill="none"/>
  <circle cx="64" cy="64" r="6" fill="#d9fffa"/>
  </svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
  <path d="M32 32 Q38 26 36 20 Q30 12 20 16 Q10 22 14 34 Q20 48 36 46 Q52 42 50 26" stroke="#fff4d6" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="32" r="4" fill="#fff4d6"/>
  </svg>`,
  { size: 192 },
);

// Ground height of the grass cap at (x, z).
const topY = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  if (r < 0.6) return 1.64 - (0.01 * r) / 0.6;
  if (r < 1.02) return 1.63 - (0.05 * (r - 0.6)) / 0.42;
  return 1.58 - (0.08 * Math.min(r - 1.02, 0.14)) / 0.14;
};

const rockProfile: Array<[number, number]> = [
  [0, 0],
  [0.1, 0.04],
  [0.2, 0.18],
  [0.38, 0.4],
  [0.62, 0.7],
  [0.86, 1.0],
  [1.04, 1.25],
  [1.14, 1.42],
];
const rockR = (y: number) => {
  for (let i = 1; i < rockProfile.length; i++) {
    const [r0, y0] = rockProfile[i - 1];
    const [r1, y1] = rockProfile[i];
    if (y <= y1) return r0 + (r1 - r0) * Math.max(0, (y - y0) / (y1 - y0));
  }
  return 1.14;
};

export default function build() {
  const b = createBuilder({ name: "floatingIsland", paintSize: 2048 });
  const R = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });

  const put = (
    g: THREE.BufferGeometry,
    color: ColorInput,
    at: P3,
    o: { rot?: P3; scale?: number | P3; dir?: P3; bone?: Joint; flat?: boolean; name?: string } = {},
  ) =>
    b.part(g, color, { at, rotation: o.rot, scale: o.scale, dir: o.dir, bone: o.bone, flat: o.flat, name: o.name });
  const box = (w: number, h: number, d: number, color: ColorInput, at: P3, o: Parameters<typeof put>[3] = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    sides: number,
    color: ColorInput,
    at: P3,
    o: Parameters<typeof put>[3] = {},
  ) => put(new THREE.CylinderGeometry(rt, rb, h, sides), color, at, o);
  const rocklet = (at: P3, s: P3 | number, color: ColorInput, rot: P3 = [R() * 90, R() * 360, R() * 90]) =>
    put(new THREE.DodecahedronGeometry(1, 0), color, at, { scale: s, rot, flat: true });
  const glowing = (part: Part, strength = 1) => glow(part, strength);

  // Keep-outs for scattered dressing: [x, z, radius].
  const keep: Array<[number, number, number]> = [];
  const free = (x: number, z: number, pad = 0) => {
    if (Math.hypot(x, z) > 1.0) return false;
    if (x > 0.25 && Math.abs(z) < 0.16 + pad) return false;
    return !keep.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + pad);
  };

  // ------------------------------------------------------------------------------------------------------------
  // The island: strata rock, grass cap
  b.lathe([...rockProfile, [0, 1.42]], { at: [0, 0, 0], segments: 14, color: ROCK, name: "rock" });
  const grass = b.lathe(
    [
      [0, 1.64],
      [0.6, 1.63],
      [1.02, 1.58],
      [1.16, 1.5],
      [1.14, 1.42],
      [0, 1.42],
    ],
    { at: [0, 0, 0], segments: 20, color: GRASS, name: "grass" },
  );

  // Lumpy rock chunks around the hull
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + R() * 0.3;
    const y = 0.42 + (i % 4) * 0.27 + R() * 0.1;
    const r = rockR(y) * 0.92;
    const s = 0.12 + R() * 0.09;
    rocklet([Math.cos(a) * r, y, Math.sin(a) * r], [s * 1.2, s * 0.9, s * 1.1], ROCK);
  }
  // Rim boulders just under the lip
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    if (Math.abs(Math.sin(a / 2)) < 0.12) continue;
    const s = 0.07 + R() * 0.05;
    rocklet([Math.cos(a) * 1.12, 1.44, Math.sin(a) * 1.12], [s * 1.3, s, s * 1.3], ROCK);
  }

  // Hanging roots
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.35;
    if (Math.abs(Math.sin(a / 2)) < 0.15) continue;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const pt = (y: number, out: number): P3 => [c * (rockR(y) + out), y, s * (rockR(y) + out)];
    b.sweep(catmull([pt(1.4, 0.03), pt(1.18, 0.07), pt(0.92, 0.04), pt(0.66 - R() * 0.1, 0.02)]), [0.03, 0.004], BARK_D, {
      sides: 5,
      caps: "point",
      name: "root",
    });
  }

  // Underside crystals
  const crystal = (a: number, y: number, len: number, r: number, color: string, strength = 1.3) => {
    const dir: P3 = [Math.cos(a) * 0.6, -0.7, Math.sin(a) * 0.6];
    const l = Math.hypot(...dir);
    const d: P3 = [dir[0] / l, dir[1] / l, dir[2] / l];
    const rr = rockR(y);
    const at: P3 = [
      Math.cos(a) * rr + d[0] * len * 0.35,
      y + d[1] * len * 0.35,
      Math.sin(a) * rr + d[2] * len * 0.35,
    ];
    return glowing(put(new THREE.OctahedronGeometry(1, 0), color, at, { scale: [r, len, r], dir: d, flat: true }), strength);
  };
  const cl: Array<[number, number, number, number]> = [
    [0.9, 0.82, 0.2, 0.06],
    [1.15, 0.78, 0.13, 0.04],
    [0.7, 0.9, 0.12, 0.04],
    [3.1, 0.95, 0.22, 0.065],
    [3.35, 0.9, 0.12, 0.04],
    [4.4, 0.7, 0.18, 0.055],
    [4.65, 0.78, 0.11, 0.035],
    [5.5, 1.05, 0.17, 0.05],
    [2.1, 0.6, 0.14, 0.045],
  ];
  cl.forEach(([a, y, len, r], i) => crystal(a, y, len, r, i % 3 === 0 ? TEAL_L : TEAL));

  // ------------------------------------------------------------------------------------------------------------
  // Ruins
  const C: [number, number] = [-0.325, -0.3];
  const PLAT = topY(C[0], C[1]) - 0.05;
  const PTOP = PLAT + 0.09;
  keep.push([C[0], C[1], 0.55]);
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.05],
      [0.44, 0.09],
      [0, 0.09],
    ],
    { at: [C[0], PLAT, C[1]], segments: 6, color: MARBLEP, name: "platform" },
  );
  glowing(
    b.lathe(
      [
        [0.34, 0.085],
        [0.37, 0.085],
        [0.37, 0.098],
        [0.34, 0.098],
      ],
      { at: [C[0], PLAT, C[1]], segments: 24, color: GOLD, name: "goldRing" },
    ),
    0.35,
  );
  glowing(
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      at: [C[0], PTOP + 0.004, C[1]],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNES,
      name: "runeCircle",
    }),
    1.2,
  );
  // Platform edge studs
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    cyl(0.018, 0.018, 0.02, 6, GOLD, [C[0] + Math.cos(a) * 0.425, PLAT + 0.088, C[1] + Math.sin(a) * 0.425]);
  }

  const column = (x: number, z: number, h: number, broken: boolean) => {
    const y = PTOP;
    box(0.17, 0.04, 0.17, MARBLEP, [x, y + 0.02, z]);
    cyl(0.068, 0.068, 0.014, 8, GOLD, [x, y + 0.047, z]);
    cyl(0.05, 0.06, h, 8, MARBLEP, [x, y + 0.054 + h / 2, z]);
    // fluting ribs
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      box(0.012, h * 0.8, 0.012, MARBLE_D, [x + Math.cos(a) * 0.056, y + 0.054 + h / 2, z + Math.sin(a) * 0.056], {
        rot: [0, (-a * 180) / Math.PI, 0],
      });
    }
    const top = y + 0.054 + h;
    if (!broken) {
      cyl(0.058, 0.058, 0.014, 8, GOLD, [x, top - 0.01, z]);
      cyl(0.078, 0.055, 0.045, 8, MARBLEP, [x, top + 0.022, z]);
      box(0.17, 0.035, 0.17, MARBLEP, [x, top + 0.058, z]);
      box(0.18, 0.012, 0.18, GOLD, [x, top + 0.081, z]);
      for (const sx of [-1, 1]) cyl(0.014, 0.014, 0.014, 6, TEAL, [x + sx * 0.087, top + 0.058, z], { rot: [0, 0, 90] });
    } else {
      rocklet([x, top - 0.005, z], [0.062, 0.04, 0.062], MARBLE, [10, 40, 12]);
      rocklet([x + 0.03, top + 0.02, z - 0.01], [0.03, 0.03, 0.03], MARBLE_D);
    }
    return top;
  };
  const X1 = C[0] - 0.225;
  const X2 = C[0] + 0.225;
  const top1 = column(X1, C[1], 0.6, false);
  column(X2, C[1], 0.34, true);

  // Broken arch springing from the full column
  const archPts: P3[] = [180, 160, 140, 120, 105, 90, 75, 60, 50].map((deg) => {
    const t = (deg * Math.PI) / 180;
    return [C[0] + 0.225 * Math.cos(t), top1 + 0.085 + 0.2 * Math.sin(t), C[1]];
  });
  b.sweep(catmull(archPts), 0.045, MARBLEP, { section: "box", caps: "flat", name: "arch" });
  const apexY = top1 + 0.085 + 0.2;
  box(0.075, 0.025, 0.11, GOLD, [C[0], apexY + 0.05, C[1]]);
  box(0.04, 0.05, 0.11, TEAL, [C[0], apexY + 0.025, C[1]]);
  // gold bands on the arch
  for (const deg of [150, 125, 70]) {
    const t = (deg * Math.PI) / 180;
    box(0.02, 0.1, 0.1, GOLD, [C[0] + 0.225 * Math.cos(t), top1 + 0.085 + 0.2 * Math.sin(t), C[1]], {
      rot: [0, 0, deg - 90],
    });
  }
  // Hanging lantern on a hinge
  const lanternJ = b.joint("lantern", { parent: root, at: [C[0], apexY - 0.05, C[1]], dir: [0, -1, 0], role: "hinge" });
  const ly = apexY - 0.05;
  put(new THREE.SphereGeometry(0.014, 6, 4), GOLD, [C[0], ly, C[1]], { bone: lanternJ });
  b.rod([C[0], ly, C[1]], [C[0], ly - 0.09, C[1]], 0.004, GOLD_D, { sides: 4, bone: lanternJ });
  cyl(0.02, 0.05, 0.03, 6, GOLD, [C[0], ly - 0.105, C[1]], { bone: lanternJ });
  glowing(cyl(0.045, 0.045, 0.08, 6, WARM, [C[0], ly - 0.16, C[1]], { bone: lanternJ }), 1.5);
  cyl(0.052, 0.052, 0.012, 6, GOLD, [C[0], ly - 0.21, C[1]], { bone: lanternJ });
  put(new THREE.ConeGeometry(0.03, 0.05, 6), GOLD_D, [C[0], ly - 0.24, C[1]], { bone: lanternJ, rot: [180, 0, 0] });
  put(new THREE.SphereGeometry(0.012, 6, 4), TEAL, [C[0], ly - 0.275, C[1]], { bone: lanternJ });

  // Tassels
  const tassel = (x: number, y: number, z: number, len = 0.09) => {
    put(new THREE.SphereGeometry(0.016, 6, 4), GOLD, [x, y, z]);
    b.rod([x, y, z], [x, y - 0.03, z], 0.004, GOLD_D, { sides: 4 });
    cyl(0.012, 0.022, 0.05, 6, TEAL, [x, y - 0.055, z]);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      b.spike([x + Math.cos(a) * 0.015, y - 0.075, z + Math.sin(a) * 0.015], [0, -1, 0], len, 0.0045, GOLD_L, {
        sides: 3,
      });
    }
  };
  tassel(X1 + 0.09, top1 + 0.04, C[1] + 0.02);
  tassel(C[0] + 0.225 * Math.cos((50 * Math.PI) / 180), top1 + 0.085 + 0.2 * Math.sin((50 * Math.PI) / 180) - 0.05, C[1], 0.07);

  // Rubble and a fallen drum
  rocklet([X2 + 0.08, PTOP + 0.03, C[1] + 0.1], [0.07, 0.04, 0.06], MARBLE);
  rocklet([X2 - 0.05, PTOP + 0.025, C[1] + 0.14], [0.04, 0.03, 0.04], MARBLE_D);
  rocklet([X2 + 0.16, PTOP + 0.02, C[1] - 0.05], [0.035, 0.03, 0.04], STONE);
  cyl(0.05, 0.05, 0.14, 8, MARBLEP, [C[0] + 0.02, PTOP + 0.05, C[1] + 0.27], { rot: [0, 0, 90] });
  cyl(0.052, 0.052, 0.014, 8, GOLD, [C[0] - 0.05, PTOP + 0.05, C[1] + 0.27], { rot: [0, 0, 90] });
  // Back wall fragments
  box(0.5, 0.2, 0.06, BRICK, [C[0] - 0.02, topY(C[0], C[1] - 0.36) + 0.08, C[1] - 0.36]);
  box(0.16, 0.34, 0.06, BRICK, [C[0] - 0.33, topY(C[0], C[1] - 0.36) + 0.15, C[1] - 0.36]);
  box(0.18, 0.06, 0.07, STONE_L, [C[0] - 0.33, topY(C[0], C[1] - 0.36) + 0.34, C[1] - 0.36]);
  box(0.52, 0.025, 0.075, GOLD_D, [C[0] - 0.02, topY(C[0], C[1] - 0.36) + 0.19, C[1] - 0.36]);
  for (const dx of [-0.2, 0.05, 0.2]) {
    const sx = C[0] + dx;
    put(new THREE.IcosahedronGeometry(0.04, 0), MOSS, [sx, topY(sx, C[1] - 0.36) + 0.21, C[1] - 0.36], {
      scale: [1.2, 0.6, 1],
      flat: true,
    });
  }
  // Steps in front of the platform
  for (let k = 0; k < 3; k++)
    box(0.34 - k * 0.04, 0.035, 0.09, k % 2 ? MARBLEP : BRICK, [C[0], PLAT + 0.0175 + 0 - k * 0.0, C[1] + 0.49 + k * 0.08 - 0.0], {
      scale: 1,
    });

  // ------------------------------------------------------------------------------------------------------------
  // Pond, river and waterfall
  keep.push([0.14, 0, 0.33]);
  const pondY = topY(0.14, 0) - 0.01;
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.27, 0.02],
      [0, 0.02],
    ],
    { at: [0.14, pondY, 0], segments: 14, color: POOL, name: "pond" },
  );
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    if (Math.cos(a) > 0.85) continue;
    const s = 0.035 + R() * 0.025;
    rocklet([0.14 + Math.cos(a) * 0.285, pondY + 0.02, Math.sin(a) * 0.285], [s * 1.3, s, s * 1.2], k % 2 ? STONE : STONE_L);
  }
  // lily pads
  for (const [lx, lz] of [
    [0.08, 0.08],
    [0.2, -0.1],
    [0.0, -0.05],
  ])
    cyl(0.04, 0.04, 0.006, 8, "#58c466", [lx, pondY + 0.022, lz]);
  put(new THREE.SphereGeometry(0.014, 5, 4), "#ff9cc2", [0.08, pondY + 0.03, 0.08]);

  const riverPts: P3[] = [
    [0.3, 1.655, 0],
    [0.75, 1.64, 0],
    [1.0, 1.605, 0],
    [1.15, 1.55, 0],
    [1.23, 1.42, 0],
    [1.25, 1.1, 0],
    [1.25, 0.6, 0],
    [1.24, 0.22, 0],
  ];
  b.sweep(catmull(riverPts), (t) => [0.09 - 0.035 * t, 0.02], {
    section: "box",
    caps: "flat",
    color: RIVER,
    up: [0, 1, 0],
    name: "river",
  });
  for (const dz of [-0.088, 0.088])
    b.sweep(catmull(riverPts.map((p): P3 => [p[0], p[1], p[2] + dz])), 0.008, WATER_HI, {
      sides: 4,
      caps: "round",
      name: "foam",
    });
  // river bank rocks
  for (let k = 0; k < 9; k++) {
    const x = 0.4 + k * 0.095;
    const z = (k % 2 ? 1 : -1) * (0.12 + R() * 0.03);
    const s = 0.025 + R() * 0.02;
    rocklet([x, topY(x, z) + s * 0.4, z], [s * 1.3, s, s * 1.1], k % 3 ? STONE : STONE_D);
  }
  // lip rocks and spray
  rocklet([1.1, 1.56, 0.17], [0.06, 0.05, 0.05], STONE_D);
  rocklet([1.1, 1.56, -0.17], [0.055, 0.045, 0.05], STONE);
  put(new THREE.IcosahedronGeometry(1, 1), WATER_HI, [1.2, 1.5, 0], { scale: [0.04, 0.03, 0.09], flat: true });
  // mist at the base of the fall
  const mist: Array<[number, number, number, number]> = [
    [1.24, 0.17, 0.0, 0.11],
    [1.34, 0.2, 0.09, 0.08],
    [1.12, 0.22, -0.08, 0.09],
    [1.28, 0.25, -0.1, 0.07],
    [1.18, 0.14, 0.1, 0.07],
    [1.4, 0.15, -0.03, 0.06],
  ];
  for (const [mx, my, mz, ms] of mist) put(new THREE.IcosahedronGeometry(1, 1), CLOUD, [mx, my, mz], { scale: ms, flat: true });
  for (let k = 0; k < 9; k++) {
    const y = 0.35 + R() * 1.0;
    put(new THREE.SphereGeometry(0.012 + R() * 0.008, 5, 4), "#bdefff", [1.25 + (R() - 0.5) * 0.14, y, (R() - 0.5) * 0.2]);
  }
  // little rainbow-ish glow arc over the mist
  glowing(
    b.sweep(
      catmull([
        [1.1, 0.2, -0.2],
        [1.3, 0.55, -0.22],
        [1.52, 0.2, -0.2],
      ]),
      (t) => 0.002 + 0.01 * Math.sin(Math.PI * t),
      TEAL_L,
      { sides: 4, caps: "point", name: "mistGlow" },
    ),
    0.8,
  );

  // ------------------------------------------------------------------------------------------------------------
  // Trees
  const growTree = (
    x: number,
    z: number,
    h: number,
    leaf: ColorInput,
    cardTex: typeof LEAF,
    cardTint: string,
    seed: number,
    blobCount: number,
    rad: number,
  ) => {
    const y0 = topY(x, z);
    keep.push([x, z, 0.16]);
    const r2 = rng(seed);
    const pts: P3[] = [
      [x, y0 - 0.03, z],
      [x - 0.03, y0 + h * 0.3, z + 0.03],
      [x + 0.03, y0 + h * 0.62, z],
      [x, y0 + h, z - 0.02],
    ];
    b.sweep(catmull(pts), [0.075, 0.055, 0.04, 0.028], TRUNK, { sides: 7, caps: "round", name: "trunk" });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + seed;
      b.spike([x + Math.cos(a) * 0.04, y0 + 0.06, z + Math.sin(a) * 0.04], [Math.cos(a), -0.3, Math.sin(a)], 0.17, 0.035, BARK, {
        sides: 5,
      });
    }
    const blobs: Part[] = [];
    for (let i = 0; i < blobCount; i++) {
      const a = (i / blobCount) * Math.PI * 2 + r2() * 0.6;
      const d = i === 0 ? 0 : rad * 1.0 * (0.8 + 0.4 * r2());
      const dy = i === 0 ? 0.09 : (r2() - 0.35) * rad * 0.9;
      const s = rad * (0.75 + 0.4 * r2());
      const c: P3 = [x + Math.cos(a) * d, y0 + h + 0.05 + dy, z + Math.sin(a) * d];
      blobs.push(put(new THREE.IcosahedronGeometry(1, 1), leaf, c, { scale: [s, s * 0.82, s], flat: true, name: "canopy" }));
      if (i > 0)
        b.sweep([[x, y0 + h * 0.8, z], [c[0] - Math.cos(a) * s * 0.4, c[1] - s * 0.4, c[2] - Math.sin(a) * s * 0.4]], [0.024, 0.01], BARK, {
          sides: 5,
        });
    }
    const hits = b.surface(blobs).scatter(70, { rng: rng(seed + 1), minDist: 0.05, filter: (hh) => hh.n.y > -0.3 });
    b.cards(hits, cardTex, {
      size: [0.1, 0.1],
      lean: 55,
      bend: 20,
      vary: 0.3,
      spin: 180,
      rng: rng(seed + 2),
      color: cardTint,
      name: "leaves",
    });
    return blobs;
  };
  growTree(-0.72, 0.3, 0.62, BLOSSOM, PETAL, "#ff9fc2", 21, 8, 0.2);
  growTree(0.3, -0.55, 0.5, ROUNDLEAF, LEAF, "#7fd86a", 31, 7, 0.17);
  // pine
  {
    const x = 0.62;
    const z = 0.52;
    const y0 = topY(x, z);
    keep.push([x, z, 0.17]);
    b.rod([x, y0 - 0.03, z], [x, y0 + 0.22, z], [0.04, 0.028], TRUNK, { sides: 6 });
    for (let k = 0; k < 4; k++) {
      const r = 0.2 - k * 0.04;
      const hh = 0.2 - k * 0.02;
      put(new THREE.ConeGeometry(r, hh, 7), PINELEAF, [x, y0 + 0.2 + k * 0.13 + hh / 2, z], {
        flat: true,
        rot: [0, k * 25, 0],
        name: "pineTier",
      });
      cyl(r * 0.5, r * 0.5, 0.01, 7, "#2d7d52", [x, y0 + 0.2 + k * 0.13 + 0.005, z]);
    }
    put(new THREE.OctahedronGeometry(0.03, 0), GOLD, [x, y0 + 0.2 + 3 * 0.13 + 0.2, z], { flat: true });
  }
  // small round tree near the front
  growTree(0.08, 0.72, 0.3, ROUNDLEAF, LEAF, "#7fd86a", 41, 5, 0.12);

  // Bushes with flowers
  const bush = (x: number, z: number, s: number, flower: string) => {
    keep.push([x, z, s * 1.2]);
    const y = topY(x, z);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + R();
      const rr = k === 0 ? 0 : s * 0.7;
      const sz = s * (0.8 + R() * 0.3);
      put(new THREE.IcosahedronGeometry(1, 1), BUSH, [x + Math.cos(a) * rr, y + sz * 0.5, z + Math.sin(a) * rr], {
        scale: [sz, sz * 0.8, sz],
        flat: true,
        name: "bush",
      });
    }
    const dots: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const a = R() * Math.PI * 2;
      const e = 0.3 + R() * 0.8;
      dots.push(
        new THREE.SphereGeometry(0.016, 5, 4).translate(
          x + Math.cos(a) * s * 1.1 * Math.cos(e),
          y + s * 0.5 + Math.sin(e) * s * 0.8,
          z + Math.sin(a) * s * 1.1 * Math.cos(e),
        ),
      );
    }
    const g = mergeGeometries(dots);
    if (g) b.part(g, flower, { bone: root, at: [0, 0, 0], name: "bushFlowers" });
  };
  bush(-0.2, 0.55, 0.09, "#fff6e0");
  bush(-0.95, -0.1, 0.1, "#ff8fb6");
  bush(0.7, -0.25, 0.09, "#ffd84a");
  bush(-0.5, -0.82, 0.08, "#fff6e0");
  bush(0.52, 0.2, 0.07, "#7fd6ff");

  // ------------------------------------------------------------------------------------------------------------
  // Props: stone lantern, bench, banner, stepping stones, mushrooms
  {
    const x = -0.45;
    const z = 0.68;
    keep.push([x, z, 0.12]);
    const y = topY(x, z);
    cyl(0.06, 0.07, 0.04, 6, STONE, [x, y + 0.01, z]);
    cyl(0.022, 0.026, 0.12, 6, STONE_L, [x, y + 0.09, z]);
    cyl(0.055, 0.045, 0.02, 6, STONE, [x, y + 0.16, z]);
    glowing(box(0.06, 0.06, 0.06, WARM, [x, y + 0.2, z]), 1.5);
    put(new THREE.ConeGeometry(0.08, 0.06, 6), STONE, [x, y + 0.26, z], { flat: true });
    put(new THREE.SphereGeometry(0.014, 5, 4), GOLD, [x, y + 0.3, z]);
  }
  {
    const x = -0.28;
    const z = 0.55;
    keep.push([x, z, 0.2]);
    const y = topY(x, z);
    box(0.3, 0.03, 0.1, MARBLE, [x, y + 0.075, z]);
    box(0.32, 0.01, 0.11, GOLD, [x, y + 0.095, z]);
    for (const dx of [-0.12, 0.12]) box(0.03, 0.07, 0.09, MARBLEP, [x + dx, y + 0.035, z]);
  }
  // Banner on a hinge
  {
    const px = 0.55;
    const pz = -0.2;
    keep.push([px, pz, 0.15]);
    const y = topY(px, pz);
    const ty = y + 0.55;
    cyl(0.035, 0.045, 0.04, 6, STONE, [px, y + 0.01, pz]);
    b.rod([px, y, pz], [px, ty, pz], 0.012, BARK, { sides: 6 });
    put(new THREE.SphereGeometry(0.022, 6, 4), GOLD, [px, ty + 0.02, pz]);
    cyl(0.018, 0.018, 0.015, 6, GOLD, [px, ty - 0.03, pz]);
    const bannerJ = b.joint("banner", { parent: root, at: [px, ty - 0.01, pz], dir: [1, 0, 0], role: "hinge" });
    b.rod([px, ty - 0.01, pz], [px + 0.33, ty - 0.01, pz], 0.008, GOLD_D, { sides: 5, bone: bannerJ });
    b.extrude(
      [
        [0, 0],
        [0.3, -0.03],
        [0.26, -0.1],
        [0.3, -0.17],
        [0, -0.17],
      ],
      { at: [px, ty - 0.02, pz], x: [1, 0, 0], thickness: 0.008, color: CLOTH, bone: bannerJ, name: "bannerCloth" },
    );
    for (const sgn of [1, -1])
      b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
        at: [px + 0.15, ty - 0.105, pz + sgn * 0.006],
        dir: [0, 0, sgn],
        axis: "z",
        texture: EMBLEM,
        bone: bannerJ,
        name: "emblem",
      });
    for (let k = 0; k < 3; k++) {
      const tx = px + 0.07 + k * 0.08;
      b.spike([tx, ty - 0.2, pz], [0, -1, 0], 0.07, 0.007, GOLD_L, { sides: 3, bone: bannerJ });
    }
    put(new THREE.SphereGeometry(0.015, 5, 4), GOLD, [px + 0.33, ty - 0.01, pz], { bone: bannerJ });
  }
  // Stepping stones
  {
    const path = catmull([
      [0.12, 0, 0.98],
      [0.2, 0, 0.62],
      [0.02, 0, 0.38],
      [-0.2, 0, 0.24],
    ]);
    for (let k = 0; k < 8; k++) {
      const p = path.at((k + 0.5) / 8);
      keep.push([p.x, p.z, 0.08]);
      const r = 0.055 + R() * 0.02;
      cyl(r, r + 0.008, 0.03, 7, k % 2 ? STONE_L : STONE, [p.x, topY(p.x, p.z) + 0.0, p.z], { flat: true });
    }
  }
  // Glow mushrooms
  const shroom = (x: number, z: number, s: number) => {
    keep.push([x, z, 0.06]);
    const y = topY(x, z);
    cyl(0.01 * s, 0.014 * s, 0.05 * s, 5, CREAM, [x, y + 0.02 * s, z]);
    glowing(
      put(new THREE.SphereGeometry(0.035 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), TEAL, [x, y + 0.045 * s, z], {
        flat: true,
      }),
      1.2,
    );
  };
  shroom(-0.9, 0.5, 1.2);
  shroom(-0.84, 0.44, 0.8);
  shroom(-0.95, 0.42, 0.6);
  shroom(0.18, -0.62, 1.0);
  shroom(0.12, -0.67, 0.7);

  // ------------------------------------------------------------------------------------------------------------
  // Flowers (merged by colour)
  {
    const heads: Record<string, THREE.BufferGeometry[]> = {
      "#fff6e0": [],
      "#ffd84a": [],
      "#ff8fb6": [],
      "#7fd6ff": [],
    };
    const colors = Object.keys(heads);
    const stems: THREE.BufferGeometry[] = [];
    let count = 0;
    for (let i = 0; i < 500 && count < 70; i++) {
      const a = R() * Math.PI * 2;
      const r = Math.sqrt(R()) * 0.98;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!free(x, z)) continue;
      const y = topY(x, z);
      stems.push(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 3).translate(x, y + 0.02, z));
      heads[colors[count % 4]].push(new THREE.SphereGeometry(0.02, 5, 4).translate(x, y + 0.055, z));
      count++;
    }
    const sg = mergeGeometries(stems);
    if (sg) b.part(sg, LEAF_G, { bone: root, at: [0, 0, 0], name: "stems" });
    for (const c of colors) {
      const g = mergeGeometries(heads[c]);
      if (g) b.part(g, c, { bone: root, at: [0, 0, 0], name: "flowers" });
    }
  }

  // Grass tufts and hanging vines
  {
    const hits = b.surface(grass).scatter(260, {
      rng: rng(77),
      minDist: 0.055,
      filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z, -0.05),
    });
    b.cards(hits, TUFT, { size: [0.07, 0.09], vary: 0.4, spin: 180, cross: true, rng: rng(78), name: "tufts" });
    const frames = [];
    for (let i = 0; i < 52; i++) {
      const a = (i / 52) * Math.PI * 2;
      if (Math.cos(a) > 0.93) continue;
      frames.push(frame([Math.cos(a) * 1.15, 1.495, Math.sin(a) * 1.15], [0, 1, 0]));
    }
    b.cards(frames, VINE, { size: [0.07, 0.16], lean: 180, flow: [0, 0, 1], vary: 0.4, cross: true, rng: rng(79), name: "vines" });
    // fallen petals on the ground near the blossom tree
    const petals = [];
    for (let i = 0; i < 26; i++) {
      const a = R() * Math.PI * 2;
      const d = 0.08 + R() * 0.3;
      const x = -0.72 + Math.cos(a) * d;
      const z = 0.3 + Math.sin(a) * d;
      if (Math.hypot(x, z) > 1.0) continue;
      petals.push(frame([x, topY(x, z) + 0.002, z], [0, 1, 0]));
    }
    b.cards(petals, PETAL, {
      size: 0.035,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      mirror: true,
      color: "#ffb3cd",
      name: "petalsGround",
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Floating fragments and wind ribbons
  const fragment = (x: number, y: number, z: number, s: number, withTree: boolean) => {
    rocklet([x, y, z], [s * 1.3, s * 0.8, s * 1.2], ROCK);
    rocklet([x + s * 0.2, y - s * 0.7, z - s * 0.1], [s * 0.7, s * 0.7, s * 0.6], ROCK);
    cyl(s * 1.1, s * 1.2, s * 0.25, 8, GRASS, [x, y + s * 0.65, z], { flat: true });
    glowing(put(new THREE.OctahedronGeometry(1, 0), TEAL_L, [x - s * 0.1, y - s * 1.3, z], { scale: [s * 0.3, s * 0.7, s * 0.3], flat: true }), 1.3);
    if (withTree) {
      cyl(s * 0.12, s * 0.16, s * 1.0, 5, BARK, [x, y + s * 1.2, z]);
      put(new THREE.IcosahedronGeometry(1, 1), BLOSSOM, [x, y + s * 2.0, z], { scale: s * 0.8, flat: true });
    }
  };
  fragment(-1.4, 0.95, 0.55, 0.14, true);
  fragment(1.35, 1.55, -0.75, 0.11, false);
  fragment(-1.1, 1.85, -0.7, 0.085, false);
  fragment(0.45, 0.62, 1.45, 0.1, false);
  fragment(-0.2, 2.1, 1.0, 0.07, false);
  fragment(0.9, 0.7, -1.2, 0.08, false);

  const wisp = (r: number, y0: number, a0: number, span: number, rise: number) => {
    const pts: P3[] = [];
    for (let k = 0; k <= 8; k++) {
      const a = a0 + (span * k) / 8;
      pts.push([Math.cos(a) * r, y0 + (rise * k) / 8 + Math.sin(k) * 0.02, Math.sin(a) * r]);
    }
    glowing(
      b.sweep(catmull(pts), (t) => 0.002 + 0.012 * Math.sin(Math.PI * t), TEAL_L, { sides: 4, caps: "point", name: "windRibbon" }),
      1,
    );
  };
  wisp(1.5, 1.0, 1.0, 1.4, 0.3);
  wisp(1.6, 1.7, 3.0, 1.5, -0.25);
  wisp(1.45, 0.8, 4.2, 1.3, 0.35);
  wisp(1.35, 2.0, 5.2, 1.1, 0.1);

  return b.root;
}
