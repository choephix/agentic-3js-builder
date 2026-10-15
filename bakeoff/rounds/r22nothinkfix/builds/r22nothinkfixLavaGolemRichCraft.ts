import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { paint, noise, mix } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { cel, inkLines, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A towering basalt golem with molten seams, cel-shaded in a Genshin Impact manner: gold filigree trim, pyro glow runes, a burning core and tassels.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette ----------
const GOLD_FLAT = "#ffcf4a";
const LAVA = "#ff6a14";
const LAVA_HOT = "#ffc23a";
const LAVA_CORE = "#fff0a0";
const EMBER = "#ff3d0a";
const CRIMSON_FLAT = "#b72a1a";
const ASH = cel("#d9cfc4", "#9d93a6");

// stone with cel-shaded mottle
const STONE = cel(
  paint((p, _n) => {
    const a = noise(p, 0.18, 3);
    const b = noise(p, 0.05, 9);
    return mix(mix("#4d4864", "#625c7c", a), "#3a3652", b * 0.5);
  }),
  "#26223a",
);
const STONE_DARK = cel(
  paint((p) => mix("#35314d", "#463f60", noise(p, 0.12, 5))),
  "#1a182b",
);
const STONE_TOP = cel(
  paint((p, n) => {
    const base = mix("#5b5575", "#78708f", noise(p, 0.14, 11));
    return n.y > 0.55 ? mix(base, "#8a6a66", 0.35) : base;
  }),
  "#2e2a45",
);
// plate paint with inked crease lines facing front
const PLATE = cel(
  inkLines(
    paint((p) => mix("#524c6c", "#6d6788", noise(p, 0.1, 21))),
    { levels: [0.0], axis: [0, 0, 1], width: 0.05, ink: INK },
  ),
  "#27233b",
);
const SEAMED = paint((p, n) => {
  // basalt with faint glowing cracks baked as vein lines
  const v = noise(p, 0.11, 31);
  const w = noise(p, 0.07, 47);
  const crack = Math.abs(v - 0.5) < 0.018 || Math.abs(w - 0.5) < 0.012;
  const base = mix("#4d4864", "#625c7c", noise(p, 0.16, 3));
  const lit = n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0.1;
  if (crack) return lit ? LAVA_HOT : LAVA;
  return lit ? base : mix(base, "#1d1a30", 0.6);
});

// ---------- textures ----------
const RUNES = [
  `<path d="M32 6 L50 32 L32 58 L14 32 Z" fill="none" stroke="#fff0a0" stroke-width="5"/><path d="M32 18 V46 M20 32 H44" stroke="#ffc23a" stroke-width="5"/>`,
  `<circle cx="32" cy="32" r="22" fill="none" stroke="#fff0a0" stroke-width="5"/><path d="M32 12 L40 32 L32 52 L24 32 Z" fill="#ffc23a"/>`,
  `<path d="M14 50 L32 10 L50 50 M22 36 H42" fill="none" stroke="#fff0a0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  `<path d="M16 14 H48 M32 14 V50 M18 50 Q32 30 46 50" fill="none" stroke="#fff0a0" stroke-width="6" stroke-linecap="round"/>`,
  `<path d="M32 8 C48 24 48 40 32 56 C16 40 16 24 32 8 Z" fill="#ffc23a" stroke="#fff0a0" stroke-width="4"/><circle cx="32" cy="34" r="6" fill="#fff0a0"/>`,
].map((d) => svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${d}</svg>`, { size: 128 }));

const FLAME_TEX = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 62 C2 48 6 34 14 24 C14 32 18 34 20 28 C22 20 18 12 16 2 C28 14 32 32 30 46 C29 54 24 60 16 62 Z" fill="#ff5a12"/>
  <path d="M16 60 C8 50 10 40 16 32 C18 38 22 40 22 46 C22 54 20 58 16 60 Z" fill="#ffb02e"/>
  <path d="M16 58 C12 52 14 46 17 42 C20 48 20 54 16 58 Z" fill="#fff0a0"/></svg>`,
  { size: 128 },
);
const EMBER_TEX = svg(
  `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 1 L13 8 L8 15 L3 8 Z" fill="#ffb02e"/><path d="M8 5 L10.5 8 L8 11 L5.5 8 Z" fill="#fff0a0"/></svg>`,
  { size: 64 },
);
const TASSEL_TEX = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="9" y="0" width="6" height="14" fill="#b72a1a"/><rect x="7" y="12" width="10" height="4" fill="#ffcf4a"/>
  <path d="M5 16 H19 L22 62 H2 Z" fill="#d83a22"/><path d="M12 16 V62 M7 16 L5 62 M17 16 L19 62" stroke="#8a1c18" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg" >
  <rect width="128" height="32" fill="#e8b23a"/>
  <path d="M0 16 Q16 0 32 16 T64 16 T96 16 T128 16" fill="none" stroke="#fff1a8" stroke-width="3"/>
  <path d="M0 16 Q16 32 32 16 T64 16 T96 16 T128 16" fill="none" stroke="#a8691a" stroke-width="3"/>
  <circle cx="16" cy="16" r="3" fill="#fff1a8"/><circle cx="48" cy="16" r="3" fill="#fff1a8"/><circle cx="80" cy="16" r="3" fill="#fff1a8"/><circle cx="112" cy="16" r="3" fill="#fff1a8"/></svg>`,
  { size: 256 },
);
const CHEST_EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="none" stroke="#ffcf4a" stroke-width="3"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#b9791a" stroke-width="2"/>
  <path d="M32 4 L36 14 L32 10 L28 14 Z M32 60 L36 50 L32 54 L28 50 Z M4 32 L14 28 L10 32 L14 36 Z M60 32 L50 28 L54 32 L50 36 Z" fill="#ffcf4a"/>
  <path d="M32 14 L46 32 L32 50 L18 32 Z" fill="none" stroke="#ffcf4a" stroke-width="3"/></svg>`,
  { size: 192 },
);
const EYE = animeEye({ iris: "#ffb02e", irisLight: "#fff0a0", irisDark: "#d8300c", blush: false, brow: false, size: 256 });

function mergeGeo(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  return mergeGeometries(list, false) ?? list[0];
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(1337);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const mkGlow = (geo: THREE.BufferGeometry, color: string, at: number[], opts: Record<string, unknown> = {}, s = 1) =>
    glow(b.part(geo, color, { at, ...opts }), s);

  // =========================================================
  // LEGS / FEET   (total height ~3.3 m)
  // =========================================================
  for (const s of [1, -1]) {
    const X = s * 0.42;
    // foot slab (toes forward)
    b.part(box(0.56, 0.22, 0.86), STONE_DARK, { at: [X, 0.11, 0.08] });
    b.part(box(0.46, 0.1, 0.5), PLATE, { at: [X, 0.25, 0.22], rotation: [-8, 0, 0] });
    // toe blocks
    for (const k of [-1, 0, 1]) {
      b.part(box(0.17, 0.16, 0.26), STONE, { at: [X + k * 0.19, 0.08, 0.6], rotation: [0, k * 8 * s, 0] });
      b.spike([X + k * 0.2, 0.1, 0.72], [0, 0.05, 1], 0.14, 0.07, "#2d2a44", { sides: 5 });
    }
    // heel
    b.part(box(0.46, 0.2, 0.2), STONE, { at: [X, 0.12, -0.32] });
    // lava crack across foot
    mkGlow(box(0.5, 0.025, 0.04), LAVA, [X, 0.225, 0.04], { rotation: [0, s * 20, 0] });

    // shin: tapered column
    b.frustumBox([X, 0.22, 0.04], [X, 0.98, 0.0], [0.4, 0.34], [0.5, 0.42], { color: STONE });
    // shin armour plates (front)
    b.part(box(0.4, 0.34, 0.1), PLATE, { at: [X, 0.5, 0.2], rotation: [-6, 0, 0] });
    b.part(box(0.3, 0.2, 0.08), STONE_TOP, { at: [X, 0.76, 0.2], rotation: [-10, 0, 0] });
    // side plates
    for (const t of [-1, 1]) {
      b.part(box(0.1, 0.5, 0.32), STONE_DARK, { at: [X + t * 0.23, 0.58, 0.02], rotation: [0, 0, t * 4] });
    }
    // molten seams around shin
    mkGlow(box(0.43, 0.035, 0.37), LAVA, [X, 0.3, 0.03]);
    mkGlow(box(0.46, 0.03, 0.4), LAVA_HOT, [X, 0.9, 0.0]);
    // vertical crack on shin
    mkGlow(box(0.03, 0.3, 0.02), LAVA, [X - s * 0.06, 0.55, 0.26], { rotation: [0, 0, s * 8] });
    mkGlow(box(0.02, 0.14, 0.02), LAVA_HOT, [X + s * 0.1, 0.72, 0.27], { rotation: [0, 0, -s * 12] });
    // gold greave trim
    b.part(box(0.46, 0.05, 0.4), GOLD_FLAT, { at: [X, 0.34, 0.03] });
    b.part(box(0.5, 0.05, 0.44), GOLD_FLAT, { at: [X, 0.96, 0.0] });
    // kneecap
    b.part(sph(0.24, 8, 6), STONE_TOP, { at: [X, 1.08, 0.18], scale: [1, 0.9, 0.8] });
    b.part(sph(0.1, 6, 4), GOLD_FLAT, { at: [X, 1.08, 0.37] });
    glow(b.part(sph(0.055, 6, 4), LAVA_HOT, { at: [X, 1.08, 0.43] }), 1.4);

    // thigh
    b.frustumBox([X, 1.0, 0.0], [X * 0.9, 1.52, 0.0], [0.56, 0.5], [0.68, 0.56], { color: STONE });
    b.part(box(0.62, 0.36, 0.12), PLATE, { at: [X, 1.28, 0.28], rotation: [-5, 0, 0] });
    b.part(box(0.14, 0.4, 0.5), STONE_DARK, { at: [X + s * 0.32, 1.3, 0.0], rotation: [0, 0, s * 6] });
    mkGlow(box(0.6, 0.03, 0.52), LAVA, [X, 1.14, 0.0]);
    mkGlow(box(0.025, 0.28, 0.02), LAVA, [X + s * 0.1, 1.3, 0.35], { rotation: [0, 0, s * 15] });
    // thigh gold bands
    b.part(box(0.66, 0.04, 0.58), GOLD_FLAT, { at: [X, 1.42, 0.0] });
    // back calf / hamstring plates
    b.part(box(0.4, 0.5, 0.12), STONE_DARK, { at: [X, 0.62, -0.26], rotation: [8, 0, 0] });
    // tassel from knee
    b.cards([frame([X, 1.0, 0.36], [0, 1, 0])], TASSEL_TEX, { size: [0.1, 0.34], lean: 180, flow: [0, 0, 1] });
  }

  // =========================================================
  // PELVIS / WAIST
  // =========================================================
  b.part(box(1.24, 0.34, 0.76), STONE_DARK, { at: [0, 1.56, 0.0] });
  b.part(box(1.3, 0.06, 0.82), GOLD_FLAT, { at: [0, 1.76, 0.0] });
  b.part(box(1.3, 0.05, 0.82), GOLD_FLAT, { at: [0, 1.4, 0.0] });
  // glowing waist belt seam
  mkGlow(box(1.26, 0.035, 0.78), LAVA, [0, 1.68, 0.0]);
  // loincloth plates (basalt fauld)
  for (const [i, x] of [-0.4, -0.2, 0, 0.2, 0.4].entries()) {
    b.part(box(0.18, 0.4 - Math.abs(x) * 0.3, 0.06), i % 2 ? PLATE : STONE_TOP, {
      at: [x, 1.38 - Math.abs(x) * 0.1, 0.4],
      rotation: [-8, x * 20, 0],
    });
    b.part(box(0.14, 0.03, 0.02), GOLD_FLAT, { at: [x, 1.2 - Math.abs(x) * 0.15, 0.44] });
  }
  // belt buckle gem
  b.part(box(0.28, 0.28, 0.06), GOLD_FLAT, { at: [0, 1.62, 0.42], rotation: [0, 0, 45] });
  glow(b.part(sph(0.085, 6, 5), LAVA_CORE, { at: [0, 1.62, 0.47] }), 1.5);
  b.cards([frame([0, 1.5, 0.45], [0, 1, 0])], TASSEL_TEX, { size: [0.14, 0.5], lean: 180, flow: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.cards([frame([s * 0.45, 1.55, 0.4], [0, 1, 0])], TASSEL_TEX, { size: [0.09, 0.36], lean: 180, flow: [0, 0, 1] });
  }

  // =========================================================
  // TORSO  (massive chest, tapered waist)
  // =========================================================
  b.loft(
    [
      { at: [0, 1.74, 0], w: 0.9, h: 0.6 },
      { at: [0, 2.0, 0.0], w: 1.1, h: 0.7 },
      { at: [0, 2.3, 0.03], w: 1.5, h: 0.84 },
      { at: [0, 2.56, 0.04], w: 1.62, h: 0.86 },
    ],
    { color: SEAMED, section: "box" },
  );
  // chest breastplate: layered basalt
  b.part(box(1.1, 0.64, 0.14), PLATE, { at: [0, 2.28, 0.46], rotation: [-6, 0, 0] });
  b.part(box(0.5, 0.5, 0.12), STONE_TOP, { at: [-0.34, 2.42, 0.52], rotation: [-8, 12, 0] });
  b.part(box(0.5, 0.5, 0.12), STONE_TOP, { at: [0.34, 2.42, 0.52], rotation: [-8, -12, 0] });
  b.part(box(0.9, 0.3, 0.12), STONE_DARK, { at: [0, 1.96, 0.38], rotation: [-10, 0, 0] });
  // abdomen plates stacked
  for (let i = 0; i < 3; i++) {
    b.part(box(0.74 - i * 0.04, 0.17, 0.1), i % 2 ? PLATE : STONE, { at: [0, 1.86 + i * 0.12, 0.34 - i * 0.01], rotation: [-6, 0, 0] });
    mkGlow(box(0.7, 0.02, 0.02), LAVA, [0, 1.935 + i * 0.12, 0.395]);
  }
  // molten core in the chest (heart furnace)
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.3, 0.03],
      [0.3, 0.07],
      [0.22, 0.09],
      [0, 0.09],
    ],
    { at: [0, 2.3, 0.51], x: [1, 0, 0], y: [0, 0, 1], color: GOLD_FLAT, segments: 12, smoothing: 0 },
  );
  glow(b.part(new THREE.CircleGeometry(0.22, 14), LAVA, { at: [0, 2.3, 0.612], dir: [0, 0, 1], axis: "z" }), 1.2);
  glow(b.part(new THREE.CircleGeometry(0.15, 12), LAVA_HOT, { at: [0, 2.3, 0.616], dir: [0, 0, 1], axis: "z" }), 1.4);
  glow(b.part(new THREE.CircleGeometry(0.075, 10), LAVA_CORE, { at: [0, 2.3, 0.62], dir: [0, 0, 1], axis: "z" }), 1.6);
  // emblem decal ring around core
  glow(
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      at: [0, 2.3, 0.545],
      dir: [0, 0, 1],
      axis: "z",
      texture: CHEST_EMBLEM,
    }),
    1.0,
  );
  // spokes of lava radiating from the core
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const len = 0.3 + (i % 2) * 0.16;
    mkGlow(
      box(0.028, len, 0.02),
      i % 2 ? LAVA : LAVA_HOT,
      [Math.cos(a) * (0.36 + len / 2), 2.3 + Math.sin(a) * (0.36 + len / 2) * 0.9, 0.535],
      { rotation: [0, 0, (a * 180) / Math.PI - 90] },
    );
  }
  // gold collar rim
  b.part(box(1.0, 0.06, 0.16), GOLD_FLAT, { at: [0, 2.6, 0.38] });
  // back: spine ridge and plates
  b.part(box(1.2, 0.8, 0.14), PLATE, { at: [0, 2.2, -0.46], rotation: [6, 0, 0] });
  b.part(box(0.9, 0.5, 0.12), STONE_TOP, { at: [0, 2.46, -0.54], rotation: [8, 0, 0] });
  for (let i = 0; i < 7; i++) {
    const y = 1.8 + i * 0.13;
    b.spike([0, y, -0.52], [0, 0.35, -1], 0.2 - i * 0.012, 0.05 + (i % 2) * 0.015, "#2a2740", { sides: 5 });
    mkGlow(box(0.34 + (i % 3) * 0.06, 0.02, 0.02), LAVA, [0, y + 0.06, -0.52]);
  }
  // back furnace vent glow
  glow(b.part(box(0.5, 0.36, 0.04), LAVA, { at: [0, 2.2, -0.6] }), 1.1);
  glow(b.part(box(0.38, 0.24, 0.045), LAVA_HOT, { at: [0, 2.2, -0.605] }), 1.2);
  for (let i = -2; i <= 2; i++) b.part(box(0.022, 0.38, 0.06), "#2a2740", { at: [i * 0.085, 2.2, -0.62] });
  // side ribs plates
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(box(0.1, 0.12, 0.62 - i * 0.04), i % 2 ? STONE : STONE_DARK, {
        at: [s * (0.64 + i * 0.04), 1.95 + i * 0.14, 0.0],
        rotation: [0, 0, s * -10],
      });
      mkGlow(box(0.02, 0.02, 0.6 - i * 0.04), LAVA, [s * (0.71 + i * 0.04), 1.95 + i * 0.14 + 0.07, 0.0]);
    }
  }

  // =========================================================
  // SHOULDERS  (oversized pauldrons) and ARMS
  // =========================================================
  for (const s of [1, -1]) {
    const SX = s * 1.0;
    // pauldron: stacked layered domes
    b.lathe(
      [
        [0, 0],
        [0.5, 0],
        [0.52, 0.08],
        [0.42, 0.26],
        [0.2, 0.4],
        [0, 0.44],
      ],
      { at: [SX, 2.46, 0.0], x: [1, 0, 0], color: STONE_TOP, segments: 8, smoothing: 1 },
    );
    b.lathe(
      [
        [0, 0],
        [0.62, 0],
        [0.64, 0.05],
        [0.5, 0.12],
        [0, 0.12],
      ],
      { at: [SX, 2.38, 0.0], x: [1, 0, 0], color: STONE_DARK, segments: 8, smoothing: 0 },
    );
    // gold rim on pauldron
    b.sweep(
      catmull(
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return [SX + Math.cos(a) * 0.64, 2.44, Math.sin(a) * 0.64] as number[];
        }),
        { closed: true },
      ),
      0.025,
      GOLD_FLAT,
      { sides: 5 },
    );
    // shoulder spikes (crown of rock horns)
    for (let i = 0; i < 5; i++) {
      const a = ((i - 2) / 5) * Math.PI * 0.9 + (s > 0 ? 0 : Math.PI);
      const px = SX + Math.cos(a) * 0.34 * (s > 0 ? 1 : -1) * 0.8;
      const pz = Math.sin(a) * 0.34;
      b.spike([px, 2.8, pz], [s * 0.2, 1, pz * 0.6], 0.34 - Math.abs(i - 2) * 0.05, 0.075, STONE_DARK, { sides: 5 });
      glow(b.spike([px, 2.76, pz], [s * 0.2, 1, pz * 0.6], 0.1, 0.05, LAVA, { sides: 5 }), 1.0);
    }
    // lava seam beneath pauldron
    mkGlow(box(0.7, 0.04, 0.7), LAVA, [SX, 2.33, 0.0], { rotation: [0, 22, 0] });
    // rune on pauldron front
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
        at: [SX + s * 0.18, 2.62, 0.42],
        dir: [s * 0.35, 0.35, 1],
        axis: "z",
        texture: RUNES[(s > 0 ? 0 : 1) % RUNES.length],
      }),
    );
    // tassel from shoulder
    b.cards([frame([SX, 2.34, 0.6], [0, 1, 0])], TASSEL_TEX, { size: [0.11, 0.42], lean: 180, flow: [0, 0, 1] });

    // upper arm (thick column)
    const AX = s * 1.14;
    b.frustumBox([AX, 2.32, 0.0], [AX + s * 0.08, 1.62, 0.04], [0.54, 0.54], [0.5, 0.5], { color: STONE });
    b.part(box(0.18, 0.5, 0.5), PLATE, { at: [AX + s * 0.28, 2.0, 0.02], rotation: [0, 0, s * 4] });
    b.part(box(0.5, 0.3, 0.1), STONE_TOP, { at: [AX, 2.05, 0.28], rotation: [-6, 0, 0] });
    mkGlow(box(0.56, 0.035, 0.56), LAVA, [AX + s * 0.04, 1.9, 0.02]);
    mkGlow(box(0.025, 0.3, 0.02), LAVA, [AX, 2.08, 0.34], { rotation: [0, 0, s * 12] });
    b.part(box(0.58, 0.05, 0.58), GOLD_FLAT, { at: [AX + s * 0.08, 1.68, 0.04] });
    // elbow boulder
    b.part(sph(0.3, 7, 5), STONE_DARK, { at: [AX + s * 0.1, 1.56, -0.05], scale: [1, 0.9, 1] });
    b.spike([AX + s * 0.25, 1.56, -0.12], [s * 1, 0.1, -0.5], 0.3, 0.1, STONE_DARK, { sides: 5 });
    glow(b.spike([AX + s * 0.25, 1.56, -0.12], [s * 1, 0.1, -0.5], 0.1, 0.07, LAVA, { sides: 5 }), 1.0);

    // forearm: tapered toward fist, heavier at the wrist
    const FX = s * 1.28;
    b.frustumBox([AX + s * 0.1, 1.5, 0.04], [FX, 0.86, 0.2], [0.46, 0.46], [0.6, 0.6], { color: STONE });
    // bracer plates
    b.part(box(0.2, 0.52, 0.56), PLATE, { at: [FX + s * 0.3, 1.14, 0.12], rotation: [0, 0, s * 8] });
    b.part(box(0.52, 0.4, 0.1), STONE_TOP, { at: [FX, 1.18, 0.38], rotation: [-14, 0, 0] });
    mkGlow(box(0.62, 0.035, 0.62), LAVA, [FX, 1.32, 0.12]);
    mkGlow(box(0.025, 0.34, 0.02), LAVA_HOT, [FX - s * 0.1, 1.16, 0.44], { rotation: [-14, 0, s * 6] });
    mkGlow(box(0.025, 0.2, 0.02), LAVA, [FX + s * 0.12, 1.1, 0.45], { rotation: [-14, 0, -s * 10] });
    b.part(box(0.66, 0.06, 0.66), GOLD_FLAT, { at: [FX, 0.9, 0.2] });
    b.part(box(0.62, 0.05, 0.62), GOLD_FLAT, { at: [FX - s * 0.02, 1.42, 0.1] });
    // gold rune plate
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
        at: [FX, 1.14, 0.435],
        dir: [0, 0.25, 1],
        axis: "z",
        texture: RUNES[2 + (s > 0 ? 0 : 1)],
      }),
    );

    // FIST: huge block fist with knuckle spikes
    const HX = s * 1.3;
    b.part(box(0.62, 0.52, 0.62), STONE_DARK, { at: [HX, 0.56, 0.24], rotation: [8, 0, 0] });
    b.part(box(0.66, 0.2, 0.5), PLATE, { at: [HX, 0.8, 0.26], rotation: [8, 0, 0] });
    // finger blocks
    for (let k = 0; k < 4; k++) {
      const fx = HX + (k - 1.5) * 0.15;
      b.part(box(0.13, 0.28, 0.2), k % 2 ? STONE : STONE_TOP, { at: [fx, 0.34, 0.54], rotation: [-6, 0, 0] });
      b.spike([fx, 0.26, 0.6], [0, -0.4, 1], 0.14, 0.05, "#2a2740", { sides: 5 });
      mkGlow(box(0.11, 0.02, 0.1), LAVA, [fx, 0.49, 0.5]);
    }
    // thumb
    b.part(box(0.15, 0.15, 0.3), STONE, { at: [HX - s * 0.34, 0.6, 0.38], rotation: [0, s * 20, 0] });
    // knuckle spikes
    for (let k = 0; k < 4; k++) {
      const fx = HX + (k - 1.5) * 0.15;
      b.spike([fx, 0.82, 0.46], [0, 0.6, 1], 0.2, 0.045, GOLD_FLAT, { sides: 5 });
    }
    // palm glow underneath front
    glow(b.part(box(0.5, 0.03, 0.46), LAVA, { at: [HX, 0.3, 0.12] }), 0.9);
    // fist floor drip glow
    glow(b.part(sph(0.07, 6, 4), LAVA_HOT, { at: [HX, 0.28, 0.53], scale: [1, 0.5, 1] }), 1.2);
  }

  // =========================================================
  // HEAD  (small head, huge helm-like brow, glowing eyes, jaw)
  // =========================================================
  const HC: number[] = [0, 2.96, 0.08];
  b.part(box(0.56, 0.2, 0.5), STONE_DARK, { at: [0, 2.7, 0.04] }); // neck block
  glow(b.part(box(0.5, 0.025, 0.46), LAVA, { at: [0, 2.62, 0.04] }), 1.0);
  const skull = b.part(sph(1, 10, 8), STONE, { at: HC, scale: [0.4, 0.34, 0.37] });
  // brow ridge
  b.part(box(0.74, 0.12, 0.2), STONE_DARK, { at: [0, HC[1] + 0.07, 0.36], rotation: [-10, 0, 0] });
  b.part(box(0.82, 0.05, 0.22), GOLD_FLAT, { at: [0, HC[1] + 0.14, 0.34], rotation: [-10, 0, 0] });
  // face plate
  b.part(box(0.52, 0.34, 0.1), PLATE, { at: [0, HC[1] - 0.02, 0.37], rotation: [-5, 0, 0] });
  // jaw
  b.part(box(0.56, 0.2, 0.34), STONE_DARK, { at: [0, HC[1] - 0.24, 0.26] });
  b.part(box(0.4, 0.1, 0.1), STONE, { at: [0, HC[1] - 0.38, 0.4] });
  // teeth: lava fangs
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.09, HC[1] - 0.18, 0.44], [0, 1, 0.1], 0.07, 0.025, LAVA_HOT, { sides: 4 });
  }
  glow(b.part(box(0.38, 0.03, 0.04), LAVA, { at: [0, HC[1] - 0.21, 0.44] }), 1.0);
  // eyes: slanted molten eyes with anime decal
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    mkGlow(box(0.2, 0.15, 0.04), LAVA, [s * 0.15, HC[1] + 0.0, 0.405], { rotation: [-5, 0, s * -10] }, 1.1);
    const hit = skin.around(HC).at(s * 24, 3);
    if (hit) {
      b.decal(skin, EYE, { at: hit, size: [0.14, 0.18], mirror: s > 0, lift: 0.032 });
    }
    // glow slits beneath
    mkGlow(box(0.14, 0.04, 0.03), LAVA_CORE, [s * 0.15, HC[1] - 0.01, 0.43], { rotation: [-5, 0, s * -10] }, 1.5);
  }
  // nose ridge
  b.part(box(0.07, 0.2, 0.08), STONE_TOP, { at: [0, HC[1] - 0.06, 0.43] });
  // horns: swept crown of basalt horns w/ glowing tips
  for (const s of [1, -1]) {
    const hp = catmull([
      [s * 0.28, HC[1] + 0.14, 0.0],
      [s * 0.5, HC[1] + 0.3, -0.1],
      [s * 0.62, HC[1] + 0.6, -0.1],
      [s * 0.5, HC[1] + 0.92, 0.0],
    ]);
    b.sweep(hp, [0.1, 0.012], STONE_DARK, { sides: 6, caps: "point" });
    glow(b.sweep(hp.slice(0.75, 1), [0.03, 0.006], LAVA_HOT, { sides: 5, caps: "point" }), 1.2);
    // ear fins / gold trim
    b.part(box(0.06, 0.22, 0.2), GOLD_FLAT, { at: [s * 0.4, HC[1], 0.0], rotation: [0, 0, s * 10] });
    glow(b.part(sph(0.04, 5, 4), LAVA, { at: [s * 0.44, HC[1], 0.0] }), 1.2);
  }
  // crest of stone spikes over the head
  for (let i = 0; i < 5; i++) {
    const z = 0.2 - i * 0.12;
    b.spike([0, HC[1] + 0.3 - i * 0.015, z], [0, 1, -0.4], 0.24 - i * 0.025, 0.06, STONE_DARK, { sides: 5 });
    glow(b.part(sph(0.025, 4, 3), LAVA, { at: [0, HC[1] + 0.31 - i * 0.015, z - 0.05] }), 1.0);
  }
  // crown: gold circlet with filigree
  b.sweep(
    catmull(
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return [Math.sin(a) * 0.37, HC[1] + 0.2, 0.08 + Math.cos(a) * 0.34 - 0.08] as number[];
      }),
      { closed: true },
    ),
    0.02,
    GOLD_FLAT,
    { sides: 5 },
  );
  b.part(box(0.36, 0.045, 0.04), "#ffffff", { at: [0, HC[1] + 0.2, 0.34], texture: FILIGREE, rotation: [-10, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), LAVA_CORE, { at: [0, HC[1] + 0.2, 0.38], scale: [0.8, 1.4, 0.8] }), 1.5);

  // =========================================================
  // SURFACE DETAIL: rivets, cracks, gold filigree bands, embers
  // =========================================================
  const rivetGeo: THREE.BufferGeometry[] = [];
  const rivetPts: number[][] = [];
  for (const s of [1, -1]) {
    rivetPts.push([s * 0.5, 2.56, 0.54], [s * 0.2, 2.55, 0.56], [s * 0.5, 2.0, 0.44], [s * 0.3, 1.96, 0.46]);
    rivetPts.push([s * 0.2, 1.3, 0.34], [s * 0.6, 1.4, 0.26], [s * 0.42, 0.7, 0.26], [s * 0.42, 0.4, 0.24]);
    rivetPts.push([s * 1.3, 1.06, 0.45], [s * 1.18, 1.3, 0.43], [s * 1.2, 2.18, 0.36], [s * 1.0, 2.7, 0.2]);
  }
  for (const p of rivetPts) rivetGeo.push(sph(0.022, 5, 3).translate(p[0], p[1], p[2]));
  b.part(mergeGeo(rivetGeo), GOLD_FLAT, { at: [0, 0, 0] });

  // lava veins spreading over the body: thin sweeps (rock cracks)
  const veins: number[][][] = [
    [[0.5, 1.6, 0.4], [0.58, 1.8, 0.36], [0.52, 2.0, 0.44]],
    [[-0.4, 2.0, 0.5], [-0.5, 2.15, 0.52], [-0.62, 2.3, 0.45]],
    [[0.7, 2.2, 0.4], [0.82, 2.4, 0.3], [0.9, 2.55, 0.2]],
    [[-0.7, 2.18, -0.3], [-0.5, 2.0, -0.54], [-0.3, 1.8, -0.5]],
    [[0.3, 2.0, -0.55], [0.5, 2.26, -0.5], [0.6, 2.5, -0.4]],
    [[0.42, 0.45, 0.3], [0.46, 0.6, 0.28], [0.4, 0.75, 0.26]],
    [[-0.42, 0.5, 0.3], [-0.38, 0.68, 0.28], [-0.45, 0.82, 0.25]],
  ];
  for (const v of veins) {
    glow(b.sweep(catmull(v), 0.012, LAVA, { sides: 4, caps: "none" }), 1.0);
  }

  // gold filigree bands on arms and legs
  for (const s of [1, -1]) {
    b.part(box(0.36, 0.05, 0.02), "#ffffff", { at: [s * 0.42, 0.62, 0.222], texture: FILIGREE, rotation: [-6, 0, 0] });
    b.part(box(0.4, 0.05, 0.02), "#ffffff", { at: [s * 0.42, 1.22, 0.3], texture: FILIGREE, rotation: [-5, 0, 0] });
    b.part(box(0.4, 0.05, 0.02), "#ffffff", { at: [s * 1.3, 0.98, 0.52], texture: FILIGREE, rotation: [-14, 0, 0] });
    b.part(box(0.44, 0.05, 0.02), "#ffffff", { at: [s * 1.16, 1.82, 0.28], texture: FILIGREE });
  }
  // gold filigree belt strip
  b.part(box(1.0, 0.07, 0.02), "#ffffff", { at: [0, 1.7, 0.4], texture: FILIGREE });

  // crimson sash across chest with tassels
  const sash = catmull([
    [0.78, 2.62, 0.2],
    [0.5, 2.36, 0.62],
    [0.0, 2.0, 0.55],
    [-0.4, 1.82, 0.48],
  ]);
  b.sweep(sash, [0.05, 0.05], CRIMSON_FLAT, { section: "box", caps: "flat" });
  b.cards([frame([-0.4, 1.82, 0.5], [0, 1, 0])], TASSEL_TEX, { size: [0.12, 0.46], lean: 180, flow: [0, 0, 1] });
  b.cards([frame([-0.36, 1.84, 0.52], [0, 1, 0])], TASSEL_TEX, { size: [0.09, 0.34], lean: 180, flow: [0, 0, 1], mirror: true });

  // flames licking from furnace vents and shoulders (cards)
  const flames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 5; i++) flames.push(frame([(i - 2) * 0.09, 2.38, -0.6], [0, 1, -0.5]));
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) flames.push(frame([s * (0.95 + i * 0.12), 2.84, 0.0], [s * 0.2, 1, 0]));
  glow(
    b.cards(flames, FLAME_TEX, { size: [0.18, 0.4], lean: 0, flow: [0, 0, 1], vary: 0.3, rng: rng(5), cross: true }),
    1.2,
  );
  // floating embers around
  const emb: ReturnType<typeof frame>[] = [];
  const er = rng(77);
  for (let i = 0; i < 26; i++) {
    const a = er() * Math.PI * 2;
    const rad = 0.9 + er() * 0.9;
    emb.push(frame([Math.cos(a) * rad, 0.5 + er() * 2.7, Math.sin(a) * rad], [0, 1, 0]));
  }
  glow(b.cards(emb, EMBER_TEX, { size: [0.05, 0.07], lean: 0, flow: [0, 0, 1], vary: 0.5, rng: rng(8), cross: true, spin: 180 }), 1.4);

  // lava puddle pools around feet (flat glowing discs on the floor)
  for (const s of [1, -1]) {
    glow(b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.012, 8), EMBER, { at: [s * 0.45, 0.006, 0.78], scale: [1, 1, 0.7] }), 0.9);
  }
  // rubble pebbles on the floor
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.9 + R() * 0.7;
    const sz = 0.05 + R() * 0.07;
    b.part(new THREE.DodecahedronGeometry(sz, 0), i % 3 ? STONE_DARK : STONE, {
      at: [Math.cos(a) * rad, sz * 0.6, Math.sin(a) * rad],
      rotation: [R() * 90, R() * 90, 0],
    });
  }
  // ash-white scarf at neck
  b.part(box(0.62, 0.07, 0.56), ASH, { at: [0, 2.66, 0.04] });

  return b.root;
}
