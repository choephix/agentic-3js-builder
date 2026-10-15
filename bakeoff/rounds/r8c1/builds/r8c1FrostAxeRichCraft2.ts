import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  noise,
  paint,
  smoothstep,
  grain,
  polyline,
  catmull,
  spiral,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-forged Battle Axe",
  description:
    "A Freljord-style double-headed battle axe: crescent frost blade with a glowing fern inlay, an ice-pick fang, a central glowing crystal, fur collar, ribbons and a spear tip, planted in a frozen runic plinth ringed with ice crystals.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants

const HC = 1.3; // height of the axe head centre
const GOLD = "#e2c77a";
const GOLDD = "#a8863c";
const CYAN = "#8fe9ff";
const CYANL = "#d2f8ff";
const FURC = "#e9f1f9";
const ICE_TONES = ["#bdf1ff", "#8adcf7", "#e2fbff", "#62c4ee"];

type Pt = [number, number] | [number, number, "sharp"];
type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const BLADE = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.75) return mix("#eafaff", "#9fdcf5", noise(p, 0.05, 3));
  const t = smoothstep(0.22, 0.66, s[0]);
  const frost = smoothstep(0.55, 0.8, noise(p, 0.07, 5));
  const base = mix(mix("#2a5fa8", "#4aa6dc", noise(p, 0.12, 2)), "#c8f4ff", t * 0.95);
  return mix(base, "#e8fcff", frost * 0.32);
});

const PLATE = paint((p, n) => {
  if (Math.abs(n.z) < 0.75) return "#a9d8f0";
  const v = noise(p, 0.05, 8);
  return mix(mix("#14234a", "#25437a", v), "#6fb6e0", smoothstep(0.62, 0.8, noise(p, 0.035, 11)) * 0.5);
});

const HUB = paint((p, n) =>
  mix(mix("#18294f", "#3a5c92", noise(p, 0.05, 6)), "#ffffff", smoothstep(0.7, 1, n.y) * 0.3),
);

const STEEL = paint((p, n) =>
  mix(mix("#46597f", "#a9bfdc", noise(p, 0.08, 4)), "#ffffff", smoothstep(0.5, 1, n.y) * 0.25),
);

const HAFT = grain("#1b2a4d", "#2f4a7c", { size: 0.012, axis: "y", seed: 2 });
const LEATHER = paint((p) => mix("#2a1f33", "#4b3a5a", noise(p, 0.02, 2)));

const CLOTH = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.7) return "#0d1a3a";
  if (Math.abs(s[0]) > 0.035) return GOLD;
  if (s[1] > -0.02) return GOLDD;
  return mix("#1f4f9a", "#2f78cc", noise(p, 0.04, 9));
});

const STONE = paint((p, n) => {
  if (n.y > 0.6) return mix("#eaf7ff", "#bfe3f5", noise(p, 0.08, 1));
  return mix(
    mix("#27324d", "#4a5878", noise(p, 0.1, 2)),
    "#7fbfe0",
    smoothstep(0.6, 0.8, noise(p, 0.05, 3)) * 0.35,
  );
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

function frostSvg() {
  let d = "M4 80 C30 76 60 84 94 80";
  for (let i = 0; i < 6; i++) {
    const x = 12 + i * 11;
    const L = 50 - i * 7;
    for (const k of [-1, 1]) {
      const ex = x + L * 0.5;
      const ey = 80 + k * L;
      const mx = x + L * 0.25;
      const my = 80 + k * L * 0.5;
      d += ` M${x} 80 L${ex} ${ey} M${mx} ${my} l${L * 0.32} ${k * L * 0.12}`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" stroke="#4cc8f0" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" stroke="#d6faff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M94 80 l8 -6 l0 12z" fill="#d6faff"/>
    </svg>`,
    { size: 400 },
  );
}

const FROST = frostSvg();

const PICK_RUNE = svg(
  `<svg viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 92 L104 8" stroke="#4cc8f0" stroke-width="6" stroke-linecap="round"/>
    <path d="M7 92 L104 8" stroke="#d6faff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M30 72 l-8 -14 M46 58 l-8 -14 M62 44 l-8 -14 M78 30 l-8 -14 M30 72 l12 6 M46 58 l12 6 M62 44 l12 6" stroke="#9cefff" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 384 },
);

function runeRingSvg() {
  const glyphs = [
    "M0 -9 L0 9 M0 -9 L7 -2 M0 2 L7 9",
    "M-6 -9 L-6 9 M-6 -9 L6 9 M6 -9 L6 9",
    "M0 -9 L7 0 L0 9 L-7 0 Z",
    "M-6 -9 L6 -9 M0 -9 L0 9 M-6 9 L6 5",
    "M-6 9 L0 -9 L6 9 M-4 2 L4 2",
  ];
  let g = "";
  for (let i = 0; i < 12; i++)
    g += `<g transform="translate(100 100) rotate(${i * 30}) translate(0 -80)"><path d="${glyphs[i % glyphs.length]}" stroke="#9cefff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  let ticks = "";
  for (let i = 0; i < 36; i++)
    ticks += `<path d="M100 8 L100 14" transform="rotate(${i * 10} 100 100)" stroke="#6fdcff" stroke-width="2.6"/>`;
  return svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#7fe6ff" stroke-width="3"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#7fe6ff" stroke-width="2.6"/>
      ${ticks}${g}
    </svg>`,
    { size: 512 },
  );
}
const RUNE_RING = runeRingSvg();

function crackSvg() {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    let x = 50;
    let y = 50;
    d += `M50 50`;
    for (let k = 1; k <= 4; k++) {
      const aa = a + (k % 2 ? 0.18 : -0.15);
      const r = 8 + k * 9 + (i % 3) * 2;
      x = 50 + Math.cos(aa) * r;
      y = 50 + Math.sin(aa) * r;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${d}" stroke="#bfeaff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="9" fill="none" stroke="#e6faff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
}
const CRACK = crackSvg();

const RIBBON_RUNE = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 L34 30 L20 56 L6 30 Z" stroke="#e2c77a" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M20 14 L20 46 M20 20 L28 30 M20 34 L28 42 M12 24 L20 32" stroke="#8ff0ff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);

const SPARK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42Z" fill="#e8fcff" stroke="#6fdcff" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 64 Q4 30 12 6 Q16 28 18 64Z" fill="#f0f7ff"/>
    <path d="M10 64 Q12 24 18 0 Q24 26 26 64Z" fill="#ffffff"/>
    <path d="M18 64 Q22 34 28 12 Q31 36 30 64Z" fill="#d6e8fa"/>
    <path d="M18 60 Q19 30 18 6" stroke="#aac4e0" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Outlines (right-hand side, x positive, relative to the head centre)

const MAIN: Pt[] = [
  [0.03, 0.24],
  [0.18, 0.3],
  [0.34, 0.42],
  [0.5, 0.58, "sharp"],
  [0.47, 0.4],
  [0.56, 0.26],
  [0.63, 0.08],
  [0.65, -0.1],
  [0.6, -0.28],
  [0.5, -0.46],
  [0.4, -0.6, "sharp"],
  [0.34, -0.42],
  [0.2, -0.3],
  [0.03, -0.22],
];

const PICK: Pt[] = [
  [-0.0, 0.16],
  [0.18, 0.22],
  [0.36, 0.34],
  [0.54, 0.52],
  [0.68, 0.7, "sharp"],
  [0.57, 0.4],
  [0.42, 0.22],
  [0.25, 0.04],
  [0.0, -0.14],
];

const KITE: Pt[] = [
  [-0.07, 0.22],
  [0.07, 0.22],
  [0.115, 0.06],
  [0.115, -0.06],
  [0.07, -0.22],
  [-0.07, -0.22],
  [-0.115, -0.06],
  [-0.115, 0.06],
];

function scaleOutline(o: Pt[], kx: number, ky: number, cx: number, cy: number): Pt[] {
  return o.map((p) => {
    const q: [number, number] = [cx + (p[0] - cx) * kx, cy + (p[1] - cy) * ky];
    return p.length === 3 ? ([q[0], q[1], "sharp"] as Pt) : (q as Pt);
  });
}

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);

  // --------------------------------------------------------------------------------------------------------
  // Helpers

  const P3 = (x: number, y: number, z = 0): V => [x, HC + y, z];

  function planeGeo(w: number, h: number, flip: boolean) {
    const g = new THREE.PlaneGeometry(w, h);
    if (flip) {
      const uv = g.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    }
    return g;
  }

  function crystal(base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, g = 0.5) {
    const d = dir.clone().normalize();
    const bodyLen = len * 0.62;
    const body = b.part(new THREE.CylinderGeometry(r * 0.85, r, bodyLen, 6, 1), color, {
      at: base.clone().addScaledVector(d, bodyLen / 2),
      dir: d,
      flat: true,
    });
    const tip = b.part(new THREE.ConeGeometry(r * 0.85, len * 0.38, 6, 1), color, {
      at: base.clone().addScaledVector(d, bodyLen + len * 0.19),
      dir: d,
      flat: true,
    });
    if (g > 0) {
      glow(body, g);
      glow(tip, g);
    }
  }

  // a frost crystal growing off a blade, mirrored by s
  function bladeShard(s: number, x: number, y: number, dx: number, dy: number, dz: number, len: number, r: number, tone = 0) {
    crystal(
      new THREE.Vector3(s * x, HC + y, 0),
      new THREE.Vector3(s * dx, dy, dz),
      len,
      r,
      ICE_TONES[tone % ICE_TONES.length],
      0.5,
    );
  }

  // --------------------------------------------------------------------------------------------------------
  // Base: frozen runic plinth

  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.56, 0.05],
      [0.55, 0.1],
      [0.5, 0.14],
      [0.44, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, name: "plinth" },
  );
  // lower stone step
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.6, 0.03],
      [0.54, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: "#222d44", name: "plinthFoot" },
  );

  const runeRingPart = b.part(planeGeo(0.9, 0.9, false), "#ffffff", {
    at: [0, 0.174, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUNE_RING,
  });
  glow(runeRingPart, 1.1);

  function lastPart() {
    // returns the most recent mesh added under any joint
    let found: THREE.Mesh | null = null;
    b.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) found = o as THREE.Mesh;
    });
    return found as unknown as THREE.Mesh;
  }

  b.part(planeGeo(0.5, 0.5, false), "#ffffff", {
    at: [0, 0.178, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: CRACK,
  });

  // rocks around the rim, back half mostly
  for (const [deg, r] of [
    [75, 0.12],
    [118, 0.14],
    [160, 0.11],
    [205, 0.15],
    [250, 0.12],
    [290, 0.13],
    [42, 0.07],
    [-42, 0.075],
  ] as [number, number][]) {
    const a = (deg * Math.PI) / 180;
    b.part(new THREE.IcosahedronGeometry(r, 0), STONE, {
      at: [Math.sin(a) * 0.5, 0.1 + r * 0.25, Math.cos(a) * 0.5],
      scale: [1.25, 0.8, 1],
      rotation: [R() * 40, R() * 360, R() * 30],
      flat: true,
    });
  }

  // ice crystal clusters framing the axe
  const clusters: [number, number, number][] = [
    [115, 0.5, 1.2],
    [165, 0.48, 1.4],
    [215, 0.5, 1.3],
    [262, 0.5, 1.1],
    [305, 0.5, 0.9],
    [65, 0.5, 0.9],
    [36, 0.5, 0.45],
    [-36, 0.5, 0.5],
    [0, 0.38, 0.35],
  ];
  clusters.forEach(([deg, rad, sc], ci) => {
    const a = (deg * Math.PI) / 180;
    const bx = Math.sin(a) * rad;
    const bz = Math.cos(a) * rad;
    for (let k = 0; k < 3; k++) {
      const out = 0.3 + R() * 0.35;
      const dir = new THREE.Vector3(
        Math.sin(a) * out + (R() - 0.5) * 0.4,
        1,
        Math.cos(a) * out + (R() - 0.5) * 0.4,
      );
      const len = sc * (0.17 + R() * 0.22) * (k === 0 ? 1.4 : 1);
      crystal(
        new THREE.Vector3(bx + (R() - 0.5) * 0.08, 0.1, bz + (R() - 0.5) * 0.08),
        dir,
        len,
        len * 0.15,
        ICE_TONES[(ci + k) % ICE_TONES.length],
        0.45,
      );
    }
  });

  // --------------------------------------------------------------------------------------------------------
  // Haft

  b.sweep(
    [
      [0, 0.12, 0],
      [0, 1.58, 0],
    ],
    [0.03, 0.034, 0.03, 0.033, 0.03],
    { sides: 8, color: HAFT, caps: "flat", name: "haft" },
  );

  // leather grip wrap
  const wrap = spiral([0, 0.42, 0], [0.036, 0.42, 0], [0, 1, 0], { turns: 7, pitch: 0.06, r1: 0.036 });
  b.sweep(wrap, 0.009, { sides: 5, color: LEATHER, name: "gripWrap" });

  // metal bands and studs
  for (const y of [0.38, 0.44, 0.84, 0.88, 0.94]) {
    b.part(new THREE.TorusGeometry(0.037, 0.009, 5, 10), y === 0.88 ? GOLD : STEEL, {
      at: [0, y, 0],
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });
  }
  for (const y of [0.38, 0.94]) {
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, {
        at: [Math.sin(a) * 0.045, y + (y < 0.5 ? -0.02 : 0.02), Math.cos(a) * 0.045],
      });
    }
  }

  // ferrule (butt) planted in the plinth
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.052, 0.02],
      [0.042, 0.06],
      [0.036, 0.14],
      [0.043, 0.16],
      [0, 0.16],
    ],
    { at: [0, 0.15, 0], segments: 8, color: STEEL, name: "ferrule" },
  );
  b.part(new THREE.TorusGeometry(0.048, 0.008, 5, 8), GOLD, { at: [0, 0.2, 0], dir: [0, 1, 0], axis: "z", flat: true });

  // fur collar
  b.part(new THREE.TorusGeometry(0.045, 0.026, 5, 9), FURC, { at: [0, 1.0, 0], dir: [0, 1, 0], axis: "z", flat: true });
  b.part(new THREE.TorusGeometry(0.042, 0.022, 5, 9), "#c9dcef", { at: [0, 0.95, 0], dir: [0, 1, 0], axis: "z", flat: true });
  const furRng = rng(5);
  for (const [y, count, rad] of [
    [1.0, 16, 0.05],
    [0.95, 14, 0.045],
  ] as [number, number, number][]) {
    const ring = b.ring(frame([0, y, 0], [0, 1, 0]), { count, radius: rad });
    b.cards(ring.items, TUFT, {
      size: [0.08, 0.2],
      lean: 55,
      flow: [0, -1, 0],
      bend: 25,
      vary: 0.25,
      spin: 8,
      rng: furRng,
    });
  }

  // ribbons
  for (const s of [1, -1]) {
    const rib: Pt[] = [
      [-0.045, 0],
      [0.045, 0],
      [0.05, -0.38],
      [0, -0.29],
      [-0.05, -0.4],
    ];
    b.extrude(rib, {
      at: [s * 0.02, 0.88, s * 0.054],
      x: [s, 0, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: CLOTH,
      name: "ribbon",
    });
    glow(
      b.part(planeGeo(0.05, 0.075, false), "#ffffff", {
        at: [s * 0.02, 0.74, s * 0.0615],
        dir: [0, 0, s],
        axis: "z",
        texture: RIBBON_RUNE,
      }),
      1.0,
    );
    b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { at: [s * 0.02, 0.5, s * 0.054] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [s * 0.02, 0.88, s * 0.05] });
  }

  // --------------------------------------------------------------------------------------------------------
  // Axe head: hub

  b.extrude(KITE, { at: [0, HC, 0], x: [1, 0, 0], thickness: 0.1, bevel: 0.012, color: HUB, name: "hub" });

  // gold trim lines on both faces
  for (const zs of [1, -1]) {
    const trim = KITE.map((p) => [p[0] * 0.86, HC + p[1] * 0.86, zs * 0.054] as V);
    b.sweep(polyline(trim, { closed: true }), 0.005, { sides: 5, color: GOLD, name: "hubTrim" });
    for (const [x, y] of [
      [0.075, 0.17],
      [-0.075, 0.17],
      [0.075, -0.17],
      [-0.075, -0.17],
    ]) {
      b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [x, HC + y, zs * 0.052] });
    }
    // bezel around the crystal
    b.part(new THREE.TorusGeometry(0.06, 0.01, 5, 8), GOLD, { at: [0, HC, zs * 0.052], flat: true });
  }

  // central crystal
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), "#8fe9ff", {
      at: [0, HC, 0],
      scale: [0.075, 0.19, 0.1],
      flat: true,
      name: "heartCrystal",
    }),
    0.75,
  );

  // collars above and below hub
  b.lathe(
    [
      [0, 0],
      [0.048, 0],
      [0.062, 0.02],
      [0.062, 0.05],
      [0.05, 0.08],
      [0, 0.08],
    ],
    { at: [0, HC - 0.3, 0], segments: 8, color: STEEL, name: "lowerCollar" },
  );
  b.part(new THREE.TorusGeometry(0.058, 0.008, 5, 8), GOLD, { at: [0, HC - 0.26, 0], dir: [0, 1, 0], axis: "z", flat: true });

  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.064, 0.02],
      [0.05, 0.045],
      [0.05, 0.09],
      [0.062, 0.1],
      [0.062, 0.12],
      [0.04, 0.14],
      [0, 0.14],
    ],
    { at: [0, 1.5, 0], segments: 8, color: STEEL, name: "socket" },
  );
  b.part(new THREE.TorusGeometry(0.062, 0.007, 5, 8), GOLD, { at: [0, 1.57, 0], dir: [0, 1, 0], axis: "z", flat: true });

  // spear tip
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.07, 0.13],
      [0, 0.37, "sharp"],
      [-0.07, 0.13],
    ],
    { at: [0, 1.64, 0], x: [1, 0, 0], thickness: 0.026, bevel: 0.006, color: BLADE, name: "spearBlade" },
  );
  glow(
    b.extrude(
      [
        [-0.014, 0.03],
        [0.014, 0.03],
        [0.026, 0.13],
        [0, 0.3],
        [-0.026, 0.13],
      ],
      { at: [0, 1.64, 0], x: [1, 0, 0], thickness: 0.034, color: CYANL, name: "spearFuller" },
    ),
    1.0,
  );

  // --------------------------------------------------------------------------------------------------------
  // Main crescent blade (left, +X) and ice-pick fang (right, -X)

  const s1 = 1;
  b.extrude(MAIN, {
    at: [0, HC, 0],
    x: [s1, 0, 0],
    thickness: 0.032,
    bevel: 0.008,
    color: BLADE,
    name: "bladeMain",
  });
  b.extrude(scaleOutline(MAIN, 0.72, 0.74, 0.03, 0), {
    at: [0, HC, 0],
    x: [s1, 0, 0],
    thickness: 0.046,
    bevel: 0.008,
    color: PLATE,
    name: "bladePlate",
  });

  // gold trim framing the dark plate on both faces
  const plateOutline = scaleOutline(MAIN, 0.72, 0.74, 0.03, 0);
  for (const zs of [1, -1]) {
    const trimPts = plateOutline.map((p) => [p[0], HC + p[1], zs * 0.026] as V);
    b.sweep(polyline(trimPts, { closed: true }), 0.0045, { sides: 5, color: GOLD, name: "plateTrim" });
  }

  // glowing cutting edge
  const edge = [
    [0.47, 0.4],
    [0.56, 0.26],
    [0.63, 0.08],
    [0.65, -0.1],
    [0.6, -0.28],
    [0.5, -0.46],
  ].map(([x, y]) => P3(x, y));
  glow(b.sweep(catmull(edge), 0.007, { sides: 5, color: CYANL, name: "edgeGlint" }), 1.1);

  // frost fern inlay on both faces
  for (const zs of [1, -1]) {
    glow(
      b.part(planeGeo(0.5, 0.8, zs * s1 < 0), "#ffffff", {
        at: [0.27, HC, zs * 0.0255],
        dir: [0, 0, zs],
        axis: "z",
        texture: FROST,
      }),
      1.15,
    );
    // gems on the plate
    for (const gy of [0.2, -0.22]) {
      glow(
        b.part(new THREE.OctahedronGeometry(1, 0), "#9cefff", {
          at: [0.2, HC + gy, zs * 0.03],
          scale: [0.024, 0.034, 0.02],
          flat: true,
        }),
        0.8,
      );
    }
    // rivets where the blade meets the hub
    for (const ry of [0.1, -0.1]) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [0.12, HC + ry, zs * 0.03] });
    }
  }

  // frost crystals sprouting from the blade
  bladeShard(1, 0.2, 0.31, -0.15, 1, 0.05, 0.3, 0.04, 0);
  bladeShard(1, 0.1, 0.27, 0.05, 1, -0.05, 0.22, 0.032, 2);
  bladeShard(1, 0.3, 0.39, 0.05, 1, 0.12, 0.17, 0.028, 1);
  bladeShard(1, 0.2, -0.3, -0.1, -1, 0, 0.24, 0.036, 0);
  bladeShard(1, 0.3, -0.385, 0.2, -1, 0.05, 0.16, 0.028, 3);
  // frost ridges along the cutting edge
  for (const [x, y, dx, dy] of [
    [0.56, 0.26, 0.8, 0.5],
    [0.63, 0.08, 1, 0.2],
    [0.65, -0.1, 1, -0.15],
    [0.6, -0.28, 0.85, -0.5],
  ]) {
    for (const dz of [-0.45, 0.45]) {
      bladeShard(1, x - 0.01, y, dx, dy, dz, 0.1, 0.017, 2);
    }
  }

  // ice-pick fang
  const s2 = -1;
  b.extrude(PICK, {
    at: [0, HC, 0],
    x: [s2, 0, 0],
    thickness: [0.036, 0.014],
    bevel: 0.007,
    color: BLADE,
    name: "pick",
  });
  for (const zs of [1, -1]) {
    glow(
      b.part(planeGeo(0.55, 0.5, zs * s2 < 0), "#ffffff", {
        at: [s2 * 0.32, HC + 0.24, zs * 0.0225],
        dir: [0, 0, zs],
        axis: "z",
        texture: PICK_RUNE,
      }),
      1.15,
    );
  }
  // glowing spine along the pick's top edge
  const pickEdge = [
    [0.18, 0.22],
    [0.36, 0.34],
    [0.54, 0.52],
    [0.66, 0.68],
  ].map(([x, y]) => P3(s2 * x, y));
  glow(b.sweep(catmull(pickEdge), 0.007, { sides: 5, color: CYANL, name: "pickGlint" }), 1.1);
  bladeShard(-1, 0.24, 0.26, 0.2, 1, 0.1, 0.2, 0.03, 0);
  bladeShard(-1, 0.4, 0.37, 0.15, 1, -0.1, 0.17, 0.026, 1);
  bladeShard(-1, 0.3, 0.1, 0.1, -1, 0, 0.2, 0.028, 3);
  bladeShard(-1, 0.1, -0.04, -0.1, -1, 0.1, 0.18, 0.028, 2);

  // --------------------------------------------------------------------------------------------------------
  // Floating frost sparkles

  const sparkFrames = [];
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.35 + R() * 0.65;
    sparkFrames.push(frame([Math.sin(a) * rad, 0.5 + R() * 1.7, Math.cos(a) * 0.35 * (R() < 0.5 ? 1 : -1)], [0, 1, 0]));
  }
  glow(
    b.cards(sparkFrames, SPARK, { size: 0.07, lean: 0, flow: [0, 0, 1], vary: 0.5, spin: 25, rng: rng(9) }),
    1.2,
  );

  return b.root;
}
