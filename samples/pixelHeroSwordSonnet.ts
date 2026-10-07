import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { noise } from "../src/paint";
import type { Paint } from "../src/paint";
import { catmull } from "../src/path";
import { glow } from "../kits/glow";
import { cellPaint, pixelArt, pixelTexture, stepped, tileBox } from "../kits/pixel";

export const meta = {
  name: "Sword in the Stone",
  description:
    "A legendary hero sword sunk into a mossy, cracked boulder inside a ring of rune stelae, hilt wrapped in leather with a red ribbon, runes glowing along the blade, failed challengers' rusty swords in the turf. Voxel-chunky pixel art.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palettes and pixel paints
const STONE_R = ["#2c3140", "#3f4659", "#586077", "#747d93", "#959db1", "#b8bfcf"];
const MOSS_R = ["#17301a", "#25491f", "#386b27", "#4f9433", "#78bd45", "#a6dd68"];
const GRASS_R = ["#1d4a1c", "#2b6a25", "#3c8a2e", "#56ab3a", "#7acb4b", "#a3e066"];
const DIRT_R = ["#2b1d14", "#42291a", "#5b3b22", "#7a5230", "#9a6d3f"];
const GOLD_R = ["#4e300c", "#7c4d12", "#b87a1c", "#e6ab2e", "#ffd95a", "#fff3b0"];
const STEEL_R = ["#2a3552", "#44567e", "#6d84b0", "#a3b8dc", "#d5e4f7", "#f4faff"];
const RIBBON_R = ["#4a0f1a", "#7a1526", "#b02034", "#d9374b", "#f06a73"];
const RUST_R = ["#3b2a20", "#5b4030", "#7d5a42", "#9c7556", "#b89574"];

const G = 0.1; // top of the turf
const ST = 0.6; // top of the boulder's plateau

const stonePaint = cellPaint(
  0.02,
  (c) => {
    const lit = 0.5 + 0.26 * c.n.y + 0.08 * Math.abs(c.n.z) - 0.1 * c.n.x;
    const grain = (noise(c.at, 0.16, 1) - 0.5) * 0.3 + (c.random(1) - 0.5) * 0.08;
    if (Math.abs(noise(c.at, 0.09, 7) - 0.5) < 0.011 && c.at.y > 0.06) return STONE_R[0];
    const low = Math.max(0, 1 - (c.at.y - G) / 0.22);
    const moss = noise(c.at, 0.22, 5) * 0.9 + 0.35 * c.n.y + 0.3 * low + (c.random(9) - 0.5) * 0.14;
    if (moss > 0.8) return c.pick(MOSS_R, 0.4 + 0.3 * c.n.y + 0.6 * (noise(c.at, 0.1, 6) - 0.5) + (c.random(2) - 0.5) * 0.3);
    const r = c.random(3);
    if (r < 0.006) return "#cfc27a";
    if (c.random(4) < 0.015) return STONE_R[5];
    if (c.random(5) < 0.025) return STONE_R[1];
    return c.pick(STONE_R, lit + grain);
  },
  { dither: true },
);

const groundPaint = cellPaint(
  0.02,
  (c) => {
    if (c.n.y > 0.5) {
      const f = c.random(4);
      if (f < 0.012) return ["#fff4d0", "#ffd23f", "#ff8fb1", "#9bd8ff"][Math.floor(c.random(8) * 4)];
      if (noise(c.at, 0.3, 9) > 0.8) return c.pick(DIRT_R, 0.55 + (c.random(6) - 0.5) * 0.5);
      return c.pick(GRASS_R, 0.45 + 0.8 * (noise(c.at, 0.3, 2) - 0.5) + (c.random(7) - 0.5) * 0.4);
    }
    if (c.at.y > 0.08 || (c.at.y > 0.06 && c.random(5) > 0.55)) return c.pick(GRASS_R, 0.2 + c.random(1) * 0.3);
    if (c.random(6) < 0.09) return c.pick(STONE_R, 0.3 + c.random(7) * 0.4);
    return c.pick(DIRT_R, 0.55 - 0.35 * ((G - c.at.y) / G) + (c.random(8) - 0.5) * 0.4);
  },
  { dither: true },
);

const goldPaint = cellPaint(
  0.01,
  (c) => {
    if (c.random(2) < 0.025) return GOLD_R[1];
    return c.pick(GOLD_R, 0.46 + 0.28 * c.n.y + 0.14 * Math.abs(c.n.z) - 0.1 * c.n.x + (c.random(1) - 0.5) * 0.1);
  },
  { dither: true },
);

const bladeEdge = cellPaint(0.01, (c) => {
  const lit = c.at.x < 0;
  const rim = Math.abs(c.at.x) > 0.047;
  const v = (lit ? 0.84 : 0.36) + (rim ? (lit ? 0.14 : 0.1) : 0) + (c.random(1) - 0.5) * 0.06;
  return c.pick(STEEL_R, v);
});

const bladeMid = cellPaint(0.01, (c) => {
  const lit = c.at.x < 0;
  let v = lit ? 0.68 : 0.5;
  if ((((c.u + c.v) % 11) + 11) % 11 < 2 && c.at.y > ST) v += 0.2;
  if (c.at.y < ST + 0.02) v -= 0.1;
  return c.pick(STEEL_R, v + (c.random(1) - 0.5) * 0.06);
});

const fullerPaint = cellPaint(0.01, (c) => c.pick(STEEL_R, (c.at.x < 0 ? 0.36 : 0.2) + (c.random(1) - 0.5) * 0.08));

const ribbonPaint = cellPaint(
  0.01,
  (c) => {
    if (((c.v % 10) + 10) % 10 === 0) return "#f0c24a";
    if (((c.v % 10) + 10) % 10 === 1) return "#9a6a1a";
    return c.pick(RIBBON_R, 0.55 + 0.25 * Math.abs(c.n.z) - 0.12 * c.n.x + (c.random(1) - 0.5) * 0.18);
  },
  { dither: true },
);

const rustPaint = cellPaint(
  0.01,
  (c) => c.pick(RUST_R, 0.45 + 0.3 * c.n.z + 0.2 * c.n.y + (noise(c.at, 0.05, 4) - 0.5) * 0.7 + (c.random(1) - 0.5) * 0.2),
  { dither: true },
);

const flagPaint = cellPaint(
  0.02,
  (c) =>
    c.pick(
      ["#4a5269", "#586077", "#6a7390", "#7d86a3", "#9199b3"],
      0.5 + 0.3 * c.n.y + (c.random(1) - 0.5) * 0.5 + (noise(c.at, 0.1, 3) - 0.5) * 0.4,
    ),
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures
const RUNES: string[][] = [
  ["..#..", "..#..", "#.#.#", ".###.", "..#..", "..#..", "..#.."],
  ["#....", "#.##.", "##..#", "#...#", "##..#", "#.##.", "#...."],
  ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  [".###.", "#...#", "#.#.#", "#..##", "#....", ".#...", "..###"],
  ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  ["..#..", ".##..", "#.#..", "..###", "..#.#", "..#..", "..#.."],
];

const BLADE_RUNES = pixelTexture(6, 64, (g) => {
  const order = [3, 0, 5, 2, 1, 4, 0, 3];
  order.forEach((gi, k) => {
    const y0 = k * 8;
    const bright = k < 3 ? 0 : k < 6 ? 1 : 2; // glow fades into the stone
    const col = ["#c8fbff", "#6fe9ff", "#2da9d0"][bright];
    RUNES[gi].forEach((row, y) => {
      for (let x = 0; x < 5; x++) if (row[x] === "#") g.set(x, y0 + y, col);
    });
  });
});

const PLAQUE = pixelTexture(40, 11, (g) => {
  g.fill(() => "#141a2a");
  for (let x = 0; x < 40; x++) {
    g.set(x, 0, "#2b3550");
    g.set(x, 10, "#0b0f1a");
  }
  [4, 1, 5, 0, 3, 2].forEach((gi, k) => {
    RUNES[gi].forEach((row, y) => {
      for (let x = 0; x < 5; x++) if (row[x] === "#") g.set(2 + k * 6 + x, 2 + y, k % 2 ? "#6fe9ff" : "#9ff2ff");
    });
  });
});

const STELE_RUNE = pixelTexture(7, 17, (g) => {
  g.fill(() => "#141a2a");
  [2, 4].forEach((gi, k) => {
    RUNES[gi].forEach((row, y) => {
      for (let x = 0; x < 5; x++) if (row[x] === "#") g.set(1 + x, 1 + k * 8 + y, "#6fe9ff");
    });
  });
});

const EMBLEM = pixelTexture(13, 15, (g) => {
  g.fill(() => "#141a2a");
  for (let x = 0; x < 13; x++) {
    g.set(x, 0, "#2b3550");
    g.set(x, 14, "#0b0f1a");
  }
  g.stamp(
    1,
    1,
    [
      ".....c.....",
      "....ccc....",
      ".....c.....",
      ".....c.....",
      ".....c.....",
      ".....c.....",
      ".....c.....",
      "..ccccccc..",
      ".....c.....",
      ".....c.....",
      "....ccc....",
      "....ccc....",
      ".....c.....",
    ],
    { c: "#6fe9ff" },
  );
});

const WRAP = pixelTexture(8, 30, (g) => {
  g.fill((x, y) => {
    const d = (x + y) % 6;
    if (d === 0) return "#2e1b0f";
    if (d <= 3) return (x * 7 + y * 3) % 11 === 0 ? "#6a4426" : "#52331c";
    return "#7c5230";
  });
});

const GRASS_PAL = { d: "#2b6a25", g: "#4c9a2e", l: "#86c93f", y: "#b8e06a", w: "#f4f0e0", o: "#ffd23f" };
const GRASS_TEX = [
  pixelArt(["...y....", "...l..y.", ".l.l..l.", ".l.g.gl.", ".g.g.gg.", ".gdg.gd.", "gggdgggd", "dggdgdgd"], GRASS_PAL),
  pixelArt(["......y.", "..y...l.", "..l..lg.", ".yl..gg.", ".lg.lgd.", ".gg.ggd.", "dgggggdd", "dggdgddd"], GRASS_PAL),
  pixelArt(["....w...", "...wow..", "....g...", ".y..g..y", ".l.lg.l.", ".g.gg.gg", "dgdgdgdg", "dggdggdg"], GRASS_PAL),
];

// ---------------------------------------------------------------------------------------------------------------
// Helpers
const DEG = Math.PI / 180;
const snap2 = (v: number) => Math.round(v / 0.02 - 0.5) * 0.02 + 0.01;

/** Many small static boxes per colour, merged into one part per colour. */
class Batch {
  private groups = new Map<string, THREE.BufferGeometry[]>();
  box(
    color: string,
    size: [number, number, number],
    at: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    parent?: THREE.Matrix4,
  ) {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      new THREE.Vector3(1, 1, 1),
    );
    if (parent) m.premultiply(parent);
    g.applyMatrix4(m);
    const list = this.groups.get(color) ?? [];
    list.push(g);
    this.groups.set(color, list);
  }
  flush(emit: (geo: THREE.BufferGeometry, color: string) => void) {
    for (const [color, list] of this.groups) {
      const merged = mergeGeometries(list);
      if (!merged) throw new Error(`Batch: could not merge ${color}`);
      emit(merged, color);
    }
  }
}

export default function build() {
  const b = createBuilder({ name: "swordInStone", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const sword = b.joint("sword", { parent: base, at: [0, ST, 0], dir: [0, 1, 0], role: "hinge" });

  const blk = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: Paint, name?: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      bone: base,
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      name,
    });

  // ------------------------------------------------------------------ turf base
  blk(-1.0, 1.0, 0, G, -0.84, 0.84, groundPaint, "turf");
  blk(-0.44, 0.46, 0, G, 0.84, 1.08, groundPaint, "turfApron");
  blk(-1.16, -1.0, 0, G, -0.4, 0.34, groundPaint, "turfWest");
  blk(1.0, 1.14, 0, G, -0.2, 0.5, groundPaint, "turfEast");
  blk(-0.5, 0.3, 0, G, -1.0, -0.84, groundPaint, "turfNorth");
  blk(0.5, 0.84, 0, G, 0.84, 0.96, groundPaint, "turfSE");

  // ------------------------------------------------------------------ the boulder
  blk(-0.5, 0.5, G, 0.28, -0.3, 0.32, stonePaint, "rock1a");
  blk(-0.38, 0.4, G, 0.28, -0.4, 0.4, stonePaint, "rock1b");
  blk(-0.44, 0.46, 0.28, 0.42, -0.24, 0.26, stonePaint, "rock2a");
  blk(-0.34, 0.36, 0.28, 0.42, -0.34, 0.36, stonePaint, "rock2b");
  blk(-0.36, 0.38, 0.42, 0.52, -0.2, 0.22, stonePaint, "rock3a");
  blk(-0.26, 0.28, 0.42, 0.52, -0.28, 0.3, stonePaint, "rock3b");
  blk(-0.28, 0.3, 0.52, ST, -0.16, 0.18, stonePaint, "rockTopA");
  blk(-0.2, 0.22, 0.52, ST, -0.22, 0.24, stonePaint, "rockTopB");
  blk(0.22, 0.58, G, 0.24, 0.26, 0.52, stonePaint, "lumpFL");
  blk(-0.56, -0.2, G, 0.2, 0.3, 0.48, stonePaint, "lumpFR");
  blk(-0.3, 0.26, G, 0.34, -0.52, -0.34, stonePaint, "lumpBack");
  blk(0.44, 0.6, 0.2, 0.3, -0.2, 0.14, stonePaint, "lumpSide");
  blk(-0.54, -0.36, G, 0.3, -0.24, 0.1, stonePaint, "lumpWest");
  blk(-0.26, -0.12, ST, 0.68, -0.14, 0.0, stonePaint, "shard");
  blk(0.1, 0.22, ST, 0.64, 0.1, 0.22, stonePaint, "shard2");
  blk(0.3, 0.46, 0.42, 0.5, -0.04, 0.16, stonePaint, "ledge");

  // carved inscription plate on the boulder's front, glowing
  glow(
    b.part(new THREE.PlaneGeometry(0.32, 0.088), "#ffffff", {
      bone: base,
      at: [0, 0.35, 0.36 + 0.0015],
      dir: [0, 0, 1],
      axis: "z",
      texture: PLAQUE,
      name: "plaque",
    }),
    1.1,
  );

  // carved inscription on the back, and a sword emblem on each flank
  glow(
    b.part(new THREE.PlaneGeometry(0.32, 0.088), "#ffffff", {
      bone: base,
      at: [0, 0.35, -0.34 - 0.0015],
      dir: [0, 0, -1],
      axis: "z",
      texture: PLAQUE,
      name: "plaqueBack",
    }),
    1.1,
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.09, 0.104), "#ffffff", {
        bone: base,
        at: [s > 0 ? 0.46 + 0.0015 : -0.44 - 0.0015, 0.366, 0],
        dir: [s, 0, 0],
        axis: "z",
        texture: EMBLEM,
        name: s > 0 ? "emblemLeft" : "emblemRight",
      }),
      1.1,
    );

  // glowing ring and cracks where the blade enters the stone
  const crackDark = new Batch();
  const rc = rng(21);
  const used = new Set<string>();
  const starts: [number, number, number, number][] = [
    [0.07, 0.04, 1, 0.4],
    [-0.07, 0.04, -1, 0.4],
    [0.07, -0.04, 1, -0.4],
    [-0.07, -0.04, -1, -0.4],
    [0, 0.04, 0.2, 1],
    [0, -0.04, -0.2, -1],
    [0.05, 0.04, 0.6, 1],
  ];
  for (const [sx, sz, dx, dz] of starts) {
    let x = snap2(sx + Math.sign(dx) * 0.012);
    let z = snap2(sz + Math.sign(dz) * 0.012);
    const steps = 6 + Math.floor(rc() * 6);
    for (let i = 0; i < steps; i++) {
      const alongX = rc() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dz)) + (rc() - 0.5) * 0.4;
      if (alongX) x += 0.02 * (rc() < 0.8 ? Math.sign(dx) || 1 : -1);
      else z += 0.02 * (rc() < 0.8 ? Math.sign(dz) || 1 : -1);
      const inside = (x > -0.28 && x < 0.3 && z > -0.16 && z < 0.18) || (x > -0.2 && x < 0.22 && z > -0.22 && z < 0.24);
      const inRing = Math.abs(x) < 0.1 && Math.abs(z) < 0.05;
      const inShard = (x > -0.27 && x < -0.11 && z > -0.15 && z < 0.01) || (x > 0.09 && x < 0.23 && z > 0.09 && z < 0.23);
      const key = `${Math.round(x * 100)},${Math.round(z * 100)}`;
      if (!inside || inRing || inShard || used.has(key)) continue;
      used.add(key);
      crackDark.box("#10141f", [0.02, 0.006, 0.02], [x, ST + 0.003, z]);
      if (i < 2) crackDark.box("#6fe9ff", [0.012, 0.0075, 0.012], [x, ST + 0.003, z]);
    }
  }
  crackDark.box("#c8fbff", [0.16, 0.008, 0.02], [0, ST + 0.004, 0.03]);
  crackDark.box("#c8fbff", [0.16, 0.008, 0.02], [0, ST + 0.004, -0.03]);
  crackDark.box("#c8fbff", [0.02, 0.008, 0.04], [0.07, ST + 0.004, 0]);
  crackDark.box("#c8fbff", [0.02, 0.008, 0.04], [-0.07, ST + 0.004, 0]);
  crackDark.flush((geo, color) => {
    const p = b.part(geo, color, { bone: base, at: [0, 0, 0], name: `crack${color.slice(1)}` });
    if (color !== "#10141f") glow(p, 1.4);
  });

  const BT = ST + 0.42; // top of the visible blade
  const BB = ST - 0.3; // buried tip
  const sb = { bone: sword };
  // blade: stepped cross-section, edge bevel / mid plane / fuller inlay
  b.part(new THREE.BoxGeometry(0.11, BT - BB, 0.01), bladeEdge, { ...sb, at: [0, (BT + BB) / 2, 0], name: "bladeEdge" });
  b.part(new THREE.BoxGeometry(0.07, BT - BB, 0.014), bladeMid, { ...sb, at: [0, (BT + BB) / 2, 0], name: "bladeMid" });
  b.part(new THREE.BoxGeometry(0.04, BT - 0.02 - (BB + 0.04), 0.0156), fullerPaint, {
    ...sb,
    at: [0, (BT - 0.02 + BB + 0.04) / 2, 0],
    name: "fuller",
  });
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.03, 0.32), "#ffffff", {
        ...sb,
        at: [0, 0.83, s * (0.0078 + 0.0013)],
        dir: [0, 0, s],
        axis: "z",
        texture: BLADE_RUNES,
        name: s > 0 ? "runesFront" : "runesBack",
      }),
      1.2,
    );

  // ricasso collar
  b.part(new THREE.BoxGeometry(0.09, 0.035, 0.046), goldPaint, { ...sb, at: [0, BT + 0.0175, 0], name: "collar" });
  b.part(new THREE.BoxGeometry(0.07, 0.008, 0.03), "#5a360b", { ...sb, at: [0, BT - 0.004, 0], name: "collarBand" });

  // crossguard: stepped wings, dark rim plate under a raised lighter plate
  const WING: [number, number][] = [
    [0, 10],
    [0, 10],
    [0, 10],
    [0, 10],
    [0, 10],
    [1, 8],
    [1, 8],
    [2, 7],
    [2, 7],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 8],
    [2, 8],
    [3, 12],
  ];
  const full = [...[...WING].reverse(), ...WING];
  const GY = BT + 0.035;
  b.extrude(stepped(full, 0.01, { start: -21 }), {
    ...sb,
    at: [0, GY, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    color: "#5a360b",
    name: "guardRim",
  });
  const inner = full.slice(1, -1).map(([f, t]) => [f + 1, t - 1] as [number, number]);
  b.extrude(stepped(inner, 0.01, { start: -20 }), {
    ...sb,
    at: [0, GY, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.036,
    color: goldPaint,
    name: "guardPlate",
  });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.034, 0.034, 0.012), "#46e6ff", {
        ...sb,
        at: [0, GY + 0.045, s * 0.018],
        rotation: [0, 0, 45],
        name: "guardGem",
      }),
      1.3,
    );
    for (const x of [-0.17, -0.13, -0.09, 0.09, 0.13, 0.17])
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.01), "#ffe27a", {
        ...sb,
        at: [x, GY + (Math.abs(x) > 0.15 ? 0.04 : 0.025), s * 0.019],
        name: "guardRivet",
      });
    // wing-tip studs
    for (const sx of [-1, 1])
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.012), "#b8f6ff", {
        ...sb,
        at: [sx * 0.2, GY + 0.1, s * 0.015],
        name: "tipStud",
      });
  }

  // grip: leather wrap, gold rings
  const GRIP0 = GY + 0.1;
  const GRIP_H = 0.2;
  b.part(tileBox([0.054, GRIP_H, 0.054], WRAP, 0.0066), "#ffffff", {
    ...sb,
    at: [0, GRIP0 + GRIP_H / 2, 0],
    texture: WRAP,
    name: "grip",
  });
  for (const y of [GRIP0 + 0.006, GRIP0 + GRIP_H / 2, GRIP0 + GRIP_H - 0.006])
    b.part(new THREE.BoxGeometry(0.068, 0.012, 0.068), goldPaint, { ...sb, at: [0, y, 0], name: "gripRing" });

  // pommel: base block, diamond frame with a glowing gem, finial
  const PY = GRIP0 + GRIP_H;
  b.part(new THREE.BoxGeometry(0.08, 0.034, 0.08), goldPaint, { ...sb, at: [0, PY + 0.017, 0], name: "pommelBase" });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.05), goldPaint, {
    ...sb,
    at: [0, PY + 0.062, 0],
    rotation: [0, 0, 45],
    name: "pommelDiamond",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.036, 0.036, 0.056), "#46e6ff", {
      ...sb,
      at: [0, PY + 0.062, 0],
      rotation: [0, 0, 45],
      name: "pommelGem",
    }),
    1.4,
  );
  b.part(new THREE.BoxGeometry(0.026, 0.024, 0.026), goldPaint, { ...sb, at: [0, PY + 0.118, 0], name: "finial" });

  // red ribbon tied round the upper grip, two swallow tails fluttering
  const kyR = GRIP0 + GRIP_H * 0.72;
  b.part(new THREE.BoxGeometry(0.064, 0.03, 0.064), ribbonPaint, { ...sb, at: [0, kyR, 0], name: "ribbonKnot" });
  const kz = 0.034;
  const tails: [string, number[][]][] = [
    [
      "ribbonA",
      [
        [0.012, kyR - 0.012, kz],
        [0.04, kyR - 0.07, kz + 0.012],
        [0.075, kyR - 0.13, kz + 0.022],
        [0.115, kyR - 0.19, kz + 0.016],
      ],
    ],
    [
      "ribbonB",
      [
        [-0.012, kyR - 0.012, kz],
        [-0.035, kyR - 0.06, kz + 0.01],
        [-0.06, kyR - 0.11, kz + 0.024],
        [-0.1, kyR - 0.15, kz + 0.018],
      ],
    ],
  ];
  for (const [name, pts] of tails) {
    const ch = b.chain(name, catmull(pts), { parent: sword, count: 3, role: "tail" });
    b.sweep(ch, (t) => [0.015 - 0.003 * t, 0.004], {
      section: "box",
      caps: "flat",
      color: ribbonPaint,
      name: `${name}Cloth`,
    });
  }

  // a little bluebird perched on the guard's right wing
  const bird = new Batch();
  const bx = -0.16;
  const by = GY + 0.06;
  bird.box("#3d8be0", [0.034, 0.03, 0.05], [bx, by + 0.016, 0]);
  bird.box("#f4efe0", [0.03, 0.014, 0.04], [bx, by + 0.008, 0.006]);
  bird.box("#3d8be0", [0.03, 0.03, 0.03], [bx, by + 0.04, 0.026]);
  bird.box("#6bb4f0", [0.01, 0.012, 0.014], [bx, by + 0.061, 0.02]);
  bird.box("#ffb02e", [0.008, 0.008, 0.014], [bx, by + 0.038, 0.047]);
  for (const sx of [-1, 1]) {
    bird.box("#10141f", [0.005, 0.006, 0.006], [bx + sx * 0.0155, by + 0.044, 0.034]);
    bird.box("#2a63b8", [0.008, 0.022, 0.04], [bx + sx * 0.019, by + 0.019, -0.004]);
    bird.box("#7a5a3a", [0.004, 0.01, 0.004], [bx + sx * 0.008, by + 0.005, 0.004]);
  }
  bird.box("#2a63b8", [0.014, 0.006, 0.03], [bx, by + 0.022, -0.04], [-15, 0, 0]);
  bird.flush((geo, color) => b.part(geo, color, { ...sb, at: [0, 0, 0], name: `bird${color.slice(1)}` }));

  // ------------------------------------------------------------------ carved stelae ring
  const steles: [number, number, number][] = [
    [0.82, 0.5, 0.42],
    [-0.82, 0.5, 0.34],
    [0.8, -0.48, 0.38],
    [-0.8, -0.5, 0.46],
  ];
  const motes = new Batch();
  steles.forEach(([x, z, h], i) => {
    const sx = Math.sign(x);
    blk(x - 0.07, x + 0.07, G, G + h, z - 0.06, z + 0.06, stonePaint, `stele${i}`);
    blk(x - 0.09, x + 0.09, G, G + 0.06, z - 0.08, z + 0.08, stonePaint, `steleFoot${i}`);
    blk(x - 0.07, x + 0.01 * (i % 2 ? 1 : -1), G + h, G + h + 0.06, z - 0.06, z + 0.06, stonePaint, `steleChip${i}`);
    glow(
      b.part(new THREE.PlaneGeometry(0.07, 0.17), "#ffffff", {
        bone: base,
        at: [x - sx * 0.0715, G + h * 0.58, z],
        dir: [-sx, 0, 0],
        axis: "z",
        texture: STELE_RUNE,
        name: `steleRune${i}`,
      }),
      1.1,
    );
    // dotted glowing line from the stele toward the boulder
    const steps = 9;
    for (let k = 0; k < steps; k++) {
      const t = (k + 0.5) / steps;
      const px = snap2(x * (1 - t) * 0.82 + x * 0.0);
      const pz = snap2(z * (1 - t) * 0.82 + z * 0.0);
      if (Math.abs(px) < 0.6 && Math.abs(pz) < 0.54) continue;
      if (k % 2 === 0) motes.box("#2bb7d1", [0.02, 0.004, 0.02], [px, G + 0.002, pz]);
      else motes.box("#17586a", [0.02, 0.004, 0.02], [px, G + 0.002, pz]);
    }
  });

  // ------------------------------------------------------------------ flagstone path
  const rp = rng(5);
  let pz = 0.62;
  while (pz < 1.02) {
    const w = [0.14, 0.16, 0.18][Math.floor(rp() * 3)];
    const d = [0.1, 0.12, 0.14][Math.floor(rp() * 3)];
    const px = snap2((rp() - 0.5) * 0.14 + 0.02);
    blk(px - w / 2, px + w / 2, G, G + 0.02, pz, pz + d, flagPaint, "flagstone");
    pz += d + 0.02;
  }

  // ------------------------------------------------------------------ vegetation: tufts, flowers, mushrooms
  const rt = rng(11);
  const tufts = [];
  while (tufts.length < 90) {
    const x = (rt() - 0.5) * 2.1;
    const z = (rt() - 0.5) * 1.7;
    const onMain = Math.abs(x) < 0.96 && Math.abs(z) < 0.8;
    const onApron = x > -0.4 && x < 0.42 && z >= 0.8 && z < 1.04;
    const inRock = x > -0.6 && x < 0.64 && z > -0.56 && z < 0.56;
    const onPath = Math.abs(x - 0.02) < 0.14 && z > 0.55;
    const onStele = steles.some(([sx, sz]) => Math.abs(x - sx) < 0.13 && Math.abs(z - sz) < 0.12);
    if (!(onMain || onApron) || inRock || onPath || onStele) continue;
    tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  for (const [x, y, z] of [
    [0.4, 0.24, 0.42],
    [0.3, 0.24, 0.36],
    [-0.46, 0.2, 0.4],
    [-0.38, 0.2, 0.36],
    [0.5, 0.3, 0.0],
    [-0.1, 0.34, -0.45],
    [0.0, 0.28, -0.38],
    [-0.4, 0.3, -0.1],
  ] as const)
    tufts.push(frame([x, y, z], [0, 1, 0]));
  b.cards(tufts, GRASS_TEX, { bone: base, size: [0.08, 0.08], vary: 0.35, spin: 180, rng: rng(12), cross: true });

  const veg = new Batch();
  const rf = rng(31);
  const PETAL = ["#ff8fb1", "#fff4d0", "#9bd8ff", "#ffd23f", "#d9a6ff"];
  for (let i = 0; i < 26; i++) {
    const x = (rf() - 0.5) * 1.9;
    const z = (rf() - 0.5) * 1.5;
    if (Math.abs(x) < 0.6 && Math.abs(z) < 0.56) continue;
    if (Math.abs(x - 0.02) < 0.14 && z > 0.55) continue;
    if (steles.some(([sx, sz]) => Math.abs(x - sx) < 0.13 && Math.abs(z - sz) < 0.12)) continue;
    const h = 0.05 + rf() * 0.05;
    veg.box("#3c8a2e", [0.008, h, 0.008], [x, G + h / 2, z]);
    veg.box("#56ab3a", [0.02, 0.006, 0.01], [x + 0.012, G + h * 0.4, z]);
    const pc = PETAL[Math.floor(rf() * PETAL.length)];
    const hy = G + h + 0.006;
    veg.box("#f2a516", [0.014, 0.014, 0.014], [x, hy, z]);
    veg.box(pc, [0.014, 0.014, 0.012], [x + 0.014, hy, z]);
    veg.box(pc, [0.014, 0.014, 0.012], [x - 0.014, hy, z]);
    veg.box(pc, [0.014, 0.012, 0.014], [x, hy + 0.013, z]);
    veg.box(pc, [0.014, 0.012, 0.014], [x, hy - 0.013, z]);
  }
  // mushrooms
  for (const [x, z, s] of [
    [0.66, 0.66, 1],
    [0.72, 0.58, 0.7],
    [-0.7, 0.2, 0.9],
    [-0.64, 0.12, 0.6],
    [0.12, -0.7, 0.8],
  ] as const) {
    veg.box("#efe3c6", [0.03 * s, 0.05 * s, 0.03 * s], [x, G + 0.025 * s, z]);
    veg.box("#d8333a", [0.08 * s, 0.022 * s, 0.08 * s], [x, G + 0.06 * s, z]);
    veg.box("#f0524f", [0.052 * s, 0.02 * s, 0.052 * s], [x, G + 0.081 * s, z]);
    veg.box("#fff4e0", [0.014 * s, 0.006, 0.014 * s], [x + 0.018 * s, G + 0.092 * s, z + 0.006 * s]);
    veg.box("#fff4e0", [0.012 * s, 0.006, 0.012 * s], [x - 0.012 * s, G + 0.092 * s, z - 0.014 * s]);
    veg.box("#fff4e0", [0.012 * s, 0.012 * s, 0.006], [x + 0.01 * s, G + 0.062 * s, z + 0.041 * s]);
  }
  // fallen leaves
  const LEAF = ["#e08a2b", "#c4572a", "#e8c13c"];
  for (let i = 0; i < 24; i++) {
    const x = (rf() - 0.5) * 1.9;
    const z = (rf() - 0.5) * 1.5;
    if (Math.abs(x) < 0.58 && Math.abs(z) < 0.54) continue;
    if (Math.abs(x - 0.02) < 0.12 && z > 0.55) continue;
    veg.box(LEAF[i % 3], [0.03, 0.005, 0.022], [x, G + 0.0025, z], [0, rf() * 180, 0]);
  }
  // pebbles
  const peb = new Batch();
  for (let i = 0; i < 12; i++) {
    const x = (rf() - 0.5) * 1.9;
    const z = (rf() - 0.5) * 1.5;
    if (Math.abs(x) < 0.6 && Math.abs(z) < 0.56) continue;
    if (Math.abs(x - 0.02) < 0.14 && z > 0.55) continue;
    const w = 0.03 + rf() * 0.03;
    peb.box("#ffffff", [w, w * 0.6, w * 0.8], [x, G + w * 0.25, z], [0, rf() * 90, 0]);
  }
  peb.flush((geo) => b.part(geo, stonePaint, { bone: base, at: [0, 0, 0], name: "pebbles" }));

  // ivy climbing the boulder
  const ivy = (n: "x" | "z", sgn: 1 | -1, w: number, a0: number, a1: number, y0: number, y1: number, start: number, seed: number) => {
    const r = rng(seed);
    let a = start;
    let y = y0 + 0.01;
    const GREENS = ["#2c6a28", "#3f8a32", "#62ad40"];
    while (y < y1 - 0.02) {
      const pos = (lat: number, yy: number, off: number): [number, number, number] =>
        n === "x" ? [w + sgn * off, yy, lat] : [lat, yy, w + sgn * off];
      const dims = (wd: number, h: number, t: number): [number, number, number] => (n === "x" ? [t, h, wd] : [wd, h, t]);
      veg.box("#1f4a1c", dims(0.012, 0.02, 0.012), pos(a, y, 0.006));
      if (r() < 0.6) {
        const dx = (r() < 0.5 ? -1 : 1) * 0.026;
        const col = GREENS[Math.floor(r() * 3)];
        veg.box(col, dims(0.028, 0.024, 0.016), pos(a + dx, y + 0.004, 0.008));
        if (r() < 0.5) veg.box(GREENS[2], dims(0.014, 0.012, 0.018), pos(a + dx * 1.2, y + 0.012, 0.01));
      }
      if (r() < 0.5) y += 0.02;
      else a = Math.min(a1, Math.max(a0, a + (r() < 0.5 ? -0.02 : 0.02)));
      if (r() < 0.12) y += 0.02;
    }
  };
  ivy("x", 1, 0.5, -0.28, 0.28, G, 0.28, 0.0, 41);
  ivy("x", 1, 0.46, 0.08, 0.24, 0.28, 0.42, 0.16, 42);
  ivy("z", 1, 0.4, -0.18, 0.2, G, 0.28, 0.1, 43);
  ivy("x", -1, -0.36, -0.2, 0.22, 0.42, 0.52, 0.0, 44);
  ivy("z", 1, 0.36, 0.18, 0.34, 0.28, 0.4, 0.24, 45);
  ivy("x", -1, -0.5, 0.12, 0.3, G, 0.28, 0.2, 46);

  // ------------------------------------------------------------------ challengers' broken swords
  const broken: [number, number, number, number, number, boolean][] = [
    [0.72, 0.12, 70, 14, 1, false],
    [-0.74, -0.18, -40, -16, 0.9, false],
    [-0.66, 0.66, 130, 10, 0.8, true],
  ];
  const rb = new Batch();
  for (const [x, z, yaw, tilt, s, snapped] of broken) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, G, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt * DEG, yaw * DEG, (tilt * 0.6) * DEG, "YXZ")),
      new THREE.Vector3(s, s, s),
    );
    const top = snapped ? 0.08 : 0.2;
    rb.box("#8d6b52", [0.05, top + 0.06, 0.008], [0, (top - 0.06) / 2, 0], [0, 0, 0], m);
    rb.box("#b89574", [0.014, top + 0.06, 0.0095], [-0.01, (top - 0.06) / 2, 0], [0, 0, 0], m);
    if (snapped) {
      rb.box("#8d6b52", [0.02, 0.03, 0.008], [0.012, top + 0.012, 0], [0, 0, 12], m);
      rb.box("#6a4a36", [0.034, 0.02, 0.01], [-0.006, top + 0.004, 0], [0, 0, -25], m);
    }
    const gy = snapped ? 0.0 : top;
    if (!snapped) {
      rb.box("#5b4a3a", [0.17, 0.022, 0.026], [0, gy + 0.011, 0], [0, 0, 0], m);
      rb.box("#3b2a20", [0.03, 0.15, 0.03], [0, gy + 0.098, 0], [0, 0, 0], m);
      rb.box("#6c5a46", [0.05, 0.04, 0.05], [0, gy + 0.19, 0], [0, 0, 0], m);
    }
  }
  rb.flush((geo, color) =>
    b.part(geo, color === "#8d6b52" ? rustPaint : color, { bone: base, at: [0, 0, 0], name: `rusty${color.slice(1)}` }),
  );

  // ------------------------------------------------------------------ rising motes of light
  const rm = rng(77);
  for (let i = 0; i < 16; i++) {
    const a = rm() * Math.PI * 2;
    const r = 0.1 + rm() * 0.4;
    const y = 0.75 + rm() * 0.65;
    const s = rm() < 0.4 ? 0.014 : 0.01;
    motes.box(rm() < 0.5 ? "#c8fbff" : "#6fe9ff", [s, s, s], [Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  // pixel sparkle stars drifting near the blade
  for (const [sx, sy, sz] of [
    [0.2, 1.3, 0.08],
    [-0.22, 0.95, 0.1],
    [0.16, 0.75, -0.12],
  ] as const) {
    motes.box("#ffffff", [0.012, 0.012, 0.004], [sx, sy, sz]);
    for (const [ax, ay] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const)
      motes.box("#c8fbff", [0.012 + 0.012 * Math.abs(ax), 0.012 + 0.012 * Math.abs(ay), 0.004], [sx + ax * 0.016, sy + ay * 0.016, sz]);
  }
  motes.flush((geo, color) => {
    const p = b.part(geo, color, { bone: base, at: [0, 0, 0], name: `light${color.slice(1)}` });
    if (color !== "#17586a") glow(p, 1.3);
  });

  // veg flush (after motes so colour parts are independent)
  veg.flush((geo, color) => b.part(geo, color, { bone: base, at: [0, 0, 0], name: `veg${color.slice(1)}` }));

  return b.root;
}
