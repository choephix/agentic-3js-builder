import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { gradient, grain, mottle, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A heavy dwarven battle axe on a runed stone plinth: dark steel head with glowing cyan runes, a jagged crystalline ice edge, a frost crystal crowned by steel prongs, rune-carved haft with leather grip and studded steel bands. About 1.05 m tall.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette (cel-shaded, two tones each)
const STEEL = cel(mottle("#a3afc2", "#8593ab", { size: 0.04, seed: 3 }));
const DARKSTEEL = cel(mottle("#4b5d80", "#3b4a6b", { size: 0.05, seed: 5 }));
const STONE = cel(mottle("#5b6a8e", "#4a5778", { size: 0.05, seed: 9 }));
const WOOD = cel(grain("#8d5b33", "#6d4325", { size: 0.01, axis: "y", seed: 2 }));
const LEATHER = cel("#80392b");
const LEATHER_DARK = cel("#52221a");
const GOLD = cel("#f2b83d", "#c9801f");
const ICE_EDGE = cel(
  mottle(gradient("#78bff2", "#c7eeff", [0.2, 0.84, 0], [0.46, 0.84, 0]), "#f0fbff", { size: 0.05, contrast: 0.7, seed: 4 }),
);
const ICE = cel(mottle("#86c9f4", "#d6f4ff", { size: 0.04, seed: 6 }));
const CRYSTAL = "#bdeeff";
const RUNE_CYAN = "#7ff0ff";

const spiral = paint((_p, _n, s) => (((s[1] + s[0] * 1800) % 90) + 90) % 90 < 68 ? LEATHER : LEATHER_DARK);

const RUNES = svg(
  `<svg viewBox="0 0 90 100">
  <g stroke="${RUNE_CYAN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M18 18 L42 10 L38 38 L60 28"/>
    <path d="M24 56 L52 48 L36 76 L64 70"/>
    <path d="M68 14 L77 44 L65 52"/>
    <path d="M16 88 L40 94 L46 82"/>
    <path d="M62 84 L74 92"/>
  </g></svg>`,
  { size: 512 },
);

const HAFT_RUNES = svg(
  `<svg viewBox="0 0 20 90">
  <g stroke="${RUNE_CYAN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M4 6 L14 3 L12 14 L6 18"/>
    <path d="M5 30 L15 34 L7 44 L14 50"/>
    <path d="M10 58 L10 84 M10 64 L4 72 M10 64 L16 72"/>
  </g></svg>`,
  { size: 512 },
);

const CRACKS = svg(
  `<svg viewBox="0 0 21 45">
  <g stroke="#e8fbff" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M1 6 L5 9 L4 14 L9 17"/>
    <path d="M3 22 L8 24 L7 29 L12 31"/>
    <path d="M6 36 L10 38 L9 42"/>
    <path d="M12 5 L15 10 L13 13"/>
    <path d="M13 18 L17 21 L15 25"/>
    <path d="M15 32 L18 36"/>
  </g></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("axe", { at: [0, 0.5, 0] });
  const rand = rng(11);

  // ---- Plinth -------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.18, 0.03],
      [0.15, 0.05],
      [0.15, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: STONE, name: "plinth" },
  );
  glow(
    b.lathe(
      [
        [0.1, 0],
        [0.125, 0],
        [0.125, 0.003],
        [0.1, 0.003],
      ],
      { at: [0, 0.0595, 0], segments: 16, color: RUNE_CYAN, name: "plinthRing" },
    ),
    0.8,
  );
  // frost shards around the plinth
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const h = 0.09 + rand() * 0.11;
    const r = 0.135 + rand() * 0.03;
    const dir = [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4];
    b.part(new THREE.ConeGeometry(0.022 + rand() * 0.01, h, 5), ICE, {
      at: [Math.cos(a) * r, 0.06 + h * 0.42, Math.sin(a) * r],
      dir,
      flat: true,
      name: `baseShard${i}`,
    });
  }

  // ---- Pommel -------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.068, 0.045],
      [0.062, 0.09],
      [0.036, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.058, 0], segments: 6, color: STEEL, name: "pommel" },
  );
  for (const sz of [1, -1])
    b.part(new THREE.OctahedronGeometry(0.02), STEEL, {
      at: [0, 0.105, sz * 0.058],
      scale: [1, 1.1, 0.45],
      flat: true,
      name: `pommelStud${sz}`,
    });

  // ---- Haft ---------------------------------------------------------------------------------------------------
  b.sweep(
    [
      [0, 0.13, 0],
      [0, 0.93, 0],
    ],
    [0.024, 0.021, 0.02, 0.021, 0.025],
    { color: WOOD, caps: "flat", sides: 8, name: "haft" },
  );
  // leather wrap
  b.rod([0, 0.2, 0], [0, 0.42, 0], 0.0285, { color: spiral, sides: 8, name: "wrap" });
  b.rod([0, 0.2, 0], [0, 0.205, 0], 0.03, LEATHER_DARK, { sides: 8 });
  b.rod([0, 0.415, 0], [0, 0.42, 0], 0.03, LEATHER_DARK, { sides: 8 });

  // steel bands with studs
  const band: OutlinePoint[] = [
    [0.03, 0],
    [0.043, 0.006],
    [0.043, 0.034],
    [0.03, 0.04],
  ];
  for (const y of [0.15, 0.43]) {
    b.lathe(band, { at: [0, y, 0], segments: 8, spin: 22.5, color: STEEL, name: `band${y}` });
    for (const sz of [1, -1])
      b.part(new THREE.OctahedronGeometry(0.014), STEEL, {
        at: [0, y + 0.02, sz * 0.045],
        scale: [1, 1.1, 0.5],
        flat: true,
      });
  }
  // gold trims
  const trim: OutlinePoint[] = [
    [0.027, 0],
    [0.034, 0.002],
    [0.034, 0.012],
    [0.027, 0.014],
  ];
  for (const y of [0.47, 0.5, 0.735]) b.lathe(trim, { at: [0, y, 0], segments: 8, spin: 22.5, color: GOLD });
  // glowing runes carved in the haft
  glow(
    b.part(new THREE.PlaneGeometry(0.04, 0.18), "#ffffff", {
      at: [0, 0.625, 0.0245],
      dir: [0, 0, 1],
      axis: "z",
      texture: HAFT_RUNES,
      name: "haftRunes",
    }),
    0.8,
  );
  // hanging charm
  b.sweep(
    catmull([
      [0.035, 0.45, 0.035],
      [0.05, 0.4, 0.045],
      [0.046, 0.355, 0.05],
    ]),
    0.0035,
    { color: LEATHER_DARK, sides: 5, name: "charmCord" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.012), "#aeeaff", {
      at: [0.046, 0.335, 0.05],
      scale: [0.6, 1.7, 0.6],
      flat: true,
      name: "charm",
    }),
    0.8,
  );

  // ---- Head socket --------------------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.1, 0.16, 0.1), STEEL, { at: [0, 0.84, 0], name: "socket" });
  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.077, 0.015],
      [0.077, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0.742, 0], segments: 4, spin: 45, color: STEEL, name: "socketLow" },
  );
  b.lathe(
    [
      [0, 0],
      [0.077, 0],
      [0.077, 0.015],
      [0.058, 0.03],
      [0, 0.03],
    ],
    { at: [0, 0.928, 0], segments: 4, spin: 45, color: STEEL, name: "socketTop" },
  );
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.012],
      [0, 0.012],
    ],
    { at: [0, 0.957, 0], segments: 8, color: GOLD, name: "socketGold" },
  );
  for (const sz of [1, -1])
    b.part(new THREE.OctahedronGeometry(0.026), STEEL, {
      at: [0, 0.84, sz * 0.05],
      scale: [1, 1.2, 0.5],
      flat: true,
      name: `socketStud${sz}`,
    });
  // back block and spike
  b.part(new THREE.BoxGeometry(0.04, 0.115, 0.09), STEEL, { at: [-0.068, 0.84, 0], name: "backBlock" });
  b.spike([-0.07, 0.84, 0], [-0.22, 0.84, 0], null, 0.04, { color: STEEL, section: { ngon: 4 }, name: "backSpike" });
  // crystal crown
  glow(
    b.part(new THREE.OctahedronGeometry(0.036), CRYSTAL, {
      at: [0, 0.99, 0],
      scale: [1, 1.8, 0.9],
      flat: true,
      name: "crystal",
    }),
    1,
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.spike([Math.cos(a) * 0.04, 0.955, Math.sin(a) * 0.04], [Math.cos(a) * 0.062, 1.0, Math.sin(a) * 0.062], null, 0.013, {
      color: STEEL,
      sides: 5,
      name: `prong${i}`,
    });
  }

  // ---- Blade --------------------------------------------------------------------------------------------------
  const AT: [number, number, number] = [0, 0.84, 0];
  const steelOutline: OutlinePoint[] = [
    [0.04, 0.06],
    [0.1, 0.08],
    [0.17, 0.13, "sharp"],
    [0.25, 0.12],
    [0.28, 0.05],
    [0.27, -0.06],
    [0.3, -0.17],
    [0.31, -0.24, "sharp"],
    [0.24, -0.21],
    [0.19, -0.14],
    [0.14, -0.095],
    [0.09, -0.08],
    [0.04, -0.07],
  ];
  const innerOutline: OutlinePoint[] = [
    [0.08, 0.045],
    [0.14, 0.07],
    [0.19, 0.1],
    [0.23, 0.1],
    [0.25, 0.05],
    [0.24, -0.05],
    [0.26, -0.14],
    [0.26, -0.18],
    [0.22, -0.155],
    [0.17, -0.095],
    [0.13, -0.07],
    [0.08, -0.058],
  ];
  const iceOutline: OutlinePoint[] = [
    [0.22, 0.12],
    [0.3, 0.17, "sharp"],
    [0.31, 0.1],
    [0.38, 0.12, "sharp"],
    [0.36, 0.04],
    [0.43, 0.03, "sharp"],
    [0.39, -0.04],
    [0.45, -0.1, "sharp"],
    [0.4, -0.13],
    [0.42, -0.2, "sharp"],
    [0.37, -0.2],
    [0.36, -0.28, "sharp"],
    [0.3, -0.25],
    [0.24, -0.12],
    [0.22, 0],
  ];
  b.extrude(steelOutline, { at: AT, x: [1, 0, 0], thickness: 0.024, bevel: 0.004, color: STEEL, name: "bladeSteel" });
  b.extrude(innerOutline, { at: AT, x: [1, 0, 0], thickness: 0.03, bevel: 0.003, color: DARKSTEEL, name: "bladeInner" });
  b.extrude(iceOutline, { at: AT, x: [1, 0, 0], thickness: 0.03, bevel: 0.008, color: ICE_EDGE, name: "bladeIce" });

  for (const sz of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.18, 0.2), "#ffffff", {
        at: [0.17, 0.8, sz * 0.0166],
        dir: [0, 0, sz],
        axis: "z",
        texture: RUNES,
        name: `bladeRunes${sz}`,
      }),
      1,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.21, 0.45), "#ffffff", {
        at: [0.345, 0.785, sz * 0.0172],
        dir: [0, 0, sz],
        axis: "z",
        texture: CRACKS,
        name: `iceCracks${sz}`,
      }),
      0.7,
    );
  }

  // ice shards growing from the edge
  const shardSpots: Array<[number, number]> = [
    [0.3, 0.15],
    [0.36, 0.1],
    [0.4, 0.03],
    [0.42, -0.08],
    [0.39, -0.17],
    [0.34, -0.24],
    [0.28, 0.11],
  ];
  shardSpots.forEach(([x, y], i) => {
    for (const sz of [1, -1]) {
      const d = new THREE.Vector3(x - 0.2, y * 1.4, sz * 0.7).normalize();
      b.part(new THREE.ConeGeometry(0.016 + rand() * 0.008, 0.06 + rand() * 0.03, 4), ICE, {
        at: [x, 0.84 + y, sz * 0.014],
        dir: [d.x, d.y, d.z],
        flat: true,
        name: `edgeShard${i}_${sz}`,
      });
    }
  });

  return b.root;
}
