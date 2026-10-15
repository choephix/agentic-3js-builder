import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "A roadside shrine with a vermilion torii, shimenawa rope and paper lanterns, stone toro, fox guardians, a small hokora with bell, offerings table, sake barrels, ema rack and a glowing elemental seal.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];

const NS = 'xmlns="http://www.w3.org/2000/svg"';

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lanternShrine" });
  const r = rng(11);

  // ---------- palette ----------
  const VERM = cel(grain("#e6442b", "#cf3622", { size: 0.05, axis: "y" }));
  const BLACK = cel("#2b1b26");
  const GOLD = cel("#f6c94f", "#d08a2a");
  const STONE = cel(mottle("#cfc9ba", "#a8b79b", { size: 0.12 }));
  const STONED = cel(mottle("#a39d92", "#8e9a86", { size: 0.12, seed: 3 }));
  const WOOD = cel(grain("#a8703c", "#8d5a2e", { size: 0.04, axis: "y" }));
  const WOODH = cel(grain("#b57b45", "#94602f", { size: 0.04, axis: "x" }));
  const PLASTER = cel(mottle("#f6ead0", "#ead7b0", { size: 0.1, seed: 2 }));
  const TILE = cel(stripes("#2fa79a", "#1d7d7c", { size: 0.09, axis: "x", width: 0.3 }));
  const GRASSP = cel(mottle("#86cc5e", "#5fa84a", { size: 0.4, seed: 8 }));
  const DIRT = cel(mottle("#dcc38c", "#c9a96f", { size: 0.2, seed: 4 }));
  const STRAW = cel(grain("#ecd48f", "#c6a557", { size: 0.02, axis: "y" }));
  const RED = cel("#d8402a");
  const CLOTH = cel("#c93a3a");
  const FOXC = cel(mottle("#f4f0e4", "#cfd6cc", { size: 0.1, seed: 5 }));
  const JADE = cel("#7fcdb0");
  const ORANGE = cel("#ff9a2e");
  const PINK = cel("#ff9fbf");
  const LEAFC = cel("#5fae4a");
  const LEAFD = cel("#46963e");
  const BAMBOO = cel(grain("#7bc558", "#5a9f45", { size: 0.03, axis: "y" }));
  const BRONZE = cel("#b98a4a");
  const WHITE = cel("#fff6e6");
  const TEAL = cel("#27c9b5");
  const INKC = "#22112f";
  const BELLGOLD = "#e8b445";

  // ---------- textures ----------
  const PLAQUE = svg(
    `<svg ${NS} viewBox="0 0 40 52"><rect x="1" y="1" width="38" height="50" rx="3" fill="#1d2a52" stroke="#f4c752" stroke-width="2.5"/><circle cx="20" cy="26" r="11" fill="none" stroke="#f4c752" stroke-width="2.5"/><path d="M20 12 L24 22 L34 26 L24 30 L20 40 L16 30 L6 26 L16 22 Z" fill="#f4c752"/><circle cx="20" cy="26" r="3" fill="#1d2a52"/><path d="M8 8 h6 M26 8 h6 M8 44 h6 M26 44 h6" stroke="#f4c752" stroke-width="2"/></svg>`,
    { size: 160 },
  );
  const DOOR = svg(
    `<svg ${NS} viewBox="0 0 30 52"><rect width="30" height="52" fill="#d8402a"/><rect x="2" y="2" width="26" height="48" fill="#fff0cf"/><rect x="2" y="2" width="26" height="6" fill="#f2c14e"/><path d="M10 8 V50 M20 8 V50 M2 20 H28 M2 32 H28 M2 42 H28" stroke="#d8402a" stroke-width="1.6" fill="none"/><circle cx="24" cy="29" r="2.4" fill="#f2c14e"/></svg>`,
    { size: 192 },
  );
  const WINDOW = svg(
    `<svg ${NS} viewBox="0 0 40 40"><rect width="40" height="40" fill="#d8402a"/><rect x="3" y="3" width="34" height="34" fill="#fff0cf"/><path d="M3 3 L37 37 M37 3 L3 37 M20 3 V37 M3 20 H37" stroke="#d8402a" stroke-width="1.6" fill="none"/><circle cx="20" cy="20" r="5" fill="none" stroke="#f2c14e" stroke-width="1.8"/></svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg ${NS} viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="3" fill="#d8402a" stroke="#f4c752" stroke-width="1.8"/><circle cx="16" cy="16" r="9" fill="none" stroke="#f4c752" stroke-width="1.8"/><path d="M16 8 L22 16 L16 24 L10 16 Z" fill="#f4c752"/></svg>`,
    { size: 128 },
  );
  const BANNER = svg(
    `<svg ${NS} viewBox="0 0 26 90"><path d="M0 0 H26 V90 L13 80 L0 90 Z" fill="#1fa89a"/><path d="M2.5 2.5 H23.5 V83 L13 74 L2.5 83 Z" fill="none" stroke="#f4c752" stroke-width="2"/><circle cx="13" cy="25" r="7" fill="none" stroke="#ffffff" stroke-width="2.2"/><circle cx="13" cy="25" r="2.8" fill="#f4c752"/><path d="M5 45 q4 -6 8 0 t8 0 M5 55 q4 -6 8 0 t8 0" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M5 65 q4 -6 8 0 t8 0" stroke="#f4c752" stroke-width="2" fill="none"/></svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg ${NS} viewBox="0 0 20 44"><polygon points="4,0 16,0 16,10 10,14 16,18 10,22 16,26 10,30 16,34 10,38 12,44 4,44" fill="#fffaf0" stroke="#d9cfb5" stroke-width="0.8"/></svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg ${NS} viewBox="0 0 14 64"><path d="M7 63 C0 40 0 18 7 1 C14 18 14 40 7 63 Z" fill="#5db84a"/><path d="M7 63 C0 40 0 18 7 1 Z" fill="#4aa23f"/><path d="M7 62 V4" stroke="#3c8f3a" stroke-width="1.2" fill="none"/></svg>`,
    { size: 256 },
  );
  const GRASS = svg(
    `<svg ${NS} viewBox="0 0 32 40"><path d="M4 40 Q6 18 2 4 Q12 16 12 40 Z" fill="#6fc04e"/><path d="M12 40 Q14 12 16 0 Q22 14 22 40 Z" fill="#86d65c"/><path d="M20 40 Q24 20 30 8 Q30 24 28 40 Z" fill="#5aae45"/></svg>`,
    { size: 128 },
  );
  const PETAL = svg(
    `<svg ${NS} viewBox="0 0 20 20"><path d="M10 19 C2 14 1 6 6 2 Q10 5 14 2 C19 6 18 14 10 19 Z" fill="#ffb7cf"/><path d="M10 17 V8" stroke="#ff8fb3" stroke-width="1.4" fill="none"/></svg>`,
    { size: 64 },
  );
  const emaShape = (inner: string) =>
    svg(
      `<svg ${NS} viewBox="0 0 40 34"><polygon points="20,1 39,10 39,33 1,33 1,10" fill="#e0b070" stroke="#8a5a2b" stroke-width="1.6"/>${inner}</svg>`,
      { size: 192 },
    );
  const EMA = [
    emaShape(
      `<polygon points="11,28 8,15 16,20 24,20 32,15 29,28 20,31" fill="#fff" stroke="#d8402a" stroke-width="1.2"/><circle cx="15" cy="23" r="1.4" fill="#22112f"/><circle cx="25" cy="23" r="1.4" fill="#22112f"/><circle cx="20" cy="27" r="1.6" fill="#22112f"/>`,
    ),
    emaShape(
      `<polygon points="20,10 23,18 31,18 25,23 27,31 20,26 13,31 15,23 9,18 17,18" fill="#f4c752" stroke="#8a5a2b" stroke-width="1"/><circle cx="20" cy="22" r="2.4" fill="#27c9b5"/>`,
    ),
    emaShape(
      `<circle cx="20" cy="21" r="3" fill="#f4c752"/><circle cx="20" cy="14" r="3.6" fill="#ff9fbf"/><circle cx="26.5" cy="19" r="3.6" fill="#ff9fbf"/><circle cx="24" cy="27" r="3.6" fill="#ff9fbf"/><circle cx="16" cy="27" r="3.6" fill="#ff9fbf"/><circle cx="13.5" cy="19" r="3.6" fill="#ff9fbf"/><circle cx="20" cy="21" r="2.4" fill="#f4c752"/>`,
    ),
  ];
  const SEAL = svg(
    `<svg ${NS} viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#6ff2e0" stroke-width="3"/><circle cx="50" cy="50" r="38" fill="none" stroke="#ffd76a" stroke-width="2"/><polygon points="50,14 81,68 19,68" fill="none" stroke="#6ff2e0" stroke-width="2.4"/><polygon points="50,86 19,32 81,32" fill="none" stroke="#6ff2e0" stroke-width="2.4"/><circle cx="50" cy="12" r="3.2" fill="#ffd76a"/><circle cx="50" cy="88" r="3.2" fill="#ffd76a"/><circle cx="17" cy="31" r="3.2" fill="#ffd76a"/><circle cx="83" cy="31" r="3.2" fill="#ffd76a"/><circle cx="17" cy="69" r="3.2" fill="#ffd76a"/><circle cx="83" cy="69" r="3.2" fill="#ffd76a"/><circle cx="50" cy="50" r="6" fill="#ffd76a"/></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const put = (g: THREE.BufferGeometry, c: Fill, x: number, y: number, z: number, rot?: V, sc?: number | V) => {
    const o: PartOptions = { at: [x, y, z] };
    if (rot) o.rotation = rot;
    if (sc !== undefined) o.scale = sc;
    return b.part(g, c, o);
  };
  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, c: Fill, rot?: V) =>
    put(new THREE.BoxGeometry(w, h, d), c, x, y, z, rot);
  const cy = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, c: Fill, rot?: V) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, rot);
  const sp = (rad: number, x: number, y: number, z: number, c: Fill, sc?: V, seg = 8) =>
    put(new THREE.SphereGeometry(rad, seg, Math.max(3, Math.floor(seg / 2))), c, x, y, z, undefined, sc);
  const tor = (R: number, t: number, x: number, y: number, z: number, c: Fill, rot: V = [90, 0, 0]) =>
    put(new THREE.TorusGeometry(R, t, 5, 12), c, x, y, z, rot);
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });
  const bothSides = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, gap: number) => {
    plane(w, h, tex, x, y, z + gap, [0, 0, 1]);
    plane(w, h, tex, x, y, z - gap, [0, 0, -1]);
  };

  const G = 0.08; // ground top

  // ---------- ground ----------
  cy(2.1, 2.15, G, 22, 0, G / 2, 0, GRASSP);
  cy(2.17, 2.2, 0.04, 22, 0, 0.02, 0, STONED);
  bx(0.8, 0.012, 2.3, 0, G + 0.004, 0.85, DIRT);
  [1.75, 1.45, 1.15, 0.85, 0.06].forEach((z, i) => {
    bx(0.5, 0.05, 0.24, 0, G + 0.025, z, i % 2 ? STONE : STONED, [0, (i % 2 ? 4 : -4), 0]);
  });
  // path edge stones
  for (let i = 0; i < 9; i++) {
    for (const s of [1, -1]) {
      const z = 1.9 - i * 0.24 + (r() - 0.5) * 0.08;
      put(new THREE.IcosahedronGeometry(0.05 + r() * 0.03, 0), i % 2 ? STONE : STONED, s * (0.43 + r() * 0.04), G + 0.02, z, [r() * 60, r() * 90, 0], [1, 0.7, 1]);
    }
  }
  // elemental seal
  cy(0.32, 0.34, 0.03, 16, 0, G + 0.015, 0.5, STONED);
  glow(b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", { at: [0, G + 0.034, 0.5], dir: [0, 1, 0], axis: "z", texture: SEAL }));

  // ---------- torii ----------
  const TZ = 1.2;
  for (const s of [1, -1]) {
    const x = s * 0.8;
    cy(0.17, 0.19, 0.14, 8, x, 0.13, TZ, STONED);
    cy(0.1, 0.1, 2.3, 10, x, 1.35, TZ, VERM);
    cy(0.108, 0.112, 0.26, 10, x, 0.33, TZ, BLACK);
    tor(0.112, 0.012, x, 0.47, TZ, GOLD);
    tor(0.105, 0.012, x, 2.25, TZ, GOLD);
    tor(0.105, 0.012, x, 1.85, TZ, GOLD);
    bx(0.04, 0.12, 0.04, s * 0.7, 1.98, TZ, GOLD);
  }
  bx(2.0, 0.11, 0.13, 0, 2.05, TZ, VERM);
  bx(2.0, 0.025, 0.14, 0, 2.115, TZ, BLACK);
  bx(0.08, 0.4, 0.09, 0, 2.3, TZ, VERM);
  bx(2.3, 0.1, 0.18, 0, 2.5, TZ, VERM);
  bx(2.4, 0.03, 0.19, 0, 2.57, TZ, BLACK);
  b.extrude(
    [
      [-1.2, 0],
      [1.2, 0],
      [1.4, 0.16],
      [1.0, 0.1],
      [-1.0, 0.1],
      [-1.4, 0.16],
    ],
    { at: [0, 2.58, TZ], x: [1, 0, 0], thickness: 0.24, bevel: 0.01, color: BLACK },
  );
  for (const s of [1, -1]) {
    bx(0.03, 0.17, 0.26, s * 1.4, 2.66, TZ, GOLD);
    bx(0.5, 0.025, 0.26, s * 1.1, 2.69, TZ, GOLD);
  }
  bx(0.4, 0.36, 0.04, 0, 2.29, TZ + 0.08, GOLD);
  bx(0.4, 0.36, 0.04, 0, 2.29, TZ - 0.08, GOLD);
  bothSides(0.34, 0.44, PLAQUE, 0, 2.29, TZ, 0.103);

  // shimenawa with shide
  const rope = catmull([
    [-0.72, 1.98, 1.32],
    [-0.4, 1.9, 1.34],
    [0, 1.86, 1.35],
    [0.4, 1.9, 1.34],
    [0.72, 1.98, 1.32],
  ]);
  b.sweep(rope, 0.035, STRAW, { sides: 6 });
  for (const s of [1, -1]) {
    b.spike([s * 0.74, 1.98, 1.32], [0, -1, 0], 0.2, 0.045, STRAW);
    tor(0.04, 0.008, s * 0.74, 1.95, 1.32, CLOTH, [90, 0, 0]);
  }
  for (let i = 0; i < 9; i++) {
    const p = rope.at((i + 0.5) / 9);
    tor(0.038, 0.007, p.x, p.y, p.z, STRAW, [0, 90, 0]);
  }
  b.cards(
    [0.12, 0.28, 0.44, 0.56, 0.72, 0.88].map((t) => {
      const p = rope.at(t);
      return frame([p.x, p.y - 0.02, p.z], [0, 1, 0]);
    }),
    SHIDE,
    { size: [0.1, 0.24], lean: 180, flow: [0, 0, 1] },
  );

  // hanging paper lanterns on the torii
  for (const x of [-0.45, 0.45]) {
    b.rod([x, 2.0, TZ], [x, 1.9, TZ], 0.008, BLACK);
    cy(0.06, 0.05, 0.04, 8, x, 1.88, TZ, GOLD);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.07, 0],
          [0.12, 0.06],
          [0.15, 0.17],
          [0.12, 0.27],
          [0.07, 0.33],
          [0, 0.33],
        ],
        { at: [x, 1.55, TZ], segments: 10, smoothing: 1, color: "#ff8a3d" },
      ),
    );
    cy(0.065, 0.06, 0.03, 8, x, 1.535, TZ, GOLD);
    [
      [0.1, 0.135],
      [0.17, 0.153],
      [0.24, 0.134],
    ].forEach(([dy, R]) => tor(R, 0.006, x, 1.55 + dy, TZ, BLACK));
    b.spike([x, 1.52, TZ], [0, -1, 0], 0.16, 0.02, RED);
    sp(0.02, x, 1.5, TZ, GOLD);
  }

  // ---------- stone lanterns ----------
  const toro = (x: number, z: number) => {
    cy(0.2, 0.24, 0.1, 6, x, G + 0.05, z, STONED);
    cy(0.07, 0.085, 0.42, 8, x, G + 0.31, z, STONE);
    sp(0.1, x, G + 0.3, z, STONE, [1, 0.5, 1]);
    tor(0.085, 0.01, x, G + 0.46, z, GOLD);
    cy(0.26, 0.2, 0.07, 6, x, G + 0.555, z, STONED);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) bx(0.035, 0.2, 0.035, x + sx * 0.085, G + 0.69, z + sz * 0.085, STONE);
    glow(bx(0.15, 0.17, 0.15, x, G + 0.69, z, "#ffc65a"));
    cy(0.24, 0.24, 0.04, 6, x, G + 0.81, z, STONE);
    put(new THREE.ConeGeometry(0.42, 0.2, 6), cel(mottle("#9fa59a", "#86a07e", { size: 0.1, seed: 9 })), x, G + 0.93, z);
    tor(0.24, 0.012, x, G + 0.84, z, GOLD);
    sp(0.05, x, G + 1.06, z, STONE, [1, 1.2, 1]);
    put(new THREE.ConeGeometry(0.03, 0.09, 6), GOLD, x, G + 1.14, z);
  };
  toro(1.0, 0.5);
  toro(-1.0, 0.5);

  // ---------- fox guardians ----------
  const fox = (s: number, x: number, z: number) => {
    bx(0.34, 0.28, 0.34, x, 0.22, z, STONED);
    bx(0.4, 0.04, 0.4, x, 0.38, z, STONE);
    const y0 = 0.4;
    sp(0.13, x, y0 + 0.12, z - 0.05, FOXC, [1, 1, 1.15]);
    b.capsule([x, y0 + 0.14, z - 0.02], [x, y0 + 0.34, z + 0.05], 0.085, FOXC, { sides: 8 });
    sp(0.09, x, y0 + 0.43, z + 0.07, FOXC, [1.05, 0.95, 1]);
    b.spike([x, y0 + 0.41, z + 0.12], [0, -0.12, 1], 0.1, 0.045, FOXC);
    sp(0.014, x, y0 + 0.395, z + 0.225, INKC, undefined, 5);
    for (const j of [1, -1]) {
      b.spike([x + j * 0.07, y0 + 0.41, z + 0.08], [j, -0.1, 0.2], 0.07, 0.03, FOXC);
      b.spike([x + j * 0.05, y0 + 0.49, z + 0.06], [j * 0.35, 1, -0.2], 0.12, 0.036, FOXC);
      b.spike([x + j * 0.05, y0 + 0.49, z + 0.075], [j * 0.35, 1, -0.2], 0.09, 0.022, RED);
      b.rod([x + j * 0.055, y0 + 0.28, z + 0.06], [x + j * 0.055, y0 + 0.02, z + 0.1], 0.028, FOXC);
      sp(0.035, x + j * 0.055, y0 + 0.025, z + 0.12, FOXC, [1, 0.6, 1.4], 6);
      sp(0.012, x + j * 0.04, y0 + 0.455, z + 0.15, INKC, undefined, 5);
      b.rod([x + j * 0.05, y0 + 0.47, z + 0.13], [x + j * 0.025, y0 + 0.44, z + 0.15], 0.006, RED);
    }
    b.sweep(
      catmull([
        [x + s * 0.1, y0 + 0.04, z - 0.14],
        [x + s * 0.2, y0 + 0.04, z - 0.2],
        [x + s * 0.26, y0 + 0.14, z - 0.12],
        [x + s * 0.22, y0 + 0.28, z - 0.08],
      ]),
      [0.03, 0.05, 0.04, 0.01],
      FOXC,
      { sides: 6 },
    );
    tor(0.085, 0.016, x, y0 + 0.33, z + 0.05, RED, [75, 0, 0]);
    sp(0.022, x, y0 + 0.29, z + 0.12, BELLGOLD, undefined, 6);
    bx(0.1, 0.08, 0.01, x, y0 + 0.26, z + 0.115, RED, [-20, 0, 0]);
  };
  fox(1, 0.58, 0.05);
  fox(-1, -0.58, 0.05);

  // ---------- hokora shrine ----------
  const SZ = -1.1;
  bx(1.3, 0.22, 1.0, 0, 0.19, SZ, STONE);
  bx(0.7, 0.07, 0.16, 0, G + 0.035, -0.5, STONED);
  bx(0.7, 0.07, 0.2, 0, G + 0.075, -0.58, STONE);
  bx(0.9, 0.75, 0.7, 0, 0.675, SZ, PLASTER);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) bx(0.07, 0.78, 0.07, sx * 0.45, 0.69, SZ + sz * 0.35, VERM);
  bx(0.98, 0.06, 0.06, 0, 1.07, SZ + 0.35, VERM);
  bx(0.98, 0.06, 0.06, 0, 1.07, SZ - 0.35, VERM);
  for (const sx of [1, -1]) bx(0.06, 0.06, 0.78, sx * 0.45, 1.07, SZ, VERM);
  bx(0.9, 0.04, 0.05, 0, 0.33, SZ + 0.355, VERM);
  plane(0.34, 0.62, DOOR, -0.19, 0.675, SZ + 0.355, [0, 0, 1]);
  plane(0.34, 0.62, DOOR, 0.19, 0.675, SZ + 0.355, [0, 0, 1]);
  bx(0.04, 0.68, 0.03, 0, 0.675, SZ + 0.355, VERM);
  for (const sx of [1, -1]) plane(0.4, 0.4, WINDOW, sx * 0.452, 0.72, SZ, [sx, 0, 0]);
  // roof
  for (const s of [1, -1]) {
    bx(0.75, 0.07, 1.3, s * 0.325, 1.3125, SZ, TILE, [0, 0, -s * 30]);
    bx(0.78, 0.045, 0.05, s * 0.325, 1.3125 + 0.035, SZ + 0.66, GOLD, [0, 0, -s * 30]);
    bx(0.78, 0.045, 0.05, s * 0.325, 1.3125 + 0.035, SZ - 0.66, GOLD, [0, 0, -s * 30]);
    for (let k = 0; k < 4; k++)
      bx(0.04, 0.03, 1.32, s * (0.13 + k * 0.13), 1.5 - (0.13 + k * 0.13) * 0.577 + 0.045, SZ, WOODH, [0, 0, -s * 30]);
  }
  cy(0.06, 0.06, 1.4, 6, 0, 1.53, SZ, cel("#1d7d7c"), [90, 0, 0]);
  put(new THREE.ConeGeometry(0.06, 0.14, 6), GOLD, 0, 1.54, SZ + 0.76, [90, 0, 0]);
  put(new THREE.ConeGeometry(0.06, 0.14, 6), GOLD, 0, 1.54, SZ - 0.76, [-90, 0, 0]);
  sp(0.035, 0, 1.6, SZ + 0.55, GOLD, undefined, 6);
  sp(0.035, 0, 1.6, SZ - 0.55, GOLD, undefined, 6);
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0, 0.34],
    ],
    { at: [0, 1.1, SZ + 0.34], x: [1, 0, 0], thickness: 0.04, color: PLASTER },
  );
  bx(0.14, 0.14, 0.02, 0, 1.2, SZ + 0.365, GOLD);
  glow(bx(0.08, 0.08, 0.012, 0, 1.2, SZ + 0.38, "#7ff0dc"));
  for (const x of [-0.45, -0.15, 0.15, 0.45]) bx(0.09, 0.06, 0.09, x, 1.13, SZ + 0.4, GOLD);
  // bell and rope
  bx(0.9, 0.05, 0.05, 0, 1.1, -0.55, VERM);
  for (const s of [1, -1]) bx(0.04, 0.1, 0.04, s * 0.42, 1.17, -0.55, VERM);
  b.rod([0, 1.08, -0.55], [0, 0.78, -0.55], 0.018, stripes("#e0432a", "#fff1d6", { size: 0.05, axis: "y" }), { sides: 6 });
  sp(0.075, 0, 0.72, -0.55, BELLGOLD);
  tor(0.073, 0.006, 0, 0.72, -0.55, INKC);
  cy(0.02, 0.025, 0.03, 6, 0, 0.8, -0.55, BELLGOLD);
  for (const s of [1, -1]) {
    b.spike([s * 0.3, 1.04, SZ + 0.38], [0, -1, 0], 0.16, 0.025, RED);
    sp(0.03, s * 0.3, 1.04, SZ + 0.38, GOLD, undefined, 6);
  }
  // sanbo offerings on the platform
  const sanbo = (x: number) => {
    bx(0.11, 0.05, 0.11, x, 0.325, -0.67, WOOD);
    cy(0.085, 0.065, 0.02, 8, x, 0.36, -0.67, WOODH);
  };
  sanbo(-0.28);
  sanbo(0.28);
  cy(0.06, 0.065, 0.03, 8, -0.28, 0.385, -0.67, WHITE);
  cy(0.045, 0.05, 0.03, 8, -0.28, 0.415, -0.67, WHITE);
  sp(0.025, -0.28, 0.45, -0.67, ORANGE, undefined, 6);
  for (let i = 0; i < 3; i++) sp(0.03, 0.28 + (i - 1) * 0.04, 0.4, -0.67 + (i % 2) * 0.03, ORANGE, undefined, 6);
  sp(0.03, 0.28, 0.43, -0.66, "#ff5d5d", undefined, 6);

  // donation box
  bx(0.6, 0.3, 0.34, 0, G + 0.15, -0.25, cel(grain("#7a4a28", "#5f381d", { size: 0.04, axis: "x" })));
  bx(0.64, 0.025, 0.38, 0, G + 0.31, -0.25, BLACK);
  for (let k = -3; k <= 3; k++)
    b.rod([k * 0.075, G + 0.33, -0.25 - 0.14], [k * 0.075, G + 0.33, -0.25 + 0.14], 0.012, WOOD, { caps: "flat" });
  for (const sx of [1, -1]) bx(0.025, 0.31, 0.025, sx * 0.3, G + 0.155, -0.25 + 0.17, GOLD);
  plane(0.2, 0.2, LABEL, 0, 0.2, -0.25 + 0.172, [0, 0, 1]);

  // ---------- offering table ----------
  const TX = -1.25;
  const TZ2 = -0.5;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) bx(0.05, 0.34, 0.05, TX + sx * 0.35, 0.25, TZ2 + sz * 0.2, WOOD);
  bx(0.8, 0.05, 0.5, TX, 0.445, TZ2, WOODH);
  bx(0.3, 0.01, 0.52, TX, 0.475, TZ2, CLOTH);
  bx(0.31, 0.012, 0.03, TX, 0.477, TZ2 + 0.24, GOLD);
  bx(0.31, 0.012, 0.03, TX, 0.477, TZ2 - 0.24, GOLD);
  const bottle = (x: number, z: number, c: Fill) => {
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.045, 0.02],
        [0.045, 0.12],
        [0.03, 0.17],
        [0.015, 0.2],
        [0.015, 0.24],
        [0, 0.24],
      ],
      { at: [x, 0.48, z], segments: 8, color: c },
    );
    plane(0.05, 0.05, LABEL, x, 0.56, z + 0.043, [0, 0, 1]);
  };
  bottle(TX - 0.28, TZ2 - 0.05, JADE);
  bottle(TX - 0.19, TZ2 + 0.05, cel("#9fd4f0"));
  cy(0.13, 0.11, 0.03, 10, TX + 0.0, 0.495, TZ2, WOOD);
  [
    [-0.05, 0.03],
    [0.05, 0.03],
    [0, -0.05],
    [0, 0.0],
  ].forEach(([dx, dz], i) => {
    sp(0.045, TX + dx, i === 3 ? 0.58 : 0.54, TZ2 + dz, ORANGE, undefined, 7);
    if (i === 3) b.spike([TX, 0.62, TZ2], [0.3, 1, 0], 0.04, 0.015, LEAFC);
  });
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.07, 0.04],
      [0.075, 0.07],
      [0, 0.07],
    ],
    { at: [TX + 0.26, 0.48, TZ2 + 0.1], segments: 8, color: WHITE },
  );
  sp(0.065, TX + 0.26, 0.55, TZ2 + 0.1, WHITE, [1, 0.6, 1]);
  cy(0.05, 0.04, 0.07, 8, TX - 0.1, 0.515, TZ2 + 0.17, BRONZE);
  for (let k = -1; k <= 1; k++) b.rod([TX - 0.1 + k * 0.012, 0.55, TZ2 + 0.17], [TX - 0.1 + k * 0.02, 0.66, TZ2 + 0.17], 0.004, "#8a2d1e", { caps: "flat" });
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.05, 0.05],
      [0.03, 0.1],
      [0.035, 0.11],
      [0, 0.11],
    ],
    { at: [TX + 0.3, 0.48, TZ2 - 0.12], segments: 8, color: cel("#6a9bd8") },
  );
  [
    [0, 0.2],
    [-0.05, 0.17],
    [0.05, 0.16],
  ].forEach(([dx, h], i) => {
    b.rod([TX + 0.3, 0.58, TZ2 - 0.12], [TX + 0.3 + dx, 0.48 + h + 0.1, TZ2 - 0.12], 0.005, LEAFD, { caps: "flat" });
    sp(0.03, TX + 0.3 + dx, 0.48 + h + 0.12, TZ2 - 0.12, i === 0 ? PINK : "#fff2a8", undefined, 6);
    sp(0.012, TX + 0.3 + dx, 0.48 + h + 0.12, TZ2 - 0.1, GOLD, undefined, 5);
  });

  // ---------- sake barrels ----------
  const barrel = (x: number, y: number, z: number) => {
    cy(0.17, 0.17, 0.3, 10, x, y + 0.15, z, cel(grain("#c99a5b", "#a9753a", { size: 0.03, axis: "y" })));
    cy(0.185, 0.185, 0.2, 10, x, y + 0.15, z, STRAW);
    for (const dy of [0.07, 0.23]) tor(0.187, 0.012, x, y + dy, z, cel("#9c7b3c"));
    cy(0.15, 0.17, 0.03, 10, x, y + 0.315, z, WOOD);
    plane(0.13, 0.14, LABEL, x, y + 0.15, z + 0.192, [0, 0, 1]);
  };
  barrel(1.15, G, -0.95);
  barrel(1.48, G, -0.95);
  barrel(1.32, G + 0.33, -0.98);
  bx(0.3, 0.02, 0.2, 1.55, G + 0.01, -0.6, WOODH);

  // ---------- ema rack ----------
  const RX = 1.15;
  const RZ = 0.0;
  for (const sx of [1, -1]) bx(0.06, 1.0, 0.06, RX + sx * 0.4, 0.58, RZ, WOOD);
  bx(0.9, 0.06, 0.07, RX, 1.0, RZ, WOOD);
  bx(0.9, 0.05, 0.06, RX, 0.78, RZ, WOOD);
  bx(1.04, 0.04, 0.3, RX, 1.12, RZ + 0.02, TILE, [12, 0, 0]);
  bx(1.06, 0.03, 0.03, RX, 1.09, RZ + 0.15, GOLD);
  for (let i = 0; i < 5; i++) {
    const ex = RX - 0.3 + i * 0.15;
    for (const [py, hy] of [
      [0.97, 0.88],
      [0.75, 0.66],
    ]) {
      b.rod([ex, py, RZ], [ex, hy + 0.05, RZ], 0.005, STRAW, { caps: "flat" });
      bothSides(0.13, 0.11, EMA[(i + (py < 0.9 ? 1 : 0)) % 3], ex, hy, RZ, 0.004);
    }
  }

  // ---------- banners ----------
  for (const s of [1, -1]) {
    const px = s * 1.5;
    const pz = 0.9;
    b.rod([px, G, pz], [px, 2.05, pz], 0.02, BAMBOO, { sides: 6 });
    sp(0.035, px, 2.09, pz, GOLD, undefined, 6);
    b.rod([px, 1.95, pz], [px - s * 0.3, 1.95, pz], 0.012, WOOD, { caps: "flat" });
    bothSides(0.27, 0.94, BANNER, px - s * 0.15, 1.46, pz, 0.004);
    sp(0.015, px - s * 0.3, 1.95, pz, GOLD, undefined, 5);
  }

  // ---------- bamboo ----------
  const leafFrames: ReturnType<typeof frame>[] = [];
  const stalks: Array<[number, number, number, number]> = [
    [-1.7, -1.3, 2.4, 0.06],
    [-1.55, -1.5, 2.0, -0.04],
    [-1.85, -1.1, 2.6, 0.08],
    [-1.4, -1.25, 1.8, 0.03],
    [1.75, -1.3, 2.5, -0.06],
    [1.6, -1.5, 2.1, 0.04],
    [1.88, -1.05, 2.0, -0.05],
    [1.45, -1.3, 2.3, 0.05],
  ];
  for (const [x, z, h, lean] of stalks) {
    const a: V = [x, G, z];
    const e: V = [x + lean, h, z];
    b.rod(a, e, [0.035, 0.02], BAMBOO, { sides: 6 });
    for (let k = 1; k <= 6; k++) {
      const t = k / 7;
      tor(0.035 - 0.015 * t + 0.004, 0.007, x + lean * t, G + (h - G) * t, z, cel("#4f8f3c"));
    }
    for (let k = 0; k < 7; k++) {
      const t = 0.7 + (k % 4) * 0.08;
      const ang = k * 2.4;
      leafFrames.push(frame([x + lean * t, G + (h - G) * t, z], [Math.cos(ang), 0.5, Math.sin(ang)]));
    }
  }
  b.cards(leafFrames, LEAF, { size: [0.07, 0.26], lean: 50, flow: [0, -1, 0], bend: 20, vary: 0.3, rng: r, spin: 20 });

  // ---------- bushes ----------
  const bush = (x: number, z: number, sc: number) => {
    sp(0.25 * sc, x, G + 0.16 * sc, z, LEAFC, [1, 0.75, 1], 7);
    sp(0.18 * sc, x + 0.15 * sc, G + 0.13 * sc, z + 0.1 * sc, LEAFD, [1, 0.8, 1], 6);
    sp(0.16 * sc, x - 0.16 * sc, G + 0.12 * sc, z - 0.05 * sc, LEAFC, [1, 0.8, 1], 6);
    for (let i = 0; i < 12; i++) {
      const a = r() * 6.28;
      const u = r() * 0.8;
      sp(0.028, x + Math.cos(a) * 0.22 * sc * u, G + (0.13 + 0.17 * Math.sqrt(1 - u * u * 0.9)) * sc, z + Math.sin(a) * 0.22 * sc * u, i % 3 ? PINK : "#fff0f4", undefined, 5);
    }
  };
  bush(1.5, -0.2, 1);
  bush(-1.55, 0.3, 1.1);
  bush(-1.3, 1.5, 0.8);
  bush(1.3, 1.55, 0.9);

  // ---------- grass tufts and fallen petals ----------
  const ok = (x: number, z: number) =>
    x * x + z * z < 1.95 * 1.95 &&
    !(Math.abs(x) < 0.5 && z > -0.5 && z < 2.0) &&
    !(Math.abs(x) < 0.8 && z < -0.4 && z > -1.7) &&
    !(Math.abs(x - TX) < 0.5 && Math.abs(z - TZ2) < 0.4) &&
    !(Math.abs(x - 1.32) < 0.45 && Math.abs(z + 0.95) < 0.4) &&
    !(Math.abs(x - RX) < 0.55 && Math.abs(z - RZ) < 0.3) &&
    !(Math.abs(Math.abs(x) - 1.0) < 0.3 && Math.abs(z - 0.5) < 0.3) &&
    !(Math.abs(x) < 1.0 && Math.abs(Math.abs(x) - 0.8) < 0.15 && Math.abs(z - TZ) < 0.2);
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 400 && tufts.length < 150; i++) {
    const x = (r() - 0.5) * 4;
    const z = (r() - 0.5) * 4;
    if (ok(x, z)) tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, {
    size: [0.14, 0.18],
    lean: 15,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    vary: 0.35,
    rng: r,
    cross: true,
  });
  const petals: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 300 && petals.length < 45; i++) {
    const x = (r() - 0.5) * 4;
    const z = (r() - 0.5) * 4;
    if (ok(x, z)) petals.push(frame([x, G + 0.004, z], [0, 1, 0]));
  }
  b.cards(petals, PETAL, {
    size: 0.05,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
    vary: 0.3,
    rng: r,
  });

  return b.root;
}
