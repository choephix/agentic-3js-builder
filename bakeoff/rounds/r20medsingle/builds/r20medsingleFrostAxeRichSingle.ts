import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mix, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostbite Cleaver",
  description:
    "A frost-forged great battle axe standing on a frozen stone plinth: crescent ice-steel blade with cracked-frost paint, glowing rune plate and cutting edge, gold trim, wrapped grip, spear point and hooked back fin.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette
const DEEP = "#16306e";
const STEEL = "#8fa9cf";
const NAVY = "#1b2748";
const ICE = "#7fdcff";
const FROST = "#e6f9ff";
const GOLD = "#f0b94a";
const GLOWC = "#9ff3ff";
const STONE = "#4a5878";
const SNOW = "#d4ecf8";
const RIBBON = "#2f7fd6";
const LEATHER = "#c9e2f2";

const K = 0.72; // blade scale
const HY = 1.12; // head centre height

type Pt = [number, number] | [number, number, "sharp"];
const S = (pts: Pt[]): OutlinePoint[] =>
  pts.map((p) => (p.length === 3 ? [p[0] * K, p[1] * K, "sharp" as const] : [p[0] * K, p[1] * K])) as OutlinePoint[];

const RUNES = svg(
  `<svg viewBox="0 0 64 128">
    <g fill="none" stroke="${GLOWC}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 6 L32 36 M18 14 L32 24 L46 14 M20 30 L32 40 L44 30"/>
      <path d="M32 50 L46 64 L32 78 L18 64 Z M32 56 L32 72"/>
      <circle cx="32" cy="98" r="9"/>
      <path d="M32 84 L32 90 M32 106 L32 122 M22 112 L32 120 L42 112"/>
    </g>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);

  const shard = (
    base: [number, number, number],
    dir: [number, number, number],
    r: number,
    h: number,
    color: string,
    strength = 0,
    seg = 5,
  ) => {
    const d = new THREE.Vector3(...dir).normalize();
    const c = new THREE.Vector3(...base).addScaledVector(d, h * 0.45);
    const p = b.part(new THREE.ConeGeometry(r, h, seg, 1), color, { at: c, dir: d, flat: true });
    if (strength > 0) glow(p, strength);
    return p;
  };

  // ---- Frozen ground and plinth ----
  b.lathe(
    [
      [0, 0],
      [0.44, 0],
      [0.44, 0.03],
      [0.4, 0.05],
      [0, 0.05],
    ],
    {
      at: [0, 0, 0],
      segments: 10,
      color: paint((p, n) => {
        const c = cells(p, 0.14, 4);
        return c.d2 - c.d1 < 0.05 ? FROST : n.y > 0.5 ? SNOW : STEEL;
      }),
    },
  );
  b.lathe(
    [
      [0, 0.05],
      [0.31, 0.05],
      [0.31, 0.1],
      [0.25, 0.14],
      [0, 0.14],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      color: cel(
        paint((p) => {
          const c = cells(p, 0.1, 9);
          return c.d2 - c.d1 < 0.03 ? NAVY : STONE;
        }),
      ),
    },
  );
  // plinth runes (carved glowing ticks)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.035, 0.008), GLOWC, {
        at: [Math.sin(a) * 0.305, 0.09, Math.cos(a) * 0.305],
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
      }),
    );
  }
  // ice crystals growing round the base
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const rad = 0.2 + rand() * 0.06;
    const h = 0.14 + rand() * 0.16;
    shard(
      [Math.sin(a) * rad, 0.12, Math.cos(a) * rad],
      [Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4],
      0.022 + rand() * 0.012,
      h,
      i % 3 === 0 ? FROST : ICE,
      i % 3 === 0 ? 0 : 0.7,
      6,
    );
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.6;
    shard([Math.sin(a) * 0.38, 0.04, Math.cos(a) * 0.38], [Math.sin(a) * 0.7, 1, Math.cos(a) * 0.7], 0.018, 0.09 + rand() * 0.05, FROST, 0, 5);
  }

  // ---- Haft ----
  b.part(new THREE.CylinderGeometry(0.04, 0.032, 0.07, 8), STEEL, { at: [0, 0.175, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.016, 8), GOLD, { at: [0, 0.215, 0], flat: true });
  b.rod([0, 0.17, 0], [0, 1.42, 0], 0.026, {
    color: cel(
      paint((p, n, s) => {
        const v = s[1] > 0 ? 0 : 0;
        void v;
        const streak = Math.sin(p.y * 90 + Math.sin(p.x * 400) * 2) > 0.75;
        return streak ? "#3a5ba0" : "#26407f";
      }),
    ),
    sides: 8,
  });
  // grip wraps
  for (let i = 0; i < 16; i++) {
    b.part(new THREE.TorusGeometry(0.028, 0.0075, 5, 8), i % 2 ? LEATHER : "#7aa3d6", {
      at: [0, 0.32 + i * 0.037, 0],
      rotation: [90, 0, 0],
      flat: true,
    });
  }
  for (const y of [0.29, 0.92]) {
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 8), GOLD, { at: [0, y, 0], rotation: [90, 0, 0], flat: true });
  }
  // hanging ribbon
  b.extrude(
    [
      [0, 0],
      [0.055, 0],
      [0.05, -0.3],
      [0.028, -0.25],
      [0, -0.34, "sharp"],
    ],
    {
      at: [0.03, 0.96, 0],
      x: [0, 0, 1],
      thickness: 0.008,
      color: paint((_p, _n, s) => (s[1] > -0.045 && s[1] < -0.02 ? GOLD : s[1] < -0.2 ? ICE : RIBBON)),
    },
  );

  // ---- Socket / head mount ----
  b.part(new THREE.CylinderGeometry(0.052, 0.046, 0.32, 8), cel(STEEL), { at: [0, HY, 0], flat: true });
  for (const dy of [-0.17, 0.17]) {
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.034, 8), GOLD, { at: [0, HY + dy, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.058, 0.07, 0.03, 8), NAVY, { at: [0, HY + dy * 1.12, 0], flat: true });
  }
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.IcosahedronGeometry(0.036, 0), GLOWC, { at: [0, HY, z * 0.052], flat: true }),
      1.4,
    );
    b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 6), GOLD, { at: [0, HY, z * 0.049], flat: true });
  }
  // icicles hanging under the lower flange
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    shard(
      [Math.sin(a) * 0.058, HY - 0.19, Math.cos(a) * 0.058],
      [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35],
      0.012,
      0.07 + (i % 2) * 0.05,
      i % 2 ? FROST : ICE,
      i % 2 ? 0 : 0.6,
      5,
    );
  }

  // ---- Spear point ----
  b.extrude(
    [
      [0, 0],
      [0.055, 0.05],
      [0.062, 0.18],
      [0, 0.36, "sharp"],
      [-0.062, 0.18],
      [-0.055, 0.05],
    ],
    {
      at: [0, 1.36, 0],
      x: [1, 0, 0],
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 1,
      color: cel(
        paint((_p, n, s) => (Math.abs(n.z) < 0.5 ? FROST : mix(DEEP, ICE, smoothstep(0, 0.34, s[1])))),
      ),
    },
  );
  glow(
    b.rod([0, 1.4, 0.016], [0, 1.66, 0.016], [0.006, 0.002], { color: GLOWC }),
    1,
  );

  // ---- Main blade ----
  const bladeOutline = S([
    [0.0, 0.2],
    [0.16, 0.27],
    [0.3, 0.4],
    [0.46, 0.56, "sharp"],
    [0.56, 0.3],
    [0.6, 0],
    [0.56, -0.3],
    [0.46, -0.52, "sharp"],
    [0.3, -0.34],
    [0.16, -0.24],
    [0.0, -0.2],
  ]);
  const bladePaint = cel(
    paint((p, n, s) => {
      if (Math.abs(n.z) < 0.5) return FROST;
      const t = smoothstep(0.03, 0.4, s[0]);
      const base = mix(DEEP, ICE, t);
      const c = cells(p, 0.1, 3);
      if (c.d2 - c.d1 < 0.011) return mix(base, FROST, 0.85);
      const c2 = cells(p, 0.045, 8);
      if (c2.d2 - c2.d1 < 0.005 && t > 0.4) return mix(base, FROST, 0.5);
      return base;
    }),
  );
  b.extrude(bladeOutline, {
    at: [0, HY, 0],
    x: [1, 0, 0],
    thickness: 0.036,
    bevel: 0.012,
    smoothing: 1,
    color: bladePaint,
  });
  // raised inner plate
  b.extrude(
    S([
      [0.12, 0.15],
      [0.3, 0.28],
      [0.4, 0.1],
      [0.43, -0.05],
      [0.4, -0.2],
      [0.28, -0.26],
      [0.12, -0.16],
    ]),
    {
      at: [0, HY, 0],
      x: [1, 0, 0],
      thickness: 0.046,
      bevel: 0.01,
      smoothing: 1,
      color: cel(
        paint((_p, n, s) => (Math.abs(n.z) < 0.5 ? GOLD : mix("#0f2352", "#1e4a9a", smoothstep(-0.2, 0.2, s[1])))),
      ),
    },
  );
  // glowing runes both sides
  for (const z of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.13, 0.26), "#ffffff", {
        at: [0.19, HY - 0.02, z * 0.0275],
        dir: [0, 0, z],
        axis: "z",
        texture: RUNES,
      }),
      1.2,
    );
    // rivets round the plate
    for (const [u, v] of [
      [0.12, 0.15],
      [0.12, -0.16],
      [0.3, 0.28],
      [0.28, -0.26],
      [0.4, 0.1],
      [0.4, -0.2],
    ]) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, {
        at: [u * K + (u > 0.35 ? -0.01 : 0), HY + v * K * 0.82, z * 0.024],
        flat: true,
      });
    }
  }
  // glowing cutting edge
  glow(
    b.sweep(
      catmull([
        [0.455 * K, HY + 0.555 * K, 0],
        [0.555 * K, HY + 0.3 * K, 0],
        [0.595 * K, HY, 0],
        [0.555 * K, HY - 0.3 * K, 0],
        [0.455 * K, HY - 0.515 * K, 0],
      ]),
      0.011,
      { color: GLOWC, sides: 5 },
    ),
    1.2,
  );
  // crystal growth along the blade root and horns
  shard([0.08, HY + 0.15, 0.02], [0.3, 0.5, 1], 0.016, 0.1, ICE, 0.7);
  shard([0.1, HY - 0.14, 0.02], [0.3, -0.5, 1], 0.014, 0.08, FROST);
  shard([0.08, HY + 0.17, -0.02], [0.3, 0.5, -1], 0.016, 0.1, ICE, 0.7);
  shard([0.1, HY - 0.14, -0.02], [0.3, -0.5, -1], 0.014, 0.08, FROST);
  shard([0.455 * K, HY + 0.55 * K, 0], [0.1, 1, 0], 0.016, 0.09, FROST, 0, 4);
  shard([0.455 * K, HY - 0.5 * K, 0], [0.1, -1, 0], 0.016, 0.09, FROST, 0, 4);
  // edge notches / nicks (small dark chips)
  for (const v of [0.18, -0.12, 0.34]) {
    b.part(new THREE.BoxGeometry(0.012, 0.02, 0.05), NAVY, {
      at: [0.59 * K * (1 - Math.abs(v) * 0.12), HY + v * K, 0],
      flat: true,
    });
  }

  // ---- Back fin / hook ----
  b.extrude(
    S([
      [0.0, 0.14],
      [0.15, 0.17],
      [0.3, 0.12],
      [0.5, 0.0, "sharp"],
      [0.3, -0.1],
      [0.15, -0.15],
      [0.0, -0.12],
    ]),
    {
      at: [0, HY - 0.01, 0],
      x: [-1, 0, 0],
      thickness: 0.034,
      bevel: 0.01,
      smoothing: 1,
      color: cel(
        paint((p, n, s) => {
          if (Math.abs(n.z) < 0.5) return FROST;
          const c = cells(p, 0.07, 5);
          const base = mix(DEEP, ICE, smoothstep(0.02, 0.36, s[0]));
          return c.d2 - c.d1 < 0.01 ? mix(base, FROST, 0.8) : base;
        }),
      ),
    },
  );
  for (let i = 0; i < 4; i++) {
    shard([-0.07 - i * 0.045, HY + 0.025 - i * 0.004, 0.017], [-0.2, 1, 0.6], 0.011, 0.05 + (3 - i) * 0.01, FROST, 0, 4);
    shard([-0.07 - i * 0.045, HY + 0.025 - i * 0.004, -0.017], [-0.2, 1, -0.6], 0.011, 0.05 + (3 - i) * 0.01, ICE, 0.6, 4);
  }

  return b.root;
}
