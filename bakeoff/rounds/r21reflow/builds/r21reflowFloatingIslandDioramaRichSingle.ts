import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Island Ruins",
  description:
    "A sky island of faceted cliff rock capped in bright grass, with a ruined gold-trimmed stone arch, stairs and columns, a pool that spills as a waterfall off the cliff, two broadleaf trees, ivy, flowers and glowing hydro crystals.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Pt = [number, number, number];
type Fr = ReturnType<typeof frame>;
type Fill = string | Paint;

const G = 1.52; // grass surface
const PT = G + 0.28; // arch platform top
const SY = PT + 0.8; // arch spring line
const DEG = Math.PI / 180;
const frac = (x: number) => x - Math.floor(x);
const polar = (r: number, y: number, deg: number): Pt => [r * Math.sin(deg * DEG), y, r * Math.cos(deg * DEG)];

// cliff radius at height y (the lathe profile)
const PROFILE: Array<[number, number]> = [
  [0, 0],
  [0.22, 0.08],
  [0.55, 0.35],
  [0.85, 0.65],
  [1.05, 0.95],
  [1.26, 1.3],
  [1.2, 1.42],
];
function rockR(y: number) {
  if (y <= 0) return 0;
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [r0, y0] = PROFILE[i];
    const [r1, y1] = PROFILE[i + 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 1.2;
}

const POOL: Array<[number, number]> = [
  [-0.2, 0.35],
  [0.15, 0.12],
  [0.55, 0.2],
  [0.8, 0.6],
  [0.78, 0.95],
  [0.58, 1.12],
  [0.42, 0.92],
  [0.1, 0.85],
  [-0.2, 0.65],
];
function inPool(x: number, z: number) {
  let inside = false;
  for (let i = 0, j = POOL.length - 1; i < POOL.length; j = i++) {
    const [xi, zi] = POOL[i];
    const [xj, zj] = POOL[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette (toon kit cel paints)
const stonePaint = (a: string, b: string, seed: number) =>
  cel(
    paint((p, n) => {
      const base = mix(a, b, noise(p, 0.25, seed));
      if (n.y > 0.55 && noise(p, 0.16, seed + 4) > 0.52) return mix("#78b83e", "#5fa532", noise(p, 0.1, seed + 8));
      const row = p.y / 0.18;
      const f = frac(row);
      if (n.y < 0.55 && f < 0.04) return mix(base, "#6f6552", 0.55);
      if (n.y < 0.55 && frac((p.x + p.z) * 3.2 + Math.floor(row) * 0.5) < 0.03) return mix(base, "#6f6552", 0.5);
      return base;
    }),
  );
const STONE = stonePaint("#e6ddc4", "#cfc2a2", 3);
const STONE2 = stonePaint("#d9cdb0", "#bfae8a", 5);
const ROCK = cel(
  paint((p, n) => {
    const grey = noise(p, 0.6, 9) > 0.55;
    const k = Math.floor((p.y + noise(p, 0.4, 5) * 0.2) / 0.14);
    const set = grey ? ["#8f8c88", "#a5a19b"] : ["#8b6444", "#a67c54"];
    const col = set[((k % 2) + 2) % 2];
    if (noise(p, 0.12, 3) < 0.27) return mix(col, "#4a3524", 0.35);
    return n.y > 0.6 ? mix(col, "#d9c9a8", 0.2) : col;
  }),
);
const GRASS = cel(mottle("#88d840", "#62b932", { size: 0.35, seed: 2 }));
const BARK = cel(grain("#8a5a34", "#5d3a20", { size: 0.03, axis: "y" }));
const GREENS = [cel("#5db536"), cel("#46a02e"), cel("#7acb3c")];
const TINTS = ["#6fcf3a", "#4aa82e", "#9be048"];
const GOLD = cel("#f0c050", "#b8812a");
const GOLD_FLAT = "#f0c050";
const TEAL = "#35c9c0";
const CYAN = "#74f2ff";
const GRASS_FLAT = "#6cbd38";
const VINE = "#3f8f2c";
const WATER = paint((p, n) => {
  void n;
  const across = p.x * Math.cos(27 * DEG) - p.z * Math.sin(27 * DEG);
  if (p.y > 1.4) return "#eafcff";
  const v = noise(new THREE.Vector3(across, p.y * 0.25, 0), 0.06, 2);
  return mix("#2fb4ec", "#a8f0ff", smoothstep(0.45, 0.7, v));
});
const POOLW = paint((p) => mix("#2fb8ee", "#7fe4ff", smoothstep(0.4, 0.7, noise(p, 0.2, 4))));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const RUNE = svg(
  `<svg viewBox="0 0 100 100"><path d="M50 8 L88 50 L50 92 L12 50 Z" fill="none" stroke="#7ff6ff" stroke-width="5"/><path d="M50 26 L72 50 L50 74 L28 50 Z" fill="none" stroke="#7ff6ff" stroke-width="4"/><circle cx="50" cy="50" r="7" fill="#7ff6ff"/><path d="M50 8V26 M50 74V92 M12 50H28 M72 50H88" stroke="#7ff6ff" stroke-width="4"/></svg>`,
  { size: 128 },
);
const CIRCLE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#7ff6ff" stroke-width="3"/><circle cx="50" cy="50" r="34" fill="none" stroke="#7ff6ff" stroke-width="2.5"/><path d="M50 18 L76 64 L24 64 Z" fill="none" stroke="#7ff6ff" stroke-width="2.5"/><path d="M50 82 L24 36 L76 36 Z" fill="none" stroke="#7ff6ff" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#7ff6ff"/><path d="M50 2V10 M50 90V98 M2 50H10 M90 50H98" stroke="#7ff6ff" stroke-width="3"/></svg>`,
  { size: 256 },
);
const ORNAMENT = svg(
  `<svg viewBox="0 0 100 26"><g fill="none" stroke="#f0c050" stroke-width="2.2" stroke-linecap="round"><path d="M50 13 H44 C38 13 36 6 30 6 C24 6 22 12 26 14 C30 16 33 12 30 10"/><path d="M50 13 H56 C62 13 64 6 70 6 C76 6 78 12 74 14 C70 16 67 12 70 10"/><path d="M22 20 C14 20 10 14 4 14 M78 20 C86 20 90 14 96 14"/><path d="M44 20 H56"/></g><path d="M50 7 L54 13 L50 19 L46 13Z" fill="#f0c050"/></svg>`,
  { size: 512 },
);
const LEAF = svg(
  `<svg viewBox="0 0 64 64"><g fill="#ffffff"><ellipse cx="32" cy="16" rx="9" ry="15"/><ellipse cx="16" cy="32" rx="8" ry="14" transform="rotate(-55 16 32)"/><ellipse cx="48" cy="32" rx="8" ry="14" transform="rotate(55 48 32)"/><ellipse cx="32" cy="40" rx="11" ry="17"/></g><g stroke="#cfcfcf" stroke-width="2" fill="none"><path d="M32 60 V6 M32 44 L14 30 M32 44 L50 30"/></g><ellipse cx="32" cy="52" rx="10" ry="8" fill="#d6d6d6"/></svg>`,
  { size: 128 },
);
const IVY = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 62 C10 52 4 30 20 24 C24 10 40 10 44 24 C60 30 54 52 32 62Z" fill="#4caf3a"/><path d="M32 62 C20 54 16 40 24 30 C30 34 36 34 40 30 C48 40 44 54 32 62Z" fill="#3d9a30"/><path d="M32 60 V24 M32 44 L20 32 M32 44 L44 32" stroke="#9be05a" stroke-width="3" fill="none"/></svg>`,
  { size: 96 },
);
const BLADES = svg(
  `<svg viewBox="0 0 32 40"><path d="M16 40 Q12 20 4 2 Q18 14 20 40Z" fill="#6fcf3a"/><path d="M14 40 Q18 22 26 6 Q24 24 22 40Z" fill="#4fae2c"/><path d="M10 40 Q12 26 14 10 Q20 26 17 40Z" fill="#8be04a"/></svg>`,
  { size: 64 },
);
const flower = (petal: string) =>
  svg(
    `<svg viewBox="0 0 32 32"><path d="M16 32 V13" stroke="#4a9a2e" stroke-width="3"/><path d="M16 26 Q22 24 25 19 Q19 20 16 24Z" fill="#4a9a2e"/><g fill="${petal}"><circle cx="16" cy="5" r="4.5"/><circle cx="22" cy="9" r="4.5"/><circle cx="21" cy="15" r="4.5"/><circle cx="11" cy="15" r="4.5"/><circle cx="10" cy="9" r="4.5"/></g><circle cx="16" cy="10" r="3.5" fill="#ffd84a"/></svg>`,
    { size: 64 },
  );
const FLOWERS = [flower("#ffffff"), flower("#ffffff"), flower("#8fb8ff"), flower("#ffb0cf")];

export default function build() {
  const b = createBuilder({ name: "floatingIsland" });
  b.joint("base", { at: [0, 0, 0] });
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, ry = 0, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [0, ry, rz] });
  const cyl = (
    r0: number,
    r1: number,
    h: number,
    sides: number,
    color: Fill,
    x: number,
    y: number,
    z: number,
    rot: Pt = [0, 0, 0],
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { at: [x, y, z], rotation: rot, flat: true });
  const ball = (r: number, color: Fill, x: number, y: number, z: number, seg = 6) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), color, { at: [x, y, z] });
  const crystal = (x: number, y: number, z: number, h: number, tilt = 0, tiltZ = 0) =>
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), CYAN, {
        at: [x, y + h * 0.9, z],
        scale: [h * 0.32, h, h * 0.32],
        rotation: [tilt, R() * 90, tiltZ],
        flat: true,
      }),
      1.2,
    );

  const leaves: Fr[] = [];

  // --- Island body -------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 1.42],
      [1.2, 1.42],
      [1.26, 1.3],
      [1.05, 0.95],
      [0.85, 0.65],
      [0.55, 0.35],
      [0.22, 0.08],
      [0, 0],
    ],
    { at: [0, 0, 0], segments: 10, color: ROCK },
  );
  b.lathe(
    [
      [0, G],
      [1.1, G],
      [1.28, G - 0.05],
      [1.31, 1.4],
      [1.2, 1.35],
      [0, 1.35],
    ],
    { at: [0, 0, 0], segments: 10, color: GRASS },
  );
  // grass drips over the cliff lip
  for (let k = 0; k < 16; k++) {
    const th = k * 22.5 + R() * 8;
    if (Math.abs(th - 27) < 14) continue;
    b.spike(polar(1.27, 1.38, th), [0, -1, 0], 0.12 + R() * 0.2, 0.05, GRASS_FLAT, { sides: 5 });
  }
  // chunky hanging rocks
  const hanging: Array<[number, number, number]> = [
    [200, 0.75, 0.2],
    [240, 0.5, 0.17],
    [300, 0.9, 0.22],
    [160, 0.6, 0.18],
    [110, 0.8, 0.2],
    [75, 0.95, 0.2],
    [340, 0.55, 0.15],
    [130, 0.3, 0.12],
    [260, 0.25, 0.12],
    [50, 0.4, 0.13],
    [0, 1.05, 0.15],
    [180, 1.1, 0.18],
    [320, 1.15, 0.17],
    [100, 1.15, 0.16],
  ];
  for (const [th, y, s] of hanging) {
    const at = polar(rockR(y) * 1.0, y, th);
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK, {
      at,
      scale: [s, s * 1.3, s * 0.9],
      rotation: [R() * 90, R() * 360, R() * 40],
      flat: true,
    });
    if (y > 0.8) {
      b.part(new THREE.IcosahedronGeometry(1, 0), GRASS_FLAT, {
        at: [at[0] * 1.0, at[1] + s * 0.9, at[2]],
        scale: [s * 0.8, s * 0.3, s * 0.8],
        flat: true,
      });
    }
  }
  // glowing crystals clinging to the underside
  crystal(...polar(rockR(0.5) + 0.04, 0.5, 215), 0.17, 20, 40);
  crystal(...polar(rockR(0.4) + 0.03, 0.4, 235), 0.12, -15, 20);
  crystal(...polar(rockR(0.7) + 0.04, 0.7, 150), 0.14, 25, -30);

  // --- Pool and waterfall ------------------------------------------------------------------------------------
  b.extrude(
    POOL.map(([x, z]) => [x, -z] as [number, number]),
    { at: [0, G - 0.012, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.03, color: POOLW },
  );
  for (let i = 0; i < POOL.length; i++) {
    if (i === 4 || i === 5) continue;
    const [x0, z0] = POOL[i];
    const [x1, z1] = POOL[(i + 1) % POOL.length];
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    const ox = mx - 0.2;
    const oz = mz - 0.6;
    const ol = Math.hypot(ox, oz);
    const h = 0.07 + R() * 0.04;
    box(0.11, h, len * 0.82, i % 2 ? STONE : STONE2, mx + (ox / ol) * 0.05, G + h / 2 - 0.01, mz + (oz / ol) * 0.05,
      Math.atan2(dx, dz) / DEG);
  }
  for (const [x, z] of [
    [0.3, 0.5],
    [0.5, 0.75],
    [0.05, 0.55],
  ]) {
    cyl(0.07, 0.07, 0.012, 7, "#4fb03a", x, G + 0.01, z);
    ball(0.02, "#ffb0cf", x + 0.01, G + 0.025, z);
  }
  const wprof: Array<[number, number]> = [
    [1.1, G],
    [1.27, G - 0.02],
    [1.36, 1.41],
    [1.32, 1.3],
    [1.27, 1.2],
    [1.15, 1.0],
    [1.0, 0.8],
    [0.82, 0.55],
    [0.64, 0.33],
    [0.57, 0.18],
  ];
  b.sweep(catmull(wprof.map(([r, y]) => polar(r, y, 27))), (t) => [0.16 + 0.03 * t, 0.035 + 0.02 * t], {
    section: "box",
    caps: "flat",
    up: polar(1, 0, 27),
    color: WATER,
  });
  for (const [r, y, s] of [
    [0.52, 0.17, 0.11],
    [0.66, 0.2, 0.09],
    [0.44, 0.22, 0.08],
    [0.6, 0.12, 0.07],
  ]) {
    const [x, , z] = polar(r, y, 27 + (R() - 0.5) * 18);
    glow(ball(s, "#d4f6ff", x, y, z, 6), 0.5);
  }
  // hydro motes over the pool
  for (const [x, y, z] of [
    [0.2, 1.8, 0.5],
    [0.5, 2.0, 0.7],
    [0.4, 1.65, 0.3],
  ])
    glow(ball(0.025, "#c8fbff", x, y, z, 5), 1.5);

  // --- Ruins -------------------------------------------------------------------------------------------------
  // stairs + platform
  for (const [z, h] of [
    [-0.2, 0.07],
    [-0.35, 0.14],
    [-0.5, 0.21],
  ])
    box(0.75, h, 0.15, STONE, 0, G + h / 2 - 0.01, z);
  box(1.0, 0.28, 0.4, STONE2, 0, G + 0.14 - 0.01, -0.75);
  box(1.02, 0.014, 0.014, GOLD, 0, PT - 0.06, -0.548);
  b.part(new THREE.PlaneGeometry(0.7, 0.182), "#ffffff", {
    at: [0, PT - 0.15, -0.548],
    dir: [0, 0, 1],
    axis: "z",
    texture: ORNAMENT,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
      at: [0, PT + 0.004, -0.75],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: CIRCLE,
    }),
    1,
  );

  // arch
  for (const s of [1, -1]) {
    const x = s * 0.4;
    box(0.28, 0.1, 0.3, STONE2, x, PT + 0.05 - 0.01, -0.75);
    box(0.2, 0.62, 0.22, STONE, x, PT + 0.41 - 0.01, -0.75);
    box(0.26, 0.09, 0.28, STONE2, x, PT + 0.755, -0.75);
    cyl(0.125, 0.125, 0.02, 8, GOLD, x, PT + 0.2, -0.75);
    cyl(0.125, 0.125, 0.02, 8, GOLD, x, PT + 0.6, -0.75);
    // tassel
    b.rod([x, SY - 0.05, -0.605], [x, SY - 0.28, -0.605], 0.006, GOLD_FLAT, { sides: 5 });
    ball(0.02, GOLD_FLAT, x, SY - 0.29, -0.605, 5);
    b.spike([x, SY - 0.3, -0.605], [0, -1, 0], 0.11, 0.028, TEAL, { sides: 6 });
  }
  for (let k = 0; k < 9; k++) {
    const phi = ((k + 0.5) * 180) / 9;
    const c = Math.cos(phi * DEG);
    const s = Math.sin(phi * DEG);
    const key = k === 4;
    b.part(new THREE.BoxGeometry(key ? 0.16 : 0.14, key ? 0.2 : 0.16, key ? 0.28 : 0.26), k % 2 ? STONE : STONE2, {
      at: [0.4 * c, SY + 0.4 * s, -0.75],
      rotation: [0, 0, phi],
    });
  }
  for (const side of [1, -1]) {
    const z = -0.75 + side * 0.135;
    for (const rad of [0.34, 0.46]) {
      const pts: Pt[] = [];
      for (let a = 0; a <= 180; a += 15) pts.push([rad * Math.cos(a * DEG), SY + rad * Math.sin(a * DEG), z]);
      b.sweep(catmull(pts), 0.011, GOLD_FLAT, { sides: 5 });
    }
    glow(
      b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
        at: [0, SY + 0.4, -0.75 + side * 0.144],
        dir: [0, 0, side],
        axis: "z",
        texture: RUNE,
      }),
      1,
    );
  }
  b.spike([0, SY + 0.5, -0.75], [0, 1, 0], 0.15, 0.055, GOLD_FLAT, { sides: 4 });
  crystal(0.6, G + 0.01, -0.9, 0.14, 8, -10);
  crystal(-0.62, G + 0.01, -0.88, 0.1, -10, 12);

  // columns
  const column = (x: number, z: number, h: number, broken: boolean) => {
    box(0.3, 0.1, 0.3, STONE2, x, G + 0.04, z);
    cyl(0.115, 0.125, h, 8, STONE, x, G + 0.09 + h / 2, z);
    if (!broken) {
      box(0.3, 0.08, 0.3, STONE2, x, G + 0.1 + h + 0.03, z);
      cyl(0.135, 0.135, 0.025, 8, GOLD, x, G + 0.1 + h - 0.06, z);
      cyl(0.135, 0.135, 0.025, 8, GOLD, x, G + 0.28, z);
    } else {
      b.part(new THREE.ConeGeometry(0.115, 0.14, 5), STONE, {
        at: [x, G + 0.09 + h + 0.06, z],
        rotation: [R() * 10, R() * 90, R() * 10],
        flat: true,
      });
      cyl(0.135, 0.135, 0.025, 8, GOLD, x, G + 0.2, z);
    }
  };
  column(0.88, -0.5, 1.0, false);
  column(0.6, -1.0, 0.5, true);
  column(-0.6, -1.0, 0.8, false);
  column(-0.5, 0.4, 0.45, true);
  cyl(0.11, 0.11, 0.34, 8, STONE2, -0.62, G + 0.11, -0.2, [0, 25, 90]);

  // left wall
  box(0.34, 0.15, 0.22, STONE, -0.88, G + 0.065, -0.45, 8);
  box(0.3, 0.15, 0.22, STONE2, -0.66, G + 0.065, -0.47, -4);
  box(0.3, 0.15, 0.22, STONE2, -0.86, G + 0.205, -0.45, 6);
  box(0.26, 0.15, 0.22, STONE, -0.68, G + 0.205, -0.47, -2);
  box(0.28, 0.15, 0.22, STONE, -0.84, G + 0.345, -0.46, 3);

  // pedestal with a floating hydro crystal
  box(0.3, 0.1, 0.3, STONE2, 1.0, G + 0.04, 0.4);
  box(0.22, 0.28, 0.22, STONE, 1.0, G + 0.23, 0.4);
  box(0.3, 0.07, 0.3, STONE2, 1.0, G + 0.405, 0.4);
  box(0.222, 0.016, 0.222, GOLD, 1.0, G + 0.12, 0.4);
  glow(
    b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
      at: [1.0, G + 0.23, 0.4 + 0.114],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.07, 0), CYAN, {
      at: [1.0, G + 0.62, 0.4],
      scale: [0.8, 1.3, 0.8],
      flat: true,
    }),
    1.4,
  );

  // stepping stones and rubble
  for (const [x, z] of [
    [-0.35, 0.15],
    [-0.46, 0.4],
    [-0.4, 0.72],
    [-0.2, 0.97],
    [0.02, 1.05],
    [0.25, 1.1],
  ])
    cyl(0.1, 0.11, 0.04, 7, STONE2, x, G + 0.005, z, [0, R() * 60, 0]);
  for (const [x, z] of [
    [0.55, -0.2],
    [-0.3, -0.75],
    [0.15, -1.1],
    [0.7, -0.85],
    [-0.9, 0.0],
    [0.45, 0.0],
  ]) {
    const s = 0.05 + R() * 0.04;
    b.part(new THREE.DodecahedronGeometry(s, 0), i2(R()), {
      at: [x, G + s * 0.6, z],
      scale: [1.3, 0.8, 1],
      rotation: [R() * 40, R() * 180, R() * 40],
      flat: true,
    });
  }
  function i2(v: number): Fill {
    return v > 0.5 ? STONE : STONE2;
  }
  // grey boulders
  for (const [x, z, s] of [
    [-1.0, 0.55, 0.16],
    [-1.05, 0.38, 0.1],
    [0.95, -0.85, 0.14],
  ])
    b.part(new THREE.DodecahedronGeometry(1, 0), cel("#a6a29a"), {
      at: [x, G + s * 0.5, z],
      scale: [s * 1.2, s * 0.9, s],
      rotation: [R() * 40, R() * 180, R() * 30],
      flat: true,
    });

  // --- Trees -------------------------------------------------------------------------------------------------
  const tree = (
    base: [number, number],
    trunk: Pt[],
    radii: number[],
    blobs: Array<[number, number, number, number]>,
    cardCount: number,
  ) => {
    b.sweep(catmull(trunk), radii, BARK, { sides: 7 });
    for (let k = 0; k < 3; k++) {
      const a = k * 120 + 20;
      const ox = Math.sin(a * DEG);
      const oz = Math.cos(a * DEG);
      b.sweep(
        catmull([
          [base[0] + ox * 0.02, G + 0.22, base[1] + oz * 0.02],
          [base[0] + ox * 0.16, G + 0.06, base[1] + oz * 0.16],
          [base[0] + ox * 0.34, G - 0.01, base[1] + oz * 0.34],
        ]),
        [radii[0] * 0.5, 0.015],
        BARK,
        { sides: 6 },
      );
    }
    const top = trunk[trunk.length - 1];
    blobs.forEach(([x, y, z, r], i) => {
      if (Math.hypot(x - top[0], y - top[1], z - top[2]) > 0.12)
        b.rod(top, [x, y - r * 0.3, z], [radii[radii.length - 1] * 0.75, 0.02], BARK, { sides: 6 });
      b.part(new THREE.IcosahedronGeometry(r, 1), GREENS[i % 3], {
        at: [x, y, z],
        scale: [1, 0.85, 1],
        rotation: [R() * 60, R() * 60, 0],
        flat: true,
      });
      const fr: Fr[] = [];
      for (let k = 0; k < cardCount; k++) {
        const yy = 0.9 - (1.1 * (k + 0.5)) / cardCount;
        const rr = Math.sqrt(1 - yy * yy);
        const a = k * 2.399963;
        const d: Pt = [rr * Math.cos(a), yy, rr * Math.sin(a)];
        fr.push(frame([x + d[0] * r, y + d[1] * r * 0.85, z + d[2] * r], d));
      }
      b.cards(fr, LEAF, { size: [0.22, 0.2], lean: 30, vary: 0.3, spin: 180, rng: R, color: TINTS[i % 3], sink: 0.3 });
    });
  };
  tree(
    [-0.85, 0.05],
    [
      [-0.85, G - 0.04, 0.05],
      [-0.82, 1.82, 0.08],
      [-0.93, 2.08, 0.06],
      [-0.85, 2.3, 0.0],
    ],
    [0.19, 0.13, 0.1, 0.07],
    [
      [-0.85, 2.52, -0.02, 0.5],
      [-1.1, 2.33, 0.14, 0.36],
      [-0.5, 2.42, -0.12, 0.38],
      [-0.8, 2.84, -0.1, 0.34],
      [-1.0, 2.62, -0.3, 0.3],
    ],
    34,
  );
  tree(
    [1.0, -0.1],
    [
      [1.0, G - 0.03, -0.1],
      [1.03, 1.78, -0.08],
      [0.96, 1.98, -0.1],
    ],
    [0.12, 0.08, 0.055],
    [
      [0.98, 2.2, -0.1, 0.34],
      [1.15, 2.05, 0.05, 0.24],
      [0.8, 2.1, -0.2, 0.26],
    ],
    22,
  );
  // bushes
  for (const [x, z, r, i] of [
    [-1.0, -0.3, 0.2, 0],
    [1.0, 0.1, 0.17, 1],
    [-0.2, -0.95, 0.15, 2],
    [-1.1, 0.75, 0.15, 0],
  ] as Array<[number, number, number, number]>) {
    b.part(new THREE.IcosahedronGeometry(r, 1), GREENS[i], {
      at: [x, G + r * 0.55, z],
      scale: [1, 0.8, 1],
      rotation: [R() * 60, R() * 60, 0],
      flat: true,
    });
    const fr: Fr[] = [];
    for (let k = 0; k < 10; k++) {
      const yy = 0.8 - (k * 1.2) / 10;
      const rr = Math.sqrt(1 - yy * yy);
      const a = k * 2.4;
      const d: Pt = [rr * Math.cos(a), yy, rr * Math.sin(a)];
      fr.push(frame([x + d[0] * r, G + r * 0.55 + d[1] * r * 0.8, z + d[2] * r], d));
    }
    b.cards(fr, LEAF, { size: [0.14, 0.13], lean: 30, vary: 0.3, spin: 180, rng: R, color: TINTS[i], sink: 0.3 });
  }

  // --- Vines -------------------------------------------------------------------------------------------------
  const vine = (pts: Pt[], out: Pt) => {
    b.sweep(catmull(pts), 0.009, VINE, { sides: 5 });
    pts.forEach((p, i) => {
      if (i === 0) return;
      for (let k = 0; k < 2; k++) {
        const q: Pt = [p[0] + (R() - 0.5) * 0.05 + out[0] * 0.015, p[1] + (R() - 0.5) * 0.04, p[2] + (R() - 0.5) * 0.05 + out[2] * 0.015];
        leaves.push(frame(q, out));
      }
    });
  };
  const wallVine = (x: number, y: number, z: number, len: number, out: Pt) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++)
      pts.push([x + Math.sin(i * 1.7) * 0.03, y - (len * i) / 5, z + out[2] * 0.0]);
    vine(pts, out);
  };
  wallVine(0.4, SY + 0.0, -0.62, 0.7, [0, 0, 1]);
  wallVine(-0.4, SY - 0.1, -0.62, 0.55, [0, 0, 1]);
  wallVine(0.0, SY + 0.35, -0.6, 0.3, [0, 0, 1]);
  wallVine(0.88, G + 1.0, -0.38, 0.8, [0, 0, 1]);
  wallVine(-0.6, G + 0.75, -0.89, 0.6, [0, 0, 1]);
  wallVine(-0.88, G + 0.4, -0.33, 0.3, [0, 0, 1]);
  const rimVines: Array<[number, number, number]> = [
    [200, 1.38, 0.3],
    [230, 1.36, 0.4],
    [300, 1.37, 0.25],
    [150, 1.38, 0.35],
    [100, 1.36, 0.28],
    [345, 1.37, 0.3],
    [75, 1.37, 0.22],
    [130, 1.37, 0.5],
    [260, 1.36, 0.45],
    [0, 1.37, 0.3],
    [50, 1.37, 0.25],
    [15, 1.37, 0.3],
  ];
  for (const [th, top, len] of rimVines) {
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++) {
      const y = top - (len * i) / 5;
      const r = (y > 1.35 ? 1.32 : rockR(y) + 0.05) + 0.0;
      pts.push(polar(r, y, th + Math.sin(i * 1.3) * 3));
    }
    vine(pts, polar(1, 0, th));
  }
  b.cards(leaves, IVY, {
    size: [0.1, 0.1],
    lean: 35,
    flow: [0, -1, 0],
    vary: 0.3,
    spin: 60,
    rng: R,
    sink: 0.2,
  });

  // --- Grass tufts and flowers -------------------------------------------------------------------------------
  const tufts: Fr[] = [];
  const blooms: Fr[] = [];
  for (let k = 0; k < 400 && (tufts.length < 90 || blooms.length < 34); k++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * 1.2;
    const x = r * Math.cos(a);
    const z = r * Math.sin(a);
    if (inPool(x, z) || (Math.abs(x) < 0.62 && z < -0.1 && z > -1.05)) continue;
    if (Math.hypot(x + 0.85, z - 0.05) < 0.25 || Math.hypot(x - 1.0, z + 0.1) < 0.2) continue;
    if (r > 0.9 && blooms.length < 34 && R() < 0.4) blooms.push(frame([x, G, z], [0, 1, 0]));
    else if (tufts.length < 90) tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, BLADES, { size: [0.1, 0.13], cross: true, vary: 0.4, spin: 180, rng: R, sink: 0.15 });
  b.cards(blooms, FLOWERS, { size: [0.07, 0.07], vary: 0.3, rng: R, spin: 180, sink: 0.1 });

  // --- Floating islets and wisps -----------------------------------------------------------------------------
  const islet = (x: number, y: number, z: number, s: number) => {
    b.part(new THREE.ConeGeometry(s, s * 1.6, 7), ROCK, { at: [x, y, z], rotation: [180, R() * 60, 0], flat: true });
    cyl(s * 1.05, s * 1.05, 0.05, 8, GRASS, x, y + s * 0.8 + 0.02, z);
    crystal(x, y + s * 0.8 + 0.04, z, s * 0.9, 10, -8);
  };
  islet(1.5, 0.95, 0.3, 0.14);
  islet(-1.45, 0.55, -0.4, 0.12);
  for (const [x, y, z, c] of [
    [-0.4, 2.2, 0.9, 0],
    [0.9, 2.6, 0.6, 1],
    [-1.3, 1.9, 0.6, 0],
    [1.3, 2.3, -0.5, 0],
    [0.2, 3.1, -0.3, 1],
    [-0.1, 2.0, 1.2, 0],
    [1.2, 1.4, 1.0, 0],
    [-1.35, 3.0, -0.6, 1],
    [0.7, 2.9, -1.0, 0],
    [-0.8, 3.2, 0.5, 0],
  ] as Array<[number, number, number, number]>)
    glow(ball(0.028, c ? "#ffe9a0" : "#c8fbff", x, y, z, 5), 1.5);

  return b.root;
}
