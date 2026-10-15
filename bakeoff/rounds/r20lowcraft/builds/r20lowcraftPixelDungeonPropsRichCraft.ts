import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A pixel-art dungeon corner: an open treasure chest, wall torches, barrels, scattered bones and a spike trap on a flagstone floor.",
  style: "pixel art",
  commit: "88fc1f0",
};

// Floor top height; every prop stands on it.
const B = 0.08;

const WOOD = ["#2a170d", "#4a2a14", "#6b3f1e", "#8d5a2c", "#b0793c"];
const STONE = ["#262833", "#3b3e4d", "#515568", "#6b6f84", "#878ba0"];
const MORTAR = "#14151b";
const MOSS = ["#2f4a22", "#47702f", "#6a9a3e"];
const IRON_R = ["#191b22", "#2b2f39", "#434a58", "#626a7b", "#8a93a5"];
const IRON_L = "#626a7b";
const GOLD = "#e8b82a";
const GOLD_L = "#ffd95a";
const GOLD_D = "#a8741a";
const BONE = ["#8f8467", "#b9ad8a", "#d9cfae", "#efe7cc"];
const BLOOD = "#7a1620";
const CLOTH = "#5a3a2a";

// Chest placement.
const CX = -0.55;
const CZ = -0.5;
const CH_TOP = B + 0.35;

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const r = rng(7);

  const P = (g: THREE.BufferGeometry, color: string | Paint, at: number[], o: PartOptions = {}) =>
    b.part(g, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const lerp3 = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);

  // ------------------------------------------------------------------ textures
  const WOOD_TILE = pixelTexture(56, 32, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const ry = y % 6;
      if (ry === 0) return WOOD[0];
      if (ry === 1) return WOOD[3];
      const streak = (x * 7 + row * 13) % 23 < 3 ? -0.2 : 0;
      return pick(WOOD, 0.34 + 0.07 * ((row * 5) % 4) + streak + 0.22 * r(), bayer(x, y));
    });
    for (let row = 0; row < 6; row++) {
      const sx = ((row * 17 + 9) % 48) + 4;
      for (let ry = 0; ry < 6; ry++) g.set(sx, row * 6 + ry, WOOD[0]);
      g.set(2, row * 6 + 3, IRON_L);
      g.set(53, row * 6 + 3, IRON_L);
    }
  });

  const STONE_T = pixelTexture(48, 56, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const ry = y % 8;
      const off = (row % 2) * 8;
      const bx = (x + off) % 16;
      if (ry === 7 || bx === 15) return MORTAR;
      const id = Math.floor((x + off) / 16) + row * 4;
      const shade = (((id * 2654435761) >>> 0) % 7) / 7;
      let v = 0.25 + 0.35 * shade + 0.2 * r();
      if (ry === 0) v += 0.18;
      if (ry === 6 || bx === 14) v -= 0.12;
      if (row >= 5 && ry >= 4 && r() < 0.1) return pick(MOSS, r());
      return pick(STONE, v, bayer(x, y));
    });
  });

  const FLAG_T = pixelTexture(40, 40, (g) => {
    g.fill((x, y) => {
      const off = (Math.floor(y / 20) % 2) * 10;
      const bx = (x + off) % 20;
      const by = y % 20;
      if (bx === 19 || by === 19) return MORTAR;
      let v = 0.3 + 0.12 * (((Math.floor((x + off) / 20) + Math.floor(y / 20) * 2) * 7) % 3) + 0.2 * r();
      if (bx === 0 || by === 0) v += 0.15;
      return pick(STONE, v, bayer(x, y));
    });
    for (const [sx, sy] of [
      [6, 3],
      [30, 22],
    ]) {
      let cx = sx;
      let cy = sy;
      for (let i = 0; i < 14; i++) {
        g.set(cx, cy, MORTAR);
        cx += r() < 0.5 ? 0 : 1;
        cy += 1;
      }
    }
  });

  const TRAP_T = pixelTexture(28, 28, (g) => {
    g.fill((x, y) => {
      const edge = x < 2 || y < 2 || x > 25 || y > 25;
      let v = edge ? 0.65 : 0.3;
      v += 0.18 * r();
      if (!edge && (x + y) % 9 === 0) v -= 0.1;
      return pick(IRON_R, v, bayer(x, y));
    });
    for (const hx of [5, 11, 17, 22])
      for (const hy of [5, 11, 17, 22])
        for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) g.set(hx + dx, hy + dy, "#0c0d11");
    for (const [rx, ry] of [
      [1, 1],
      [26, 1],
      [1, 26],
      [26, 26],
    ])
      g.set(rx, ry, IRON_R[4]);
    for (const [bx, by, br] of [
      [8, 15, 2],
      [20, 9, 2],
      [14, 22, 3],
    ])
      for (let dx = -br; dx <= br; dx++)
        for (let dy = -br; dy <= br; dy++) if (dx * dx + dy * dy <= br * br + 1) g.set(bx + dx, by + dy, "#5a1018");
  });

  const FIRE = pixelArt(
    [
      "....r.....",
      "....rr....",
      "...rrr.r..",
      "..rroor.r.",
      "..rooorrr.",
      ".rooyyoor.",
      ".rooyyyor.",
      ".roywwyor.",
      ".rooywyor.",
      "..roooor..",
    ],
    { r: "#e23a12", o: "#ff8a1e", y: "#ffd23f", w: "#fff2a8" },
  );

  const SOOT = pixelTexture(12, 12, (g) => {
    g.fill((x, y) => {
      const d = Math.hypot(x - 5.5, y - 11) / 11;
      return d < 0.9 && r() < (0.9 - d) * 0.9 ? "#14110f" : undefined;
    });
  });

  const WEB = pixelTexture(12, 12, (g) => {
    g.fill((x, y) => {
      const s = x + y;
      if (s > 11) return undefined;
      const radial = x === 0 || y === 0 || x === y || y === 2 * x || x === 2 * y;
      const arc = s === 5 || s === 8 || s === 11;
      return radial || arc ? "#c9cdd6" : undefined;
    });
  });

  const MARK_SKULL = pixelArt(
    ["..rrrr..", ".rrrrrr.", "rr.rr.rr", "rrrrrrrr", "..rrrr..", "..r..r..", "..rrrr..", "........"],
    { r: "#c6372b" },
  );
  const MARK_X = pixelArt(
    ["x......x", ".x....x.", "..x..x..", "...xx...", "...xx...", "..x..x..", ".x....x.", "x......x"],
    { x: "#d9cfae" },
  );

  const layout = skinLayout({ cran: [8, 7, 8], jaw: [6, 3, 6] }, 32);
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const faces of Object.values(layout.faces))
      for (const rect of Object.values(faces))
        g.fill((x, y, _w, h) => {
          if (r() < 0.03) return BONE[0];
          return pick(BONE, 0.7 - y / h / 2 + 0.2 * (r() - 0.5), bayer(x, y));
        }, rect);
    const f = layout.faces.cran.pz;
    g.stamp(
      f[0],
      f[1],
      ["........", ".kk..kk.", ".kk..kk.", "...kk...", "...kk...", "........", "wkwkwkwk"],
      { k: "#17120e", w: "#f5efd6" },
    );
    const j = layout.faces.jaw.pz;
    g.stamp(j[0], j[1], ["wkwkwk", "wwwwww", "......"], { k: "#17120e", w: "#f5efd6" });
  });

  // ------------------------------------------------------------------ paints
  const IRON_P = cellPaint(0.01, (c) =>
    c.pick(["#22252d", "#3a3f4a", "#565d6c"], 0.45 + 0.5 * (c.random(3) - 0.5) + 0.2 * c.n.y),
  );
  const CRATE_P = cellPaint(0.0125, (c) => c.pick(WOOD, 0.2 + 0.2 * c.random(1)));
  const lidPaint = cellPaint(0.0125, (c) => {
    const a = Math.atan2(c.at.y - CH_TOP, c.at.z - CZ) / DEG + 180;
    const k = Math.floor(a / 16);
    if (a % 16 < 2.5) return WOOD[0];
    return c.pick(WOOD, 0.4 + 0.1 * ((k * 5) % 4) + 0.25 * (c.random(3) - 0.5));
  });
  const barrelPaint = (axis: THREE.Vector3, lying: boolean) =>
    cellPaint(0.0125, (c) => {
      if (Math.abs(c.n.dot(axis)) > 0.8) {
        const q = lying ? c.at.y : c.at.x;
        const k = Math.floor(q / 0.07);
        if (((q % 0.07) + 0.07) % 0.07 < 0.0125) return WOOD[0];
        return c.pick(WOOD, 0.35 + 0.1 * (((k % 3) + 3) % 3) + 0.25 * (c.random(1) - 0.5));
      }
      const deg = c.s[1];
      const k = Math.floor(deg / 36);
      if (deg % 36 < 4) return WOOD[0];
      let v = 0.3 + 0.12 * ((k * 5) % 4) + 0.22 * (c.random(2) - 0.5);
      if (c.s[0] < -0.2) v -= 0.1;
      return c.pick(WOOD, v);
    });

  // ------------------------------------------------------------------ floor
  P(box(2.4, 0.05, 1.9), "#262833", [0, 0.025, 0]);
  for (const fx of [-0.8, 0, 0.8])
    for (const fz of [-0.475, 0.475])
      P(tileBox([0.77, 0.03, 0.93], FLAG_T, 0.025, { rand: r, step: [10, 10] }), "#ffffff", [fx, B - 0.015, fz], {
        texture: FLAG_T,
      });

  // ------------------------------------------------------------------ wall and pillar
  const segs: Array<[number, number]> = [
    [-0.55, 0.95],
    [0.15, 0.95],
    [0.85, 0.78],
  ];
  segs.forEach(([cx, h], i) => {
    P(tileBox([0.7, h, 0.2], STONE_T, 0.025, { rand: r, step: [8, 8] }), "#ffffff", [cx, B + h / 2, -0.85], {
      texture: STONE_T,
    });
    if (i < 2)
      P(tileBox([0.74, 0.05, 0.26], STONE_T, 0.025, { rand: r, step: [8, 8] }), "#ffffff", [cx, B + h + 0.025, -0.85], {
        texture: STONE_T,
      });
  });
  P(tileBox([0.3, 1.2, 0.3], STONE_T, 0.025, { rand: r, step: [8, 8] }), "#ffffff", [-1.05, B + 0.6, -0.8], {
    texture: STONE_T,
  });
  P(tileBox([0.36, 0.06, 0.36], STONE_T, 0.025, { rand: r, step: [8, 8] }), "#ffffff", [-1.05, B + 1.23, -0.8], {
    texture: STONE_T,
  });
  P(tileBox([0.34, 0.1, 0.34], STONE_T, 0.025, { rand: r, step: [8, 8] }), "#ffffff", [-1.05, B + 0.05, -0.8], {
    texture: STONE_T,
  });
  // Cobweb in the corner between pillar and wall.
  P(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", [-0.8, B + 0.85, -0.744], {
    dir: [0, 0, 1],
    axis: "z",
    texture: WEB,
  });
  // Rubble.
  for (const [rx, rz, s, yaw] of [
    [1.08, -0.62, 0.1, 20],
    [0.95, -0.7, 0.07, 55],
    [1.12, -0.5, 0.06, 10],
    [-0.72, -0.62, 0.08, 35],
    [0.4, -0.66, 0.06, 70],
  ])
    P(tileBox([s, s * 0.8, s], STONE_T, 0.0125, { rand: r }), "#ffffff", [rx, B + s * 0.4, rz], {
      texture: STONE_T,
      rotation: [0, yaw, 0],
    });
  for (const [rx, ry, rz, yaw] of [
    [0.7, B + 0.8, -0.85, 25],
    [0.98, B + 0.8, -0.82, 60],
    [0.85, B + 0.84, -0.9, 10],
  ])
    P(tileBox([0.1, 0.07, 0.1], STONE_T, 0.0125, { rand: r }), "#ffffff", [rx, ry, rz], {
      texture: STONE_T,
      rotation: [8, yaw, 6],
    });

  // ------------------------------------------------------------------ torches
  const torch = (x: number, y0: number) => {
    const p0 = [x, y0, -0.745];
    const p1 = [x, y0 + 0.28, -0.6];
    // soot streak and bracket plate
    P(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", [x, y0 + 0.37, -0.744], {
      dir: [0, 0, 1],
      axis: "z",
      texture: SOOT,
    });
    P(box(0.12, 0.16, 0.02), IRON_P, [x, y0, -0.74]);
    for (const [dx, dy] of [
      [-0.04, 0.06],
      [0.04, 0.06],
      [-0.04, -0.06],
      [0.04, -0.06],
    ])
      P(box(0.014, 0.014, 0.012), IRON_L, [x + dx, y0 + dy, -0.73]);
    b.rod(p0, p1, 0.02, { color: "#6b3f1e", bone: root, sides: 6 });
    b.rod(lerp3(p0, p1, 0.3), lerp3(p0, p1, 0.4), 0.028, { color: IRON_P, bone: root, sides: 6 });
    b.rod(lerp3(p0, p1, 0.62), lerp3(p0, p1, 0.98), 0.036, { color: CLOTH, bone: root, sides: 6 });
    b.rod(lerp3(p0, p1, 0.72), lerp3(p0, p1, 0.76), 0.04, { color: "#2e1c12", bone: root, sides: 6 });
    b.rod(lerp3(p0, p1, 0.88), lerp3(p0, p1, 0.92), 0.04, { color: "#2e1c12", bone: root, sides: 6 });
    b.rod(lerp3(p0, p1, 0.96), lerp3(p0, p1, 1.04), 0.043, { color: IRON_P, bone: root, sides: 6 });
    const tip = [p1[0], p1[1] + 0.03, p1[2] + 0.01];
    glow(
      P(box(0.07, 0.08, 0.07), "#ff9a2a", [tip[0], tip[1] + 0.02, tip[2]], { rotation: [0, 45, 0] }),
      1.2,
    );
    glow(
      b.cards([frame(new THREE.Vector3(tip[0], tip[1] + 0.02, tip[2]), [0, 1, 0])], FIRE, {
        size: [0.16, 0.24],
        cross: true,
        bone: root,
        sink: 0,
      }),
      1.3,
    );
    for (let i = 0; i < 4; i++)
      glow(
        P(box(0.012, 0.012, 0.012), i % 2 ? "#ffd23f" : "#ff8a1e", [
          tip[0] + (r() - 0.5) * 0.14,
          tip[1] + 0.14 + r() * 0.12,
          tip[2] + (r() - 0.5) * 0.14,
        ]),
        1.2,
      );
  };
  torch(-0.1, B + 0.5);
  torch(0.85, B + 0.46);

  // ------------------------------------------------------------------ barrels
  const barrelRad = (y: number) => {
    const ys = [-0.28, -0.14, 0, 0.14, 0.28];
    const rs = [0.2, 0.235, 0.25, 0.235, 0.2];
    for (let i = 0; i < 4; i++) if (y <= ys[i + 1]) return rs[i] + ((rs[i + 1] - rs[i]) * (y - ys[i])) / (ys[i + 1] - ys[i]);
    return rs[4];
  };
  const barrel = (cx: number, cz: number, sc: number, open: boolean, lying: boolean, yawDeg: number) => {
    const axis = lying
      ? new THREE.Vector3(Math.cos(yawDeg * DEG), 0, Math.sin(yawDeg * DEG))
      : new THREE.Vector3(0, 1, 0);
    const cy = lying ? B + 0.24 * sc : B + 0.28 * sc;
    const at = [cx, cy, cz];
    const base: Array<[number, number]> = [
      [0, -0.28],
      [0.2, -0.28],
      [0.235, -0.14],
      [0.25, 0],
      [0.235, 0.14],
      [0.2, 0.28],
    ];
    const tail: Array<[number, number]> = open
      ? [
          [0.18, 0.28],
          [0.18, 0.12],
          [0, 0.12],
        ]
      : [[0, 0.28]];
    const outline = [...base, ...tail].map(([x, y]): [number, number] => [x * sc, y * sc]);
    const body = b.lathe(outline, {
      at,
      axis: [axis.x, axis.y, axis.z],
      segments: 10,
      color: barrelPaint(axis, lying),
      bone: root,
    });
    for (const y of [-0.21, -0.09, 0.09, 0.21]) {
      const rr = barrelRad(y);
      b.lathe(
        [
          [(rr - 0.006) * sc, (y - 0.022) * sc],
          [(rr + 0.01) * sc, (y - 0.022) * sc],
          [(rr + 0.01) * sc, (y + 0.022) * sc],
          [(rr - 0.006) * sc, (y + 0.022) * sc],
        ],
        { at, axis: [axis.x, axis.y, axis.z], segments: 10, color: IRON_P, bone: root },
      );
    }
    if (open) P(new THREE.CylinderGeometry(0.17 * sc, 0.17 * sc, 0.01, 10), "#2d6d8f", [cx, cy + 0.21 * sc, cz]);
    return body;
  };
  const barrel1 = barrel(0.65, -0.45, 1, true, false, 0);
  const barrel2 = barrel(0.95, 0, 0.8, false, false, 0);
  barrel(0.55, 0.45, 0.85, false, true, 18);
  // chocks under the lying barrel
  P(box(0.06, 0.04, 0.05), "#4a2a14", [0.36, B + 0.02, 0.55]);
  P(box(0.06, 0.04, 0.05), "#4a2a14", [0.74, B + 0.02, 0.36], { rotation: [0, 18, 0] });
  b.decal(barrel1, MARK_SKULL, { at: [0.65, B + 0.3, -0.2], dir: [0, 0, 1], size: [0.15, 0.15], segments: 4, lift: 0.002 });
  b.decal(barrel2, MARK_X, { at: [0.95, B + 0.24, 0.16], dir: [0, 0, 1], size: [0.12, 0.12], segments: 4, lift: 0.002 });
  // puddle
  P(new THREE.CylinderGeometry(0.12, 0.12, 0.006, 8), "#2b5a78", [0.62, B + 0.003, -0.03], { scale: [1, 1, 0.7] });

  // candle and small skull on the second barrel
  const topY = B + 0.448;
  P(new THREE.CylinderGeometry(0.035, 0.04, 0.012, 8), "#e8dcc0", [0.95, topY + 0.006, 0]);
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 6), "#f0e6c8", [0.95, topY + 0.057, 0]);
  P(box(0.012, 0.02, 0.012), "#c9b68a", [0.975, topY + 0.016, 0.03]);
  glow(
    b.cards([frame(new THREE.Vector3(0.95, topY + 0.1, 0), [0, 1, 0])], FIRE, {
      size: [0.04, 0.065],
      cross: true,
      bone: root,
      sink: 0,
    }),
    1.3,
  );

  // ------------------------------------------------------------------ skulls and bones
  const skull = (x: number, y: number, z: number, yaw: number, s: number) => {
    const o = (dx: number, dy: number, dz: number) => {
      const c = Math.cos(yaw * DEG);
      const sn = Math.sin(yaw * DEG);
      return [x + (dx * c + dz * sn) * s, y + dy * s, z + (-dx * sn + dz * c) * s];
    };
    P(skinBox(SHEET, layout.faces.jaw, 0.016), "#ffffff", o(0, 0.024, 0.008), {
      rotation: [0, yaw, 0],
      scale: s,
      texture: SHEET,
    });
    P(skinBox(SHEET, layout.faces.cran, 0.016), "#ffffff", o(0, 0.101, 0), {
      rotation: [0, yaw, 0],
      scale: s,
      texture: SHEET,
    });
  };
  skull(-0.88, B, 0.66, 22, 1);
  skull(0.82, topY, 0.06, -35, 0.55);

  const boneRod = (a: number[], c: number[], rad = 0.012) => {
    b.rod(a, c, rad, { color: BONE[2], bone: root, sides: 5 });
    const perp = new THREE.Vector3(-(c[2] - a[2]), 0, c[0] - a[0]).normalize().multiplyScalar(rad * 0.9);
    for (const e of [a, c])
      for (const sg of [1, -1])
        P(new THREE.SphereGeometry(rad * 1.5, 6, 4), BONE[3], [e[0] + perp.x * sg, e[1], e[2] + perp.z * sg]);
  };
  const bf = B + 0.014;
  boneRod([-0.72, bf, -0.05], [-0.68, bf, 0.28]);
  boneRod([-1.12, bf, 0.9], [-0.85, bf, 0.8]);
  boneRod([0.24, bf, 0.82], [0.55, bf, 0.92]);
  for (const [ax, az, cx2, cz2] of [
    [-1.1, 0.5, -1.04, 0.43],
    [-0.78, 0.9, -0.7, 0.86],
    [-0.6, 0.62, -0.62, 0.7],
    [-1.0, 0.78, -0.96, 0.86],
    [0.7, 0.88, 0.78, 0.84],
    [-0.45, 0.04, -0.4, 0.1],
  ])
    boneRod([ax, B + 0.009, az], [cx2, B + 0.009, cz2], 0.008);

  // rib cage
  const spineZ = 0.1;
  b.rod([-1.12, B + 0.018, spineZ], [-0.82, B + 0.018, spineZ], 0.012, { color: BONE[1], bone: root, sides: 5 });
  for (let i = 0; i < 6; i++)
    P(box(0.03, 0.03, 0.04), BONE[1], [-1.12 + i * 0.055, B + 0.022, spineZ], { rotation: [0, r() * 20, 0] });
  for (let i = 0; i < 5; i++) {
    const x = -1.1 + i * 0.055;
    const sl = [0.8, 1, 1.05, 1, 0.85][i];
    b.sweep(
      catmull([
        [x, B + 0.02, spineZ],
        [x, B + 0.085 * sl, spineZ + 0.035],
        [x, B + 0.125 * sl, spineZ + 0.11 * sl],
        [x, B + 0.075 * sl, spineZ + 0.2 * sl],
        [x, B + 0.012, spineZ + 0.24 * sl],
      ]),
      [0.011, 0.006],
      { color: BONE[2], bone: root, sides: 5 },
    );
    if (i > 0 && i < 4)
      b.sweep(
        catmull([
          [x, B + 0.02, spineZ],
          [x, B + 0.03, spineZ - 0.07],
          [x, B + 0.012, spineZ - 0.15],
        ]),
        [0.01, 0.005],
        { color: BONE[1], bone: root, sides: 5 },
      );
  }

  // ------------------------------------------------------------------ spike trap
  const TX = -0.2;
  const TZ = 0.55;
  P(tileBox([0.7, 0.03, 0.7], TRAP_T, 0.025), "#ffffff", [TX, B + 0.015, TZ], { texture: TRAP_T });
  for (const [dx, dz, w, d] of [
    [0, 0.36, 0.76, 0.02],
    [0, -0.36, 0.76, 0.02],
    [0.36, 0, 0.02, 0.7],
    [-0.36, 0, 0.02, 0.7],
  ])
    P(tileBox([w, 0.045, d], STONE_T, 0.0125, { rand: r }), "#ffffff", [TX + dx, B + 0.0225, TZ + dz], {
      texture: STONE_T,
    });
  const hs = [0.2, 0.12, 0.2, 0.05, 0.1, 0.22, 0.16, 0.2, 0.2, 0.05, 0.22, 0.12, 0.14, 0.2, 0.05, 0.18];
  const offs = [-0.21, -0.07, 0.07, 0.21];
  offs.forEach((ox, ix) =>
    offs.forEach((oz, iz) => {
      const i = ix * 4 + iz;
      const h = hs[i];
      const x = TX + ox;
      const z = TZ + oz;
      P(box(0.05, 0.015, 0.05), IRON_P, [x, B + 0.0375, z]);
      P(new THREE.CylinderGeometry(0.001, 0.022, h, 4), "#aab4c4", [x, B + 0.045 + h / 2, z], {
        rotation: [0, 45, 0],
      });
      P(
        new THREE.CylinderGeometry(0.001, 0.0235 * 0.4 + 0.0005, 0.4 * h, 4),
        i === 5 || i === 10 || i === 3 ? BLOOD : "#e6ecf5",
        [x, B + 0.045 + 0.8 * h, z],
        { rotation: [0, 45, 0] },
      );
    }),
  );

  // ------------------------------------------------------------------ chest
  const lid = b.joint("chestLid", { parent: root, at: [CX, CH_TOP, CZ - 0.2], dir: [0, 0, 1], role: "hinge" });
  P(box(0.66, 0.05, 0.44), CRATE_P, [CX, B + 0.025, CZ]);
  P(tileBox([0.62, 0.3, 0.4], WOOD_TILE, 0.0125, { rand: r, step: [1, 6] }), "#ffffff", [CX, B + 0.2, CZ], {
    texture: WOOD_TILE,
  });
  for (const bx of [-0.28, -0.18, 0.18, 0.28]) {
    P(box(0.05, 0.304, 0.416), IRON_P, [CX + bx, B + 0.2, CZ]);
    for (const sz of [1, -1])
      for (const ry of [0.12, 0.3])
        P(box(0.016, 0.016, 0.01), IRON_L, [CX + bx, B + ry, CZ + sz * 0.21]);
  }
  for (const [sx, sz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    P(box(0.07, 0.07, 0.07), IRON_P, [CX + sx * 0.3, B + 0.085, CZ + sz * 0.195]);
  // lock plate on the body
  P(box(0.09, 0.09, 0.03), GOLD, [CX, CH_TOP - 0.06, CZ + 0.208]);
  P(box(0.06, 0.06, 0.012), GOLD_L, [CX, CH_TOP - 0.06, CZ + 0.225]);
  P(box(0.014, 0.03, 0.012), "#17120e", [CX, CH_TOP - 0.065, CZ + 0.232]);
  // red lining and treasure inside
  P(box(0.54, 0.012, 0.32), "#8e1f2c", [CX, CH_TOP + 0.004, CZ]);
  for (let i = 0; i < 9; i++) {
    const sr = 0.045 + 0.03 * r();
    P(new THREE.SphereGeometry(sr, 6, 4), i % 2 ? GOLD : GOLD_L, [
      CX - 0.2 + 0.4 * r(),
      CH_TOP + 0.01 + sr * 0.3,
      CZ - 0.09 + 0.18 * r(),
    ], { scale: [1, 0.55, 1] });
  }
  for (let i = 0; i < 12; i++)
    P(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), i % 3 ? GOLD : GOLD_D, [
      CX - 0.22 + 0.44 * r(),
      CH_TOP + 0.045 + 0.02 * r(),
      CZ - 0.1 + 0.2 * r(),
    ], { rotation: [r() * 60 - 30, r() * 180, r() * 60 - 30] });
  for (const [gx, gz, gc] of [
    [-0.12, 0.04, "#d6283a"],
    [0.1, -0.05, "#2c7be0"],
    [0.18, 0.07, "#2fbf5e"],
  ] as Array<[number, number, string]>)
    glow(P(new THREE.OctahedronGeometry(0.028, 0), gc, [CX + gx, CH_TOP + 0.075, CZ + gz], { rotation: [0, 30, 0] }), 0.6);
  // lid (opens on the hinge)
  const arch: Array<[number, number]> = [
    [-0.2, 0],
    [-0.19, 0.06],
    [-0.16, 0.12],
    [-0.1, 0.17],
    [0, 0.2],
    [0.1, 0.17],
    [0.16, 0.12],
    [0.19, 0.06],
    [0.2, 0],
  ];
  const archBig = arch.map(([x, y]): [number, number] => [x * 1.04, y === 0 ? 0 : y + 0.006]);
  b.extrude(arch, { at: [CX, CH_TOP, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.62, color: lidPaint, bone: lid });
  for (const bx of [-0.28, -0.18, 0.18, 0.28])
    b.extrude(archBig, { at: [CX + bx, CH_TOP, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.052, color: IRON_P, bone: lid });
  P(box(0.05, 0.1, 0.014), IRON_P, [CX, CH_TOP + 0.01, CZ + 0.208], { bone: lid });
  P(box(0.02, 0.02, 0.016), GOLD, [CX, CH_TOP - 0.025, CZ + 0.214], { bone: lid });
  for (const sx of [1, -1])
    P(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), IRON_P, [CX + sx * 0.2, CH_TOP, CZ - 0.2], {
      bone: lid,
      rotation: [0, 0, 90],
    });
  b.pose(lid, { axis: [1, 0, 0], deg: -35 });

  // spilled coins, gem and key in front of the chest
  for (let i = 0; i < 8; i++)
    P(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), i % 3 ? GOLD : GOLD_L, [
      CX - 0.25 + 0.5 * r(),
      B + 0.005,
      CZ + 0.3 + 0.17 * r(),
    ], { rotation: [0, r() * 180, 0] });
  glow(P(new THREE.OctahedronGeometry(0.026, 0), "#d6283a", [CX + 0.34, B + 0.026, CZ + 0.38], { rotation: [0, 20, 0] }), 0.6);
  P(new THREE.TorusGeometry(0.02, 0.006, 5, 8), GOLD_D, [-0.45, B + 0.008, -0.12], { rotation: [90, 0, 0] });
  b.rod([-0.43, B + 0.008, -0.12], [-0.3, B + 0.008, -0.12], 0.006, { color: GOLD_D, bone: root, sides: 4 });
  P(box(0.012, 0.01, 0.03), GOLD_D, [-0.31, B + 0.008, -0.105]);
  P(box(0.012, 0.01, 0.02), GOLD_D, [-0.34, B + 0.008, -0.108]);

  return b.root;
}
