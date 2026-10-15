import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, noise, polyline } from "../../../../src/index";
import type { ColorInput, Joint } from "../../../../src/index";
import { pixelTexture, tileBox, cellPaint, pick } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";

export const meta = {
  name: "Monster Truck 'Crusher'",
  description:
    "Pixel-art monster truck with huge lugged tyres, coil-over shocks, a blown engine, flame decals and glowing lights, parked on a dirt arena pad in front of a crushed car.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Constants
const TEXEL = 0.1; // body paint cell
const WX = 1.45; // wheel track half width
const CY = 0.87; // wheel centre height
const ZF = 1.3; // front axle z
const ZB = -1.3; // rear axle z

// Palettes (dark -> light)
const BLUE = ["#0b1b4a", "#14398a", "#1f66d8", "#3d9bff", "#9bdcff"];
const STEEL = ["#15161c", "#2a2c38", "#454a5c", "#6b7288", "#a4acc4"];
const DIRT = ["#2a1a10", "#4a2e1c", "#6b4528", "#8a5e36", "#a67a48"];
const TIRE = ["#1c1c28", "#32323f", "#4c4e62", "#767a94"];
const CHROME_R = ["#3b4468", "#6f80b4", "#b8c8f0", "#ffffff", "#9fb0e0", "#4d5a88"];
const GRASS = ["#14301a", "#245a24", "#3c8a2c", "#6ab83c"];
const WOOD = ["#5a3a1e", "#7a5230", "#9a6a3c", "#b88650"];
const GLASS_R = ["#1f3f78", "#3a78c0", "#7cc8f0", "#c5ecff"];
const YEL = ["#7a5a10", "#c89a1a", "#f2c230", "#ffe066"];
const RUST = ["#3a1a0c", "#5a2a14", "#8a4a22"];
const FRAME = "#0a1030";
const SPRING = "#ffd023";

// ---------------------------------------------------------------------------------------------------------------
// Pixel font (3x5)
const FONT: Record<string, string[]> = {
  C: ["111", "100", "100", "100", "111"],
  R: ["110", "101", "110", "101", "101"],
  U: ["101", "101", "101", "101", "111"],
  S: ["111", "100", "111", "001", "111"],
  H: ["101", "101", "111", "101", "101"],
  E: ["111", "100", "110", "100", "111"],
  X: ["101", "101", "010", "101", "101"],
  "4": ["101", "101", "111", "001", "001"],
};
function glyphPixels(text: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  for (const ch of text) {
    FONT[ch].forEach((row, y) => {
      for (let i = 0; i < row.length; i++) if (row[i] === "1") out.push([x + i, y]);
    });
    x += 4;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
const NAME = pixelTexture(29, 7, (g) => {
  const px = glyphPixels("CRUSHER");
  for (const [x, y] of px)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) g.set(x + 1 + dx, y + 1 + dy, FRAME);
  for (const [x, y] of px) g.set(x + 1, y + 1, "#ffe14a");
});

const PLATE = pixelTexture(17, 9, (g) => {
  g.fill(() => "#1a1a2a");
  g.fill(() => "#f4efd0", [1, 1, 15, 7]);
  for (const [x, y] of glyphPixels("4X4")) g.set(3 + x, 2 + y, "#1d3a9a");
});

const PLANKS = pixelTexture(16, 12, (g) =>
  g.fill((x, y) => {
    const row = Math.floor(y / 4);
    if (y % 4 === 3) return "#2e1a0c";
    if ((x + row * 7) % 16 === 0) return "#3a2412";
    return pick(WOOD, 0.35 + (((x * 7 + row * 13 + y * 3) % 5) / 5) * 0.5);
  }),
);

const CHECK = pixelTexture(12, 8, (g) => g.fill((x, y) => (((x >> 1) + (y >> 1)) % 2 ? "#ffffff" : "#15151c")));

const GLASS = pixelTexture(32, 12, (g) =>
  g.fill((x, y) => {
    if (x === 0 || x === 31 || y === 0 || y === 11) return FRAME;
    if (y <= 2) return "#18305c";
    if ((x + y * 2) % 16 < 2) return "#e8fbff";
    if ((x + y * 2 + 8) % 16 === 0) return "#c5ecff";
    return pick(GLASS_R, 0.15 + (y / 11) * 0.75);
  }),
);

function sideWindow(mirror: boolean) {
  const W = 24;
  const H = 8;
  return pixelTexture(W, H, (g) => {
    for (let y = 0; y < H; y++) {
      const start = Math.round(5 - 4 * (y / (H - 1)));
      for (let x = start; x < W; x++) {
        const edge = x === start || x === W - 1 || y === 0 || y === H - 1;
        let c = FRAME;
        if (!edge) c = (x * 2 + y * 2) % 12 < 2 ? "#e8fbff" : pick(GLASS_R, 0.9 - (y / H) * 0.7);
        g.set(mirror ? W - 1 - x : x, y, c);
      }
    }
  });
}

function flames(mirror: boolean) {
  const W = 80;
  const H = 9;
  return pixelTexture(W, H, (g) => {
    for (let x = 0; x < W; x++) {
      const k = Math.floor(x / 10);
      const pos = (x % 10) / 10 + 0.05;
      const prof = pos < 0.8 ? pos / 0.8 : (1 - pos) / 0.2;
      const amp = 0.65 + 0.35 * (((k * 37) % 5) / 4);
      const fade = 1 - 0.3 * (x / W);
      const h = Math.max(2, Math.min(H, Math.round(1 + (H - 1) * prof * amp * fade)));
      const px = mirror ? W - 1 - x : x;
      for (let j = 0; j < h; j++) {
        const ratio = j / h;
        const c = j === 0 ? "#fff6a0" : ratio < 0.35 ? "#ffe94d" : ratio < 0.7 ? "#ff9a1e" : "#e8341c";
        g.set(px, H - 1 - j, c);
      }
      if (h < H) g.set(px, H - 1 - h, FRAME);
    }
  });
}

const HUB = pixelTexture(20, 20, (g) =>
  g.fill((x, y) => {
    const dx = x - 9.5;
    const dy = y - 9.5;
    const d = Math.hypot(dx, dy);
    if (d > 10) return "";
    if (d > 8.4) return dx + dy > 0 ? "#8a98c0" : "#e8f0ff";
    if (d > 6.2) {
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8;
        if (Math.hypot(dx - 7.3 * Math.cos(a), dy - 7.3 * Math.sin(a)) < 0.8) return "#3a2a08";
      }
      return dy > 1 ? "#e0a010" : "#ffcf2a";
    }
    if (d > 2.8) {
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        if (Math.hypot(dx - 4.4 * Math.cos(a), dy - 4.4 * Math.sin(a)) < 1.0) return "#e8f0ff";
      }
      return "#2a2c38";
    }
    return dx < 0 && dy < 0 ? "#ffffff" : "#c9d2ec";
  }),
);

const GRILLE = pixelTexture(36, 12, (g) => {
  g.fill(() => "#0c0c14");
  for (const x0 of [1, 28])
    g.fill((x, y) => (x === 0 || x === 6 || y === 0 || y === 4 ? "#8a98c0" : "#1b1b28"), [x0, 1, 7, 5]);
  g.fill((x, y) => (y % 2 === 0 ? pick(CHROME_R, 0.3 + ((x % 6) / 6) * 0.6) : "#14141f"), [9, 1, 18, 7]);
  g.fill(() => "#ffcf2a", [17, 1, 2, 7]);
  g.fill((x, y) => {
    const t = x % 4;
    if (y <= 1) return t < 3 ? "#f4f4ff" : "#14141f";
    if (y === 2) return t < 2 ? "#f4f4ff" : "#14141f";
    return t === 0 ? "#f4f4ff" : "#14141f";
  }, [9, 8, 18, 4]);
  g.fill((x, y) => (x % 2 ? "#e8f0ff" : "#454a5c"), [1, 8, 7, 3]);
  g.fill((x, y) => (x % 2 ? "#e8f0ff" : "#454a5c"), [28, 8, 7, 3]);
});

const WIN_L = sideWindow(false);
const WIN_R = sideWindow(true);
const FLAME_L = flames(false);
const FLAME_R = flames(true);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const bodyPaint = cellPaint(
  TEXEL,
  (c) => {
    const h = c.at.y;
    const mudLine = 1.84 + 0.22 * noise(c.at, 0.45, 3) + 0.06 * c.random(8);
    if (h < mudLine && h < 2.1) return c.pick(DIRT, 0.25 + 0.5 * c.random(2));
    const v =
      0.52 + 0.3 * c.n.y + 0.12 * c.n.z + 0.08 * c.n.x + 0.2 * (noise(c.at, 0.4, 5) - 0.5) - 0.05 * c.random(1);
    return c.pick(BLUE, v);
  },
  { dither: true },
);

const chromePaint = cellPaint(0.05, (c) =>
  pick(CHROME_R, 0.5 + 0.5 * Math.sin(3 * (c.n.x * 0.7 + c.n.y + c.n.z * 0.4))),
);

const steelPaint = cellPaint(
  0.07,
  (c) => {
    if (c.at.y < 1.2 && c.random(4) < 0.28 * (1.2 - c.at.y)) return c.pick(DIRT, 0.2 + 0.4 * c.random(6));
    return c.pick(STEEL, 0.35 + 0.25 * c.n.y + 0.15 * c.n.x + (c.random(1) - 0.5) * 0.25);
  },
  { dither: true },
);

const goldPaint = cellPaint(0.05, (c) =>
  pick(["#6a4a14", "#b8862a", "#e6b84a", "#fff0a0"], 0.45 + 0.35 * c.n.y + 0.2 * (c.random(1) - 0.5)),
);

const tyrePaint = (cx: number, cy: number, cz: number) =>
  cellPaint(0.055, (c) => {
    const dy = c.at.y - cy;
    const dz = c.at.z - cz;
    const d = Math.hypot(dy, dz);
    const mudAmt = Math.max(0, 0.75 - c.at.y) * (0.5 + noise(c.at, 0.3, 2));
    if (c.random(7) < mudAmt) return c.pick(DIRT, 0.2 + 0.5 * c.random(3));
    if (c.axis === 0 && d < 0.71) {
      if (d > 0.58 && d < 0.66) {
        const ang = Math.atan2(dy, dz);
        const k = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 30);
        if (k % 5 !== 4 && (k * 7) % 3 !== 0) return "#cfd2e4";
      }
      if (d > 0.5 && d < 0.55) return "#3a3a4a";
      return c.pick(TIRE, 0.25 + 0.2 * c.random(1));
    }
    const chk = (((c.u + c.v) % 2) + 2) % 2;
    return c.pick(TIRE, 0.2 + 0.18 * chk + 0.25 * c.random(2) + 0.1 * c.n.y);
  });

const dirtTop = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.y < 0.5) return c.pick(DIRT, 0.2 + 0.2 * c.random(1));
    const x = c.at.x;
    const z = c.at.z;
    if (Math.abs(x) > 2.8 || z < -2.7 || z > 4.7) return c.pick(GRASS, 0.3 + 0.5 * c.random(2));
    let v = 0.5 + 0.6 * (noise(c.at, 0.6, 2) - 0.5) + (c.random(3) - 0.5) * 0.25;
    if (Math.abs(Math.abs(x) - WX) < 0.28 && z < 2.8) v -= 0.25 + ((((c.v % 2) + 2) % 2) ? 0.1 : 0);
    return c.pick(DIRT, v);
  },
  { dither: true },
);

const moundPaint = cellPaint(
  0.08,
  (c) => c.pick(DIRT, 0.35 + 0.3 * c.n.y + 0.3 * (c.random(1) - 0.5) + 0.15 * (noise(c.at, 0.4, 4) - 0.5)),
  { dither: true },
);

const tireStackPaint = cellPaint(0.06, (c) => c.pick(TIRE, 0.25 + 0.3 * c.n.y + 0.3 * c.random(1)));

const carPaint = cellPaint(
  0.07,
  (c) => {
    if (noise(c.at, 0.5, 8) > 0.62 && c.random(2) < 0.7) return c.pick(RUST, c.random(3));
    return c.pick(YEL, 0.5 + 0.3 * c.n.y + 0.2 * (c.random(1) - 0.5));
  },
  { dither: true },
);

const conePaint = cellPaint(0.05, (c) => {
  const y = c.at.y;
  if (y > 0.2 && y < 0.3) return "#fdfdf4";
  return c.pick(["#a83a08", "#e05a10", "#ff8a1c"], 0.5 + 0.4 * c.n.y);
});

// ---------------------------------------------------------------------------------------------------------------
const lerpV = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

export default function build() {
  const b = createBuilder({ name: "monster_truck", paintSize: 2048 });
  const r = rng(7);

  const chassis = b.joint("chassis", { at: [0, 1.45, 0] });
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.36, 0.56], dir: [0, 0, 1], role: "hinge" });

  // ---- helpers
  const bx = (bone: Joint, w: number, h: number, d: number, at: V, color: ColorInput, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (bone: Joint, rt: number, rb: number, h: number, seg: number, at: V, dir: V, color: ColorInput, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir, ...o });
  const tube = (a: V, c: V, rad: number, color: ColorInput = steelPaint, bone: Joint = chassis) =>
    b.rod(a, c, rad, color, { bone, sides: 4 });
  const plane = (bone: Joint, w: number, h: number, at: V, dir: V, tex: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up: [0, 1, 0], texture: tex, ...o });
  const mergeBoxes = (items: { size: V; at: V; yaw?: number }[]) =>
    mergeGeometries(
      items.map((i) => {
        const g = new THREE.BoxGeometry(...i.size);
        if (i.yaw) g.rotateY(i.yaw);
        g.translate(...i.at);
        return g;
      }),
    )!;

  // ---- wheels
  const wheels: [string, number, number][] = [
    ["FL", 1, ZF],
    ["FR", -1, ZF],
    ["BL", 1, ZB],
    ["BR", -1, ZB],
  ];
  const lugGeo = new THREE.BufferGeometry();
  {
    const N = 14;
    const step = (Math.PI * 2) / N;
    const gs: THREE.BufferGeometry[] = [];
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < N; i++) {
        const phi = Math.PI + (i + row * 0.5) * step;
        const g = new THREE.BoxGeometry(0.2, 0.09, 0.22);
        g.rotateX(phi);
        g.translate(row ? 0.13 : -0.13, 0.835 * Math.cos(phi), 0.835 * Math.sin(phi));
        gs.push(g);
      }
    const merged = mergeGeometries(gs)!;
    lugGeo.copy(merged);
  }

  for (const [id, s, z] of wheels) {
    const cx = s * WX;
    const j = b.joint(`wheel${id}`, { parent: chassis, at: [cx, CY, z], dir: [s, 0, 0] });
    const tp = tyrePaint(cx, CY, z);
    b.part(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), tp, { bone: j, at: [cx, CY, z], dir: [1, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.68, 16), tp, { bone: j, at: [cx, CY, z], dir: [1, 0, 0], flat: true });
    b.part(lugGeo, tp, { bone: j, at: [cx, CY, z], flat: true });
    // rim lip, hub drawing, centre cap
    cyl(j, 0.53, 0.53, 0.03, 20, [cx + s * 0.348, CY, z], [1, 0, 0], chromePaint);
    b.part(new THREE.CircleGeometry(0.5, 20), "#ffffff", {
      bone: j,
      at: [cx + s * 0.364, CY, z],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: HUB,
    });
    cyl(j, 0.1, 0.12, 0.07, 8, [cx + s * 0.4, CY, z], [1, 0, 0], chromePaint);
  }

  // ---- chassis frame
  for (const s of [1, -1]) {
    bx(chassis, 0.14, 0.2, 4.0, [s * 0.55, 1.45, 0], steelPaint);
    // body mounts
    for (const z of [-1.6, -0.5, 0.6, 1.6]) bx(chassis, 0.18, 0.2, 0.18, [s * 0.55, 1.65, z], steelPaint);
  }
  for (const z of [-1.7, -0.9, -0.1, 0.7, 1.5]) bx(chassis, 1.24, 0.12, 0.14, [0, 1.45, z], steelPaint);
  bx(chassis, 0.9, 0.3, 0.8, [0, 1.38, -1.0], "#b23a2a"); // fuel cell
  bx(chassis, 0.5, 0.26, 0.4, [0, 1.35, 0.2], steelPaint); // transmission
  bx(chassis, 0.4, 0.22, 0.3, [0.2, 1.36, 1.2], "#1e4aa0"); // battery
  // drive shaft
  tube([0, 0.95, 1.05], [0, 0.95, -1.05], 0.05, steelPaint);
  for (const z of [1.0, -1.0]) bx(chassis, 0.14, 0.14, 0.14, [0, 0.95, z], chromePaint);

  // ---- axles, links, shocks
  for (const [, s0, z0] of wheels) {
    if (s0 < 0) continue;
    const sgn = Math.sign(z0);
    bx(chassis, 2.4, 0.16, 0.16, [0, CY, z0], steelPaint);
    b.part(new THREE.SphereGeometry(0.27, 8, 6), steelPaint, { bone: chassis, at: [0, CY, z0], scale: [1, 1, 0.85] });
    cyl(chassis, 0.17, 0.17, 0.06, 10, [0, CY, z0 + sgn * 0.22], [0, 0, 1], goldPaint);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      cyl(chassis, 0.016, 0.016, 0.03, 6, [0.13 * Math.cos(a), CY + 0.13 * Math.sin(a), z0 + sgn * 0.26], [0, 0, 1], chromePaint);
    }
    // tie rod
    tube([-1.0, 0.78, z0 + sgn * 0.3], [1.0, 0.78, z0 + sgn * 0.3], 0.03, steelPaint);
    for (const s of [1, -1]) {
      cyl(chassis, 0.2, 0.2, 0.26, 10, [s * 0.98, CY, z0], [1, 0, 0], goldPaint);
      const dz = -sgn * 0.9;
      tube([s * 0.5, 0.8, z0], [s * 0.55, 1.38, z0 + dz], 0.04, steelPaint);
      tube([s * 0.3, 0.98, z0], [s * 0.4, 1.5, z0 + dz * 0.85], 0.035, steelPaint);
      bx(chassis, 0.12, 0.12, 0.12, [s * 0.55, 1.38, z0 + dz], chromePaint);
    }
  }
  for (const [, s, z0] of wheels) {
    for (const dz of [-0.2, 0.2]) {
      const lo: V = [s * 0.98, 0.98, z0 + dz];
      const hi: V = [s * 0.64, 1.64, z0 + dz * 0.45];
      tube(lo, lerpV(lo, hi, 0.55), 0.055, steelPaint);
      tube(lerpV(lo, hi, 0.5), hi, 0.03, chromePaint);
      b.sweep(coil(lo, hi, 0.085, 6), 0.022, { bone: chassis, color: SPRING, sides: 4 });
      bx(chassis, 0.12, 0.08, 0.12, hi, goldPaint);
      bx(chassis, 0.12, 0.08, 0.12, lo, goldPaint);
    }
  }

  // ---- tub / body
  bx(chassis, 1.9, 0.6, 4.1, [0, 2.05, 0.05], bodyPaint);
  // cab (side profile extrude)
  b.extrude(
    [
      [-0.95, 0],
      [0.6, 0],
      [0.6, 0.25],
      [0.25, 0.85],
      [-0.7, 0.85],
      [-0.95, 0.6],
    ],
    { at: [0, 2.35, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.8, color: bodyPaint, bone: chassis },
  );
  // windshield and rear glass
  plane(chassis, 1.6, 0.6, [0, 2.9 + 0.504 * 0.014, 0.425 + 0.863 * 0.014], [0, 0.504, 0.863], GLASS);
  plane(chassis, 1.2, 0.45, [0, 2.7, -0.962], [0, 0, -1], GLASS);
  // sides: windows, lettering, flames
  for (const s of [1, -1]) {
    plane(chassis, 1.2, 0.4, [s * 0.912, 2.935, -0.14], [s, 0, 0], s > 0 ? WIN_L : WIN_R);
    plane(chassis, 1.45, 0.35, [s * 0.912, 2.55, -0.2], [s, 0, 0], NAME);
    plane(chassis, 4.0, 0.45, [s * 0.962, 2.105, 0.05], [s, 0, 0], s > 0 ? FLAME_L : FLAME_R);
    // mirrors
    tube([s * 0.9, 2.85, 0.45], [s * 1.03, 2.95, 0.45], 0.02, steelPaint);
    bx(chassis, 0.06, 0.22, 0.14, [s * 1.07, 2.97, 0.45], chromePaint);
    // underglow strips
    glow(bx(chassis, 0.05, 0.05, 3.4, [s * 0.975, 1.8, 0.1], "#37e6ff"), 1.3);
    // bed walls
    bx(chassis, 0.12, 0.4, 0.95, [s * 0.89, 2.55, -1.425], bodyPaint);
    // exhaust stacks
    cyl(chassis, 0.07, 0.07, 1.2, 8, [s * 0.7, 2.95, -1.04], [0, 1, 0], chromePaint);
    cyl(chassis, 0.1, 0.1, 0.06, 8, [s * 0.7, 2.45, -1.04], [0, 1, 0], goldPaint);
    cyl(chassis, 0.1, 0.1, 0.06, 8, [s * 0.7, 3.0, -1.04], [0, 1, 0], goldPaint);
    cyl(chassis, 0.07, 0.12, 0.12, 8, [s * 0.7, 3.6, -1.04], [0, 1, 0], chromePaint);
    glow(b.part(new THREE.ConeGeometry(0.12, 0.55, 6), "#ff5a10", { bone: chassis, at: [s * 0.7, 3.92, -1.04] }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.075, 0.4, 6), "#ffc22a", { bone: chassis, at: [s * 0.7, 3.88, -1.04] }), 1.8);
    glow(b.part(new THREE.ConeGeometry(0.035, 0.24, 6), "#fff6a0", { bone: chassis, at: [s * 0.7, 3.84, -1.04] }), 2);
    // tail lights
    glow(bx(chassis, 0.3, 0.22, 0.06, [s * 0.7, 2.1, -2.03], "#ff3b3b"), 1.4);
    // roll bar
    tube([s * 0.8, 2.39, -1.35], [s * 0.8, 3.1, -1.35], 0.045, chromePaint);
  }
  b.sweep(
    polyline([
      [0.8, 3.1, -1.35],
      [0.8, 3.15, -1.35],
      [-0.8, 3.15, -1.35],
      [-0.8, 3.1, -1.35],
    ]),
    0.045,
    { bone: chassis, color: chromePaint, sides: 4 },
  );
  tube([0.8, 2.4, -1.35], [-0.8, 3.1, -1.35], 0.03, chromePaint);
  tube([-0.8, 2.4, -1.35], [0.8, 3.1, -1.35], 0.03, chromePaint);

  // bed: floor, tailgate, crates
  b.part(tileBox([1.66, 0.04, 0.95], PLANKS, 0.04), "#ffffff", { bone: chassis, at: [0, 2.37, -1.425], texture: PLANKS });
  bx(chassis, 1.9, 0.4, 0.1, [0, 2.55, -1.95], bodyPaint);
  plane(chassis, 0.68, 0.36, [0, 2.55, -2.012], [0, 0, -1], PLATE);
  b.part(tileBox([0.5, 0.5, 0.5], PLANKS, 0.04), "#ffffff", { bone: chassis, at: [-0.3, 2.64, -1.55], texture: PLANKS, rotation: [0, 14, 0] });
  b.part(tileBox([0.4, 0.4, 0.4], PLANKS, 0.04), "#ffffff", { bone: chassis, at: [0.35, 2.59, -1.55], texture: PLANKS, rotation: [0, -9, 0] });

  // front: grille, lights, bumper, bull bar
  plane(chassis, 1.8, 0.6, [0, 2.3, 2.112], [0, 0, 1], GRILLE);
  for (const s of [1, -1]) {
    glow(bx(chassis, 0.3, 0.2, 0.06, [s * 0.675, 2.425, 2.15], "#fff6b0", { rotation: [0, 0, s * 12] }), 1.5);
    tube([s * 0.35, 1.95, 2.3], [s * 0.35, 2.5, 2.3], 0.045, chromePaint);
    tube([s * 0.35, 1.95, 2.3], [s * 0.35, 2.1, 2.14], 0.03, chromePaint);
    cyl(chassis, 0.05, 0.05, 0.1, 8, [s * 0.9, 1.8, 2.4], [0, 0, 1], goldPaint);
  }
  tube([-0.35, 2.5, 2.3], [0.35, 2.5, 2.3], 0.045, chromePaint);
  bx(chassis, 2.0, 0.28, 0.22, [0, 1.8, 2.25], chromePaint);
  bx(chassis, 0.4, 0.16, 0.12, [0, 1.8, 2.4], steelPaint); // winch
  cyl(chassis, 0.07, 0.07, 0.34, 8, [0, 1.8, 2.43], [1, 0, 0], goldPaint);
  bx(chassis, 1.9, 0.22, 0.16, [0, 1.9, -2.08], chromePaint); // rear bumper
  bx(chassis, 0.2, 0.14, 0.16, [0, 1.74, -2.14], steelPaint); // hitch

  // visor, roof lights, vents, antenna
  bx(chassis, 1.84, 0.28, 0.46, [0, 3.34, 0.38], bodyPaint);
  plane(chassis, 1.2, 0.29, [0, 3.34, 0.612], [0, 0, 1], NAME);
  for (const x of [-0.63, -0.21, 0.21, 0.63]) {
    bx(chassis, 0.32, 0.16, 0.14, [x, 3.56, 0.45], steelPaint);
    glow(bx(chassis, 0.28, 0.12, 0.05, [x, 3.56, 0.53], "#fffbe0"), 1.6);
  }
  bx(chassis, 0.5, 0.05, 0.3, [0, 3.225, -0.35], steelPaint);
  tube([-0.8, 3.2, -0.8], [-0.9, 3.95, -0.95], 0.015, chromePaint);
  bx(chassis, 0.08, 0.08, 0.08, [-0.9, 3.97, -0.95], "#ff8a1c");
  bx(chassis, 0.22, 0.12, 0.02, [-0.8, 3.86, -0.95], "#ffe14a");

  // ---- hood and blown engine
  bx(hood, 1.8, 0.25, 1.55, [0, 2.475, 1.325], bodyPaint);
  bx(hood, 0.7, 0.3, 0.7, [0, 2.75, 1.45], steelPaint);
  bx(hood, 0.5, 0.12, 0.5, [0, 2.96, 1.5], chromePaint);
  bx(hood, 0.36, 0.03, 0.36, [0, 3.035, 1.5], "#08080e");
  for (const x of [-0.31, 0.31])
    for (const z of [1.25, 1.65]) cyl(hood, 0.035, 0.04, 0.12, 6, [x, 2.97, z], [0, 1, 0], chromePaint);
  cyl(hood, 0.15, 0.15, 0.06, 10, [0, 2.75, 1.83], [0, 0, 1], chromePaint);
  cyl(hood, 0.05, 0.05, 0.08, 6, [0, 2.75, 1.87], [0, 0, 1], goldPaint);
  for (const x of [-0.8, 0.8])
    for (const z of [0.72, 2.0]) cyl(hood, 0.03, 0.03, 0.05, 6, [x, 2.61, z], [0, 1, 0], chromePaint);

  // ---- dirt arena pad
  b.part(new THREE.BoxGeometry(6.2, 0.07, 8.0), dirtTop, { bone: chassis, at: [0, -0.035, 1.0] });

  const mound = (x: number, z: number, w: number) => {
    for (let i = 0; i < 3; i++) bx(chassis, w * (1 - 0.28 * i), 0.22, w * (1 - 0.28 * i), [x, 0.11 + 0.22 * i, z], moundPaint);
  };
  mound(-2.3, -2.3, 1.1);
  mound(2.4, 4.3, 1.0);
  mound(-2.4, 4.4, 0.7);

  // dust puffs kicked up behind the rear tyres
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const w = 0.42 - i * 0.07;
      bx(chassis, w, w, w, [s * (WX + 0.1 * (i % 2 ? 1 : -1)), 0.2 + i * 0.2, -2.3 - i * 0.28], DIRT[3 + (i % 2)], {
        rotation: [0, 20 + i * 25, 0],
      });
    }
  // wooden curb round the back and sides of the pad
  b.part(tileBox([6.2, 0.2, 0.14], PLANKS, 0.04), "#ffffff", { bone: chassis, at: [0, 0.1, -2.93], texture: PLANKS });
  for (const s of [1, -1])
    b.part(tileBox([0.14, 0.2, 7.8], PLANKS, 0.04), "#ffffff", { bone: chassis, at: [s * 3.03, 0.1, 1.0], texture: PLANKS });

  // flag
  tube([-2.3, 0.6, -2.3], [-2.3, 3.0, -2.3], 0.035, chromePaint);
  bx(chassis, 0.1, 0.1, 0.1, [-2.3, 3.05, -2.3], "#ffcf2a");
  b.part(tileBox([0.9, 0.6, 0.04], CHECK, 0.075), "#ffffff", {
    bone: chassis,
    at: [-1.83, 2.68, -2.3],
    texture: CHECK,
  });

  // tyre stack
  for (let i = 0; i < 3; i++) {
    cyl(chassis, 0.5, 0.5, 0.3, 12, [2.45 + (i % 2) * 0.04, 0.15 + 0.3 * i, -2.2], [0, 1, 0], tireStackPaint, { rotation: [0, i * 17, 0] });
  }
  cyl(chassis, 0.22, 0.22, 0.02, 10, [2.47, 0.91, -2.2], [0, 1, 0], "#08080e");

  // cones
  for (const [x, z] of [
    [-2.3, 2.9],
    [-1.7, 4.3],
    [2.35, 3.0],
  ]) {
    b.part(new THREE.ConeGeometry(0.2, 0.55, 4), conePaint, { bone: chassis, at: [x, 0.275, z] });
    bx(chassis, 0.42, 0.04, 0.42, [x, 0.02, z], "#e05a10");
  }

  // crushed car
  const yaw = 8;
  const CX = 0.2;
  const CZ = 3.95;
  const carPt = (lx: number, ly: number, lz: number): V => {
    const a = (yaw * Math.PI) / 180;
    return [CX + lx * Math.cos(a) + lz * Math.sin(a), ly, CZ - lx * Math.sin(a) + lz * Math.cos(a)];
  };
  const carBox = (w: number, h: number, d: number, lx: number, ly: number, lz: number, color: ColorInput) =>
    bx(chassis, w, h, d, carPt(lx, ly, lz), color, { rotation: [0, yaw, 0] });
  carBox(1.5, 0.28, 1.95, 0, 0.2, 0, carPaint);
  carBox(1.4, 0.16, 0.6, 0, 0.42, 0.55, carPaint);
  carBox(1.4, 0.18, 0.5, 0, 0.43, -0.65, carPaint);
  carBox(1.28, 0.16, 0.85, 0, 0.5, -0.05, carPaint);
  carBox(1.3, 0.05, 0.7, 0, 0.6, -0.05, "#4a6a98");
  carBox(1.1, 0.03, 0.3, 0, 0.51, 0.62, "#2a3a5c");
  carBox(1.6, 0.08, 0.08, 0, 0.14, 1.0, chromePaint);
  carBox(1.6, 0.08, 0.08, 0, 0.14, -1.0, chromePaint);
  for (const sx of [1, -1])
    for (const sz of [0.62, -0.62]) {
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 8), tireStackPaint, {
        bone: chassis,
        at: carPt(sx * 0.8, 0.2, sz),
        dir: [Math.cos((yaw * Math.PI) / 180), 0, -Math.sin((yaw * Math.PI) / 180)],
      });
    }
  glow(carBox(0.2, 0.08, 0.04, 0.45, 0.4, 1.0, "#ffe066"), 0.8);

  // pebbles and tufts
  const stones: { size: V; at: V; yaw: number }[] = [];
  const stones2: { size: V; at: V; yaw: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const x = (r() - 0.5) * 5.6;
    const z = -2.7 + r() * 7.4;
    if (Math.abs(x) < 2.1 && z > -2.4 && z < 2.4) continue;
    if (Math.abs(x - CX) < 1.2 && z > 2.8 && z < 5.0) continue;
    const s = 0.05 + r() * 0.08;
    (i % 2 ? stones : stones2).push({ size: [s * 1.4, s, s * 1.1], at: [x, s / 2, z], yaw: r() * 3 });
  }
  b.part(mergeBoxes(stones), "#6b7288", { bone: chassis, at: [0, 0, 0] });
  b.part(mergeBoxes(stones2), "#454a5c", { bone: chassis, at: [0, 0, 0] });
  const tufts: { size: V; at: V; yaw: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const side = Math.floor(r() * 4);
    let x = 0;
    let z = 0;
    if (side === 0) {
      x = 2.95;
      z = -2.9 + r() * 7.8;
    } else if (side === 1) {
      x = -2.95;
      z = -2.9 + r() * 7.8;
    } else if (side === 2) {
      x = (r() - 0.5) * 5.8;
      z = -2.88;
    } else {
      x = (r() - 0.5) * 5.8;
      z = 4.88;
    }
    const h = 0.1 + r() * 0.14;
    tufts.push({ size: [0.07, h, 0.07], at: [x, h / 2, z], yaw: r() * 3 });
  }
  b.part(mergeBoxes(tufts), "#3c8a2c", { bone: chassis, at: [0, 0, 0] });

  return b.root;
}
