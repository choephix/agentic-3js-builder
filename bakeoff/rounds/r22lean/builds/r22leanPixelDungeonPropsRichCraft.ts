import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A dungeon corner in chunky pixel art: broken brick wall with chains, flagstone floor, banded treasure chest with spilled coins, barrels, crates, an iron brazier, a skull pile and potions.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const FLOOR = 0.06;

const S = (c: string) => snapColor(c, 32);
const WOODR = ["#1c0f06", "#3a1f0c", "#5a3314", "#7a4a1e", "#9c6530", "#b98445"].map(S);
const STONER = ["#14141c", "#2a2b38", "#40424f", "#5a5d6b", "#777a88", "#9a9dab"].map(S);
const IRONR = ["#0e0f14", "#23252e", "#383b47", "#555a68", "#7a8092"].map(S);
const MOSS = ["#14260f", "#21401a", "#34622a", "#4f8a38"].map(S);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
  const r = rng(11);
  const rand = rng(5);

  // ---------- textures ----------
  const WOOD = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const row = y % 8;
      const plank = Math.floor(y / 8);
      if (row === 0) return WOODR[0];
      if ((x + plank * 11 + 5) % 32 === 0) return WOODR[0];
      let v = 0.4 + 0.1 * row / 7 + 0.12 * ((plank * 3) % 3);
      if ((x * 5 + plank * 13) % 9 === 0) v -= 0.14;
      v += (r() - 0.5) * 0.12;
      if (row === 1) v += 0.15;
      return pick(WOODR, v, bayer(x, y));
    });
    g.stamp(9, 10, ["kkk", "kdk", "kkk"], { k: WOODR[2], d: WOODR[0] });
    g.stamp(22, 21, ["kkk", "kdk", "kkk"], { k: WOODR[2], d: WOODR[0] });
  });

  const STONE = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const rowI = Math.floor(y / 8);
      const off = (rowI % 2) * 8;
      const lx = (x + off) % 16;
      if (y % 8 === 0 || lx === 0) return STONER[0];
      const id = Math.floor((x + off) / 16) + rowI * 7;
      let v = 0.35 + (((id * 37) % 10) / 10) * 0.3 + (r() - 0.5) * 0.15;
      if (y % 8 === 1 || lx === 1) v += 0.2;
      if (y % 8 === 7 || lx === 15) v -= 0.15;
      return pick(STONER, v, bayer(x, y));
    });
    g.stamp(5, 11, ["m.m", ".mm"], { m: MOSS[2] });
    g.stamp(20, 3, ["mm.", "mmm"], { m: MOSS[1] });
  });

  const FLAG = pixelTexture(40, 40, (g) => {
    g.fill((x, y, w, h) => {
      if (x === 0 || y === 0) return STONER[0];
      if (x === w - 1 || y === h - 1) return STONER[1];
      let v = 0.42 + (r() - 0.5) * 0.18;
      if (x === 1 || y === 1) v += 0.2;
      if (x === w - 2 || y === h - 2) v -= 0.14;
      if (y > 30 && x < 12 && r() < 0.8 - (y - 30) * 0.05) return pick(MOSS, 0.4 + r() * 0.5, bayer(x, y));
      return pick(STONER, v, bayer(x, y));
    });
    for (let i = 0; i < 14; i++) g.set(12 + i, 8 + Math.floor(i * 0.7) + (i % 3 === 0 ? 1 : 0), STONER[0]);
    for (let i = 0; i < 6; i++) g.set(26 + i, 24 - i, STONER[1]);
  });

  const IRON = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => pick(IRONR, 0.4 + (x === 1 || y === 1 ? 0.25 : 0) - (x === 14 || y === 14 ? 0.2 : 0) + (r() - 0.5) * 0.15, bayer(x, y)));
    g.stamp(2, 2, ["ww", "wd"], { w: IRONR[4], d: IRONR[1] });
    g.stamp(12, 12, ["ww", "wd"], { w: IRONR[4], d: IRONR[1] });
    g.stamp(12, 2, ["ww", "wd"], { w: IRONR[4], d: IRONR[1] });
    g.stamp(2, 12, ["ww", "wd"], { w: IRONR[4], d: IRONR[1] });
  });

  const CRATE = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const edge = x < 3 || y < 3 || x > 20 || y > 20;
      const diag = Math.abs(x - y) < 2 || Math.abs(x + y - 23) < 2;
      if (edge || diag) {
        const dark = x === 2 || y === 2 || x === 20 || y === 20;
        return pick(WOODR, dark ? 0.2 : 0.62 + (r() - 0.5) * 0.15 + (x === 0 || y === 0 ? 0.1 : 0), bayer(x, y));
      }
      if (y % 6 === 0) return WOODR[0];
      return pick(WOODR, 0.42 + (r() - 0.5) * 0.15 + (y % 6 === 1 ? 0.12 : 0), bayer(x, y));
    });
    for (const [nx, ny] of [[1, 1], [22, 1], [1, 22], [22, 22]]) g.set(nx, ny, IRONR[4]);
  });

  const SKULL = pixelArt(
    [".wwwwww.", "wwwwwwww", "wkkwwkkw", "wkkwwkkw", "wwwkkwww", ".wwwwww.", ".wkwkwk.", ".wwwwww."],
    { w: "#e8e0c8", k: "#1a1410" },
  );
  const BONE = pixelArt(["wwww", "wsws", "wwww"], { w: "#e8e0c8", s: "#b8ad90" });
  const BOOK = pixelArt(
    ["rrrrrrrr", "rgggggrr", "rgrrrgrr", "rgggggrr", "rrrrrrrr", "rrrrrrrr"],
    { r: "#8a1c24", g: "#e0b030" },
  );
  const PAGES = pixelArt(["pppp", "qpqp", "pppp"], { p: "#e8dcb8", q: "#c9b98a" });

  // ---------- helpers ----------
  const tile = (size: [number, number, number], at: [number, number, number], tex: THREE.Texture, rotY = 0, step?: [number, number]) =>
    b.part(tileBox(size, tex, TEXEL, { rand, step }), "#ffffff", {
      texture: tex,
      at: [at[0], at[1] + size[1] / 2, at[2]],
      rotation: [0, rotY, 0],
    });
  const box = (size: [number, number, number], at: [number, number, number], color: string, rotY = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { at: [at[0], at[1] + size[1] / 2, at[2]], rotation: [0, rotY, 0] });

  const woodPaint = cellPaint(
    0.02,
    (c) => c.pick(WOODR, 0.42 + 0.14 * (c.u % 2) + (c.random(2) - 0.5) * 0.18 + 0.1 * c.n.y),
    { dither: true },
  );
  const goldPaint = cellPaint(0.01, (c) => c.pick(["#7a5410", "#b8841c", "#e8b838", "#fff0a0"].map(S), 0.5 + 0.3 * c.n.y + (c.random(4) - 0.5) * 0.4), { dither: true });

  // ---------- floor ----------
  for (let ix = 0; ix < 4; ix++)
    for (let iz = 0; iz < 3; iz++) {
      const w = 0.58;
      const d = 0.72;
      tile([w, FLOOR, d], [-0.9 + ix * 0.6, 0, -0.75 + iz * 0.74], FLAG);
    }

  // ---------- broken back wall ----------
  const WZ = -0.95;
  for (let col = 0; col < 8; col++) {
    const x = -0.96 + col * 0.275;
    const top = 2 + Math.floor(rand() * 3); // 2..4 rows
    for (let row = 0; row < top; row++) {
      const off = (row % 2) * 0.07;
      tile([0.27, 0.2, 0.25], [x + off, FLOOR + row * 0.2, WZ], STONE, 0, [1, 8]);
    }
    if (top < 4 && rand() < 0.7)
      // loose rubble block
      tile([0.12, 0.08, 0.1], [x + 0.03, FLOOR + top * 0.2, WZ + 0.04], STONE, rand() * 40);
  }
  // fallen rubble
  for (const [x, z, s, a] of [[0.15, -0.35, 0.1, 20], [0.3, -0.25, 0.07, 50], [-0.3, -0.25, 0.09, 10], [-0.1, -0.2, 0.06, 35]] as const)
    tile([s, s * 0.7, s], [x, FLOOR, z], STONE, a);

  // chain and shackle on the wall
  const chainX = -0.15;
  for (let i = 0; i < 9; i++) {
    const y = 0.82 - i * 0.045;
    const turn = i % 2 ? 90 : 0;
    b.part(new THREE.TorusGeometry(0.018, 0.006, 4, 6), IRONR[3], {
      at: [chainX, y, WZ + 0.14],
      rotation: [0, turn, 0],
    });
  }
  box([0.12, 0.03, 0.03], [chainX, 0.86 - 0.02, WZ + 0.14], IRONR[2]);
  b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), IRONR[3], { at: [chainX, 0.38, WZ + 0.14], rotation: [0, 0, 0] });
  b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), IRONR[3], { at: [chainX + 0.14, 0.4, WZ + 0.14] });
  box([0.08, 0.03, 0.04], [chainX + 0.07, 0.4, WZ + 0.14], IRONR[2]);
  // wall bracket + key ring
  box([0.04, 0.04, 0.08], [0.5, 0.65, WZ + 0.16], IRONR[2]);
  b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), "#b8841c", { at: [0.5, 0.6, WZ + 0.2] });
  for (let i = 0; i < 3; i++) {
    box([0.01, 0.07, 0.01], [0.48 + i * 0.02, 0.5 + i * 0.01, WZ + 0.2], "#e8b838");
    box([0.03, 0.015, 0.01], [0.485 + i * 0.02, 0.5 + i * 0.01, WZ + 0.2], "#e8b838");
  }

  // ---------- treasure chest ----------
  const CX = 0.1;
  const CZ = 0.4;
  const CY = FLOOR;
  tile([0.7, 0.3, 0.45], [CX, CY, CZ], WOOD, 0, [1, 8]);
  for (const sx of [-0.23, 0.23]) {
    tile([0.07, 0.31, 0.47], [CX + sx, CY, CZ], IRON);
  }
  tile([0.72, 0.05, 0.47], [CX, CY, CZ], IRON); // base trim
  tile([0.72, 0.04, 0.47], [CX, CY + 0.27, CZ], IRON); // top trim
  const LID: Array<[number, number, "sharp"]> = [
    [-0.225, 0, "sharp"],
    [0.225, 0, "sharp"],
    [0.225, 0.1, "sharp"],
    [0.17, 0.19, "sharp"],
    [0.08, 0.23, "sharp"],
    [-0.08, 0.23, "sharp"],
    [-0.17, 0.19, "sharp"],
    [-0.225, 0.1, "sharp"],
  ];
  b.extrude(LID, { at: [CX, CY + 0.3, CZ], x: [0, 0, 1], thickness: 0.7, color: woodPaint });
  const LIDB = LID.map(([x, y]) => [x * 1.06, y * 1.06 + 0.002, "sharp"] as [number, number, "sharp"]);
  for (const sx of [-0.23, 0.23])
    b.extrude(LIDB, { at: [CX + sx, CY + 0.3, CZ], x: [0, 0, 1], thickness: 0.07, color: IRONR[2] });
  // lock
  box([0.1, 0.12, 0.025], [CX, CY + 0.2, CZ + 0.235], "#b8841c");
  box([0.03, 0.05, 0.03], [CX, CY + 0.23, CZ + 0.25], "#3a2a08");
  box([0.04, 0.02, 0.03], [CX, CY + 0.21, CZ + 0.25], "#3a2a08");
  // corner studs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), IRONR[4], {
        at: [CX + sx * 0.355, CY + 0.03, CZ + sz * 0.235],
      });
  // peeking gold on lid top
  for (let i = 0; i < 4; i++)
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), goldPaint, {
      at: [CX - 0.15 + i * 0.1, CY + 0.54, CZ + 0.03 * (i % 2) - 0.05],
      rotation: [10 * i, 30 * i, 8],
    });

  // spilled coins
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 0.9 + 0.1;
    const d = 0.03 + r() * 0.38;
    const x = CX + 0.05 + Math.cos(a) * d * 1.3 - 0.1;
    const z = CZ + 0.28 + Math.sin(a) * d * 0.8;
    const stack = i % 5 === 0 ? 2 : 1;
    for (let k = 0; k < stack; k++)
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), i % 4 === 0 ? "#fff0a0" : "#e8b838", {
        at: [x, FLOOR + 0.004 + k * 0.009, z],
        rotation: [0, r() * 90, k * 4],
      });
  }
  // gem
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#38d8e8", { at: [CX + 0.28, FLOOR + 0.03, CZ + 0.42] }), 1.2);
  glow(b.part(new THREE.OctahedronGeometry(0.025), "#e83860", { at: [CX - 0.05, FLOOR + 0.025, CZ + 0.52] }), 1.2);

  // ---------- barrels ----------
  const barrel = (x: number, z: number, h: number) => {
    const k = h / 0.56;
    const prof: Array<[number, number]> = [
      [0, 0],
      [0.17, 0],
      [0.2, 0.1 * k],
      [0.225, 0.3 * k],
      [0.2, 0.5 * k],
      [0.17, 0.56 * k],
      [0, 0.56 * k],
    ];
    b.lathe(prof, { at: [x, FLOOR, z], segments: 8, color: woodPaint });
    // lid inset
    b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.012, 8), WOODR[4], { at: [x, FLOOR + h + 0.002, z] });
    b.part(new THREE.BoxGeometry(0.31, 0.014, 0.025), WOODR[1], { at: [x, FLOOR + h + 0.008, z] });
    for (const [y, o] of [[0.08, 0.208], [0.22, 0.226], [0.44, 0.22], [0.52, 0.19]] as const) {
      const yy = y * k;
      b.lathe(
        [
          [o - 0.03, 0],
          [o, 0],
          [o, 0.035],
          [o - 0.03, 0.035],
        ],
        { at: [x, FLOOR + yy, z], segments: 8, color: IRONR[2] },
      );
    }
  };
  barrel(-0.85, -0.5, 0.58);
  barrel(-0.42, -0.58, 0.5);
  barrel(-0.62, -0.18, 0.44);
  // spilled stain + candle on the middle barrel
  box([0.03, 0.08, 0.03], [-0.42, FLOOR + 0.5 + 0.012, -0.58], "#e8dcb8");
  glow(box([0.025, 0.035, 0.025], [-0.42, FLOOR + 0.592, -0.58], "#ffd040"), 1.5);
  glow(box([0.012, 0.02, 0.012], [-0.42, FLOOR + 0.627, -0.58], "#fff6c0"), 1.8);
  box([0.1, 0.012, 0.1], [-0.42, FLOOR + 0.512, -0.58], IRONR[3]);

  // ---------- crates ----------
  tile([0.5, 0.5, 0.5], [0.8, FLOOR, -0.5], CRATE);
  tile([0.38, 0.38, 0.38], [0.78, FLOOR + 0.5, -0.5], CRATE, 25);
  tile([0.3, 0.3, 0.3], [0.2, FLOOR, -0.66], CRATE, -12);
  tile([0.26, 0.26, 0.26], [0.55, FLOOR, -0.12], CRATE, 40);

  // potions on small crate
  const potion = (x: number, y: number, z: number, col: string, h: number) => {
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.05, 0.03],
        [0.04, 0.06],
        [0.015, 0.075],
        [0.015, h],
        [0, h],
      ],
      { at: [x, y, z], segments: 6, color: col },
    );
    glow(b.part(new THREE.CylinderGeometry(0.036, 0.044, 0.045, 6), col, { at: [x, y + 0.03, z] }), 0.9);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 6), WOODR[3], { at: [x, y + h + 0.01, z] });
  };
  potion(0.12, FLOOR + 0.3, -0.66, "#40d860", 0.11);
  potion(0.22, FLOOR + 0.3, -0.62, "#c050e8", 0.13);
  potion(0.28, FLOOR + 0.3, -0.72, "#e84848", 0.1);
  // book + scroll on the top crate
  tile([0.16, 0.03, 0.12], [0.8, FLOOR + 0.88, -0.5], BOOK, 15);
  tile([0.15, 0.02, 0.11], [0.8, FLOOR + 0.91, -0.5], PAGES, 15);
  box([0.14, 0.01, 0.1], [0.8, FLOOR + 0.93, -0.5], "#8a1c24", 15);
  b.rod([0.55, FLOOR + 0.04, -0.05], [0.7, FLOOR + 0.04, 0.0], 0.025, "#e8dcb8", { sides: 6 });
  box([0.012, 0.05, 0.05], [0.55, FLOOR + 0.015, -0.05], "#b8ad90");

  // ---------- brazier ----------
  const BX = -0.9;
  const BZ = 0.5;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    b.rod([BX + Math.cos(a) * 0.15, FLOOR + 0.5, BZ + Math.sin(a) * 0.15], [BX + Math.cos(a) * 0.22, FLOOR, BZ + Math.sin(a) * 0.22], 0.02, IRONR[2], { sides: 4 });
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.06), IRONR[3], { at: [BX + Math.cos(a) * 0.22, FLOOR + 0.015, BZ + Math.sin(a) * 0.22] });
  }
  b.rod([BX, FLOOR + 0.1, BZ], [BX, FLOOR + 0.5, BZ], 0.025, IRONR[2], { sides: 6 });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.2, 0.1],
      [0.23, 0.17],
      [0.2, 0.17],
      [0.17, 0.1],
      [0, 0.06],
    ],
    { at: [BX, FLOOR + 0.5, BZ], segments: 8, color: IRONR[2] },
  );
  b.lathe(
    [
      [0.2, 0.17],
      [0.235, 0.17],
      [0.235, 0.2],
      [0.2, 0.2],
    ],
    { at: [BX, FLOOR + 0.5, BZ], segments: 8, color: IRONR[3] },
  );
  // coals
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    const d = 0.04 + (i % 3) * 0.04;
    glow(box([0.05, 0.04, 0.05], [BX + Math.cos(a) * d, FLOOR + 0.6, BZ + Math.sin(a) * d], i % 2 ? "#d84010" : "#a02808", i * 20), 1);
  }
  // flame stacks
  const flames: Array<[number, number, number, number, number, string]> = [
    [0, 0, 0, 0.12, 0.14, "#e85010"],
    [0.05, 0, 0.02, 0.08, 0.2, "#e87810"],
    [-0.05, 0, -0.03, 0.07, 0.17, "#e87810"],
    [0, 0.1, 0, 0.08, 0.14, "#ffb020"],
    [0.02, 0.19, 0, 0.05, 0.1, "#ffd848"],
    [-0.01, 0.26, 0.01, 0.03, 0.07, "#fff4a0"],
    [0.0, 0.0, 0.0, 0.05, 0.1, "#ffe070"],
  ];
  flames.forEach(([x, y, z, w, h, c], i) => glow(box([w, h, w], [BX + x, FLOOR + 0.64 + y, BZ + z], c, 15 + i * 12), 1.6));
  // embers
  for (const [x, y, z] of [[0.1, 0.5, 0.05], [-0.08, 0.62, -0.1], [0.04, 0.78, -0.06]] as const)
    glow(box([0.015, 0.015, 0.015], [BX + x, FLOOR + 0.64 + y * 0.8, BZ + z], "#ffb020"), 1.8);

  // ---------- skull pile and bones ----------
  const PX = 0.98;
  const PZ = 0.55;
  const skull = (x: number, y: number, z: number, a: number, s = 1) =>
    b.part(new THREE.BoxGeometry(0.1 * s, 0.09 * s, 0.1 * s), "#ffffff", { at: [x, y + 0.045 * s, z], rotation: [0, a, 0], texture: SKULL });
  skull(PX, FLOOR, PZ, 200);
  skull(PX - 0.12, FLOOR, PZ + 0.1, 160, 0.95);
  skull(PX + 0.02, FLOOR, PZ - 0.14, 235);
  skull(PX - 0.14, FLOOR, PZ - 0.06, 120, 0.9);
  skull(PX - 0.05, FLOOR + 0.09, PZ - 0.03, 175, 0.95);
  skull(PX - 0.17, FLOOR, PZ + 0.26, 150, 0.85);
  // bones
  const bone = (a: [number, number, number], c: [number, number, number]) => {
    b.rod(a, c, 0.011, "#e8dcc0", { sides: 4 });
    for (const p of [a, c]) b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), "#e8dcc0", { at: p });
  };
  bone([PX - 0.3, FLOOR + 0.015, PZ + 0.05], [PX - 0.18, FLOOR + 0.015, PZ - 0.2]);
  bone([PX - 0.28, FLOOR + 0.015, PZ - 0.2], [PX - 0.4, FLOOR + 0.015, PZ - 0.02]);
  bone([PX + 0.1, FLOOR + 0.015, PZ + 0.2], [PX + 0.12, FLOOR + 0.015, PZ - 0.1]);
  tile([0.08, 0.03, 0.04], [PX - 0.3, FLOOR, PZ + 0.3], BONE, 30);
  // ribcage
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.05 - i * 0.004, 0.006, 4, 6, Math.PI), "#e8dcc0", {
      at: [PX + 0.2, FLOOR + 0.04, PZ + 0.4 - i * 0.045],
      rotation: [0, 90, 0],
    });
  b.rod([PX + 0.2, FLOOR + 0.012, PZ + 0.42], [PX + 0.2, FLOOR + 0.012, PZ + 0.24], 0.01, "#b8ad90", { sides: 4 });
  // candle stub melted on a skull
  box([0.03, 0.06, 0.03], [PX - 0.05, FLOOR + 0.18, PZ - 0.03], "#e8dcb8");
  glow(box([0.02, 0.03, 0.02], [PX - 0.05, FLOOR + 0.24, PZ - 0.03], "#ffd040"), 1.6);
  glow(box([0.01, 0.02, 0.01], [PX - 0.05, FLOOR + 0.27, PZ - 0.03], "#fff6c0"), 1.8);

  // ---------- floor clutter: broken pottery, rat tail rope ----------
  for (const [x, z, a] of [[-0.35, 0.8, 20], [-0.28, 0.88, 60], [-0.42, 0.9, 100]] as const)
    b.part(new THREE.BoxGeometry(0.05, 0.015, 0.035), "#a05a30", { at: [x, FLOOR + 0.008, z], rotation: [0, a, 0] });
  b.sweep(
    [
      [0.55, FLOOR + 0.012, 0.85],
      [0.7, FLOOR + 0.012, 0.95],
      [0.85, FLOOR + 0.012, 0.88],
      [0.78, FLOOR + 0.012, 0.8],
    ],
    0.012,
    "#8a6a3a",
    { section: { ngon: 4 }, caps: "flat" },
  );
  // painted moss patch on the wall base
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.02), cellPaint(0.02, (c) => c.pick(MOSS, noise(c.at, 0.1, 3) * 1.2 - 0.1)), {
    at: [-0.55, FLOOR + 0.07, WZ + 0.135],
  });

  return b.root;
}
