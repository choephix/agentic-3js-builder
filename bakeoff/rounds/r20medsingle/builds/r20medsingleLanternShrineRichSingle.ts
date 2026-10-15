// Wayside lantern shrine: a vermilion torii, a tiny hip-roofed hokora with open lattice doors and a floating
// electro crystal, stone lanterns, kitsune guardians, offerings, ema rack, sake barrels and a sakura tree.
// Genshin-style: cel-shaded paints, gold filigree, glowing lantern paper and elemental motes.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, gradient, mottle, noise, paint, scales } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Wayside Lantern Shrine",
  description:
    "A roadside shrine: vermilion torii with paper lanterns and shide rope, a small hip-roofed hokora with open lattice doors and a floating electro crystal, stone lanterns, fox guardians, offerings, ema rack, sake barrels and a blossoming sakura tree.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(7);
  const RAD = Math.PI / 180;

  // ---------------------------------------------------------------- palette
  const vermilion = (axis: "x" | "y") =>
    cel(gradient(grain("#e4492f", "#d33f2b", { size: 0.035, axis }), "#8f2a30", [0, 0.5, 0], [0, 0.08, 0]));
  const VERM = vermilion("y");
  const VERMH = vermilion("x");
  const DARK = cel("#2b2338");
  const DARKWOOD = cel(grain("#5a3a37", "#472c33", { size: 0.03, axis: "y" }));
  const WOOD = cel(grain("#c48a52", "#a9703f", { size: 0.025, axis: "x" }));
  const WOODV = cel(grain("#c48a52", "#a9703f", { size: 0.025, axis: "y" }));
  const GOLD = cel("#f7c95b", "#c9892d");
  const CREAM = cel("#f6ecd8", "#d8cbe0");
  const STRAW = cel(grain("#e6c874", "#caa550", { size: 0.015, axis: "y" }));
  const MOSS = "#7bb85a";
  const STONE_BASE = mottle("#c3bfd0", "#aaa6bd", { size: 0.15, seed: 3 });
  const STONE = cel(
    paint((p, n) => (n.y > 0.2 && p.y < 1.3 && noise(p, 0.07, 5) > 0.64 ? MOSS : STONE_BASE)),
  );
  const FOXSTONE = cel(mottle("#e3deef", "#cdc7e0", { size: 0.1, seed: 9 }));
  const GRASSP = mottle("#85c764", "#5fa552", { size: 0.18, seed: 2 });
  const COBBLE = scales(["#c4c0d2", "#b2aec6", "#d0cbdc"], "#7b7792", { size: 0.2, width: 0.18, seed: 4 });
  const GROUND = cel(
    paint((p, n) => {
      const r = Math.hypot(p.x, p.z) + 0.22 * (noise(p, 0.45, 8) - 0.5);
      return n.y > 0.5 && r > 1.8 ? GRASSP : COBBLE;
    }),
  );
  const BARK = cel(grain("#6b4a45", "#52353a", { size: 0.03, axis: "y" }));
  const BIB = cel("#d8402c");
  const PINKS = [cel("#ffb3d1"), cel("#ff9fc6"), cel("#ffd0e3")];
  const AMBER = "#ffc866";
  const PURPLE = "#c39bff";
  const EMBER = "#ff8c42";

  const z0 = -0.75; // shrine centre z
  const PX = 0.85; // torii pillar x
  const PZ = 1.05; // torii pillar z

  const roofPaint = cel(
    paint((p) => {
      const dx = Math.abs(p.x);
      const dz = Math.abs(p.z - z0);
      const d = Math.max(dx, dz);
      if (Math.abs(dx - dz) < 0.03 && d > 0.15) return "#f0c458";
      const along = dx > dz ? dz : dx;
      const row = d / 0.07;
      const col = along / 0.09 + (Math.floor(row) % 2) * 0.5;
      const lr = row - Math.floor(row);
      const lc = col - Math.floor(col);
      if (lr < 0.1 || lc < 0.08) return "#2d3166";
      return Math.floor(row + col) % 5 === 0 ? "#5a70c0" : "#4a5ea8";
    }),
  );
  const ropeRW = paint((_p, _n, s) => (Math.floor(s[0] * 60 + s[1] / 90) % 2 === 0 ? "#d8402c" : "#fff4e4"));
  const ropeStraw = paint((_p, _n, s) => (Math.floor(s[0] * 70 + s[1] / 120) % 2 === 0 ? "#e7cf86" : "#c9a553"));
  const SAKE = cel(paint((_p, _n, s) => (s[0] > 0.05 && s[0] < 0.11 ? "#4f6bd6" : "#f6f2ff")));

  // ---------------------------------------------------------------- textures
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 80"><rect x="6" y="3" width="52" height="4" fill="#3a2038"/><rect x="6" y="73" width="52" height="4" fill="#3a2038"/><circle cx="32" cy="40" r="22" fill="none" stroke="#b3202f" stroke-width="4"/><path d="M36 14 L22 44 H32 L26 66 L44 34 H33 Z" fill="#b3202f"/></svg>`,
    { size: 256 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 40 44"><rect x="1.5" y="1.5" width="37" height="41" rx="3" fill="#2a2238" stroke="#f3c050" stroke-width="2"/><circle cx="20" cy="22" r="10" fill="none" stroke="#f3c050" stroke-width="1.6"/><path d="M22 10 L14 24 H20 L17 34 L27 19 H21 Z" fill="#f3c050"/><circle cx="6" cy="6" r="1.6" fill="#f3c050"/><circle cx="34" cy="6" r="1.6" fill="#f3c050"/><circle cx="6" cy="38" r="1.6" fill="#f3c050"/><circle cx="34" cy="38" r="1.6" fill="#f3c050"/></svg>`,
    { size: 256 },
  );
  const LATTICE = svg(
    `<svg viewBox="0 0 32 64"><rect width="32" height="64" fill="#8a2736"/><g stroke="#f1c457" stroke-width="1"><path d="M8 2V62M16 2V62M24 2V62"/><path d="M2 8H30M2 16H30M2 24H30M2 32H30M2 40H30M2 48H30M2 56H30"/></g><rect x="1" y="1" width="30" height="62" fill="none" stroke="#f1c457" stroke-width="1.6"/><polygon points="16,24 24,32 16,40 8,32" fill="#2a2238" stroke="#f1c457" stroke-width="1.2"/><circle cx="16" cy="32" r="2.4" fill="#f1c457"/></svg>`,
    { size: 256 },
  );
  const SHIDE = svg(
    `<svg viewBox="0 0 24 48"><path d="M7 0 L3 12 L11 24 L3 36 L9 48 L19 48 L13 36 L21 24 L13 12 L17 0 Z" fill="#fffaf0"/></svg>`,
    { size: 192 },
  );
  const emaSvg = (kind: number) => {
    let art = "";
    if (kind === 0) {
      art = Array.from({ length: 5 }, (_, i) => {
        const a = i * 1.2566 - 1.5708;
        return `<circle cx="${20 + 8 * Math.cos(a)}" cy="${18 + 8 * Math.sin(a)}" r="6.2" fill="#ff8fb8"/>`;
      }).join("") + `<circle cx="20" cy="18" r="3.4" fill="#fff2a8"/>`;
    } else if (kind === 1) {
      art = `<path d="M24 4 A14 14 0 1 0 24 32 A10 10 0 1 1 24 4 Z" fill="#6f5ad8"/><path d="M31 10 L33 16 L39 16 L34 20 L36 26 L31 22 L26 26 L28 20 L23 16 L29 16 Z" fill="#f3c050"/>`;
    } else {
      art = `<path d="M24 3 L10 20 H19 L14 33 L31 15 H22 Z" fill="#8a3df0" stroke="#fff2a8" stroke-width="1.5"/>`;
    }
    return svg(`<svg viewBox="0 0 40 36">${art}</svg>`, { size: 160 });
  };
  const EMAS = [emaSvg(0), emaSvg(1), emaSvg(2)];
  const PETAL = svg(
    `<svg viewBox="0 0 16 16"><path d="M8 1 C13 3 14 10 8 15 C2 10 3 3 8 1 Z" fill="#ffb8d4"/><path d="M8 2 L8 14" stroke="#ff8fb8" stroke-width="1"/></svg>`,
    { size: 64 },
  );
  const BLOSSOM = svg(
    `<svg viewBox="0 0 32 32">${Array.from({ length: 5 }, (_, i) => {
      const a = i * 1.2566 - 1.5708;
      return `<circle cx="${16 + 8 * Math.cos(a)}" cy="${16 + 8 * Math.sin(a)}" r="7" fill="#ffc0da"/>`;
    }).join("")}<circle cx="16" cy="16" r="3.2" fill="#ff8fb8"/></svg>`,
    { size: 96 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 48"><path d="M3 48 Q5 26 2 6 Q12 24 11 48Z" fill="#5faa4a"/><path d="M10 48 Q12 20 17 2 Q21 22 19 48Z" fill="#7bc65a"/><path d="M18 48 Q22 28 30 12 Q27 32 26 48Z" fill="#4e9a44"/></svg>`,
    { size: 128 },
  );
  const SIGIL = svg(
    `<svg viewBox="0 0 128 128"><g fill="none" stroke="#c9a5ff" stroke-linejoin="round"><circle cx="64" cy="64" r="60" stroke-width="2.5"/><circle cx="64" cy="64" r="52" stroke-width="1.6"/><circle cx="64" cy="64" r="24" stroke-width="2"/><polygon points="64,12 76,52 116,64 76,76 64,116 52,76 12,64 52,52" stroke-width="2.2"/><polygon points="64,30 98,64 64,98 30,64" stroke-width="1.6"/></g><g stroke="#c9a5ff" stroke-width="2" stroke-linecap="round">${Array.from(
      { length: 24 },
      (_, i) => {
        const a = (i * Math.PI) / 12;
        return `<path d="M${64 + 54 * Math.cos(a)} ${64 + 54 * Math.sin(a)} L${64 + 58 * Math.cos(a)} ${64 + 58 * Math.sin(a)}"/>`;
      },
    ).join("")}</g><path d="M68 46 L56 66 H64 L60 82 L74 62 H66 Z" fill="#e6d2ff"/></svg>`,
    { size: 384 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 40 50"><rect x="1" y="1" width="38" height="48" rx="2" fill="#fff6e6" stroke="#6f4f31" stroke-width="1.4"/><rect x="1" y="1" width="38" height="8" fill="#4f6bd6"/><rect x="1" y="41" width="38" height="8" fill="#4f6bd6"/><circle cx="20" cy="25" r="9" fill="#c8323a"/><path d="M22 18 L15 26 H20 L18 33 L26 24 H21 Z" fill="#fff6e6"/></svg>`,
    { size: 160 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 28 110"><rect width="28" height="110" fill="#c8323a"/><rect x="0" y="0" width="28" height="6" fill="#f3c050"/><rect x="0" y="104" width="28" height="6" fill="#f3c050"/><rect x="2" y="8" width="2" height="94" fill="#fff4e4"/><rect x="24" y="8" width="2" height="94" fill="#fff4e4"/><circle cx="14" cy="40" r="9" fill="none" stroke="#fff4e4" stroke-width="2.4"/><path d="M16 29 L9 42 H14 L12 51 L19 38 H14 Z" fill="#fff4e4"/><path d="M14 66 L21 78 L14 90 L7 78 Z" fill="#f3c050"/></svg>`,
    { size: 440 },
  );

  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: Fill,
    x: number,
    y: number,
    z: number,
    o: PartOptions = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], ...o });
  const ball = (r: number, color: Fill, x: number, y: number, z: number, o: PartOptions = {}, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, { at: [x, y, z], ...o });
  const torus = (R: number, r: number, color: Fill, x: number, y: number, z: number, o: PartOptions = {}) =>
    b.part(new THREE.TorusGeometry(R, r, 5, 14), color, { at: [x, y, z], rotation: [90, 0, 0], ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, o: PartOptions = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], texture: tex, ...o });

  // ---------------------------------------------------------------- ground
  b.lathe(
    [
      [0, 0],
      [2.1, 0],
      [2.14, 0.04],
      [2.08, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 32, color: GROUND, name: "ground" },
  );
  for (let i = 0; i < 24; i++) {
    const phi = (i / 24) * Math.PI * 2 + rand() * 0.1;
    const w = 0.2 + rand() * 0.1;
    box(w, 0.12, 0.13, STONE, 2.03 * Math.cos(phi), 0.1, 2.03 * Math.sin(phi), {
      rotation: [0, -phi / RAD - 90, 0],
    });
  }
  // path slabs
  [1.94, 1.7].forEach((z, i) => box(0.52, 0.04, 0.3, STONE, i === 0 ? 0.04 : -0.03, 0.115, z, { rotation: [0, i * 4 - 2, 0] }));
  glow(
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [0, 0.109, 0.95],
      dir: [0, 1, 0],
      axis: "z",
      texture: SIGIL,
    }),
    1.2,
  );

  // ---------------------------------------------------------------- torii
  const kasagiY = (x: number) => 2.7 + 0.14 * (Math.abs(x) / 1.6) ** 2;
  const xs = [-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6];
  for (const s of [1, -1]) {
    const x = s * PX;
    cyl(0.2, 0.22, 0.12, 8, STONE, x, 0.14, PZ);
    b.rod([x, 0.2, PZ], [x, 2.68, PZ], [0.125, 0.095], VERM, { sides: 10, name: "toriiPillar" });
    cyl(0.15, 0.16, 0.22, 10, DARK, x, 0.3, PZ);
    cyl(0.137, 0.137, 0.03, 10, GOLD, x, 0.43, PZ);
    cyl(0.108, 0.108, 0.04, 10, GOLD, x, 2.42, PZ);
    cyl(0.112, 0.112, 0.025, 10, GOLD, x, 1.5, PZ);
    box(0.06, 0.22, 0.12, DARK, s * (PX + 0.14), 2.12, PZ);
    box(0.03, 0.16, 0.16, GOLD, s * 1.17, 2.12, PZ);
  }
  const kasaPts = xs.map((x) => [x, kasagiY(x), PZ]);
  b.sweep(catmull(kasaPts), {
    radius: (): [number, number] => [0.16, 0.06],
    color: VERMH,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    name: "kasagiLower",
  });
  b.sweep(catmull(xs.map((x) => [x, kasagiY(x) + 0.11, PZ])), {
    radius: (): [number, number] => [0.2, 0.045],
    color: DARK,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    name: "kasagiTop",
  });
  b.sweep(catmull(xs.map((x) => [x, kasagiY(x) + 0.065, PZ + 0.205])), {
    radius: (): [number, number] => [0.012, 0.012],
    color: GOLD,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    name: "kasagiTrimF",
  });
  b.sweep(catmull(xs.map((x) => [x, kasagiY(x) + 0.065, PZ - 0.205])), {
    radius: (): [number, number] => [0.012, 0.012],
    color: GOLD,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    name: "kasagiTrimB",
  });
  for (const s of [1, -1]) {
    const slope = Math.atan((2 * 0.14 * (1.6 / 1.6)) / 1.6);
    box(0.04, 0.2, 0.36, GOLD, s * 1.62, kasagiY(1.6) + 0.07, PZ, { rotation: [0, 0, s * slope / RAD] });
  }
  b.frustumBox([-1.15, 2.12, PZ], [1.15, 2.12, PZ], [0.14, 0.14], [0.14, 0.14], {
    color: VERMH,
    up: [0, 1, 0],
    name: "nuki",
  });
  box(0.4, 0.44, 0.1, DARK, 0, 2.43, PZ);
  plane(0.38, 0.42, PLAQUE, 0, 2.43, PZ + 0.052);
  plane(0.38, 0.42, PLAQUE, 0, 2.43, PZ - 0.052, { rotation: [0, 180, 0] });
  box(0.05, 0.44, 0.12, GOLD, -0.215, 2.43, PZ);
  box(0.05, 0.44, 0.12, GOLD, 0.215, 2.43, PZ);

  // shimenawa rope with shide and tassels
  const ropeZ = PZ + 0.12;
  const ropePath = catmull([
    [-0.8, 2.04, ropeZ],
    [-0.4, 1.96, ropeZ + 0.01],
    [0, 1.93, ropeZ + 0.01],
    [0.4, 1.96, ropeZ + 0.01],
    [0.8, 2.04, ropeZ],
  ]);
  b.sweep(ropePath, 0.032, ropeStraw, { sides: 6, name: "shimenawa" });
  b.cards(
    [0.12, 0.26, 0.4, 0.5, 0.6, 0.74, 0.88].map((t) => frame(ropePath.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.055, 0.2], lean: 180, flow: [0, 0, 1], name: "shide" },
  );
  for (const s of [1, -1]) {
    ball(0.045, GOLD, s * 0.82, 2.03, ropeZ, {}, 6, 5);
    b.spike([s * 0.82, 2.0, ropeZ], [0, -1, 0], 0.16, 0.03, GOLD);
    torus(0.115, 0.016, STRAW, s * PX, 2.03, PZ, { rotation: [90, 0, 0] });
  }

  // hanging paper lanterns
  for (const s of [1, -1]) {
    const x = s * 0.42;
    b.rod([x, 2.06, PZ], [x, 1.89, PZ], 0.008, DARK);
    cyl(0.06, 0.08, 0.04, 8, DARK, x, 1.87, PZ);
    const lamp = b.lathe(
      [
        [0, -0.16],
        [0.07, -0.155],
        [0.13, -0.1],
        [0.155, -0.03],
        [0.155, 0.03],
        [0.13, 0.1],
        [0.07, 0.155],
        [0, 0.16],
      ],
      { at: [x, 1.7, PZ], segments: 10, color: AMBER, name: "chochin" },
    );
    glow(lamp, 1.3);
    for (const [dy, R] of [
      [0, 0.16],
      [0.08, 0.14],
      [-0.08, 0.14],
    ])
      torus(R, 0.006, "#b5342f", x, 1.7 + dy, PZ);
    cyl(0.075, 0.06, 0.04, 8, DARK, x, 1.525, PZ);
    b.spike([x, 1.505, PZ], [0, -1, 0], 0.15, 0.022, GOLD);
    for (const f of [1, -1]) {
      glow(b.decal(lamp, EMBLEM, { at: [x, 1.7, PZ + f * 0.17], dir: [0, 0, f], size: [0.13, 0.17] }), 1.1);
    }
  }

  // ---------------------------------------------------------------- shrine (hokora)
  box(1.4, 0.1, 1.1, STONE, 0, 0.15, z0);
  box(1.28, 0.12, 0.98, STONE, 0, 0.26, z0);
  box(0.95, 0.1, 0.26, STONE, 0, 0.15, -0.08);
  box(0.8, 0.1, 0.2, STONE, 0, 0.25, -0.2);
  box(1.2, 0.04, 0.9, WOOD, 0, 0.34, z0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([sx * 0.52, 0.36, z0 + sz * 0.38], [sx * 0.52, 1.06, z0 + sz * 0.38], 0.042, VERM, { sides: 8, name: "hokoraPost" });
      ball(0.05, GOLD, sx * 0.52, 0.4, z0 + sz * 0.38, {}, 6, 4);
    }
  box(1.0, 0.66, 0.03, CREAM, 0, 0.71, z0 - 0.38);
  for (const s of [1, -1]) box(0.03, 0.66, 0.72, CREAM, s * 0.52, 0.71, z0);
  for (const dz of [0.38, -0.38]) {
    box(1.12, 0.06, 0.06, VERMH, 0, 1.03, z0 + dz);
    box(1.0, 0.04, 0.04, VERMH, 0, 0.42, z0 + dz);
  }
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.76, VERMH, s * 0.52, 1.03, z0);
    box(0.04, 0.05, 0.76, GOLD, s * 0.525, 0.58, z0);
  }
  // interior altar and electro crystal
  box(0.22, 0.14, 0.22, GOLD, 0, 0.43, z0 - 0.05);
  glow(
    b.part(new THREE.OctahedronGeometry(0.1, 0), PURPLE, {
      at: [0, 0.74, z0 - 0.05],
      scale: [0.8, 1.35, 0.8],
      flat: true,
      name: "shrineCrystal",
    }),
    1.6,
  );
  torus(0.15, 0.01, GOLD, 0, 0.74, z0 - 0.05, { rotation: [72, 0, 0] });
  torus(0.18, 0.008, GOLD, 0, 0.74, z0 - 0.05, { rotation: [105, 20, 0] });
  // doors
  const zf = z0 + 0.38;
  const DOOR = cel("#7a2230");
  for (const s of [1, -1]) {
    const th = s * 55 * RAD;
    const cx = s * 0.5 - s * 0.115 * Math.cos(th);
    const cz = zf + 0.115 * Math.abs(Math.sin(th));
    box(0.23, 0.6, 0.025, DOOR, cx, 0.7, cz, { rotation: [0, s * 55, 0] });
    plane(0.22, 0.58, LATTICE, cx + 0.0145 * Math.sin(th), 0.7, cz + 0.0145 * Math.cos(th), {
      rotation: [0, s * 55, 0],
    });
    const lx = -s * 0.1;
    const lz = 0.027;
    ball(
      0.014,
      GOLD,
      cx + lx * Math.cos(th) + lz * Math.sin(th),
      0.7,
      cz - lx * Math.sin(th) + lz * Math.cos(th),
      {},
      6,
      4,
    );
  }
  // roof
  b.lathe(
    [
      [0, 1.66],
      [0.06, 1.62],
      [0.25, 1.45],
      [0.5, 1.28],
      [0.8, 1.17],
      [1.05, 1.16],
      [1.05, 1.1],
      [0.8, 1.09],
      [0.5, 1.2],
      [0.25, 1.38],
      [0.06, 1.55],
      [0, 1.58],
    ],
    { at: [0, 0, z0], segments: 4, spin: 45, color: roofPaint, name: "hokoraRoof" },
  );
  box(1.5, 0.08, 0.03, GOLD, 0, 1.13, z0 + 0.745);
  box(1.5, 0.08, 0.03, GOLD, 0, 1.13, z0 - 0.745);
  box(0.03, 0.08, 1.5, GOLD, 0.745, 1.13, z0);
  box(0.03, 0.08, 1.5, GOLD, -0.745, 1.13, z0);
  ball(0.05, GOLD, 0, 1.67, z0, {}, 8, 6);
  b.spike([0, 1.69, z0], [0, 1, 0], 0.17, 0.016, GOLD);
  torus(0.07, 0.012, GOLD, 0, 1.62, z0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const cx = sx * 0.74;
      const cz = z0 + sz * 0.74;
      b.spike([cx, 1.14, cz], [sx * 0.5, 0.6, sz * 0.5], 0.11, 0.032, GOLD);
      b.rod([sx * 0.7, 1.1, z0 + sz * 0.7], [sx * 0.7, 1.0, z0 + sz * 0.7], 0.004, DARK);
      cyl(0.015, 0.04, 0.06, 8, GOLD, sx * 0.7, 0.97, z0 + sz * 0.7);
      ball(0.012, GOLD, sx * 0.7, 0.935, z0 + sz * 0.7, {}, 5, 4);
    }
  // suzu bell and rope
  b.rod([0, 1.1, -0.08], [0, 1.0, -0.08], 0.006, DARK);
  ball(0.065, GOLD, 0, 0.94, -0.08, {}, 8, 6);
  box(0.09, 0.01, 0.01, DARK, 0, 0.935, -0.016);
  torus(0.02, 0.006, GOLD, 0, 1.01, -0.08, { rotation: [0, 0, 0] });
  b.sweep(
    catmull([
      [0, 0.88, -0.1],
      [0.015, 0.78, -0.09],
      [-0.015, 0.68, -0.1],
      [0, 0.58, -0.1],
    ]),
    0.022,
    ropeRW,
    { sides: 6, name: "bellRope" },
  );
  ball(0.03, BIB, 0, 0.56, -0.1, {}, 6, 5);
  b.spike([0, 0.55, -0.1], [0, -1, 0], 0.1, 0.022, BIB);

  // saisen (offering box)
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.1, 0.05, DARKWOOD, sx * 0.37, 0.15, 0.2 + sz * 0.17);
  box(0.82, 0.2, 0.4, WOOD, 0, 0.3, 0.2);
  box(0.78, 0.01, 0.36, DARK, 0, 0.405, 0.2);
  for (const dz of [0.205, -0.205]) box(0.86, 0.04, 0.03, VERMH, 0, 0.41, 0.2 + dz);
  for (const sx of [0.415, -0.415]) box(0.03, 0.04, 0.4, VERM, sx, 0.41, 0.2);
  for (let i = 0; i < 7; i++) box(0.03, 0.025, 0.37, DARKWOOD, -0.33 + i * 0.11, 0.42, 0.2);
  for (let i = 0; i < 6; i++)
    cyl(0.02, 0.02, 0.004, 10, GOLD, -0.3 + rand() * 0.6, 0.4345, 0.1 + rand() * 0.2);
  box(0.24, 0.12, 0.012, GOLD, 0, 0.3, 0.4);
  plane(0.1, 0.12, EMBLEM, 0, 0.3, 0.4065);

  // ---------------------------------------------------------------- stone lanterns
  const toro = (x: number, z: number) => {
    const y0 = 0.1;
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.2, 0.04],
        [0.14, 0.09],
        [0, 0.09],
      ],
      { at: [x, y0, z], segments: 6, color: STONE, name: "toroFoot" },
    );
    cyl(0.055, 0.065, 0.4, 8, STONE, x, y0 + 0.29, z);
    ball(0.085, STONE, x, y0 + 0.29, z, { flat: true }, 6, 5);
    b.lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.2, 0.04],
        [0.2, 0.07],
        [0, 0.07],
      ],
      { at: [x, y0 + 0.49, z], segments: 6, color: STONE, name: "toroDeck" },
    );
    glow(box(0.11, 0.14, 0.11, AMBER, x, y0 + 0.67, z), 1.4);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.035, 0.22, 0.035, STONE, x + sx * 0.08, y0 + 0.67, z + sz * 0.08);
    for (const sz of [1, -1]) {
      box(0.15, 0.2, 0.016, STONE, x, y0 + 0.67, z + sz * 0.08);
      glow(
        b.part(new THREE.CircleGeometry(0.045, 10), AMBER, {
          at: [x, y0 + 0.67, z + sz * 0.0885],
          rotation: [0, sz > 0 ? 0 : 180, 0],
        }),
        1.3,
      );
    }
    box(0.22, 0.03, 0.22, STONE, x, y0 + 0.795, z);
    b.lathe(
      [
        [0, 0.2],
        [0.06, 0.185],
        [0.14, 0.13],
        [0.24, 0.07],
        [0.33, 0.04],
        [0.33, 0],
        [0, 0],
      ],
      { at: [x, y0 + 0.81, z], segments: 6, color: STONE, name: "toroRoof" },
    );
    ball(0.04, STONE, x, y0 + 1.03, z, { flat: true }, 6, 5);
    b.spike([x, y0 + 1.05, z], [0, 1, 0], 0.1, 0.02, STONE);
  };
  toro(1.05, 0.55);
  toro(-1.05, 0.55);

  // ---------------------------------------------------------------- fox guardians
  for (const s of [1, -1]) {
    const X = s * 0.78;
    const yb = 0.34;
    box(0.26, 0.2, 0.3, STONE, X, 0.2, 0);
    box(0.3, 0.04, 0.34, STONE, X, 0.32, 0);
    ball(1, FOXSTONE, X, yb + 0.15, -0.01, { scale: [0.095, 0.16, 0.1] });
    ball(1, FOXSTONE, X, yb + 0.08, -0.03, { scale: [0.13, 0.085, 0.14] });
    for (const e of [1, -1]) {
      box(0.032, 0.2, 0.04, FOXSTONE, X + e * 0.045, yb + 0.1, 0.075);
      box(0.04, 0.02, 0.07, FOXSTONE, X + e * 0.045, yb + 0.01, 0.095);
      b.part(new THREE.ConeGeometry(0.032, 0.1, 5), FOXSTONE, {
        at: [X + e * 0.05, yb + 0.47, -0.005],
        dir: [e * 0.25, 1, -0.15],
      });
      b.part(new THREE.ConeGeometry(0.018, 0.07, 4), cel("#e8a3c0"), {
        at: [X + e * 0.05, yb + 0.465, 0.008],
        dir: [e * 0.25, 1, -0.15],
      });
      ball(0.011, INK, X + e * 0.034, yb + 0.395, 0.096, { scale: [1, 1.2, 0.5] }, 6, 4);
    }
    ball(1, FOXSTONE, X, yb + 0.38, 0.025, { scale: [0.08, 0.07, 0.085] });
    b.part(new THREE.ConeGeometry(0.032, 0.11, 6), FOXSTONE, { at: [X, yb + 0.365, 0.1], dir: [0, -0.25, 1] });
    ball(0.013, INK, X, yb + 0.352, 0.153, {}, 5, 4);
    torus(0.085, 0.016, BIB, X, yb + 0.31, 0.0);
    ball(0.02, GOLD, X, yb + 0.28, 0.09, {}, 6, 5);
    b.sweep(
      catmull([
        [X, yb + 0.06, -0.1],
        [X, yb + 0.03, -0.2],
        [X + s * 0.04, yb + 0.15, -0.24],
        [X + s * 0.05, yb + 0.34, -0.18],
      ]),
      [0.03, 0.05, 0.055, 0.0],
      FOXSTONE,
      { caps: { start: "flat", end: "point" }, sides: 7, name: "foxTail" },
    );
    if (s === 1) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.03, 0), PURPLE, { at: [X - 0.045, yb + 0.055, 0.125], flat: true }),
        1.5,
      );
    } else {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), "#f1e3c0", {
        at: [X + 0.045, yb + 0.04, 0.13],
        rotation: [0, 0, 90],
      });
      ball(0.02, BIB, X + 0.095, yb + 0.04, 0.13, {}, 5, 4);
      ball(0.02, BIB, X - 0.005, yb + 0.04, 0.13, {}, 5, 4);
    }
  }

  // ---------------------------------------------------------------- offering table (left of shrine, +x is model left)
  const tx = -1.2;
  const tz = -0.6;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.04, 0.28, 0.04, DARKWOOD, tx + sx * 0.3, 0.24, tz + sz * 0.17);
  box(0.7, 0.04, 0.45, WOOD, tx, 0.4, tz);
  box(0.5, 0.005, 0.46, CREAM, tx, 0.4225, tz);
  box(0.74, 0.03, 0.05, VERM, tx, 0.37, tz + 0.2);
  for (const [bx, bz] of [
    [-1.38, -0.7],
    [-1.3, -0.72],
  ]) {
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.05, 0.03],
        [0.05, 0.1],
        [0.03, 0.14],
        [0.02, 0.2],
        [0.025, 0.22],
        [0, 0.22],
      ],
      { at: [bx, 0.425, bz], segments: 8, color: SAKE, name: "tokkuri" },
    );
    torus(0.028, 0.006, "#a87cf0", bx, 0.425 + 0.17, bz);
  }
  for (const [cx, cz] of [
    [-1.12, -0.5],
    [-1.04, -0.52],
  ])
    b.lathe(
      [
        [0, 0],
        [0.02, 0],
        [0.036, 0.04],
        [0.036, 0.043],
        [0.03, 0.043],
        [0, 0.012],
      ],
      { at: [cx, 0.425, cz], segments: 8, color: cel("#c9302c"), name: "cup" },
    );
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.07, 0.05],
      [0.07, 0.055],
      [0.062, 0.055],
      [0, 0.03],
    ],
    { at: [-1.0, 0.425, -0.7], segments: 10, color: cel("#3e5fb8"), name: "riceBowl" },
  );
  b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cel("#fffaf0"), {
    at: [-1.0, 0.465, -0.7],
    flat: true,
  });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.13, 0.03],
      [0.13, 0.035],
      [0.115, 0.035],
      [0, 0.012],
    ],
    { at: [-1.2, 0.425, -0.47], segments: 10, color: VERM, name: "tray" },
  );
  [
    [-1.24, -0.47],
    [-1.16, -0.49],
    [-1.19, -0.43],
  ].forEach(([fx, fz]) => {
    ball(0.032, cel("#ff9a2e"), fx, 0.47, fz, { flat: true }, 7, 5);
    b.spike([fx, 0.498, fz], [0, 1, 0], 0.02, 0.012, cel("#4f9a44"));
  });
  cyl(0.03, 0.035, 0.04, 8, WOOD, -1.42, 0.44, -0.5);
  b.rod([-1.42, 0.45, -0.5], [-1.42, 0.64, -0.5], 0.004, WOOD);
  [
    [0.5, "#ffb5d0"],
    [0.555, "#fff7ee"],
    [0.61, "#a8d98a"],
  ].forEach(([y, c]) => ball(0.026, cel(c as string), -1.42, y as number, -0.5, {}, 7, 5));
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.06, 0.03],
      [0.065, 0.05],
      [0.055, 0.05],
      [0, 0.035],
    ],
    { at: [-1.2, 0.425, -0.74], segments: 10, color: cel("#3d6f86"), name: "incenseBowl" },
  );
  for (const [dx, dz] of [
    [-0.015, 0],
    [0.005, 0.01],
    [0.02, -0.005],
  ]) {
    b.rod([-1.2 + dx, 0.455, -0.74 + dz], [-1.2 + dx * 2.5, 0.6, -0.74 + dz * 2.5], 0.003, cel("#a24b2a"));
    glow(ball(0.007, EMBER, -1.2 + dx * 2.5, 0.603, -0.74 + dz * 2.5, {}, 4, 3), 1.5);
  }

  // ---------------------------------------------------------------- sake barrels
  const barrel = (x: number, y: number, z: number, k: number) => {
    const part = b.lathe(
      [
        [0, 0],
        [0.16 * k, 0],
        [0.19 * k, 0.08 * k],
        [0.2 * k, 0.2 * k],
        [0.19 * k, 0.32 * k],
        [0.16 * k, 0.4 * k],
        [0, 0.4 * k],
      ],
      { at: [x, y, z], segments: 10, color: STRAW, name: "barrel" },
    );
    for (const h of [0.1, 0.3]) torus(0.197 * k, 0.012 * k, "#6f4f31", x, y + h * k, z);
    cyl(0.15 * k, 0.15 * k, 0.012, 10, WOOD, x, y + 0.4 * k, z);
    b.decal(part, LABEL, { at: [x, y + 0.2 * k, z + 0.2 * k], dir: [0, 0, 1], size: [0.15 * k, 0.19 * k] });
  };
  barrel(1.2, 0.1, -0.7, 1);
  barrel(1.2, 0.5, -0.7, 0.8);
  barrel(1.5, 0.1, -0.4, 0.9);
  cyl(0.02, 0.02, 0.3, 6, WOOD, 1.45, 0.64, -0.38, { rotation: [0, 0, 70] });

  // ---------------------------------------------------------------- ema rack
  const ex = -1.5;
  const ez = 0.6;
  for (const px of [-1.2, -1.8]) {
    b.rod([px, 0.1, ez], [px, 1.6, ez], 0.04, VERM, { sides: 8, name: "emaPost" });
    box(0.14, 0.1, 0.14, STONE, px, 0.14, ez);
    ball(0.045, GOLD, px, 1.62, ez, {}, 6, 4);
  }
  box(0.68, 0.06, 0.07, VERMH, ex, 1.48, ez);
  box(0.62, 0.04, 0.05, VERMH, ex, 1.05, ez);
  box(0.82, 0.025, 0.22, DARK, ex, 1.64, ez + 0.095, { rotation: [25, 0, 0] });
  box(0.82, 0.025, 0.22, DARK, ex, 1.64, ez - 0.095, { rotation: [-25, 0, 0] });
  b.rod([ex - 0.43, 1.715, ez], [ex + 0.43, 1.715, ez], 0.02, GOLD);
  const emaOutline: Array<[number, number]> = [
    [-0.065, -0.06],
    [0.065, -0.06],
    [0.065, 0.04],
    [0, 0.085],
    [-0.065, 0.04],
  ];
  const EMAWOOD = cel("#dba96d");
  [
    [-1.66, 1.35, 6, 0],
    [-1.5, 1.35, -5, 1],
    [-1.34, 1.35, 4, 2],
    [-1.58, 0.93, -4, 1],
    [-1.42, 0.93, 5, 0],
  ].forEach(([px, py, yaw, kind]) => {
    const a = yaw * RAD;
    const cz = ez + 0.07;
    b.extrude(emaOutline, {
      at: [px, py, cz],
      x: [Math.cos(a), 0, -Math.sin(a)],
      thickness: 0.012,
      bevel: 0.002,
      color: EMAWOOD,
      name: "ema",
    });
    plane(0.1, 0.09, EMAS[kind], px + 0.0075 * Math.sin(a), py - 0.005, cz + 0.0075 * Math.cos(a), {
      rotation: [0, yaw, 0],
    });
    b.rod([px, py + 0.085, cz], [px, py + 0.13 > 1.45 ? 1.46 : 1.04, ez + 0.06], 0.004, INK);
  });

  // ---------------------------------------------------------------- banners
  for (const s of [1, -1]) {
    const x = s * 1.35;
    const bz = 1.2;
    cyl(0.08, 0.1, 0.14, 8, STONE, x, 0.17, bz);
    b.rod([x, 0.2, bz], [x, 2.2, bz], 0.02, DARKWOOD, { sides: 6 });
    ball(0.04, GOLD, x, 2.22, bz, {}, 6, 5);
    b.rod([x, 2.12, bz], [x - s * 0.32, 2.12, bz], 0.012, DARKWOOD, { sides: 5 });
    const bx = x - s * 0.17;
    box(0.28, 1.1, 0.012, cel("#c8323a"), bx, 1.57, bz);
    plane(0.28, 1.1, BANNER, bx, 1.57, bz + 0.0075);
    plane(0.28, 1.1, BANNER, bx, 1.57, bz - 0.0075, { rotation: [0, 180, 0] });
  }

  // ---------------------------------------------------------------- sakura tree
  b.sweep(
    catmull([
      [-1.4, 0.05, -1.1],
      [-1.42, 0.7, -1.08],
      [-1.3, 1.4, -1.05],
      [-1.2, 2.0, -1.0],
    ]),
    [0.18, 0.12, 0.07],
    BARK,
    { sides: 7, name: "trunk" },
  );
  for (const [a, c] of [
    [
      [-1.3, 1.5, -1.05],
      [-0.7, 2.1, -0.9],
    ],
    [
      [-1.35, 1.55, -1.05],
      [-1.75, 2.2, -1.0],
    ],
    [
      [-1.25, 1.8, -1.02],
      [-1.15, 2.3, -0.55],
    ],
    [
      [-1.25, 1.85, -1.02],
      [-1.15, 2.3, -1.5],
    ],
  ])
    b.rod(a, c, [0.05, 0.02], BARK, { sides: 6 });
  const blobs = [
    [-1.1, 2.55, -0.95, 0.62],
    [-0.6, 2.35, -0.9, 0.42],
    [-1.6, 2.35, -1.0, 0.45],
    [-1.15, 2.3, -0.45, 0.4],
    [-1.1, 2.4, -1.45, 0.42],
    [-0.85, 2.95, -1.1, 0.38],
    [-1.45, 2.9, -0.8, 0.36],
    [-0.55, 2.7, -1.25, 0.32],
  ].map(([x, y, z, r], i) => ball(r, PINKS[i % 3], x, y, z, { flat: true }, 8, 6));
  const bloomHits = b.surface(blobs).scatter(200, { rng: rand, minDist: 0.1, filter: (h) => h.n.y > -0.2 });
  b.cards(bloomHits, BLOSSOM, { size: [0.15, 0.15], vary: 0.25, spin: 180, rng: rand, name: "blossoms" });
  for (const [lx, ly, lz] of [
    [-0.7, 1.82, -0.9],
    [-1.75, 1.95, -1.0],
  ]) {
    b.rod([lx, ly + 0.28, lz], [lx, ly + 0.08, lz], 0.005, DARK);
    glow(ball(1, AMBER, lx, ly, lz, { scale: [0.065, 0.085, 0.065] }, 8, 6), 1.3);
    cyl(0.03, 0.035, 0.02, 6, DARK, lx, ly + 0.085, lz);
    b.spike([lx, ly - 0.08, lz], [0, -1, 0], 0.07, 0.015, GOLD);
  }

  // ---------------------------------------------------------------- petals, grass, motes
  const groundPetals: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.15 + rand() * 1.3;
    const x = -1.3 + r * Math.cos(a);
    const z = -0.9 + r * Math.sin(a) * 1.4;
    if (Math.hypot(x, z) < 1.95) groundPetals.push(frame([x, 0.104, z], [0, 1, 0]));
  }
  b.cards(groundPetals, PETAL, {
    size: 0.07,
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(i * 2.39), 0, Math.sin(i * 2.39)],
    name: "groundPetals",
  });
  const airPetals = Array.from({ length: 18 }, () =>
    frame([-1.8 + rand() * 3, 0.5 + rand() * 1.8, -1 + rand() * 2.2], [0, 1, 0]),
  );
  b.cards(airPetals, PETAL, {
    size: 0.07,
    lean: 60,
    spin: 180,
    rng: rand,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    name: "airPetals",
  });
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.65 + rand() * 0.38;
    tufts.push(frame([r * Math.cos(a), 0.1, r * Math.sin(a)], [0, 1, 0]));
  }
  for (const [x, z] of [
    [1.2, 0.5],
    [0.9, 0.62],
    [-0.9, 0.62],
    [-1.2, 0.5],
    [1.0, 0.2],
    [-1.0, 0.2],
    [-1.8, 0.7],
    [-1.2, 0.7],
    [1.5, 1.2],
    [1.2, 1.3],
    [-1.5, 1.2],
  ])
    tufts.push(frame([x, 0.1, z], [0, 1, 0]));
  b.cards(tufts, GRASS, { size: [0.11, 0.17], cross: true, vary: 0.35, spin: 180, rng: rand, name: "grass" });
  for (let i = 0; i < 10; i++) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + rand() * 0.012, 0), "#d9bcff", {
        at: [-0.8 + rand() * 1.6, 0.5 + rand() * 1.4, -1.1 + rand() * 1.0],
        flat: true,
      }),
      1.4,
    );
  }

  return b.root;
}
