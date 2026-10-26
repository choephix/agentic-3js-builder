```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "Firewatch-style flat-colour diorama: a rust-red research cabin with glowing windows, radio mast, dish, weather screen, fuel drums, tent, snowmobile and sled on a floating island of snow and ice.",
};

// ---- palette (Firewatch: hot rust / mustard against cool teal and violet shadows) ----
const RUST = "#c4492b";
const RUST_D = "#8e2f23";
const CREAM = "#f3e2c0";
const TEAL = "#2f7380";
const TEAL_D = "#1f4a55";
const MUSTARD = "#e9a23b";
const ORANGE = "#ee7b3a";
const ORANGE_D = "#b4502e";
const DARKWOOD = "#4a2f2a";
const WOOD = "#b9824d";
const ROOF = "#3d3a52";
const STEEL = "#6f7f93";
const STEEL_D = "#47546a";
const ICE = "#8fd0e0";
const ICE_D = "#4c8fb0";
const SNOW = "#f7f3ee";
const SNOW_WARM = "#ffd2bd";
const SNOW_SHADE = "#aebbe0";
const BLACK = "#2a2430";
const GLOWY = "#ffc65a";
const RED = "#d9382c";
const SMOKE = "#ebe0e8";

const TOP = 0.34; // snow surface height

export default function build() {
  const b = createBuilder({ name: "arctic_outpost" });
  const R = rng(11);

  // ---- paints ----
  const SNOWP = paint((p, n) => {
    const warm = smoothstep(-1.5, 3, p.x) * 0.55 + 0.3 * noise(p, 1.4, 3);
    const lit = mix(mix(SNOW, SNOW_WARM, warm), "#ffffff", 0.2 * smoothstep(0.8, 1, n.y));
    return mix(SNOW_SHADE, lit, smoothstep(-0.1, 0.7, n.y));
  });
  const WALL = paint((p, n) => {
    const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
    const k = Math.floor(u / 0.14);
    const f = u / 0.14 - k;
    const h = (Math.abs(k * 7919) % 13) / 13;
    let c = mix(RUST, RUST_D, h * 0.35 + 0.45 * smoothstep(TOP + 0.5, TOP + 0.1, p.y));
    if (f < 0.05) c = mix(c, "#5a1f1a", 0.7);
    return mix(c, "#ffb08a", 0.18 * smoothstep(0.3, 1, n.y));
  });
  const ROOFP = paint((_p, n) => mix("#2a2840", ROOF, smoothstep(-0.2, 0.8, n.y)));
  const TENTP = paint((_p, n) => mix(ORANGE_D, ORANGE, smoothstep(0.1, 0.8, n.y)));
  const BASEP = paint((p, n) => {
    if (n.y > 0.6 || p.y > TOP - 0.04) return SNOWP;
    const t = smoothstep(0, TOP, p.y) + 0.25 * (noise(p, 0.3, 5) - 0.5);
    const band = Math.floor(p.y / 0.045) % 2 ? 0.12 : 0;
    return mix(mix("#2d3a66", ICE_D, smoothstep(0, 0.5, t)), ICE, Math.min(1, smoothstep(0.4, 1, t) + band));
  });
  const WOODP = paint((p, n) => mix(DARKWOOD, WOOD, 0.5 + 0.5 * (noise(p, 0.1, 2) - 0.5) + 0.3 * n.y));

  // ---- textures ----
  const WINDOW = svg(
    `<svg viewBox="0 0 64 64"><defs><radialGradient id="g" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff0a8"/><stop offset="1" stop-color="#f29a38"/></radialGradient></defs>
    <rect width="64" height="64" fill="url(#g)"/>
    <path d="M0 0 L17 0 Q12 24 18 42 L0 46Z" fill="#c4492b" opacity=".85"/>
    <path d="M64 0 L47 0 Q52 24 46 42 L64 46Z" fill="#c4492b" opacity=".85"/>
    <path d="M32 0V64M0 34H64" stroke="#4a2f2a" stroke-width="4"/>
    <rect width="64" height="64" fill="none" stroke="#4a2f2a" stroke-width="6"/></svg>`,
    { size: 128 },
  );
  let slats = "";
  for (let i = 0; i < 8; i++)
    slats += `<rect x="0" y="${i * 8}" width="64" height="5" fill="#f4eee4"/><rect x="0" y="${i * 8 + 5}" width="64" height="3" fill="#7d8fb5"/>`;
  const LOUVER = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#7d8fb5"/>${slats}<rect width="64" height="64" fill="none" stroke="#dcd3c6" stroke-width="5"/></svg>`,
    { size: 96 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 160 64"><rect width="160" height="64" fill="#1f4a55"/>
    <rect x="4" y="4" width="152" height="56" fill="none" stroke="#f3e2c0" stroke-width="3"/>
    <text x="80" y="31" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#f3e2c0">ARCTIC STN</text>
    <text x="80" y="53" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#e9a23b">No. 7  ·  -41°</text></svg>`,
    { size: 256 },
  );
  let flake = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 60;
    flake += `<g transform="rotate(${a} 48 28)"><path d="M48 28V8" stroke="#f7f3ee" stroke-width="3"/><path d="M42 14L48 20L54 14" stroke="#f7f3ee" stroke-width="2.4" fill="none"/></g>`;
  }
  const FLAG = svg(
    `<svg viewBox="0 0 96 64"><rect width="96" height="64" fill="#d9382c"/><rect y="52" width="96" height="12" fill="#8e2f23"/>${flake}<circle cx="48" cy="28" r="4" fill="#e9a23b"/></svg>`,
    { size: 128 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#c99a5b"/>
    <path d="M0 16H64M0 32H64M0 48H64" stroke="#8a5f32" stroke-width="2"/>
    <rect x="2" y="2" width="60" height="60" fill="none" stroke="#6b4423" stroke-width="4"/>
    <path d="M4 4L60 60M60 4L4 60" stroke="#8a5f32" stroke-width="3"/>
    <rect x="14" y="22" width="36" height="20" fill="#f3e2c0"/>
    <text x="32" y="37" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#8e2f23">ICE</text></svg>`,
    { size: 96 },
  );

  // ---- helpers ----
  const box = (size: number[], color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, flat: true, ...opts });
  const ball = (r: number, color: any, at: number[], scale?: number[], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 3)), color, { at, scale, flat: true });
  const rod = (a: number[], c: number[], r: number, color: any) => b.rod(a, c, r, color, { sides: 5 });
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const Y = new THREE.Vector3(0, 1, 0);
  const rig = (ox: number, oz: number, yaw: number) => {
    const c = Math.cos((yaw * Math.PI) / 180);
    const s = Math.sin((yaw * Math.PI) / 180);
    const p = (x: number, y: number, z: number) => [ox + x * c + z * s, TOP + y, oz - x * s + z * c];
    const lbox = (size: number[], color: any, l: number[], tilt = 0, opts: any = {}) => {
      const q = new THREE.Quaternion().setFromAxisAngle(Y, (yaw * Math.PI) / 180);
      q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((tilt * Math.PI) / 180, 0, 0)));
      return box(size, color, p(l[0], l[1], l[2]), { quat: q, ...opts });
    };
    return { p, lbox };
  };

  // =========================================================== base island
  b.lathe(
    [
      [0, 0],
      [3.3, 0],
      [3.7, 0.08],
      [3.85, 0.2],
      [3.8, 0.3],
      [3.4, TOP],
      [0, TOP],
    ],
    { at: [0, 0, 0], segments: 14, color: BASEP },
  );
  const drifts = [
    [-0.5, -1.4, 1.3, 0.22, 0.5],
    [0.95, -0.55, 0.5, 0.2, 0.55],
    [-1.95, -0.1, 0.45, 0.22, 0.65],
    [-2.9, 1.2, 0.6, 0.26, 0.55],
    [2.7, -1.8, 0.6, 0.25, 0.5],
    [-1.0, -2.6, 0.9, 0.28, 0.5],
    [2.9, 1.6, 0.5, 0.22, 0.6],
    [0.2, 3.0, 0.8, 0.2, 0.4],
    [-2.3, 2.7, 0.6, 0.2, 0.4],
  ];
  for (const [x, z, sx, sy, sz] of drifts) ball(1, SNOWP, [x, TOP + sy * 0.3, z], [sx, sy, sz], 9);

  // =========================================================== cabin
  const CX = -0.5,
    CZ = -0.3,
    W = 2.4,
    D = 1.7,
    FLOOR = TOP + 0.15,
    WH = 1.2,
    WT = FLOOR + WH;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      box([0.16, 0.2, 0.16], DARKWOOD, [CX + sx * (W / 2 - 0.12), TOP + 0.05, CZ + sz * (D / 2 - 0.12)]);
  box([W, WH, D], WALL, [CX, FLOOR + WH / 2, CZ]);
  box([W + 0.1, 0.06, D + 0.1], DARKWOOD, [CX, FLOOR + 0.03, CZ]); // base trim
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box([0.1, WH, 0.1], CREAM, [CX + sx * (W / 2), FLOOR + WH / 2, CZ + sz * (D / 2)]); // corner boards
  // gable attic
  b.extrude(
    [
      [-0.85, 0],
      [0.85, 0],
      [0, 0.7],
    ],
    { at: [CX, WT, CZ], x: [0, 0, 1], thickness: W - 0.1, color: WALL },
  );
  // roof panels + snow
  const rLen = Math.hypot(0.85, 0.7);
  const ang = (Math.atan2(0.7, 0.85) * 180) / Math.PI;
  const dz = 0.85 / rLen,
    dy = 0.7 / rLen;
  for (const s of [1, -1]) {
    const cz = CZ + s * (dz * 0.55 + dy * 0.04);
    const cy = WT + 0.7 - dy * 0.55 + dz * 0.04;
    box([W + 0.3, 0.08, 1.3], ROOFP, [CX, cy, cz], { rotation: [s * (90 - ang) * 0 + s * (ang * 0 + Math.atan2(dy, dz) * 180 / Math.PI), 0, 0] });
    box([W + 0.15, 0.12, 1.12], SNOWP, [CX, cy + dz * 0.1, cz + s * dy * 0.1 - s * 0.03], {
      rotation: [s * ((Math.atan2(dy, dz) * 180) / Math.PI), 0, 0],
    });
  }
  box([W + 0.2, 0.12, 0.3], SNOWP, [CX, WT + 0.76, CZ]);
  // chimney + smoke
  box([0.3, 0.75, 0.3], RUST_D, [CX - 0.8, WT + 0.85, CZ - 0.2]);
  box([0.38, 0.06, 0.38], DARKWOOD, [CX - 0.8, WT + 1.25, CZ - 0.2]);
  box([0.36, 0.05, 0.36], SNOWP, [CX - 0.8, WT + 1.3, CZ - 0.2]);
  [
    [0, 1.5, 0.12],
    [-0.1, 1.78, 0.17],
    [-0.28, 2.1, 0.23],
    [-0.52, 2.5, 0.3],
  ].forEach(([ox, oy, r]) => b.part(new THREE.IcosahedronGeometry(r, 0), SMOKE, { at: [CX - 0.8 + ox, WT + oy - 0.2, CZ - 0.2], flat: true }));

  // front windows with shutters
  const FZ = CZ + D / 2;
  for (const wx of [-0.6, 0.0]) {
    const x = CX + wx - 0.2;
    box([0.62, 0.62, 0.04], CREAM, [x, FLOOR + 0.72, FZ + 0.02]);
    glow(decal(0.5, 0.5, WINDOW, [x, FLOOR + 0.72, FZ + 0.045], [0, 0, 1]), 1.2);
    for (const s of [1, -1]) box([0.2, 0.56, 0.04], TEAL, [x + s * 0.42, FLOOR + 0.72, FZ + 0.03]);
    box([0.7, 0.06, 0.12], DARKWOOD, [x, FLOOR + 0.4, FZ + 0.06]); // sill
    box([0.7, 0.05, 0.12], SNOWP, [x, FLOOR + 0.44, FZ + 0.06]);
  }
  // side window (+x)
  box([0.04, 0.62, 0.62], CREAM, [CX + W / 2 + 0.02, FLOOR + 0.72, CZ + 0.1]);
  glow(decal(0.5, 0.5, WINDOW, [CX + W / 2 + 0.045, FLOOR + 0.72, CZ + 0.1], [1, 0, 0]), 1.2);
  // door
  const DX = CX + 0.75;
  box([0.66, 1.06, 0.04], CREAM, [DX, FLOOR + 0.55, FZ + 0.02]);
  box([0.54, 0.98, 0.05], TEAL_D, [DX, FLOOR + 0.51, FZ + 0.04]);
  box([0.4, 0.34, 0.02], TEAL, [DX, FLOOR + 0.75, FZ + 0.075]);
  box([0.4, 0.34, 0.02], TEAL, [DX, FLOOR + 0.3, FZ + 0.075]);
  ball(0.03, MUSTARD, [DX + 0.18, FLOOR + 0.5, FZ + 0.09], undefined, 6);
  // lantern
  rod([DX - 0.42, FLOOR + 1.05, FZ + 0.05], [DX - 0.42, FLOOR + 1.05, FZ + 0.25], 0.012, BLACK);
  glow(ball(0.065, GLOWY, [DX - 0.42, FLOOR + 0.98, FZ + 0.25], undefined, 6), 1.6);
  box([0.1, 0.02, 0.1], BLACK, [DX - 0.42, FLOOR + 1.07, FZ + 0.25]);
  // porch
  box([1.2, 0.1, 0.6], WOODP, [DX, FLOOR - 0.05, FZ + 0.3]);
  box([0.9, 0.08, 0.28], WOODP, [DX, TOP + 0.05, FZ + 0.74]);
  box([1.2, 0.05, 0.6], SNOWP, [DX + 0.05, FLOOR + 0.0, FZ + 0.34], { scale: [0.9, 1, 0.7] });
  for (const s of [-1, 1]) {
    rod([DX + s * 0.58, FLOOR, FZ + 0.58], [DX + s * 0.58, FLOOR + 0.5, FZ + 0.58], 0.025, CREAM);
  }
  rod([DX - 0.58, FLOOR + 0.5, FZ + 0.58], [DX + 0.58, FLOOR + 0.5, FZ + 0.58], 0.02, CREAM);
  rod([DX - 0.58, FLOOR + 0.5, FZ + 0.58], [DX - 0.58, FLOOR + 0.5, FZ + 0.0], 0.02, CREAM);
  // antenna wire from mast to cabin
  rod([1.9, TOP + 2.7, -1.0], [CX + W / 2 + 0.05, WT + 0.2, CZ - 0.4], 0.006, BLACK);

  // firewood stack
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 4 - row; i++)
      cyl(0.05, 0.05, 0.55, 6, i % 2 ? WOOD : "#a06a3a", [1.0 + (i - (3 - row) / 2 + 0.5) * 0.1 + 0.15, TOP + 0.05 + row * 0.085, -0.85], {
        rotation: [90, 0, 0],
      });
  box([0.5, 0.05, 0.6], SNOWP, [1.15, TOP + 0.28, -0.85], { scale: [0.8, 1, 1] });

  // =========================================================== sign
  for (const s of [-1, 1]) rod([-0.95 + s * 0.42, TOP - 0.02, 1.45], [-0.95 + s * 0.42, TOP + 0.85, 1.45], 0.03, DARKWOOD);
  box([0.96, 0.4, 0.05], DARKWOOD, [-0.95, TOP + 0.65, 1.45]);
  decal(0.88, 0.32, SIGN, [-0.95, TOP + 0.65, 1.48], [0, 0, 1]);
  box([1.0, 0.05, 0.1], SNOWP, [-0.95, TOP + 0.88, 1.45]);

  // boardwalk + footprints
  for (let i = 0; i < 7; i++) box([0.55, 0.04, 0.15], i % 2 ? WOOD : DARKWOOD, [DX, TOP + 0.015, 1.3 + i * 0.2 + 0.1]);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    cyl(0.06, 0.06, 0.01, 6, SNOW_SHADE, [-1.6 + t * 1.3 + (i % 2) * 0.08, TOP + 0.003, 2.85 - t * 0.5 + (i % 2) * 0.1], {
      scale: [1, 1, 1.8],
      rotation: [0, -20, 0],
    });
  }

  // =========================================================== radio mast
  const MX = 1.9,
    MZ = -1.0,
    MH = 3.3,
    SEG = 6;
  const corner = (lvl: number, k: number) => {
    const h = lvl / SEG;
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const r = 0.3 * (1 - h) + 0.07 * h;
    return [MX + Math.cos(a) * r, TOP + h * MH, MZ + Math.sin(a) * r];
  };
  box([0.9, 0.14, 0.9], "#8d93a8", [MX, TOP + 0.03, MZ]);
  for (let lvl = 0; lvl <= SEG; lvl++)
    for (let k = 0; k < 4; k++) {
      const col = lvl % 2 ? CREAM : RED;
      if (lvl < SEG) {
        rod(corner(lvl, k), corner(lvl + 1, k), 0.025, col);
        rod(corner(lvl, k), corner(lvl + 1, (k + 1) % 4), 0.011, STEEL_D);
      }
      if (lvl > 0) rod(corner(lvl, k), corner(lvl, (k + 1) % 4), 0.011, STEEL_D);
    }
  box([0.62, 0.04, 0.62], STEEL_D, [MX, TOP + 1.65, MZ]); // platform
  box([0.62, 0.04, 0.62], SNOWP, [MX, TOP + 1.69, MZ], { scale: [0.8, 1, 0.8] });
  rod([MX, TOP + MH, MZ], [MX, TOP + MH + 0.7, MZ], 0.012, STEEL);
  glow(ball(0.08, RED, [MX, TOP + MH + 0.05, MZ], undefined, 6), 2);
  // yagi antenna
  rod([MX - 0.5, TOP + 2.7, MZ], [MX + 0.5, TOP + 2.7, MZ], 0.014, STEEL);
  for (let i = 0; i < 5; i++) {
    const x = MX - 0.42 + i * 0.2;
    rod([x, TOP + 2.7, MZ - 0.17 + i * 0.015], [x, TOP + 2.7, MZ + 0.17 - i * 0.015], 0.008, CREAM);
  }
  // guy wires
  for (let i = 0; i < 3; i++) {
    const a = 0.4 + (i * Math.PI * 2) / 3;
    const gx = MX + Math.cos(a) * 1.2,
      gz = MZ + Math.sin(a) * 1.2;
    rod([MX, TOP + 2.3, MZ], [gx, TOP + 0.03, gz], 0.007, BLACK);
    box([0.08, 0.1, 0.08], STEEL_D, [gx, TOP + 0.02, gz]);
  }

  // =========================================================== satellite dish
  const DXc = 2.35,
    DZc = 0.9;
  cyl(0.04, 0.05, 0.8, 6, STEEL, [DXc, TOP + 0.4, DZc]);
  cyl(0.15, 0.17, 0.05, 8, STEEL_D, [DXc, TOP + 0.03, DZc]);
  const axis = new THREE.Vector3(-0.3, 0.8, 0.5).normalize();
  const dc = new THREE.Vector3(DXc, TOP + 0.9, DZc);
  b.lathe(
    [
      [0, 0],
      [0.2, 0.02],
      [0.4, 0.08],
      [0.52, 0.135],
      [0.52, 0.155],
      [0.4, 0.1],
      [0.2, 0.04],
      [0, 0.02],
    ],
    { at: dc, axis: [axis.x, axis.y, axis.z], segments: 12, color: "#ece6dc" },
  );
  const tip = dc.clone().addScaledVector(axis, 0.5);
  rod([dc.x, dc.y, dc.z], [tip.x, tip.y, tip.z], 0.012, STEEL);
  ball(0.04, MUSTARD, [tip.x, tip.y, tip.z], undefined, 6);

  // =========================================================== weather screen
  const SX = -2.5,
    SZ = 0.4;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) rod([SX + sx * 0.17, TOP, SZ + sz * 0.13], [SX + sx * 0.17, TOP + 0.5, SZ + sz * 0.13], 0.02, "#dcd3c6");
  b.part(new THREE.BoxGeometry(0.44, 0.36, 0.34), "#ffffff", { at: [SX, TOP + 0.68, SZ], texture: LOUVER });
  box([0.54, 0.04, 0.44], "#f4eee4", [SX, TOP + 0.88, SZ], { rotation: [0, 0, 4] });
  box([0.5, 0.04, 0.4], SNOWP, [SX, TOP + 0.92, SZ], { rotation: [0, 0, 4] });
  ball(0.025, MUSTARD, [SX + 0.1, TOP + 0.68, SZ + 0.18], undefined, 5);

  // =========================================================== anemometer (on ridge)
  const AX = CX + 0.9,
    AY = WT + 0.82;
  rod([AX, AY - 0.1, CZ], [AX, AY + 0.55, CZ], 0.02, STEEL);
  ball(0.04, STEEL_D, [AX, AY + 0.58, CZ], undefined, 6);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.4;
    const ex = AX + Math.cos(a) * 0.22,
      ez = CZ + Math.sin(a) * 0.22;
    rod([AX, AY + 0.58, CZ], [ex, AY + 0.58, ez], 0.01, STEEL);
    ball(0.055, ORANGE, [ex, AY + 0.58, ez], undefined, 6);
  }

  // =========================================================== fuel drums
  const drumCols = [MUSTARD, TEAL, RUST];
  [
    [-2.2, -0.9],
    [-2.55, -0.65],
    [-2.4, -1.25],
  ].forEach(([x, z], i) => {
    const c = drumCols[i];
    cyl(0.16, 0.16, 0.42, 10, c, [x, TOP + 0.2, z]);
    for (const y of [0.1, 0.32]) cyl(0.17, 0.17, 0.025, 10, STEEL_D, [x, TOP + y, z]);
    cyl(0.12, 0.12, 0.02, 10, STEEL, [x, TOP + 0.42, z]);
    ball(0.03, BLACK, [x + 0.05, TOP + 0.44, z], undefined, 5);
  });
  cyl(0.16, 0.16, 0.42, 10, ORANGE, [-1.95, TOP + 0.16, -1.55], { rotation: [0, 0, 90] });
  for (const dx of [-0.1, 0.12]) cyl(0.17, 0.17, 0.025, 10, STEEL_D, [-1.95 + dx, TOP + 0.16, -1.55], { rotation: [0, 0, 90] });
  box([0.6, 0.05, 0.5], SNOWP, [-2.4, TOP + 0.45, -0.95], { scale: [0.7, 1, 0.7] });

  // =========================================================== tent
  const TX = -1.6,
    TZ = 2.0;
  b.extrude(
    [
      [-0.55, 0],
      [0.55, 0],
      [0, 0.72],
    ],
    { at: [TX, TOP - 0.01, TZ], x: [1, 0, 0], thickness: 1.3, color: TENTP },
  );
  glow(
    b.extrude(
      [
        [-0.22, 0],
        [0.22, 0],
        [0, 0.46],
      ],
      { at: [TX, TOP - 0.005, TZ + 0.655], x: [1, 0, 0], thickness: 0.02, color: GLOWY },
    ),
    1.1,
  );
  b.extrude(
    [
      [-0.55, 0],
      [0.55, 0],
      [0, 0.72],
    ],
    { at: [TX, TOP - 0.01, TZ + 0.64], x: [1, 0, 0], thickness: 0.02, color: TEAL_D, bevel: 0 },
  );
  glow(
    b.extrude(
      [
        [-0.2, 0],
        [0.2, 0],
        [0, 0.42],
      ],
      { at: [TX, TOP, TZ + 0.652], x: [1, 0, 0], thickness: 0.02, color: GLOWY },
    ),
    1.2,
  );
  rod([TX, TOP + 0.74, TZ - 0.78], [TX, TOP + 0.74, TZ + 0.78], 0.02, DARKWOOD);
  for (const s of [-1, 1]) {
    rod([TX + s * 0.55, TOP, TZ + 0.9], [TX + s * 1.0, TOP, TZ + 1.2], 0.006, BLACK);
    box([0.04, 0.08, 0.04], MUSTARD, [TX + s * 1.0, TOP + 0.03, TZ + 1.2]);
  }
  box([0.5, 0.05, 1.0], SNOWP, [TX, TOP + 0.62, TZ - 0.1], { scale: [0.4, 1, 1] });

  // =========================================================== snowmobile + sled
  const SM = rig(1.4, 2.0, 20);
  SM.lbox([0.3, 0.14, 0.6], BLACK, [0, 0.1, -0.25]);
  SM.lbox([0.44, 0.2, 0.8], RUST, [0, 0.27, -0.05]);
  SM.lbox([0.36, 0.14, 0.42], RUST, [0, 0.3, 0.4], 12);
  SM.lbox([0.28, 0.07, 0.42], BLACK, [0, 0.42, -0.3]);
  SM.lbox([0.12, 0.012, 0.7], MUSTARD, [0, 0.385, 0.0]);
  SM.lbox([0.3, 0.2, 0.02], ICE, [0, 0.5, 0.2], -25);
  SM.lbox([0.4, 0.03, 0.03], BLACK, [0, 0.5, 0.05]);
  SM.lbox([0.04, 0.2, 0.04], BLACK, [0, 0.4, 0.05]);
  for (const s of [-1, 1]) {
    SM.lbox([0.06, 0.03, 0.6], STEEL, [s * 0.22, 0.04, 0.38], -8);
    SM.lbox([0.03, 0.2, 0.03], STEEL_D, [s * 0.2, 0.15, 0.4]);
  }
  glow(ball(0.05, GLOWY, SM.p(0, 0.33, 0.62), undefined, 6), 1.6);
  const sledO = SM.p(0, 0, -1.55);
  const SL = rig(sledO[0], sledO[2], 20);
  SL.lbox([0.5, 0.04, 0.95], WOODP, [0, 0.1, 0]);
  for (const s of [-1, 1]) {
    SL.lbox([0.04, 0.06, 1.0], STEEL_D, [s * 0.26, 0.04, 0]);
    SL.lbox([0.04, 0.05, 0.2], STEEL_D, [s * 0.26, 0.09, 0.55], -35);
  }
  b.part(new THREE.BoxGeometry(0.36, 0.26, 0.36), "#ffffff", { at: SL.p(0, 0.25, -0.22), texture: CRATE, rotation: [0, 20, 0] });
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.3), "#ffffff", { at: SL.p(0, 0.22, 0.2), texture: CRATE, rotation: [0, 12, 0] });
  SL.lbox([0.1, 0.12, 0.1], TEAL, [0.1, 0.42, -0.22]);
  rod(SL.p(0, 0.1, 0.55), SM.p(0, 0.2, -0.45), 0.012, BLACK);
  SL.lbox([0.5, 0.03, 0.4], SNOWP, [0, 0.4, -0.22], 0, { scale: [0.7, 1, 0.7] });

  // =========================================================== flag
  const FXp = 0.75,
    FZp = 2.95;
  rod([FXp, TOP - 0.02, FZp], [FXp, TOP + 1.7, FZp], 0.025, CREAM);
  ball(0.045, MUSTARD, [FXp, TOP + 1.74, FZp], undefined, 6);
  for (const s of [1, -1]) b.part(new THREE.PlaneGeometry(0.6, 0.4), "#ffffff", { at: [FXp + 0.32, TOP + 1.45, FZp + s * 0.004], dir: [0, 0, s], axis: "z", texture: FLAG });
  cyl(0.1, 0.14, 0.1, 6, SNOWP, [FXp, TOP + 0.04, FZp]);

  // =========================================================== ice shards
  const shardSpots = [
    [-0.3, -2.7],
    [3.0, -0.2],
    [-2.9, -0.2],
  ];
  shardSpots.forEach(([cx, cz]) => {
    for (let i = 0; i < 4; i++) {
      const h = 0.35 + R() * 0.55;
      const x = cx + (R() - 0.5) * 0.5;
      const z = cz + (R() - 0.5) * 0.4;
      glow(
        b.part(new THREE.ConeGeometry(0.07 + R() * 0.06, h, 5), i % 2 ? ICE : "#bfeaf2", {
          at: [x, TOP + h / 2 - 0.04, z],
          rotation: [(R() - 0.5) * 30, R() * 90, (R() - 0.5) * 30],
          flat: true,
        }),
        0.45,
      );
    }
  });

  return b.root;
}
```