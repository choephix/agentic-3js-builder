import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg, paint, mix, noise, smoothstep, grain, mottle, aim, catmull, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A hex-slab treasure hoard in a hand-painted fantasy style: an open iron-bound chest spilling gold, coin mounds, jewelled crown, gold and silver goblets, ingots, pearls, hextech crystals and glowing runes.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);
const FLOOR = 0.14;

type Pile = { x: number; z: number; y0: number; rx: number; rz: number; h: number; um?: number };

// ----------------------------------------------------------------------------------------------------------
// Palette
const GEM = {
  ruby: "#e5233f",
  emerald: "#1fcf6e",
  sapphire: "#2c6bff",
  amethyst: "#a54cff",
  topaz: "#ffb52b",
  aqua: "#35e6dc",
  diamond: "#cdf4ff",
};
const GEM_LIST = Object.values(GEM);
const COIN_COLORS = ["#f2b52a", "#ffd75a", "#d8921a", "#cdd8ec"];
const GOLD_FLAT = "#ffd75a";
const GILT = metal("gilt", { polish: 0.7, seed: 3 });
const GILT_OLD = metal("gilt", { tarnish: 0.35, seed: 8 });
const SILVER = metal("steel", { polish: 0.8, seed: 5 });
const IRON = metal("blued", { seed: 2, polish: 0.5 });
const INGOT = metal("gilt", { polish: 0.9, tarnish: 0.05, seed: 7 });
const MOUND = mottle("#b87a14", "#e8a828", { size: 0.07, seed: 3 });

const GRAINP = grain("#6a3a20", "#9d5f32", { size: 0.014, axis: "x" });
const WOODP = paint((p, n) => {
  const top = Math.abs(n.y) > 0.7;
  const along = top ? p.x : p.y;
  const sz = top ? 0.1 : 0.085;
  const f = (along - 0.1) / sz;
  const fr = f - Math.floor(f);
  let c = GRAINP.at(p, n);
  const lit = 0.88 + 0.14 * n.y;
  if (fr < 0.07) c = mix(c, "#24120a", 0.85);
  else if (fr > 0.93) c = mix(c, "#e0a868", 0.25);
  return [c[0] * lit, c[1] * lit, c[2] * lit];
});

const STONE = paint((p, n) => {
  let c = mix("#463e5c", "#7d7396", noise(p, 0.2, 4));
  const moss = smoothstep(0.55, 0.9, n.y) * smoothstep(0.45, 0.7, noise(p, 0.1, 9));
  c = mix(c, "#4f8a3e", moss * 0.7);
  const lit = 0.8 + 0.3 * smoothstep(-0.5, 0.8, n.y);
  return [c[0] * lit, c[1] * lit, c[2] * lit];
});

const FLOORP = paint((p, n) => {
  let c = mix("#383250", "#5b5278", noise(p, 0.3, 21));
  if (n.y > 0.7) {
    const u = (((p.x / 0.45) % 1) + 1) % 1;
    const v = (((p.z / 0.45) % 1) + 1) % 1;
    if (u < 0.035 || v < 0.035) c = mix(c, "#171326", 0.8);
    else if (u < 0.07 || v < 0.07) c = mix(c, "#8a80ac", 0.25);
  } else c = mix(c, "#2a2540", 0.4);
  return c;
});

// ----------------------------------------------------------------------------------------------------------
// Textures
const coinTex = (hi: string, lo: string, ring: string, glyph: string, star: boolean) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.38" cy="0.32" r="0.9"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${lo}"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#g)"/>
  <circle cx="50" cy="50" r="45" fill="none" stroke="${ring}" stroke-width="4"/>
  <circle cx="50" cy="50" r="37" fill="none" stroke="${ring}" stroke-width="2.4" stroke-dasharray="3 4.5"/>
  ${
    star
      ? `<path d="M50 20 L58 41 L80 43 L63 57 L68 79 L50 67 L32 79 L37 57 L20 43 L42 41 Z" fill="${glyph}" stroke="${ring}" stroke-width="3" stroke-linejoin="round"/>`
      : `<path d="M28 66 L25 36 L39 50 L50 28 L61 50 L75 36 L72 66 Z" fill="${glyph}" stroke="${ring}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="28" y="68" width="44" height="7" rx="2" fill="${glyph}" stroke="${ring}" stroke-width="2.5"/>`
  }
  <path d="M20 32 A34 34 0 0 1 46 15" stroke="#ffffff" stroke-opacity="0.85" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 256 },
  );
const COIN_G = coinTex("#ffe98a", "#e8a21c", "#8a5410", "#c4801a", false);
const COIN_S = coinTex("#f4f8ff", "#9fb0d0", "#4d5b7a", "#7d8fb4", true);

const EMBLEM = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="98" fill="#8f1428" stroke="#f4c040" stroke-width="6"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#f4c040" stroke-width="3" stroke-dasharray="7 6"/>
  <path d="M30 70 L170 130 M30 130 L170 70 M100 20 L100 180" stroke="#6e0f20" stroke-width="3" fill="none"/>
  <polygon points="100,38 150,70 150,130 100,162 50,130 50,70" fill="#6e0f20" stroke="#f4c040" stroke-width="5" stroke-linejoin="round"/>
  <path d="M68 124 L64 78 L84 100 L100 68 L116 100 L136 78 L132 124 Z" fill="#f4c040" stroke="#7a4a0a" stroke-width="4" stroke-linejoin="round"/>
  <rect x="68" y="128" width="64" height="10" rx="3" fill="#f4c040" stroke="#7a4a0a" stroke-width="4"/>
  <circle cx="100" cy="112" r="8" fill="#38e6ff" stroke="#0a4a6a" stroke-width="3"/>
</svg>`,
  { size: 256 },
);

const KEY = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#2a1d16" stroke="#f4c040" stroke-width="6"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#c78a1c" stroke-width="3"/>
  <circle cx="50" cy="42" r="12" fill="#0c0708"/>
  <path d="M42 50 L58 50 L62 78 L38 78 Z" fill="#0c0708"/>
  <path d="M20 50 L12 50 M80 50 L88 50" stroke="#f4c040" stroke-width="4" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const RUNES = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="97" fill="none" stroke="#5ff2ff" stroke-width="3"/>
  <circle cx="100" cy="100" r="89" fill="none" stroke="#2f9cff" stroke-width="3" stroke-dasharray="10 5"/>
  <circle cx="100" cy="100" r="64" fill="none" stroke="#5ff2ff" stroke-width="2.6"/>
  <polygon points="100,38 153.6,131 46.4,131" fill="none" stroke="#5ff2ff" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="100,162 46.4,69 153.6,69" fill="none" stroke="#2f9cff" stroke-width="3" stroke-linejoin="round"/>
  <path id="t" d="" />
  <g stroke="#9ff8ff" stroke-width="4" stroke-linecap="round">
    <path d="M100 3 L100 14 M100 186 L100 197 M3 100 L14 100 M186 100 L197 100"/>
    <path d="M31 31 L39 39 M169 31 L161 39 M31 169 L39 161 M169 169 L161 161"/>
  </g>
  <g fill="#5ff2ff"><circle cx="100" cy="100" r="6"/><circle cx="100" cy="50" r="3.4"/><circle cx="143" cy="125" r="3.4"/><circle cx="57" cy="125" r="3.4"/></g>
</svg>`,
  { size: 512 },
);

const STAR = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 0 L38 26 L64 32 L38 38 L32 64 L26 38 L0 32 L26 26 Z" fill="#ffe27a"/>
  <path d="M32 14 L35 29 L50 32 L35 35 L32 50 L29 35 L14 32 L29 29 Z" fill="#ffffff"/>
</svg>`,
  { size: 96 },
);

// ----------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "treasure_hoard" });
  const root = b.joint("base", { at: [0, 0, 0] });
  const R = rng(2077);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * R();

  // ---- placement helpers --------------------------------------------------------------------------------
  const xf = (C: THREE.Vector3, Q: THREE.Quaternion) => ({
    L: (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(Q).add(C),
    D: (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(Q),
    RQ: (e: THREE.Euler) => Q.clone().multiply(new THREE.Quaternion().setFromEuler(e)),
  });

  const box = (w: number, h: number, d: number, at: THREE.Vector3 | number[], color: any, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at: at as any, name });

  const mergedSpheres = (pts: THREE.Vector3[], r: number, color: string, seg: [number, number] = [6, 4]) => {
    if (!pts.length) return;
    const gs = pts.map((p) => new THREE.SphereGeometry(r, seg[0], seg[1]).translate(p.x, p.y, p.z));
    b.part(mergeGeometries(gs)!, color, { bone: root, at: [0, 0, 0], flat: true });
  };

  // ---- gems ---------------------------------------------------------------------------------------------
  const gemOutline = (s: number): [number, number][] => [
    [0, 0],
    [s * 0.98, s * 0.62],
    [s * 1.0, s * 0.7],
    [s * 0.62, s * 1.02],
    [0, s * 1.02],
  ];
  const gem = (at: THREE.Vector3, axis: THREE.Vector3, s: number, color: string, k = 0.5, seg = 8) =>
    glow(b.lathe(gemOutline(s), { at, axis: axis.clone().normalize(), segments: seg, color, bone: root, name: "gem" }), k);

  // ---- hoard height field -------------------------------------------------------------------------------
  const PILES: Pile[] = [
    { x: 0.02, z: 0.5, y0: FLOOR, rx: 0.6, rz: 0.36, h: 0.25 },
    { x: 0.72, z: 0.05, y0: FLOOR, rx: 0.38, rz: 0.34, h: 0.26 },
    { x: -0.7, z: 0.1, y0: FLOOR, rx: 0.4, rz: 0.34, h: 0.3 },
    { x: 0.78, z: 0.62, y0: FLOOR, rx: 0.26, rz: 0.22, h: 0.13 },
    { x: -0.78, z: 0.62, y0: FLOOR, rx: 0.26, rz: 0.22, h: 0.14 },
    { x: 0, z: -0.35, y0: FLOOR + 0.3, rx: 0.34, rz: 0.21, h: 0.15, um: 0.82 },
    { x: 0.78, z: -0.38, y0: FLOOR, rx: 0.26, rz: 0.26, h: 0.2 },
  ];
  const pileH = (p: Pile, x: number, z: number) => {
    const e = ((x - p.x) / p.rx) ** 2 + ((z - p.z) / p.rz) ** 2;
    return e >= 1 ? -Infinity : p.y0 + p.h * Math.sqrt(1 - e);
  };
  const H = (x: number, z: number) => {
    let m = FLOOR;
    for (const p of PILES) m = Math.max(m, pileH(p, x, z));
    return m;
  };
  const normalAt = (x: number, z: number) => {
    const e = 0.03;
    return V(-(H(x + e, z) - H(x - e, z)) / (2 * e), 1, -(H(x, z + e) - H(x, z - e)) / (2 * e)).normalize();
  };

  // ---- hex base -----------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [1.26, 0],
      [1.32, 0.03],
      [1.32, 0.1],
      [1.24, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: FLOORP, bone: root, name: "hexBase" },
  );
  b.lathe(
    [
      [1.0, 0.14],
      [1.1, 0.14],
      [1.1, 0.156],
      [1.0, 0.156],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: "#2a6f9a", bone: root, name: "hexInlay" },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.95, 36), "#ffffff", {
      bone: root,
      at: [0, FLOOR + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNES,
      name: "runeCircle",
    }),
    0.9,
  );

  // ---- rocks ----------------------------------------------------------------------------------------------
  const rocks: [number, number, number, number, number, number][] = [
    [0.98, -0.52, 0.17, 0.17, 0.15, 20],
    [-0.98, -0.55, 0.2, 0.2, 0.17, 50],
    [0.05, -1.08, 0.4, 0.22, 0.14, 0],
    [0.38, -0.98, 0.16, 0.16, 0.13, 30],
    [-0.3, -1.0, 0.18, 0.17, 0.14, 70],
    [1.0, 0.3, 0.1, 0.1, 0.1, 10],
    [-1.0, 0.38, 0.11, 0.11, 0.1, 60],
  ];
  for (const [x, z, sx, sy, sz, ry] of rocks)
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [x, sy * 0.95, z],
      scale: [sx, sy, sz],
      rotation: [0, ry, 0],
      flat: true,
      name: "rock",
    });

  // ---- hextech crystals -----------------------------------------------------------------------------------
  const cluster = (cx: number, cz: number, cols: string[], specs: [number, number, number, number][]) => {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [cx, 0.13, cz],
      scale: [0.26, 0.14, 0.23],
      rotation: [0, rr(0, 90), 0],
      flat: true,
      name: "crystalRock",
    });
    specs.forEach(([dx, dz, len, r], i) => {
      const base = V(cx + dx, 0.14, cz + dz);
      const dir = V(dx * 2.2, 1, dz * 2.2).normalize();
      const prof: [number, number][] = [
        [0, 0],
        [r * 0.92, 0.03 * len],
        [r, 0.1 * len],
        [r, 0.72 * len],
        [r * 0.45, 0.88 * len],
        [0, len],
      ];
      glow(
        b.lathe(prof, { at: base, axis: dir, segments: 6, color: cols[i % cols.length], bone: root, name: "crystal" }),
        0.5,
      );
    });
  };
  cluster(0.66, -0.8, ["#46e9ff", "#2f9cff", "#7cf3ff"], [
    [0, 0, 0.62, 0.07],
    [0.1, 0.06, 0.4, 0.05],
    [-0.1, 0.08, 0.34, 0.05],
    [0.04, -0.1, 0.46, 0.055],
    [0.18, -0.04, 0.26, 0.04],
  ]);
  cluster(-0.62, -0.84, ["#b45cff", "#8140f0", "#d98aff"], [
    [0, 0, 0.5, 0.065],
    [-0.09, 0.05, 0.34, 0.05],
    [0.1, 0.06, 0.3, 0.045],
    [-0.03, -0.09, 0.38, 0.05],
  ]);

  // ---- the chest ------------------------------------------------------------------------------------------
  const zc = -0.35;
  const CW = 0.84;
  const CD = 0.52;
  const CH = 0.34;
  const t = 0.045;
  const y0 = FLOOR;
  const frontZ = zc + CD / 2;
  const backZ = zc - CD / 2;
  const rimY = y0 + CH;

  box(CW, CH, t, [0, y0 + CH / 2, frontZ - t / 2], WOODP, "chestFront");
  box(CW, CH, t, [0, y0 + CH / 2, backZ + t / 2], WOODP, "chestBack");
  box(t, CH, CD - 2 * t, [CW / 2 - t / 2, y0 + CH / 2, zc], WOODP, "chestSideL");
  box(t, CH, CD - 2 * t, [-(CW / 2 - t / 2), y0 + CH / 2, zc], WOODP, "chestSideR");
  box(CW - 2 * t, 0.04, CD - 2 * t, [0, y0 + 0.02, zc], WOODP, "chestFloor");
  box(CW + 0.05, 0.05, CD + 0.05, [0, y0 + 0.025, zc], IRON, "chestSkirt");

  // corner posts and rim trims
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.075, CH + 0.02, 0.075, [sx * (CW / 2), y0 + (CH + 0.02) / 2, zc + sz * (CD / 2)], IRON, "post");
      b.part(new THREE.SphereGeometry(0.03, 7, 5), GOLD_FLAT, {
        bone: root,
        at: [sx * (CW / 2), rimY + 0.02, zc + sz * (CD / 2)],
        flat: true,
      });
    }
  box(CW, 0.04, 0.05, [0, rimY - 0.005, frontZ - 0.012], GILT, "rimFront");
  box(CW, 0.04, 0.05, [0, rimY - 0.005, backZ + 0.012], GILT, "rimBack");
  box(0.05, 0.04, CD, [CW / 2 - 0.012, rimY - 0.005, zc], GILT, "rimL");
  box(0.05, 0.04, CD, [-CW / 2 + 0.012, rimY - 0.005, zc], GILT, "rimR");

  // front straps with studs
  const studPts: THREE.Vector3[] = [];
  for (const sx of [0.24, -0.24]) {
    box(0.075, CH, 0.014, [sx, y0 + CH / 2, frontZ + 0.003], GILT, "strap");
    for (const yy of [y0 + 0.035, y0 + CH - 0.04, y0 + CH / 2 - 0.09]) {
      studPts.push(V(sx - 0.022, yy, frontZ + 0.012), V(sx + 0.022, yy, frontZ + 0.012));
    }
  }
  mergedSpheres(studPts, 0.011, "#fff0a0");

  // ring handles
  for (const s of [1, -1]) {
    box(0.014, 0.07, 0.06, [s * (CW / 2 + 0.006), y0 + 0.2, zc], GILT, "handlePlate");
    b.part(new THREE.TorusGeometry(0.036, 0.007, 6, 12), GOLD_FLAT, {
      bone: root,
      at: [s * (CW / 2 + 0.02), y0 + 0.18, zc],
      rotation: [0, 90, 0],
      flat: true,
      name: "handle",
    });
  }

  // lock plate, keyhole and hextech gem
  const lockY = y0 + 0.23;
  b.extrude(
    [
      [-0.07, 0.06],
      [-0.07, -0.02],
      [0, -0.09],
      [0.07, -0.02],
      [0.07, 0.06],
      [0.035, 0.09],
      [-0.035, 0.09],
    ],
    { at: [0, lockY, frontZ + 0.012], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.006, color: GILT, bone: root, name: "lockPlate" },
  );
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: root,
    at: [0, lockY - 0.012, frontZ + 0.0265],
    dir: [0, 0, 1],
    axis: "z",
    texture: KEY,
    name: "keyhole",
  });
  gem(V(0, lockY + 0.052, frontZ + 0.018), V(0, 0.1, 1), 0.028, GEM.aqua, 0.65);

  // lid on its hinge
  const Hp = V(0, rimY, backZ);
  const lid = b.joint("lid", { parent: root, at: Hp, role: "hinge" });
  const LD = CD;
  const LH = 0.2;
  const arch = (D: number, h: number, grow: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      pts.push([D / 2 + (D / 2 + grow) * Math.cos(a), (h + grow) * Math.sin(a)]);
    }
    return pts;
  };
  b.extrude(arch(LD, LH, 0), { at: Hp, x: [0, 0, 1], y: [0, 1, 0], thickness: CW, bevel: 0.014, color: WOODP, bone: lid, name: "lidShell" });
  for (const sx of [0.25, -0.25])
    b.extrude(arch(LD, LH, 0.012), { at: Hp.clone().add(V(sx, 0, 0)), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.075, bevel: 0.006, color: GILT, bone: lid, name: "lidStrap" });
  for (const sx of [0.405, -0.405])
    b.extrude(arch(LD, LH, 0.014), { at: Hp.clone().add(V(sx, 0, 0)), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.036, bevel: 0.006, color: IRON, bone: lid, name: "lidCap" });
  b.extrude(
    [
      [0.03, -0.022],
      [LD - 0.03, -0.022],
      [LD - 0.03, 0],
      [0.03, 0],
    ],
    { at: Hp, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.74, color: "#8f1428", bone: lid, name: "lidLiner" },
  );
  b.part(new THREE.CircleGeometry(0.2, 28), "#ffffff", {
    bone: lid,
    at: Hp.clone().add(V(0, -0.0235, LD / 2)),
    dir: [0, -1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: EMBLEM,
    name: "lidEmblem",
  });
  // hinge barrels
  for (const sx of [0.32, -0.32])
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), GOLD_FLAT, { bone: lid, at: Hp.clone().add(V(sx, 0.005, -0.008)), rotation: [0, 0, 90], flat: true, name: "hinge" });
  b.pose(lid, { axis: [1, 0, 0], deg: -112 });

  // ---- coin mounds ----------------------------------------------------------------------------------------
  for (const p of PILES)
    b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, {
      bone: root,
      at: [p.x, p.y0, p.z],
      scale: [p.rx, p.h, p.rz],
      name: "mound",
    });

  // ---- coins (merged per colour) --------------------------------------------------------------------------
  const coinGeoms: THREE.BufferGeometry[][] = COIN_COLORS.map(() => []);
  const addCoin = (pos: THREE.Vector3, normal: THREE.Vector3, r: number, ci: number, spin: number) => {
    const g = new THREE.CylinderGeometry(r, r, r * 0.3, 8);
    const q = aim(normal).multiply(new THREE.Quaternion().setFromAxisAngle(Y, spin));
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, V(1, 1, 1)));
    coinGeoms[ci].push(g);
  };
  const pickCoin = () => {
    const v = R();
    return v < 0.4 ? 0 : v < 0.65 ? 1 : v < 0.9 ? 2 : 3;
  };
  for (const p of PILES) {
    const cnt = Math.round(2 * Math.PI * p.rx * p.rz * 105);
    let made = 0;
    let tries = 0;
    while (made < cnt && tries < cnt * 8) {
      tries++;
      const u = Math.sqrt(R()) * (p.um ?? 0.97);
      const a = R() * Math.PI * 2;
      const x = p.x + Math.cos(a) * u * p.rx;
      const z = p.z + Math.sin(a) * u * p.rz;
      const y = pileH(p, x, z);
      if (y < H(x, z) - 0.004) continue;
      const n = normalAt(x, z);
      const tl = R() < 0.15 ? 0.9 : 0.35;
      n.add(V(rr(-tl, tl), rr(-tl * 0.3, tl * 0.5), rr(-tl, tl))).normalize();
      addCoin(V(x, y, z), n, rr(0.038, 0.055), pickCoin(), R() * 6.28);
      made++;
    }
  }

  // ---- toppled goblet + spilled coins ----------------------------------------------------------------------
  const GOB: [number, number][] = [
    [0, 0],
    [0.052, 0],
    [0.054, 0.012],
    [0.024, 0.034],
    [0.013, 0.06],
    [0.013, 0.1],
    [0.03, 0.118],
    [0.062, 0.15],
    [0.07, 0.19],
    [0.066, 0.222],
    [0.058, 0.222],
    [0.062, 0.19],
    [0.054, 0.15],
    [0.03, 0.128],
    [0, 0.124],
  ];
  const goblet = (C: THREE.Vector3, axis: THREE.Vector3, s: number, fill: any, trim: string, gemCols: string[]) => {
    const ax = axis.clone().normalize();
    const Q = aim(ax);
    const { L, D, RQ } = xf(C, Q);
    b.lathe(GOB.map(([x, y]) => [x * s, y * s] as [number, number]), { at: C, axis: ax, segments: 10, color: fill, bone: root, name: "goblet" });
    b.part(new THREE.SphereGeometry(0.03 * s, 8, 5), trim, { bone: root, at: L(0, 0.083 * s, 0), flat: true, name: "gobletKnob" });
    const flatQ = RQ(new THREE.Euler(Math.PI / 2, 0, 0));
    b.part(new THREE.TorusGeometry(0.066 * s, 0.006 * s, 5, 14), trim, { bone: root, at: L(0, 0.222 * s, 0), quat: flatQ, flat: true, name: "gobletRim" });
    b.part(new THREE.TorusGeometry(0.052 * s, 0.007 * s, 5, 12), trim, { bone: root, at: L(0, 0.008 * s, 0), quat: flatQ, flat: true, name: "gobletFoot" });
    b.part(new THREE.TorusGeometry(0.0645 * s, 0.006 * s, 5, 14), trim, { bone: root, at: L(0, 0.16 * s, 0), quat: flatQ, flat: true, name: "gobletBand" });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const o = D(Math.sin(a), 0, Math.cos(a));
      gem(L(Math.sin(a) * 0.063 * s, 0.185 * s, Math.cos(a) * 0.063 * s).addScaledVector(o, -0.004), o.clone().add(D(0, 0.15, 0)), 0.018 * s, gemCols[i % gemCols.length], 0.55, 6);
    }
  };

  const sc2 = 1.25;
  const d2 = V(-0.95, 0.07, 0.12).normalize();
  const foot2 = V(0.42, 0.24, 0.84);
  goblet(foot2, d2, sc2, GILT, GOLD_FLAT, [GEM.ruby, GEM.emerald, GEM.topaz]);
  const mouth = foot2.clone().addScaledVector(d2, 0.222 * sc2);
  for (let k = 0; k < 18; k++) {
    const tt = rr(0.03, 0.55);
    const pos = V(mouth.x + d2.x * tt, FLOOR + 0.01 + (R() < 0.25 ? 0.014 : 0), mouth.z + d2.z * tt + rr(-0.08, 0.08));
    addCoin(pos, V(rr(-0.15, 0.15), 1, rr(-0.15, 0.15)).normalize(), rr(0.04, 0.05), pickCoin(), R() * 6.28);
  }

  // ---- goblets on piles ---------------------------------------------------------------------------------------
  goblet(V(0.72, H(0.72, 0.05) - 0.012, 0.05), V(0.04, 1, -0.03), 1.3, GILT, GOLD_FLAT, [GEM.ruby, GEM.emerald, GEM.sapphire, GEM.topaz, GEM.amethyst]);
  goblet(V(-0.7, H(-0.7, 0.1) - 0.012, 0.1), V(-0.03, 1, 0.04), 1.1, SILVER, "#e2eafa", [GEM.sapphire, GEM.aqua, GEM.diamond]);

  // ---- hero coins (drawn faces) -------------------------------------------------------------------------------
  const heroCoin = (x: number, z: number, nx: number, ny: number, nz: number, r: number, silver: boolean) => {
    const n = V(nx, ny, nz).normalize();
    const c = V(x, H(x, z) + r * 0.75, z);
    b.part(new THREE.CylinderGeometry(r, r, 0.016, 12), silver ? "#aebbd3" : "#e9aa22", { bone: root, at: c, dir: n, flat: true, name: "heroCoin" });
    for (const k of [1, -1])
      b.part(new THREE.CircleGeometry(r * 0.94, 20), "#ffffff", {
        bone: root,
        at: c.clone().addScaledVector(n, k * 0.0088),
        dir: n.clone().multiplyScalar(k),
        up: [0, 1, 0],
        axis: "z",
        texture: silver ? COIN_S : COIN_G,
        name: "heroCoinFace",
      });
  };
  heroCoin(0.12, 0.77, 0.1, 0.45, 1, 0.075, false);
  heroCoin(0.55, 0.5, 0.7, 0.5, 0.7, 0.065, true);
  heroCoin(-0.55, 0.52, -0.6, 0.5, 0.8, 0.07, false);

  // merge all loose coins
  coinGeoms.forEach((list, ci) => {
    if (list.length) b.part(mergeGeometries(list)!, COIN_COLORS[ci], { bone: root, at: [0, 0, 0], flat: true, name: "coins" });
  });

  // ---- gems scattered on the hoard ------------------------------------------------------------------------------
  const avoid: [number, number, number][] = [
    [-0.02, 0.42, 0.22],
    [0.72, 0.05, 0.14],
    [-0.7, 0.1, 0.14],
  ];
  const gemOn = (x: number, z: number, s: number, color: string, tilt = 0.4) => {
    const n = normalAt(x, z);
    const a = n.clone().add(V(rr(-1, 1) * tilt, rr(0, 0.3), rr(-1, 1) * tilt)).normalize();
    gem(V(x, H(x, z) - 0.006 - s * 0.1, z).addScaledVector(a, 0), a, s, color, 0.5);
  };
  const gemCounts = [6, 4, 4, 2, 2, 5, 3];
  PILES.forEach((p, pi) => {
    let made = 0;
    let tries = 0;
    while (made < gemCounts[pi] && tries < 60) {
      tries++;
      const u = Math.sqrt(R()) * (p.um ?? 0.9);
      const a = R() * Math.PI * 2;
      const x = p.x + Math.cos(a) * u * p.rx;
      const z = p.z + Math.sin(a) * u * p.rz;
      if (pileH(p, x, z) < H(x, z) - 0.004) continue;
      if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
      gemOn(x, z, rr(0.03, 0.05), GEM_LIST[Math.floor(R() * GEM_LIST.length)]);
      made++;
    }
  });
  gemOn(0.38, 0.58, 0.07, GEM.ruby, 0.2);
  gemOn(-0.4, 0.56, 0.065, GEM.sapphire, 0.2);
  gemOn(0.02, -0.28, 0.07, GEM.emerald, 0.15);

  // ---- crown ------------------------------------------------------------------------------------------------------
  const crown = (C: THREE.Vector3, Q: THREE.Quaternion) => {
    const { L, D, RQ } = xf(C, Q);
    const up = D(0, 1, 0);
    b.lathe(
      [
        [0, 0],
        [0.122, 0],
        [0.12, 0.03],
        [0.1, 0.062],
        [0.05, 0.08],
        [0, 0.084],
      ],
      { at: L(0, 0.02, 0), axis: up, segments: 12, color: "#9b1630", bone: root, name: "crownCap" },
    );
    b.lathe(
      [
        [0.118, 0],
        [0.13, 0],
        [0.152, 0.078],
        [0.14, 0.078],
      ],
      { at: C, axis: up, segments: 20, color: GILT, bone: root, name: "crownBand" },
    );
    const flatQ = RQ(new THREE.Euler(Math.PI / 2, 0, 0));
    b.part(new THREE.TorusGeometry(0.13, 0.008, 5, 22), GOLD_FLAT, { bone: root, at: L(0, 0.002, 0), quat: flatQ, flat: true, name: "crownRingLow" });
    b.part(new THREE.TorusGeometry(0.15, 0.008, 5, 22), GOLD_FLAT, { bone: root, at: L(0, 0.078, 0), quat: flatQ, flat: true, name: "crownRingHigh" });

    const N = 10;
    const tall: [number, number][] = [[-0.034, 0], [0.034, 0], [0.032, 0.05], [0.016, 0.08], [0, 0.13], [-0.016, 0.08], [-0.032, 0.05]];
    const short: [number, number][] = [[-0.034, 0], [0.034, 0], [0.03, 0.03], [0, 0.085], [-0.03, 0.03]];
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) * Math.PI * 2) / N;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      const base = L(0.141 * sa, 0.05, 0.141 * ca);
      const tan = D(ca, 0, -sa);
      const yd = D(0.2 * sa, 1, 0.2 * ca).normalize();
      const out = D(sa, 0, ca);
      const isTall = i % 2 === 0;
      b.extrude(isTall ? tall : short, { at: base, x: tan, y: yd, thickness: 0.014, bevel: 0.004, color: GILT, bone: root, name: "crownPoint" });
      if (isTall) {
        b.part(new THREE.SphereGeometry(0.016, 7, 5), "#fff6e8", { bone: root, at: base.clone().addScaledVector(yd, 0.138), flat: true, name: "crownPearl" });
        gem(base.clone().addScaledVector(yd, 0.05).addScaledVector(out, -0.003), out, 0.02, i % 4 === 0 ? GEM.ruby : GEM.sapphire, 0.55, 6);
      }
    }
    for (let i = 0; i < N; i++) {
      const a = (i * Math.PI * 2) / N;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      const out = D(sa, 0.2, ca);
      const pos = L(0.138 * sa, 0.034, 0.138 * ca).addScaledVector(D(sa, 0, ca), -0.004);
      if (i === 0) gem(pos, out, 0.04, GEM.aqua, 0.7);
      else gem(pos, out, 0.02, i % 2 ? GEM.ruby : GEM.emerald, 0.55, 6);
    }
    for (const sw of [0, 1]) {
      const pts = ([[0.15, 0.075], [0.105, 0.135], [0.055, 0.178], [0, 0.19], [-0.055, 0.178], [-0.105, 0.135], [-0.15, 0.075]] as [number, number][]).map(([u, yy]) =>
        sw ? L(0, yy, u) : L(u, yy, 0),
      );
      b.sweep(catmull(pts), 0.0065, { color: GILT, bone: root, sides: 5, name: "crownArch" });
    }
    b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD_FLAT, { bone: root, at: L(0, 0.205, 0), flat: true, name: "crownOrb" });
    b.part(new THREE.BoxGeometry(0.011, 0.05, 0.011), GOLD_FLAT, { bone: root, at: L(0, 0.245, 0), quat: Q, name: "crownCrossV" });
    b.part(new THREE.BoxGeometry(0.036, 0.011, 0.011), GOLD_FLAT, { bone: root, at: L(0, 0.252, 0), quat: Q, name: "crownCrossH" });
  };
  const crownQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, -0.2, 0.08));
  crown(V(-0.02, H(-0.02, 0.42) - 0.012, 0.42), crownQ);

  // ---- ingots -------------------------------------------------------------------------------------------------------
  const ingotOutline: [number, number][] = [[-0.1, 0], [0.1, 0], [0.082, 0.055], [-0.082, 0.055]];
  const yaw = 0.4;
  const sx0 = -0.8;
  const sz0 = -0.5;
  const rot = (lx: number, lz: number) => V(sx0 + lx * Math.cos(yaw) + lz * Math.sin(yaw), 0, sz0 - lx * Math.sin(yaw) + lz * Math.cos(yaw));
  const xdir = V(Math.cos(yaw), 0, -Math.sin(yaw));
  const layers: number[][] = [[-0.075, 0, 0.075], [-0.0375, 0.0375], [0]];
  layers.forEach((zs, li) =>
    zs.forEach((lz) => {
      const pos = rot(rr(-0.012, 0.012), lz);
      pos.y = FLOOR + li * 0.055;
      b.extrude(ingotOutline, { at: pos, x: xdir, y: [0, 1, 0], thickness: 0.07, bevel: 0.006, color: INGOT, bone: root, name: "ingot" });
    }),
  );

  // ---- pearl strand and chain ------------------------------------------------------------------------------------------
  const strand = catmull([
    [-0.28, rimY + 0.012, zc + 0.12],
    [-0.28, rimY - 0.005, frontZ + 0.005],
    [-0.27, y0 + 0.24, frontZ + 0.022],
    [-0.25, y0 + 0.1, frontZ + 0.03],
    [-0.2, FLOOR + 0.02, 0.0],
    [-0.1, FLOOR + 0.025, 0.1],
  ]);
  const pearls: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) pearls.push(strand.at(i / 20).clone());
  mergedSpheres(pearls, 0.016, "#f6efe6", [7, 5]);
  const chain = catmull([
    [-0.3, rimY + 0.012, zc + 0.12],
    [-0.31, rimY - 0.005, frontZ + 0.005],
    [-0.3, y0 + 0.2, frontZ + 0.015],
    [-0.29, y0 + 0.07, frontZ + 0.07],
    [-0.22, FLOOR + 0.02, 0.07],
  ]);
  b.sweep(chain, 0.005, { color: GOLD_FLAT, bone: root, sides: 5, name: "chain" });
  gem(V(-0.22, FLOOR + 0.02, 0.07), V(0.2, 1, 0.5), 0.045, GEM.ruby, 0.6);

  // ---- loose gold rings ----------------------------------------------------------------------------------------------------
  for (const [x, z, ry] of [[-0.3, 0.98, 20], [0.6, 0.82, 70]] as [number, number, number][]) {
    b.part(new THREE.TorusGeometry(0.04, 0.009, 6, 12), GOLD_FLAT, { bone: root, at: [x, FLOOR + 0.012, z], rotation: [90, ry, 0], flat: true, name: "ring" });
  }

  // ---- sparkles ------------------------------------------------------------------------------------------------------------
  // ---- glowing hextech ring on the base --------------------------------------------------------------------------------
  glow(
    b.lathe(
      [
        [1.14, 0.14],
        [1.19, 0.14],
        [1.19, 0.162],
        [1.14, 0.162],
      ],
      { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: "#5ff2ff", bone: root, name: "hexGlowRing" },
    ),
    1.1,
  );

  // ---- planted greatsword ------------------------------------------------------------------------------------------------
  {
    const tip = V(-0.45, 0.14, 0.02);
    const dir = V(0.1, 1, -0.05).normalize();
    const C = tip.clone().addScaledVector(dir, 0.55);
    const Q = aim(dir);
    const { L, D } = xf(C, Q);
    const bladeX = D(1, 0, 0);
    const bladeY = D(0, 1, 0);
    b.extrude(
      [
        [-0.038, 0],
        [-0.03, -0.45],
        [0, -0.55, "sharp"],
        [0.03, -0.45],
        [0.038, 0],
      ],
      { at: C, x: bladeX, y: bladeY, thickness: 0.016, bevel: 0.004, color: SILVER, bone: root, name: "swordBlade" },
    );
    glow(
      b.extrude(
        [
          [-0.006, -0.03],
          [-0.005, -0.42],
          [0.005, -0.42],
          [0.006, -0.03],
        ],
        { at: C, x: bladeX, y: bladeY, thickness: 0.021, color: "#5ff2ff", bone: root, name: "swordFuller" },
      ),
      1,
    );
    b.part(new THREE.BoxGeometry(0.22, 0.032, 0.05), GILT, { bone: root, at: L(0, 0.008, 0), quat: Q, name: "swordGuard" });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.024, 7, 5), GOLD_FLAT, { bone: root, at: L(s * 0.112, 0.008, 0), flat: true, name: "swordGuardCap" });
    b.part(new THREE.CylinderGeometry(0.015, 0.017, 0.13, 7), "#7a1428", { bone: root, at: L(0, 0.08, 0), quat: Q, flat: true, name: "swordGrip" });
    for (const k of [0.04, 0.08, 0.12])
      b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.009, 7), GOLD_FLAT, { bone: root, at: L(0, k, 0), quat: Q, flat: true, name: "swordWrap" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD_FLAT, { bone: root, at: L(0, 0.155, 0), flat: true, name: "swordPommel" });
    gem(L(0, 0.178, 0), D(0, 1, 0), 0.03, GEM.ruby, 0.7);
    gem(L(0, 0.025, 0.026), D(0, 0.1, 1), 0.022, GEM.aqua, 0.7, 6);
  }

  const sparks: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 18; i++) {
    const x = rr(-1, 1);
    const z = rr(-0.6, 0.9);
    sparks.push(frame([x, H(x, z) + rr(0.15, 0.6), z], [0, 1, 0]));
  }
  glow(b.cards(sparks, STAR, { size: [0.07, 0.09], cross: true, vary: 0.5, rng: R, bone: root }), 1);

  return b.root;
}
