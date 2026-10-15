// Dungeon props in pixel art: a crumbling brick wall with two lit wall torches, an open treasure chest, three barrels,
// a bone pile with a dropped torch, and a spike trap with an impaled skull. Every surface is a hard 2 cm texel.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import type { Fill as ColorInput } from "../../../../src/context";
import { glow } from "../../../../kits/glow";
import { cellPaint, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, stepped, pick, bayer } from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon dressing: crumbling brick wall with two lit torches, open treasure chest with gold and gems, three barrels, a bone pile with a dropped torch, and a spike trap with an impaled skull.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];

const TEXEL = 0.02;
const F = 0.08; // floor top
const DEG = Math.PI / 180;

const snap = (a: string[]) => a.map((c) => snapColor(c, 32));
const STONE = snap(["#15141c", "#23222d", "#33323f", "#47465a", "#5e5c73", "#7b798f"]);
const WARM = snap(["#2a1614", "#43231a", "#643627", "#8a4e30", "#b46c3c", "#da8d4e"]);
const MOSS = snap(["#101c0e", "#1c3314", "#2c4e1e", "#46782a", "#6ea03a"]);
const WOOD = snap(["#1c0e07", "#341a0d", "#52290f", "#74401c", "#98592a", "#bd7c3e"]);
const WOOD_WARM = snap(["#2a1208", "#4a2410", "#703a16", "#9a5622", "#c47a30", "#e8a050"]);
const IRON = snap(["#101118", "#1d1f2a", "#33364a", "#4f5369", "#767b94", "#a8aec6"]);
const RUST = snap(["#2c1208", "#5a230c", "#8a3c12", "#b8581c"]);
const GOLD = snap(["#3c2406", "#7a4c0e", "#b8821a", "#e8b828", "#fff09a"]);
const BONE = snap(["#3c332a", "#6a5c4c", "#9c8c74", "#cbbfa4", "#ece4cc"]);
const CLOTH = snap(["#2a0810", "#4a1018", "#6e1a22", "#962a2e", "#c0453c"]);
const BLOOD = snap(["#2a0608", "#4e0a10", "#741016"]);
const PLATE = snap(["#0c0d12", "#171921", "#252835", "#383c4e", "#51566c"]);
const TAR = snap(["#0a0806", "#1a1410", "#2e2218", "#4a3824"]);
const CLOTHTORCH = snap(["#3a2a18", "#5c4426", "#82623a", "#a8845a"]);

const mod = (a: number, n: number) => ((a % n) + n) % n;
const clamp = (x: number, lo = 0, hi = 1) => Math.min(Math.max(x, lo), hi);
const h2 = (a: number, b: number, s = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Torch flames sit here; paints warm up the stone and wood around them.
const TORCH_X = 0.78;
const TORCH_FLAME_Y = F + 1.44;
const FLAMES = [new THREE.Vector3(-TORCH_X, TORCH_FLAME_Y, -0.5), new THREE.Vector3(TORCH_X, TORCH_FLAME_Y, -0.5)];
const lightAt = (p: THREE.Vector3) => {
  let l = 0;
  for (const f of FLAMES) l = Math.max(l, Math.max(0, 1 - p.distanceTo(f) / 2.1) ** 1.5);
  return l;
};

// Trap and bone centres for floor blood.
const TX = -0.4;
const TZ = 0.72;

// ---------------------------------------------------------------------------------------------------------------
// Paints

const wallPaint = cellPaint(
  TEXEL,
  (c) => {
    const course = Math.floor(c.v / 8);
    const row = mod(c.v, 8);
    const uu = c.u + mod(course, 2) * 8 + (c.axis === 0 ? 3 : 0);
    const col = Math.floor(uu / 16);
    const within = mod(uu, 16);
    const L = lightAt(c.at);
    const warm = L * 1.25 > c.threshold;
    const ramp = warm ? WARM : STONE;
    if (row === 0 || within === 0) return c.pick(ramp, (0.3 + L * 0.6) / 5);
    let idx = Math.round(2.2 + 2.0 * h2(col, course, c.axis + 1));
    if (row === 7) idx += 1;
    else if (row === 1) idx -= 1;
    const r = c.random(2);
    if (r < 0.06) idx -= 1;
    else if (r > 0.97) idx += 1;
    if (Math.abs(noise(c.at, 0.22, 21) - 0.5) < 0.012) idx = 0.7;
    idx -= 0.5 * Math.max(0, c.at.y - 0.9);
    idx += 0.9 * L;
    const mv = noise(c.at, 0.35, 5) + (0.4 - c.at.y) * 0.9;
    if (mv > 0.74) return c.pick(MOSS, 0.2 + 0.6 * c.random(7));
    return c.pick(ramp, clamp(idx / 5));
  },
  { dither: true },
);

const floorPaint = cellPaint(
  TEXEL,
  (c) => {
    const row = Math.floor(c.v / 16);
    const rr = mod(c.v, 16);
    const rowOff = Math.floor(h2(row, 5) * 16);
    const colw = 14 + Math.floor(h2(row, 7) * 8);
    const uu = c.u + rowOff;
    const col = Math.floor(uu / colw);
    const within = mod(uu, colw);
    const L = lightAt(c.at);
    const warm = L * 1.3 > c.threshold;
    const ramp = warm ? WARM : STONE;
    // Dried blood around the trap and the bones.
    const dTrap = Math.hypot(c.at.x - TX, c.at.z - TZ);
    const dBones = Math.hypot(c.at.x + 1.05, c.at.z - 0.05);
    const near = Math.min(dTrap - 0.1, dBones - 0.2);
    if (c.axis === 1 && noise(c.at, 0.11, 3) > 0.56 + 0.9 * Math.max(0, near - 0.3))
      return c.pick(BLOOD, 0.2 + 0.7 * c.random(4));
    if (within === 0 || rr === 0) return c.pick(ramp, (0.2 + L * 0.5) / 5);
    let idx = Math.round(2 + 2 * h2(col, row, 2));
    if (within === 1 || rr === 15) idx += 1;
    else if (rr === 1) idx -= 1;
    const r = c.random(3);
    if (r < 0.07) idx -= 1;
    else if (r > 0.96) idx += 1;
    if (Math.abs(noise(c.at, 0.3, 31) - 0.5) < 0.012) idx = 0.6;
    idx += 0.9 * L;
    const mv = noise(c.at, 0.4, 9) - 0.12 * (c.at.z + 0.9);
    if (c.axis === 1 && mv > 0.7) return c.pick(MOSS, 0.2 + 0.6 * c.random(8));
    return c.pick(ramp, clamp(idx / 5));
  },
  { dither: true },
);

const woodPaint = (ph: number, seed: number, vertical = false) =>
  cellPaint(
    TEXEL,
    (c) => {
      const across = vertical ? c.u : c.v;
      const along = vertical ? c.v : c.u;
      const plank = Math.floor(across / ph);
      const within = mod(across, ph);
      const L = lightAt(c.at);
      const ramp = L * 1.3 > c.threshold ? WOOD_WARM : WOOD;
      if (within === 0) return c.pick(ramp, 0.05);
      let idx = Math.round(2.2 + 1.8 * h2(plank, c.axis, seed));
      if (within === ph - 1) idx += 1;
      if (mod(along + Math.floor(h2(plank, 1, seed) * 30), 11) < 2 && c.random(seed + 4) < 0.55) idx -= 1;
      if (c.random(seed + 5) < 0.02) idx -= 2;
      idx += 1.0 * L;
      return c.pick(ramp, clamp(idx / 5));
    },
    { dither: true },
  );

const ironPaint = cellPaint(
  0.01,
  (c) => {
    const rust = noise(c.at, 0.09, 4) + 0.15 * (c.random(6) - 0.5);
    if (rust > 0.64) return c.pick(RUST, clamp((rust - 0.64) * 6 + 0.2));
    let idx = 1.6 + 1.8 * noise(c.at, 0.2, 3) + (c.n.y > 0.7 ? 1.2 : 0);
    if (c.random(1) < 0.08) idx += 1;
    return c.pick(IRON, clamp(Math.round(idx) / 5));
  },
  { dither: true },
);

const goldPaint = cellPaint(
  0.01,
  (c) => {
    let idx = 1.8 + 1.6 * c.random(2) + (c.n.y > 0.6 ? 1 : 0);
    if (c.random(3) > 0.94) idx = 4;
    return c.pick(GOLD, clamp(Math.round(idx) / 4));
  },
  { dither: true },
);

const bonePaint = cellPaint(
  0.01,
  (c) => {
    let idx = 2.2 + 1.3 * c.n.y + 0.9 * (c.random(5) - 0.5);
    if (c.random(9) < 0.05) idx -= 1.5;
    idx += lightAt(c.at) * 0.8;
    return c.pick(BONE, clamp(Math.round(idx) / 4));
  },
  { dither: true },
);

const clothPaint = cellPaint(
  0.01,
  (c) => {
    const d = mod(c.u + c.v, 8) === 0 || mod(c.u - c.v, 8) === 0;
    return c.pick(CLOTH, d ? 0.62 : 0.35 + 0.2 * c.random(1));
  },
  { dither: false },
);

const plateIronPaint = cellPaint(
  0.01,
  (c) => {
    const lx = c.at.x - TX;
    const lz = c.at.z - TZ;
    const gx = mod(Math.floor((lx + 0.32) * 100), 16);
    const gz = mod(Math.floor((lz + 0.32) * 100), 16);
    if (c.axis === 1) {
      // Blood spattered near the middle of the plate.
      if (noise(c.at, 0.09, 12) + 0.35 - Math.hypot(lx, lz) * 1.2 > 0.55) return c.pick(BLOOD, 0.2 + 0.7 * c.random(1));
      if (gx === 0 || gz === 0) return c.pick(PLATE, 0.0);
      if (gx === 1 || gz === 1) return c.pick(PLATE, 0.75);
    }
    const rust = noise(c.at, 0.12, 14);
    if (rust > 0.66) return c.pick(RUST, 0.3 + 0.5 * c.random(2));
    return c.pick(PLATE, clamp(0.35 + 0.3 * c.random(3)));
  },
  { dither: true },
);

const hazardPaint = cellPaint(
  0.01,
  (c) => {
    if (c.random(8) < 0.16) return c.pick(STONE, 0.3 + 0.3 * c.random(9));
    if (c.axis !== 1) return c.pick(STONE, 0.35);
    const stripe = mod(c.u + c.v, 16) < 8;
    return stripe ? c.pick(RUST, 0.25 + 0.4 * c.random(1)) : c.pick(STONE, 0.15 + 0.15 * c.random(2));
  },
  { dither: true },
);

const spikePaint = cellPaint(
  0.01,
  (c) => {
    const gx = Math.round((c.at.x - TX) / 0.15);
    const gz = Math.round((c.at.z - TZ) / 0.15);
    const rel = clamp((c.at.y - (F + 0.03)) / 0.3);
    const idHash = h2(gx, gz, 17);
    if (idHash > 0.55 && rel > 0.35 + (idHash - 0.55) * 0.5) return c.pick(BLOOD, 0.4 + 0.5 * c.random(1));
    if (rel < 0.28) return c.pick(RUST, 0.2 + 0.7 * c.random(1));
    return c.pick(IRON, clamp(0.3 + rel * 0.7 + 0.2 * (c.random(2) - 0.5) + (c.n.y > 0.5 ? 0.15 : 0)));
  },
  { dither: true },
);

const clothTorchPaint = cellPaint(
  0.01,
  (c) => {
    if (c.at.y > TORCH_FLAME_Y - 0.1) return c.pick(TAR, 0.2 + 0.8 * c.random(1) * (c.random(2) > 0.85 ? 1.5 : 0.5));
    const band = mod(Math.floor(c.at.y * 100), 7) < 2;
    return c.pick(CLOTHTORCH, clamp((band ? 0.15 : 0.5) + 0.35 * c.random(3)));
  },
  { dither: false },
);

const tarPaint = cellPaint(0.01, (c) => c.pick(TAR, 0.15 + 0.5 * c.random(1)), { dither: false });

function barrelPaint(origin: THREE.Vector3, axis: "x" | "y", seed: number) {
  return cellPaint(
    TEXEL,
    (c) => {
      const dx = c.at.x - origin.x;
      const dy = c.at.y - origin.y;
      const dz = c.at.z - origin.z;
      const along = axis === "y" ? dy : dx;
      const radial = axis === "y" ? Math.hypot(dx, dz) : Math.hypot(dy, dz);
      const angle = axis === "y" ? Math.atan2(dx, dz) : Math.atan2(dy, dz);
      const nAxis = axis === "y" ? c.n.y : c.n.x;
      const L = lightAt(c.at);
      const ramp = L * 1.3 > c.threshold ? WOOD_WARM : WOOD;
      if (Math.abs(nAxis) > 0.8) {
        const pl = Math.floor(c.v / 6);
        if (mod(c.v, 6) === 0) return c.pick(ramp, 0.05);
        let idx = Math.round(2.6 + 1.5 * h2(pl, 1, seed));
        if (radial > 0.2) idx -= 1;
        if (c.random(seed) < 0.03) idx -= 2;
        return c.pick(ramp, clamp((idx + L) / 5));
      }
      const sector = (angle + Math.PI) / ((2 * Math.PI) / 18);
      const stave = Math.floor(sector);
      const fr = sector - stave;
      if (fr < 0.1) return c.pick(ramp, 0.05);
      let idx = Math.round(2.2 + 1.8 * h2(stave, 3, seed));
      if (fr > 0.85) idx += 1;
      if (c.random(seed + 1) < 0.08) idx -= 1;
      if (along < 0.1 && axis === "y") idx -= 1;
      const rd = axis === "y" ? (dx * c.n.x + dz * c.n.z) / (radial || 1) : (dy * c.n.y + dz * c.n.z) / (radial || 1);
      if (rd < 0) idx -= 1.5;
      return c.pick(ramp, clamp((idx + 1.1 * L) / 5));
    },
    { dither: true },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const FLAME_ROWS = [
  ".....r......",
  ".....rr.....",
  ".....rr.....",
  "....rrrr....",
  "....rorr....",
  "...rrooro...",
  "...rooooor..",
  "..rroooooor.",
  "..rooyyyoor.",
  ".rrooyyyyoor",
  ".rooyyyyyoor",
  ".rooyywyyoor",
  ".rooyywwyoor",
  ".rrooywwyorr",
  "..rrooyyoorr",
  "..rrroooorr.",
  "...rrrrrrr..",
];
const FLAME = pixelArt(FLAME_ROWS, { r: "#c8280c", o: "#ff7a14", y: "#ffd23a", w: "#fff6c8" });

const LOCK = pixelTexture(12, 14, (g) => {
  g.fill((x, y) => {
    if (x === 0 || y === 0 || x === 11 || y === 13) return "#3c2406";
    if (x === 1 || y === 1) return "#fff09a";
    if (x === 10 || y === 12) return "#7a4c0e";
    return ((x + y) % 5 === 0 ? "#e8b828" : "#d4a020");
  });
  for (const [x, y] of [
    [2, 2],
    [9, 2],
    [2, 11],
    [9, 11],
  ])
    g.set(x, y, "#5a360a");
  g.stamp(4, 4, ["..kk..", ".kkkk.", ".kkkk.", "..kk..", "..kk..", "..kk..", ".kkkk."], { k: "#120a04" });
});

const MARK_SKULL = pixelTexture(14, 14, (g) => {
  g.fill(() => "#8a1c1c");
  g.fill((x, y) => (x === 0 || y === 0 || x === 13 || y === 13 ? "#4a0c0c" : undefined));
  g.stamp(2, 1, [
    "..wwwwww..",
    ".wwwwwwww.",
    "wwwwwwwwww",
    "wkkwwwwkkw",
    "wkkwwwwkkw",
    "wwwwkkwwww",
    ".wwwkkwww.",
    "..wwwwww..",
    "..wkwkwk..",
    "..wkwkwk..",
  ], { w: "#e6dcba", k: "#1a1008" });
});

const MARK_CROSS = pixelTexture(12, 12, (g) => {
  for (let i = 1; i < 11; i++)
    for (let t = 0; t < 2; t++) {
      g.set(i, i + t - 0, "#d8a43a");
      g.set(11 - i, i + t - 0, "#d8a43a");
    }
});

const WEB = pixelTexture(24, 24, (g) => {
  const line = "#c4c8d8";
  const dim = "#80849a";
  for (const deg of [0, 18, 36, 54, 72, 90]) {
    for (let r = 0; r < 24; r += 0.5) {
      const x = Math.round(r * Math.cos(deg * DEG));
      const y = Math.round(r * Math.sin(deg * DEG));
      g.set(x, y, r > 14 ? dim : line);
    }
  }
  for (const r of [5, 9, 13, 18, 22])
    for (let d = 0; d <= 90; d += 1.5) {
      const x = Math.round(r * Math.cos(d * DEG));
      const y = Math.round(r * Math.sin(d * DEG));
      if (mod(x + y, 7) !== 0) g.set(x, y, dim);
    }
});

const SK = skinLayout({ cran: [16, 12, 18], jaw: [12, 4, 14] }, 64);
const SKULL_SHEET = pixelTexture(SK.size[0], SK.size[1], (g) => {
  const shade: Record<string, number> = { py: 0.85, pz: 0.72, px: 0.62, nx: 0.62, nz: 0.55, ny: 0.3 };
  for (const faces of Object.values(SK.faces))
    for (const [face, rect] of Object.entries(faces))
      g.fill((x, y) => {
        let v = shade[face] + 0.18 * (h2(x, y, face.charCodeAt(1)) - 0.5);
        if (h2(x, y, 99) > 0.95) v -= 0.25;
        return pick(BONE, v, bayer(x, y));
      }, rect);
  const f = SK.faces.cran.pz;
  // Eye sockets, nose cavity, upper teeth, a crack.
  g.fill((x, y) => (x === 0 || y === 3 || x === 3 ? "#2a2018" : "#0c0806"), [f[0] + 3, f[1] + 4, 4, 4]);
  g.fill((x, y) => (x === 0 || y === 3 || x === 3 ? "#2a2018" : "#0c0806"), [f[0] + 9, f[1] + 4, 4, 4]);
  g.stamp(f[0] + 7, f[1] + 8, [".kk.", "kkkk"], { k: "#0c0806" });
  g.stamp(f[0] + 1, f[1] + 10, ["wkwkwkwkwkwkwk", "wkwkwkwkwkwkwk"], { w: "#efe7d0", k: "#3a2f24" });
  g.stamp(f[0] + 12, f[1] + 1, ["k.", ".k", ".k", "k."], { k: "#4a3f35" });
  const j = SK.faces.jaw.pz;
  g.stamp(j[0], j[1], ["wkwkwkwkwkwk", "wwwwwwwwwwww"], { w: "#efe7d0", k: "#3a2f24" });
  g.fill(() => "#1a1410", SK.faces.jaw.py);
  const jp = SK.faces.jaw.py;
  g.fill((x, y, w, h) => (x < 2 || x >= w - 2 || y >= h - 2 ? "#e0d8bc" : undefined), jp);
});

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
  const R = rng(4417);

  const CX = 0;
  const CZ = -0.12;
  const LID_Y = F + 0.44;
  const HINGE_Z = CZ - 0.25;

  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("chestLid", { parent: root, at: [CX, LID_Y, HINGE_Z], dir: [0, 0, 1], role: "hinge" });

  type Extra = { texture?: THREE.Texture; name?: string; flat?: boolean };
  const put = (
    geo: THREE.BufferGeometry,
    color: ColorInput,
    at: V,
    rot?: V,
    bone: typeof root = root,
    extra: Extra = {},
  ) => b.part(geo, color, { bone, at, ...(rot ? { rotation: rot } : {}), ...extra });
  const box = (size: V, color: ColorInput, at: V, rot?: V, bone: typeof root = root, extra: Extra = {}) =>
    put(new THREE.BoxGeometry(...size), color, at, rot, bone, extra);
  const xf = (geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0]) =>
    geo.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(...at),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
  const merged = (list: THREE.BufferGeometry[], color: ColorInput, bone: typeof root = root, extra: Extra = {}) =>
    put(mergeGeometries(list, false)!, color, [0, 0, 0], undefined, bone, extra);

  // ------------------------------------------------------------------------------------------------ floor
  {
    const spans: [number, number][] = [];
    for (let i = 0; i < 28; i++) spans.push([i % 5 === 2 ? 2 : i % 7 === 3 ? 1 : 0, 24]);
    // Front edge breaks off in 10 cm steps; the back runs flush under the wall.
    b.extrude(stepped(spans, [0.1, 0.1]), {
      at: [-1.4, F / 2, 1.45],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: F,
      color: floorPaint,
      name: "floor",
    });
  }

  // ------------------------------------------------------------------------------------------------ wall + pillars
  {
    const hs: number[] = [];
    for (let i = 0; i < 26; i++) hs.push(88 + Math.round((R() - 0.5) * 6) - (i === 7 || i === 8 ? 6 : 0) - (i === 18 ? 8 : 0));
    b.extrude(
      stepped(
        hs.map((h) => [0, h] as [number, number]),
        [0.1, TEXEL],
      ),
      { at: [-1.3, 0, -0.8], x: [1, 0, 0], thickness: 0.3, color: wallPaint, name: "wall" },
    );
    for (const s of [-1, 1]) {
      const px = s * 1.25;
      box([0.3, 1.9, 0.36], wallPaint, [px, 0.95, -0.8], undefined, root, { name: `pillar${s}` });
      box([0.38, 0.16, 0.44], wallPaint, [px, 0.08, -0.8]);
      box([0.38, 0.12, 0.44], wallPaint, [px, 1.9, -0.8]);
      box([0.34, 0.06, 0.4], wallPaint, [px, 1.81, -0.8]);
      box([0.34, 0.06, 0.4], wallPaint, [px, 0.19, -0.8]);
    }
    // Fallen bricks.
    for (const [x, z, ry] of [
      [-0.62, -0.5, 20],
      [-0.5, -0.45, -35],
      [0.38, -0.55, 70],
      [1.28, 0.02, 10],
    ] as V[])
      box([0.16, 0.08, 0.1], wallPaint, [x, F + 0.04, z], [0, ry, 0]);
  }

  // ------------------------------------------------------------------------------------------------ wall torches
  for (const s of [-1, 1]) {
    const x = s * TORCH_X;
    const sp = (y: number): V => [x, y, -0.6 + (0.14 * (y - (F + 0.7))) / 0.62];
    // Backplate, rivets, arms and rings.
    box([0.13, 0.36, 0.03], ironPaint, [x, F + 0.9, -0.635], undefined, root, { name: "sconcePlate" });
    box([0.16, 0.04, 0.04], ironPaint, [x, F + 1.09, -0.63]);
    box([0.16, 0.04, 0.04], ironPaint, [x, F + 0.71, -0.63]);
    const rivets: THREE.BufferGeometry[] = [];
    for (const dx of [-0.045, 0.045])
      for (const dy of [-0.14, 0.14]) rivets.push(xf(new THREE.BoxGeometry(0.02, 0.02, 0.014), [x + dx, F + 0.9 + dy, -0.615]));
    merged(rivets, "#a8aec6");
    b.rod([x, F + 0.95, -0.625], [x, F + 0.95, sp(F + 0.95)[2]], [0.014, 0.014], { color: ironPaint, section: "box", bone: root });
    b.rod([x, F + 0.75, -0.625], [x, F + 0.75, sp(F + 0.75)[2]], [0.014, 0.014], { color: ironPaint, section: "box", bone: root });
    for (const y of [0.95, 0.75])
      put(new THREE.TorusGeometry(0.036, 0.011, 4, 8), ironPaint, [x, F + y, sp(F + y)[2]], [8, 0, 0]);
    // Shaft, wrapped head, flame.
    b.rod(sp(F + 0.62), sp(F + 1.18), [0.024, 0.024], { color: woodPaint(4, 3 + (s + 1)), section: "box", bone: root, name: "torchShaft" });
    b.frustumBox(sp(F + 1.12), sp(F + 1.37), [0.07, 0.07], [0.13, 0.13], { color: clothTorchPaint, bone: root, name: "torchHead" });
    const top = sp(F + 1.38);
    const fcards = b.cards([frame(top, [0, 1, 0])], FLAME, { size: [0.26, FLAME_ROWS.length * 0.02 * 1.1], lean: 0, cross: true, bone: root });
    glow(fcards, 1.5);
    const sparks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++)
      sparks.push(
        xf(new THREE.BoxGeometry(0.014, 0.014, 0.014), [
          top[0] + (R() - 0.5) * 0.2,
          top[1] + 0.2 + R() * 0.28,
          top[2] + (R() - 0.5) * 0.14,
        ]),
      );
    glow(merged(sparks, "#ffb030"), 1.6);
    // Soot above the flame.
    box([0.12, 0.002, 0.12], tarPaint, [x, F + 1.395, sp(F + 1.38)[2]], undefined, root, { name: "pitch" });
  }

  // ------------------------------------------------------------------------------------------------ chain shackles
  for (const [s, n] of [
    [-1, 7],
    [1, 9],
  ] as [number, number][]) {
    const x = s * 0.3;
    const y0 = F + 1.55;
    box([0.05, 0.05, 0.04], ironPaint, [x, y0, -0.63]);
    const links: THREE.BufferGeometry[] = [xf(new THREE.TorusGeometry(0.026, 0.007, 4, 6), [x, y0 - 0.02, -0.6])];
    for (let i = 0; i < n; i++)
      links.push(xf(new THREE.TorusGeometry(0.022, 0.006, 4, 6), [x, y0 - 0.06 - i * 0.036, -0.6], [0, mod(i, 2) ? 90 : 0, 0]));
    merged(links, ironPaint);
    const endY = y0 - 0.06 - n * 0.036 - 0.05;
    put(new THREE.TorusGeometry(0.045, 0.014, 4, 8), ironPaint, [x, endY, -0.6], [0, 0, 0]);
    box([0.04, 0.03, 0.04], ironPaint, [x, endY + 0.05, -0.6]);
    box([0.03, 0.03, 0.03], "#a8aec6", [x, endY + 0.05, -0.578]);
  }

  // Cobweb in the wall's top-left corner.
  b.part(new THREE.PlaneGeometry(0.48, 0.48), "#ffffff", {
    bone: root,
    at: [-1.1 + 0.24, 1.76 - 0.24, -0.646],
    dir: [0, 0, 1],
    axis: "z",
    texture: WEB,
  });

  // ------------------------------------------------------------------------------------------------ chest
  {
    const body = woodPaint(5, 7);
    const feet = woodPaint(4, 9, true);
    const by = F + 0.04; // body bottom
    // Feet and floor slab.
    for (const dx of [-0.4, 0.4])
      for (const dz of [-0.2, 0.2]) box([0.1, 0.04, 0.1], feet, [CX + dx, F + 0.02, CZ + dz]);
    box([0.9, 0.04, 0.5], body, [CX, by + 0.02, CZ]);
    // Walls.
    box([0.9, 0.36, 0.04], body, [CX, by + 0.22, CZ + 0.23], undefined, root, { name: "chestFront" });
    box([0.9, 0.36, 0.04], body, [CX, by + 0.22, CZ - 0.23]);
    for (const s of [-1, 1]) box([0.04, 0.36, 0.42], body, [CX + s * 0.43, by + 0.22, CZ]);
    // Quilted lining.
    box([0.82, 0.34, 0.01], clothPaint, [CX, by + 0.23, CZ + 0.205]);
    box([0.82, 0.34, 0.01], clothPaint, [CX, by + 0.23, CZ - 0.205]);
    for (const s of [-1, 1]) box([0.01, 0.34, 0.4], clothPaint, [CX + s * 0.405, by + 0.23, CZ]);
    // Rim trim.
    box([0.9, 0.02, 0.03], ironPaint, [CX, by + 0.4, CZ + 0.235]);
    box([0.9, 0.02, 0.03], ironPaint, [CX, by + 0.4, CZ - 0.235]);
    for (const s of [-1, 1]) box([0.03, 0.02, 0.5], ironPaint, [CX + s * 0.435, by + 0.4, CZ]);
    // Corner braces, vertical straps, bottom trim.
    const braces: THREE.BufferGeometry[] = [];
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        braces.push(xf(new THREE.BoxGeometry(0.05, 0.4, 0.05), [CX + sx * 0.44, by + 0.2, CZ + sz * 0.24]));
        braces.push(xf(new THREE.BoxGeometry(0.06, 0.03, 0.06), [CX + sx * 0.44, by + 0.01, CZ + sz * 0.24]));
      }
    merged(braces, ironPaint, root, { name: "chestBraces" });
    for (const sx of [-0.3, 0.3]) {
      box([0.08, 0.36, 0.014], ironPaint, [CX + sx, by + 0.22, CZ + 0.256]);
      box([0.08, 0.36, 0.014], ironPaint, [CX + sx, by + 0.22, CZ - 0.256]);
    }
    // Rivets on the straps and braces.
    const studs: THREE.BufferGeometry[] = [];
    for (const sx of [-0.3, 0.3])
      for (const dy of [0.06, 0.16, 0.26, 0.36]) {
        studs.push(xf(new THREE.BoxGeometry(0.02, 0.02, 0.01), [CX + sx - 0.025, by + dy, CZ + 0.263]));
        studs.push(xf(new THREE.BoxGeometry(0.02, 0.02, 0.01), [CX + sx + 0.025, by + dy, CZ + 0.263]));
      }
    for (const sx of [-1, 1]) for (const dy of [0.08, 0.2, 0.32]) studs.push(xf(new THREE.BoxGeometry(0.01, 0.02, 0.02), [CX + sx * 0.472, by + dy, CZ + 0.24]));
    merged(studs, "#a8aec6", root, { name: "chestRivets" });
    // Side handles.
    for (const s of [-1, 1]) {
      box([0.03, 0.04, 0.05], ironPaint, [CX + s * 0.465, by + 0.3, CZ]);
      put(new THREE.TorusGeometry(0.035, 0.008, 4, 8), ironPaint, [CX + s * 0.485, by + 0.26, CZ], [0, 90, 0]);
    }
    // Lock plate.
    box([0.12, 0.14, 0.02], "#ffffff", [CX, by + 0.3, CZ + 0.27], undefined, root, { texture: LOCK, name: "lockPlate" });

    // Treasure heap, four layers, then loose coins and gems.
    const layers: [number, number, number, number, number, number][] = [
      [0.8, 0.12, 0.4, 0, F + 0.14, 0],
      [0.7, 0.1, 0.34, 0.02, F + 0.25, 0.01],
      [0.52, 0.1, 0.27, -0.03, F + 0.34, -0.01],
      [0.3, 0.06, 0.16, 0.05, F + 0.41, 0.02],
    ];
    for (const [w, h, d, ox, y, oz] of layers) box([w, h, d], goldPaint, [CX + ox, y + 0.03, CZ + oz], undefined, root, { name: "goldHeap" });
    const coinA: THREE.BufferGeometry[] = [];
    const coinB: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 46; i++) {
      const x = CX + (R() - 0.5) * 0.7;
      const z = CZ + (R() - 0.5) * 0.34;
      const hh = 1 - Math.min(1, (Math.abs(x - CX) / 0.4) ** 2 * 0.5 + (Math.abs(z - CZ) / 0.2) ** 2 * 0.5);
      const y = F + 0.2 + hh * 0.26 + R() * 0.012;
      (i % 2 ? coinA : coinB).push(
        xf(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), [x, y, z], [(R() - 0.5) * 70, R() * 90, (R() - 0.5) * 70]),
      );
    }
    glow(merged(coinA, "#f0c22e"), 0.5);
    glow(merged(coinB, "#c89420"), 0.35);
    // Gold bars and gems.
    box([0.12, 0.04, 0.06], goldPaint, [CX - 0.22, F + 0.44, CZ + 0.05], [0, 20, 6], root, { name: "goldBar" });
    box([0.12, 0.04, 0.06], goldPaint, [CX + 0.14, F + 0.455, CZ - 0.08], [0, -35, -4], root, { name: "goldBar" });
    for (const [gx, gz, col] of [
      [-0.1, 0.08, "#e0243c"],
      [0.22, 0.1, "#2a6ae8"],
      [-0.28, -0.1, "#23c46a"],
      [0.02, -0.02, "#c040e0"],
    ] as [number, number, string][]) {
      const gem = put(new THREE.OctahedronGeometry(0.036, 0), col, [CX + gx, F + 0.47, CZ + gz], [0, 25, 15], root, { flat: true, name: "gem" });
      glow(gem, 0.7);
    }

    // Spilled coins on the floor in front of the chest.
    const spill: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++) {
      const a = R() * Math.PI * 2;
      const r = 0.05 + R() * 0.3;
      spill.push(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), [CX + 0.12 + Math.cos(a) * r * 1.2, F + 0.005 + (i % 3 === 0 ? 0.008 : 0), CZ + 0.4 + Math.sin(a) * r * 0.7], [0, R() * 90, i % 4 === 0 ? 14 : 0]));
    }
    // A stack of five.
    for (let i = 0; i < 5; i++) spill.push(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), [CX - 0.28, F + 0.004 + i * 0.008, CZ + 0.38], [0, i * 12, 0]));
    glow(merged(spill, "#e8b828"), 0.4);

    // Lid: stepped arch, straps, hasp, hinges, padding; hinged at the back.
    const hs = Array.from({ length: 27 }, (_, i) => 4 + Math.round(10 * Math.sqrt(1 - ((i + 0.5 - 13.5) / 13.5) ** 2)));
    const lidOutline = stepped(
      hs.map((h) => [0, h] as [number, number]),
      TEXEL,
    );
    b.extrude(lidOutline, {
      at: [CX, LID_Y, CZ - 0.27],
      x: [0, 0, 1],
      thickness: 0.94,
      color: woodPaint(5, 11),
      bone: lid,
      name: "chestLid",
    });
    const bandOutline = stepped(
      Array.from({ length: 29 }, (_, i) => [-1, hs[clamp(i - 1, 0, 26)] + 1] as [number, number]),
      TEXEL,
      { start: -1 },
    );
    for (const sx of [-0.3, 0.3])
      b.extrude(bandOutline, { at: [CX + sx, LID_Y, CZ - 0.27], x: [0, 0, 1], thickness: 0.08, color: ironPaint, bone: lid, name: "lidBand" });
    box([0.84, 0.008, 0.46], clothPaint, [CX, LID_Y - 0.004, CZ], undefined, lid, { name: "lidPadding" });
    box([0.1, 0.12, 0.02], ironPaint, [CX, LID_Y + 0.04, CZ + 0.285], undefined, lid, { name: "hasp" });
    box([0.04, 0.04, 0.03], "#a8aec6", [CX, LID_Y + 0.0, CZ + 0.285], undefined, lid);
    const lidRivets: THREE.BufferGeometry[] = [];
    for (const sx of [-0.3, 0.3]) for (let i = 0; i < 6; i++) {
      const z = CZ - 0.2 + i * 0.08;
      const h = hs[Math.min(26, Math.round((z - (CZ - 0.27)) / TEXEL))] * TEXEL;
      for (const dx of [-0.03, 0.03]) lidRivets.push(xf(new THREE.BoxGeometry(0.018, 0.012, 0.018), [CX + sx + dx, LID_Y + h + 0.012, z]));
    }
    merged(lidRivets, "#a8aec6", lid, { name: "lidRivets" });
    for (const sx of [-0.3, 0.3, 0]) {
      const knuckle = put(new THREE.CylinderGeometry(0.022, 0.022, sx === 0 ? 0.06 : 0.09, 6), ironPaint, [CX + sx, LID_Y, HINGE_Z - 0.01], [0, 0, 90], sx === 0 ? root : lid);
      knuckle.mesh.name = "hinge";
    }
  }

  // ------------------------------------------------------------------------------------------------ barrels
  const BH = 0.8;
  const BR = 0.29;
  const ER = 0.235;
  const rAt = (y: number) => {
    const ys = [0, 0.12, 0.4, 0.68, 0.8];
    const rs = [ER, 0.262, BR, 0.262, ER];
    for (let i = 0; i < 4; i++) if (y <= ys[i + 1]) return rs[i] + ((rs[i + 1] - rs[i]) * (y - ys[i])) / (ys[i + 1] - ys[i]);
    return ER;
  };
  const hoopYs = [0.06, 0.18, 0.6, 0.72];
  const hoopProfile = (y0: number): [number, number][] => [
    [rAt(y0) - 0.02, y0],
    [rAt(y0) + 0.018, y0],
    [rAt(y0 + 0.05) + 0.018, y0 + 0.05],
    [rAt(y0 + 0.05) - 0.02, y0 + 0.05],
  ];
  const stavesOutline = (open: boolean): [number, number][] => {
    const o: [number, number][] = [[0, 0], [ER, 0], [0.262, 0.12], [BR, 0.4], [0.262, 0.68], [ER, BH]];
    if (!open) return [...o, [0, BH]];
    return [...o, [ER - 0.03, BH], [0.262 - 0.03, 0.68], [rAt(0.58) - 0.03, 0.58], [0, 0.58]];
  };
  const barrel = (cx: number, cz: number, kind: "closed" | "open" | "lying", seed: number) => {
    if (kind === "lying") {
      const y = F + 0.27;
      const x0 = cx - BH / 2;
      const paint = barrelPaint(new THREE.Vector3(x0, y, cz), "x", seed);
      b.lathe(stavesOutline(false), { at: [x0, y, cz], axis: [1, 0, 0], segments: 8, spin: 22.5, color: paint, bone: root, name: "barrelLying" });
      for (const hy of hoopYs) b.lathe(hoopProfile(hy), { at: [x0, y, cz], axis: [1, 0, 0], segments: 8, spin: 22.5, color: ironPaint, bone: root, name: "hoop" });
      return;
    }
    const paint = barrelPaint(new THREE.Vector3(cx, F, cz), "y", seed);
    const staves = b.lathe(stavesOutline(kind === "open"), { at: [cx, F, cz], segments: 8, spin: 22.5, color: paint, bone: root, name: `barrel.${kind}` });
    for (const hy of hoopYs) b.lathe(hoopProfile(hy), { at: [cx, F, cz], segments: 8, spin: 22.5, color: ironPaint, bone: root, name: "hoop" });
    return staves;
  };

  // A: closed, skull stencil.
  const barrelA = barrel(0.84, -0.27, "closed", 21)!;
  b.decal(barrelA, MARK_SKULL, { at: [0.84, F + 0.42, -0.27 + 0.3], dir: [0, 0, 1], size: [0.15, 0.15], bone: root });
  // Lid rim plank bits, a bung and a leaning lid piece.
  box([0.04, 0.025, 0.04], tarPaint, [0.98, F + BH + 0.013, -0.2], undefined, root, { name: "bung" });
  // B: open, stagnant water, a dead rat bone, a loose lid leaning on it.
  barrel(0.72, 0.3, "open", 33);
  put(new THREE.CylinderGeometry(rAt(0.58) - 0.032, rAt(0.58) - 0.032, 0.006, 8), "#1a4a52", [0.72, F + 0.585, 0.3], [0, 22.5, 0], root, { name: "water" });
  {
    const rip: THREE.BufferGeometry[] = [];
    for (const [rx, rz, w] of [
      [0.04, 0.02, 0.07],
      [-0.08, -0.06, 0.05],
      [0.1, -0.08, 0.04],
    ])
      rip.push(xf(new THREE.BoxGeometry(w, 0.004, 0.012), [0.72 + rx, F + 0.59, 0.3 + rz]));
    merged(rip, "#4fa8b0", root, { name: "waterGlints" });
    // Loose barrel lid leaning against B.
    const lidGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 8);
    put(lidGeo, woodPaint(6, 41), [0.46, F + 0.24, 0.62], [74, 0, -12], root, { name: "looseLid" });
    put(new THREE.TorusGeometry(0.22, 0.012, 4, 8), ironPaint, [0.46, F + 0.24, 0.62], [74, 0, -12]);
  }
  // C: lying barrel with a tap and a puddle.
  barrel(0.95, 0.88, "lying", 47);
  b.decal(b.surface(b.root), MARK_CROSS, { at: [0.95, F + 0.27 + 0.3, 0.88], dir: [0, 1, 0], up: [0, 0, 1], size: [0.14, 0.14], bone: root });
  {
    const tx = 1.05;
    const tz = 0.88 + 0.27;
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), "#c48a1c", [tx, F + 0.2, tz + 0.04], [90, 0, 0], root, { name: "tap" });
    box([0.016, 0.07, 0.016], "#c48a1c", [tx, F + 0.25, tz + 0.01], undefined, root, { name: "tapHandle" });
    box([0.05, 0.014, 0.014], "#c48a1c", [tx, F + 0.285, tz + 0.01]);
    put(new THREE.CylinderGeometry(0.14, 0.14, 0.004, 8), "#1a3a5a", [tx, F + 0.003, tz + 0.2], [0, 22.5, 0], root, { name: "puddle" });
    put(new THREE.CylinderGeometry(0.08, 0.08, 0.005, 8), "#2a5a82", [tx + 0.03, F + 0.005, tz + 0.18], [0, 10, 0], root, { name: "puddleSheen" });
    // Wedges holding the barrel.
    for (const dx of [-0.26, 0.26]) box([0.08, 0.06, 0.1], woodPaint(3, 50), [0.95 + dx, F + 0.03, 0.88 + 0.3], [0, 0, 0]);
  }

  // ------------------------------------------------------------------------------------------------ bones
  {
    const BX = -1.05;
    // Ribcage: spine of vertebrae, twelve ribs.
    const verts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const z = -0.34 + i * 0.058;
      verts.push(xf(new THREE.BoxGeometry(0.05, 0.036, 0.044), [BX, F + 0.02, z]));
      verts.push(xf(new THREE.BoxGeometry(0.02, 0.03, 0.02), [BX, F + 0.045, z]));
      verts.push(xf(new THREE.BoxGeometry(0.1, 0.012, 0.016), [BX, F + 0.025, z]));
    }
    merged(verts, bonePaint, root, { name: "spine" });
    const ribZ = [-0.3, -0.24, -0.18, -0.12, -0.06, 0.0];
    const ribRX = [0.09, 0.12, 0.14, 0.14, 0.12, 0.09];
    ribZ.forEach((z, i) => {
      for (const s of [-1, 1]) {
        const collapsed = s === -1 && i % 2 === 1;
        const ry = collapsed ? 0.03 : 0.09 - Math.abs(i - 2.5) * 0.008;
        const rx = ribRX[i] * (collapsed ? 1.12 : 1);
        const pts: V[] = [];
        for (let k = 0; k <= 6; k++) {
          const ph = (k / 6) * Math.PI * 0.86;
          pts.push([BX + s * rx * Math.sin(ph), F + 0.035 + (ry * (1 - Math.cos(ph))) / 2, z + (k / 6) * 0.02 * s]);
        }
        b.sweep(catmull(pts), (t) => [0.012 * (1 - 0.35 * t), 0.009], { section: "box", color: bonePaint, caps: "flat", bone: root, name: "rib" });
      }
    });
    // Long bones.
    const knobs: THREE.BufferGeometry[] = [];
    const longBone = (a: V, c: V, r: number) => {
      b.rod(a, c, [r, r * 0.8], { color: bonePaint, section: "box", bone: root, name: "longBone" });
      for (const p of [a, c]) knobs.push(xf(new THREE.BoxGeometry(r * 3, r * 2.4, r * 3), p, [0, 15, 0]));
    };
    longBone([-1.32, F + 0.025, 0.42], [-1.0, F + 0.025, 0.56], 0.016); // femur
    longBone([-1.26, F + 0.025, 0.54], [-1.02, F + 0.025, 0.36], 0.014); // femur 2
    longBone([-1.3, F + 0.06, 0.2], [-1.12, F + 0.025, 0.3], 0.01); // arm bone
    longBone([-1.22, F + 0.022, 0.28], [-1.0, F + 0.022, 0.22], 0.009); // radius
    merged(knobs, bonePaint, root, { name: "boneKnobs" });
    // Hand reaching toward the trap.
    {
      const hx = -0.9;
      const hz = 0.2;
      const geos: THREE.BufferGeometry[] = [xf(new THREE.BoxGeometry(0.05, 0.012, 0.055), [hx, F + 0.015, hz])];
      [-30, -12, 4, 20, 50].forEach((a, i) => {
        const len = i === 4 ? 0.04 : 0.055;
        const px = hx + Math.sin(a * DEG) * (0.03 + len / 2);
        const pz = hz + Math.cos(a * DEG) * (0.03 + len / 2) * 0.9;
        geos.push(xf(new THREE.BoxGeometry(0.01, 0.009, len), [px, F + 0.01, pz], [0, a, 0]));
        geos.push(xf(new THREE.BoxGeometry(0.012, 0.01, 0.014), [px + Math.sin(a * DEG) * len * 0.5, F + 0.01, pz + Math.cos(a * DEG) * len * 0.5], [0, a, 0]));
      });
      merged(geos, bonePaint, root, { name: "hand" });
    }
    // Loose small bones.
    const bits: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++)
      bits.push(xf(new THREE.BoxGeometry(0.012, 0.01, 0.03 + R() * 0.03), [-1.38 + R() * 0.5, F + 0.007, -0.1 + R() * 0.85], [0, R() * 180, 0]));
    merged(bits, bonePaint, root, { name: "bitsOfBone" });

    const skullAt = (at: V, rot: V, jawOpen: number, jawOffset: V = [0, 0, 0]) => {
      put(skinBox(SKULL_SHEET, SK.faces.cran, 0.01), "#ffffff", at, rot, root, { texture: SKULL_SHEET, name: "skullCranium" });
      const detail: THREE.BufferGeometry[] = [
        xf(new THREE.BoxGeometry(0.15, 0.014, 0.018), [0, 0.032, 0.088]),
        xf(new THREE.BoxGeometry(0.022, 0.024, 0.03), [0.076, -0.028, 0.055]),
        xf(new THREE.BoxGeometry(0.022, 0.024, 0.03), [-0.076, -0.028, 0.055]),
      ];
      put(mergeGeometries(detail, false)!, bonePaint, at, rot, root, { name: "skullBrow" });
      const o = new THREE.Vector3(0, -0.07, 0.012).applyEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
      put(
        skinBox(SKULL_SHEET, SK.faces.jaw, 0.01),
        "#ffffff",
        [at[0] + o.x + jawOffset[0], at[1] + o.y + jawOffset[1], at[2] + o.z + jawOffset[2]],
        [rot[0] + jawOpen, rot[1], rot[2]],
        root,
        { texture: SKULL_SHEET, name: "skullJaw" },
      );
    };
    skullAt([-1.12, F + 0.065, -0.44], [8, 28, 0], 4);
    skullAt([TX - 0.075, F + 0.03 + 0.285, TZ - 0.075], [-14, 22, 8], 18, [0, -0.02, 0.02]);
    box([0.07, 0.01, 0.03], bonePaint, [TX + 0.15, F + 0.04, TZ - 0.2]);
  }

  // ------------------------------------------------------------------------------------------------ dropped torch
  {
    const a: V = [-1.28, F + 0.025, 0.74];
    const c: V = [-0.98, F + 0.025, 0.98];
    b.rod(a, c, [0.024, 0.024], { color: woodPaint(4, 61), section: "box", bone: root, name: "fallenTorchShaft" });
    const dir = new THREE.Vector3(c[0] - a[0], 0, c[2] - a[2]).normalize();
    const head0: V = [c[0], F + 0.04, c[2]];
    const head1: V = [c[0] + dir.x * 0.22, F + 0.05, c[2] + dir.z * 0.22];
    b.frustumBox(head0, head1, [0.06, 0.06], [0.13, 0.12], { color: tarPaint, bone: root, name: "fallenTorchHead" });
    const em: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) em.push(xf(new THREE.BoxGeometry(0.014, 0.01, 0.014), [head1[0] + (R() - 0.5) * 0.08 - dir.x * (R() * 0.1), F + 0.1 + R() * 0.01, head1[2] + (R() - 0.5) * 0.08 - dir.z * (R() * 0.1)]));
    glow(merged(em, "#e0480e"), 1.1);
    box([0.14, 0.01, 0.14], "#15141c", [head1[0] + dir.x * 0.04, F + 0.004, head1[2] + dir.z * 0.04], [0, 30, 0], root, { name: "soot" });
  }

  // ------------------------------------------------------------------------------------------------ spike trap
  {
    const bw = 0.08;
    const bh = 0.07;
    const rim = hazardPaint;
    box([0.8, bh, bw], rim, [TX, F + bh / 2, TZ + 0.36], undefined, root, { name: "trapBorderFront" });
    box([0.8, bh, bw], rim, [TX, F + bh / 2, TZ - 0.36]);
    for (const s of [-1, 1]) box([bw, bh, 0.64], rim, [TX + s * 0.36, F + bh / 2, TZ]);
    box([0.64, 0.03, 0.64], plateIronPaint, [TX, F + 0.015, TZ], undefined, root, { name: "trapPlate" });
    const heights = [
      [0.3, 0, 0.22, 0.3],
      [0.14, 0.3, 0, 0.18],
      [0.3, 0.2, 0.3, 0.1],
      [0, 0.3, 0.16, 0.3],
    ];
    const bolts: THREE.BufferGeometry[] = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bolts.push(xf(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 6), [TX + sx * 0.29, F + 0.038, TZ + sz * 0.29]));
    merged(bolts, ironPaint, root, { name: "trapBolts" });
    heights.forEach((row, iz) =>
      row.forEach((h, ix) => {
        const x = TX - 0.225 + ix * 0.15;
        const z = TZ - 0.225 + iz * 0.15;
        box([0.1, 0.012, 0.1], ironPaint, [x, F + 0.036, z], undefined, root, { name: "holeCollar" });
        box([0.07, 0.003, 0.07], "#07070b", [x, F + 0.0435, z], undefined, root, { name: "hole" });
        if (h > 0) {
          const spike = new THREE.ConeGeometry(0.032, h, 4);
          put(spike, spikePaint, [x, F + 0.03 + h / 2, z], [0, 45, 0], root, { name: "spike" });
          if (h > 0.25) box([0.05, 0.016, 0.05], spikePaint, [x, F + 0.052, z], [0, 45, 0], root, { name: "spikeBase" });
        } else {
          box([0.055, 0.006, 0.055], ironPaint, [x, F + 0.047, z], [0, 20, 0], root, { name: "rustyCap" });
        }
      }),
    );
    // Debris and a snapped arrow shaft on the border.
    const deb: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) deb.push(xf(new THREE.BoxGeometry(0.02 + R() * 0.03, 0.02, 0.02 + R() * 0.03), [TX - 0.5 + R() * 1.0, F + 0.01, TZ + 0.45 + R() * 0.12], [0, R() * 90, 0]));
    merged(deb, wallPaint, root, { name: "trapDebris" });
    b.rod([TX + 0.2, F + 0.045, TZ + 0.2], [TX + 0.34, F + 0.045, TZ + 0.36], [0.006, 0.006], { color: woodPaint(2, 70), section: "box", bone: root, name: "arrow" });
    box([0.03, 0.006, 0.02], "#a8aec6", [TX + 0.35, F + 0.045, TZ + 0.37], [0, 40, 0], root, { name: "arrowhead" });
  }

  // ------------------------------------------------------------------------------------------------ rubble, mushrooms
  {
    const ex: [number, number, number, number][] = [
      [-0.5, 0.5, -0.45, 0.15],
      [-1.4, -0.65, -1.4, 1.2],
      [0.25, 0.7, -0.05, 0.6],
    ];
    const inside = (x: number, z: number) =>
      (Math.abs(x) < 0.55 && z > -0.45 && z < 0.2) ||
      (Math.hypot(x - 0.84, z + 0.27) < 0.35) ||
      (Math.hypot(x - 0.72, z - 0.3) < 0.33) ||
      (Math.abs(x - 0.95) < 0.45 && Math.abs(z - 0.88) < 0.32) ||
      (Math.abs(x - TX) < 0.5 && Math.abs(z - TZ) < 0.5) ||
      (x < -0.8 && x > -1.4 && z > -0.5 && z < 1.0);
    const stoneCols = ["#47465a", "#33323f", "#5e5c73", "#23222d"];
    const groups: THREE.BufferGeometry[][] = [[], [], [], []];
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < 44; tries++) {
      const x = -1.35 + R() * 2.7;
      const z = -0.6 + R() * 1.9;
      if (inside(x, z) || ex.length === 0) continue;
      const s = 0.02 + R() * 0.045;
      groups[placed % 4].push(xf(new THREE.BoxGeometry(s, s * 0.7, s * (0.8 + R() * 0.5)), [x, F + s * 0.3, z], [0, R() * 90, R() * 20]));
      placed++;
    }
    groups.forEach((g, i) => g.length && merged(g, stoneCols[i], root, { name: "pebbles" }));
    // Glowing mushrooms by the wall foot.
    const stems: THREE.BufferGeometry[] = [];
    const caps: THREE.BufferGeometry[] = [];
    const spots: THREE.BufferGeometry[] = [];
    for (const [mx, mz, hh, rr] of [
      [-0.74, -0.53, 0.07, 0.05],
      [-0.66, -0.55, 0.1, 0.06],
      [-0.58, -0.52, 0.055, 0.04],
      [0.5, -0.54, 0.07, 0.045],
      [0.58, -0.56, 0.05, 0.035],
      [-1.2, -0.58, 0.08, 0.05],
    ]) {
      stems.push(xf(new THREE.BoxGeometry(0.02, hh, 0.02), [mx, F + hh / 2, mz]));
      caps.push(
        xf(
          new THREE.LatheGeometry(
            [new THREE.Vector2(0, 0), new THREE.Vector2(rr, 0), new THREE.Vector2(rr * 0.85, rr * 0.4), new THREE.Vector2(0, rr * 0.75)],
            6,
          ),
          [mx, F + hh - 0.005, mz],
        ),
      );
      spots.push(xf(new THREE.BoxGeometry(0.014, 0.01, 0.014), [mx + rr * 0.3, F + hh + rr * 0.55, mz + rr * 0.2]));
    }
    merged(stems, "#b8c8c0", root, { name: "mushroomStems" });
    glow(merged(caps, "#2fd6b4", root, { name: "mushroomCaps" }), 0.8);
    merged(spots, "#e8fff6", root, { name: "mushroomSpots" });
  }

  // Chest lid opens; set last so everything built above stays in its rest placement.
  b.pose(lid, { axis: [1, 0, 0], deg: -98 });

  return b.root;
}
