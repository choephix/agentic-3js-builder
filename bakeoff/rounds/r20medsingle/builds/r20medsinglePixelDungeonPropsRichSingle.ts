// Dungeon props in pixel art: an open treasure chest, two standing torches and a fallen one, three barrels,
// scattered bones with a skull and a rib cage, and a spike trap in a stone frame, all on a flagstone slab.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, stepped, tileBox } from "../../../../kits/pixel";
import { DEG, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon prop group on a flagstone slab: open gold chest with gems, two standing torches and a fallen one, three barrels (sealed, open with slime, on its side), a skull, rib cage and bones with a shackle chain, and a bloodied spike trap.",
  style: "pixel art",
  commit: "88fc1f0",
};

type Pl = { yaw: number; rot: number[]; p: (x: number, y: number, z: number) => number[] };

export default function build() {
  const b = createBuilder({ name: "dungeonProps", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);
  const rand = rng(21);
  const F = 0.06; // floor top

  // ---------------------------------------------------------------- placement helpers
  const place = (ox: number, oz: number, yaw: number): Pl => {
    const c = Math.cos(yaw * DEG);
    const s = Math.sin(yaw * DEG);
    return { yaw, rot: [0, yaw, 0], p: (x, y, z) => [ox + x * c + z * s, y, oz - x * s + z * c] };
  };
  const P0 = place(0, 0, 0);

  const box = (
    pl: Pl,
    size: number[],
    color: string | Paint,
    l: number[],
    bone: Joint = root,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: pl.p(l[0], l[1], l[2]),
      rotation: pl.rot,
    });

  const tbox = (
    pl: Pl,
    size: [number, number, number],
    tex: ReturnType<typeof pixelTexture>,
    texel: number,
    l: number[],
    step: [number, number] = [1, 6],
    bone: Joint = root,
  ) =>
    b.part(tileBox(size, tex, texel, { rand, step }), "#ffffff", {
      bone,
      at: pl.p(l[0], l[1], l[2]),
      rotation: pl.rot,
      texture: tex,
    });

  const world = (pl: Pl, geo: THREE.BufferGeometry, l: number[], rx = 0, ry = 0, rz = 0) => {
    geo.rotateX(rx * DEG);
    geo.rotateZ(rz * DEG);
    geo.rotateY((ry + pl.yaw) * DEG);
    const q = pl.p(l[0], l[1], l[2]);
    geo.translate(q[0], q[1], q[2]);
    return geo;
  };
  const merged = (list: THREE.BufferGeometry[], color: string | Paint, bone: Joint = root) =>
    b.part(mergeGeometries(list)!, color, { bone, at: [0, 0, 0] });

  // ---------------------------------------------------------------- palettes and paints
  const STONE_R = ["#23232e", "#33343f", "#454757", "#5a5d72", "#757a92"];
  const WOOD_R = ["#2a170b", "#43260f", "#5d3718", "#7a4b20", "#9a6430"];
  const WOODB = ["#2b1809", "#412410", "#5b3517", "#774a20", "#935f2b"];
  const BONER = ["#5e5238", "#8c7f5c", "#b9ad86", "#dcd2ac", "#f2ebcf"];
  const IRONR = ["#1b1d26", "#2c303d", "#444a5c", "#626a80", "#8890a8"];
  const RUST = ["#3a1a0c", "#5a2a10", "#8a4418"];
  const MOSS_R = ["#1c3a14", "#2c5a1e", "#437c2a", "#62a53c"];
  const CHAR = ["#0e0b0a", "#1c1512", "#2c211b"];
  const CLOTHR = ["#3a2414", "#5a3a1e", "#7a5430", "#9a7040"];
  const STEELR = ["#2c303d", "#555c70", "#8a93aa", "#c4cce0", "#eef2ff"];
  const BLOOD = ["#3a0808", "#6a0c10", "#a01418"];

  const BONEP = cellPaint(
    0.01,
    (c) =>
      noise(c.at, 0.07, 5) > 0.72
        ? c.pick(["#3d4a2a", "#566a38", "#7a8c52"], 0.3 + 0.5 * c.random(1))
        : c.pick(BONER, 0.5 + 0.3 * c.n.y + 0.3 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const IRONP = cellPaint(
    0.01,
    (c) =>
      noise(c.at, 0.1, 3) > 0.64
        ? c.pick(RUST, c.random(2))
        : c.pick(IRONR, 0.35 + 0.3 * c.n.y + 0.3 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const RUSTP = cellPaint(
    0.012,
    (c) => c.pick(["#2a1208", "#44200c", "#6a3410", "#8a4a1a"], 0.25 + 0.5 * noise(c.at, 0.1, 8) + 0.25 * c.random(1)),
    { dither: true },
  );
  const ROCKP = cellPaint(
    0.02,
    (c) =>
      c.random(5) < 0.04
        ? STONE_R[0]
        : c.pick(STONE_R, 0.28 + 0.3 * c.random(1) + 0.25 * Math.max(c.n.y, 0) + 0.2 * (noise(c.at, 0.15, 2) - 0.5)),
    { dither: true },
  );
  const MOSSP = cellPaint(0.02, (c) => c.pick(MOSS_R, 0.15 + 0.7 * noise(c.at, 0.12, 4) + 0.2 * (c.random(1) - 0.5)), {
    dither: true,
  });
  const POLEP = cellPaint(
    0.012,
    (c) =>
      c.pick(
        WOODB,
        0.3 + 0.45 * noise(new THREE.Vector3(c.at.x * 9, c.at.y * 0.35, c.at.z * 9), 0.05, 2) + 0.15 * c.random(1),
      ),
    { dither: true },
  );
  const CLOTHP = cellPaint(0.01, (c) => {
    const v = (c.at.y - 1.04) / 0.2;
    if (v > 0.45 && c.random(3) < v - 0.3) return c.pick(CHAR, c.random(4));
    return c.pick(CLOTHR, 0.25 + 0.5 * c.random(1) - (c.v % 3 === 0 ? 0.18 : 0));
  });
  const CHARP = cellPaint(0.01, (c) => (c.random(2) < 0.07 ? "#ff7a30" : c.pick(CHAR, c.random(1))));
  const STEEL = cellPaint(
    0.008,
    (c) => c.pick(STEELR, 0.2 + 0.7 * Math.min(Math.max((c.at.y - 0.096) / 0.26, 0), 1) + 0.15 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const BLOODY = cellPaint(
    0.008,
    (c) => {
      const v = Math.min(Math.max((c.at.y - 0.096) / 0.26, 0), 1);
      if (v > 0.3 && c.random(3) < v * 1.1 - 0.1) return c.pick(BLOOD, c.random(4));
      return c.pick(STEELR, 0.2 + 0.7 * v + 0.15 * (c.random(1) - 0.5));
    },
    { dither: true },
  );
  const RUSTYSPIKE = cellPaint(0.008, (c) => c.pick(RUST, c.random(1)), { dither: true });

  // ---------------------------------------------------------------- textures
  const stoneTex = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => pick(STONE_R, 0.36 + 0.34 * R() + 0.1 * Math.sin((x + y) * 0.7), bayer(x, y)));
    let cx = 6 + Math.floor(R() * 18);
    for (let i = 0; i < 16; i++) {
      g.set(cx, 3 + i, "#16161e");
      cx += R() < 0.4 ? -1 : R() < 0.5 ? 1 : 0;
    }
    for (let i = 0; i < 14; i++) g.set(Math.floor(R() * 32), Math.floor(R() * 32), "#9aa0ba");
    for (let i = 0; i < 12; i++) {
      const x = Math.floor(R() * 32);
      const y = Math.floor(R() * 32);
      g.set(x, y, "#4f8a3a");
      g.set(x + 1, y, "#6aae48");
      g.set(x, y + 1, "#2f5a24");
    }
  });

  const woodTex = pixelTexture(40, 60, (g) => {
    g.fill((x, y) => {
      const plank = Math.floor(y / 6);
      const row = y % 6;
      if (row === 0) return "#1e1008";
      let v = 0.35 + 0.1 * (plank % 3) + 0.25 * R();
      if ((x + plank * 13) % 17 < 2) v -= 0.18;
      if (row === 1) v += 0.2;
      return pick(WOOD_R, v, bayer(x, y));
    });
    for (let plank = 0; plank < 10; plank++) {
      g.set(2, plank * 6 + 3, "#c9ced8");
      g.set(2, plank * 6 + 4, "#3a3f4c");
      g.set(37, plank * 6 + 3, "#c9ced8");
      g.set(37, plank * 6 + 4, "#3a3f4c");
      if (R() < 0.4) g.stamp(6 + Math.floor(R() * 26), plank * 6 + 2, ["kk", "kk"], { k: "#241208" });
    }
  });

  const goldTex = pixelTexture(48, 48, (g) => {
    g.fill((x, y) => pick(["#6b3c0a", "#a56a14", "#d49a20", "#f2c832", "#fff0a0"], 0.3 + 0.4 * R(), bayer(x, y)));
    for (let i = 0; i < 70; i++)
      g.stamp(Math.floor(R() * 46), Math.floor(R() * 46), ["wyy.", "yyyd", "dyyd", ".ddd"], {
        w: "#fff0a0",
        y: "#e8b428",
        d: "#8a5410",
      });
  });

  const lockTex = pixelArt(
    ["lyyyyyys", "yyyyyyys", "yyykkyys", "yykkkkys", "yyykkyys", "yyykkyys", "yyykkyys", "yyyyyyys", "yyyyyyys", "ssssssss"],
    { l: "#fff0a0", y: "#e8b828", s: "#8a5410", k: "#120c06" },
  );

  const labelTex = pixelArt(
    [
      "kkkkkkkkkk",
      "krrrrrrrrk",
      "krrwwwwrrk",
      "krwwwwwwrk",
      "krwkwwkwrk",
      "krwkwwkwrk",
      "krrwwwwrrk",
      "krrwkkwrrk",
      "kwrwwwwrwk",
      "krwrrrrwrk",
      "kwrrrrrrwk",
      "kkkkkkkkkk",
    ],
    { r: "#a8201c", w: "#f0e8d0", k: "#1a1210" },
  );

  const runeTex = pixelArt(
    [
      "rrrrrrrrrrrr",
      "r..........r",
      "r.r......r.r",
      "r..r....r..r",
      "r...r..r...r",
      "r....rr....r",
      "r....rr....r",
      "r...r..r...r",
      "r..r....r..r",
      "r.r......r.r",
      "r..........r",
      "rrrrrrrrrrrr",
    ],
    { r: "#e0402a" },
  );

  const layout = skinLayout({ cran: [16, 12, 16], jaw: [12, 5, 12] }, 64);
  const skullTex = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const faces of Object.values(layout.faces))
      for (const rect of Object.values(faces))
        g.fill((x, y, _w, h) => pick(BONER, 0.62 + 0.3 * R() - 0.3 * (y / h), bayer(x, y)), rect);
    const f = layout.faces.cran.pz;
    const eye = ["kkkk", "kkkk", "kkkk", ".kk."];
    g.stamp(f[0] + 2, f[1] + 3, eye, { k: "#14100a" });
    g.stamp(f[0] + 10, f[1] + 3, eye, { k: "#14100a" });
    g.stamp(f[0] + 7, f[1] + 7, ["kk", "kk"], { k: "#14100a" });
    const teeth = { w: "#f2ebcf", k: "#2a2218" };
    g.stamp(f[0], f[1] + 10, ["wkwkwkwkwkwkwkwk", "wkwkwkwkwkwkwkwk"], teeth);
    const j = layout.faces.jaw.pz;
    g.stamp(j[0], j[1], ["wkwkwkwkwkwk", "wkwkwkwkwkwk"], teeth);
    const top = layout.faces.cran.py;
    for (let i = 0; i < 8; i++) g.set(top[0] + 3 + i, top[1] + 4 + Math.floor(i / 3), "#3a3020");
  });

  // ---------------------------------------------------------------- flames
  const flame = (x: number, y: number, z: number, cell: number) => {
    const k = cell / 0.022;
    const layers: Array<[Array<[number, number]>, string, number]> = [
      [
        [[-3, 3], [-3, 3], [-3, 2], [-2, 2], [-2, 1], [-1, 1], [-1, 1], [0, 1]],
        "#ff4a14",
        0.03 * k,
      ],
      [
        [[-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]],
        "#ffa022",
        0.04 * k,
      ],
      [
        [[-1, 1], [-1, 1], [0, 1]],
        "#ffe680",
        0.05 * k,
      ],
    ];
    for (const [spans, color, th] of layers)
      for (const dir of [
        [1, 0, 0],
        [0, 0, 1],
      ])
        glow(
          b.extrude(stepped(spans, cell, { rows: true }), { at: [x, y, z], x: dir, thickness: th, color, bone: root }),
          1.3,
        );
  };
  const embers = (x: number, y: number, z: number, n: number, spread: number) => {
    for (let i = 0; i < n; i++)
      glow(
        b.part(new THREE.BoxGeometry(0.012, 0.012, 0.012), i % 2 ? "#ff8a35" : "#ffd060", {
          bone: root,
          at: [x + (R() - 0.5) * spread, y + R() * spread * 1.4, z + (R() - 0.5) * spread],
          rotation: [0, R() * 90, 0],
        }),
        1.2,
      );
  };

  // ---------------------------------------------------------------- floor
  b.part(new THREE.BoxGeometry(2.44, 0.04, 1.9), "#14141c", { bone: root, at: [0, 0.02, 0] });
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++)
      tbox(P0, [0.46, 0.06, 0.45], stoneTex, 0.02, [-0.96 + i * 0.48, 0.03, -0.705 + j * 0.47], [1, 1]);

  // moss and rubble
  for (const [mx, mz, mw, md, my] of [
    [-0.95, -0.48, 0.3, 0.2, 12],
    [1.0, -0.4, 0.26, 0.2, -20],
    [0.1, -0.85, 0.34, 0.14, 5],
    [-0.4, 0.82, 0.22, 0.16, 30],
    [0.95, 0.85, 0.2, 0.14, -10],
  ])
    box(place(mx, mz, my), [mw, 0.008, md], MOSSP, [0, F + 0.003, 0]);
  for (let i = 0; i < 9; i++) {
    const s = 0.03 + R() * 0.04;
    box(
      place(-1.1 + R() * 2.2, -0.88 + R() * 1.76, R() * 90),
      [s, s * 0.7, s * 1.2],
      ROCKP,
      [0, F + s * 0.3, 0],
    );
  }

  // ---------------------------------------------------------------- chest
  const pc = place(-0.42, -0.52, 10);
  const yb = F;
  const th = 10 * DEG;
  const hinge = b.joint("lidHinge", {
    parent: root,
    at: pc.p(0, yb + 0.26, -0.165),
    dir: [Math.sin(th), 0, Math.cos(th)],
    role: "hinge",
  });
  tbox(pc, [0.5, 0.26, 0.32], woodTex, 0.016, [0, yb + 0.13, 0]);
  box(pc, [0.54, 0.03, 0.36], IRONP, [0, yb + 0.015, 0]);
  box(pc, [0.46, 0.008, 0.28], "#150d06", [0, yb + 0.263, 0]);
  tbox(pc, [0.4, 0.04, 0.2], goldTex, 0.01, [0, yb + 0.28, 0.03], [1, 1]);
  tbox(pc, [0.3, 0.035, 0.14], goldTex, 0.01, [0, yb + 0.3175, 0.03], [1, 1]);
  tbox(pc, [0.18, 0.03, 0.09], goldTex, 0.01, [0.02, yb + 0.35, 0.03], [1, 1]);
  for (const sx of [-1, 1]) {
    box(pc, [0.06, 0.262, 0.012], IRONP, [sx * 0.17, yb + 0.131, 0.166]);
    box(pc, [0.06, 0.262, 0.012], IRONP, [sx * 0.17, yb + 0.131, -0.166]);
    for (const sz of [-1, 1]) box(pc, [0.012, 0.262, 0.062], IRONP, [sx * 0.254, yb + 0.131, sz * 0.13]);
    box(pc, [0.024, 0.02, 0.1], IRONP, [sx * 0.268, yb + 0.19, 0]);
    for (const sz of [-1, 1]) box(pc, [0.02, 0.032, 0.02], IRONP, [sx * 0.262, yb + 0.185, sz * 0.05]);
  }
  b.part(new THREE.BoxGeometry(0.08, 0.1, 0.014), "#ffffff", {
    bone: root,
    at: pc.p(0, yb + 0.2, 0.172),
    rotation: pc.rot,
    texture: lockTex,
  });
  // rivets
  const rivets: THREE.BufferGeometry[] = [];
  for (const sx of [-0.17, 0.17])
    for (const dx of [-0.02, 0.02])
      for (const y of [0.05, 0.13, 0.21])
        rivets.push(world(pc, new THREE.BoxGeometry(0.014, 0.014, 0.01), [sx + dx, yb + y, 0.174]));
  merged(rivets, "#aab0c0");
  // lid (rides the hinge)
  const lid = [
    { d: 0.34, h: 0.05 },
    { d: 0.32, h: 0.04 },
    { d: 0.26, h: 0.04 },
    { d: 0.18, h: 0.035 },
  ];
  let ly = yb + 0.26;
  for (const { d, h } of lid) {
    tbox(pc, [0.52, h, d], woodTex, 0.016, [0, ly + h / 2, 0], [1, 6], hinge);
    for (const sx of [-0.17, 0.17]) box(pc, [0.06, h + 0.006, d + 0.012], IRONP, [sx, ly + h / 2, 0], hinge);
    ly += h;
  }
  box(pc, [0.5, 0.022, 0.022], IRONP, [0, yb + 0.262, -0.17], hinge);
  box(pc, [0.05, 0.08, 0.012], IRONP, [0, yb + 0.285, 0.178], hinge);
  box(pc, [0.014, 0.014, 0.014], "#e8b828", [0, yb + 0.262, 0.186], hinge);
  // coins and gems
  const coins: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const heap = i < 9;
    const lx = heap ? (R() - 0.5) * 0.3 : (R() - 0.5) * 0.5;
    const lz = heap ? 0.03 + (R() - 0.5) * 0.12 : 0.22 + R() * 0.2;
    const ly2 = heap ? yb + 0.355 + R() * 0.02 : F + 0.004;
    coins.push(
      world(pc, new THREE.CylinderGeometry(0.022, 0.022, 0.007, 8), [lx, ly2, lz], heap ? (R() - 0.5) * 50 : 0, R() * 90, heap ? (R() - 0.5) * 50 : 0),
    );
  }
  merged(coins, "#f2c230");
  glow(b.part(new THREE.OctahedronGeometry(0.026, 0), "#e0243a", { bone: root, at: pc.p(-0.1, yb + 0.325, 0.08), rotation: [0, 20, 0] }), 1);
  glow(b.part(new THREE.OctahedronGeometry(0.022, 0), "#2fa8ff", { bone: root, at: pc.p(0.1, yb + 0.37, 0.0), rotation: [0, 50, 0] }), 1);
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), "#38e07a", { bone: root, at: pc.p(0.02, yb + 0.395, 0.04), rotation: [0, 0, 0] }), 1);
  glow(b.part(new THREE.OctahedronGeometry(0.018, 0), "#e0243a", { bone: root, at: pc.p(0.25, F + 0.016, 0.34), rotation: [0, 30, 0] }), 1);

  // ---------------------------------------------------------------- torches
  const torch = (x: number, z: number) => {
    const pl = place(x, z, 0);
    box(pl, [0.28, 0.1, 0.28], ROCKP, [0, F + 0.05, 0]);
    box(pl, [0.2, 0.1, 0.2], ROCKP, [0, F + 0.15, 0]);
    box(pl, [0.14, 0.02, 0.14], ROCKP, [0, F + 0.21, 0]);
    box(pl, [0.07, 0.8, 0.07], POLEP, [0, 0.64, 0]);
    box(pl, [0.095, 0.03, 0.095], IRONP, [0, 0.32, 0]);
    box(pl, [0.095, 0.03, 0.095], IRONP, [0, 0.62, 0]);
    box(pl, [0.095, 0.03, 0.095], IRONP, [0, 0.99, 0]);
    box(pl, [0.1, 0.15, 0.1], CLOTHP, [0, 1.1, 0]);
    box(pl, [0.13, 0.05, 0.13], CLOTHP, [0, 1.2, 0]);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.rod([x + sx * 0.05, 1.03, z + sz * 0.05], [x + sx * 0.078, 1.3, z + sz * 0.078], 0.008, {
          color: IRONP,
          bone: root,
          sides: 4,
        });
    box(pl, [0.18, 0.016, 0.016], IRONP, [0, 1.3, 0.078]);
    box(pl, [0.18, 0.016, 0.016], IRONP, [0, 1.3, -0.078]);
    box(pl, [0.016, 0.016, 0.18], IRONP, [0.078, 1.3, 0]);
    box(pl, [0.016, 0.016, 0.18], IRONP, [-0.078, 1.3, 0]);
    flame(x, 1.26, z, 0.022);
    embers(x, 1.3, z, 5, 0.16);
    embers(x, F + 0.22, z, 2, 0.2);
  };
  torch(-1.02, -0.75);
  torch(1.06, -0.72);

  // fallen torch
  const pf = place(0.62, 0.5, 80);
  tbox(pf, [0.07, 0.07, 0.7], woodTex, 0.016, [0, F + 0.035, 0], [1, 6]);
  box(pf, [0.095, 0.095, 0.03], IRONP, [0, F + 0.04, 0.2]);
  box(pf, [0.1, 0.1, 0.15], CHARP, [0, F + 0.05, 0.4]);
  box(pf, [0.125, 0.125, 0.04], CHARP, [0, F + 0.06, 0.49]);
  flame(pf.p(0, 0, 0.5)[0], F + 0.12, pf.p(0, 0, 0.5)[2], 0.011);
  embers(pf.p(0, 0, 0.5)[0], F + 0.14, pf.p(0, 0, 0.5)[2], 4, 0.1);

  // ---------------------------------------------------------------- barrels
  const barrel = (
    cx: number,
    cz: number,
    o: { open?: boolean; lying?: boolean; yaw?: number; label?: boolean; spigot?: boolean },
  ) => {
    const H = 0.62;
    const Rr = (y: number) => 0.19 + 0.045 * Math.sin((Math.PI * y) / H);
    const lying = !!o.lying;
    const yaw = o.yaw ?? 0;
    const ax = lying ? new THREE.Vector3(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)) : new THREE.Vector3(0, 1, 0);
    const cy = lying ? F + 0.22 : F + H / 2;
    const centre = new THREE.Vector3(cx, cy, cz);
    const start = centre.clone().addScaledVector(ax, -H / 2).toArray();
    const up = new THREE.Vector3(0, 1, 0);
    const ref1 = lying ? new THREE.Vector3().crossVectors(ax, up).normalize() : new THREE.Vector3(0, 0, 1);
    const ref2 = lying ? up : new THREE.Vector3(1, 0, 0);
    const wood = cellPaint(0.015, (c) => {
      const rel = c.at.clone().sub(centre);
      if (Math.abs(c.n.dot(ax)) > 0.8) {
        const coord = rel.dot(lying ? up : ref2) + 1;
        if (coord % 0.075 < 0.016) return WOODB[0];
        return c.pick(WOODB, 0.3 + 0.1 * (Math.floor(coord / 0.075) % 3) + 0.3 * c.random(1));
      }
      const f = Math.atan2(rel.dot(ref2), rel.dot(ref1)) / (Math.PI / 4) + 8;
      const stave = Math.floor(f);
      const fr = f - stave;
      if (fr < 0.1 || fr > 0.9) return WOODB[0];
      let v = 0.35 + 0.1 * (stave % 3) + 0.25 * c.random(1);
      if (fr < 0.28) v += 0.15;
      if (c.random(4) < 0.08) v -= 0.2;
      return c.pick(WOODB, v);
    });
    const outer: number[][] = [];
    for (let i = 0; i <= 6; i++) {
      const y = (H * i) / 6;
      outer.push([Rr(y), y]);
    }
    let profile: number[][];
    if (o.open) {
      profile = [[0, 0], ...outer, [Rr(H) - 0.03, H]];
      for (const y of [(H * 5) / 6, (H * 4) / 6, (H * 3) / 6, (H * 2) / 6, H / 6, 0.05]) profile.push([Rr(y) - 0.03, y]);
      profile.push([0, 0.05]);
    } else profile = [[0, 0], ...outer, [0, H]];
    const body = b.lathe(profile as Array<[number, number]>, {
      at: start,
      axis: ax.toArray(),
      segments: 8,
      color: wood,
      bone: root,
    });
    for (const yc of [0.07, 0.17, H - 0.17, H - 0.07]) {
      const r = Rr(yc) - 0.004;
      b.lathe(
        [
          [r, yc - 0.02],
          [r + 0.014, yc - 0.02],
          [r + 0.014, yc + 0.02],
          [r, yc + 0.02],
        ],
        { at: start, axis: ax.toArray(), segments: 8, color: IRONP, bone: root },
      );
    }
    if (o.open) {
      glow(
        b.part(new THREE.CylinderGeometry(Rr(H) - 0.05, Rr(H) - 0.05, 0.01, 8), "#5fd040", {
          bone: root,
          at: [cx, F + H - 0.07, cz],
        }),
        0.8,
      );
      for (let i = 0; i < 4; i++)
        glow(
          b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), "#a0ff70", {
            bone: root,
            at: [cx + (R() - 0.5) * 0.22, F + H - 0.06, cz + (R() - 0.5) * 0.22],
          }),
          1,
        );
    }
    if (o.label)
      b.decal(body, labelTex, {
        at: [cx, F + 0.3, cz + 0.24],
        dir: [0, 0, 1],
        size: [0.13, 0.15],
        segments: 8,
        lift: 0.004,
      });
    if (o.spigot) {
      box(P0, [0.03, 0.03, 0.08], IRONP, [cx, F + 0.15, cz + 0.22]);
      box(P0, [0.05, 0.014, 0.014], "#c8902a", [cx, F + 0.175, cz + 0.255]);
    }
    return body;
  };
  barrel(0.25, -0.68, { label: true, spigot: true });
  barrel(0.74, -0.52, { open: true, yaw: 20 });
  barrel(0.74, -0.02, { lying: true, yaw: 90 });
  // chocks for the lying barrel
  for (const sz of [-1, 1]) box(place(0.74 + sz * 0.22, -0.02, 0), [0.07, 0.07, 0.3], WOODB[2], [0, F + 0.035, 0]);
  box(place(0.74, -0.02, 0), [0.62, 0.012, 0.01], "#000000", [0, F + 0.006, 0.3]).mesh.visible = false;
  // slime puddle
  glow(b.part(new THREE.BoxGeometry(0.28, 0.004, 0.18), "#4ab834", { bone: root, at: [0.8, F + 0.002, -0.2], rotation: [0, 15, 0] }), 0.6);

  // ---------------------------------------------------------------- bones
  const boneRod = (a: number[], e: number[], t: number) => {
    const av = new THREE.Vector3(a[0], a[1], a[2]);
    const ev = new THREE.Vector3(e[0], e[1], e[2]);
    const dir = ev.clone().sub(av);
    const L = dir.length();
    const dn = dir.clone().divideScalar(L);
    const perp = new THREE.Vector3().crossVectors(dn, new THREE.Vector3(0, 1, 0));
    if (perp.lengthSq() < 1e-6) perp.set(1, 0, 0);
    perp.normalize();
    b.part(new THREE.BoxGeometry(t, L, t), BONEP, {
      bone: root,
      at: av.clone().add(ev).multiplyScalar(0.5).toArray(),
      dir: dir.toArray(),
    });
    for (const [end, inward] of [
      [av, 1],
      [ev, -1],
    ] as const)
      for (const s of [-1, 1])
        b.part(new THREE.BoxGeometry(t * 1.2, t * 1.6, t * 1.2), BONEP, {
          bone: root,
          at: end.clone().addScaledVector(dn, inward * t * 0.4).addScaledVector(perp, s * t * 0.6).toArray(),
          dir: dir.toArray(),
        });
  };

  // skull
  const ps = place(-0.92, 0.05, 25);
  b.part(skinBox(skullTex, layout.faces.cran, 0.0105), "#ffffff", {
    bone: root,
    at: ps.p(0, 0.1655, 0),
    rotation: ps.rot,
    texture: skullTex,
  });
  b.part(skinBox(skullTex, layout.faces.jaw, 0.0105), "#ffffff", {
    bone: root,
    at: ps.p(0, 0.086, 0.02),
    rotation: ps.rot,
    texture: skullTex,
  });
  for (const sx of [-1, 1]) box(ps, [0.014, 0.03, 0.04], BONEP, [sx * 0.082, 0.14, 0.05]);

  // rib cage with spine
  const pr = place(-0.86, 0.5, 20);
  for (let i = 0; i < 12; i++) {
    const x = -0.2 + i * 0.036;
    box(pr, [0.03, 0.022, 0.034], BONEP, [x, F + 0.012, 0]);
    box(pr, [0.01, 0.016, 0.012], BONEP, [x, F + 0.03, 0]);
  }
  for (let i = 0; i < 7; i++) {
    const sx = -0.17 + i * 0.05;
    const k = 1 - (0.35 * Math.abs(i - 2.5)) / 3.5;
    for (const s of [-1, 1]) {
      const pts = [
        pr.p(sx, F + 0.02, s * 0.02),
        pr.p(sx + 0.01, F + 0.015 + 0.045 * k, s * 0.08 * k),
        pr.p(sx + 0.03, F + 0.015 + 0.035 * k, s * 0.14 * k),
        pr.p(sx + 0.06, F + 0.014, s * 0.17 * k),
      ];
      b.sweep(polyline(pts), [0.013, 0.008], { color: BONEP, sides: 4, bone: root });
    }
  }

  // femurs and loose bones
  const pa = place(-0.95, 0.82, 0);
  boneRod(pa.p(-0.14, F + 0.02, -0.06), pa.p(0.14, F + 0.02, 0.07), 0.035);
  boneRod(pa.p(-0.12, F + 0.04, 0.09), pa.p(0.12, F + 0.04, -0.05), 0.035);
  boneRod(place(0.96, 0.72, 0).p(-0.14, F + 0.02, -0.1), place(0.96, 0.72, 0).p(0.12, F + 0.02, 0.1), 0.034);
  boneRod(place(-0.62, 0.9, 0).p(-0.06, F + 0.012, 0), place(-0.62, 0.9, 0).p(0.08, F + 0.012, 0.03), 0.02);
  boneRod(place(-0.5, 0.95, 0).p(-0.05, F + 0.012, 0.02), place(-0.5, 0.95, 0).p(0.07, F + 0.012, -0.02), 0.018);
  const loose: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++)
    loose.push(
      new THREE.BoxGeometry(0.03, 0.022, 0.034).rotateY(R() * Math.PI).translate(-1.05 + R() * 0.3, F + 0.011, 0.2 + R() * 0.6),
    );
  merged(loose, BONEP);

  // shackle and chain
  const pk = place(0.78, 0.86, -8);
  const links: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const flat = i % 2 === 0;
    const g = new THREE.TorusGeometry(0.03, 0.008, 4, 6);
    links.push(world(pk, g, [-0.22 + i * 0.048, flat ? F + 0.01 : F + 0.03, 0], flat ? 90 : 0));
  }
  merged(links, IRONP);
  b.part(new THREE.TorusGeometry(0.055, 0.016, 4, 8), IRONP, {
    bone: root,
    at: pk.p(-0.32, F + 0.016, 0),
    rotation: [90, pk.yaw, 0],
  });
  box(pk, [0.04, 0.03, 0.03], IRONP, [-0.265, F + 0.016, 0]);

  // ---------------------------------------------------------------- spike trap
  const pt = place(-0.15, 0.28, 0);
  box(pt, [0.92, 0.05, 0.12], ROCKP, [0, F + 0.02, 0.4]);
  box(pt, [0.92, 0.05, 0.12], ROCKP, [0, F + 0.02, -0.4]);
  box(pt, [0.12, 0.05, 0.68], ROCKP, [0.4, F + 0.02, 0]);
  box(pt, [0.12, 0.05, 0.68], ROCKP, [-0.4, F + 0.02, 0]);
  // yellow hazard studs on the frame
  const studs: THREE.BufferGeometry[] = [];
  for (let i = -3; i <= 3; i++) studs.push(world(pt, new THREE.BoxGeometry(0.03, 0.008, 0.03), [i * 0.12, F + 0.047, 0.4]));
  merged(studs, "#d8a020");
  box(pt, [0.68, 0.02, 0.68], RUSTP, [0, F + 0.01, 0]);
  const holes: THREE.BufferGeometry[] = [];
  const collars: THREE.BufferGeometry[] = [];
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++) {
      holes.push(world(pt, new THREE.BoxGeometry(0.06, 0.004, 0.06), [i * 0.125, F + 0.0215, j * 0.125]));
      collars.push(world(pt, new THREE.BoxGeometry(0.07, 0.016, 0.07), [i * 0.125, F + 0.028, j * 0.125]));
    }
  merged(holes, "#08080c");
  merged(collars, "#3a3d4c");
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++) {
      let h = 0.22 + 0.06 * R();
      let paintFor: Paint = STEEL;
      if ((i + j * 2 + 10) % 4 === 0) paintFor = BLOODY;
      if (i === -2 && j === 2) {
        h = 0.07;
        paintFor = RUSTYSPIKE;
      }
      if (i === 2 && j === -1) h = 0.15;
      b.part(new THREE.ConeGeometry(0.03, h, 4, 1), paintFor, {
        bone: root,
        at: pt.p(i * 0.125, F + 0.036 + h / 2, j * 0.125),
        rotation: [0, 45, 0],
      });
    }
  // pressure rune in front of the trap
  glow(
    b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
      bone: root,
      at: [-0.15, F + 0.003, 0.82],
      rotation: [-90, 0, 0],
      texture: runeTex,
    }),
    0.7,
  );

  return b.root;
}
