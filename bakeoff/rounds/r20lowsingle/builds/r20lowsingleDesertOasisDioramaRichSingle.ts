import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, grain, mottle, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sunny Oasis Camp",
  description:
    "A chunky low-poly desert oasis diorama: faceted strata base, a turquoise pond ringed with rocks, reeds and lilies, four leaning palms, two striped tents with rugs and bunting, a drinking camel and a resting camel, a campfire, crates, pots, cacti and a swinging signpost.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const G = 0.172; // sand surface height
const DEGR = Math.PI / 180;

// palette
const STR1 = "#a8714a";
const STR2 = "#8a5638";
const STR3 = "#c58b58";
const STR4 = "#e3b676";
const SAND = "#e8c98a";
const SAND2 = "#d9b270";
const SAND3 = "#f2dca6";
const WET = "#b98f55";
const GRASS = "#6fae3f";
const GRASS2 = "#4f8c34";
const WATER = "#35b3c9";
const WATER2 = "#1f8fb0";
const WATERL = "#7ad7e0";
const ROCK = "#9b8f84";
const ROCK2 = "#7c7068";
const BARK = "#8a5a35";
const BARK2 = "#5e3a22";
const FROND1 = "#3f9e45";
const FROND2 = "#2e8240";
const FROND3 = "#7cc455";
const RIB = "#6d8a3a";
const COCO = "#5a3a22";
const DATE = "#e07a1f";
const RED = "#d0462f";
const CREAM = "#f6e8c8";
const CLOTH2 = "#2a7fa0";
const CLOTHD = "#1d5f7c";
const ORANGE = "#e8902f";
const GOLD = "#e8b830";
const DARK = "#2a1d1a";
const DOOR = "#3a2418";
const WOOD = "#b8814a";
const WOOD2 = "#8a5a30";
const CAMEL = "#c9964f";
const CAMEL2 = "#a8733a";
const CAMELB = "#8a5a34";
const CAMELB2 = "#5f3b22";
const BELLY = "#e6c690";
const PAD = "#6a4a35";
const WHITE = "#ffffff";
const PINK = "#f06ba0";
const LILY = "#58b848";
const CACT = "#4fa05a";
const CACTD = "#37803f";
const TERRA = "#c8613a";
const FIREO = "#ff8a1f";
const FIREY = "#ffd23a";
const ROPE = "#d8c08a";
const IRON = "#4a4a52";
const PURPLE = "#7c4fa8";
const TEAL = "#1fa59a";
const BONE = "#efe6cf";
const LAMP = "#ffd36a";

const LEAF: Array<[number, number]> = [
  [0, -0.06],
  [0.22, -1],
  [0.34, -0.55],
  [0.56, -0.95],
  [0.66, -0.45],
  [0.84, -0.55],
  [1, 0],
  [0.84, 0.55],
  [0.66, 0.45],
  [0.56, 0.95],
  [0.34, 0.55],
  [0.22, 1],
  [0, 0.06],
];

const POT: Array<[number, number]> = [
  [0, 0],
  [0.04, 0],
  [0.07, 0.06],
  [0.075, 0.1],
  [0.05, 0.15],
  [0.04, 0.165],
  [0.055, 0.19],
  [0.045, 0.19],
  [0.035, 0.17],
  [0, 0.17],
];

export default function build() {
  const b = createBuilder({ name: "desertOasis", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const signJ = b.joint("signSwing", { parent: root, at: [-0.9, 0.93, -0.1], dir: [0, -1, 0], role: "hinge" });
  const R = { bone: root };

  const part = (geo: THREE.BufferGeometry, color: string | Paint, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ico = (r: number, d = 0) => new THREE.IcosahedronGeometry(r, d);
  const leaf = (L: number, w: number): Array<[number, number]> =>
    LEAF.map(([u, v]): [number, number] => [u * L, v * w]);
  const mapper = (x: number, z: number, yaw: number, s = 1) => {
    const c = Math.cos(yaw);
    const sn = Math.sin(yaw);
    return {
      deg: (yaw * 180) / Math.PI,
      xdir: [c, 0, -sn],
      L: (lx: number, ly: number, lz: number): number[] => [x + s * (lx * c + lz * sn), G + s * ly, z + s * (-lx * sn + lz * c)],
      Dv: (lx: number, ly: number, lz: number): number[] => [lx * c + lz * sn, ly, -lx * sn + lz * c],
    };
  };
  const disc = (cx: number, cz: number, rx: number, rz: number, y: number, color: string | Paint, h = 0.006, seg = 16, rot = 0) =>
    part(cyl(1, 1, h, seg), color, [cx, y + h / 2, cz], { scale: [rx, 1, rz], rotation: [0, rot, 0] });

  // ---------- textures ----------
  const RUGT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><rect width="64" height="40" fill="#b8352a"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#f3e2b3" stroke-width="2"/><rect x="7" y="7" width="50" height="26" fill="#2a5f8f"/><path d="M32 9 L50 20 L32 31 L14 20Z" fill="#e8b830"/><path d="M32 13 L44 20 L32 27 L20 20Z" fill="#b8352a"/><circle cx="32" cy="20" r="3.5" fill="#f3e2b3"/><path d="M9 9 L13 9 L9 13Z M55 9 L51 9 L55 13Z M9 31 L13 31 L9 27Z M55 31 L51 31 L55 27Z" fill="#f3e2b3"/></svg>`,
    { size: 192 },
  );
  const CRATET = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#e8b830" stroke="#3a2418" stroke-width="2"/><path d="M16 3V7M16 25V29M3 16H7M25 16H29M7 7L10 10M22 22L25 25M25 7L22 10M10 22L7 25" stroke="#3a2418" stroke-width="2.2" fill="none"/></svg>`,
    { size: 128 },
  );
  const SIGNT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 20"><path d="M10 18 Q12 10 14 4" stroke="#4a2c14" stroke-width="2.6" fill="none"/><path d="M14 4 Q22 1 25 8 Q19 5 14 4Z" fill="#2e8240"/><path d="M14 4 Q6 1 3 8 Q9 5 14 4Z" fill="#3f9e45"/><path d="M14 4 Q15 -1 20 0 Q16 2 14 4Z" fill="#7cc455"/><path d="M30 14 q3-3.5 6 0 t6 0 t6 0 t6 0" stroke="#1f8fb0" stroke-width="2.4" fill="none"/><path d="M30 8 q3-3.5 6 0 t6 0 t6 0 t6 0" stroke="#1f8fb0" stroke-width="2.4" fill="none"/></svg>`,
    { size: 224 },
  );
  const GRASST = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><path d="M16 48 L3 7 L12 30 L14 2 L18 28 L27 9 L22 48Z" fill="#5fa83a"/><path d="M16 48 L9 20 L15 34 L17 12 L20 36 L24 48Z" fill="#8cd04f"/></svg>`,
    { size: 128 },
  );
  const REEDT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64"><path d="M12 64 L7 4 L12 40 L13 0 L16 42 L21 8 L15 64Z" fill="#6aa236"/><path d="M12 64 L12 20 L14 44 L15 64Z" fill="#9ccf5a"/></svg>`,
    { size: 160 },
  );
  const RIPPLE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><ellipse cx="30" cy="25" rx="14" ry="6" fill="none" stroke="#d6f4f7" stroke-width="2.6" opacity="0.9"/><ellipse cx="30" cy="25" rx="7" ry="3" fill="none" stroke="#d6f4f7" stroke-width="2.6" opacity="0.9"/><ellipse cx="68" cy="44" rx="16" ry="7" fill="none" stroke="#d6f4f7" stroke-width="2.6" opacity="0.9"/><ellipse cx="68" cy="44" rx="8" ry="3.5" fill="none" stroke="#d6f4f7" stroke-width="2.6" opacity="0.9"/><path d="M45 12 q4-3 8 0 t8 0" stroke="#d6f4f7" stroke-width="2.6" fill="none"/><path d="M15 52 q4-3 8 0 t8 0" stroke="#d6f4f7" stroke-width="2.6" fill="none"/></svg>`,
    { size: 256 },
  );

  // ---------- paints ----------
  const sandP = stripes(mottle(SAND, SAND3, { size: 0.5, seed: 2 }), SAND2, {
    size: 0.075,
    axis: [0.35, 0, 1],
    width: 0.22,
    wobble: 0.7,
    seed: 5,
  });
  const woodP = grain(WOOD, WOOD2, { size: 0.02, axis: "y", seed: 3 });
  const waterP = mottle(WATER, WATERL, { size: 0.22, seed: 8, contrast: 0.8 });

  // ---------- base ----------
  const layer = (y0: number, y1: number, r: number, color: string) =>
    b.lathe(
      [
        [0, y0],
        [r, y0],
        [r, y1],
        [0, y1],
      ],
      { at: [0, 0, 0], segments: 10, color, ...R },
    );
  layer(0, 0.05, 1.52, STR1);
  layer(0.05, 0.09, 1.55, STR2);
  layer(0.09, 0.13, 1.52, STR3);
  layer(0.13, 0.15, 1.55, SAND2);
  b.lathe(
    [
      [0, 0.13],
      [1.52, 0.13],
      [1.5, 0.15],
      [1.4, 0.165],
      [1.0, 0.172],
      [0, 0.18],
    ],
    { at: [0, 0, 0], segments: 10, color: sandP, ...R },
  );
  // strata cracks
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    part(box(0.02, 0.05, 0.02), STR2, [Math.sin(a) * 1.5, 0.045, Math.cos(a) * 1.5], { rotation: [0, (a * 180) / Math.PI, 0] });
    part(box(0.03, 0.035, 0.02), STR4, [Math.sin(a + 0.3) * 1.53, 0.11, Math.cos(a + 0.3) * 1.53], { rotation: [0, ((a + 0.3) * 180) / Math.PI, 0] });
  }

  // dunes
  const dune = (x: number, z: number, sx: number, h: number, sz: number, rot: number) =>
    part(ico(1, 2), sandP, [x, G - 0.02, z], { scale: [sx, h, sz], rotation: [0, rot, 0] });
  dune(-0.95, 0.75, 0.38, 0.1, 0.26, 35);
  dune(1.1, 0.0, 0.2, 0.07, 0.3, 10);
  dune(-1.15, -0.1, 0.18, 0.06, 0.25, -10);

  // ---------- pond ----------
  const PX = 0;
  const PZ = 0.15;
  disc(PX, PZ, 0.86, 0.64, G + 0.002, GRASS, 0.008, 16);
  disc(PX - 0.3, PZ - 0.45, 0.22, 0.14, G + 0.004, GRASS2, 0.008, 8, 20);
  disc(PX + 0.5, PZ + 0.52, 0.2, 0.12, G + 0.004, GRASS2, 0.008, 8, -30);
  disc(PX, PZ, 0.7, 0.5, G + 0.004, WET, 0.008, 16);
  disc(PX, PZ, 0.58, 0.42, G + 0.006, waterP, 0.01, 16);
  disc(PX, PZ, 0.38, 0.25, G + 0.008, WATER2, 0.01, 14);
  b.part(new THREE.PlaneGeometry(1.0, 0.68), WHITE, {
    bone: root,
    at: [PX, G + 0.0195, PZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RIPPLE,
  });
  const rr = rng(21);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const j = rr() * 0.04;
    const rad = 0.06 + rr() * 0.035;
    part(ico(rad, 0), i % 2 ? ROCK : ROCK2, [PX + Math.cos(a) * (0.62 + j), G + 0.018, PZ + Math.sin(a) * (0.46 + j)], {
      scale: [1.1, 0.7, 1],
      rotation: [0, rr() * 180, 0],
    });
  }
  const lilies: Array<[number, number]> = [
    [-0.2, 0.0],
    [0.15, 0.15],
    [0.3, -0.05],
    [-0.05, 0.22],
    [0.02, -0.12],
  ];
  lilies.forEach(([lx, lz], i) => {
    disc(PX + lx, PZ + lz, 0.05 + (i % 2) * 0.01, 0.05 + (i % 2) * 0.01, G + 0.016, LILY, 0.004, 8, i * 40);
    if (i % 2 === 0) part(new THREE.ConeGeometry(0.02, 0.04, 6), PINK, [PX + lx, G + 0.04, PZ + lz]);
  });
  // cattails
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * (1.15 + i * 0.22);
    const px = PX + Math.cos(a) * 0.66;
    const pz = PZ + Math.sin(a) * 0.5;
    b.rod([px, G, pz], [px + 0.01, G + 0.26, pz], 0.005, { color: RIB, sides: 4, ...R });
    part(cyl(0.012, 0.012, 0.05, 6), BARK2, [px + 0.01, G + 0.27, pz]);
  }

  // ---------- palms ----------
  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number, dates: boolean) => {
    const r = rng(seed);
    const k = h / 1.45;
    const top = new THREE.Vector3(x + lx, G + h, z + lz);
    const trunk = catmull([
      [x, G - 0.03, z],
      [x + lx * 0.25, G + h * 0.35, z + lz * 0.25],
      [x + lx * 0.65, G + h * 0.7, z + lz * 0.65],
      [top.x, top.y, top.z],
    ]);
    b.sweep(trunk, [0.075 * k, 0.055 * k, 0.045 * k, 0.04 * k], {
      color: stripes(BARK, BARK2, { size: 0.055, axis: "y", width: 0.3, wobble: 0.15, seed }),
      sides: 6,
      ...R,
    });
    part(cyl(0.07 * k, 0.11 * k, 0.09 * k, 6), BARK2, [x, G + 0.02, z]);
    part(ico(0.06 * k, 1), BARK2, [top.x, top.y - 0.01, top.z]);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const yaw = (i / n) * Math.PI * 2 + r() * 0.3;
      const d = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      const side = new THREE.Vector3(d.z, 0, -d.x);
      const a0 = (30 + r() * 20 - (i % 2) * 12) * DEGR;
      const angs = [a0, a0 - 0.5, a0 - 1.15];
      const len = 0.3 * k * (0.9 + r() * 0.2);
      const p = top.clone().add(new THREE.Vector3(0, 0.02, 0));
      const pts: number[][] = [p.toArray()];
      angs.forEach((a, j) => {
        const t = d.clone().multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, Math.sin(a), 0)).normalize();
        b.extrude(leaf(len, 0.075 * k), {
          at: p.toArray(),
          x: t.toArray(),
          y: side.toArray(),
          thickness: 0.008,
          color: j === 1 ? FROND2 : j === 0 ? FROND1 : FROND3,
          ...R,
        });
        p.addScaledVector(t, len * 0.9);
        pts.push(p.toArray());
      });
      b.sweep(catmull(pts), 0.009 * k, { color: RIB, sides: 4, caps: "point", ...R });
    }
    for (let j = 0; j < 4; j++) {
      const a = j * (Math.PI / 2) + 0.4;
      part(ico(0.04 * k, 1), COCO, [top.x + Math.cos(a) * 0.06 * k, top.y - 0.06 * k, top.z + Math.sin(a) * 0.06 * k]);
    }
    if (dates)
      for (let j = 0; j < 6; j++) {
        const a = j * 1.05;
        part(ico(0.016, 0), DATE, [top.x + Math.cos(a) * 0.09 * k, top.y - 0.11 * k - (j % 2) * 0.02, top.z + Math.sin(a) * 0.09 * k]);
      }
  };
  palm(-0.62, -0.05, 1.45, -0.25, 0.1, 31, false);
  palm(0.72, 0.25, 1.25, 0.2, -0.1, 32, false);
  palm(0.3, -0.5, 1.7, -0.15, 0.3, 33, true);
  palm(-0.45, 0.55, 0.8, 0.05, 0.05, 34, false);

  // ---------- tents ----------
  const peg = (p: number[]) => b.spike(p, [0, -1, 0], 0.07, 0.012, { color: WOOD2, ...R });
  const pot = (x: number, z: number, s: number, c1: string, c2: string) =>
    b.lathe(
      POT.map(([px, py]): [number, number] => [px * s, py * s]),
      {
        at: [x, G - 0.005, z],
        segments: 10,
        color: stripes(c1, c2, { size: 0.05 * s, axis: "y", width: 0.25, wobble: 0.05 }),
        ...R,
      },
    );
  const tentA = (x: number, z: number, yaw: number) => {
    const { L, Dv, deg, xdir } = mapper(x, z, yaw);
    const cloth = stripes(CREAM, RED, { size: 0.11, axis: xdir, width: 0.5, wobble: 0.05, seed: 1 });
    const roofP = stripes(CLOTH2, CLOTHD, { size: 0.1, axis: xdir, width: 0.5, wobble: 0.05, seed: 2 });
    part(box(0.62, 0.26, 0.5), cloth, L(0, 0.125, 0), { rotation: [0, deg, 0] });
    part(new THREE.ConeGeometry(0.5, 0.36, 4).rotateY(Math.PI / 4).scale(1.02, 1, 0.86), roofP, L(0, 0.44, 0), { rotation: [0, deg, 0] });
    const cs: Array<[number, number]> = [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];
    cs.forEach(([sx, sz], i) => {
      const n = cs[(i + 1) % 4];
      b.rod(L(sx * 0.36, 0.262, sz * 0.304), L(n[0] * 0.36, 0.262, n[1] * 0.304), 0.012, { color: GOLD, ...R });
      b.rod(L(sx * 0.34, 0.255, sz * 0.28), L(sx * 0.64, 0.0, sz * 0.52), 0.005, { color: ROPE, sides: 4, ...R });
      peg(L(sx * 0.64, 0.035, sz * 0.52));
      part(ico(0.02, 0), GOLD, L(sx * 0.36, 0.262, sz * 0.304));
    });
    b.rod(L(0, 0.55, 0), L(0, 0.74, 0), 0.014, { color: WOOD2, sides: 6, ...R });
    part(ico(0.03, 1), GOLD, L(0, 0.76, 0));
    b.extrude(
      [
        [0, 0],
        [0.16, 0.015],
        [0, 0.06],
      ],
      { at: L(0, 0.67, 0), x: xdir, thickness: 0.006, color: RED, ...R },
    );
    // door
    part(box(0.2, 0.17, 0.012), DOOR, L(0, 0.095, 0.256), { rotation: [0, deg, 0] });
    b.rod(L(0.105, 0.01, 0.264), L(0.105, 0.2, 0.264), 0.01, { color: GOLD, sides: 5, ...R });
    b.rod(L(-0.105, 0.01, 0.264), L(-0.105, 0.2, 0.264), 0.01, { color: GOLD, sides: 5, ...R });
    b.rod(L(0.105, 0.2, 0.264), L(-0.105, 0.2, 0.264), 0.01, { color: GOLD, sides: 5, ...R });
    part(box(0.09, 0.19, 0.014), cloth, L(0.16, 0.1, 0.26), { rotation: [0, deg, 0] });
    part(box(0.09, 0.19, 0.014), cloth, L(-0.16, 0.1, 0.26), { rotation: [0, deg, 0] });
    // side window
    part(box(0.012, 0.08, 0.1), DOOR, L(0.316, 0.14, -0.05), { rotation: [0, deg, 0] });
    // rug
    b.part(new THREE.PlaneGeometry(0.42, 0.26), WHITE, {
      bone: root,
      at: L(0, 0.006, 0.46),
      dir: [0, 1, 0],
      axis: "z",
      up: Dv(0, 0, -1),
      texture: RUGT,
    });
    part(ico(0.06, 1), PURPLE, L(0.3, 0.035, 0.5), { scale: [1.3, 0.6, 1], rotation: [0, deg + 20, 0] });
    part(ico(0.055, 1), TEAL, L(-0.28, 0.035, 0.48), { scale: [1.3, 0.6, 1], rotation: [0, deg - 25, 0] });
    // lantern
    glow(part(box(0.05, 0.07, 0.05), LAMP, L(-0.2, 0.04, 0.58), { rotation: [0, deg, 0] }), 1.3);
    part(new THREE.ConeGeometry(0.04, 0.03, 4), DARK, L(-0.2, 0.09, 0.58), { rotation: [0, deg + 45, 0] });
    return L(0, 0.74, 0);
  };
  const tentB = (x: number, z: number, yaw: number) => {
    const { L, deg, xdir } = mapper(x, z, yaw);
    const wallP = stripes(CREAM, TEAL, { size: 0.1, axis: xdir, width: 0.5, wobble: 0.05, seed: 4 });
    const roofP = stripes(ORANGE, CREAM, { size: 0.09, axis: xdir, width: 0.4, wobble: 0.05, seed: 6 });
    part(cyl(0.34, 0.34, 0.24, 10), wallP, L(0, 0.115, 0), { rotation: [0, deg, 0] });
    part(new THREE.ConeGeometry(0.46, 0.4, 10), roofP, L(0, 0.44, 0), { rotation: [0, deg, 0] });
    part(new THREE.TorusGeometry(0.45, 0.014, 4, 10), GOLD, L(0, 0.245, 0), { rotation: [90, 0, 0] });
    b.rod(L(0, 0.62, 0), L(0, 0.84, 0), 0.012, { color: WOOD2, sides: 6, ...R });
    part(ico(0.035, 1), GOLD, L(0, 0.86, 0));
    b.extrude(
      [
        [0, 0],
        [0.18, 0.02],
        [0, 0.07],
      ],
      { at: L(0, 0.76, 0), x: xdir, thickness: 0.006, color: TEAL, ...R },
    );
    part(box(0.15, 0.16, 0.014), DOOR, L(0, 0.09, 0.338), { rotation: [0, deg, 0] });
    b.rod(L(0.08, 0.01, 0.346), L(0.08, 0.19, 0.346), 0.01, { color: GOLD, sides: 5, ...R });
    b.rod(L(-0.08, 0.01, 0.346), L(-0.08, 0.19, 0.346), 0.01, { color: GOLD, sides: 5, ...R });
    b.rod(L(0.08, 0.19, 0.346), L(-0.08, 0.19, 0.346), 0.01, { color: GOLD, sides: 5, ...R });
    part(box(0.07, 0.17, 0.014), wallP, L(0.13, 0.09, 0.335), { rotation: [0, deg + 15, 0] });
    part(box(0.07, 0.17, 0.014), wallP, L(-0.13, 0.09, 0.335), { rotation: [0, deg - 15, 0] });
    for (let i = 1; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const sa = Math.sin(a);
      const ca = Math.cos(a);
      b.rod(L(0.44 * sa, 0.255, 0.44 * ca), L(0.72 * sa, 0.03, 0.72 * ca), 0.005, { color: ROPE, sides: 4, ...R });
      peg(L(0.72 * sa, 0.035, 0.72 * ca));
    }
    part(ico(0.05, 1), CAMELB, L(-0.355, 0.13, 0.08), { scale: [0.8, 1.2, 0.8] });
    b.rod(L(-0.34, 0.2, 0.08), L(-0.34, 0.24, 0.08), 0.004, { color: ROPE, sides: 4, ...R });
    pot(L(0.5, 0, 0.35)[0], L(0.5, 0, 0.35)[2], 1.1, TERRA, CREAM);
    pot(L(0.58, 0, 0.2)[0], L(0.58, 0, 0.2)[2], 0.8, PURPLE, ORANGE);
  };
  const apexA = tentA(-0.8, -0.7, 0.5);
  tentB(0.85, -0.5, -0.6);

  // bunting from tent A pole to palm A
  {
    const pA = [apexA[0], apexA[1] - 0.04, apexA[2]];
    const pB = [-0.7, G + 0.62, -0.02];
    const rope = catmull([pA, [(pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2 - 0.1, (pA[2] + pB[2]) / 2], pB]);
    b.sweep(rope, 0.004, { color: ROPE, sides: 4, caps: "none", ...R });
    const cols = [RED, GOLD, TEAL, PINK, ORANGE];
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      const p = rope.at(t);
      const tg = rope.tangentAt(t);
      const hx = new THREE.Vector3(tg.x, 0, tg.z).normalize();
      b.extrude(
        [
          [-0.03, 0],
          [0.03, 0],
          [0, -0.07],
        ],
        { at: p.toArray(), x: hx.toArray(), y: [0, 1, 0], thickness: 0.006, color: cols[i % cols.length], ...R },
      );
    }
  }

  // ---------- camels ----------
  const camel = (o: {
    x: number;
    z: number;
    yaw: number;
    s: number;
    sit: boolean;
    drink: boolean;
    humps: number[];
    pack: boolean;
    coat: string;
    coat2: string;
    b1: string;
    b2: string;
  }) => {
    const { s, sit, drink } = o;
    const { L, Dv, deg, xdir } = mapper(o.x, o.z, o.yaw, s);
    const fur = countershade(mottle(o.coat, o.coat2, { size: 0.18, seed: 3 }), BELLY, { level: -0.35, soft: 0.3 });
    const by = sit ? 0.19 : 0.43;
    const ball = (l: number[], r: number, color: string | Paint, sc: number[] = [1, 1, 1], det = 1) =>
      part(ico(r * s, det), color, L(l[0], l[1], l[2]), { scale: sc, rotation: [0, deg, 0] });

    b.sweep([L(0, by, -0.27), L(0, by + 0.01, -0.02), L(0, by, 0.23)], [0.125 * s, 0.155 * s, 0.14 * s], { color: fur, sides: 8, ...R });
    for (const hz of o.humps) {
      ball([0, by + 0.14, hz], 0.105, fur, [0.95, 1.1, 1.1]);
      ball([0, by + 0.235, hz], 0.04, o.coat2, [1, 0.8, 1], 0);
    }
    // legs
    for (const sx of [1, -1]) {
      const fpts = sit
        ? [L(0.1 * sx, by, 0.14), L(0.115 * sx, 0.07, 0.27), L(0.115 * sx, 0.045, 0.1)]
        : [L(0.09 * sx, 0.4, 0.15), L(0.09 * sx, 0.21, 0.17), L(0.09 * sx, 0.07, 0.15)];
      b.sweep(fpts, [0.055 * s, 0.034 * s, 0.03 * s], { color: fur, sides: 6, ...R });
      const hpts = sit
        ? [L(0.1 * sx, by + 0.02, -0.2), L(0.13 * sx, 0.1, -0.3), L(0.13 * sx, 0.05, -0.1)]
        : [L(0.09 * sx, 0.42, -0.2), L(0.09 * sx, 0.27, -0.14), L(0.09 * sx, 0.15, -0.25), L(0.09 * sx, 0.06, -0.22)];
      b.sweep(hpts, sit ? [0.07 * s, 0.045 * s, 0.03 * s] : [0.06 * s, 0.045 * s, 0.032 * s, 0.03 * s], { color: fur, sides: 6, ...R });
      if (sit) {
        ball([0.115 * sx, 0.04, 0.1], 0.045, PAD, [1, 0.55, 1.3], 0);
        ball([0.13 * sx, 0.03, -0.1], 0.045, PAD, [1, 0.55, 1.3], 0);
      } else {
        ball([0.09 * sx, 0.025, 0.16], 0.045, PAD, [1, 0.55, 1.3], 0);
        ball([0.09 * sx, 0.025, -0.21], 0.045, PAD, [1, 0.55, 1.3], 0);
        ball([0.09 * sx, 0.21, 0.19], 0.03, o.coat2, [1, 1, 0.8], 0);
      }
    }
    // neck
    const npts = drink
      ? [L(0, by + 0.03, 0.2), L(0, 0.5, 0.34), L(0, 0.4, 0.46), L(0, 0.28, 0.52)]
      : [L(0, by + 0.03, 0.2), L(0, 0.6, 0.3), L(0, 0.74, 0.34), L(0, 0.84, 0.38)];
    const neck = b.sweep(catmull(npts), [0.08 * s, 0.058 * s, 0.048 * s], { color: fur, sides: 8, ...R });
    b.along(neck, 5, (at) => {
      b.spike(at, at, 0.055 * s, 0.022 * s, { color: o.coat2, ...R });
    });
    const nc = neck.curve();
    const cp = nc.at(0.55);
    const ct = nc.tangentAt(0.55);
    part(new THREE.TorusGeometry(0.064 * s, 0.01 * s, 4, 8), RED, cp.toArray(), { dir: ct.toArray(), axis: "z" });
    part(ico(0.016 * s, 0), GOLD, [cp.x, cp.y - 0.066 * s, cp.z]);

    // head
    const hd = new THREE.Vector3(...(drink ? [0, -0.8, 0.55] : [0, -0.25, 0.8])).normalize();
    const up = new THREE.Vector3(0, hd.z, -hd.y).normalize();
    const H = new THREE.Vector3(...(drink ? [0, 0.27, 0.53] : [0, 0.86, 0.4]));
    const hp = (f: number, u: number, sd: number) => L(sd, H.y + hd.y * f + up.y * u, H.z + hd.z * f + up.z * u);
    b.capsule(hp(0, 0, 0), hp(0.16, 0, 0), [0.055 * s, 0.042 * s], { color: fur, sides: 8, ...R });
    part(ico(0.043 * s, 1), BELLY, hp(0.2, -0.005, 0), { scale: [1.1, 0.85, 1.2], rotation: [0, deg, 0] });
    for (const sd of [1, -1]) {
      part(ico(0.008 * s, 0), DARK, hp(0.238, 0.012, sd * 0.018));
      part(ico(0.019 * s, 1), WHITE, hp(0.075, 0.03, sd * 0.045));
      part(ico(0.012 * s, 0), DARK, hp(0.085, 0.033, sd * 0.053));
      part(ico(0.005 * s, 0), WHITE, hp(0.09, 0.04, sd * 0.056));
      part(ico(0.02 * s, 0), o.coat2, hp(0.07, 0.05, sd * 0.045), { scale: [1, 0.5, 1] });
      b.spike(hp(-0.01, 0.04, sd * 0.035), hp(-0.035, 0.09, sd * 0.055), null, 0.02 * s, { color: o.coat2, ...R });
      part(ico(0.01 * s, 0), PINK, hp(0.0, 0.055, sd * 0.045));
      part(ico(0.014 * s, 0), GOLD, hp(0.15, -0.045, sd * 0.05));
    }
    b.spike(hp(0, 0.05, 0), hp(-0.01, 0.095, 0), null, 0.02 * s, { color: o.coat2, ...R });
    part(new THREE.TorusGeometry(0.048 * s, 0.007 * s, 4, 8), RED, hp(0.15, 0, 0), { dir: Dv(0, hd.y, hd.z), axis: "z" });

    // tail
    const tpts = sit
      ? [L(0, 0.22, -0.27), L(0, 0.1, -0.42), L(0, 0.04, -0.34)]
      : [L(0, by + 0.03, -0.27), L(0, 0.4, -0.35), L(0, 0.22, -0.36)];
    b.sweep(tpts, [0.02 * s, 0.015 * s, 0.012 * s], { color: o.coat, sides: 5, ...R });
    ball(sit ? [0, 0.04, -0.33] : [0, 0.2, -0.36], 0.03, o.coat2, [1, 1.4, 1], 0);

    // blanket and packs
    const bz = o.pack ? -0.015 : -0.2;
    const blanketP = stripes(o.b1, o.b2, { size: 0.045 * s, axis: xdir, width: 0.5, wobble: 0.05, seed: 9 });
    if (o.pack) {
      ball([0, by + 0.17, bz], 0.1, blanketP, [1.2, 0.75, 1.0]);
      b.rod(L(-0.12, by + 0.16, bz - 0.09), L(0.12, by + 0.16, bz + 0.09), 0.007 * s, { color: ROPE, sides: 4, ...R });
      b.rod(L(-0.12, by + 0.16, bz + 0.09), L(0.12, by + 0.16, bz - 0.09), 0.007 * s, { color: ROPE, sides: 4, ...R });
      for (const sx of [1, -1]) part(cyl(0.05 * s, 0.045 * s, 0.1 * s, 8), woodP, L(0.19 * sx, by + 0.01, bz), { rotation: [0, deg, 0] });
    } else {
      part(box(0.3 * s, 0.035 * s, 0.16 * s), blanketP, L(0, by + 0.145, bz), { rotation: [0, deg, 0] });
      for (const sx of [1, -1]) {
        part(box(0.03 * s, 0.14 * s, 0.15 * s), blanketP, L(0.16 * sx, by + 0.075, bz), { rotation: [0, deg, 0] });
        part(box(0.06 * s, 0.11 * s, 0.11 * s), TERRA, L(0.2 * sx, by + 0.01, bz), { rotation: [0, deg, 0] });
        for (const fz of [-0.06, -0.02, 0.02, 0.06]) ball([0.162 * sx, by + 0.0, bz + fz], 0.012, GOLD, [1, 1, 1], 0);
      }
    }
  };
  camel({
    x: -0.15,
    z: 1.0,
    yaw: Math.PI,
    s: 1.0,
    sit: false,
    drink: true,
    humps: [-0.04],
    pack: false,
    coat: CAMEL,
    coat2: CAMEL2,
    b1: RED,
    b2: GOLD,
  });
  camel({
    x: 0.75,
    z: 0.85,
    yaw: -2.2,
    s: 0.95,
    sit: true,
    drink: false,
    humps: [0.1, -0.13],
    pack: true,
    coat: CAMELB,
    coat2: CAMELB2,
    b1: TEAL,
    b2: CREAM,
  });

  // ---------- campfire ----------
  {
    const fx = 0.15;
    const fz = -0.85;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      part(ico(0.032, 0), i % 2 ? ROCK : ROCK2, [fx + Math.cos(a) * 0.14, G + 0.01, fz + Math.sin(a) * 0.14], { scale: [1, 0.7, 1] });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.rod([fx + Math.cos(a) * 0.11, G + 0.02, fz + Math.sin(a) * 0.11], [fx + Math.cos(a) * 0.01, G + 0.045, fz + Math.sin(a) * 0.01], 0.014, { color: WOOD2, sides: 5, ...R });
    }
    glow(part(new THREE.ConeGeometry(0.05, 0.15, 5), FIREO, [fx, G + 0.1, fz]), 1.4);
    glow(part(new THREE.ConeGeometry(0.03, 0.11, 5), FIREY, [fx, G + 0.085, fz + 0.01]), 1.6);
    glow(part(new THREE.ConeGeometry(0.025, 0.09, 4), FIREO, [fx + 0.04, G + 0.07, fz - 0.02]), 1.4);
    for (let i = 0; i < 4; i++) glow(part(ico(0.006, 0), FIREY, [fx + (i - 1.5) * 0.03, G + 0.2 + i * 0.03, fz + (i % 2) * 0.03]), 1.6);
    const apex = [fx, G + 0.34, fz];
    for (let i = 0; i < 3; i++) {
      const a = 0.5 + i * 2.09;
      b.rod([fx + Math.cos(a) * 0.2, G, fz + Math.sin(a) * 0.2], apex, 0.008, { color: WOOD2, sides: 5, ...R });
    }
    b.rod(apex, [fx, G + 0.27, fz], 0.003, { color: ROPE, sides: 4, ...R });
    part(ico(0.045, 1), IRON, [fx, G + 0.24, fz], { scale: [1, 0.8, 1] });
    part(new THREE.TorusGeometry(0.04, 0.007, 4, 8), IRON, [fx, G + 0.27, fz], { rotation: [90, 0, 0] });
  }

  // ---------- crates, barrel, pots ----------
  const crate = (x: number, z: number, y: number, sz: number, yaw: number) => {
    const m = mapper(x, z, yaw);
    part(box(sz, sz, sz), woodP, m.L(0, y + sz / 2, 0), { rotation: [0, m.deg, 0] });
    for (const hy of [0.15, 0.85]) part(box(sz + 0.008, 0.02, sz + 0.008), WOOD2, m.L(0, y + sz * hy, 0), { rotation: [0, m.deg, 0] });
    for (const [cx, cz] of [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ])
      part(box(0.022, sz + 0.004, 0.022), WOOD2, m.L((cx * sz) / 2, y + sz / 2, (cz * sz) / 2), { rotation: [0, m.deg, 0] });
    b.part(new THREE.PlaneGeometry(0.65 * sz, 0.65 * sz), WHITE, {
      bone: root,
      at: m.L(0, y + sz / 2, sz / 2 + 0.014),
      dir: m.Dv(0, 0, 1),
      axis: "z",
      texture: CRATET,
    });
    return y + sz;
  };
  const top1 = crate(-0.28, -0.72, G - 0.005, 0.17, 0.3);
  crate(-0.24, -0.72, top1, 0.12, 0.9);
  crate(-0.12, -0.9, G - 0.005, 0.13, -0.4);
  // barrel
  {
    const bx = 0.45;
    const bz = -1.0;
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.085, 0.05],
        [0.09, 0.1],
        [0.085, 0.15],
        [0.07, 0.2],
        [0, 0.2],
      ],
      { at: [bx, G - 0.005, bz], segments: 10, color: woodP, ...R },
    );
    for (const hy of [0.04, 0.16]) part(new THREE.TorusGeometry(0.083, 0.007, 4, 10), IRON, [bx, G + hy, bz], { rotation: [90, 0, 0] });
    part(cyl(0.065, 0.065, 0.006, 10), WOOD2, [bx, G + 0.198, bz]);
  }
  pot(1.0, -0.05, 1.0, TERRA, CREAM);
  pot(1.12, 0.04, 0.7, PURPLE, ORANGE);
  pot(-0.55, -0.45, 0.8, TEAL, CREAM);

  // ---------- cacti ----------
  const cactus = (x: number, z: number, h: number, flower: boolean) => {
    b.sweep(
      [
        [x, G - 0.02, z],
        [x, G + h, z],
      ],
      0.05,
      { color: grain(CACT, CACTD, { size: 0.02, axis: "y", seed: 4 }), sides: 6, ...R },
    );
    for (const sx of [1, -1]) {
      const hh = h * (sx > 0 ? 0.4 : 0.3);
      b.sweep(
        [
          [x + sx * 0.04, G + hh, z],
          [x + sx * 0.13, G + hh + 0.02, z],
          [x + sx * 0.13, G + hh + h * 0.28, z],
        ],
        0.03,
        { color: grain(CACT, CACTD, { size: 0.02, axis: "y", seed: 5 }), sides: 6, ...R },
      );
    }
    if (flower) part(ico(0.025, 0), PINK, [x, G + h + 0.04, z]);
  };
  cactus(-1.1, 0.4, 0.34, true);
  cactus(1.15, 0.62, 0.26, false);

  // ---------- sign ----------
  b.sweep(
    [
      [-1.05, G - 0.02, -0.1],
      [-1.05, 0.95, -0.1],
    ],
    0.02,
    { color: woodP, sides: 6, ...R },
  );
  b.rod([-1.06, 0.95, -0.1], [-0.76, 0.95, -0.1], 0.014, { color: WOOD2, sides: 6, ...R });
  b.rod([-0.9, 0.95, -0.1], [-0.98, 0.9, -0.1], 0.003, { color: ROPE, sides: 4, bone: signJ });
  b.rod([-0.9, 0.95, -0.1], [-0.84, 0.9, -0.1], 0.003, { color: ROPE, sides: 4, bone: signJ });
  b.extrude(
    [
      [-0.08, 0],
      [0.2, 0],
      [0.26, -0.05],
      [0.2, -0.1],
      [-0.08, -0.1],
    ],
    { at: [-0.9, 0.9, -0.1], x: [1, 0, 0], thickness: 0.014, color: woodP, bone: signJ },
  );
  b.part(new THREE.PlaneGeometry(0.26, 0.09), WHITE, {
    bone: signJ,
    at: [-0.87, 0.85, -0.1 + 0.0078],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGNT,
  });

  // ---------- bones ----------
  {
    const kx = -0.72;
    const kz = 0.88;
    part(ico(0.05, 1), BONE, [kx, G + 0.03, kz], { scale: [1, 0.8, 1.25], rotation: [0, 30, 0] });
    part(ico(0.03, 0), BONE, [kx + 0.03, G + 0.025, kz + 0.07], { scale: [1, 0.8, 1.2], rotation: [0, 30, 0] });
    b.spike([kx - 0.04, G + 0.05, kz], [kx - 0.1, G + 0.09, kz - 0.02], null, 0.014, { color: BONE, ...R });
    b.spike([kx + 0.04, G + 0.05, kz], [kx + 0.1, G + 0.09, kz + 0.02], null, 0.014, { color: BONE, ...R });
    part(ico(0.012, 0), DARK, [kx - 0.025, G + 0.055, kz + 0.04]);
    part(ico(0.012, 0), DARK, [kx + 0.025, G + 0.055, kz + 0.05]);
    for (let i = 0; i < 3; i++) {
      const rx = kx + 0.14 + i * 0.05;
      b.sweep(
        catmull([
          [rx, G, kz - 0.05],
          [rx, G + 0.07, kz - 0.02],
          [rx, G + 0.1, kz + 0.05],
          [rx, G + 0.06, kz + 0.12],
          [rx, G, kz + 0.15],
        ]),
        0.008,
        { color: BONE, sides: 5, ...R },
      );
    }
  }

  // ---------- mesas ----------
  const mesa = (x: number, z: number, base: number, n: number, seed: number) => {
    const r = rng(seed);
    const cols = [STR3, STR1, STR4, STR2, STR3, STR4];
    const hgt = 0.09;
    for (let i = 0; i < n; i++) {
      const rb = base * (1 - i * 0.08) + r() * 0.01;
      part(cyl(rb * 0.92, rb, hgt, 6), cols[i % cols.length], [x + (r() - 0.5) * 0.015, G - 0.01 + i * hgt + hgt / 2, z], { rotation: [0, r() * 60, 0] });
    }
    part(cyl(base * 0.55, base * 0.7, 0.03, 6), SAND2, [x, G - 0.01 + n * hgt + 0.012, z]);
    for (let i = 0; i < 3; i++) {
      const a = r() * Math.PI * 2;
      part(ico(0.04 + r() * 0.03, 0), i % 2 ? ROCK : ROCK2, [x + Math.cos(a) * (base + 0.05), G + 0.02, z + Math.sin(a) * (base + 0.05)], { scale: [1, 0.7, 1] });
    }
  };
  mesa(0.1, -1.22, 0.2, 5, 41);
  mesa(-0.2, -1.27, 0.14, 3, 42);

  // ---------- footprints ----------
  for (let i = 0; i < 8; i++) {
    const px = 0.5 - i * 0.1;
    const pz = 1.2 + (i % 2) * 0.07;
    disc(px, pz, 0.02, 0.028, G + 0.004, WET, 0.004, 6, 10 * i);
  }

  // ---------- grass tufts and reeds ----------
  const tr = rng(51);
  const tufts: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + tr() * 0.2;
    tufts.push(frame([PX + Math.cos(a) * (0.78 + tr() * 0.06), G + 0.01, PZ + Math.sin(a) * (0.57 + tr() * 0.05)], [0, 1, 0]));
  }
  const palmBases: Array<[number, number]> = [
    [-0.62, -0.05],
    [0.72, 0.25],
    [0.3, -0.5],
    [-0.45, 0.55],
    [-1.1, 0.4],
    [1.15, 0.62],
  ];
  for (const [bx, bz] of palmBases)
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + tr();
      tufts.push(frame([bx + Math.cos(a) * 0.13, G + 0.005, bz + Math.sin(a) * 0.13], [0, 1, 0]));
    }
  b.cards(tufts, GRASST, { size: [0.07, 0.1], cross: true, vary: 0.3, spin: 180, rng: rng(52), bone: root });
  const reedFrames: Array<ReturnType<typeof frame>> = [];
  for (let i = 0; i < 14; i++) {
    const a = Math.PI + tr() * Math.PI;
    reedFrames.push(frame([PX + Math.cos(a) * 0.64, G + 0.01, PZ + Math.sin(a) * 0.46], [0, 1, 0]));
  }
  b.cards(reedFrames, REEDT, { size: [0.05, 0.24], cross: true, vary: 0.3, spin: 180, rng: rng(53), bone: root });

  b.pose(signJ, { axis: [0, 0, 1], deg: 7 });
  return b.root;
}
