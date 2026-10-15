import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { paint, noise } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { frame } from "../../../../src/frame";
import { cel, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A dragon-hoard prop group: ornate iron-banded chest spilling coins, a spiked crown, jewelled goblets, glowing gems, a vase, a potion flask and a heaped gold mound, in a high-contrast League of Legends style with cel-shaded paints and glowing magic gems.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const GOLD = cel("#ffc928", "#d9821a");
const GOLD_LIGHT = cel("#fff08a", "#f2b02c");
const GOLD_DEEP = cel("#e8a315", "#b0601a");
const WOOD = cel("#8a4a2a", "#4d2440");
const WOOD_DARK = cel("#6a3524", "#3a1a38");
const IRON = cel("#5b6a86", "#2e3558");
const IRON_DARK = cel("#3d4663", "#1d2240");
const PURPLE = cel("#7a3fd1", "#40208f");
const PURPLE_LIGHT = cel("#a870ff", "#6a3ec8");
const VELVET = cel("#c2224f", "#6e1250");
const STONE = cel("#6c5f86", "#3a3262");
const STONE_LIGHT = cel("#8a7ba3", "#4c4378");
const CLAY = cel("#2f9fb5", "#1d5584");
const CLAY_LIGHT = cel("#6fe0e6", "#2f9fb5");
const SILVER = cel("#d8e6f5", "#7f90c4");
const GLASS = cel("#ff5fa8", "#b0206e");

// flat colours for glow gems (paints cannot glow)
const GEM_CYAN = "#34f0ff";
const GEM_PINK = "#ff4fb0";
const GEM_GREEN = "#6bff8a";
const GEM_AMBER = "#ffb02e";
const GEM_VIOLET = "#a86bff";
const GEM_RED = "#ff3b54";
const GEM_COL = [GEM_CYAN, GEM_PINK, GEM_GREEN, GEM_AMBER, GEM_VIOLET, GEM_RED];

// ---------------------------------------------------------------- textures
const COIN_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#ffd54a"/>
    <circle cx="32" cy="32" r="30" fill="none" stroke="#c98314" stroke-width="5"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#fff3a6" stroke-width="3"/>
    <path d="M32 14 L38 28 L52 30 L41 39 L45 53 L32 45 L19 53 L23 39 L12 30 L26 28 Z" fill="#c98314"/>
    <path d="M32 19 L36 29 L45 30 L38 36 L40 45 L32 40 L24 45 L26 36 L19 30 L28 29 Z" fill="#fff3a6"/>
  </svg>`,
  { size: 128 },
);

const CHEST_FRONT = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="62" height="62" rx="4" fill="#6c2f6a" opacity="0"/>
    <path d="M32 4 L50 16 L50 38 L32 60 L14 38 L14 16 Z" fill="#ffc928" stroke="#7a3a10" stroke-width="3"/>
    <path d="M32 11 L44 19 L44 36 L32 51 L20 36 L20 19 Z" fill="#5b2ab8" stroke="#2a1070" stroke-width="2"/>
    <path d="M32 17 L38 24 L32 44 L26 24 Z" fill="#34f0ff"/>
    <path d="M32 17 L35 24 L32 30 L29 24 Z" fill="#d8ffff"/>
    <circle cx="32" cy="50" r="3" fill="#fff08a"/>
  </svg>`,
  { size: 192 },
);

const RUNE_BAND = svg(
  `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="16" fill="#e8a315"/>
    <path d="M4 8 L10 2 L16 8 L10 14 Z M24 2 L24 14 M24 8 L32 2 M24 8 L32 14 M42 2 L50 14 M50 2 L42 14 M60 8 L66 2 L72 8 L66 14 Z M82 2 L82 14 M82 2 L90 2 M82 8 L88 8 M98 14 L104 2 L110 14 M116 2 L116 14 L124 14" fill="none" stroke="#7a3a10" stroke-width="2.4"/>
  </svg>`,
  { size: 512 },
);

const SCROLL_TEX = svg(
  `<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" fill="#f4dfa8"/>
    <rect x="2" y="2" width="44" height="28" fill="none" stroke="#a8662a" stroke-width="1.6"/>
    <path d="M8 9 H40 M8 14 H34 M8 19 H38 M8 24 H26" stroke="#7a3a10" stroke-width="1.6"/>
    <circle cx="38" cy="24" r="3" fill="#c2224f"/>
  </svg>`,
  { size: 192 },
);

const SPARKLE = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13 Z" fill="#ffffff"/>
    <circle cx="16" cy="16" r="3" fill="#fff8c0"/>
  </svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------- paints
const woodPlank = paint((p, n, s) => {
  const base = n.y > 0.55 ? WOOD : WOOD_DARK;
  const seam = Math.abs(((p.y * 9) % 1) - 0.5) > 0.47;
  const knot = noise(p, 0.06, 4) > 0.8;
  if (seam) return INK;
  return knot ? WOOD_DARK : s[0] > 99 ? base : base;
});
const goldWear = paint((p, n) => {
  const w = noise(p, 0.05, 2);
  if (w > 0.78) return GOLD_LIGHT;
  if (w < 0.18) return GOLD_DEEP;
  return n.y > 0.4 ? GOLD : GOLD_DEEP;
});
const moundGold = paint((p, n) => {
  const w = noise(p, 0.07, 9);
  if (w > 0.7) return GOLD_LIGHT;
  if (w < 0.3) return GOLD_DEEP;
  return n.y > 0.2 ? GOLD : GOLD_DEEP;
});
const ironRivet = inkLines(IRON, { levels: [0.5, -0.5], axis: [0, 1, 0], width: 0.05 });
const stoneBase = paint((p, n) => {
  const c = noise(p, 0.12, 3);
  const base = c > 0.5 ? STONE : STONE_LIGHT;
  return n.y > 0.5 ? base : STONE;
});
const claySwirl = paint((p, n) => {
  const ring = Math.abs(Math.sin(p.y * 38)) > 0.93;
  if (ring) return GOLD;
  return n.y > 0.1 ? CLAY_LIGHT : CLAY;
});

// ---------------------------------------------------------------- build
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const R = rng(11);

  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ------------------------------------------------ rocky floor base
  b.lathe(
    [
      [0, 0],
      [1.38, 0],
      [1.48, 0.03],
      [1.44, 0.08],
      [1.3, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 14, color: stoneBase, smoothing: 0 },
  );
  // rim stones
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 1.38 + R() * 0.06;
    b.part(sphere(0.1 + R() * 0.05, 6, 4), i % 2 ? STONE_LIGHT : STONE, {
      at: [Math.cos(a) * r, 0.04, Math.sin(a) * r],
      scale: [1.3, 0.6, 1],
      rotation: [0, a * 57, 0],
    });
  }

  // ------------------------------------------------ chest (back-left of the group)
  const CX = -0.2;
  const CZ = -0.35;
  const cy = 0.1;
  // body base
  b.part(box(1.0, 0.42, 0.62), woodPlank, { at: [CX, cy + 0.21, CZ] });
  // plank seams are in paint; add lower trim
  b.part(box(1.04, 0.06, 0.66), WOOD_DARK, { at: [CX, cy + 0.03, CZ] });
  // iron corner posts
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.part(box(0.07, 0.46, 0.07), ironRivet, { at: [CX + sx * 0.5, cy + 0.23, CZ + sz * 0.31] });
      b.part(sphere(0.045, 6, 4), GOLD, { at: [CX + sx * 0.5, cy + 0.47, CZ + sz * 0.31] });
    }
  // iron bands wrapping body
  for (const bx of [-0.3, 0.3]) {
    b.part(box(0.1, 0.43, 0.65), IRON, { at: [CX + bx, cy + 0.215, CZ] });
    for (const bz of [-1, 1])
      for (const by of [0.1, 0.33])
        b.part(sphere(0.016, 5, 4), GOLD_LIGHT, { at: [CX + bx, cy + by, CZ + bz * 0.332] });
  }
  // front golden plate with emblem
  b.part(box(0.34, 0.3, 0.02), goldWear, { at: [CX, cy + 0.24, CZ + 0.32] });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
    at: [CX, cy + 0.24, CZ + 0.332],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEST_FRONT,
  });
  // glowing lock gem
  glow(b.part(new THREE.OctahedronGeometry(0.04), GEM_CYAN, { at: [CX, cy + 0.3, CZ + 0.345], scale: [1, 1.3, 0.8] }), 1.4);
  // rune band on chest base trim
  b.part(new THREE.PlaneGeometry(0.9, 0.055), "#ffffff", {
    at: [CX, cy + 0.07, CZ + 0.332],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_BAND,
  });

  // lid: open, hinged at back, tilted ~ 100 deg
  const hingeY = cy + 0.42;
  const hingeZ = CZ - 0.31;
  const lidRot = -105; // degrees around X, opening upward
  const lidGroupPoint = (y: number, z: number): [number, number, number] => {
    const a = (lidRot * Math.PI) / 180;
    // local: y up along lid-thickness, z forward. rotate about X.
    const ry = y * Math.cos(a) - z * Math.sin(a);
    const rz = y * Math.sin(a) + z * Math.cos(a);
    return [0, hingeY + ry, hingeZ + rz];
  };
  const lid = (lx: number, ly: number, lz: number): [number, number, number] => {
    const p = lidGroupPoint(ly, lz);
    return [CX + lx, p[1], p[2]];
  };
  // lid slab (flat panel) and curved top as extrude
  b.part(box(1.0, 0.06, 0.62), woodPlank, { at: lid(0, 0.03, 0.31), rotation: [lidRot, 0, 0] });
  // lid dome arch (half-cylinder look) built as cylinder segments
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 1.0, 8, 1, false, 0, Math.PI), woodPlank, {
    at: lid(0, 0.06, 0.31),
    rotation: [lidRot, 0, 90],
  });
  // lid iron bands
  for (const bx of [-0.3, 0.3])
    b.part(new THREE.CylinderGeometry(0.325, 0.325, 0.1, 8, 1, false, 0, Math.PI), IRON, {
      at: lid(bx, 0.06, 0.31),
      rotation: [lidRot, 0, 90],
    });
  // lid padded interior (velvet)
  b.part(box(0.9, 0.02, 0.52), VELVET, { at: lid(0, -0.005, 0.31), rotation: [lidRot, 0, 0] });
  // lid gold stud row
  for (let i = 0; i < 5; i++)
    b.part(sphere(0.022, 6, 4), GOLD_LIGHT, { at: lid(-0.4 + i * 0.2, -0.015, 0.05), rotation: [lidRot, 0, 0] });
  // hinges
  for (const hx of [-0.3, 0.3]) b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6), IRON_DARK, { at: [CX + hx, hingeY + 0.01, hingeZ], rotation: [0, 0, 90] });

  // chest interior: gold fill heaped
  b.part(box(0.88, 0.02, 0.5), VELVET, { at: [CX, cy + 0.41, CZ] });
  b.part(sphere(0.5, 10, 6), moundGold, { at: [CX, cy + 0.42, CZ], scale: [0.88, 0.38, 0.5] });

  // chest interior coin/gem heap top detail via coin discs
  const coinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10);
  const coinMats: THREE.BufferGeometry[] = [];
  const addCoin = (x: number, y: number, z: number, rx: number, rz: number, ry: number) => {
    const g = coinGeo.clone();
    g.rotateX(rx);
    g.rotateZ(rz);
    g.rotateY(ry);
    g.translate(x, y, z);
    coinMats.push(g);
  };
  // coins heaped in chest
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R());
    const x = CX + Math.cos(a) * rr * 0.4;
    const z = CZ + Math.sin(a) * rr * 0.21;
    const y = cy + 0.42 + Math.max(0, 0.2 - (rr * rr) * 0.2) + R() * 0.02;
    addCoin(x, y, z, (R() - 0.5) * 0.9, (R() - 0.5) * 0.9, R() * 6);
  }

  // ------------------------------------------------ big gold mound front (coin spill)
  const MX = 0.15;
  const MZ = 0.35;
  b.part(sphere(0.78, 12, 8), moundGold, { at: [MX, 0.07, MZ], scale: [1.1, 0.46, 0.8] });
  b.part(sphere(0.45, 10, 7), moundGold, { at: [MX + 0.55, 0.06, MZ + 0.05], scale: [1, 0.5, 0.9] });
  b.part(sphere(0.4, 10, 7), moundGold, { at: [MX - 0.62, 0.06, MZ - 0.1], scale: [1, 0.5, 0.9] });
  // coin spill trail from the chest down to the mound
  b.part(sphere(0.3, 8, 6), moundGold, { at: [CX + 0.1, 0.1, CZ + 0.5], scale: [1.5, 0.3, 0.8] });

  // scatter coins over the mound surface
  const moundSurface = b.surface(
    b.part(sphere(0.8, 12, 8), moundGold, { at: [MX, 0.08, MZ], scale: [1.12, 0.46, 0.82] }),
  );
  const moundHits = moundSurface.scatter(150, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > 0.1 });
  for (const h of moundHits) {
    const g = coinGeo.clone();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6);
    const mtx = new THREE.Matrix4();
    const up = new THREE.Vector3(h.n.x, Math.max(h.n.y, 0.2), h.n.z).normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    mtx.compose(
      new THREE.Vector3(h.at.x, h.at.y + 0.006, h.at.z),
      align.multiply(q),
      new THREE.Vector3(0.8 + R() * 0.6, 1, 0.8 + R() * 0.6),
    );
    g.applyMatrix4(mtx);
    coinMats.push(g);
  }
  // a few coins standing on edge
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.2 + R() * 0.6;
    const x = MX + Math.cos(a) * r * 1.0;
    const z = MZ + Math.sin(a) * r * 0.7;
    const y = Math.max(0.0, 0.34 - r * 0.38) + 0.09;
    const g = coinGeo.clone();
    g.rotateX(Math.PI / 2 - 0.25 + R() * 0.2);
    g.rotateY(R() * 6);
    g.translate(x, y, z);
    coinMats.push(g);
  }

  // merge all coins into one textured part: use texture on flat caps
  // (CylinderGeometry has uv on caps; texture is shown on both caps)
  const { mergeGeometries } = require("three/addons/utils/BufferGeometryUtils.js") as typeof import("three/addons/utils/BufferGeometryUtils.js");
  b.part(mergeGeometries(coinMats), "#ffffff", { at: [0, 0, 0], texture: COIN_TEX });

  // ------------------------------------------------ crown (centre-front on top of the mound)
  const KX = 0.1;
  const KZ = 0.4;
  const KY = 0.36;
  const crownBand = b.lathe(
    [
      [0.17, 0],
      [0.19, 0.0],
      [0.205, 0.07],
      [0.19, 0.11],
      [0.17, 0.11],
      [0.185, 0.07],
    ],
    { at: [KX, KY, KZ], segments: 12, color: goldWear, smoothing: 0 },
  );
  void crownBand;
  // velvet cap seen inside
  b.lathe(
    [
      [0, 0.04],
      [0.17, 0.04],
      [0.17, 0.09],
      [0.11, 0.17],
      [0, 0.2],
    ],
    { at: [KX, KY, KZ], segments: 12, color: VELVET, smoothing: 1 },
  );
  // crown spikes with gems
  const spikeCount = 7;
  for (let i = 0; i < spikeCount; i++) {
    const a = (i / spikeCount) * Math.PI * 2;
    const big = i % 2 === 0;
    const bx = KX + Math.cos(a) * 0.19;
    const bz = KZ + Math.sin(a) * 0.19;
    const h = big ? 0.2 : 0.13;
    b.spike([bx, KY + 0.08, bz], [0, 1, 0], h, 0.034, { color: GOLD, sides: 4 });
    const gem = GEM_COL[i % GEM_COL.length];
    glow(b.part(new THREE.OctahedronGeometry(big ? 0.032 : 0.024), gem, { at: [bx, KY + 0.08 + h + 0.025, bz], scale: [1, 1.4, 1] }), 1.3);
    // ball finial
    b.part(sphere(0.016, 5, 4), GOLD_LIGHT, { at: [bx, KY + 0.065, bz] });
  }
  // gem studs round the band
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.12;
    const gem = GEM_COL[(i * 2 + 1) % GEM_COL.length];
    glow(
      b.part(new THREE.OctahedronGeometry(0.018), gem, { at: [KX + Math.cos(a) * 0.205, KY + 0.045, KZ + Math.sin(a) * 0.205], scale: [1, 1.2, 1] }),
      1.2,
    );
  }
  // large front gem on crown
  glow(b.part(new THREE.OctahedronGeometry(0.05), GEM_PINK, { at: [KX, KY + 0.06, KZ + 0.215], scale: [1, 1.4, 0.7] }), 1.5);

  // ------------------------------------------------ goblets
  const goblet = (x: number, z: number, y0: number, h: number, bowl: ReturnType<typeof cel> | any, gemColor: string, tip = 0) => {
    // base
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.075, 0.015],
        [0.05, 0.035],
        [0.02, 0.05],
        [0.02, h * 0.5],
        [0.032, h * 0.55],
        [0, h * 0.55],
      ],
      { at: [x, y0, z], segments: 10, color: GOLD, smoothing: 0, rotation: [tip, 0, 0] } as any,
    );
    // cup
    b.lathe(
      [
        [0, h * 0.52],
        [0.045, h * 0.55],
        [0.1, h * 0.72],
        [0.115, h * 0.92],
        [0.12, h],
        [0.105, h],
        [0.098, h * 0.92],
        [0.085, h * 0.74],
        [0, h * 0.62],
      ],
      { at: [x, y0, z], segments: 12, color: bowl, smoothing: 0 },
    );
    // rim band
    b.lathe(
      [
        [0.1, h * 0.93],
        [0.125, h * 0.93],
        [0.125, h * 1.01],
        [0.1, h * 1.01],
      ],
      { at: [x, y0, z], segments: 12, color: GOLD_LIGHT, smoothing: 0 },
    );
    // knop ring
    b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD_LIGHT, { at: [x, y0 + h * 0.38, z], rotation: [90, 0, 0] });
    // gems on the cup
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.6;
      glow(b.part(new THREE.OctahedronGeometry(0.016), gemColor, { at: [x + Math.cos(a) * 0.1, y0 + h * 0.8, z + Math.sin(a) * 0.1], scale: [1, 1.3, 1] }), 1.2);
    }
  };
  goblet(-0.9, 0.7, 0.07, 0.3, GOLD, GEM_PINK);
  goblet(0.88, 0.8, 0.07, 0.26, SILVER, GEM_CYAN);
  // toppled goblet lying on its side on the mound
  const tg = new THREE.Group();
  void tg;
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.065, 0.015],
      [0.02, 0.04],
      [0.02, 0.14],
      [0.03, 0.15],
      [0.09, 0.2],
      [0.11, 0.29],
      [0.1, 0.29],
      [0.08, 0.21],
      [0, 0.17],
    ],
    { at: [-0.62, 0.22, 0.55], axis: [0.9, 0.2, -0.4] as any, segments: 10, color: GOLD_DEEP, smoothing: 0 } as any,
  );

  // ------------------------------------------------ gems (large crystal clusters + loose cut gems)
  const crystal = (x: number, z: number, y: number, h: number, r: number, col: string, tilt: [number, number]) => {
    const base: [number, number, number] = [x, y, z];
    const d = new THREE.Vector3(tilt[0], 1, tilt[1]).normalize();
    const g = new THREE.CylinderGeometry(r * 0.2, r, h, 6);
    glow(b.part(g, col, { at: [x + d.x * h * 0.5, y + d.y * h * 0.5, z + d.z * h * 0.5], dir: d.toArray() as [number, number, number] }), 1.1);
    glow(b.spike([x + d.x * h, y + d.y * h, z + d.z * h], d.toArray() as [number, number, number], r * 0.9, r * 0.2, { color: col, sides: 6 }), 1.3);
    void base;
  };
  // cluster back-right
  crystal(0.85, -0.45, 0.07, 0.5, 0.075, GEM_CYAN, [0.15, 0.05]);
  crystal(0.98, -0.3, 0.07, 0.34, 0.06, GEM_VIOLET, [0.35, 0.1]);
  crystal(0.72, -0.28, 0.07, 0.3, 0.055, GEM_PINK, [-0.25, 0.15]);
  crystal(0.9, -0.62, 0.07, 0.28, 0.05, GEM_CYAN, [0.1, -0.3]);
  crystal(1.08, -0.5, 0.07, 0.22, 0.045, GEM_GREEN, [0.4, -0.1]);
  // cluster back-left
  crystal(-1.1, -0.25, 0.07, 0.42, 0.07, GEM_PINK, [-0.2, 0.1]);
  crystal(-0.95, -0.55, 0.07, 0.3, 0.055, GEM_AMBER, [0.2, -0.2]);
  crystal(-1.15, -0.5, 0.07, 0.24, 0.05, GEM_VIOLET, [-0.35, 0]);
  // loose cut gems over the mound and floor
  const cutGem = (x: number, y: number, z: number, s: number, col: string, ry: number) => {
    glow(b.part(new THREE.OctahedronGeometry(s), col, { at: [x, y, z], scale: [1, 0.85, 1], rotation: [R() * 40 - 20, ry, R() * 40 - 20] }), 1.2);
    glow(b.part(new THREE.CylinderGeometry(s * 0.55, s * 0.8, s * 0.3, 6), col, { at: [x, y + s * 0.75, z], rotation: [0, ry, 0] }), 1.0);
  };
  const loose: Array<[number, number, number, number, string]> = [
    [-0.35, 0.34, 0.45, 0.05, GEM_CYAN],
    [0.55, 0.27, 0.5, 0.045, GEM_PINK],
    [0.3, 0.36, 0.1, 0.05, GEM_GREEN],
    [-0.05, 0.12, 0.88, 0.05, GEM_AMBER],
    [0.45, 0.12, 0.92, 0.04, GEM_VIOLET],
    [-0.6, 0.14, 0.2, 0.045, GEM_RED],
    [1.05, 0.12, 0.3, 0.05, GEM_CYAN],
    [-1.05, 0.12, 0.2, 0.04, GEM_GREEN],
    [0.75, 0.22, 0.45, 0.04, GEM_AMBER],
    [-0.15, 0.3, 0.6, 0.038, GEM_PINK],
    [0.22, 0.25, 0.72, 0.035, GEM_CYAN],
    [-0.85, 0.12, 0.45, 0.035, GEM_VIOLET],
  ];
  loose.forEach(([x, y, z, s, c], i) => cutGem(x, y, z, s, c, i * 37));

  // ------------------------------------------------ vase (back-left)
  const vx = -0.95;
  const vz = -0.85;
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.14, 0.05],
      [0.22, 0.2],
      [0.22, 0.34],
      [0.13, 0.5],
      [0.08, 0.58],
      [0.09, 0.66],
      [0.13, 0.7],
      [0.11, 0.7],
      [0.07, 0.66],
      [0.06, 0.58],
      [0.1, 0.5],
      [0.18, 0.34],
      [0.18, 0.2],
      [0, 0.14],
    ],
    { at: [vx, 0.1, vz], segments: 12, color: claySwirl, smoothing: 0 },
  );
  b.part(new THREE.TorusGeometry(0.125, 0.015, 4, 10), GOLD, { at: [vx, 0.1 + 0.7, vz], rotation: [90, 0, 0] });
  // vase handles
  for (const s of [-1, 1]) {
    b.sweep(
      [
        [vx + s * 0.085, 0.1 + 0.62, vz],
        [vx + s * 0.24, 0.1 + 0.6, vz],
        [vx + s * 0.27, 0.1 + 0.42, vz],
        [vx + s * 0.21, 0.1 + 0.3, vz],
      ],
      0.017,
      { color: GOLD, detail: 0.6 },
    );
  }
  // jewel on vase belly
  glow(b.part(new THREE.OctahedronGeometry(0.035), GEM_PINK, { at: [vx, 0.1 + 0.27, vz + 0.225], scale: [1, 1.3, 0.6] }), 1.3);
  // coins & rolled scroll sticking out of the vase
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), "#ffffff", { at: [vx - 0.03, 0.1 + 0.84, vz + 0.0], rotation: [0, 0, 12], texture: SCROLL_TEX });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), VELVET, { at: [vx - 0.065, 0.1 + 0.98, vz], rotation: [0, 0, 12] });

  // ------------------------------------------------ potion flask (back right-middle)
  const fx = 0.45;
  const fz = -0.85;
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.16, 0.06],
      [0.17, 0.14],
      [0.1, 0.24],
      [0.05, 0.28],
      [0.05, 0.38],
      [0.065, 0.4],
      [0.04, 0.4],
      [0, 0.28],
    ],
    { at: [fx, 0.1, fz], segments: 10, color: GLASS, smoothing: 0 },
  );
  glow(b.part(sphere(0.115, 10, 6), "#ff7ac2", { at: [fx, 0.1 + 0.11, fz], scale: [1, 0.8, 1] }), 1.0);
  b.part(new THREE.CylinderGeometry(0.052, 0.045, 0.07, 8), WOOD, { at: [fx, 0.1 + 0.44, fz] });
  b.part(new THREE.TorusGeometry(0.052, 0.008, 4, 8), GOLD, { at: [fx, 0.1 + 0.4, fz], rotation: [90, 0, 0] });

  // ------------------------------------------------ small treasure bag (right front)
  const sx = 0.98;
  const sz = 0.45;
  b.part(sphere(0.2, 10, 8), cel("#b9472d", "#6b1f52"), { at: [sx, 0.1 + 0.15, sz], scale: [1, 1.0, 0.95] });
  b.part(new THREE.CylinderGeometry(0.07, 0.11, 0.1, 8), cel("#b9472d", "#6b1f52"), { at: [sx, 0.1 + 0.34, sz] });
  b.part(new THREE.TorusGeometry(0.085, 0.015, 4, 10), GOLD, { at: [sx, 0.1 + 0.3, sz], rotation: [90, 0, 0] });
  b.part(sphere(0.04, 6, 4), GOLD_LIGHT, { at: [sx + 0.1, 0.1 + 0.26, sz + 0.06] });
  b.part(sphere(0.03, 6, 4), GOLD_LIGHT, { at: [sx - 0.08, 0.1 + 0.24, sz + 0.1] });
  // coins spilling from the bag top
  for (let i = 0; i < 4; i++) {
    const g = coinGeo.clone();
    g.rotateX(0.4 + i * 0.2);
    g.rotateY(i * 1.7);
    g.translate(sx - 0.04 + i * 0.03, 0.1 + 0.4 + i * 0.012, sz + 0.02);
    b.part(g, goldWear, { at: [0, 0, 0] });
  }

  // ------------------------------------------------ gold ingot stack (left front)
  const ix = -0.95;
  const iz = 0.2;
  const ingot = (x: number, y: number, z: number, ry: number) =>
    b.frustumBox([x, y, z], [x, y + 0.09, z], [0.26, 0.14], [0.2, 0.1], { color: goldWear, section: "box" } as any);
  void ingot;
  const ingotGeo = new THREE.CylinderGeometry(0.075, 0.1, 0.09, 4);
  const ing = (x: number, y: number, z: number, ry: number) =>
    b.part(ingotGeo, goldWear, { at: [x, y, z], rotation: [0, ry + 45, 0], scale: [1.5, 1, 0.8] });
  ing(ix, 0.1 + 0.045, iz, 10);
  ing(ix + 0.2, 0.1 + 0.045, iz + 0.04, -8);
  ing(ix + 0.08, 0.1 + 0.135, iz + 0.02, 4);
  ing(ix - 0.12, 0.1 + 0.045, iz + 0.2, 30);
  // sparkles floating above the loot
  const sparkFrames = [
    frame([0.1, 0.9, 0.35], [0, 1, 0]),
    frame([-0.5, 0.75, 0.0], [0, 1, 0]),
    frame([0.7, 0.8, -0.1], [0, 1, 0]),
    frame([-0.15, 1.1, -0.25], [0, 1, 0]),
    frame([0.95, 0.9, -0.5], [0, 1, 0]),
    frame([-1.0, 0.8, -0.3], [0, 1, 0]),
  ];
  glow(
    b.cards(sparkFrames, SPARKLE, { size: [0.09, 0.09], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.4, rng: rng(3), spin: 30 }),
    1.4,
  );

  return b.root;
}
