import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { gradient, grain, mottle, paint, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "Double-bitted crescent battle axe of dark rime steel and living ice, planted in a frozen plinth, with glowing cyan runes, ice crystals and a frost-gem heart.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------- palette ----------
const STEEL = cel("#4b5c78", "#2c3552");
const STEEL_LIGHT = cel("#8fa6c8", "#566a92");
const STEEL_DARK = cel("#2a3350", "#181d33");
const GOLD = cel("#f2c15a", "#b4701f");
const GOLD_FLAT = "#f2c15a";
const ICE = "#9ee9ff";
const ICE_DEEP = "#2fb4e8";
const ICE_WHITE = "#eafcff";
const CYAN_GLOW = "#5af0ff";
const LEATHER = cel("#3a2a3c", "#221828");
const FUR = cel("#e9f2fb", "#9db4d4");
const VIOLET = "#6a5cff";
const ROCK = cel("#5a6a86", "#323c58");

// ---------- textures ----------
const RUNE_A = svg(
  `<svg viewBox="0 0 64 128"><g fill="none" stroke="#7ff6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 8 L32 120"/><path d="M32 30 L12 50 L32 70"/><path d="M32 70 L52 90 L32 110"/><path d="M16 20 L32 8 L48 20"/></g></svg>`,
  { size: 128 },
);
const RUNE_B = svg(
  `<svg viewBox="0 0 64 128"><g fill="none" stroke="#7ff6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 12 L52 12 L12 64 L52 116 L12 116"/><path d="M32 12 L32 116"/><circle cx="32" cy="64" r="6"/></g></svg>`,
  { size: 128 },
);
const RUNE_C = svg(
  `<svg viewBox="0 0 64 128"><g fill="none" stroke="#7ff6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 8 L52 36 L32 64 L12 36 Z"/><path d="M32 64 L32 120"/><path d="M14 92 L50 92"/><path d="M20 108 L44 108"/></g></svg>`,
  { size: 128 },
);
const SNOW = svg(
  `<svg viewBox="0 0 64 64"><g stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none">
  <path d="M32 6 V58 M9.5 19 L54.5 45 M9.5 45 L54.5 19"/>
  <path d="M24 12 L32 20 L40 12 M24 52 L32 44 L40 52"/></g></svg>`,
  { size: 128 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 128 64"><g fill="none" stroke="#ffe39a" stroke-width="4" stroke-linecap="round">
  <path d="M4 32 C20 4 36 4 48 32 C60 60 76 60 88 32 C100 4 116 4 124 32"/>
  <path d="M4 32 C20 60 36 60 48 32 C60 4 76 4 88 32 C100 60 116 60 124 32" stroke="#c98a2a"/></g></svg>`,
  { size: 256 },
);
const FROST_VEIN = svg(
  `<svg viewBox="0 0 128 128"><g fill="none" stroke="#e8fdff" stroke-width="4" stroke-linecap="round">
  <path d="M10 118 L40 80 L64 88 L92 40 L118 10"/><path d="M40 80 L30 52"/><path d="M64 88 L74 118"/><path d="M92 40 L116 58"/><path d="M92 40 L78 14"/></g></svg>`,
  { size: 256 },
);
const ICICLE = svg(
  `<svg viewBox="0 0 32 96"><path d="M2 0 H30 L20 56 L16 96 L12 56 Z" fill="#ffffff"/><path d="M12 0 L16 70" stroke="#bfefff" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);

// ---------- helpers ----------
const ARCH = (pts: Array<[number, number]>): OutlinePoint[] => pts.map(([x, y]) => [x, y] as OutlinePoint);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frostAxe", paintSize: 2048 });
  const R = rng(7);

  const HAFT_X = 0;
  const HAFT_Z = 0;
  const PLINTH_H = 0.09;
  const TOP = 1.62;

  // ============ PLINTH: frozen rock + ice ============
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.34, 0.03],
      [0.31, 0.06],
      [0.24, PLINTH_H],
      [0, PLINTH_H],
    ],
    { at: [0, 0, 0], segments: 9, color: ROCK },
  );
  // ice mound over the rock
  b.lathe(
    [
      [0, PLINTH_H - 0.01],
      [0.22, PLINTH_H - 0.01],
      [0.2, PLINTH_H + 0.03],
      [0.12, PLINTH_H + 0.07],
      [0.06, PLINTH_H + 0.09],
      [0, PLINTH_H + 0.09],
    ],
    { at: [0, 0, 0], segments: 9, color: ICE_WHITE },
  );
  // ice shards around the base
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.3;
    const rr = 0.2 + R() * 0.09;
    const h = 0.14 + R() * 0.22;
    const base: [number, number, number] = [Math.sin(a) * rr, PLINTH_H - 0.02, Math.cos(a) * rr];
    glow(
      b.spike(base, [Math.sin(a) * 0.35, 1, Math.cos(a) * 0.35], h, 0.035 + R() * 0.02, i % 2 ? ICE : ICE_DEEP, {
        section: { ngon: 5 },
        caps: "point",
      }),
      0.35,
    );
  }
  // snow cushion bumps
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const rr = 0.27;
    b.part(new THREE.SphereGeometry(0.045 + R() * 0.02, 6, 4), "#f4fbff", {
      at: [Math.sin(a) * rr, 0.045, Math.cos(a) * rr],
      scale: [1.2, 0.6, 1.2],
    });
  }

  // ============ HAFT ============
  const haftPaint = paint((p, n, s) => {
    const k = Math.abs(((p.y * 18) % 1 + 1) % 1 - 0.5);
    return k < 0.05 ? STEEL_DARK : STEEL;
  });
  void haftPaint;
  const haft = b.rod([HAFT_X, PLINTH_H - 0.02, HAFT_Z], [HAFT_X, TOP - 0.1, HAFT_Z], 0.032, {
    color: grain(STEEL, STEEL_DARK, { size: 0.01, axis: "y", seed: 3 }),
    sides: 8,
    caps: "flat",
  });
  void haft;

  // butt spike cap and ring collars
  b.rod([0, PLINTH_H - 0.03, 0], [0, PLINTH_H + 0.07, 0], [0.03, 0.05], { color: GOLD, sides: 8, caps: "flat" });
  for (const y of [PLINTH_H + 0.08, PLINTH_H + 0.12]) {
    b.rod([0, y - 0.01, 0], [0, y + 0.01, 0], 0.047, { color: y < 0.2 ? GOLD : STEEL_DARK, sides: 8, caps: "flat" });
  }

  // lower leather grip
  b.rod([0, 0.22, 0], [0, 0.78, 0], 0.041, {
    color: stripes(LEATHER, STEEL_DARK, { size: 0.03, axis: "y", width: 0.2, wobble: 0.1, seed: 4 }),
    sides: 8,
    caps: "flat",
  });
  // wrap bands
  for (let i = 0; i < 14; i++) {
    const y = 0.25 + i * 0.04;
    b.rod([0, y, 0], [0, y + 0.012, 0], 0.045, { color: i % 2 ? LEATHER : STEEL_DARK, sides: 8, caps: "flat" });
  }
  // grip trim
  for (const y of [0.2, 0.8]) {
    b.rod([0, y - 0.018, 0], [0, y + 0.018, 0], 0.052, { color: GOLD, sides: 8, caps: "flat" });
    b.rod([0, y + 0.018, 0], [0, y + 0.028, 0], 0.045, { color: STEEL_DARK, sides: 8, caps: "flat" });
  }
  // fur wrap above grip
  b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.08, 0.03],
      [0.075, 0.08],
      [0.06, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.82, 0], segments: 8, color: FUR },
  );
  // fur tufts hanging
  const furFrames = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    furFrames.push({ at: [Math.sin(a) * 0.07, 0.85, Math.cos(a) * 0.07] as [number, number, number], axis: [Math.sin(a), 1, Math.cos(a)] as [number, number, number] });
  }
  b.cards(
    furFrames.map((f) => ({ at: f.at, axis: f.axis }) as never),
    ICICLE,
    { size: [0.04, 0.12], lean: 150, flow: [0, 0, 1], color: "#dff3ff", vary: 0.3, rng: rng(11) },
  );

  // spine ridges on upper haft
  b.rod([0, 0.86, 0], [0, 1.1, 0], 0.036, {
    color: stripes(STEEL, STEEL_LIGHT, { size: 0.05, axis: "y", width: 0.25, seed: 9 }),
    sides: 8,
    caps: "flat",
  });
  // frost-spiral on upper haft: steel with cyan veins
  b.rod([0, 1.1, 0], [0, 1.28, 0], 0.036, {
    color: paint((p, _n, s) => (((s[1] - 720 * p.y) % 120 + 120) % 120 < 18 ? ICE : STEEL_LIGHT)),
    sides: 8,
    caps: "flat",
  });

  // ============ AXE HEAD ============
  const HY = 1.3; // head centre height
  // central socket block
  b.frustumBox([0, HY - 0.2, 0], [0, HY + 0.2, 0], [0.14, 0.13], [0.14, 0.13], {
    color: STEEL_DARK,
    caps: "flat",
  });
  // socket gold bands
  for (const dy of [-0.2, 0.2]) {
    b.frustumBox([0, HY + dy - 0.015, 0], [0, HY + dy + 0.015, 0], [0.17, 0.16], [0.17, 0.16], {
      color: GOLD,
      caps: "flat",
    });
  }
  // socket front plates with rivets
  for (const s of [1, -1]) {
    b.frustumBox([0, HY - 0.17, s * 0.068], [0, HY + 0.17, s * 0.068], [0.1, 0.012], [0.1, 0.012], {
      color: STEEL_LIGHT,
      caps: "flat",
    });
    for (const dy of [-0.13, -0.05, 0.05, 0.13]) {
      for (const dx of [-0.038, 0.038]) {
        b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_FLAT, { at: [dx, HY + dy, s * 0.077] });
      }
    }
  }

  // blade outline (crescent, drawn for +x side, y up, origin at haft centre)
  const bladeOutline = (): OutlinePoint[] =>
    ARCH([
      [0.0, 0.18],
      [0.14, 0.2],
      [0.26, 0.28],
      [0.38, 0.4],
      [0.5, 0.5],
      [0.58, 0.38],
      [0.62, 0.22],
      [0.63, 0.06],
      [0.64, -0.1],
      [0.62, -0.26],
      [0.56, -0.42],
      [0.46, -0.5],
      [0.4, -0.38],
      [0.3, -0.28],
      [0.18, -0.22],
      [0.0, -0.18],
    ]).map(([x, y], i) => ((i === 4 || i === 12 ? [x, y, "sharp"] : [x, y]) as OutlinePoint));

  const bladeSides: THREE.Object3D[] = [];
  void bladeSides;
  for (const s of [1, -1]) {
    // outer steel body of the blade
    const blade = b.extrude(bladeOutline(), {
      at: [0, HY, 0],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.075, 0.016],
      bevel: 0.012,
      smoothing: 1,
      color: paint((p, n, sc) => {
        const dist = Math.abs(p.x);
        // edge gradient: bright icy edge toward the outer rim
        if (dist > 0.55) return cel(ICE_WHITE, "#8fdcf0").at(p, n, sc);
        if (dist > 0.48) return cel(ICE, "#4fb8e0").at(p, n, sc);
        if (dist > 0.42) return STEEL_LIGHT.at(p, n, sc);
        return STEEL.at(p, n, sc);
      }),
    });
    // dark inner plate inset for depth
    const inset = ARCH([
      [0.08, 0.13],
      [0.2, 0.17],
      [0.32, 0.26],
      [0.42, 0.35],
      [0.38, 0.22],
      [0.4, 0.05],
      [0.4, -0.1],
      [0.38, -0.22],
      [0.28, -0.2],
      [0.18, -0.15],
      [0.08, -0.12],
    ]);
    const front = b.extrude(inset, {
      at: [0, HY, 0.018],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color: mottle(STEEL_DARK, "#3a4a72", { size: 0.06, contrast: 0.7, seed: 5 }),
    });
    void front;
    b.extrude(inset, {
      at: [0, HY, -0.018],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color: mottle(STEEL_DARK, "#3a4a72", { size: 0.06, contrast: 0.7, seed: 6 }),
    });
    void blade;

    // gold edge trim following the upper and lower horns (thin rods)
    for (const zf of [1, -1]) {
      b.rod([s * 0.1, HY + 0.2, zf * 0.034], [s * 0.38, HY + 0.4, zf * 0.034], 0.007, { color: GOLD, sides: 6, caps: "flat" });
      b.rod([s * 0.1, HY - 0.2, zf * 0.034], [s * 0.38, HY - 0.38, zf * 0.034], 0.007, { color: GOLD, sides: 6, caps: "flat" });
      // filigree decal strips
      b.part(new THREE.PlaneGeometry(0.28, 0.14), "#ffffff", {
        at: [s * 0.24, HY + 0.01, zf * 0.0375],
        dir: [0, 0, zf],
        axis: "z",
        texture: FILIGREE,
      });
    }

    // glowing runes on the blade faces
    const runes = [RUNE_A, RUNE_B, RUNE_C];
    for (const zf of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        glow(
          b.part(new THREE.PlaneGeometry(0.075, 0.15), "#ffffff", {
            at: [s * (0.3 + k * 0.1), HY + (k === 1 ? 0.05 : -0.02), zf * 0.0395 - (0 * k)],
            dir: [0, 0, zf],
            axis: "z",
            texture: runes[(k + (s > 0 ? 0 : 1)) % 3],
          }),
          1.4,
        );
      }
      // frost veins crawling on the blade
      b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
        at: [s * 0.32, HY - 0.2, zf * 0.0385],
        dir: [0, 0, zf],
        axis: "z",
        texture: FROST_VEIN,
        rotation: [0, 0, s > 0 ? 0 : 90],
      });
    }

    // glowing cutting-edge ridge: thin ice rod along the outer curve
    const edgePts: Array<[number, number, number]> = [
      [0.5, 0.5],
      [0.58, 0.38],
      [0.62, 0.22],
      [0.63, 0.06],
      [0.64, -0.1],
      [0.62, -0.26],
      [0.56, -0.42],
      [0.46, -0.5],
    ].map(([x, y]) => [s * x, HY + y, 0]);
    glow(b.sweep(edgePts, 0.012, { color: ICE_WHITE, sides: 6, caps: "round" }), 1.2);

    // jagged ice crystals growing off the blade
    const crystalSpots: Array<[number, number, number, number]> = [
      [0.44, 0.47, 28, 0.2],
      [0.56, 0.42, 55, 0.17],
      [0.5, -0.46, -140, 0.18],
      [0.38, -0.36, -160, 0.13],
      [0.64, 0.0, 85, 0.15],
    ];
    for (const [x, y, deg, len] of crystalSpots) {
      const a = (deg * Math.PI) / 180;
      const d: [number, number, number] = [s * Math.sin(a), Math.cos(a), 0.12];
      glow(
        b.spike([s * x, HY + y, 0], d, len, 0.028, ICE, { section: { ngon: 6 }, caps: "point" }),
        0.5,
      );
      glow(
        b.spike([s * x, HY + y, 0.01], [d[0] * 1.2, d[1], d[2] + 0.3], len * 0.7, 0.018, ICE_WHITE, {
          section: { ngon: 6 },
          caps: "point",
        }),
        0.6,
      );
    }

    // horn spikes on upper and lower tips
    b.spike([s * 0.5, HY + 0.5, 0], [s * 0.6, 1, 0], 0.14, 0.035, STEEL_LIGHT, { section: { ngon: 4 }, caps: "point" });
    b.spike([s * 0.46, HY - 0.5, 0], [s * 0.6, -1, 0], 0.14, 0.035, STEEL_LIGHT, { section: { ngon: 4 }, caps: "point" });

    // rivets along the inner blade
    for (let k = 0; k < 5; k++) {
      const y = HY + 0.16 - k * 0.08;
      for (const zf of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD_FLAT, { at: [s * 0.13, y, zf * 0.034] });
      }
    }
    // gold arm braces from socket into blade
    for (const dy of [0.12, -0.12]) {
      b.frustumBox([s * 0.06, HY + dy, 0], [s * 0.2, HY + dy * 1.4, 0], [0.04, 0.09], [0.03, 0.09], {
        color: GOLD,
        caps: "flat",
      });
    }
  }

  // ============ TOP SPIKE & CROWN ============
  b.spike([0, HY + 0.2, 0], [0, 1, 0], 0.32, 0.055, {
    color: gradient(STEEL_LIGHT, ICE_WHITE, [0, HY + 0.25, 0], [0, HY + 0.52, 0]),
    section: { ngon: 4 },
    caps: "point",
  });
  glow(b.spike([0, HY + 0.36, 0.03], [0, 1, 0], 0.1, 0.012, ICE, { section: { ngon: 4 }, caps: "point" }), 1);

  // small side fins on the spike
  for (const s of [1, -1]) {
    b.extrude(
      ARCH([
        [0, 0],
        [0.12, 0.04],
        [0.09, 0.14],
        [0, 0.2],
      ]),
      {
        at: [s * 0.03, HY + 0.26, 0],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        color: STEEL_LIGHT,
      },
    );
  }

  // ============ FROST-GEM HEART ============
  const gem = new THREE.OctahedronGeometry(0.075, 0);
  glow(b.part(gem, ICE_DEEP, { at: [0, HY, 0.075], scale: [0.8, 1.4, 0.6] }), 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.075, 0), ICE_DEEP, { at: [0, HY, -0.075], scale: [0.8, 1.4, 0.6] }), 1.5);
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), ICE_WHITE, { at: [0, HY + 0.01, 0.1], scale: [0.7, 1.3, 0.5] }), 1.8);
  glow(b.part(new THREE.OctahedronGeometry(0.035, 0), ICE_WHITE, { at: [0, HY + 0.01, -0.1], scale: [0.7, 1.3, 0.5] }), 1.8);
  // gem bezel (gold ring)
  for (const s of [1, -1]) {
    b.sweep(
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return [Math.sin(a) * 0.065, HY + Math.cos(a) * 0.1, s * 0.073] as [number, number, number];
      }),
      0.009,
      { color: GOLD, sides: 6, closed: true, caps: "none" } as never,
    );
  }

  // ============ BELOW-HEAD COLLAR & TASSELS ============
  b.frustumBox([0, HY - 0.26, 0], [0, HY - 0.2, 0], [0.09, 0.09], [0.15, 0.14], { color: GOLD, caps: "flat" });
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.075, 0.03],
      [0.05, 0.07],
      [0, 0.07],
    ],
    { at: [0, HY - 0.34, 0], segments: 8, color: STEEL_DARK },
  );
  // purple/violet ribbon tassels hanging from collar
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.045;
    const rib = b.sweep(
      [
        [x, HY - 0.3, 0.05],
        [x + 0.01, HY - 0.4, 0.07],
        [x - 0.01, HY - 0.52, 0.065],
        [x + 0.015, HY - 0.64, 0.07],
      ],
      [0.014, 0.004],
      { color: i === 1 ? VIOLET : "#3b3f8f", sides: 4, caps: "flat" },
    );
    void rib;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD_FLAT, { at: [x + 0.015, HY - 0.64, 0.07] });
  }
  // hanging frost charm
  b.rod([0.07, HY - 0.28, 0.06], [0.07, HY - 0.46, 0.06], 0.003, { color: GOLD_FLAT, sides: 4, caps: "flat" });
  glow(b.spike([0.07, HY - 0.46, 0.06], [0, -1, 0], 0.1, 0.022, ICE, { section: { ngon: 6 }, caps: "point" }), 0.8);
  // icicle cards dangling from lower blade tips
  for (const s of [1, -1]) {
    const frames = [0.3, 0.38, 0.46, 0.54].map(
      (x, i) =>
        ({ at: [s * x, HY - 0.3 - i * 0.04, 0.0], axis: [0, 1, 0] }) as never,
    );
    b.cards(frames, ICICLE, { size: [0.035, 0.1], lean: 180, flow: [0, 0, 1], color: "#bff0ff", vary: 0.3, rng: rng(21 + s) });
  }
  // snowflake sigils floating above plinth
  const flakes = [
    [0.22, 0.5, 0.2],
    [-0.25, 0.7, 0.18],
    [0.2, 0.95, -0.2],
    [-0.18, 0.4, -0.22],
  ];
  for (const [x, y, z] of flakes) {
    glow(
      b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
        at: [x, y, z],
        dir: [x, 0.2, z],
        axis: "z",
        texture: SNOW,
        color: CYAN_GLOW,
      } as never),
      0.9,
    );
  }

  // scales paint used on butt cap detail
  b.rod([0, PLINTH_H + 0.03, 0], [0, 0.2, 0], 0.037, {
    color: scales(STEEL, INK, { size: 0.03, width: 0.1, seed: 2 }),
    sides: 8,
    caps: "flat",
  });
  // pommel bead
  b.part(new THREE.SphereGeometry(0.035, 8, 6), GOLD_FLAT, { at: [0, 0.205, 0] });

  return b.root;
}
