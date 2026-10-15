// Roadside shrine: vermilion torii, stone lanterns, a gabled hokora with bell, kitsune guardians, offerings,
// an ema rack and a blossoming tree, in cel-shaded Genshin-style colours with gold trim and teal wind glow.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, scales } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, spiral } from "../../../../src/path";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside shrine: vermilion torii with a gold plaque and paper lanterns, stone lanterns, a gabled hokora with bell and offering box, kitsune guardians, sake and fruit offerings, an ema rack and a sakura tree, with teal wind glow.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lanternShrine" });
  const root = b.joint("root", { at: [0, 0.1, 0] });
  const G = 0.1; // ground surface height

  // ---------------------------------------------------------------- palette
  const VERM = cel("#e63b2e");
  const LACQ = cel("#2c2433", "#1a1422");
  const GOLD = cel("#f6c85a");
  const STONE = cel(mottle("#c7c3ba", "#9fae9f", { size: 0.18, seed: 3 }));
  const STONE_D = cel("#8f8b86");
  const WOOD = cel(grain("#c98f5a", "#a8693c", { size: 0.03 }));
  const WOOD_D = cel(grain("#8d5a38", "#6e4229", { size: 0.03, seed: 2 }));
  const TILE = cel(scales("#4f7fb0", "#2f4f7a", { size: 0.07 }));
  const CREAM = cel("#fff1d0");
  const PINK = cel("#ffb3cf");
  const PINK_L = cel("#ffd3e3");
  const LEAF = cel("#74c46c");
  const ROPE = cel("#efe0b0");
  const ORANGE = cel("#ff9b3d");
  const GROUND = cel(mottle("#d9cfae", "#bfb48f", { size: 0.12, seed: 9 }));
  const RIM = cel(mottle("#6fa95a", "#4f8a4e", { size: 0.1, seed: 5 }));
  const BARK = cel(grain("#7a5236", "#5a3a28", { size: 0.04 }));
  const BLUE = cel("#6ea4df");
  const STRAW = cel("#d9b45a");
  const TEAL = "#8ff7e4";
  const WARM = "#ffcf6a";
  const WHITE = "#ffffff";

  // ---------------------------------------------------------------- helpers
  const put = (g: THREE.BufferGeometry, c: Fill, at: V, o: Partial<PartOptions> = {}) =>
    b.part(g, c, { bone: root, ...o, at });
  const box = (w: number, h: number, d: number, c: Fill, x: number, y: number, z: number, o: Partial<PartOptions> = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, [x, y, z], o);
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    c: Fill,
    x: number,
    y: number,
    z: number,
    o: Partial<PartOptions> = {},
  ) => put(new THREE.CylinderGeometry(rt, rb, h, seg), c, [x, y, z], o);
  const sph = (
    r: number,
    c: Fill,
    x: number,
    y: number,
    z: number,
    scale: number | V = 1,
    o: Partial<PartOptions> = {},
  ) => put(new THREE.SphereGeometry(r, 10, 7), c, [x, y, z], { scale, ...o });
  const tube = (pts: number[][], r: number | [number, number], c: Fill, o: SweepOptions = {}) =>
    b.sweep(pts, r, { color: c, bone: root, ...o });
  const torus = (r: number, t: number, c: Fill, x: number, y: number, z: number, o: Partial<PartOptions> = {}) =>
    put(new THREE.TorusGeometry(r, t, 5, 12), c, [x, y, z], { rotation: [90, 0, 0], ...o });
  const lathe = (outline: OutlinePoint[], c: Fill, at: V, segments = 10, spin = 0) =>
    b.lathe(outline, { at, color: c, segments, spin, bone: root });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V) =>
    put(new THREE.PlaneGeometry(w, h), WHITE, at, { texture: tex, dir, axis: "z" });

  // ---------------------------------------------------------------- textures
  const PLAQUE = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#2c2433"/>
    <rect x="2" y="2" width="96" height="36" fill="none" stroke="#f6c85a" stroke-width="2"/>
    <circle cx="50" cy="20" r="11" fill="none" stroke="#f6c85a" stroke-width="2.4"/>
    <path d="M50 12 C58 14 58 24 50 24 C44 24 44 18 49 18" fill="none" stroke="#8ff7e4" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M14 20 H34 M66 20 H86" stroke="#f6c85a" stroke-width="2.4"/>
    <circle cx="11" cy="20" r="3" fill="#e63b2e"/><circle cx="89" cy="20" r="3" fill="#e63b2e"/>
    <path d="M22 11 q5 3 0 7 M78 11 q-5 3 0 7 M22 22 q5 3 0 7 M78 22 q-5 3 0 7" fill="none" stroke="#f6c85a" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    { size: 512 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 40 80"><rect width="40" height="80" fill="#fff1d0"/>
    <path d="M0 20 H40 M0 40 H40 M0 60 H40 M10 0 V80 M20 0 V80 M30 0 V80" stroke="#c98f5a" stroke-width="1.4"/>
    <path d="M20 4 L34 20 L20 36 L6 20Z M20 44 L34 60 L20 76 L6 60Z" fill="none" stroke="#e63b2e" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="2.6" fill="#f6c85a"/><circle cx="20" cy="60" r="2.6" fill="#f6c85a"/>
    <rect x="1" y="1" width="38" height="78" fill="none" stroke="#e63b2e" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const EMA = svg(
    `<svg viewBox="0 0 60 72"><path d="M8 22 L30 4 L52 22 L52 68 L8 68 Z" fill="#d9a066" stroke="#8d5a38" stroke-width="3"/>
    <path d="M16 38 L18 24 L26 31 Q30 29 34 31 L42 24 L44 38 Q44 54 30 58 Q16 54 16 38Z" fill="#e8552c"/>
    <path d="M30 58 Q22 50 24 44 Q30 48 36 44 Q38 50 30 58Z" fill="#ffffff"/>
    <circle cx="24" cy="40" r="2.2" fill="#2c2433"/><circle cx="36" cy="40" r="2.2" fill="#2c2433"/>
    <path d="M30 8 L30 14" stroke="#8d5a38" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 40 100"><path d="M16 0 L32 22 L10 40 L32 60 L12 80 L26 100 L14 100 L2 80 L22 60 L0 40 L22 22 L6 0 Z" fill="#ffffff" stroke="#d8cfc0" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 C2 20 4 6 16 1 C28 6 30 20 16 30Z" fill="#ffb3cf"/><path d="M16 28 L16 10" stroke="#ff8fb8" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 40 60"><path d="M6 60 Q8 30 2 6 Q14 28 16 60Z" fill="#4f9a56"/><path d="M14 60 Q18 24 20 2 Q28 26 26 60Z" fill="#74c46c"/><path d="M24 60 Q30 36 38 12 Q36 40 34 60Z" fill="#5fb061"/></svg>`,
    { size: 128 },
  );
  const CHOCHIN = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#ff5a3c"/>
    <path d="M0 0V64 M8 0V64 M16 0V64 M24 0V64 M32 0V64 M40 0V64 M48 0V64 M56 0V64 M72 0V64 M80 0V64 M88 0V64 M96 0V64 M104 0V64 M112 0V64 M120 0V64" stroke="#c93524" stroke-width="1.6"/>
    <rect y="0" width="128" height="7" fill="#f6c85a"/><rect y="57" width="128" height="7" fill="#f6c85a"/>
    <circle cx="64" cy="32" r="15" fill="#fff1d0"/>
    <path d="M64 22 C74 24 74 36 64 36 C57 36 57 29 63 29" fill="none" stroke="#e63b2e" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 40 30"><rect width="40" height="30" fill="#e63b2e"/><rect x="2" y="2" width="36" height="26" fill="none" stroke="#f6c85a" stroke-width="1.6"/><circle cx="20" cy="15" r="7" fill="none" stroke="#fff1d0" stroke-width="2"/><path d="M20 10 V20" stroke="#fff1d0" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- ground
  lathe(
    [
      [0, 0],
      [3.7, 0],
      [3.7, 0.07],
      [3.5, 0.1],
      [0, 0.1],
    ],
    GROUND,
    [0, 0, 0],
    24,
  );
  // mossy rim stones
  const rr = rng(4);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const s = 0.12 + rr() * 0.08;
    sph(s, i % 3 ? STONE : RIM, Math.sin(a) * 3.62, G + 0.02, Math.cos(a) * 3.62, [1.2, 0.55, 1], { flat: true });
  }

  // ---------------------------------------------------------------- stepping path
  const rp = rng(11);
  for (let i = 0; i < 7; i++) {
    const z = 2.9 - i * 0.55;
    box(0.85 + 0.1 * (rp() - 0.5), 0.06, 0.42, STONE, (rp() - 0.5) * 0.12, G + 0.03, z, {
      rotation: [0, (rp() - 0.5) * 8, 0],
    });
  }

  // ---------------------------------------------------------------- torii
  const TZ = 1.0;
  for (const s of [1, -1]) {
    const x = s * 1.0;
    tube(
      [
        [x, G - 0.02, TZ],
        [x, 2.66, TZ],
      ],
      [0.16, 0.125],
      VERM,
      { caps: "flat", sides: 10 },
    );
    box(0.5, 0.18, 0.5, STONE, x, G + 0.09, TZ, { flat: true });
    cyl(0.19, 0.21, 0.22, 10, LACQ, x, G + 0.29, TZ);
    cyl(0.185, 0.185, 0.03, 10, GOLD, x, G + 0.42, TZ);
    cyl(0.145, 0.145, 0.06, 10, GOLD, x, 2.22, TZ);
    cyl(0.135, 0.135, 0.12, 10, LACQ, x, 2.52, TZ);
    // sacred rope with paper streamers
    const ring: number[][] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ring.push([x + Math.sin(a) * 0.2, 1.35 + (k % 2) * 0.015, TZ + Math.cos(a) * 0.2]);
    }
    b.sweep(catmull(ring, { closed: true }), 0.024, { color: ROPE, bone: root, sides: 6 });
    b.cards(
      [0, 1, 2, 3, 4].map((k) => {
        const a = ((k + 0.5) / 5) * Math.PI * 1.2 - 0.6 + Math.PI * 0.1;
        return frame([x + Math.sin(a) * 0.21, 1.34, TZ + Math.cos(a) * 0.21], [0, 1, 0]);
      }),
      SHIDE,
      { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1], bone: root, sink: 0 },
    );
  }
  box(2.9, 0.15, 0.13, VERM, 0, 2.22, TZ);
  for (const s of [1, -1]) box(0.05, 0.17, 0.15, GOLD, s * 1.46, 2.22, TZ);
  box(3.0, 0.1, 0.32, VERM, 0, 2.64, TZ);
  const kasagi: OutlinePoint[] = [
    [-1.75, 0.14],
    [-1.2, 0],
    [0, -0.02],
    [1.2, 0],
    [1.75, 0.14],
    [1.6, 0.34],
    [0.9, 0.22],
    [0, 0.2],
    [-0.9, 0.22],
    [-1.6, 0.34],
  ];
  b.extrude(kasagi, { at: [0, 2.69, TZ], x: [1, 0, 0], thickness: 0.4, bevel: 0.02, color: LACQ, bone: root });
  for (const s of [1, -1]) box(0.07, 0.1, 0.42, GOLD, s * 1.72, 2.93, TZ, { rotation: [0, 0, s * -25] });
  box(0.62, 0.28, 0.1, GOLD, 0, 2.44, TZ);
  plane(0.52, 0.2, PLAQUE, [0, 2.44, TZ + 0.056], [0, 0, 1]);
  plane(0.52, 0.2, PLAQUE, [0, 2.44, TZ - 0.056], [0, 0, -1]);
  for (const s of [1, -1]) {
    box(0.06, 0.3, 0.06, VERM, s * 0.38, 2.44, TZ); // king posts framing the plaque
  }

  // hanging paper lanterns under the tie beam
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const x = s * 0.5;
    const j = b.joint(`chochin${side}`, { parent: root, at: [x, 2.14, TZ], dir: [0, -1, 0], role: "hinge" });
    b.rod([x, 2.14, TZ], [x, 2.04, TZ], 0.008, "#5a3a28", { bone: j });
    cyl(0.09, 0.09, 0.05, 8, LACQ, x, 2.04, TZ, { bone: j });
    glow(
      put(new THREE.SphereGeometry(1, 12, 8), WHITE, [x, 1.78, TZ], {
        scale: [0.2, 0.26, 0.2],
        texture: CHOCHIN,
        rotation: [0, -90, 0],
        bone: j,
      }),
    );
    cyl(0.085, 0.085, 0.05, 8, LACQ, x, 1.52, TZ, { bone: j });
    b.rod([x, 1.5, TZ], [x, 1.3, TZ], 0.012, GOLD, { bone: j });
    put(new THREE.SphereGeometry(0.035, 6, 5), GOLD, [x, 1.28, TZ], { bone: j });
  }

  // ---------------------------------------------------------------- stone lanterns
  const toro = (x: number, z: number) => {
    const y0 = G;
    cyl(0.26, 0.3, 0.12, 6, STONE, x, y0 + 0.06, z);
    cyl(0.09, 0.11, 0.5, 6, STONE, x, y0 + 0.37, z);
    cyl(0.17, 0.13, 0.09, 6, STONE, x, y0 + 0.665, z);
    torus(0.15, 0.012, GOLD, x, y0 + 0.665, z);
    cyl(0.3, 0.2, 0.1, 6, STONE, x, y0 + 0.76, z);
    box(0.3, 0.04, 0.3, STONE, x, y0 + 0.83, z);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.05, 0.28, 0.05, STONE_D, x + sx * 0.125, y0 + 0.97, z + sz * 0.125);
    glow(box(0.22, 0.22, 0.22, WARM, x, y0 + 0.97, z), 1.3);
    box(0.32, 0.04, 0.32, STONE, x, y0 + 1.13, z);
    lathe(
      [
        [0, 0],
        [0.42, 0],
        [0.5, 0.05],
        [0.34, 0.14],
        [0.13, 0.27],
        [0, 0.3],
      ],
      STONE,
      [x, y0 + 1.15, z],
      6,
    );
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
      sph(0.03, GOLD, x + Math.sin(a) * 0.47, y0 + 1.2, z + Math.cos(a) * 0.47, 1, { flat: true });
    }
    sph(0.05, GOLD, x, y0 + 1.5, z, [1, 1.2, 1]);
    put(new THREE.ConeGeometry(0.03, 0.09, 6), GOLD, [x, y0 + 1.58, z]);
  };
  toro(1.7, 0.2);
  toro(-1.7, 0.2);

  // ---------------------------------------------------------------- hokora (small shrine)
  const SZ = -1.95; // body centre z
  const B0 = G + 0.3; // base top
  box(1.7, 0.3, 1.5, STONE, 0, G + 0.15, -1.8);
  box(1.3, 0.04, 1.1, STONE_D, 0, G + 0.3, -1.8);
  box(1.2, 0.2, 0.3, STONE, 0, G + 0.1, -0.95);
  box(1.0, 0.1, 0.25, STONE, 0, G + 0.05, -0.72);
  // walls, posts, doors
  box(0.9, 0.9, 0.8, CREAM, 0, B0 + 0.45, SZ);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.09, 0.95, 0.09, VERM, sx * 0.45, B0 + 0.475, SZ + sz * 0.4);
  box(1.0, 0.08, 0.9, VERM, 0, B0 + 0.94, SZ);
  box(1.0, 0.06, 0.9, LACQ, 0, B0 + 0.04, SZ);
  for (const s of [1, -1]) {
    plane(0.36, 0.72, DOOR, [s * 0.2, B0 + 0.47, SZ + 0.405], [0, 0, 1]);
    sph(0.02, GOLD, s * 0.05, B0 + 0.47, SZ + 0.42, 1, { flat: true });
  }
  box(0.8, 0.05, 0.03, GOLD, 0, B0 + 0.86, SZ + 0.41);
  // porch posts, lintel and offering box
  for (const s of [1, -1]) {
    tube(
      [
        [s * 0.55, B0, -1.12],
        [s * 0.55, B0 + 1.1, -1.12],
      ],
      0.045,
      VERM,
      { caps: "flat", sides: 8 },
    );
    cyl(0.06, 0.06, 0.05, 8, GOLD, s * 0.55, B0 + 1.06, -1.12);
  }
  box(1.3, 0.09, 0.1, LACQ, 0, B0 + 1.08, -1.12);
  box(0.6, 0.16, 0.34, WOOD_D, 0, B0 + 0.08, -1.3);
  for (let k = 0; k < 6; k++) box(0.54, 0.012, 0.018, LACQ, 0, B0 + 0.165, -1.4 + k * 0.045);
  for (let k = 0; k < 3; k++)
    cyl(0.03, 0.03, 0.006, 8, GOLD, -0.12 + k * 0.1, B0 + 0.172, -1.24, { rotation: [90 * k * 0, 0, 0] });
  // roof
  for (const s of [1, -1]) {
    box(0.95, 0.07, 1.9, TILE, s * 0.41, 1.61, -1.75, { rotation: [0, 0, -s * 30] });
    box(0.05, 0.09, 1.92, GOLD, s * 0.82, 1.37, -1.75, { rotation: [0, 0, -s * 30] });
    for (let k = 0; k < 5; k++) {
      box(0.9, 0.012, 0.015, STONE_D, s * 0.41, 1.652, -2.6 + k * 0.4, { rotation: [0, 0, -s * 30] });
    }
  }
  b.extrude(
    [
      [-0.6, 0],
      [0.6, 0],
      [0, 0.48],
    ],
    { at: [0, B0 + 0.95, -1.5], x: [1, 0, 0], thickness: 0.05, color: CREAM, bone: root },
  );
  b.rod([0, 1.88, -2.6], [0, 1.88, -0.9], 0.07, GOLD, { bone: root, sides: 6 });
  for (const z of [-2.62, -0.88]) {
    put(new THREE.ConeGeometry(0.07, 0.24, 6), GOLD, [0, 1.99, z], { rotation: [z > -1.5 ? 25 : -25, 0, 0] });
    sph(0.05, GOLD, 0, 1.88, z, 1, { flat: true });
  }
  // bell and rope
  const bell = b.joint("bell", { parent: root, at: [0, B0 + 1.04, -1.12], dir: [0, -1, 0], role: "hinge" });
  b.rod([0, B0 + 1.04, -1.12], [0, B0 + 0.9, -1.12], 0.012, "#5a3a28", { bone: bell });
  b.lathe(
    [
      [0, -0.02],
      [0.06, -0.02],
      [0.09, 0.03],
      [0.07, 0.08],
      [0.04, 0.1],
      [0, 0.1],
    ],
    { at: [0, B0 + 0.82, -1.12], color: GOLD, segments: 8, bone: bell },
  );
  sph(0.025, LACQ, 0, B0 + 0.82, -1.12, 1, { bone: bell });
  b.sweep(
    [
      [0, B0 + 0.84, -1.04],
      [0, B0 + 0.3, -1.04],
    ],
    0.028,
    {
      color: VERM,
      bone: bell,
      sides: 6,
      bands: [
        [0.2, "#e63b2e"],
        [0.4, "#fff1d0"],
        [0.6, "#e63b2e"],
        [0.8, "#fff1d0"],
        [1, "#e63b2e"],
      ],
    },
  );
  sph(0.04, GOLD, 0, B0 + 0.28, -1.04, [1, 1.4, 1], { bone: bell });

  // ---------------------------------------------------------------- kitsune guardians
  const fox = (s: number) => {
    const x = s * 0.95;
    const z = -0.2;
    const y0 = G + 0.3;
    box(0.4, 0.3, 0.4, STONE, x, G + 0.15, z);
    box(0.44, 0.04, 0.44, STONE_D, x, G + 0.3, z);
    sph(0.17, STONE, x, y0 + 0.24, z - 0.03, [0.85, 1.3, 0.85]);
    sph(0.17, STONE, x, y0 + 0.12, z - 0.08, [1, 0.8, 1.1]);
    for (const t of [1, -1]) {
      b.rod([x + t * 0.07, y0 + 0.3, z + 0.08], [x + t * 0.07, y0 + 0.03, z + 0.13], 0.035, STONE, { bone: root });
      sph(0.04, STONE, x + t * 0.07, y0 + 0.03, z + 0.15, [1, 0.6, 1.4]);
      put(new THREE.ConeGeometry(0.05, 0.14, 4), STONE, [x + t * 0.07, y0 + 0.66, z], { rotation: [0, 0, t * -10] });
      put(new THREE.ConeGeometry(0.026, 0.09, 4), VERM, [x + t * 0.07, y0 + 0.65, z + 0.025], { rotation: [0, 0, t * -10] });
      sph(0.016, INK, x + t * 0.05, y0 + 0.53, z + 0.13, 1, { flat: true });
    }
    sph(0.12, STONE, x, y0 + 0.5, z + 0.03, [1, 0.9, 1]);
    put(new THREE.CylinderGeometry(0.012, 0.06, 0.12, 6), STONE, [x, y0 + 0.47, z + 0.15], { rotation: [90, 0, 0] });
    sph(0.016, LACQ, x, y0 + 0.47, z + 0.215, 1, { flat: true });
    cyl(0.1, 0.12, 0.05, 8, GOLD, x, y0 + 0.38, z + 0.03);
    box(0.17, 0.15, 0.02, VERM, x, y0 + 0.3, z + 0.12);
    sph(0.025, GOLD, x, y0 + 0.37, z + 0.14, 1, { flat: true });
    tube(
      [
        [x - s * 0.1, y0 + 0.1, z - 0.15],
        [x - s * 0.1, y0 + 0.2, z - 0.35],
        [x - s * 0.1, y0 + 0.45, z - 0.4],
        [x - s * 0.1, y0 + 0.62, z - 0.3],
      ],
      [0.07, 0.02],
      STONE,
      { sides: 7 },
    );
    if (s > 0) glow(sph(0.04, TEAL, x + 0.07, y0 + 0.07, z + 0.2, 1, { flat: true }), 1.4);
    else cyl(0.025, 0.025, 0.13, 6, GOLD, x - 0.07, y0 + 0.06, z + 0.2, { rotation: [0, 0, 90] });
  };
  fox(1);
  fox(-1);

  // ---------------------------------------------------------------- offerings: table, left
  const TXX = -1.3;
  const TZZ = -0.75;
  box(0.8, 0.05, 0.5, WOOD, TXX, G + 0.45, TZZ);
  box(0.82, 0.012, 0.3, VERM, TXX, G + 0.478, TZZ);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.45, 0.05, WOOD_D, TXX + sx * 0.35, G + 0.225, TZZ + sz * 0.2);
  box(0.74, 0.03, 0.04, WOOD_D, TXX, G + 0.15, TZZ + 0.2);
  // mochi plate
  lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.16, 0.04],
      [0.13, 0.04],
      [0, 0.02],
    ],
    CREAM,
    [TXX - 0.22, G + 0.48, TZZ],
    10,
  );
  for (const [dx, dz, dy] of [
    [-0.04, 0, 0],
    [0.04, 0.02, 0],
    [0, -0.04, 0],
    [0, 0, 0.06],
  ])
    sph(0.05, WHITE, TXX - 0.22 + dx, G + 0.53 + dy, TZZ + dz, [1, 0.8, 1], { flat: true });
  sph(0.025, ORANGE, TXX - 0.22, G + 0.62, TZZ, 1, { flat: true });
  // oranges
  for (const [dx, dz] of [
    [0.02, 0.1],
    [0.1, -0.02],
  ]) {
    sph(0.05, ORANGE, TXX + dx, G + 0.525, TZZ + dz, 1, { flat: true });
    put(new THREE.ConeGeometry(0.02, 0.04, 4), LEAF, [TXX + dx, G + 0.58, TZZ + dz]);
  }
  // vase of flowers
  lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.07, 0.07],
      [0.04, 0.14],
      [0.05, 0.17],
      [0, 0.17],
    ],
    BLUE,
    [TXX + 0.28, G + 0.475, TZZ],
    8,
  );
  torus(0.06, 0.008, GOLD, TXX + 0.28, G + 0.55, TZZ);
  for (let k = 0; k < 5; k++) {
    const tx = TXX + 0.28 + (k - 2) * 0.04;
    const ty = G + 0.78 + (k % 2) * 0.04;
    b.rod([TXX + 0.28, G + 0.62, TZZ], [tx, ty, TZZ + (k - 2) * 0.01], 0.006, LEAF, { bone: root });
    sph(0.035, k % 2 ? PINK : cel("#ffe27a"), tx, ty + 0.02, TZZ + (k - 2) * 0.01, 1, { flat: true });
  }
  // candles
  for (const dx of [-0.05, 0.1]) {
    cyl(0.03, 0.04, 0.02, 8, GOLD, TXX + dx, G + 0.485, TZZ + 0.15);
    cyl(0.018, 0.018, 0.1, 8, CREAM, TXX + dx, G + 0.54, TZZ + 0.15);
    glow(put(new THREE.ConeGeometry(0.014, 0.045, 5), WARM, [TXX + dx, G + 0.615, TZZ + 0.15]), 1.6);
  }

  // ---------------------------------------------------------------- offerings: sake barrels and straw, right
  const barrel = (x: number, z: number, h: number) => {
    lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.25, h * 0.5],
        [0.2, h],
        [0, h],
      ],
      WOOD,
      [x, G, z],
      10,
    );
    for (const f of [0.22, 0.78]) torus(0.225, 0.012, GOLD, x, G + h * f, z, { scale: [1.05, 1.05, 1] });
    cyl(0.19, 0.19, 0.012, 10, WOOD_D, x, G + h + 0.005, z);
    plane(0.16, 0.12, LABEL, [x, G + h * 0.5, z + 0.258], [0, 0, 1]);
  };
  barrel(1.2, -0.7, 0.55);
  barrel(1.55, -0.55, 0.45);
  for (const [dz, dy] of [
    [0, 0],
    [0.34, 0],
  ]) {
    cyl(0.12, 0.12, 0.5, 8, STRAW, 0.82, G + 0.12 + dy, -1.0 + dz - 0.25, { rotation: [0, 0, 0] });
  }
  cyl(0.15, 0.15, 0.32, 8, STRAW, 1.55, G + 0.16, -1.1, { rotation: [0, 0, 90] });
  torus(0.15, 0.012, ROPE, 1.55, G + 0.16, -1.1, { rotation: [0, 90, 0] });
  // incense burner
  lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.12, 0.08],
      [0.1, 0.13],
      [0.14, 0.17],
      [0, 0.17],
    ],
    GOLD,
    [0.78, G + 0.07, 0.5],
    8,
  );
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    put(new THREE.ConeGeometry(0.03, 0.08, 4), GOLD, [0.78 + Math.sin(a) * 0.08, G + 0.04, 0.5 + Math.cos(a) * 0.08], {
      rotation: [180, 0, 0],
    });
    const ex = 0.78 + (k - 1) * 0.03;
    b.rod([ex, G + 0.2, 0.5], [ex + (k - 1) * 0.02, G + 0.42, 0.5], 0.004, VERM, { bone: root });
    glow(sph(0.01, "#ff7a3a", ex + (k - 1) * 0.02, G + 0.425, 0.5, 1, { flat: true }), 1.5);
  }
  tube(
    [
      [0.78, G + 0.44, 0.5],
      [0.82, G + 0.7, 0.52],
      [0.76, G + 0.95, 0.48],
      [0.82, G + 1.2, 0.5],
    ],
    [0.014, 0.004],
    "#eaf6ff",
    { sides: 4 },
  );

  // ---------------------------------------------------------------- ema rack
  for (const x of [1.75, 2.45]) {
    box(0.07, 1.4, 0.07, WOOD_D, x, G + 0.7, 1.0);
    sph(0.04, GOLD, x, G + 1.42, 1.0, 1, { flat: true });
  }
  box(0.95, 0.06, 0.07, WOOD_D, 2.1, G + 1.25, 1.0);
  box(0.95, 0.05, 0.07, WOOD_D, 2.1, G + 0.82, 1.0);
  box(1.1, 0.05, 0.34, TILE, 2.1, G + 1.45, 1.0, { rotation: [0, 0, 0] });
  const re = rng(21);
  for (const [row, ry] of [
    [0, 1.25],
    [1, 0.82],
  ]) {
    for (let k = 0; k < 4 - row; k++) {
      const ex = 1.9 + k * 0.17 + row * 0.08 + (re() - 0.5) * 0.02;
      b.rod([ex, G + ry - 0.03, 1.0], [ex, G + ry - 0.1, 1.0], 0.004, ROPE, { bone: root });
      box(0.14, 0.17, 0.016, WOOD, ex, G + ry - 0.19, 1.0);
      plane(0.12, 0.145, EMA, [ex, G + ry - 0.19, 1.0 + 0.01], [0, 0, 1]);
    }
  }

  // ---------------------------------------------------------------- sakura tree
  tube(
    [
      [-2.3, G - 0.02, -1.4],
      [-2.25, 0.7, -1.4],
      [-2.05, 1.5, -1.45],
      [-1.85, 2.2, -1.5],
    ],
    [0.19, 0.07],
    BARK,
    { sides: 7 },
  );
  tube(
    [
      [-2.2, 1.2, -1.4],
      [-2.6, 1.7, -1.4],
      [-2.9, 2.1, -1.3],
    ],
    [0.07, 0.025],
    BARK,
    { sides: 6 },
  );
  tube(
    [
      [-2.1, 1.5, -1.45],
      [-1.7, 1.95, -1.6],
      [-1.45, 2.25, -1.6],
    ],
    [0.06, 0.025],
    BARK,
    { sides: 6 },
  );
  const blobs: Array<[number, number, number, number, Fill]> = [
    [-1.85, 2.6, -1.5, 0.75, PINK],
    [-2.5, 2.3, -1.3, 0.6, PINK_L],
    [-1.55, 2.3, -1.6, 0.5, PINK_L],
    [-2.9, 2.2, -1.25, 0.45, PINK],
    [-2.2, 3.0, -1.6, 0.5, PINK],
  ];
  const rb = rng(31);
  const petalFrames: ReturnType<typeof frame>[] = [];
  for (const [x, y, z, r, c] of blobs) {
    put(new THREE.IcosahedronGeometry(r, 1), c, [x, y, z], { flat: true });
    for (let k = 0; k < 12; k++) {
      const th = rb() * Math.PI * 2;
      const ph = Math.acos(rb() * 1.6 - 0.8);
      const d: V = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
      petalFrames.push(frame([x + d[0] * r, y + d[1] * r, z + d[2] * r], d));
    }
  }
  b.cards(petalFrames, PETAL, { size: [0.17, 0.17], lean: 25, vary: 0.3, spin: 90, rng: rng(32), bone: root });
  const fallen: ReturnType<typeof frame>[] = [];
  const rf = rng(33);
  for (let k = 0; k < 40; k++) {
    const a = rf() * Math.PI * 2;
    const d = Math.sqrt(rf()) * 0.95;
    fallen.push(frame([-2.3 + Math.cos(a) * d * 0.9, G + 0.004, -1.4 + Math.sin(a) * d * 0.9], [0, 1, 0]));
  }
  b.cards(fallen, PETAL, {
    size: [0.07, 0.07],
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
    sink: 0,
    bone: root,
  });

  // ---------------------------------------------------------------- grass tufts
  const rg = rng(41);
  const tufts: ReturnType<typeof frame>[] = [];
  for (let tries = 0; tries < 400 && tufts.length < 80; tries++) {
    const a = rg() * Math.PI * 2;
    const d = 0.8 + rg() * 2.6;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.abs(x) < 1.45 && z < 1.25 && z > -2.9) continue;
    if (Math.abs(x) < 0.7 && z > 0.9) continue;
    if (Math.hypot(Math.abs(x) - 1.7, z - 0.2) < 0.45) continue;
    if (Math.hypot(x - 2.1, z - 1.0) < 0.75) continue;
    if (Math.hypot(x + 2.3, z + 1.4) < 0.45) continue;
    if (Math.hypot(x - 1.4, z + 0.7) < 0.6) continue;
    tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.12, 0.17], cross: true, vary: 0.3, spin: 180, rng: rng(42), bone: root });

  // ---------------------------------------------------------------- wind glow
  glow(
    b.sweep(
      spiral([0, 0.65, -0.35], [0.32, 0.65, -0.35], [0, 1, 0], { turns: 2.2, r1: 0.06, pitch: 0.35 }),
      [0.014, 0.004],
      { color: TEAL, bone: root, sides: 4, caps: "point" },
    ),
    1.4,
  );
  glow(
    b.sweep(
      spiral([1.05, 0.9, 0.55], [1.3, 0.9, 0.55], [0, 1, 0], { turns: -1.5, r1: 0.05, pitch: 0.3 }),
      [0.012, 0.004],
      { color: TEAL, bone: root, sides: 4, caps: "point" },
    ),
    1.4,
  );
  const orbs: V[] = [
    [0.4, 1.3, -0.4],
    [-0.5, 1.05, -0.3],
    [0.2, 1.9, 0.2],
    [-1.0, 1.6, 0.3],
    [1.1, 1.5, 0.1],
    [0.0, 1.0, 0.5],
  ];
  for (const [x, y, z] of orbs) {
    glow(sph(0.035, TEAL, x, y, z, 1, { flat: true }), 1.5);
    sph(0.014, GOLD, x + 0.07, y - 0.05, z, 1, { flat: true });
  }

  return b.root;
}
