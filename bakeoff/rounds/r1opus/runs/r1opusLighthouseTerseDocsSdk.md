```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  scales,
  grain,
  noise,
  svg,
  catmull,
  bezier,
  spiral,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Island Lighthouse",
  description:
    "A red-and-white striped lighthouse with a glowing lantern room, keeper's cottage, dock, rowboat and a perched gull on a tiny rocky, grassy island in a ring of teal water.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ---------- palette ----------
  const DARK = "#2b2f36";
  const STONE = "#d9d2c3";
  const ROOF_RED = "#b8302a";
  const GLASS_WIN = "#ffd86b";
  const TRIM = "#2e6f8e";
  const WOOD = "#9a6a3c";
  const WOOD_DK = "#6e4a2a";
  const ROPE = "#d8c08a";
  const WHITE = "#f6f2ea";
  const GULL_GREY = "#9aa3ad";
  const BEAK = "#f2b631";

  const whiteP = mottle("#f6f2ea", "#e4ddd0", { size: 0.6, seed: 1 });
  const redP = mottle("#cc372c", "#a92820", { size: 0.6, seed: 2 });
  const rockM = mottle("#8f897d", "#6a655c", { size: 0.9, seed: 3 });
  const grassP = mottle("#6cae4a", "#4c8f3d", { size: 0.7, seed: 4 });
  const woodP = grain("#a87442", "#8a5a30", { size: 0.06, axis: "z" });

  // ---------- water ----------
  const waterP = paint((p) => {
    const r = Math.hypot(p.x, p.z);
    const ripple = Math.sin(r * 2.4 + noise(p, 2.2, 5) * 6);
    if (r < 9.6 && ripple > 0.55) return "#e9f7f6";
    if (ripple > 0.82) return "#7fd3df";
    return r < 10 ? "#2fa6b8" : "#1f86a0";
  });
  b.lathe(
    [
      [0, 0],
      [12.5, 0],
      [12.5, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], segments: 28, color: waterP, name: "water" },
  );
  // foam collar hugging the shore
  const foamP = paint((p) => (noise(p, 0.7, 9) > 0.45 ? "#f4fbfb" : "#bfe9ec"));
  b.lathe(
    [
      [8.0, 0.06],
      [9.3, 0.06],
      [9.3, 0.17],
      [8.0, 0.2],
    ],
    { at: [0, 0, 0], segments: 18, spin: 7, color: foamP, name: "foam" },
  );

  // ---------- island ----------
  const rockOutline: number[][] = [
    [8.2, 0],
    [8.5, 0.5],
    [8.0, 1.3],
    [7.1, 1.9],
    [6.3, 2.3],
  ];
  const rockH = (r: number) => {
    for (let i = 0; i < rockOutline.length - 1; i++) {
      const [r0, y0] = rockOutline[i + 1];
      const [r1, y1] = rockOutline[i];
      if (r >= r0 && r <= r1) return y0 + ((r - r0) / (r1 - r0)) * (y1 - y0);
    }
    return r < 6.3 ? 2.4 : 0;
  };
  const rockP = paint((p) => {
    if (p.y < 0.55) return "#4f4c47";
    if (p.y < 0.85 && noise(p, 0.5, 4) > 0.5) return "#2f6b4f";
    return rockM;
  });
  b.lathe(
    [
      [0, 0],
      [8.2, 0],
      [8.5, 0.5],
      [8.0, 1.3],
      [7.1, 1.9],
      [6.3, 2.3],
      [0, 2.4],
    ],
    { at: [0, 0, 0], segments: 11, color: rockP, name: "island" },
  );
  const grass = b.lathe(
    [
      [0, 2.3],
      [6.5, 2.3],
      [6.6, 2.45],
      [6.1, 2.65],
      [0, 2.7],
    ],
    { at: [0, 0, 0], segments: 11, spin: 14, color: grassP, name: "grass" },
  );
  const gH = (r: number) => 2.7 - (0.05 * Math.min(r, 6.1)) / 6.1;

  // boulders around the shore and out in the water
  const boulderCols = ["#7d776c", "#6a655c", "#8e887b", "#5f5b54"];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.25;
    const rad = 7.7 + R() * 2.0;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    if (Math.abs(x + 2.0) < 2.0 && z > 5.5) continue; // keep dock & boat clear
    const sz = 0.35 + R() * 0.7;
    const geo = new THREE.DodecahedronGeometry(sz, 0);
    geo.scale(1, 0.7, 1.15);
    b.part(geo, boulderCols[i % 4], {
      at: [x, sz * 0.3 + (rad < 8.4 ? 0.3 : 0), z],
      rotation: [R() * 40, R() * 360, R() * 40],
      flat: true,
      name: `boulder${i}`,
    });
  }

  // ---------- lighthouse ----------
  const rTower = (y: number) => 2.1 - (0.7 * (y - 3.4)) / 10.8;

  b.lathe(
    [
      [0, 2.55],
      [2.6, 2.55],
      [2.6, 3.3],
      [2.4, 3.5],
      [0, 3.5],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: scales("#bdb6a8", "#8d867a", { size: 0.4 }), name: "plinth" },
  );

  const towerP = paint((_p, _n, s) => (Math.floor((s[0] - 3.4) / 2.15) % 2 === 0 ? whiteP : redP));
  const tower = b.lathe(
    [
      [0, 3.4],
      [2.1, 3.4],
      [1.4, 14.2],
      [0, 14.2],
    ],
    { at: [0, 0, 0], segments: 16, color: towerP, name: "tower" },
  );

  // arched outline helper
  const arch = (hw: number, h: number, y0 = 0): OutlinePoint[] => [
    [-hw, y0],
    [hw, y0],
    [hw, y0 + h - hw],
    [hw * 0.7, y0 + h - hw * 0.3],
    [0, y0 + h],
    [-hw * 0.7, y0 + h - hw * 0.3],
    [-hw, y0 + h - hw],
  ];

  // door
  const dz = rTower(4.3);
  b.extrude(arch(0.75, 2.2), { at: [0, 3.5, dz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.36, bevel: 0.03, color: STONE, name: "doorFrame" });
  b.extrude(arch(0.55, 1.9), {
    at: [0, 3.5, dz],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.3,
    color: grain("#2f5d50", "#24493f", { size: 0.07, axis: "y" }),
    name: "door",
  });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), "#e8c45a", { at: [0.32, 4.4, dz + 0.17], name: "doorKnob" });
  for (const hy of [3.9, 4.9])
    b.part(new THREE.BoxGeometry(0.5, 0.07, 0.04), DARK, { at: [-0.25, hy, dz + 0.16], name: "hinge" });

  // plaque decal
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 64"><rect x="3" y="3" width="174" height="58" rx="10" fill="#1f3a5a" stroke="#e8c45a" stroke-width="5"/><text x="90" y="45" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#e8c45a" text-anchor="middle">1887</text></svg>`,
    { size: 256 },
  );
  b.decal(tower, plaque, { at: [0, 6.05, rTower(6.05)], dir: [0, 0, 1], size: [0.9, 0.32], name: "plaque" });

  // windows
  const windows: [number, number][] = [
    [6.9, 0],
    [9.3, 38],
    [11.7, -18],
    [8.1, 180],
    [10.5, 140],
    [8.6, -100],
  ];
  for (const [wy, deg] of windows) {
    const th = (deg * Math.PI) / 180;
    const r = rTower(wy + 0.4);
    const at: [number, number, number] = [Math.sin(th) * r, wy, Math.cos(th) * r];
    const xd: [number, number, number] = [Math.cos(th), 0, -Math.sin(th)];
    b.extrude(arch(0.36, 1.05, -0.1), { at, x: xd, y: [0, 1, 0], thickness: 0.26, bevel: 0.02, color: DARK, name: "winFrame" });
    b.extrude(arch(0.26, 0.85), { at, x: xd, y: [0, 1, 0], thickness: 0.3, color: GLASS_WIN, name: "winGlass" });
    b.part(new THREE.BoxGeometry(0.95, 0.08, 0.3), STONE, {
      at: [Math.sin(th) * (r + 0.1), wy - 0.14, Math.cos(th) * (r + 0.1)],
      rotation: [0, deg, 0],
      name: "winSill",
    });
  }

  // band at the top of the tower
  b.lathe(
    [
      [1.3, 13.55],
      [1.56, 13.55],
      [1.56, 13.7],
      [1.3, 13.7],
    ],
    { at: [0, 0, 0], segments: 16, color: DARK, name: "towerBand" },
  );

  // gallery deck + brackets
  b.lathe(
    [
      [0, 14.0],
      [2.35, 14.0],
      [2.35, 14.35],
      [0, 14.35],
    ],
    { at: [0, 0, 0], segments: 16, color: DARK, name: "deck" },
  );
  for (let i = 0; i < 12; i++) {
    const th = (i / 12) * Math.PI * 2;
    const o: [number, number, number] = [Math.sin(th), 0, Math.cos(th)];
    b.extrude(
      [
        [0, 0],
        [0.15, 0],
        [0.95, 0.55],
        [0.95, 0.65],
        [0, 0.65],
      ],
      { at: [o[0] * 1.4, 13.35, o[2] * 1.4], x: o, y: [0, 1, 0], thickness: 0.14, color: DARK, name: "bracket" },
    );
  }

  // railing
  const railR = 2.22;
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    const x = Math.sin(th) * railR;
    const z = Math.cos(th) * railR;
    b.rod([x, 14.35, z], [x, 15.32, z], 0.035, { color: DARK, sides: 6, name: "railPost" });
  }
  for (const ry of [14.85, 15.3]) {
    const pts: number[][] = [];
    for (let i = 0; i < 16; i++) {
      const th = (i / 16) * Math.PI * 2;
      pts.push([Math.sin(th) * railR, ry, Math.cos(th) * railR]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.04, { color: DARK, sides: 6, name: "rail" });
  }

  // lantern room
  b.lathe(
    [
      [0, 14.3],
      [1.5, 14.3],
      [1.5, 15.05],
      [0, 15.05],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: ROOF_RED, name: "watchRoom" },
  );
  const lampP = paint((_p, _n, s) =>
    Math.abs(s[0] - 15.9) < 0.3 ? "#fffbe6" : Math.abs(s[0] - 15.9) < 0.55 ? "#ffe680" : "#ffcf3f",
  );
  b.lathe(
    [
      [0, 15.0],
      [1.3, 15.0],
      [1.3, 16.8],
      [0, 16.8],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: lampP, name: "lantern" },
  );
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2;
    const x = Math.sin(th) * 1.34;
    const z = Math.cos(th) * 1.34;
    b.rod([x, 15.05, z], [x, 16.8, z], 0.045, { color: DARK, sides: 6, name: "mullion" });
  }
  b.lathe(
    [
      [0, 16.7],
      [1.45, 16.7],
      [1.45, 16.82],
      [0, 16.82],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: DARK, name: "lanternRim" },
  );

  // roof, ball, rod, weathervane
  b.lathe(
    [
      [0, 16.78],
      [1.68, 16.78],
      [1.68, 16.92],
      [1.2, 17.4],
      [0.55, 17.85],
      [0, 17.95],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22.5, color: ROOF_RED, name: "roof" },
  );
  b.part(new THREE.SphereGeometry(0.22, 8, 6), DARK, { at: [0, 18.1, 0], name: "roofBall" });
  b.rod([0, 18.2, 0], [0, 19.15, 0], 0.03, { color: DARK, sides: 6, name: "lightningRod" });
  b.rod([-0.4, 18.5, 0], [0.4, 18.5, 0], 0.02, { color: DARK, sides: 5, name: "vaneEW" });
  b.rod([0, 18.5, -0.4], [0, 18.5, 0.4], 0.02, { color: DARK, sides: 5, name: "vaneNS" });
  b.extrude(
    [
      [-0.55, -0.15, "sharp"],
      [-0.4, -0.04],
      [0.3, -0.04],
      [0.3, -0.13, "sharp"],
      [0.58, 0, "sharp"],
      [0.3, 0.13, "sharp"],
      [0.3, 0.04],
      [-0.4, 0.04],
      [-0.55, 0.15, "sharp"],
      [-0.45, 0, "sharp"],
    ],
    { at: [0, 18.85, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: "#e8c45a", name: "vaneArrow" },
  );

  // ---------- keeper's cottage ----------
  const cX = 4.1;
  const cZ = -1.6;
  const wallP = mottle("#f3efe4", "#ddd6c6", { size: 0.5, seed: 6 });
  b.part(new THREE.BoxGeometry(2.2, 1.95, 2.0), wallP, { at: [cX, 3.525, cZ], name: "cottageWalls" });
  b.extrude(
    [
      [-1.0, 0],
      [1.0, 0],
      [0, 1.0],
    ],
    { at: [cX, 4.5, cZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: wallP, name: "gable" },
  );
  const tiles = scales("#9c3b2e", "#6b261d", { size: 0.22 });
  for (const s of [1, -1])
    b.frustumBox([cX, 4.28, cZ + s * 1.3], [cX, 5.52, cZ], [2.9, 0.14], [2.9, 0.14], { color: tiles, name: "roofSlope" });
  b.rod([cX - 1.48, 5.56, cZ], [cX + 1.48, 5.56, cZ], 0.09, { color: "#5a2019", sides: 6, name: "ridge" });
  b.part(new THREE.BoxGeometry(0.45, 1.4, 0.45), scales("#a0523d", "#6e3426", { size: 0.14 }), {
    at: [cX + 0.65, 5.3, cZ - 0.45],
    name: "chimney",
  });
  b.part(new THREE.BoxGeometry(0.56, 0.1, 0.56), DARK, { at: [cX + 0.65, 6.03, cZ - 0.45], name: "chimneyCap" });
  const puffs: [number, number, number, number][] = [
    [0.22, 0, 6.2, 0],
    [0.28, -0.2, 6.55, 0.05],
    [0.34, -0.5, 6.98, 0.1],
  ];
  for (const [r, dx, y, dz2] of puffs)
    b.part(new THREE.IcosahedronGeometry(r, 0), "#eef2f5", {
      at: [cX + 0.65 + dx, y, cZ - 0.45 + dz2],
      rotation: [20, r * 300, 10],
      flat: true,
      name: "smoke",
    });

  const front = cZ + 1.0;
  b.extrude(arch(0.38, 1.45), { at: [cX - 0.5, 2.6, front], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, color: TRIM, name: "cottageDoor" });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), "#e8c45a", { at: [cX - 0.25, 3.3, front + 0.08], name: "cottageKnob" });
  b.part(new THREE.BoxGeometry(0.8, 0.1, 0.5), STONE, { at: [cX - 0.5, 2.62, front + 0.2], name: "doorStep" });
  // window with flower box
  b.part(new THREE.BoxGeometry(0.72, 0.66, 0.12), TRIM, { at: [cX + 0.55, 3.7, front], name: "cWinFrame" });
  b.part(new THREE.BoxGeometry(0.56, 0.5, 0.16), GLASS_WIN, { at: [cX + 0.55, 3.7, front], name: "cWinGlass" });
  b.part(new THREE.BoxGeometry(0.04, 0.52, 0.2), TRIM, { at: [cX + 0.55, 3.7, front], name: "cWinBar" });
  b.part(new THREE.BoxGeometry(0.58, 0.04, 0.2), TRIM, { at: [cX + 0.55, 3.7, front], name: "cWinBar" });
  b.part(new THREE.BoxGeometry(0.8, 0.18, 0.22), woodP, { at: [cX + 0.55, 3.28, front + 0.12], name: "flowerBox" });
  const bloomCols = ["#f05a7e", "#f2d14b", "#ffffff", "#b78bea"];
  for (let i = 0; i < 6; i++)
    b.part(new THREE.IcosahedronGeometry(0.06, 0), bloomCols[i % 4], {
      at: [cX + 0.25 + i * 0.12, 3.42, front + 0.12 + (i % 2) * 0.05],
      flat: true,
      name: "boxBloom",
    });
  // life ring on the east wall
  const ringP = paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 ? "#d8392f" : WHITE));
  b.part(new THREE.TorusGeometry(0.28, 0.075, 6, 16), ringP, { at: [cX + 1.13, 3.7, cZ], dir: [1, 0, 0], axis: "z", name: "lifeRing" });

  // gull on the ridge
  const gx = cX + 0.7;
  b.capsule([gx, 5.76, cZ - 0.16], [gx, 5.83, cZ + 0.14], 0.11, { color: WHITE, name: "gullBody" });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), WHITE, { at: [gx, 5.98, cZ + 0.22], name: "gullHead" });
  b.spike([gx, 5.97, cZ + 0.29], [0, -0.2, 1], 0.12, 0.026, { color: BEAK, name: "gullBeak" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#111111", { at: [gx + s * 0.07, 6.0, cZ + 0.25], name: "gullEye" });
    b.extrude(
      [
        [0, 0],
        [0.38, -0.03],
        [0.46, 0.04, "sharp"],
        [0.1, 0.11],
      ],
      { at: [gx + s * 0.1, 5.78, cZ + 0.14], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, color: GULL_GREY, name: "gullWing" },
    );
  }
  b.spike([gx, 5.8, cZ - 0.2], [0, 0.1, -1], 0.16, 0.06, { color: DARK, name: "gullTail" });

  // ---------- dock, steps, boat ----------
  const dockX = -2.5;
  for (let i = 0; i < 7; i++) {
    const z = 7.95 - i * 0.34;
    const top = rockH(Math.hypot(dockX, z)) + 0.1;
    b.part(new THREE.BoxGeometry(1.3, 0.7, 0.42), i % 2 ? "#a49d90" : "#b3ad9f", { at: [dockX, top - 0.35, z], flat: true, name: "step" });
  }
  for (let i = 0; i < 12; i++) {
    b.part(new THREE.BoxGeometry(1.45, 0.08, 0.28), i % 3 === 1 ? WOOD_DK : woodP, {
      at: [dockX, 0.75, 7.95 + i * 0.32],
      rotation: [0, (R() - 0.5) * 3, 0],
      name: "plank",
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.14, 3.9), WOOD_DK, { at: [dockX + s * 0.55, 0.64, 9.7], name: "stringer" });
    for (const z of [8.6, 10.0, 11.45]) {
      const top = z > 11 ? 1.25 : 1.0;
      b.part(new THREE.CylinderGeometry(0.09, 0.1, top, 7), WOOD_DK, { at: [dockX + s * 0.68, top / 2, z], name: "dockPost" });
    }
  }
  b.sweep(
    spiral([dockX - 0.1, 0.83, 10.7], [dockX + 0.22, 0.83, 10.7], [0, 1, 0], { turns: 2.5, r1: 0.08, pitch: 0 }),
    0.035,
    { color: ROPE, sides: 5, name: "ropeCoil" },
  );

  b.loft(
    [
      { at: [-0.9, 0.24, 9.0], w: 0.2, h: 0.32 },
      { at: [-0.9, 0.2, 9.6], w: 1.05, h: 0.46 },
      { at: [-0.9, 0.21, 10.3], w: 1.1, h: 0.46 },
      { at: [-0.9, 0.28, 11.0], w: 0.12, h: 0.36 },
    ],
    {
      color: "#3d6fa8",
      sectors: [
        [-58, 58, "#c9a26b"],
        [62, 78, WHITE],
        [282, 298, WHITE],
      ],
      name: "boatHull",
    },
  );
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.22), WOOD_DK, { at: [-0.9, 0.43, 10.0], name: "boatBench" });
  for (const s of [1, -1])
    b.rod([-0.9 - s * 0.35, 0.47, 9.5], [-0.9 + s * 0.15, 0.5, 10.6], 0.025, { color: WOOD, sides: 5, name: "oar" });
  b.sweep(bezier([-1.82, 1.0, 10.0], [-1.4, 0.4, 9.6], [-0.9, 0.42, 9.18]), 0.022, { color: ROPE, sides: 5, name: "mooring" });

  // ---------- yard props ----------
  const barrelP = paint((_p, _n, s) => (Math.abs(s[0] - 0.13) < 0.04 || Math.abs(s[0] - 0.57) < 0.04 ? DARK : woodP));
  const barrels: [number, number][] = [
    [-4.3, 2.6],
    [-3.6, 2.1],
  ];
  for (const [x, z] of barrels)
    b.lathe(
      [
        [0, 0],
        [0.3, 0],
        [0.36, 0.35],
        [0.3, 0.7],
        [0, 0.7],
      ],
      { at: [x, 2.62, z], segments: 10, color: barrelP, name: "barrel" },
    );
  b.part(new THREE.BoxGeometry(0.6, 0.55, 0.6), grain("#b7884f", "#94683a", { size: 0.05, axis: "x" }), {
    at: [-4.3, 2.92, 3.4],
    rotation: [0, 20, 0],
    name: "crate",
  });

  // stepping stones from the tower door to the stairs
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    const x = -2.5 * t + (i % 2 ? 0.15 : -0.15);
    const z = 2.55 + (5.6 - 2.55) * t;
    b.part(new THREE.CylinderGeometry(0.32, 0.34, 0.08, 7), i % 2 ? "#b8b1a3" : "#a69f92", {
      at: [x, gH(Math.hypot(x, z)) + 0.01, z],
      rotation: [0, i * 37, 0],
      flat: true,
      name: "pathStone",
    });
  }

  // ---------- grass tufts & wildflowers ----------
  const clear = (x: number, z: number) => {
    const r = Math.hypot(x, z);
    if (r < 2.9 || r > 6.0) return false;
    if (x > 2.7 && x < 5.5 && z > -2.9 && z < 0.1) return false;
    if (Math.hypot(x + 4.0, z - 2.7) < 1.4) return false;
    if (Math.abs(x + 1.25) < 1.7 && z > 2.2 && z < 6.2 && Math.abs(x - -2.5 * ((z - 2.55) / 3.05)) < 0.6) return false;
    return true;
  };
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><path d="M3 0 L8 38 L12 0 Z M20 0 L26 34 L29 0 Z" fill="#cfcfcf"/><path d="M10 0 L16 47 L21 0 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const turf = b.surface(grass);
  const tuftHits = turf.scatter(160, { rng: rng(5), minDist: 0.35, filter: (h) => h.n.y > 0.6 && clear(h.at.x, h.at.z) });
  b.cards(tuftHits, tuft, { size: [0.32, 0.42], lean: 15, bend: 20, vary: 0.35, spin: 180, cross: true, rng: rng(6), color: "#5fa043" });

  const flowerHits = turf.scatter(40, { rng: rng(8), minDist: 0.5, filter: (h) => h.n.y > 0.6 && clear(h.at.x, h.at.z) });
  flowerHits.forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4), "#3f7a32", h, { embed: 0.1, name: "stem" });
    b.stick(new THREE.IcosahedronGeometry(0.065, 0).translate(0, 0.2, 0), bloomCols[i % 4], h, { embed: 0, flat: true, name: "bloom" });
  });

  return b.root;
}
```