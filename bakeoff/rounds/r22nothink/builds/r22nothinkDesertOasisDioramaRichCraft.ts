import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mottle, grain, patches, stripes, scales, gradient } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { frame } from "../../../../src/frame";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A whimsical low-poly desert oasis on a round sand plinth: a turquoise pond ringed with rocks and reeds, leaning palms with coconuts, striped tents with lanterns and rugs, and three chunky camels.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

// ---------- palette ----------
const SAND = "#f1cf8a";
const SAND_D = "#e0b66b";
const SAND_L = "#f8e2ab";
const CLIFF = "#c98f55";
const CLIFF_D = "#a8703e";
const WATER = "#37c4c8";
const WATER_D = "#1f9fb4";
const WATER_L = "#8ee8e0";
const GRASS = "#6cc04a";
const GRASS_D = "#3f9a3a";
const TRUNK = "#9a6a3c";
const TRUNK_D = "#6e4526";
const LEAF = "#43b04a";
const LEAF_D = "#2a8a3e";
const LEAF_L = "#8bd45a";
const COCO = "#6b4020";
const ROCK = "#b9a58a";
const ROCK_D = "#8f7c66";
const RED = "#d9503c";
const CREAM = "#fff1d0";
const TEAL = "#2aa6a0";
const GOLD = "#f2b632";
const PURPLE = "#8a52b8";
const PINK = "#f07aa0";
const CAMEL = "#d9a064";
const CAMEL_D = "#b97c46";
const CAMEL_L = "#ecc890";
const WOOL = "#8e3b3a";
const DARK = "#3a2a22";
const WOOD = "#8b5a32";
const WOOD_L = "#b07a46";
const BRASS = "#d8a22c";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "desertOasisDiorama", paintSize: 2048 });
  const rand = rng(7);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);

  // ---------- textures ----------
  const stripeTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff1d0"/>
    <rect x="0" width="8" height="64" fill="#d9503c"/><rect x="16" width="8" height="64" fill="#d9503c"/>
    <rect x="32" width="8" height="64" fill="#d9503c"/><rect x="48" width="8" height="64" fill="#d9503c"/>
    <rect x="8" width="8" height="64" fill="#fff1d0"/>
    </svg>`,
    { size: 64 },
  );
  const rugTex = svg(
    `<svg viewBox="0 0 64 96"><rect width="64" height="96" fill="#8e2f3a"/>
    <rect x="4" y="4" width="56" height="88" fill="none" stroke="#f2b632" stroke-width="3"/>
    <rect x="10" y="10" width="44" height="76" fill="#2aa6a0"/>
    <path d="M32 18 L50 48 L32 78 L14 48 Z" fill="#f2b632"/>
    <path d="M32 28 L42 48 L32 68 L22 48 Z" fill="#8e2f3a"/>
    <circle cx="32" cy="48" r="5" fill="#fff1d0"/>
    <path d="M10 10 l8 8 M54 10 l-8 8 M10 86 l8 -8 M54 86 l-8 -8" stroke="#fff1d0" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );
  const rug2Tex = svg(
    `<svg viewBox="0 0 64 96"><rect width="64" height="96" fill="#5a3a9a"/>
    <rect x="5" y="5" width="54" height="86" fill="none" stroke="#fff1d0" stroke-width="3"/>
    <path d="M0 24 H64 M0 48 H64 M0 72 H64" stroke="#f07aa0" stroke-width="5"/>
    <g fill="#f2b632"><circle cx="16" cy="24" r="4"/><circle cx="32" cy="24" r="4"/><circle cx="48" cy="24" r="4"/>
    <circle cx="16" cy="72" r="4"/><circle cx="32" cy="72" r="4"/><circle cx="48" cy="72" r="4"/></g>
    <path d="M32 36 L42 48 L32 60 L22 48 Z" fill="#fff1d0"/>
    </svg>`,
    { size: 192 },
  );
  const leafTex = svg(
    `<svg viewBox="0 0 32 96"><path d="M16 0 C 30 30 30 70 16 96 C 2 70 2 30 16 0 Z" fill="#ffffff"/>
    <path d="M16 6 V92" stroke="#bbbbbb" stroke-width="3"/>
    <path d="M16 20 L6 34 M16 36 L5 52 M16 52 L6 68 M16 20 L26 34 M16 36 L27 52 M16 52 L26 68" stroke="#cccccc" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const reedTex = svg(
    `<svg viewBox="0 0 16 64"><path d="M8 0 C 12 20 11 44 9 64 L 6 64 C 5 44 4 20 8 0 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const grassTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M4 32 L9 4 L13 32 Z M12 32 L18 0 L22 32 Z M20 32 L27 8 L30 32 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const flowerTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="8" r="5" fill="#f07aa0"/><circle cx="8" cy="14" r="5" fill="#f07aa0"/>
    <circle cx="24" cy="14" r="5" fill="#f07aa0"/><circle cx="12" cy="22" r="5" fill="#f07aa0"/><circle cx="20" cy="22" r="5" fill="#f07aa0"/>
    <circle cx="16" cy="15" r="4" fill="#f2b632"/><path d="M16 26 V32" stroke="#3f9a3a" stroke-width="3"/></svg>`,
    { size: 64 },
  );
  const rippleTex = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round">
    <path d="M6 14 q6 -5 12 0 t12 0"/><path d="M30 40 q6 -5 12 0 t12 0"/><path d="M8 54 q5 -4 10 0 t10 0"/>
    <path d="M34 12 q5 -4 10 0 t10 0"/></g></svg>`,
    { size: 128 },
  );
  const lilyTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 16 L28 10 A 14 14 0 1 1 16 2 Z" fill="#ffffff" transform="rotate(25 16 16)"/></svg>`,
    { size: 64 },
  );
  const bannerTex = svg(
    `<svg viewBox="0 0 24 32"><path d="M0 0 H24 V32 L12 24 L0 32 Z" fill="#ffffff"/>
    <circle cx="12" cy="10" r="4" fill="#f2b632"/></svg>`,
    { size: 64 },
  );

  // ---------- plinth ----------
  const R = 1.35;
  b.lathe(
    [
      [0, 0],
      [R * 0.98, 0],
      [R * 1.02, 0.1],
      [R * 1.0, 0.2],
      [R * 0.97, 0.26],
      [0, 0.26],
    ],
    {
      at: [0, -0.002, 0],
      segments: 14,
      color: patches(CLIFF, [CLIFF_D, "#b87a46", "#d9a064"], { size: 0.28, gap: 0.03, seed: 3 }),
    },
  );
  // strata bands on the plinth wall
  b.rod([0, 0.1, 0], [0, 0.1, 0.001], R * 1.01, CLIFF_D, { sides: 14, caps: "flat" });
  // sand top
  b.lathe(
    [
      [0, 0.26],
      [R * 0.97, 0.26],
      [R * 0.95, 0.3],
      [R * 0.6, 0.34],
      [0, 0.34],
    ],
    { at: [0, 0, 0], segments: 14, color: mottle(SAND, SAND_D, { size: 0.45, contrast: 0.6, seed: 2 }) },
  );
  const TOP = 0.34;

  // dune ridges (low-poly mounds) on the sand
  const dunes: [number, number, number, number, number][] = [
    [-0.9, -0.55, 0.42, 0.1, 0.3],
    [0.95, -0.7, 0.38, 0.09, 0.2],
    [-0.2, -1.0, 0.5, 0.08, 0.4],
    [1.05, 0.55, 0.3, 0.07, 0.3],
    [-1.0, 0.55, 0.3, 0.07, 0.5],
  ];
  for (const [x, z, r, h, rot] of dunes) {
    b.part(sph(r, 7, 4), mottle(SAND_L, SAND, { size: 0.3, seed: 5 }), {
      at: [x, TOP - h * 0.35, z],
      scale: [1.6, h / r, 1],
      rotation: [0, rot * 180, 0],
    });
  }
  // wind ripples on sand
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const rr = 1.0 + (i % 2) * 0.1;
    b.rod(
      [Math.cos(a) * rr - 0.12, TOP + 0.003, Math.sin(a) * rr],
      [Math.cos(a) * rr + 0.12, TOP + 0.003, Math.sin(a) * rr + 0.04],
      0.01,
      SAND_D,
      { sides: 4 },
    );
  }

  // ---------- pond ----------
  const PX = -0.1;
  const PZ = 0.05;
  // sunken shore ring (darker wet sand)
  b.lathe(
    [
      [0, TOP - 0.01],
      [0.74, TOP - 0.01],
      [0.76, TOP + 0.012],
      [0, TOP + 0.012],
    ],
    { at: [PX, 0, PZ], segments: 12, color: "#c9a060" },
  );
  b.lathe(
    [
      [0, TOP],
      [0.62, TOP],
      [0.66, TOP + 0.022],
      [0, TOP + 0.022],
    ],
    {
      at: [PX, 0, PZ],
      segments: 12,
      color: paintWater(),
    },
  );
  function paintWater() {
    return gradient(WATER_L, WATER_D, [PX, TOP, PZ + 0.62], [PX, TOP, PZ - 0.6]);
  }
  // water ripple card decal
  b.cards([frame([PX - 0.05, TOP + 0.026, PZ + 0.02], [0, 1, 0])], rippleTex, {
    size: 0.9,
    lean: 90,
    flow: [0, 0, 1],
    mirror: true,
    color: WATER_L,
    sink: 0,
  });
  // lily pads
  const pads: [number, number, number][] = [
    [-0.25, 0.25, 0.1],
    [0.15, -0.2, 0.08],
    [-0.4, -0.15, 0.07],
    [0.2, 0.3, 0.06],
  ];
  pads.forEach(([x, z, s], i) => {
    b.cards([frame([PX + x, TOP + 0.03, PZ + z], [0, 1, 0])], lilyTex, {
      size: s * 2,
      lean: 90,
      flow: [Math.cos(i), 0, Math.sin(i)],
      mirror: true,
      color: i % 2 ? GRASS : GRASS_D,
      sink: 0,
    });
    if (i % 2 === 0)
      b.stick(sph(0.025, 5, 3), PINK, frame([PX + x + 0.02, TOP + 0.04, PZ + z], [0, 1, 0]));
  });
  // shore rocks
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand() * 0.2;
    const rr = 0.68 + rand() * 0.06;
    const s = 0.06 + rand() * 0.06;
    const px = PX + Math.cos(a) * rr * 1.02;
    const pz = PZ + Math.sin(a) * rr * 0.98;
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 3 ? ROCK : ROCK_D, {
      at: [px, TOP + s * 0.35, pz],
      scale: [1.2, 0.75, 1],
      rotation: [rand() * 40, rand() * 360, rand() * 40],
    });
  }
  // grass tufts around pond
  const tuftFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.72 + rand() * 0.22;
    tuftFrames.push(frame([PX + Math.cos(a) * rr, TOP + 0.005, PZ + Math.sin(a) * rr], [0, 1, 0]));
  }
  b.cards(tuftFrames, grassTex, {
    size: [0.12, 0.14],
    lean: 10,
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(11),
    color: GRASS,
  });
  // grass patch ring (green meadow disc) around pond
  b.lathe(
    [
      [0.7, TOP],
      [0.98, TOP],
      [0.96, TOP + 0.012],
      [0.72, TOP + 0.016],
    ],
    {
      at: [PX, 0, PZ],
      segments: 12,
      color: mottle(GRASS, GRASS_D, { size: 0.18, seed: 9 }),
    },
  );
  // reeds & cattails
  const reedSpots: [number, number][] = [
    [0.55, 0.55],
    [0.62, 0.42],
    [0.5, 0.65],
    [-0.65, -0.45],
    [-0.7, -0.35],
    [-0.5, -0.62],
  ];
  const reedFrames = reedSpots.flatMap(([x, z]) =>
    [0, 1, 2].map((k) => frame([PX + x + k * 0.03, TOP + 0.01, PZ + z - k * 0.02], [0.05 * (k - 1), 1, 0.05])),
  );
  b.cards(reedFrames, reedTex, { size: [0.05, 0.4], lean: 8, cross: true, vary: 0.35, spin: 180, rng: rng(5), color: GRASS_D });
  for (const [x, z] of reedSpots.slice(0, 4)) {
    b.rod([PX + x, TOP, PZ + z], [PX + x, TOP + 0.34, PZ + z], 0.008, GRASS_D, { sides: 4 });
    b.capsule([PX + x, TOP + 0.26, PZ + z], [PX + x, TOP + 0.36, PZ + z], 0.018, COCO, { sides: 5 });
  }

  // ---------- palm trees ----------
  function palm(x: number, z: number, h: number, lean: [number, number], seed: number) {
    const r = rng(seed);
    const base: [number, number, number] = [x, TOP - 0.01, z];
    const top: [number, number, number] = [x + lean[0] * h, TOP + h, z + lean[1] * h];
    const mid: [number, number, number] = [x + lean[0] * h * 0.2, TOP + h * 0.5, z + lean[1] * h * 0.2];
    const trunkPath = catmull([base, mid, top]);
    // segmented trunk: stacked tilted rings along the path
    b.sweep(trunkPath, [0.075, 0.045], {
      color: grain(TRUNK, TRUNK_D, { size: 0.03, axis: "y", seed: seed }),
      sides: 6,
      caps: "flat",
      detail: 0.8,
    });
    // ring bands
    const n = 9;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const p = trunkPath.at(t);
      const rad = 0.075 - 0.03 * t;
      b.part(new THREE.TorusGeometry(rad * 1.02, 0.01, 4, 6), i % 2 ? TRUNK_D : TRUNK, {
        at: p,
        dir: trunkPath.tangentAt(t),
        axis: "z",
      });
    }
    // root flare
    b.part(cone(0.12, 0.12, 6), TRUNK_D, { at: [base[0], TOP + 0.04, base[2]] });
    // crown
    b.part(sph(0.075, 6, 4), TRUNK_D, { at: [top[0], top[1] + 0.02, top[2]] });
    // fronds: sweeps arching out
    const fronds = 9;
    for (let i = 0; i < fronds; i++) {
      const a = (i / fronds) * Math.PI * 2 + r() * 0.3;
      const len = 0.55 + r() * 0.15;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const p0: [number, number, number] = [top[0], top[1] + 0.04, top[2]];
      const p1: [number, number, number] = [top[0] + dx * len * 0.45, top[1] + 0.2, top[2] + dz * len * 0.45];
      const p2: [number, number, number] = [top[0] + dx * len * 0.9, top[1] + 0.1, top[2] + dz * len * 0.9];
      const p3: [number, number, number] = [top[0] + dx * len * 1.15, top[1] - 0.2, top[2] + dz * len * 1.15];
      const fp = catmull([p0, p1, p2, p3]);
      b.sweep(fp, [0.022, 0.006], { color: i % 2 ? LEAF_D : "#4a9a3a", sides: 4, caps: "point" });
      // leaflet cards along the frond
      const fr = [];
      for (let k = 1; k <= 8; k++) {
        const t = k / 9;
        const pt = fp.at(t);
        const tg = fp.tangentAt(t);
        // card growing sideways (perpendicular to tangent, horizontal)
        const side = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
        fr.push(frame(pt, [side.x, -0.15, side.z]));
        fr.push(frame(pt, [-side.x, -0.15, -side.z]));
      }
      b.cards(fr, leafTex, {
        size: [0.1 * (1.1 - 0.0), 0.2],
        lean: 55,
        flow: (_f, k) => [0.0 + (k % 2 ? 0.1 : -0.1), -0.5, 0.0],
        bend: 20,
        color: i % 3 === 0 ? LEAF_L : LEAF,
        sink: 0.05,
      });
    }
    // coconuts + dates
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      b.part(sph(0.05, 6, 4), COCO, { at: [top[0] + Math.cos(a) * 0.07, top[1] - 0.06, top[2] + Math.sin(a) * 0.07] });
    }
    // little bright fruit bunch
    b.part(sph(0.03, 5, 3), GOLD, { at: [top[0] + 0.02, top[1] - 0.13, top[2] - 0.04] });
    b.part(sph(0.03, 5, 3), GOLD, { at: [top[0] - 0.03, top[1] - 0.12, top[2] + 0.02] });
  }
  palm(-0.85, 0.5, 1.15, [0.18, 0.05], 21);
  palm(-0.55, -0.55, 1.0, [0.12, 0.14], 22);
  palm(0.7, 0.75, 0.82, [-0.2, -0.1], 23);
  palm(0.05, 0.85, 0.5, [0.1, 0.3], 24);

  // ---------- tents ----------
  function tent(x: number, z: number, rotY: number, s: number, accent: string, flagColor: string) {
    const yaw = rotY;
    const T = (lx: number, ly: number, lz: number): [number, number, number] => {
      const c = Math.cos(yaw);
      const sn = Math.sin(yaw);
      return [x + (lx * c + lz * sn) * s, TOP + ly * s, z + (-lx * sn + lz * c) * s];
    };
    const w = 0.5;
    const d = 0.55;
    const hWall = 0.2;
    const hRidge = 0.42;
    // floor rug
    // walls (box) - striped
    b.part(box(w * 2 * s, hWall * s, d * 2 * s), stripeTex, { at: T(0, hWall / 2, 0), rotation: [0, (yaw * 180) / Math.PI, 0], texture: stripeTex });
    // roof: prism via extrude front view (x across, y up), thickness along z
    const roof = b.extrude(
      [
        [-w - 0.06, 0],
        [w + 0.06, 0],
        [0.02, hRidge - hWall],
        [-0.02, hRidge - hWall],
      ],
      {
        at: T(0, hWall, -d - 0.06),
        x: [Math.cos(yaw), 0, -Math.sin(yaw)],
        y: [0, 1, 0],
        thickness: (d * 2 + 0.12) * s,
        color: accent,
      },
    );
    void roof;
    // scale the roof: extrude doesn't scale with s; handled by building with s multiplier below
    // ridge pole
    b.rod(T(0, hRidge + 0.02, -d - 0.12), T(0, hRidge + 0.02, d + 0.12), 0.02 * s, WOOD, { sides: 5 });
    // flag
    b.rod(T(0, hRidge, d + 0.12), T(0, hRidge + 0.22, d + 0.12), 0.01 * s, WOOD_L, { sides: 4 });
    b.part(box(0.16 * s, 0.1 * s, 0.01 * s), flagColor, {
      at: T(0.08, hRidge + 0.17, d + 0.12),
      rotation: [0, (yaw * 180) / Math.PI, 0],
    });
    b.part(sph(0.03 * s, 5, 4), GOLD, { at: T(0, hRidge + 0.23, d + 0.12) });
    // door flap (dark interior + open flaps)
    b.part(box(0.36 * s, 0.17 * s, 0.01 * s), DARK, {
      at: T(0, 0.1, d + 0.003),
      rotation: [0, (yaw * 180) / Math.PI, 0],
    });
    for (const sd of [1, -1]) {
      b.part(box(0.2 * s, 0.19 * s, 0.015 * s), accent, {
        at: T(sd * 0.27, 0.105, d + 0.02),
        rotation: [0, (yaw * 180) / Math.PI + sd * -25, 0],
      });
      b.rod(T(sd * 0.36, 0.01, d + 0.04), T(sd * 0.36, 0.2, d + 0.04), 0.008 * s, GOLD, { sides: 4 });
    }
    // guy ropes and pegs
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const a = T(sx * (w + 0.04), hWall + 0.02, sz * (d * 0.8));
        const bPt = T(sx * (w + 0.3), 0.01, sz * (d * 0.8 + 0.2));
        b.rod(a, bPt, 0.004 * s, CREAM, { sides: 3 });
        b.part(cone(0.012 * s, 0.05 * s, 4), WOOD, { at: [bPt[0], TOP + 0.02 * s, bPt[2]] });
      }
    // pillows & rug in front
    const rugTexure = accent === RED ? rugTex : rug2Tex;
    b.part(new THREE.PlaneGeometry(0.4 * s, 0.6 * s), "#ffffff", {
      at: T(0, 0.006, d + 0.4),
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.sin(yaw), 0, Math.cos(yaw)],
      texture: rugTexure,
    });
    // pillows
    b.part(sph(0.07 * s, 5, 4), PINK, { at: T(-0.35, 0.05, d + 0.55), scale: [1.3, 0.6, 1] });
    b.part(sph(0.06 * s, 5, 4), GOLD, { at: T(0.38, 0.05, d + 0.5), scale: [1.3, 0.6, 1] });
    // lantern on post
    const lp = T(0.5, 0, d + 0.2);
    b.rod([lp[0], TOP, lp[2]], [lp[0], TOP + 0.3 * s, lp[2]], 0.01 * s, WOOD, { sides: 5 });
    b.rod([lp[0], TOP + 0.3 * s, lp[2]], [lp[0] - 0.06 * s * Math.cos(yaw), TOP + 0.3 * s, lp[2] + 0.06 * s * Math.sin(yaw)], 0.008 * s, WOOD, { sides: 4 });
    glow(b.part(cyl(0.025 * s, 0.025 * s, 0.05 * s, 6), "#ffc23a", { at: [lp[0] - 0.06 * s * Math.cos(yaw), TOP + 0.27 * s, lp[2] + 0.06 * s * Math.sin(yaw)] }), 1.4);
  }
  tent(0.7, -0.15, -0.5, 1.0, RED, TEAL);
  tent(-0.15, -0.85, 0.2, 0.8, PURPLE, GOLD);

  // ---------- camels ----------
  function camel(x: number, z: number, yawDeg: number, s: number, kneel: boolean, seed: number) {
    const yaw = (yawDeg * Math.PI) / 180;
    const C = Math.cos(yaw);
    const S = Math.sin(yaw);
    // local (lx right/x, ly up, lz forward) -> world
    const P = (lx: number, ly: number, lz: number): [number, number, number] => [
      x + (lx * C + lz * S) * s,
      TOP + ly * s,
      z + (-lx * S + lz * C) * s,
    ];
    const coat = mottle(CAMEL, CAMEL_D, { size: 0.12, contrast: 0.5, seed });
    const belly = CAMEL_L;
    const legLen = kneel ? 0.18 : 0.62;
    const bodyY = legLen + 0.26;
    // body (loft capsule)
    b.capsule(P(0, bodyY, -0.28), P(0, bodyY, 0.28), [0.26 * s, 0.24 * s], coat, { sides: 8 });
    b.capsule(P(0, bodyY - 0.08, -0.15), P(0, bodyY - 0.08, 0.2), 0.24 * s, belly, { sides: 6 });
    // humps
    b.part(sph(0.17 * s, 6, 4), coat, { at: P(0, bodyY + 0.26, -0.12), scale: [1, 1.25, 1.1] });
    b.part(sph(0.15 * s, 6, 4), coat, { at: P(0, bodyY + 0.25, 0.14), scale: [1, 1.2, 1.1] });
    // saddle blanket
    b.part(box(0.56 * s, 0.03 * s, 0.34 * s), WOOL, { at: P(0, bodyY + 0.08, 0.0) });
    b.part(box(0.58 * s, 0.01 * s, 0.34 * s), GOLD, { at: P(0, bodyY + 0.1, 0.0), scale: [1, 1, 0.5] });
    for (const sd of [1, -1]) {
      b.part(box(0.04 * s, 0.22 * s, 0.34 * s), WOOL, { at: P(sd * 0.27, bodyY - 0.04, 0.0) });
      b.part(box(0.045 * s, 0.03 * s, 0.34 * s), GOLD, { at: P(sd * 0.27, bodyY - 0.14, 0.0) });
      // tassels
      for (let k = 0; k < 4; k++)
        b.part(sph(0.018 * s, 4, 3), k % 2 ? TEAL : PINK, { at: P(sd * 0.28, bodyY - 0.18, -0.13 + k * 0.09) });
    }
    // neck: sweep from chest up
    const neckPath = catmull([P(0, bodyY + 0.05, 0.3), P(0, bodyY + 0.3, 0.44), P(0, bodyY + 0.58, 0.46), P(0, bodyY + 0.74, 0.54)]);
    b.sweep(neckPath, [0.13 * s, 0.07 * s], { color: gradient(CAMEL, CAMEL_L, P(0, bodyY, 0.3), P(0, bodyY + 0.7, 0.5)), sides: 6, caps: "round" });
    // head
    const hc = P(0, bodyY + 0.78, 0.6);
    b.part(sph(0.1 * s, 6, 5), coat, { at: hc, scale: [0.9, 0.95, 1.2] });
    // muzzle
    b.capsule(P(0, bodyY + 0.75, 0.66), P(0, bodyY + 0.72, 0.78), 0.075 * s, CAMEL_L, { sides: 6 });
    b.part(sph(0.025 * s, 4, 3), DARK, { at: P(0.03, bodyY + 0.74, 0.86) });
    b.part(sph(0.025 * s, 4, 3), DARK, { at: P(-0.03, bodyY + 0.74, 0.86) });
    // mouth smile
    b.rod(P(-0.05, bodyY + 0.7, 0.84), P(0.05, bodyY + 0.7, 0.84), 0.006 * s, DARK, { sides: 3 });
    // eyes
    for (const sd of [1, -1]) {
      b.part(sph(0.032 * s, 5, 4), CREAM, { at: P(sd * 0.085, bodyY + 0.8, 0.64) });
      b.part(sph(0.02 * s, 5, 4), DARK, { at: P(sd * 0.1, bodyY + 0.8, 0.665) });
      b.part(sph(0.007 * s, 3, 3), "#ffffff", { at: P(sd * 0.105, bodyY + 0.81, 0.68) });
      // eyelash
      b.rod(P(sd * 0.09, bodyY + 0.835, 0.64), P(sd * 0.11, bodyY + 0.855, 0.66), 0.004 * s, DARK, { sides: 3 });
      // ears
      b.part(cone(0.03 * s, 0.07 * s, 4), CAMEL_D, { at: P(sd * 0.075, bodyY + 0.9, 0.55), rotation: [0, 0, -sd * 25] });
      // nose bump / cheeks
      b.part(sph(0.025 * s, 4, 3), PINK, { at: P(sd * 0.075, bodyY + 0.74, 0.7) });
    }
    // forelock tuft
    b.part(cone(0.04 * s, 0.1 * s, 5), CAMEL_D, { at: P(0, bodyY + 0.9, 0.58), rotation: [-20, 0, 0] });
    // bridle
    b.rod(P(-0.1, bodyY + 0.74, 0.7), P(0.1, bodyY + 0.74, 0.7), 0.01 * s, WOOL, { sides: 4 });
    b.part(sph(0.015 * s, 4, 3), GOLD, { at: P(0.1, bodyY + 0.74, 0.7) });
    // neck tassel collar
    b.part(new THREE.TorusGeometry(0.115 * s, 0.018 * s, 4, 7), TEAL, { at: P(0, bodyY + 0.5, 0.47), rotation: [70, 0, 0] });
    // tail
    b.sweep(catmull([P(0, bodyY + 0.02, -0.5), P(0, bodyY - 0.08, -0.62), P(0, bodyY - 0.28, -0.64)]), [0.025 * s, 0.015 * s], {
      color: CAMEL_D,
      sides: 5,
    });
    b.part(sph(0.04 * s, 5, 3), DARK, { at: P(0, bodyY - 0.32, -0.64), scale: [1, 1.5, 1] });
    // legs
    const legs: [number, number][] = [
      [0.15, 0.2],
      [-0.15, 0.2],
      [0.15, -0.22],
      [-0.15, -0.22],
    ];
    legs.forEach(([lx, lz], i) => {
      if (!kneel) {
        const hipY = bodyY - 0.1;
        const knee = P(lx * 1.05, legLen * 0.5, lz + (i < 2 ? 0.02 : -0.04));
        b.capsule(P(lx, hipY, lz), knee, [0.085 * s, 0.05 * s], coat, { sides: 5 });
        b.capsule(knee, P(lx, 0.04, lz), [0.05 * s, 0.035 * s], CAMEL_D, { sides: 5 });
        b.part(cyl(0.06 * s, 0.065 * s, 0.05 * s, 6), DARK, { at: P(lx, 0.025, lz) });
        b.part(sph(0.045 * s, 5, 3), CAMEL_L, { at: knee });
      } else {
        // folded legs: bent flat on the ground
        b.capsule(P(lx, bodyY - 0.15, lz), P(lx * 1.2, 0.07, lz), [0.09 * s, 0.07 * s], coat, { sides: 5 });
        b.capsule(P(lx * 1.2, 0.07, lz), P(lx * 1.1, 0.06, lz + (i < 2 ? 0.28 : -0.2)), 0.06 * s, CAMEL_D, { sides: 5 });
        b.part(cyl(0.06 * s, 0.06 * s, 0.04 * s, 6), DARK, {
          at: P(lx * 1.1, 0.03, lz + (i < 2 ? 0.32 : -0.24)),
          rotation: [90, 0, 0],
        });
      }
    });
    return { P, bodyY };
  }

  // standing camel by the tent, saddle bags
  const c1 = camel(0.55, 0.5, -35, 0.95, false, 31);
  // saddle bags
  for (const sd of [1, -1]) {
    b.part(box(0.1 * 0.95, 0.2 * 0.95, 0.22 * 0.95), "#7a3a2a", { at: c1.P(sd * 0.34, c1.bodyY - 0.14, 0.0), rotation: [0, -35 * 1, 0] });
  }
  // kneeling camel in the shade
  camel(0.15, -0.4, 150, 0.8, true, 32);
  // camel calf (whimsical small, standing, big head)
  camel(-0.4, 0.95, 35, 0.55, false, 33);

  // ---------- details: crates, pots, campfire ----------
  // water jars
  const jar = (x: number, z: number, s: number, color: string) => {
    b.lathe(
      [
        [0, 0],
        [0.07 * s, 0],
        [0.1 * s, 0.09 * s],
        [0.08 * s, 0.17 * s],
        [0.045 * s, 0.2 * s],
        [0.05 * s, 0.23 * s],
        [0.04 * s, 0.23 * s],
        [0, 0.2 * s],
      ],
      { at: [x, TOP, z], segments: 8, color },
    );
    b.rod([x, TOP + 0.12 * s, z], [x, TOP + 0.125 * s, z], 0.102 * s, GOLD, { sides: 8, caps: "flat" });
  };
  jar(1.0, 0.25, 1, "#c76a3c");
  jar(1.07, 0.1, 0.8, "#b5532f");
  jar(0.95, 0.4, 0.7, "#d98a4c");
  // crates
  b.part(box(0.18, 0.14, 0.18), WOOD_L, { at: [-1.0, TOP + 0.07, -0.1], rotation: [0, 20, 0] });
  b.part(box(0.19, 0.02, 0.19), WOOD, { at: [-1.0, TOP + 0.15, -0.1], rotation: [0, 20, 0] });
  b.part(box(0.13, 0.11, 0.13), WOOD_L, { at: [-0.98, TOP + 0.2, -0.1], rotation: [0, 50, 0] });
  b.part(box(0.15, 0.12, 0.15), WOOD_L, { at: [-1.0, TOP + 0.06, 0.12], rotation: [0, -15, 0] });
  // crate straps
  b.part(box(0.185, 0.145, 0.03), WOOD, { at: [-1.0, TOP + 0.07, -0.1], rotation: [0, 20, 0] });
  // barrels
  b.part(cyl(0.07, 0.07, 0.15, 7), WOOD, { at: [-1.1, TOP + 0.075, 0.3] });
  b.part(cyl(0.072, 0.072, 0.02, 7), BRASS, { at: [-1.1, TOP + 0.04, 0.3] });
  b.part(cyl(0.072, 0.072, 0.02, 7), BRASS, { at: [-1.1, TOP + 0.11, 0.3] });
  // campfire with glow
  const fx = 0.28;
  const fz = -0.65;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(sph(0.03, 4, 3), ROCK_D, { at: [fx + Math.cos(a) * 0.09, TOP + 0.015, fz + Math.sin(a) * 0.09], scale: [1, 0.7, 1] });
  }
  b.rod([fx - 0.07, TOP + 0.025, fz - 0.03], [fx + 0.07, TOP + 0.04, fz + 0.03], 0.016, WOOD, { sides: 5 });
  b.rod([fx - 0.05, TOP + 0.04, fz + 0.05], [fx + 0.05, TOP + 0.025, fz - 0.05], 0.016, TRUNK_D, { sides: 5 });
  glow(b.part(cone(0.05, 0.14, 5), "#ff8a2a", { at: [fx, TOP + 0.1, fz] }), 1.6);
  glow(b.part(cone(0.03, 0.1, 5), "#ffd23a", { at: [fx, TOP + 0.09, fz] }), 1.8);
  // pennant bunting on a rope between palm and tent pole
  const bun = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const px = -0.4 + t * 0.9;
    const py = TOP + 0.62 - Math.sin(t * Math.PI) * -0.06 + 0.0;
    bun.push(frame([px, py - 0.005, -0.2 - t * 0.0], [0, 1, 0]));
  }
  b.cards(bun, bannerTex, {
    size: [0.06, 0.08],
    lean: 180,
    flow: [0, 0, 1],
    color: GOLD,
    sink: 0,
  });
  b.rod([-0.4, TOP + 0.62, -0.2], [0.5, TOP + 0.62, -0.2], 0.004, CREAM, { sides: 3 });
  // small wildflowers
  const flw = [];
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.75 + rand() * 0.2;
    flw.push(frame([PX + Math.cos(a) * rr, TOP + 0.02, PZ + Math.sin(a) * rr], [0, 1, 0]));
  }
  b.cards(flw, flowerTex, { size: 0.09, lean: 0, cross: true, vary: 0.3, spin: 180, rng: rng(13) });
  // cactus
  b.capsule([1.05, TOP - 0.01, -0.35], [1.05, TOP + 0.3, -0.35], 0.045, GRASS_D, { sides: 6 });
  b.capsule([1.05, TOP + 0.14, -0.35], [1.14, TOP + 0.14, -0.35], 0.03, GRASS_D, { sides: 5 });
  b.capsule([1.14, TOP + 0.14, -0.35], [1.14, TOP + 0.25, -0.35], 0.03, GRASS_D, { sides: 5 });
  b.part(sph(0.03, 5, 3), PINK, { at: [1.05, TOP + 0.33, -0.35] });
  // skull / bones of whimsy: tiny bleached rock cairn
  for (let i = 0; i < 3; i++)
    b.part(new THREE.DodecahedronGeometry(0.06 - i * 0.015, 0), i % 2 ? ROCK : ROCK_D, {
      at: [-1.05, TOP + 0.04 + i * 0.07, -0.55],
      rotation: [10 * i, 40 * i, 0],
    });

  return b.root;
}

// satisfy imports used only for style
void scales;
void stripes;
