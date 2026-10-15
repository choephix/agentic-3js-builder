```ts
import * as THREE from "three";
import {
  catmull,
  cells,
  createBuilder,
  frame,
  grain,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  spiral,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Rimefang Cleaver",
  description:
    "A frost-forged Freljord battle axe: double crescent blades of blue-white steel with glowing rune plates, a crystal spear crown, fur-wrapped leather haft, bone-tooth collar, tattered pennant and hanging charms. Painterly League of Legends style.",
};

type Col = string | ReturnType<typeof paint>;

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const HY = 1.22; // head centre height
const GLOWC = "#6fe6ff";
const BONE = "#efe6d0";
const CORD = "#5a3a28";

const IRON = paint((p, n) => {
  let c = mix("#232b3e", "#5a6f8c", noise(p, 0.05, 3) * 0.85);
  c = mix(c, "#10142a", smoothstep(0.55, 0.8, noise(p, 0.025, 8)) * 0.5);
  const rime = smoothstep(0.5, 1, n.y) * smoothstep(0.35, 0.65, noise(p, 0.03, 5));
  return mix(c, "#e6f6ff", rime * 0.85);
});

const BRONZE = paint((p, n) => {
  const c = mix("#6a431f", "#bb853a", noise(p, 0.03, 7));
  return mix(c, "#f6dc92", smoothstep(0.6, 1, n.y) * 0.5);
});

const WOOD_GRAIN = grain("#2f252c", "#5f4f58", { size: 0.008, axis: "y" });
const WOOD = paint((p, n) => {
  const base = WOOD_GRAIN.at(p, n);
  const f = smoothstep(0.55, 0.75, noise(p, 0.04, 6) + (p.y - 0.6) * 0.35);
  return mix(base, "#e3f4ff", f * 0.7);
});

const LEATHER = paint((p, n) => mix("#3d2519", "#704833", noise(p, 0.025, 3) * 0.8 + 0.2 * smoothstep(0.3, 1, n.y)));
const FURC = paint((p) => mix("#aebbd0", "#f1f7ff", noise(p, 0.025, 12)));

const ICE = paint((p, n) => {
  const t = 0.55 * smoothstep(-0.4, 0.9, n.y) + 0.45 * noise(p, 0.035, 3);
  return mix("#3a86c8", "#e6fbff", t);
});

const TRIM = paint((_p, _n, s) => {
  const u = Math.abs((((s[1] / 36) % 1) + 1) % 1 * 2 - 1);
  const v = Math.abs((((s[0] / 0.018) % 1) + 1) % 1 * 2 - 1);
  return u + v < 0.85 ? BRONZE : IRON;
});

const edgeX = (y: number) => {
  const a = Math.abs(y);
  return a < 0.2 ? 0.3 + 0.15 * a : 0.33 + 0.5625 * (a - 0.2);
};

const BLADE = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.55) return mix("#a9d8ee", "#eefcff", noise(p, 0.03, 4));
  const d = edgeX(s[1]) - s[0];
  if (d < 0.012) return "#ffffff";
  if (d < 0.04) return mix("#f0fdff", "#5fb7e0", (d - 0.012) / 0.028);
  const c = cells(p, 0.07, 5);
  const crack = smoothstep(0.05, 0.0, c.d2 - c.d1);
  const t = 1 - smoothstep(0.04, 0.3, d);
  const deep = mix("#1a2c52", "#3f8cc4", t * 0.8 + noise(p, 0.06, 2) * 0.2);
  return mix(deep, "#bfe8ff", crack * 0.55);
});

const PLATEP = paint((p, n) =>
  Math.abs(n.z) < 0.55 ? "#566f8c" : mix("#6c88a8", "#d2e6f6", noise(p, 0.05, 9)),
);

const SPEARP = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.5) return "#cdeefa";
  if (Math.abs(s[0]) < 0.011) return "#f5feff";
  return mix("#58aee0", "#d4f4ff", Math.min(1, s[1] / 0.38) * 0.7 + noise(p, 0.04, 2) * 0.3);
});

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const BL: OutlinePoint[] = [
  [0.05, 0.08],
  [0.15, 0.13],
  [0.26, 0.2],
  [0.35, 0.29],
  [0.43, 0.37, "sharp"],
  [0.33, 0.2],
  [0.3, 0.0],
  [0.33, -0.2],
  [0.43, -0.37, "sharp"],
  [0.35, -0.29],
  [0.26, -0.2],
  [0.15, -0.13],
  [0.05, -0.08],
];
const PLATE: OutlinePoint[] = [
  [0.05, 0.065],
  [0.15, 0.115],
  [0.235, 0.168],
  [0.26, 0.1],
  [0.26, -0.1],
  [0.235, -0.168],
  [0.15, -0.115],
  [0.05, -0.065],
];
const INLAY = [
  [0.39, 0.31],
  [0.31, 0.19],
  [0.275, 0.0],
  [0.31, -0.19],
  [0.39, -0.31],
];
const SPEAR: OutlinePoint[] = [
  [-0.04, 0],
  [-0.046, 0.06],
  [-0.032, 0.17],
  [0, 0.38, "sharp"],
  [0.032, 0.17],
  [0.046, 0.06],
  [0.04, 0],
];

export default function build() {
  const b = createBuilder({ name: "rimefang_cleaver" });
  b.joint("axe", { at: [0, 0.8, 0], dir: [0, 1, 0] });

  // ---------------------------------------------------------------- textures
  const runeTex = (w: number, h: number, d: string, size = 192) =>
    svg(
      `<svg viewBox="0 0 ${w} ${h}"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#1fa8e6" stroke-width="6.5"/><path d="${d}" stroke="#effdff" stroke-width="2.6"/></g></svg>`,
      { size },
    );
  const RUNE_PLATE = runeTex(
    40,
    96,
    "M20 8 V26 M20 13 L31 19 L20 25 M7 33 H33 M13 42 V62 M27 42 V62 M13 48 L27 56 M7 69 H33 M20 90 V76 M20 84 L10 76 M20 84 L30 76",
  );
  const RUNE_A = runeTex(16, 44, "M8 4 V40 M8 10 L14 17 L8 24", 128);
  const RUNE_B = runeTex(16, 44, "M3 5 V39 M13 5 V39 M3 14 L13 30", 128);

  let arms = "";
  for (let i = 0; i < 6; i++)
    arms += `<g transform="rotate(${i * 60} 50 50)"><path d="M50 50 V14 M50 30 L40 21 M50 30 L60 21 M50 41 L43 35 M50 41 L57 35"/></g>`;
  const SNOW = svg(
    `<svg viewBox="0 0 100 100"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#1b5fa8"/><stop offset="1" stop-color="#081c42"/></radialGradient></defs><circle cx="50" cy="50" r="49" fill="url(#g)"/><circle cx="50" cy="50" r="45" fill="none" stroke="#7fe3ff" stroke-width="2.5"/><g fill="none" stroke="#1fa8e6" stroke-width="8" stroke-linecap="round" opacity="0.7">${arms}</g><g fill="none" stroke="#f2feff" stroke-width="3.4" stroke-linecap="round">${arms}</g><circle cx="50" cy="50" r="5" fill="#f2feff"/></svg>`,
    { size: 256 },
  );

  // Hanging cards are drawn flipped so they read upright from the front.
  const hang = (w: number, h: number, inner: string, size: number) =>
    svg(`<svg viewBox="0 0 ${w} ${h}"><g transform="translate(0 ${h}) scale(1 -1)">${inner}</g></svg>`, { size });

  const TALISMAN = hang(
    40,
    64,
    `<path d="M20 2 C32 2 36 14 34 30 C32 46 26 58 20 62 C14 58 8 46 6 30 C4 14 8 2 20 2Z" fill="#efe3c4" stroke="#4a3a2a" stroke-width="2"/>
     <circle cx="20" cy="10" r="3" fill="#2a1d14"/>
     <path d="M20 22 V50 M20 28 L28 34 L20 40" fill="none" stroke="#1fa8e6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M20 22 V50 M20 28 L28 34 L20 40" fill="none" stroke="#effdff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    160,
  );

  const PENNANT = hang(
    60,
    140,
    `<defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a78c4"/><stop offset="1" stop-color="#13306c"/></linearGradient></defs>
     <path d="M2 0 H58 V118 L50 110 L44 126 L36 110 L30 140 L24 110 L16 126 L10 110 L2 120Z" fill="url(#c)" stroke="#0b1d44" stroke-width="2.2" stroke-linejoin="round"/>
     <rect x="2" y="0" width="56" height="12" fill="#d8b45e" stroke="#0b1d44" stroke-width="1.5"/>
     <path d="M8 6 H52" stroke="#8a6a2a" stroke-width="1.2" stroke-dasharray="3 3"/>
     <path d="M8 20 V100 M52 20 V100" stroke="#d8b45e" stroke-width="1.6"/>
     <path d="M14 78 L30 92 L46 78" fill="none" stroke="#9fe4ff" stroke-width="2.4" stroke-linejoin="round"/>
     <g transform="translate(30 50) scale(0.4) translate(-50 -50)" fill="none" stroke="#f2feff" stroke-width="8" stroke-linecap="round">${arms}</g>`,
    256,
  );

  const FEATHER = hang(
    20,
    80,
    `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4fcff"/><stop offset="1" stop-color="#6fb4e4"/></linearGradient></defs>
     <path d="M10 0 C20 14 22 50 10 80 C-2 50 0 14 10 0Z" fill="url(#f)" stroke="#2b4f80" stroke-width="1.3"/>
     <path d="M10 2 V76" stroke="#2b4f80" stroke-width="1.4"/>
     <path d="M10 20 L17 12 M10 32 L18 24 M10 44 L17 37 M10 56 L15 50 M10 20 L3 12 M10 32 L2 24 M10 44 L3 37 M10 56 L5 50" stroke="#4f86b8" stroke-width="1"/>`,
    128,
  );

  const FUR = svg(
    `<svg viewBox="0 0 24 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8d9bb4"/><stop offset="0.5" stop-color="#e2ecf8"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
     <path d="M2 64 C4 40 8 20 13 0 C17 18 21 38 22 64Z" fill="url(#g)" stroke="#6c7a94" stroke-width="1.2"/>
     <path d="M8 62 C9 44 11 28 13 14 M15 62 C15 44 14 30 13 14" fill="none" stroke="#9fb0c8" stroke-width="1"/></svg>`,
    128,
  );

  let needles = "";
  [-60, -35, -15, 0, 18, 38, 62].forEach((a, i) => {
    const len = [20, 26, 30, 32, 28, 24, 18][i];
    needles += `<path transform="rotate(${a} 16 32)" d="M14.5 32 L16 ${32 - len} L17.5 32Z" fill="#eaffff" stroke="#6fc8f0" stroke-width="0.6"/>`;
  });
  const RIME = svg(`<svg viewBox="0 0 32 32">${needles}</svg>`, { size: 128 });

  // ---------------------------------------------------------------- helpers
  const unit = (x: number, y: number, z: number): number[] => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  };
  const crystal = (
    at: THREE.Vector3 | number[],
    dir: THREE.Vector3 | number[],
    len: number,
    r: number,
    color: Col,
    segs = 6,
  ) =>
    b.lathe(
      [
        [0, 0],
        [r * 0.8, len * 0.07],
        [r, len * 0.25],
        [r * 0.9, len * 0.62],
        [0, len],
      ],
      { at, axis: dir, segments: segs, color },
    );
  const band = (y: number, r: number, tube: number, color: Col) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 14), color, { at: [0, y, 0], dir: [0, 1, 0], axis: "z", flat: true });
  const rivet = (at: THREE.Vector3 | number[], r = 0.007) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), BRONZE, { at, flat: true });

  // ---------------------------------------------------------------- butt cap
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.046, 0.012],
      [0.04, 0.045],
      [0.032, 0.075],
      [0.036, 0.09],
      [0.03, 0.097],
      [0, 0.097],
    ],
    { at: [0, -0.004, 0], segments: 8, color: IRON },
  );
  band(0.03, 0.043, 0.0045, BRONZE);
  b.ring(frame([0, 0.085, 0], [0, 1, 0]), { count: 6, radius: 0.034, tilt: 30 }, (it) => {
    const c = crystal(it.at, it.axis, 0.09, 0.012, it.i % 2 ? GLOWC : ICE);
    if (it.i % 2) glow(c);
  });

  // ---------------------------------------------------------------- haft
  const haft = b.rod([0, 0.06, 0], [0, HY + 0.1, 0], [0.027, 0.022], { color: WOOD, sides: 8 });

  // grip
  b.rod([0, 0.2, 0], [0, 0.7, 0], 0.0285, { color: LEATHER, sides: 8 });
  b.sweep(spiral([0, 0.2, 0], [0.0305, 0.2, 0], [0, 1, 0], { turns: 12.5, pitch: 0.04 }), 0.0042, {
    color: "#8d5b3a",
    sides: 5,
  });
  band(0.2, 0.03, 0.007, BRONZE);
  band(0.7, 0.03, 0.007, BRONZE);
  for (const y of [0.325, 0.45, 0.575]) band(y, 0.0305, 0.0035, IRON);

  // fur cuff
  b.rod([0, 0.7, 0], [0, 0.84, 0], 0.034, { color: FURC, sides: 7 });
  const furA = b.ring(frame([0, 0.84, 0], [0, 1, 0]), { count: 14, radius: 0.032 }).items;
  const furB = b.ring(frame([0, 0.78, 0], [0, 1, 0]), { count: 12, radius: 0.034, fromDeg: 15, toDeg: 345 }).items;
  b.cards([...furA, ...furB], FUR, {
    size: [0.05, 0.14],
    lean: 70,
    flow: [0, -1, 0],
    bend: 25,
    vary: 0.25,
    cross: true,
    rng: rng(11),
  });

  // carved glowing runes on the bare haft
  for (const z of [1, -1]) {
    glow(b.decal(haft, RUNE_A, { at: [0, 0.91, z * 0.027], dir: [0, 0, z], size: [0.026, 0.05] }));
    glow(b.decal(haft, RUNE_B, { at: [0, 0.97, z * 0.027], dir: [0, 0, z], size: [0.026, 0.05] }));
  }

  // ---------------------------------------------------------------- collar
  b.lathe(
    [
      [0, 0],
      [0.036, 0],
      [0.054, 0.014],
      [0.054, 0.05],
      [0.044, 0.085],
      [0, 0.085],
    ],
    { at: [0, 1.03, 0], segments: 10, color: TRIM },
  );
  band(1.052, 0.0545, 0.005, BRONZE);
  b.ring(frame([0, 1.05, 0], [0, 1, 0]), { count: 12, radius: 0.054, tilt: -75 }, (it) =>
    b.spike(it, it, 0.05, 0.009, { color: BONE, sides: 5 }),
  );

  // pennant, feathers and charm
  b.rod([-0.07, 1.047, 0.072], [0.07, 1.047, 0.072], 0.0038, { color: BRONZE, sides: 5 });
  for (const s of [1, -1]) b.rod([s * 0.05, 1.062, 0.036], [s * 0.07, 1.047, 0.072], 0.003, { color: CORD, sides: 5 });
  b.cards([frame([0, 1.045, 0.072], [0, 1, 0])], PENNANT, { size: [0.12, 0.2], lean: 180, flow: [0, 0, 1], bend: 10 });

  b.cards(
    [frame([-0.04, 1.065, 0.036], [0, 1, 0]), frame([-0.052, 1.06, 0.015], [0, 1, 0]), frame([-0.05, 1.06, -0.01], [0, 1, 0])],
    FEATHER,
    { size: [0.04, 0.19], lean: 180, flow: (_f, i) => [(i - 1) * 0.5, 0, 1], vary: 0.2, rng: rng(21), bend: 15 },
  );

  const cord = catmull([
    [0.052, 1.07, 0.03],
    [0.085, 1.0, 0.03],
    [0.088, 0.935, 0.03],
  ]);
  b.sweep(cord, 0.0028, { color: CORD, sides: 5 });
  b.along(cord, 3, (at) => glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), GLOWC, { at, flat: true })));
  b.cards([frame([0.088, 0.935, 0.03], [0, 1, 0])], TALISMAN, { size: [0.045, 0.065], lean: 180, flow: [0, 0, 1] });

  // ---------------------------------------------------------------- socket
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.085, 0.012],
      [0.085, 0.03],
      [0.07, 0.045],
      [0.07, 0.195],
      [0.085, 0.21],
      [0.085, 0.228],
      [0.06, 0.24],
      [0, 0.24],
    ],
    { at: [0, HY - 0.12, 0], segments: 8, color: IRON },
  );
  for (const y of [HY - 0.099, HY + 0.099])
    b.ring(frame([0, y, 0], [0, 1, 0]), { count: 8, radius: 0.085 }, (it) => rivet(it.at));

  // frost bloom around both lips
  b.ring(frame([0, HY + 0.1, 0], [0, 1, 0]), { count: 6, radius: 0.07, tilt: 50, fromDeg: 30, toDeg: 330 }, (it) => {
    crystal(it.at, it.axis, 0.1, 0.014, ICE);
  });
  b.ring(frame([0, HY - 0.1, 0], [0, 1, 0]), { count: 6, radius: 0.07, tilt: -50, fromDeg: 30, toDeg: 330 }, (it) => {
    crystal(it.at, it.axis, 0.09, 0.013, ICE);
  });

  // hanging chains with frost drops
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++)
      b.part(new THREE.TorusGeometry(0.0075, 0.0022, 4, 8), BRONZE, {
        at: [s * 0.072, 1.095 - 0.0145 * i, -0.035],
        dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
        axis: "z",
        flat: true,
      });
    glow(crystal([s * 0.072, 1.095 - 0.0145 * 5, -0.035], [0, -1, 0], 0.07, 0.013, GLOWC));
  }

  // ---------------------------------------------------------------- blades
  const blades: ReturnType<typeof b.extrude>[] = [];
  for (const s of [1, -1]) {
    blades.push(
      b.extrude(BL, { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.022, bevel: 0.008, color: BLADE }),
    );
    blades.push(
      b.extrude(PLATE, { at: [0, HY, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.004, color: PLATEP }),
    );
    for (const z of [1, -1]) {
      // glowing inlay following the cutting edge
      glow(
        b.sweep(
          catmull(INLAY.map(([x, y]) => [s * x, HY + y, z * 0.0115])),
          0.0032,
          { color: GLOWC, sides: 5 },
        ),
      );
      // rune plate
      glow(
        b.part(new THREE.PlaneGeometry(0.085, 0.2), "#ffffff", {
          at: [s * 0.17, HY, z * 0.0172],
          dir: [0, 0, z],
          axis: "z",
          texture: RUNE_PLATE,
        }),
      );
      // plate rivets
      for (const [x, y] of [
        [0.07, 0.04],
        [0.07, -0.04],
        [0.235, 0.1],
        [0.235, -0.1],
      ])
        rivet([s * x, HY + y, z * 0.015], 0.0065);
    }
  }

  // crystals growing along the horn spines
  const topEdge = [
    [0.19, 0.1555, 0.06],
    [0.25, 0.1936, 0.09],
    [0.31, 0.25, 0.11],
    [0.37, 0.31, 0.07],
  ];
  for (const s of [1, -1])
    for (const v of [1, -1])
      topEdge.forEach(([x, y, len], i) => {
        const d = unit(s * 0.38, v * 0.92, (i % 2 ? 1 : -1) * 0.2);
        const at = [s * x - d[0] * len * 0.18, HY + v * y - d[1] * len * 0.18, -d[2] * len * 0.18];
        if (i === 2) glow(crystal(at, d, len, 0.012 + len * 0.06, GLOWC));
        else crystal(at, d, len, 0.012 + len * 0.06, ICE);
      });

  // crystals hugging the socket flanks
  for (const s of [1, -1])
    for (const v of [1, -1])
      for (const z of [1, -1])
        crystal([s * 0.105, HY + v * 0.095, z * 0.014], unit(-s * 0.35, v * 0.45, z * 0.8), 0.1, 0.016, ICE);

  // medallions
  for (const z of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.055, 0.01],
        [0.055, 0.02],
        [0.045, 0.028],
        [0, 0.028],
      ],
      { at: [0, HY, z * 0.055], axis: [0, 0, z], segments: 10, color: BRONZE },
    );
    glow(
      b.part(new THREE.CircleGeometry(0.042, 16), "#ffffff", {
        at: [0, HY, z * 0.0835],
        dir: [0, 0, z],
        axis: "z",
        texture: SNOW,
      }),
    );
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      crystal([0.06 * c, HY + 0.06 * sn, z * 0.068], unit(c, sn, z * 0.5), 0.05, 0.009, k % 2 ? ICE : GLOWC);
    }
  }

  // ---------------------------------------------------------------- spear crown
  b.extrude(SPEAR, {
    at: [0, HY + 0.11, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.032, 0.008],
    bevel: 0.004,
    color: SPEARP,
  });
  for (const z of [1, -1])
    glow(
      b.rod([0, HY + 0.13, z * 0.0163], [0, HY + 0.41, z * 0.0076], 0.0028, { color: GLOWC, sides: 4 }),
    );
  for (const s of [1, -1]) crystal([s * 0.035, HY + 0.115, 0], unit(s * 0.6, 1, 0), 0.15, 0.017, ICE);

  // ---------------------------------------------------------------- frost rime on the steel
  const skin = b.surface(blades);
  const rimeHits = skin.scatter(26, { rng: rng(5), minDist: 0.04, filter: (h) => h.n.y > 0.45 });
  if (rimeHits.length)
    b.cards(rimeHits, RIME, { size: [0.05, 0.06], lean: 20, vary: 0.3, spin: 35, rng: rng(6) });
  const shards = skin.scatter(14, { rng: rng(8), minDist: 0.05, filter: (h) => h.n.y > 0.45 });
  for (const h of shards) b.stick(new THREE.ConeGeometry(0.009, 0.05, 5), ICE, h, { embed: 0.3, flat: true });
  const icicles = skin.scatter(16, { rng: rng(9), minDist: 0.05, filter: (h) => h.n.y < -0.45 });
  for (const h of icicles) b.stick(new THREE.ConeGeometry(0.01, 0.075, 5), ICE, h, { embed: 0.3, flat: true });

  return b.root;
}
```