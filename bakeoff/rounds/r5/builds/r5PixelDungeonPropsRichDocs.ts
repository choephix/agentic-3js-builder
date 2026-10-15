import * as THREE from "three";
import { createBuilder, frame, catmull, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon vignette on a mossy flagstone slab: an open treasure chest with a hinged lid and gold hoard, two lit standing torches with pixel flames and a fallen burnt torch, three iron-hooped barrels (sealed, open with green brew, lying), a skeleton pile with ribcage and skulls, and a hazard-striped spike trap with a skull on a spike and a warning sign.",
};

type V3 = [number, number, number];

const PX = 0.04; // one "pixel" of the pixel-art look, in meters
const DEG = Math.PI / 180;
const FY = 0.08; // floor slab top

const hash = (a: number, b: number, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const mod = (a: number, n: number) => ((a % n) + n) % n;

// quantised pixel coordinates on the face a point lies on: [u, v, face]
function pc(p: { x: number; y: number; z: number }, n: { x: number; y: number; z: number }): [number, number, number] {
  const ax = Math.abs(n.x),
    ay = Math.abs(n.y),
    az = Math.abs(n.z);
  if (ay >= ax && ay >= az) return [Math.floor((p.x + 20) / PX), Math.floor((p.z + 20) / PX), n.y > 0 ? 0 : 1];
  if (ax >= az) return [Math.floor((p.z + 20) / PX), Math.floor((p.y + 20) / PX), 2];
  return [Math.floor((p.x + 20) / PX), Math.floor((p.y + 20) / PX), 3];
}

// local (yaw-rotated) offset to model space
const loc = (o: V3, yawDeg: number, l: V3): V3 => {
  const t = yawDeg * DEG;
  const c = Math.cos(t),
    s = Math.sin(t);
  return [o[0] + l[0] * c + l[2] * s, o[1] + l[1], o[2] - l[0] * s + l[2] * c];
};

function pixelArt(rows: string[], legend: Record<string, string>, W: number) {
  const H = rows.length;
  let r = "";
  rows.forEach((row, y) => {
    const rr = row.padEnd(W, ".").slice(0, W);
    for (let x = 0; x < W; x++) {
      const c = legend[rr[x]];
      if (c) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
    }
  });
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">${r}</svg>`,
    { size: Math.max(W, H), pixelated: true },
  );
}

// ---------- paints (all quantised to the pixel grid) ----------
const woodPaint = (cols: string[], seam: string, rowH = 3, jointW = 14) =>
  paint((p, n) => {
    const [u, v] = pc(p, n);
    const row = Math.floor(v / rowH);
    const off = Math.floor(hash(row, 7, 1) * jointW);
    if (mod(v, rowH) === 0) return seam;
    const uu = u + off;
    if (mod(uu, jointW) === 0) return seam;
    let i = Math.floor(hash(row, Math.floor(uu / jointW), 5) * (cols.length - 1));
    const h = hash(u, v, 3);
    if (h > 0.9) i = Math.min(i + 1, cols.length - 1);
    else if (h < 0.07 && i > 0) i -= 1;
    return cols[i];
  });

const ironPaint = paint((p, n) => {
  const [u, v] = pc(p, n);
  const h = hash(u, v, 11);
  if (h > 0.92) return "#a9b3c4";
  if (h < 0.14) return "#474e5f";
  return "#707a8e";
});

const goldPaint = paint((p, n) => {
  const [u, v] = pc(p, n);
  const h = hash(u, v, 13);
  if (h > 0.93) return "#fff3b0";
  if (h > 0.6) return "#f4c52f";
  if (h > 0.2) return "#dca41c";
  return "#b87d12";
});

const boneP = paint((p, n) => {
  const [u, v] = pc(p, n);
  const h = hash(u, v, 17);
  if (h > 0.9) return "#fbf3da";
  if (h < 0.14) return "#b8a883";
  return "#e4d7b5";
});

const TORCH_SPOTS: [number, number][] = [
  [-1.55, -1.05],
  [1.6, -1.1],
];

const COOL = ["#454a5c", "#505568", "#5b6070", "#666b7c"];
const WARM = ["#6f5540", "#7d6048", "#8a6a52", "#947457"];
const HOT = ["#9a7048", "#a67a50", "#b38457", "#c28f5e"];

const floorPaint = paint((p, n) => {
  const [u, v, f] = pc(p, n);
  if (f !== 0) return hash(u, v, 1) > 0.85 ? "#4a5066" : "#3b3f50";
  let glow = 0;
  for (const [tx, tz] of TORCH_SPOTS) {
    const d = Math.hypot(p.x - tx, p.z - tz);
    if (d < 0.45) glow = Math.max(glow, 2);
    else if (d < 0.85) glow = Math.max(glow, 1);
  }
  const row = Math.floor(v / 12);
  const uu = u + mod(row, 2) * 6;
  const tile = Math.floor(uu / 12);
  if (mod(v, 12) === 0 || mod(uu, 12) === 0) return glow === 2 ? "#4a3020" : glow === 1 ? "#3c2d28" : "#2b2e3c";
  const pal = glow === 2 ? HOT : glow === 1 ? WARM : COOL;
  let i = Math.floor(hash(tile, row, 4) * (pal.length - 1));
  const h = hash(u, v, 9);
  if (h > 0.93) i = Math.min(i + 1, pal.length - 1);
  else if (h < 0.06 && i > 0) i -= 1;
  if (glow === 0 && hash(Math.floor(u / 5), Math.floor(v / 5), 2) > 0.88 && hash(u, v, 6) > 0.35)
    return hash(u, v, 8) > 0.7 ? "#5f7f45" : "#456436";
  return pal[i];
});

const WOOD = ["#b07a3e", "#9c6a34", "#8a5a2b", "#744a22"];
const POLE = ["#85592f", "#6f4826", "#5b3a1e"];
const STONE = ["#7b8094", "#6a6f82", "#5d6275", "#505568"];

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const blk = (
    w: number,
    h: number,
    d: number,
    color: any,
    at: V3,
    opt: { bone?: any; rot?: V3 } = {},
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      bone: opt.bone ?? root,
      at,
      ...(opt.rot ? { rotation: opt.rot } : {}),
    });

  const wood = woodPaint(WOOD, "#3f2410");
  const poleWood = woodPaint(POLE, "#35210f", 200, 999);
  const stoneP = woodPaint(STONE, "#2f3342", 4, 8);

  // ================= FLOOR =================
  blk(3.6, FY, 2.6, floorPaint, [0, FY / 2, 0]);

  // rubble
  const rubble: [number, number][] = [
    [-1.7, 1.15],
    [1.72, 1.2],
    [-1.72, -0.2],
    [1.7, 0.1],
    [0.2, 1.22],
    [-0.5, -1.22],
    [1.0, -1.24],
  ];
  const greys = ["#5b6070", "#4a4f60", "#6b7082"];
  rubble.forEach(([x, z], i) => {
    const s = 0.07 + hash(i, 3, 3) * 0.08;
    blk(s * 1.3, s, s, greys[i % 3], [x, FY + s / 2, z], { rot: [0, hash(i, 1, 4) * 90, 0] });
  });

  // ================= CHEST =================
  {
    const cx = -0.7,
      cz = -0.55;
    const W = 0.9,
      D = 0.56,
      H = 0.46,
      wall = 0.05;
    blk(W, H, wall, wood, [cx, FY + H / 2, cz + D / 2 - wall / 2]);
    blk(W, H, wall, wood, [cx, FY + H / 2, cz - D / 2 + wall / 2]);
    for (const s of [1, -1]) blk(wall, H, D - 2 * wall, wood, [cx + s * (W / 2 - wall / 2), FY + H / 2, cz]);
    blk(W - 2 * wall, 0.3, D - 2 * wall, "#2b1d12", [cx, FY + 0.15, cz]);
    // iron work
    blk(W + 0.02, 0.06, D + 0.02, ironPaint, [cx, FY + 0.03, cz]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) blk(0.07, H + 0.02, 0.07, ironPaint, [cx + sx * 0.44, FY + H / 2 + 0.01, cz + sz * 0.275]);
    for (const sx of [0.28, -0.28])
      for (const sz of [1, -1]) blk(0.08, H, 0.03, ironPaint, [cx + sx, FY + H / 2, cz + sz * (D / 2 + 0.01)]);
    // lock catch on the body
    blk(0.1, 0.09, 0.03, "#e0b030", [cx, FY + 0.36, cz + D / 2 + 0.014]);
    blk(0.025, 0.04, 0.012, "#2b1d12", [cx, FY + 0.36, cz + D / 2 + 0.032]);

    // gold hoard
    blk(0.7, 0.05, 0.4, goldPaint, [cx, FY + 0.325, cz]);
    blk(0.54, 0.05, 0.3, goldPaint, [cx, FY + 0.375, cz]);
    blk(0.34, 0.04, 0.18, goldPaint, [cx, FY + 0.42, cz]);
    const lv = [0.35, 0.4, 0.44];
    const hw = [0.34, 0.26, 0.15];
    const hd = [0.17, 0.12, 0.07];
    for (let i = 0; i < 16; i++) {
      const l = i % 3;
      const x = cx + (hash(i, 1, 21) * 2 - 1) * hw[l];
      const z = cz + (hash(i, 2, 21) * 2 - 1) * hd[l];
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 8), goldPaint, {
        bone: root,
        at: [x, FY + lv[l] + 0.008, z],
        rotation: [(hash(i, 3, 21) - 0.5) * 30, hash(i, 4, 21) * 360, (hash(i, 5, 21) - 0.5) * 30],
        flat: true,
      });
    }
    // gems
    blk(0.055, 0.055, 0.055, "#d63a4b", [cx - 0.12, FY + 0.455, cz + 0.03], { rot: [0, 30, 0] });
    blk(0.05, 0.05, 0.05, "#3a8fe0", [cx + 0.22, FY + 0.43, cz - 0.08], { rot: [20, 50, 0] });
    blk(0.05, 0.05, 0.05, "#3bc46b", [cx + 0.02, FY + 0.47, cz - 0.04], { rot: [0, 15, 25] });
    // spilled coins on the floor
    for (const [dx, dz] of [
      [0.2, 0.45],
      [-0.25, 0.55],
      [0.05, 0.62],
    ])
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 8), goldPaint, {
        bone: root,
        at: [cx + dx, FY + 0.008, cz + dz],
        flat: true,
      });

    // lid on a hinge
    const H0: V3 = [cx, FY + H, cz - D / 2];
    const hinge = b.joint("lidHinge", { parent: root, at: H0, dir: [0, 0, 1], role: "hinge" });
    const LD = 0.58;
    const lid: [number, number][] = [
      [0, 0],
      [LD, 0],
      [LD, 0.16],
      [LD - 0.06, 0.24],
      [LD - 0.17, 0.29],
      [0.17, 0.29],
      [0.06, 0.24],
      [0, 0.16],
    ];
    b.extrude(lid, { at: H0, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.92, color: wood, bone: hinge });
    const strap: [number, number][] = [
      [-0.02, -0.01],
      [LD + 0.02, -0.01],
      [LD + 0.02, 0.165],
      [LD - 0.04, 0.255],
      [LD - 0.16, 0.31],
      [0.16, 0.31],
      [0.04, 0.255],
      [-0.02, 0.165],
    ];
    for (const sx of [0.28, -0.28])
      b.extrude(strap, { at: [cx + sx, H0[1], H0[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, color: ironPaint, bone: hinge });
    blk(0.12, 0.15, 0.03, "#e0b030", [cx, H0[1] + 0.075, H0[2] + LD + 0.02], { bone: hinge });
    blk(0.03, 0.06, 0.012, "#2b1d12", [cx, H0[1] + 0.07, H0[2] + LD + 0.04], { bone: hinge });
    // hinge knuckles
    for (const sx of [0.28, -0.28]) blk(0.1, 0.06, 0.05, ironPaint, [cx + sx, H0[1] + 0.01, H0[2] - 0.03], { bone: hinge });

    // pose the lid open
    b.pose(hinge, { axis: [1, 0, 0], deg: -100 });
  }

  // ================= BARRELS =================
  const IRONP = ironPaint;
  const BARREL = ["#a56b34", "#91592a", "#7e4b22", "#6a3f1c"];
  const barrelPaint = (axis: THREE.Vector3, center: THREE.Vector3, open: boolean) =>
    paint((p, n, s) => {
      const h = s[0];
      const c = p.clone().sub(center);
      const along = c.dot(axis);
      const cr = c.clone().addScaledVector(axis, -along);
      const capDot = n.dot(axis);
      if (capDot > 0.75) {
        if (h < 0.01) return "#4a2e18";
        const u = Math.floor((p.x + 20) / PX);
        const v = Math.floor((p.y + p.z + 20) / PX);
        if (open && h < 0.85) {
          const q = hash(u, v, 8);
          return q > 0.85 ? "#8af5a0" : q < 0.3 ? "#38b552" : "#4fd66a";
        }
        if (mod(u, 3) === 0) return "#3b2412";
        const col = Math.floor(u / 3);
        let i = Math.floor(hash(col, 2, 2) * 3);
        if (hash(u, v, 5) > 0.9) i = Math.min(i + 1, 3);
        return BARREL[i];
      }
      if (cr.dot(n) < 0) return "#3b2412";
      const deg = mod(s[1], 360);
      const st = Math.floor(deg / 45);
      const col = Math.floor((mod(deg, 45) / 45) * 6);
      const row = Math.floor(h / PX);
      if (col === 0) return "#3b2412";
      let i = (st * 3 + Math.floor(hash(st, 3, 3) * 2)) % 3;
      if (hash(st * 7 + col, row, 5) > 0.9) i = Math.min(i + 1, 3);
      else if (hash(st * 7 + col, row, 6) < 0.06 && i > 0) i -= 1;
      return BARREL[i];
    });

  const prof: [number, number][] = [
    [0.24, 0],
    [0.3, 0.2],
    [0.33, 0.45],
    [0.3, 0.7],
    [0.24, 0.9],
  ];
  const rAt = (y: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[i + 1];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.24;
  };

  const barrel = (x: number, z: number, kind: "closed" | "open" | "lying", yaw = 0) => {
    const lying = kind === "lying";
    const axisArr: V3 = lying ? [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)] : [0, 1, 0];
    const axis = new THREE.Vector3(...axisArr);
    const center = new THREE.Vector3(x, lying ? FY + 0.31 : FY + 0.45, z);
    const base = center.clone().addScaledVector(axis, -0.45);
    const baseArr: V3 = [base.x, base.y, base.z];
    const open = kind === "open";
    const outline: [number, number][] = open
      ? [[0, 0], [0.24, 0], [0.3, 0.2], [0.33, 0.45], [0.3, 0.7], [0.24, 0.9], [0.21, 0.9], [0.21, 0.72], [0, 0.72]]
      : [[0, 0], [0.24, 0], [0.3, 0.2], [0.33, 0.45], [0.3, 0.7], [0.24, 0.9], [0.21, 0.9], [0.21, 0.86], [0, 0.86]];
    b.lathe(outline, {
      at: baseArr,
      axis: axisArr,
      segments: 8,
      color: barrelPaint(axis, center, open),
      bone: root,
    });
    for (const [y0, y1] of [
      [0.08, 0.15],
      [0.26, 0.32],
      [0.58, 0.64],
      [0.76, 0.82],
    ]) {
      const ri = rAt(y0) - 0.03;
      const ro = Math.max(rAt(y0), rAt(y1)) + 0.02;
      b.lathe(
        [
          [ri, y0],
          [ro, y0],
          [ro, y1],
          [ri, y1],
        ],
        { at: baseArr, axis: axisArr, segments: 8, color: IRONP, bone: root },
      );
    }
  };
  barrel(0.85, -0.85, "closed");
  barrel(1.25, -0.3, "open");
  barrel(0.1, -0.5, "lying", 14);

  // candle on barrel A
  {
    const cxp = 0.93,
      czp = -0.8,
      ty = FY + 0.86;
    blk(0.06, 0.11, 0.06, "#efe6c8", [cxp, ty + 0.055, czp]);
    blk(0.016, 0.05, 0.016, "#efe6c8", [cxp + 0.036, ty + 0.085, czp]);
    blk(0.012, 0.03, 0.012, "#2a1c14", [cxp, ty + 0.125, czp]);
    blk(0.03, 0.045, 0.03, "#ffb02e", [cxp, ty + 0.16, czp]);
    blk(0.014, 0.025, 0.014, "#fff0a0", [cxp, ty + 0.165, czp]);
  }

  // ================= TORCHES =================
  const flameTex = pixelArt(
    [
      "......r.....",
      "......rr....",
      ".....rro....",
      ".....roor...",
      "....rooyor..",
      "....royyoor.",
      "...rooyyyor.",
      "...rooyywor.",
      "..rooyyywyor",
      "..rooyywwyor",
      "..rooyywwyor",
      "..rooyywwyor",
      "..rooyyywyor",
      "...rooyyyor.",
      "....rooooor.",
      ".....rrrrr..",
    ],
    { r: "#e0401c", o: "#ff8a1f", y: "#ffc933", w: "#fff2a8" },
    12,
  );

  const standingTorch = (x: number, z: number) => {
    blk(0.3, 0.12, 0.3, stoneP, [x, FY + 0.06, z]);
    blk(0.07, 0.95, 0.07, poleWood, [x, FY + 0.12 + 0.475, z]);
    for (const y of [0.25, 0.6, 0.95]) blk(0.095, 0.045, 0.095, ironPaint, [x, FY + y, z]);
    const top = FY + 1.07;
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.15, 0.13],
        [0, 0.13],
      ],
      { at: [x, top, z], segments: 4, spin: 45, color: ironPaint, bone: root },
    );
    blk(0.23, 0.03, 0.23, ironPaint, [x, top + 0.115, z]);
    blk(0.12, 0.07, 0.12, "#2a1c14", [x, top + 0.16, z], { rot: [0, 15, 0] });
    const fy = top + 0.19;
    // pixel flame: stacked boxes + cross cards
    blk(0.14, 0.1, 0.14, "#ff7a1a", [x, fy + 0.05, z]);
    blk(0.1, 0.1, 0.1, "#ffb02e", [x, fy + 0.15, z], { rot: [0, 20, 0] });
    blk(0.05, 0.08, 0.05, "#fff0a0", [x, fy + 0.24, z], { rot: [0, 40, 0] });
    b.cards([frame([x, fy, z], [0, 1, 0])], flameTex, {
      size: [0.3, 0.42],
      cross: true,
      lean: 0,
      flow: [0, 0, 1],
      sink: 0,
      bone: root,
    });
    // embers
    blk(0.03, 0.03, 0.03, "#ffb02e", [x + 0.12, fy + 0.3, z + 0.04], { rot: [0, 25, 0] });
    blk(0.025, 0.025, 0.025, "#ff6a1f", [x - 0.1, fy + 0.38, z - 0.05], { rot: [0, 40, 0] });
    blk(0.02, 0.02, 0.02, "#ffd24a", [x + 0.03, fy + 0.5, z - 0.09], { rot: [0, 10, 0] });
  };
  for (const [x, z] of TORCH_SPOTS) standingTorch(x, z);

  // fallen, burnt-out torch
  {
    const C: V3 = [-0.15, FY, 0.75];
    const yaw = 25;
    const rot: V3 = [0, yaw, 0];
    blk(0.07, 0.07, 0.85, poleWood, loc(C, yaw, [0, 0.035, 0]), { rot });
    for (const lz of [-0.25, 0.05]) blk(0.09, 0.09, 0.04, ironPaint, loc(C, yaw, [0, 0.045, lz]), { rot });
    blk(0.14, 0.14, 0.14, ironPaint, loc(C, yaw, [0, 0.07, 0.45]), { rot });
    blk(0.1, 0.1, 0.1, "#2a1c14", loc(C, yaw, [0, 0.06, 0.55]), { rot });
    blk(0.03, 0.03, 0.03, "#ff7a1a", loc(C, yaw, [0.03, 0.115, 0.56]), { rot });
    blk(0.02, 0.02, 0.02, "#ffb02e", loc(C, yaw, [-0.02, 0.11, 0.58]), { rot });
  }

  // ================= BONES =================
  const longBone = (cxp: number, czp: number, yaw: number, len: number, lift: number) => {
    const o: V3 = [cxp, FY + lift, czp];
    const rot: V3 = [0, yaw, 0];
    blk(0.04, 0.04, len, boneP, loc(o, yaw, [0, 0.02, 0]), { rot });
    for (const e of [1, -1])
      for (const sx of [1, -1]) blk(0.045, 0.05, 0.045, boneP, loc(o, yaw, [sx * 0.022, 0.025, (e * len) / 2]), { rot });
  };
  const loose: [number, number, number, number, number][] = [
    [-0.5, 0.95, 70, 0.42, 0],
    [-1.5, 0.75, -25, 0.38, 0],
    [-0.95, 0.9, 35, 0.4, 0],
    [-0.95, 0.9, -40, 0.38, 0.045],
    [-1.4, 1.1, 100, 0.3, 0],
    [0.35, -1.15, 80, 0.36, 0],
    [-0.55, 0.0, 15, 0.3, 0],
  ];
  for (const [x, z, yaw, len, lift] of loose) longBone(x, z, yaw, len, lift);

  const skull = (o: V3, yaw: number) => {
    const P = (l: V3) => loc(o, yaw, l);
    const rot: V3 = [0, yaw, 0];
    const DARK = "#1c1620";
    blk(0.18, 0.15, 0.19, boneP, P([0, 0.115, 0]), { rot });
    blk(0.13, 0.07, 0.1, boneP, P([0, 0.065, 0.1]), { rot });
    blk(0.12, 0.035, 0.12, boneP, P([0, 0.0175, 0.07]), { rot }); // jaw
    for (const s of [1, -1]) blk(0.045, 0.05, 0.03, DARK, P([s * 0.045, 0.12, 0.098]), { rot });
    blk(0.025, 0.035, 0.03, DARK, P([0, 0.085, 0.15]), { rot });
    for (const k of [-1, 0, 1]) blk(0.01, 0.03, 0.012, DARK, P([k * 0.03, 0.055, 0.152]), { rot });
  };
  skull([-0.7, FY, 0.58], 20);
  skull([-1.45, FY, 0.35], -60);

  // ribcage
  {
    const x0 = -1.05;
    for (let i = 0; i < 8; i++) blk(0.05, 0.05, 0.05, boneP, [x0, FY + 0.025, 0.02 + i * 0.07]);
    for (let i = 0; i < 6; i++) {
      const z0 = 0.07 + i * 0.09;
      const k = [0.8, 1, 1.1, 1.1, 1, 0.8][i];
      for (const side of [1, -1]) {
        const pts: V3[] = [
          [x0, FY + 0.04, z0],
          [x0 + side * 0.07 * k, FY + 0.1 * k + 0.03, z0 + 0.005],
          [x0 + side * 0.15 * k, FY + 0.09 * k + 0.02, z0 + 0.01],
          [x0 + side * 0.18 * k, FY + 0.02, z0 + 0.015],
        ];
        b.sweep(catmull(pts), [0.016, 0.011], { color: boneP, section: "box", caps: "flat", bone: root });
      }
    }
  }

  // ================= SPIKE TRAP =================
  {
    const tx = 0.95,
      tz = 0.62;
    const rimP = paint((p, n) => {
      const [u, v] = pc(p, n);
      if (n.y > 0.7) return mod(u + v, 6) < 3 ? "#d4a421" : "#2a2a32";
      return hash(u, v, 2) > 0.8 ? "#575c70" : "#454a5c";
    });
    for (const s of [1, -1]) {
      blk(1.0, 0.06, 0.12, rimP, [tx, FY + 0.03, tz + s * 0.44]);
      blk(0.12, 0.06, 0.76, rimP, [tx + s * 0.44, FY + 0.03, tz]);
    }
    const plate = woodPaint(["#6a6f82", "#5d6275", "#505568"], "#3a3e4e", 5, 5);
    blk(0.76, 0.03, 0.76, plate, [tx, FY + 0.015, tz]);
    const top = FY + 0.03;
    for (const [dx, dz, s] of [
      [0, 0, 0.07],
      [0.18, 0, 0.06],
      [-0.18, 0.18, 0.07],
      [0, -0.18, 0.05],
    ])
      blk(s, 0.004, s, "#7a1b22", [tx + dx, top + 0.002, tz + dz]);
    const Ht = [
      [0.38, 0, 0.3, 0],
      [0, 0.42, 0, 0.34],
      [0.3, 0, 0.38, 0],
      [0, 0.34, 0, 0.4],
    ];
    for (let iz = 0; iz < 4; iz++)
      for (let ix = 0; ix < 4; ix++) {
        const x = tx + (ix - 1.5) * 0.18;
        const z = tz + (iz - 1.5) * 0.18;
        blk(0.08, 0.01, 0.08, "#17171f", [x, top + 0.004, z]);
        const h = Ht[iz][ix];
        if (h > 0) {
          b.part(new THREE.ConeGeometry(0.045, h, 4, 1), ironPaint, {
            bone: root,
            at: [x, top + h / 2 - 0.01, z],
            rotation: [0, 45, 0],
            flat: true,
          });
          // tip glint
          blk(0.012, 0.03, 0.012, "#d6deea", [x, top + h - 0.03, z], { rot: [0, 45, 0] });
        }
        if (ix === 1 && iz === 1) skull([x, top + 0.27, z], 30);
      }
  }

  // warning sign
  {
    const sx = 0.3,
      sz = 0.35;
    blk(0.06, 0.75, 0.06, poleWood, [sx, FY + 0.375, sz]);
    blk(0.4, 0.36, 0.05, wood, [sx, FY + 0.6, sz]);
    const skullTex = pixelArt(
      [
        "...wwwwww...",
        "..wwwwwwww..",
        ".wwwwwwwwww.",
        ".wwwwwwwwww.",
        ".wkkkwwkkkw.",
        ".wkkkwwkkkw.",
        ".wwwwwwwwww.",
        "..wwwkkwww..",
        "..wwwwwwww..",
        "...wwwwww...",
        "...wkwkwkw..",
        "...wwwwwww..",
      ],
      { w: "#efe6c8", k: "#1c1620" },
      12,
    );
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: root,
      at: [sx, FY + 0.6, sz + 0.029],
      dir: [0, 0, 1],
      axis: "z",
      texture: skullTex,
    });
  }

  return b.root;
}
