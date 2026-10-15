import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, patches } from "../../../../src/paint";
import type { Part } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Island Ruins",
  description:
    "A floating sky island with an ivy-covered stone archway, steps, pillars, a glowing pool that spills into a waterfall, two trees and anemo crystals, in cel-shaded Genshin-style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const G = 1.05; // grass surface height
const TAU = Math.PI * 2;

// Island profile: [height, radius]
const PROF: Array<[number, number]> = [
  [0, 0.1],
  [0.1, 0.25],
  [0.3, 0.6],
  [0.55, 0.9],
  [0.8, 1.1],
  [1.0, 1.15],
];
function R(y: number) {
  if (y >= 1) return 1.15;
  if (y <= 0) return 0.1;
  for (let i = 0; i < PROF.length - 1; i++) {
    const [y0, r0] = PROF[i];
    const [y1, r1] = PROF[i + 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 1.15;
}
const FALL_X = 0.4;
function zAt(y: number) {
  const rc = y > 0.9 ? 1.22 : R(y);
  return Math.sqrt(Math.max(rc * rc - FALL_X * FALL_X, 0.01)) + 0.06;
}

const MORTAR = "#8d8266";
const MOSS = "#6fae3a";
const STONE_TONES = ["#d8cdb0", "#cdbf9f", "#e2d8be", "#c2b595"];

function masonry(rowH: number, blockW: number, seedv: number) {
  return cel(
    paint((p, n) => {
      const h = p.y - G;
      if (n.y > 0.7) return noise(p, 0.12, seedv) > 0.64 ? MOSS : STONE_TONES[0];
      if (h < 0.05 + 0.07 * noise(p, 0.1, seedv + 1)) return noise(p, 0.05, seedv + 2) > 0.4 ? MOSS : "#5b9a34";
      const row = Math.floor(p.y / rowH);
      const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
      const q = (u + (row & 1) * blockW * 0.5) / blockW;
      const col = Math.floor(q);
      const fx = q - col;
      const fy = p.y / rowH - row;
      if (fx * blockW < 0.007 || fy * rowH < 0.007) return MORTAR;
      const hsh = Math.abs(Math.sin(row * 12.9898 + col * 78.233 + seedv) * 43758.5453) % 1;
      return STONE_TONES[Math.floor(hsh * STONE_TONES.length)];
    }),
  );
}

const ROCK_BROWN = cel(patches("#6e5240", ["#8c6a4c", "#a07a56", "#7d6552"], { size: 0.3, gap: 0.07, seed: 4 }));
const ROCK_GRAY = cel(patches("#5f5a5e", ["#8b8c92", "#9a9aa0", "#777a84"], { size: 0.26, gap: 0.07, seed: 8 }));
const ROCK_PALE = cel(patches("#8d8266", ["#cfc3a3", "#d9cfb4", "#c4b898"], { size: 0.24, gap: 0.06, seed: 12 }));
const GRASSM = mottle("#7fcb42", "#58ad39", { size: 0.35, seed: 2, contrast: 1.2 });
const CAP = cel(paint((_p, n) => (n.y < -0.3 ? "#6b4a30" : GRASSM)));
const GRASS = cel(GRASSM);
const BARK = cel(grain("#8b5a38", "#684027", { size: 0.02, axis: "y" }));
const LEAF1 = cel(mottle("#6cc23a", "#3f9e32", { size: 0.22, seed: 3, contrast: 1.2 }));
const LEAF2 = cel(mottle("#92d848", "#58b238", { size: 0.2, seed: 6, contrast: 1.2 }));
const GOLD = cel("#f2c14e", "#b97b2b");
const DARKSTONE = cel("#a89c7e");
const WATER_PAINT = paint((p, n) => {
  const k = Math.sin(p.x * 60 + Math.sin(p.y * 9) * 1.4);
  if (n.z < -0.2) return "#2a9ad8";
  if (k > 0.55) return "#9ae8ff";
  if (k < -0.6) return "#1fa0e0";
  return "#35c4f2";
});

const RUNE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L58 32 L32 60 L6 32Z" fill="none" stroke="#8ff7ff" stroke-width="3.5"/>
<path d="M32 17 L45 32 L32 47 L19 32Z" fill="#8ff7ff"/><circle cx="32" cy="32" r="5" fill="#0e5a78"/>
<path d="M32 4 L32 12 M32 52 L32 60 M6 32 L14 32 M50 32 L58 32" stroke="#8ff7ff" stroke-width="3.5"/></svg>`,
  { size: 128 },
);
const LEAF_TEX = [
  svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 C4 22 4 8 16 2 C28 8 28 22 16 30Z" fill="#7fd13f"/><path d="M16 29 L16 6" stroke="#4a9a2c" stroke-width="2" fill="none"/></svg>`,
    { size: 64 },
  ),
  svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 C4 22 4 8 16 2 C28 8 28 22 16 30Z" fill="#4fb035"/><path d="M16 29 L16 6" stroke="#2f7f26" stroke-width="2" fill="none"/></svg>`,
    { size: 64 },
  ),
];
const GRASS_TEX = svg(
  `<svg viewBox="0 0 32 40"><path d="M6 40 Q8 20 4 4 Q14 18 14 40Z" fill="#7ed04a"/><path d="M12 40 Q16 14 18 0 Q22 16 22 40Z" fill="#5ab83a"/><path d="M20 40 Q26 22 30 8 Q30 26 26 40Z" fill="#8fdc55"/></svg>`,
  { size: 96 },
);
const VINE_TEX = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 0 C6 16 18 32 12 64" stroke="#3f8f2e" stroke-width="2.4" fill="none"/>
<ellipse cx="6" cy="14" rx="5" ry="3" transform="rotate(-30 6 14)" fill="#6cc23a"/>
<ellipse cx="18" cy="26" rx="5.5" ry="3.2" transform="rotate(30 18 26)" fill="#84d040"/>
<ellipse cx="6" cy="38" rx="5.5" ry="3.2" transform="rotate(-30 6 38)" fill="#5db536"/>
<ellipse cx="18" cy="50" rx="5.5" ry="3.2" transform="rotate(30 18 50)" fill="#6cc23a"/>
<ellipse cx="7" cy="60" rx="5" ry="3" transform="rotate(-30 7 60)" fill="#84d040"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "floatingIsland", paintSize: 2048 });
  const J = b.joint("base", { at: [0, 0, 0] });

  const box = (
    w: number,
    h: number,
    d: number,
    color: Parameters<typeof b.part>[1],
    x: number,
    y: number,
    z: number,
    ry = 0,
    rx = 0,
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [rx, ry, 0] });

  // ---------- island body ----------
  b.lathe(
    [
      [0, 1.0],
      [1.15, 1.0],
      [1.1, 0.8],
      [0.9, 0.55],
      [0.6, 0.3],
      [0.25, 0.1],
      [0.1, 0.0],
      [0, 0.0],
    ],
    { at: [0, 0, 0], segments: 10, color: ROCK_BROWN },
  );
  b.lathe(
    [
      [0, 1.05],
      [0.9, 1.05],
      [1.12, 1.03],
      [1.2, 0.98],
      [1.22, 0.92],
      [1.12, 0.88],
      [0, 0.88],
    ],
    { at: [0, 0, 0], segments: 14, color: CAP },
  );

  // rock chunks around the cliff
  const rr = rng(11);
  const rockCols = [ROCK_BROWN, ROCK_GRAY, ROCK_PALE];
  for (let i = 0; i < 30; i++) {
    const th = rr() * 360;
    if (th > 3 && th < 45) continue;
    const y = 0.42 + rr() * 0.5;
    const rad = 0.13 + 0.15 * rr() + y * 0.05;
    const rc = R(y) * 0.95;
    const x = Math.sin((th * Math.PI) / 180) * rc;
    const z = Math.cos((th * Math.PI) / 180) * rc;
    b.part(new THREE.IcosahedronGeometry(rad, 0), rockCols[i % 3], {
      at: [x, y, z],
      rotation: [rr() * 360, rr() * 360, rr() * 360],
      scale: [1, 0.85, 1.1],
      flat: true,
    });
    if (i % 2 === 0 && y > 0.55)
      b.part(new THREE.IcosahedronGeometry(1, 0), MOSS, {
        at: [x, y + rad * 0.62, z],
        scale: [rad * 0.85, rad * 0.28, rad * 0.85],
        flat: true,
      });
  }
  // grass lip blobs
  const rl = rng(21);
  for (let i = 0; i < 22; i++) {
    const th = rl() * 360;
    if (th > 3 && th < 45) continue;
    const a = (th * Math.PI) / 180;
    const rad = 0.07 + 0.06 * rl();
    b.part(new THREE.IcosahedronGeometry(rad, 0), i % 2 ? GRASS : LEAF2, {
      at: [Math.sin(a) * 1.18, 0.98, Math.cos(a) * 1.18],
      scale: [1, 0.7, 1],
      rotation: [rl() * 360, rl() * 360, 0],
      flat: true,
    });
  }
  // hanging roots
  for (let k = 0; k < 7; k++) {
    const th = ((60 + k * 45) * Math.PI) / 180;
    const y0 = 0.8 - (k % 3) * 0.08;
    const r0 = R(y0) * 0.9;
    const r1 = R(y0 - 0.3) + 0.04;
    b.sweep(
      catmull([
        [Math.sin(th) * r0, y0, Math.cos(th) * r0],
        [Math.sin(th) * (r0 + 0.07), y0 - 0.15, Math.cos(th) * (r0 + 0.07)],
        [Math.sin(th) * r1, y0 - 0.32, Math.cos(th) * r1],
      ]),
      [0.03, 0.006],
      "#5a3a24",
      { caps: { start: "flat", end: "round" }, sides: 5 },
    );
  }
  // floating satellites
  const sat: Array<[number, number, number, number]> = [
    [-1.05, 0.5, 0.2, 0.11],
    [1.12, 0.38, 0.3, 0.08],
    [-0.45, 0.2, 0.75, 0.07],
    [0.95, 0.6, -0.55, 0.09],
    [-0.8, 0.12, -0.45, 0.07],
  ];
  sat.forEach(([x, y, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), rockCols[i % 3], {
      at: [x, y, z],
      rotation: [i * 40, i * 70, 10],
      scale: [1, 0.9, 1],
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(1, 0), MOSS, {
      at: [x, y + r * 0.6, z],
      scale: [r * 0.8, r * 0.25, r * 0.8],
      flat: true,
    });
  });
  // underside crystals
  [200, 250, 300, 160].forEach((th, i) => {
    const a = (th * Math.PI) / 180;
    const y = 0.45 + (i % 2) * 0.08;
    const rc = R(y) * 0.98;
    const dir = [Math.sin(a) * 0.7, -0.6, Math.cos(a) * 0.7];
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), i % 2 ? "#59e6ff" : "#9df3ff", {
        at: [Math.sin(a) * (rc + 0.06), y, Math.cos(a) * (rc + 0.06)],
        dir,
        scale: [0.045, 0.14, 0.045],
        flat: true,
      }),
      1.3,
    );
  });

  // ---------- water ----------
  const POOL = [0.4, 0.5];
  glow(
    b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.04, 14), "#37c8f0", { at: [POOL[0], G + 0.005, POOL[1]] }),
    0.7,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.17, 0.006, 4, 16), "#d6faff", {
      at: [POOL[0] - 0.03, G + 0.026, POOL[1] - 0.02],
      rotation: [90, 0, 0],
    }),
    1,
  );
  for (let i = 1; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.17, 0.07, 0.1), i % 3 ? DARKSTONE : ROCK_PALE, {
      at: [POOL[0] + Math.sin(a) * 0.34, G + 0.03, POOL[1] + Math.cos(a) * 0.34],
      rotation: [0, i * 30 + (i % 2) * 4, (i % 2) * 3],
    });
  }
  [
    [0.25, 0.42],
    [0.5, 0.35],
    [0.45, 0.6],
  ].forEach(([x, z], i) => {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 8), LEAF2, { at: [x, G + 0.032, z] });
    if (i === 1) b.part(new THREE.SphereGeometry(0.015, 6, 4), "#ff9ec2", { at: [x, G + 0.045, z] });
  });
  glow(b.part(new THREE.BoxGeometry(0.26, 0.03, 0.52), "#37c8f0", { at: [FALL_X, G - 0.005, 0.96] }), 0.7);
  const fallY = [1.04, 0.98, 0.9, 0.78, 0.62, 0.46, 0.34];
  b.sweep(
    catmull(fallY.map((y) => [FALL_X, y, zAt(y)])),
    (t) => [0.17 - 0.03 * t, 0.04 + 0.03 * t],
    { section: "box", caps: "flat", color: WATER_PAINT },
  );
  [
    [0, 0.31, 0.07],
    [-0.07, 0.28, 0.05],
    [0.07, 0.27, 0.06],
    [0.0, 0.33, 0.1],
  ].forEach(([dx, y, r], i) => {
    glow(
      b.part(new THREE.IcosahedronGeometry(r, 0), "#d8f8ff", {
        at: [FALL_X + dx, y, zAt(0.38) - 0.04 + (i % 2) * 0.05],
        flat: true,
      }),
      0.9,
    );
  });
  [0.2, 0.12, 0.06].forEach((y, i) => {
    glow(
      b.part(new THREE.SphereGeometry(0.014, 5, 4), "#aeeeff", {
        at: [FALL_X + (i - 1) * 0.06, y + 0.02, zAt(0.36) - 0.05],
      }),
      1,
    );
  });

  // ---------- ruins ----------
  const RX = 0.05;
  const RZ = -0.55;
  const ARCH_C = G + 0.65;
  const archStone = paint((p, n) => {
    const a = (Math.atan2(p.y - ARCH_C, p.x - RX) * 180) / Math.PI;
    const k = a / 11;
    const col = Math.floor(k);
    if (n.y > 0.7 && noise(p, 0.12, 3) > 0.6) return MOSS;
    if (k - col < 0.05) return MORTAR;
    const hsh = Math.abs(Math.sin(col * 12.9898 + 4.1) * 43758.5453) % 1;
    return STONE_TONES[Math.floor(hsh * STONE_TONES.length)];
  });
  const STONE_A = masonry(0.1, 0.2, 1);
  const STONE_B = masonry(0.08, 0.16, 5);
  const archPath = arc([RX + 0.42, ARCH_C, RZ], [RX + 0.42, ARCH_C, RZ], [0, 0, 1], 180);
  b.sweep(archPath, [0.11, 0.11], { section: "box", caps: "flat", color: cel(archStone) });
  for (const zOff of [0.118, -0.118])
    b.sweep(arc([RX + 0.42, ARCH_C, RZ + zOff], [RX + 0.42, ARCH_C, RZ + zOff], [0, 0, 1], 180), 0.011, GOLD, {
      sides: 5,
      caps: "flat",
    });
  // keystone
  box(0.18, 0.2, 0.25, STONE_B, RX, ARCH_C + 0.42, RZ);
  box(0.2, 0.025, 0.27, GOLD, RX, ARCH_C + 0.53, RZ);
  glow(
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      at: [RX, ARCH_C + 0.42, RZ + 0.127],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.3,
  );
  for (const s of [1, -1]) {
    const px = RX + s * 0.42;
    box(0.38, 0.1, 0.34, STONE_A, px, G + 0.05, RZ);
    box(0.28, 0.45, 0.26, STONE_B, px, G + 0.325, RZ);
    box(0.34, 0.08, 0.3, STONE_A, px, G + 0.62, RZ);
    box(0.345, 0.02, 0.305, GOLD, px, G + 0.575, RZ);
    box(0.295, 0.02, 0.275, GOLD, px, G + 0.2, RZ);
    box(0.3, 0.02, 0.28, GOLD, px, G + 0.12, RZ);
    glow(
      b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
        at: [px, G + 0.38, RZ + 0.134],
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNE,
      }),
      1.1,
    );
  }
  // platform and steps
  box(0.7, 0.14, 0.3, STONE_A, RX, G + 0.07, RZ + 0.02);
  for (let i = 0; i < 4; i++) {
    const h = 0.035 * (i + 1);
    box(0.7 - i * 0.02, h, 0.1, STONE_A, RX, G + h / 2, -0.1 - i * 0.08);
    box(0.68 - i * 0.02, 0.008, 0.012, GOLD, RX, G + h + 0.002, -0.058 - i * 0.08);
  }
  // side walls
  box(0.55, 0.2, 0.2, STONE_B, -0.58, G + 0.1, RZ);
  box(0.4, 0.14, 0.2, STONE_A, -0.5, G + 0.27, RZ);
  box(0.58, 0.04, 0.24, GOLD, -0.58, G + 0.215, RZ);
  box(0.2, 0.1, 0.2, STONE_A, -0.68, G + 0.4, RZ, 8);
  box(0.4, 0.26, 0.2, STONE_B, 0.7, G + 0.13, RZ);
  box(0.3, 0.1, 0.22, STONE_A, 0.72, G + 0.31, RZ, 3);
  box(0.42, 0.04, 0.24, GOLD, 0.7, G + 0.275, RZ);
  box(0.26, 0.05, 0.24, MOSS, 0.7, G + 0.37, RZ, 0);
  box(0.4, 0.04, 0.22, MOSS, -0.58, G + 0.2, RZ);
  // fallen blocks
  box(0.16, 0.09, 0.12, STONE_B, -0.15, G + 0.045, -0.15, 25);
  box(0.12, 0.08, 0.1, STONE_A, 0.42, G + 0.04, -0.28, -20);
  box(0.1, 0.06, 0.1, STONE_B, -0.4, G + 0.03, -0.3, 35, 6);
  box(0.14, 0.1, 0.12, STONE_A, 0.8, G + 0.05, -0.3, 10);
  // free columns
  const column = (x: number, z: number, h: number, broken: boolean) => {
    b.part(new THREE.CylinderGeometry(0.15, 0.16, 0.07, 8), STONE_A, { at: [x, G + 0.035, z] });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, h, 8), STONE_B, { at: [x, G + 0.07 + h / 2, z] });
    b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.022, 8), GOLD, { at: [x, G + 0.07 + h * 0.3, z] });
    if (!broken) {
      b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.06, 8), STONE_A, { at: [x, G + 0.07 + h + 0.03, z] });
      b.part(new THREE.BoxGeometry(0.26, 0.06, 0.26), STONE_A, { at: [x, G + 0.07 + h + 0.09, z] });
      b.part(new THREE.BoxGeometry(0.265, 0.014, 0.265), GOLD, { at: [x, G + 0.07 + h + 0.062, z] });
    } else {
      b.part(new THREE.IcosahedronGeometry(0.1, 0), STONE_A, {
        at: [x, G + 0.07 + h, z],
        scale: [1, 0.5, 1],
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.22, 8), STONE_B, {
        at: [x + 0.2, G + 0.09, z + 0.12],
        rotation: [0, 20, 90],
      });
    }
  };
  column(-0.55, 0.25, 0.3, true);
  column(0.78, -0.25, 0.62, false);
  // pedestal
  box(0.3, 0.26, 0.3, STONE_A, 0.98, G + 0.13, 0.25);
  box(0.37, 0.05, 0.37, STONE_B, 0.98, G + 0.285, 0.25);
  box(0.385, 0.012, 0.385, GOLD, 0.98, G + 0.26, 0.25);
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      at: [0.98, G + 0.14, 0.25 + 0.154],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.1,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), "#7defff", {
      at: [0.98, G + 0.44, 0.25],
      scale: [0.07, 0.11, 0.07],
      flat: true,
    }),
    1.5,
  );
  // flagstones
  [
    [0.0, 0.0, 10],
    [-0.1, 0.15, -15],
    [0.0, 0.3, 20],
    [0.1, 0.4, 0],
    [0.2, 0.12, 30],
    [-0.25, 0.4, 5],
    [-0.15, -0.08, 40],
  ].forEach(([x, z, ry], i) => {
    b.part(new THREE.BoxGeometry(0.17, 0.025, 0.14), i % 2 ? ROCK_PALE : DARKSTONE, {
      at: [x, G + 0.008, z],
      rotation: [0, ry, 0],
    });
  });
  // hanging lantern in the gate
  b.rod([RX, ARCH_C + 0.31, RZ], [RX, ARCH_C + 0.2, RZ], 0.006, GOLD, { sides: 5 });
  b.part(new THREE.ConeGeometry(0.06, 0.06, 8), GOLD, { at: [RX, ARCH_C + 0.17, RZ] });
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), "#8ff7ff", { at: [RX, ARCH_C + 0.115, RZ] }), 1.3);
  b.part(new THREE.ConeGeometry(0.04, 0.05, 8), GOLD, { at: [RX, ARCH_C + 0.065, RZ], rotation: [180, 0, 0] });
  for (const dx of [-0.015, 0, 0.015])
    b.rod([RX + dx, ARCH_C + 0.04, RZ], [RX + dx * 2, ARCH_C - 0.04, RZ], 0.004, "#2fc7c0", { sides: 4 });

  // ---------- trees and bushes ----------
  const cluster = (cx: number, cy: number, cz: number, r: number, seed: number, n: number) => {
    const out: Part[] = [];
    const rc = rng(seed);
    for (let k = 0; k < n; k++) {
      const a = rc() * TAU;
      const e = (rc() - 0.3) * 1.2;
      const d = k === 0 ? 0 : r * (0.55 + 0.3 * rc());
      const rad = r * (0.42 + 0.22 * rc());
      out.push(
        b.part(new THREE.IcosahedronGeometry(rad, 1), k % 2 ? LEAF1 : LEAF2, {
          at: [cx + Math.cos(a) * Math.cos(e) * d, cy + Math.sin(e) * d * 0.8, cz + Math.sin(a) * Math.cos(e) * d],
          rotation: [rc() * 360, rc() * 360, 0],
          scale: [1, 0.85, 1],
          flat: true,
        }),
      );
    }
    return out;
  };
  const tree = (x: number, z: number, h: number, tr: number, cr: number, seed: number, nCl: number, dx: number) => {
    b.sweep(
      catmull([
        [x, G - 0.04, z],
        [x + dx * 0.3, G + h * 0.3, z],
        [x + dx * 0.7, G + h * 0.65, z - 0.04],
        [x + dx, G + h, z - 0.04],
      ]),
      [tr * 1.25, tr, tr * 0.75, tr * 0.55],
      BARK,
      { sides: 8 },
    );
    for (let k = 0; k < 5; k++) {
      const a = ((k * 72 + seed * 10) * Math.PI) / 180;
      b.sweep(
        catmull([
          [x + Math.sin(a) * tr * 0.5, G + h * 0.14, z + Math.cos(a) * tr * 0.5],
          [x + Math.sin(a) * tr * 1.8, G + h * 0.03, z + Math.cos(a) * tr * 1.8],
          [x + Math.sin(a) * tr * 3.4, G, z + Math.cos(a) * tr * 3.4],
        ]),
        [tr * 0.55, tr * 0.12],
        BARK,
        { caps: { start: "flat", end: "round" }, sides: 6 },
      );
    }
    const cx = x + dx;
    const cy = G + h + cr * 0.35;
    const cz = z - 0.04;
    for (const s of [1, -1])
      b.sweep(
        catmull([
          [x + dx * 0.6, G + h * 0.6, z - 0.03],
          [cx + s * cr * 0.35, cy - cr * 0.3, cz],
          [cx + s * cr * 0.75, cy + 0.02, cz + 0.05],
        ]),
        [tr * 0.45, tr * 0.15],
        BARK,
        { caps: { start: "flat", end: "round" }, sides: 6 },
      );
    return cluster(cx, cy, cz, cr, seed, nCl);
  };
  const bigCan = tree(-0.6, -0.1, 0.7, 0.075, 0.5, 31, 14, 0.12);
  const smallCan = tree(0.92, -0.02, 0.4, 0.045, 0.3, 41, 8, 0.03);
  const bushCans: Part[] = [];
  (
    [
      [-0.95, 0.5, 0.17],
      [-0.9, -0.4, 0.2],
      [-0.25, -0.95, 0.16],
      [0.4, -0.92, 0.18],
      [0.75, -0.75, 0.14],
      [1.0, 0.45, 0.12],
    ] as Array<[number, number, number]>
  ).forEach(([x, z, r], i) => bushCans.push(...cluster(x, G + r * 0.6, z, r, 60 + i, 5)));

  const leafFrames = (parts: Part[], count: number, seed: number) =>
    b.surface(parts).scatter(count, { rng: rng(seed), minDist: 0.04, filter: (h) => h.n.y > -0.1 });
  const leafFlow = (_f: unknown, i: number) => [Math.sin(i * 2.4), -0.2, Math.cos(i * 2.4)];
  b.cards(leafFrames(bigCan, 170, 71), LEAF_TEX, {
    size: [0.09, 0.09],
    lean: 50,
    flow: leafFlow,
    vary: 0.3,
    rng: rng(72),
  });
  b.cards(leafFrames(smallCan, 80, 73), LEAF_TEX, {
    size: [0.08, 0.08],
    lean: 50,
    flow: leafFlow,
    vary: 0.3,
    rng: rng(74),
  });
  b.cards(leafFrames(bushCans, 90, 75), LEAF_TEX, {
    size: [0.07, 0.07],
    lean: 50,
    flow: leafFlow,
    vary: 0.3,
    rng: rng(76),
  });

  // ---------- ground dressing ----------
  const ok = (x: number, z: number) => {
    if (Math.hypot(x - POOL[0], z - POOL[1]) < 0.42) return false;
    if (x > 0.25 && x < 0.55 && z > 0.5) return false;
    if (z < -0.38 && z > -0.72 && x > -0.85 && x < 0.95) return false;
    if (x > -0.35 && x < 0.45 && z > -0.45 && z < 0.08) return false;
    if (Math.hypot(x - 0.98, z - 0.25) < 0.25) return false;
    return true;
  };
  const rt = rng(5);
  const tufts: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 400 && tufts.length < 80; i++) {
    const a = rt() * TAU;
    const d = Math.sqrt(rt()) * 1.08;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (!ok(x, z)) continue;
    tufts.push(frame([x, G + 0.008, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS_TEX, { size: [0.11, 0.12], cross: true, vary: 0.35, spin: 180, rng: rng(9) });

  const rf = rng(15);
  const heads: Array<THREE.BufferGeometry> = [];
  const heads2: Array<THREE.BufferGeometry> = [];
  const stems: Array<THREE.BufferGeometry> = [];
  for (let i = 0; i < 400 && heads.length + heads2.length < 36; i++) {
    const a = rf() * TAU;
    const d = Math.sqrt(rf()) * 1.05;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (!ok(x, z)) continue;
    const g = new THREE.SphereGeometry(0.016, 5, 4).translate(x, G + 0.07, z);
    (heads.length < 22 ? heads : heads2).push(g);
    stems.push(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 4).translate(x, G + 0.035, z));
  }
  b.part(mergeGeometries(heads)!, "#fffdf0", { bone: J, at: [0, 0, 0] });
  b.part(mergeGeometries(heads2)!, "#7aa8ff", { bone: J, at: [0, 0, 0] });
  b.part(mergeGeometries(stems)!, "#4a9a2c", { bone: J, at: [0, 0, 0] });

  // boulders on top
  (
    [
      [-0.85, 0.32, 0.12],
      [-1.0, 0.1, 0.09],
      [0.6, 0.85, 0.08],
    ] as Array<[number, number, number]>
  ).forEach(([x, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? ROCK_PALE : ROCK_GRAY, {
      at: [x, G + r * 0.5, z],
      rotation: [i * 50, i * 80, 0],
      scale: [1, 0.85, 1],
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(1, 0), MOSS, {
      at: [x, G + r * 1.05, z],
      scale: [r * 0.7, r * 0.22, r * 0.7],
      flat: true,
    });
  });

  // ---------- vines ----------
  const vineFrames: Array<ReturnType<typeof frame>> = [];
  const rv = rng(33);
  for (let k = 0; k < 24; k++) {
    const th = 50 + (k / 24) * 310 + rv() * 8;
    const a = (th * Math.PI) / 180;
    vineFrames.push(frame([Math.sin(a) * 1.18, 0.98, Math.cos(a) * 1.18], [0, 1, 0]));
  }
  [25, 60, 100, 140, 160].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    vineFrames.push(frame([RX + Math.cos(a) * 0.42, ARCH_C + Math.sin(a) * 0.42 + 0.1, RZ + 0.13], [0, 1, 0]));
  });
  for (const s of [1, -1]) {
    vineFrames.push(frame([RX + s * 0.42 + 0.1, G + 0.66, RZ + 0.155], [0, 1, 0]));
    vineFrames.push(frame([RX + s * 0.42 - 0.08, G + 0.66, RZ + 0.155], [0, 1, 0]));
  }
  vineFrames.push(frame([0.7, G + 0.28, RZ + 0.11], [0, 1, 0]));
  vineFrames.push(frame([-0.65, G + 0.22, RZ + 0.11], [0, 1, 0]));
  b.cards(vineFrames, VINE_TEX, { size: [0.12, 0.34], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rng(34) });

  // floating motes
  [
    [0.2, 1.4, 0.4],
    [0.55, 1.55, 0.3],
    [0.35, 1.7, 0.55],
  ].forEach(([x, y, z]) => glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), "#c8fff0", { at: [x, y, z] }), 1.5));

  return b.root;
}
