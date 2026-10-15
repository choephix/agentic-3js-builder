import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { grain, mottle, patches, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "A roadside shrine with a vermilion torii, stone and paper lanterns, fox guardians, offering table, ema rack and a blossoming tree, in cel-shaded Genshin-style with glowing elemental accents.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lanternShrine" });
  const rand = rng(11);

  // ---------- palette ----------
  const RED = cel(grain("#e0412c", "#c92f2a", { size: 0.04, axis: "y" }));
  const REDF = "#d9382b";
  const BLACK = cel("#2d2733");
  const GOLD = "#f2c14e";
  const GOLD2 = "#c98f2a";
  const STONE = cel(mottle("#c4beaf", "#a3a898", { size: 0.14, seed: 3 }));
  const STONEDK = cel(mottle("#8d8f86", "#74786f", { size: 0.1, seed: 5 }));
  const MOSS = cel(mottle("#7fcf6a", "#5aa856", { size: 0.35, seed: 9 }));
  const PATH = cel(patches("#b8b2a2", "#d9d3c3", { size: 0.25, gap: 0.03, seed: 4 }));
  const WOOD = cel(grain("#e9c58c", "#d3a56a", { size: 0.03, axis: "x" }));
  const WOODDK = cel(grain("#9a6538", "#80502e", { size: 0.03, axis: "x" }));
  const CREAM = cel("#f7ecd0");
  const TILE = cel(scales("#3f93a6", "#2a6a86", { size: 0.08, seed: 2 }));
  const STRAW = cel(grain("#e8d28a", "#caa957", { size: 0.015, axis: "x" }));
  const PINK = cel(mottle("#ffb7d0", "#ff93b8", { size: 0.25, seed: 6 }));
  const LEAF = cel(mottle("#6fd06a", "#49b05a", { size: 0.2, seed: 8 }));
  const BARK = cel(grain("#7a5440", "#5f4033", { size: 0.04, axis: "y" }));
  const PAPER = "#fffaf0";
  const WARM = "#ffb347";
  const TEAL = "#3fe0d0";
  const VIOLET = "#b48cff";
  const ORANGE = "#ff9a2e";
  const SAKE = "#7fd0e8";
  const DARK = INK;

  // ---------- textures ----------
  const LATTICE = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="64" fill="#6b2a2a"/>
    <rect x="1" y="1" width="30" height="62" fill="none" stroke="#f2c14e" stroke-width="1.6"/>
    <path d="M16 2V62M2 16H30M2 32H30M2 48H30M8 2V62M24 2V62" stroke="#f2c14e" stroke-width="1.2"/>
    <path d="M16 20L24 32L16 44L8 32Z" fill="none" stroke="#fff0b0" stroke-width="1.2"/></svg>`,
    { size: 192 },
  );
  const EMA = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 3L36 12V36H4V12Z" fill="#f3d9a2" stroke="#8a5530" stroke-width="2"/>
    <circle cx="20" cy="23" r="9" fill="none" stroke="#3fb0c8" stroke-width="2.4"/>
    <path d="M12 23C16 14 26 16 26 22C26 27 19 27 19 23" fill="none" stroke="#e0412c" stroke-width="2.4"/>
    <circle cx="20" cy="9" r="1.6" fill="#8a5530"/></svg>`,
    { size: 160 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="24" rx="2" fill="#f2c14e"/>
    <rect x="2" y="2" width="36" height="20" rx="1" fill="#2d2733"/>
    <path d="M8 8H32M8 12H32M8 16H32M20 6V19M13 6V19M27 6V19" stroke="#f2c14e" stroke-width="1.4" fill="none"/></svg>`,
    { size: 160 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#ffb347"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="#fff3c4" stroke-width="2"/>
    <path d="M16 6V26M6 16H26" stroke="#fff3c4" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot });
  const ball = (r: number, c: any, at: number[], scale?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at, scale });

  // ---------- ground and path ----------
  b.part(new THREE.CylinderGeometry(3.1, 3.2, 0.1, 18), MOSS, { at: [0, 0.05, 0.5], scale: [1.05, 1, 1.15] });
  for (let i = 0; i < 6; i++) {
    const z = 3.0 - i * 0.62;
    box(0.78, 0.04, 0.5, PATH, [(rand() - 0.5) * 0.08, 0.12, z], [0, (rand() - 0.5) * 8, 0]);
  }
  // rim stones around the ground
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ball(0.12 + rand() * 0.05, STONEDK, [Math.sin(a) * 3.3, 0.06, 0.5 + Math.cos(a) * 3.85], [1.3, 0.55, 1]);
  }

  // ---------- torii ----------
  const TZ = 1.9;
  for (const s of [1, -1]) {
    cyl(0.2, 0.22, 0.22, 8, BLACK, [s * 1.15, 0.2, TZ]);
    b.part(new THREE.CylinderGeometry(0.105, 0.135, 3.0, 10), RED, { at: [s * 1.15, 1.6, TZ] });
    cyl(0.14, 0.14, 0.1, 10, BLACK, [s * 1.15, 0.5, TZ]);
    cyl(0.118, 0.118, 0.07, 10, GOLD, [s * 1.15, 2.78, TZ]);
    // tapering inward lean cap on top
    cyl(0.13, 0.13, 0.05, 10, BLACK, [s * 1.15, 2.92, TZ]);
  }
  box(3.1, 0.15, 0.11, RED, [0, 2.3, TZ]);
  for (const s of [1, -1]) box(0.14, 0.2, 0.15, GOLD, [s * 1.5, 2.3, TZ]);
  box(0.13, 0.45, 0.1, RED, [0, 2.6, TZ]);
  b.part(new THREE.PlaneGeometry(0.34, 0.2), "#ffffff", { at: [0, 2.6, TZ + 0.056], texture: PLAQUE });
  box(3.5, 0.12, 0.28, BLACK, [0, 2.98, TZ]);
  b.extrude(
    [
      [-2.1, 0.2],
      [-1.7, 0.0],
      [0, -0.02],
      [1.7, 0.0],
      [2.1, 0.2],
      [2.1, 0.3],
      [1.7, 0.2],
      [0, 0.17],
      [-1.7, 0.2],
      [-2.1, 0.3],
    ],
    { at: [0, 3.02, TZ], x: [1, 0, 0], thickness: 0.36, bevel: 0.015, color: BLACK },
  );
  for (const s of [1, -1]) {
    box(0.06, 0.1, 0.38, GOLD, [s * 2.1, 3.3, TZ], [0, 0, s * -24]);
    ball(0.03, GOLD, [s * 1.2, 3.12, TZ + 0.18]);
  }
  box(3.9, 0.025, 0.1, GOLD, [0, 3.2, TZ + 0.17], [0, 0, 0]).mesh.visible = false;

  // shimenawa rope and shide
  const ropePts = [
    [-1.12, 2.15, TZ + 0.03],
    [-0.6, 2.08, TZ + 0.03],
    [0, 2.03, TZ + 0.03],
    [0.6, 2.08, TZ + 0.03],
    [1.12, 2.15, TZ + 0.03],
  ];
  const rope = catmull(ropePts);
  b.sweep(rope, 0.045, STRAW, { sides: 6 });
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 1.12, 2.15, TZ + 0.03],
        [s * 1.2, 2.0, TZ + 0.03],
      ],
      [0.05, 0.02],
      STRAW,
      { sides: 6 },
    );
  }
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const p = rope.at(t);
    for (let k = 0; k < 3; k++) {
      box(0.1, 0.1, 0.012, PAPER, [p.x + (k % 2 ? 0.015 : -0.015), p.y - 0.1 - k * 0.1, p.z + 0.03], [0, 0, k % 2 ? 14 : -14]);
    }
    cyl(0.01, 0.01, 0.06, 5, STRAW, [p.x, p.y - 0.04, p.z + 0.03]);
  }

  // hanging paper lanterns under the nuki
  for (const s of [1, -1]) {
    const x = s * 0.62;
    b.rod([x, 2.23, TZ], [x, 1.98, TZ], 0.012, DARK, { sides: 4 });
    cyl(0.07, 0.09, 0.05, 8, DARK, [x, 1.95, TZ]);
    glow(ball(0.19, WARM, [x, 1.72, TZ], [1, 1.2, 1]), 1.3);
    for (const dy of [-0.15, 0, 0.15]) {
      const k = 1 - Math.pow(dy / 0.23, 2) * 0.3;
      b.part(new THREE.TorusGeometry(0.19 * k, 0.008, 4, 12), DARK, {
        at: [x, 1.72 + dy, TZ],
        rotation: [90, 0, 0],
      });
    }
    cyl(0.08, 0.06, 0.04, 8, DARK, [x, 1.5, TZ]);
    b.rod([x, 1.49, TZ], [x, 1.35, TZ], 0.01, GOLD, { sides: 4 });
    b.spike([x, 1.38, TZ], [0, -1, 0], 0.14, 0.03, REDF, { sides: 5 });
    glow(b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { at: [x, 1.72, TZ + 0.2], texture: RUNE }), 1);
  }

  // ---------- shrine ----------
  const SZ = -1.3;
  box(1.7, 0.3, 1.4, STONE, [0, 0.25, SZ]);
  box(1.76, 0.05, 1.46, STONEDK, [0, 0.4, SZ]);
  box(1.5, 0.05, 1.2, WOOD, [0, 0.45, SZ]);
  // steps
  box(1.0, 0.12, 0.34, STONE, [0, 0.16, SZ + 0.88]);
  box(0.92, 0.22, 0.24, STONE, [0, 0.21, SZ + 0.76]);
  // body walls and posts
  box(1.1, 0.95, 0.9, CREAM, [0, 0.975, SZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      cyl(0.055, 0.06, 1.0, 8, RED, [sx * 0.57, 0.975, SZ + sz * 0.47]);
      cyl(0.075, 0.075, 0.04, 8, GOLD, [sx * 0.57, 1.47, SZ + sz * 0.47]);
    }
  box(1.22, 0.07, 0.07, RED, [0, 1.38, SZ + 0.47]);
  box(1.22, 0.07, 0.07, RED, [0, 0.58, SZ + 0.47]);
  for (const sx of [1, -1]) box(0.07, 0.07, 0.95, RED, [sx * 0.57, 1.38, SZ]);
  // doors
  for (const sx of [1, -1]) {
    box(0.46, 0.76, 0.03, "#6b2a2a", [sx * 0.24, 0.98, SZ + 0.455]);
    b.part(new THREE.PlaneGeometry(0.44, 0.74), "#ffffff", { at: [sx * 0.24, 0.98, SZ + 0.475], texture: LATTICE });
    ball(0.025, GOLD, [sx * 0.04, 0.98, SZ + 0.49]);
    for (const dy of [-0.3, 0.3]) ball(0.012, GOLD, [sx * 0.46, 0.98 + dy, SZ + 0.485]);
  }
  box(0.03, 0.8, 0.05, RED, [0, 0.98, SZ + 0.47]);
  // gable and roof
  b.extrude(
    [
      [-0.95, 0],
      [0.95, 0],
      [0, 0.55],
    ],
    { at: [0, 1.4, SZ], x: [1, 0, 0], thickness: 0.8, color: CREAM },
  );
  for (const s of [1, -1]) {
    box(1.15, 0.07, 1.5, TILE, [s * 0.5, 1.74, SZ], [0, 0, s * -30]);
    box(0.06, 0.1, 1.54, GOLD, [s * 1.0, 1.455, SZ], [0, 0, s * -30]);
    box(1.15, 0.03, 0.05, GOLD2, [s * 0.5, 1.71, SZ + 0.75], [0, 0, s * -30]);
    box(1.15, 0.03, 0.05, GOLD2, [s * 0.5, 1.71, SZ - 0.75], [0, 0, s * -30]);
    for (let i = 0; i < 4; i++) {
      const u = 0.18 + i * 0.26;
      box(0.025, 0.05, 1.5, "#2a6a86", [s * (1.0 - u * 0.866), 1.45 + u * 0.5 + 0.03, SZ], [0, 0, s * -30]);
    }
  }
  cyl(0.08, 0.08, 1.56, 6, GOLD, [0, 2.04, SZ], [90, 0, 0]);
  for (const sz of [1, -1]) {
    cyl(0.1, 0.1, 0.05, 6, GOLD2, [0, 2.04, SZ + sz * 0.76], [90, 0, 0]);
    for (const k of [-1, 1]) box(0.03, 0.34, 0.03, GOLD, [k * 0.06, 2.2, SZ + sz * 0.72], [0, 0, k * -22]);
  }
  glow(ball(0.07, TEAL, [0, 2.17, SZ + 0.0], [1, 1.3, 1]), 1.2);
  // gable rope and bells
  b.sweep(
    catmull([
      [-0.6, 1.3, SZ + 0.5],
      [0, 1.24, SZ + 0.52],
      [0.6, 1.3, SZ + 0.5],
    ]),
    0.03,
    STRAW,
    { sides: 6 },
  );
  for (const x of [-0.3, 0, 0.3]) {
    b.rod([x, 1.25, SZ + 0.52], [x, 1.15, SZ + 0.52], 0.008, GOLD2, { sides: 4 });
    ball(0.035, GOLD, [x, 1.12, SZ + 0.52]);
  }

  // saisen donation box
  const SX = 0;
  const SZZ = -0.05;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.06, 0.4, 0.06, WOODDK, [SX + sx * 0.3, 0.3, SZZ + sz * 0.17]);
  box(0.72, 0.28, 0.42, WOODDK, [SX, 0.6, SZZ]);
  for (let i = 0; i < 5; i++) box(0.72, 0.03, 0.06, WOOD, [SX, 0.76, SZZ - 0.17 + i * 0.085]);
  box(0.5, 0.06, 0.02, DARK, [SX, 0.7, SZZ + 0.215]);
  box(0.76, 0.03, 0.46, GOLD2, [SX, 0.74, SZZ]).mesh.visible = false;
  for (const dz of [0.22]) cyl(0.05, 0.05, 0.015, 8, GOLD, [SX + 0.22, 0.785, SZZ + dz - 0.2]);

  // ---------- stone lanterns ----------
  const toro = (x: number, z: number, s: number) => {
    const P = (dx: number, y: number, dz: number) => [x + dx * s, y * s + 0.1, z + dz * s];
    cyl(0.3 * s, 0.34 * s, 0.2 * s, 6, STONE, P(0, 0.1, 0));
    cyl(0.1 * s, 0.12 * s, 0.6 * s, 8, STONE, P(0, 0.5, 0));
    cyl(0.16 * s, 0.16 * s, 0.07 * s, 8, STONEDK, P(0, 0.62, 0));
    cyl(0.32 * s, 0.24 * s, 0.1 * s, 6, STONE, P(0, 0.88, 0));
    box(0.3 * s, 0.3 * s, 0.3 * s, STONE, P(0, 1.08, 0));
    for (const sgn of [1, -1]) {
      glow(box(0.17 * s, 0.17 * s, 0.02 * s, WARM, P(0, 1.08, sgn * 0.155)), 1.4);
      glow(box(0.02 * s, 0.17 * s, 0.17 * s, WARM, P(sgn * 0.155, 1.08, 0)), 1.4);
      box(0.19 * s, 0.015 * s, 0.025 * s, STONEDK, P(0, 1.08, sgn * 0.16));
      box(0.025 * s, 0.015 * s, 0.19 * s, STONEDK, P(sgn * 0.16, 1.08, 0));
    }
    box(0.42 * s, 0.05 * s, 0.42 * s, STONEDK, P(0, 1.26, 0));
    b.part(new THREE.CylinderGeometry(0.02 * s, 0.52 * s, 0.3 * s, 4), STONE, {
      at: P(0, 1.43, 0),
      rotation: [0, 45, 0],
    });
    for (const a of [0, 1, 2, 3]) {
      const ang = (a * Math.PI) / 2;
      ball(0.04 * s, STONE, P(Math.sin(ang) * 0.5 * s * 0.0 + Math.sin(ang) * 0.36, 1.29, Math.cos(ang) * 0.36));
    }
    ball(0.07 * s, STONE, P(0, 1.62, 0), [1, 1.2, 1]);
    glow(ball(0.035 * s, TEAL, P(0, 1.72, 0)), 1.2);
  };
  toro(1.15, 0.5, 1);
  toro(-1.15, 0.5, 1);
  toro(1.0, -1.7, 0.55);
  toro(-1.0, -1.7, 0.55);

  // ---------- fox guardians ----------
  const fox = (x: number, z: number, side: number) => {
    const P = (dx: number, y: number, dz: number) => [x + dx, y, z + dz];
    box(0.5, 0.3, 0.46, STONE, P(0, 0.25, 0));
    box(0.56, 0.04, 0.52, STONEDK, P(0, 0.41, 0));
    ball(0.15, STONE, P(0, 0.58, -0.02), [0.85, 1.25, 0.85]);
    ball(0.16, STONE, P(0, 0.52, -0.1), [1, 0.9, 1.15]);
    for (const sx of [1, -1]) {
      b.rod(P(sx * 0.07, 0.65, 0.1), P(sx * 0.07, 0.43, 0.14), 0.035, STONE, { sides: 6 });
      ball(0.04, STONE, P(sx * 0.07, 0.43, 0.17), [1, 0.6, 1.4]);
      b.spike(P(sx * 0.06, 0.9, 0.0), [sx * 0.25, 1, -0.1], 0.14, 0.04, STONE, { sides: 5 });
      ball(0.012, DARK, P(sx * 0.045, 0.82, 0.12));
    }
    ball(0.11, STONE, P(0, 0.8, 0.02), [1.05, 0.95, 1]);
    b.spike(P(0, 0.78, 0.08), [0, -0.1, 1], 0.14, 0.05, STONE, { sides: 6 });
    ball(0.02, DARK, P(0, 0.775, 0.225));
    b.part(new THREE.TorusGeometry(0.11, 0.02, 5, 10), REDF, { at: P(0, 0.7, 0.02), rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.02, 0.04, 6), GOLD, { at: P(0, 0.64, 0.12) });
    b.sweep(
      [P(0, 0.45, -0.2), P(side * 0.1, 0.5, -0.32), P(side * 0.14, 0.72, -0.34), P(side * 0.08, 0.95, -0.26)],
      [0.07, 0.065, 0.02],
      STONE,
      { sides: 7 },
    );
    // brow marks and cheek tufts
    for (const sx of [1, -1]) b.spike(P(sx * 0.1, 0.74, 0.05), [sx, -0.3, 0.2], 0.07, 0.025, STONEDK, { sides: 4 });
  };
  fox(0.75, 0.9, 1);
  fox(-0.75, 0.9, -1);

  // ---------- offering table ----------
  const TX = 1.25;
  const TZZ = -0.55;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.4, 0.05, WOODDK, [TX + sx * 0.3, 0.3, TZZ + sz * 0.2]);
  box(0.7, 0.05, 0.46, WOOD, [TX, 0.53, TZZ]);
  box(0.64, 0.025, 0.4, "#d9382b", [TX, 0.57, TZZ]);
  // sake bottle
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.045, 0.03],
      [0.045, 0.14],
      [0.02, 0.19],
      [0.02, 0.24],
      [0, 0.24],
    ],
    { at: [TX - 0.2, 0.585, TZZ], segments: 8, color: SAKE },
  );
  cyl(0.022, 0.022, 0.02, 8, GOLD, [TX - 0.2, 0.83, TZZ]);
  box(0.06, 0.08, 0.002, PAPER, [TX - 0.2, 0.68, TZZ + 0.046]);
  // cups
  for (const dz of [-0.1, 0.1]) {
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.04, 0.05],
        [0.036, 0.05],
        [0.0, 0.01],
      ],
      { at: [TX - 0.02, 0.585, TZZ + dz], segments: 8, color: "#fff7e6" },
    );
  }
  // oranges and mochi
  for (const [dx, dz] of [
    [0.15, -0.1],
    [0.22, 0.0],
    [0.12, 0.08],
  ])
    ball(0.045, ORANGE, [TX + dx, 0.64, TZZ + dz]);
  ball(0.02, LEAF, [TX + 0.15, 0.69, TZZ - 0.1]);
  for (let i = 0; i < 3; i++) ball(0.07 - i * 0.012, PAPER, [TX + 0.0, 0.64 + i * 0.07, TZZ + 0.17 * 0 - 0.15], [1, 0.6, 1]);
  // rice bowl
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.07, 0.06],
      [0.065, 0.06],
      [0.0, 0.015],
    ],
    { at: [TX + 0.22, 0.585, TZZ + 0.14], segments: 8, color: "#4aa7c8" },
  );
  ball(0.058, PAPER, [TX + 0.22, 0.64, TZZ + 0.14], [1, 0.55, 1]);
  // candle
  cyl(0.015, 0.015, 0.08, 6, PAPER, [TX - 0.2, 0.63, TZZ + 0.15]);
  glow(ball(0.014, ORANGE, [TX - 0.2, 0.69, TZZ + 0.15], [1, 1.6, 1]), 1.5);

  // ---------- ema rack ----------
  const EX = -1.3;
  const EZ = -0.6;
  for (const sx of [1, -1]) {
    cyl(0.04, 0.045, 1.3, 6, WOODDK, [EX + sx * 0.5, 0.75, EZ]);
    box(0.12, 0.05, 0.1, GOLD2, [EX + sx * 0.5, 1.42, EZ]);
  }
  box(1.2, 0.05, 0.06, WOODDK, [EX, 1.3, EZ]);
  box(1.2, 0.05, 0.06, WOODDK, [EX, 0.85, EZ]);
  box(1.28, 0.06, 0.1, RED, [EX, 1.44, EZ]);
  for (let i = 0; i < 5; i++) {
    const x = EX - 0.4 + i * 0.2;
    for (const [row, y] of [
      [0, 1.14],
      [1, 0.72],
    ]) {
      if (row === 1 && i > 2) continue;
      b.rod([x, y + 0.18, EZ], [x, y + 0.12, EZ + 0.01], 0.004, STRAW, { sides: 4 });
      box(0.15, 0.14, 0.015, WOOD, [x, y, EZ + 0.04], [0, 0, (i % 2 ? 5 : -5)]);
      b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", { at: [x, y, EZ + 0.052], rotation: [0, 0, i % 2 ? 5 : -5], texture: EMA });
    }
  }

  // ---------- sakura tree ----------
  b.sweep(
    catmull([
      [-2.25, 0.0, -1.5],
      [-2.3, 0.8, -1.5],
      [-2.1, 1.5, -1.4],
      [-2.0, 2.2, -1.4],
    ]),
    [0.17, 0.12, 0.06],
    BARK,
    { sides: 7 },
  );
  b.rod([-2.1, 1.5, -1.4], [-1.5, 2.2, -1.2], [0.07, 0.04], BARK, { sides: 6 });
  b.rod([-2.2, 1.3, -1.5], [-2.8, 2.0, -1.7], [0.07, 0.04], BARK, { sides: 6 });
  b.rod([-2.0, 2.1, -1.4], [-2.0, 2.8, -1.6], [0.05, 0.03], BARK, { sides: 6 });
  const blossoms = [
    [-2.0, 2.9, -1.5, 0.55],
    [-1.5, 2.5, -1.2, 0.42],
    [-2.8, 2.35, -1.7, 0.45],
    [-2.4, 2.65, -1.0, 0.38],
    [-1.7, 2.9, -1.9, 0.35],
    [-2.5, 3.05, -1.8, 0.35],
    [-1.9, 2.3, -0.9, 0.3],
  ];
  for (const [x, y, z, r] of blossoms) {
    ball(r!, PINK, [x!, y!, z!], [1, 0.8, 1]);
  }
  for (let i = 0; i < 18; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.3 + rand() * 1.1;
    box(0.04, 0.005, 0.03, "#ffc2d6", [-2.1 + Math.cos(a) * d, 0.11, -1.4 + Math.sin(a) * d], [0, rand() * 180, 0]);
  }

  // ---------- plants ----------
  for (const [x, z, r] of [
    [2.0, -0.9, 0.38],
    [2.3, -0.5, 0.26],
    [1.75, -1.5, 0.3],
    [-1.9, 1.7, 0.26],
    [2.0, 1.4, 0.28],
  ]) {
    ball(r!, LEAF, [x!, r! * 0.6 + 0.08, z!], [1, 0.8, 1]);
  }
  for (let i = 0; i < 46; i++) {
    const x = (rand() - 0.5) * 5.4;
    const z = -2.5 + rand() * 6;
    if (Math.abs(x) < 0.55 && z > -0.6) continue;
    if (Math.abs(x) < 1.8 && z < -0.3 && z > -2.1) continue;
    if (Math.hypot(x + 2.1, z + 1.4) < 0.4) continue;
    const h = 0.12 + rand() * 0.14;
    b.spike([x, 0.09, z], [(rand() - 0.5) * 0.5, 1, (rand() - 0.5) * 0.5], h, 0.02, LEAF, { sides: 4 });
    b.spike([x + 0.03, 0.09, z], [0.4, 1, 0], h * 0.8, 0.018, LEAF, { sides: 4 });
  }
  const FLOWERS = ["#ffffff", VIOLET, "#ffe27a", TEAL];
  for (let i = 0; i < 16; i++) {
    const x = (rand() - 0.5) * 5;
    const z = -2.2 + rand() * 5.5;
    if (Math.abs(x) < 0.6 && z > -0.6) continue;
    if (Math.abs(x) < 1.8 && z < -0.3 && z > -2.1) continue;
    if (Math.hypot(x + 2.1, z + 1.4) < 0.4) continue;
    b.rod([x, 0.09, z], [x, 0.24, z], 0.008, LEAF, { sides: 4 });
    const col = FLOWERS[i % FLOWERS.length]!;
    ball(0.032, col, [x, 0.26, z], [1, 0.7, 1]);
    ball(0.012, GOLD, [x, 0.285, z]);
  }

  // ---------- elemental accents ----------
  const ringY = 2.75;
  glow(b.part(new THREE.TorusGeometry(0.42, 0.014, 4, 18), VIOLET, { at: [0, ringY, SZ], rotation: [70, 0, 0] }), 1.4);
  glow(b.part(new THREE.TorusGeometry(0.3, 0.012, 4, 14), TEAL, { at: [0, ringY, SZ], rotation: [110, 30, 0] }), 1.4);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    glow(
      b.part(new THREE.OctahedronGeometry(0.045), i % 2 ? VIOLET : TEAL, {
        at: [Math.sin(a) * 0.5, ringY + Math.cos(a * 2) * 0.12, SZ + Math.cos(a) * 0.5],
        scale: [1, 1.5, 1],
      }),
      1.4,
    );
  }
  glow(b.part(new THREE.OctahedronGeometry(0.09), VIOLET, { at: [0, ringY, SZ], scale: [1, 1.5, 1] }), 1.6);
  // floating wisps near the path
  for (const [x, y, z] of [
    [0.5, 0.9, 1.0],
    [-0.45, 1.2, 0.2],
    [0.35, 0.6, -0.9],
  ]) {
    glow(ball(0.025, TEAL, [x!, y!, z!]), 1.5);
  }

  return b.root;
}
