```ts
import * as THREE from "three";
import { catmull, createBuilder, DEG, frame, noise, rng } from "agentic-3js-builder";
import type { ColorInput, DirectionInput, Joint, PointInput } from "agentic-3js-builder";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  tileBox,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon vignette on a flagstone floor: an open treasure chest with glowing hoard, wall torches, barrels (one brewing glowing slime), a bone pile with skulls and ribcage, a hanging chain and a spike trap with an impaled skull.",
};

const TEXEL = 0.02;

const STONE = ["#15141b", "#232230", "#34333f", "#47465a", "#5d5c70", "#777689"];
const WOOD = ["#1f120b", "#3a2314", "#593620", "#7a4d2b", "#9a6a3c", "#b98a52"];
const IRON = ["#0f0f15", "#1f2029", "#343642", "#4f5262", "#70748a", "#9a9eb4"];
const BONE = ["#4a3e30", "#7d6c54", "#a89878", "#cdbf9e", "#e8dcc0", "#f6efd9"];
const MOSS = ["#2f4a22", "#4a6e2c", "#6f9a3c"];
const MORTAR = "#0d0c12";
const GOLD = "#f5c63a";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mod = (a: number, n: number) => ((a % n) + n) % n;
const hash = (a: number, b = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Opt = {
  bone?: Joint;
  dir?: DirectionInput;
  axis?: "x" | "y" | "z";
  rotation?: [number, number, number];
  texture?: THREE.Texture;
  quat?: THREE.Quaternion;
  flat?: boolean;
};

// ---------------------------------------------------------------------------------------------------------------
// Paints (quantized to square cells, ordered dither)

const woodPaint = (seed: number) =>
  cellPaint(
    TEXEL,
    (c) => {
      const plank = Math.floor(c.v / 4);
      const row = mod(c.v, 4);
      if (row === 0) return WOOD[0];
      let t = 0.4 + 0.3 * hash(plank, seed) + 0.3 * (noise(c.at, 0.3, seed) - 0.5);
      if (row === 3) t += 0.12;
      if (c.random(seed) < 0.07) t -= 0.2;
      return c.pick(WOOD, t);
    },
    { dither: true },
  );

const ironPaint = cellPaint(
  TEXEL,
  (c) => {
    if (noise(c.at, 0.25, 9) > 0.66 && c.random(4) < 0.7) return "#6b3a1c";
    return c.pick(
      IRON,
      0.33 + 0.3 * (noise(c.at, 0.18, 5) - 0.5) + (c.n.y > 0.5 ? 0.18 : 0) + 0.12 * (c.random(2) - 0.5),
    );
  },
  { dither: true },
);

const bonePaint = cellPaint(
  TEXEL * 0.75,
  (c) => c.pick(BONE, 0.62 + 0.25 * (noise(c.at, 0.12, 6) - 0.5) + 0.25 * (c.n.y - 0.3) + 0.15 * (c.random(1) - 0.5)),
  { dither: true },
);

const barrelPaint = (k: number, seed: number) =>
  cellPaint(
    TEXEL,
    (c) => {
      if (c.n.y > 0.6) {
        const plank = Math.floor(c.v / 3);
        if (mod(c.v, 3) === 0) return WOOD[0];
        return c.pick(WOOD, 0.45 + 0.3 * hash(plank, seed) + 0.1 * (c.random(3) - 0.5));
      }
      const deg = c.s[1];
      const stave = Math.floor(deg / 36);
      if (mod(deg, 36) < 3) return WOOD[0];
      let t = 0.38 + 0.28 * hash(stave, seed) + 0.25 * (noise(c.at, 0.3, seed) - 0.5) + (mod(deg, 36) > 30 ? 0.1 : 0);
      if (c.random(seed + 2) < 0.06) t -= 0.2;
      return c.pick(WOOD, t * (0.9 + 0.1 * k));
    },
    { dither: true },
  );

// ---------------------------------------------------------------------------------------------------------------
// Skull sheet layout (Minecraft-style skin box)

const SK = 0.022;
const LAYOUT = skinLayout({ cran: [8, 7, 9], jaw: [7, 3, 8] });

// Outline helpers
type Corner = [number, number, "sharp"];
const grown = (o: Corner[], g: number): Corner[] => {
  const xs = o.map((p) => p[0]);
  const ys = o.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2 + 1e-5;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 1e-5;
  return o.map(([x, y]) => [x + (x > cx ? g : -g), y + (y > cy ? g : -g), "sharp"]);
};

const BARREL_R: [number, number][] = [
  [0, 0.26],
  [0.15, 0.29],
  [0.45, 0.33],
  [0.75, 0.29],
  [0.9, 0.26],
];
const radiusAt = (y: number) => {
  for (let i = 0; i < BARREL_R.length - 1; i++) {
    if (y <= BARREL_R[i + 1][0]) {
      const t = (y - BARREL_R[i][0]) / (BARREL_R[i + 1][0] - BARREL_R[i][0]);
      return BARREL_R[i][1] + t * (BARREL_R[i + 1][1] - BARREL_R[i][1]);
    }
  }
  return 0.26;
};

export default function build() {
  const b = createBuilder({ name: "dungeon-props" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const GROUND = 0.12;
  const WALL_FRONT = -1.1;

  const put = (geo: THREE.BufferGeometry, color: ColorInput, at: PointInput, o: Opt = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, at: PointInput, o: Opt = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);

  const WOODP = woodPaint(2);
  const IRONP = ironPaint;
  const BONEP = bonePaint;

  // ------------------------------------------------------------------------------------------------------------
  // Textures

  const stoneTile = (seed: number, mossy: boolean) =>
    pixelTexture(36, 36, (g) => {
      const r = rng(seed);
      g.fill((x, y) =>
        pick(
          STONE,
          0.34 +
            0.12 * Math.sin(x * 0.45 + seed) * Math.cos(y * 0.37 - seed) +
            0.1 * (r() - 0.5) +
            0.06 * Math.sin((x + y) * 0.15),
          bayer(x, y),
        ),
      );
      for (let k = 0; k < 3; k++) {
        let x = Math.floor(r() * 36);
        let y = Math.floor(r() * 36);
        const dx = r() < 0.5 ? 1 : -1;
        const len = 8 + Math.floor(r() * 8);
        for (let i = 0; i < len; i++) {
          g.set(x, y, STONE[0]);
          if (r() < 0.55) x += dx;
          else y += 1;
        }
      }
      for (let i = 0; i < 22; i++) g.set(Math.floor(r() * 36), Math.floor(r() * 36), STONE[5]);
      if (mossy)
        for (let k = 0; k < 4; k++) {
          const cx = Math.floor(r() * 36);
          const cy = Math.floor(r() * 36);
          for (let dy = -3; dy <= 3; dy++)
            for (let dx = -3; dx <= 3; dx++) {
              const d = Math.hypot(dx, dy);
              if (d < 3.3 && 1 - d / 3.3 > bayer(cx + dx, cy + dy) * 0.9)
                g.set(cx + dx, cy + dy, MOSS[Math.floor(r() * 3)]);
            }
        }
    });
  const FLOORA = stoneTile(5, false);
  const FLOORB = stoneTile(9, true);

  const PLANKS = pixelTexture(48, 32, (g) => {
    g.fill((x, y) => {
      const plank = Math.floor(y / 4);
      const row = y % 4;
      if (row === 0) return WOOD[0];
      const t = 0.42 + 0.3 * hash(plank, 3) + 0.12 * Math.sin((x + plank * 11) * 0.35) + (row === 3 ? 0.12 : 0);
      return pick(WOOD, t, bayer(x, y));
    });
    for (let p = 0; p < 8; p++) {
      const sx = Math.floor(hash(p, 7) * 44) + 2;
      for (let r = 1; r < 4; r++) g.set(sx, p * 4 + r, WOOD[0]);
      g.set(2, p * 4 + 2, IRON[4]);
      g.set(45, p * 4 + 2, IRON[4]);
    }
  });

  const COINS = pixelTexture(32, 32, (g) => {
    const r = rng(51);
    g.fill((x, y) => (hash(x, y) < 0.5 ? "#6b4a14" : "#7a5516"));
    for (let i = 0; i < 90; i++) {
      const x = Math.floor(r() * 34) - 1;
      const y = Math.floor(r() * 34) - 1;
      for (let dy = 0; dy < 3; dy++)
        for (let dx = 0; dx < 3; dx++) g.set(x + dx, y + dy, dx === 1 && dy === 1 ? GOLD : "#b8860b");
      if (r() < 0.4) g.set(x, y, "#fff1a0");
    }
  });

  const LOCK = pixelArt(
    [
      "kkkkkkkkkkkk",
      "kiiiiiiiiiik",
      "kiiyyyyyyiik",
      "kiiygggggiik",
      "kiiygggggiik",
      "kiiygnnggdik",
      "kiiyggnggdik",
      "kiiyggnggdik",
      "kiiggggggdik",
      "kiiddddddiik",
      "kiiiiiiiiiik",
      "kiiiiiiiiiik",
      "kkkkkkkkkkkk",
    ],
    { k: IRON[0], i: IRON[3], y: "#ffe27a", g: GOLD, d: "#b8860b", n: IRON[0] },
  );

  const FLAME = pixelArt(
    [
      "......y.....",
      ".....oyy....",
      ".....oyyo...",
      "....ooyyo...",
      "....oyyyoo..",
      "...ooyyyyo..",
      "...oyywwyoo.",
      "..ooyywwyyoo",
      "..oyywwwwyoo",
      "..oyywwwwyoo",
      "..rooyywwyor",
      "..rroooyyoor",
      "...rrooooorr",
      "....rrrrrr..",
    ],
    { r: "#d6381a", o: "#ff7a1a", y: "#ffc233", w: "#fff2a8" },
  );

  const SPILL = pixelTexture(48, 48, (g) =>
    g.fill((x, y) => {
      const v = 1 - Math.hypot(x - 23.5, y - 23.5) / 24;
      if (v <= 0 || v * 1.15 <= bayer(x, y) + 0.15) return "";
      return v > 0.55 ? "#f0a040" : "#b8642a";
    }),
  );

  const TRAP = pixelTexture(48, 48, (g) => {
    const r = rng(61);
    g.fill((x, y) => {
      const edge = Math.min(x, y, 47 - x, 47 - y);
      if (edge === 0) return IRON[0];
      if (edge === 1) return IRON[4];
      if (edge === 2) return IRON[2];
      return pick(IRON, 0.34 + 0.1 * Math.sin(x * 0.9) * Math.cos(y * 0.7) + 0.08 * (r() - 0.5), bayer(x, y));
    });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fill(() => "#050408", [4 + 12 * i, 4 + 12 * j, 4, 4]);
    for (let i = 0; i < 50; i++) g.set(3 + Math.floor(r() * 42), 3 + Math.floor(r() * 42), r() < 0.5 ? "#6b3a1c" : IRON[1]);
    for (const [x, y] of [
      [3, 3],
      [44, 3],
      [3, 44],
      [44, 44],
    ])
      g.set(x, y, IRON[5]);
  });

  const SHEET = pixelTexture(LAYOUT.size[0], LAYOUT.size[1], (g) => {
    const r = rng(21);
    for (const faces of Object.values(LAYOUT.faces))
      for (const rect of Object.values(faces)) g.fill((x, y) => pick(BONE, 0.55 + 0.3 * r() - 0.04 * y, bayer(x, y)), rect);
    const cf = LAYOUT.faces.cran.pz;
    g.stamp(
      cf[0],
      cf[1],
      ["........", "...k....", "........", ".kk..kk.", ".kk..kk.", "...kk...", "wwkwwkww"],
      { k: "#1b1218", w: "#f4ecd6" },
    );
    const jf = LAYOUT.faces.jaw.pz;
    g.stamp(jf[0], jf[1], ["wwkwkww", "wwwwwww"], { k: "#1b1218", w: "#f4ecd6" });
    const tf = LAYOUT.faces.cran.py;
    for (let i = 1; i < 8; i++) g.set(tf[0] + 3 + (i % 3 === 0 ? 1 : 0), tf[1] + i, BONE[0]);
  });

  const LINK = pixelArt(
    [".gggg.", "gg..gg", "g....g", "g....g", "g....g", "g....g", "g....g", "g....g", "gg..gg", ".gggg."],
    { g: "#8a8ea4" },
  );

  const BLOOD = pixelTexture(24, 24, (g) => {
    const r = rng(71);
    for (let i = 0; i < 110; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.7) * 10;
      g.set(Math.round(12 + Math.cos(a) * d), Math.round(12 + Math.sin(a) * d), d < 5 ? "#7a1018" : "#4e0a12");
    }
    for (let i = 0; i < 8; i++) g.set(Math.floor(r() * 24), Math.floor(r() * 24), "#4e0a12");
  });

  const MARK = pixelArt(
    [
      "..wwwwww..",
      ".wwwwwwww.",
      ".wkkwwkkw.",
      ".wkkwwkkw.",
      ".wwwkkwww.",
      "..wwwwww..",
      "..wkwkwk..",
      "...wwww...",
    ],
    { w: "#e8dcc0", k: "#2a1a10" },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Flagstone floor

  box(3.6, 0.08, 2.8, MORTAR, [0, 0.04, 0]);
  const rf = rng(11);
  [-1.05, -0.35, 0.35, 1.05].forEach((z, ri) => {
    const widths = ri % 2 === 0 ? [0.6, 0.6, 0.6, 0.6, 0.6, 0.6] : [0.3, 0.6, 0.6, 0.6, 0.6, 0.6, 0.3];
    let x = -1.8;
    for (const w of widths) {
      const h = 0.11 + rf() * 0.025;
      const tex = rf() < 0.35 ? FLOORB : FLOORA;
      put(tileBox([w - 0.014, h, 0.686], tex, TEXEL, { rand: rf }), "#ffffff", [x + w / 2, h / 2, z], { texture: tex });
      x += w;
    }
  });

  // ------------------------------------------------------------------------------------------------------------
  // Back wall

  box(3.6, 2.2, 0.28, MORTAR, [0, 0.1 + 1.1, -1.25]);
  const rw = rng(17);
  for (let c = 0; c < 5; c++) {
    const widths = c % 2 === 0 ? [0.6, 0.6, 0.6, 0.6, 0.6, 0.6] : [0.3, 0.6, 0.6, 0.6, 0.6, 0.6, 0.3];
    let x = -1.8;
    const y0 = 0.1 + c * 0.44;
    for (const w of widths) {
      const skip = c === 4 && rw() < 0.3;
      const h = c === 4 ? 0.44 - rw() * 0.14 : 0.44;
      if (!skip) {
        const tex = rw() < 0.4 ? FLOORB : FLOORA;
        put(tileBox([w - 0.014, h - 0.014, 0.3], tex, TEXEL, { rand: rw }), "#ffffff", [x + w / 2, y0 + h / 2, -1.25], {
          texture: tex,
        });
      }
      x += w;
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Torches

  const wallTorch = (x: number, y: number, seed: number) => {
    const m = V(x, y, -1.06);
    const d = V(0, 1, 0.5).normalize();
    const at = (t: number) => m.clone().addScaledVector(d, t);
    glow(put(new THREE.PlaneGeometry(1.15, 1.15), "#ffffff", V(x, y + 0.5, WALL_FRONT + 0.006), { texture: SPILL }), 0.4);
    box(0.2, 0.34, 0.05, IRONP, V(x, y + 0.04, -1.075));
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) box(0.03, 0.03, 0.02, IRON[5], V(x + sx * 0.07, y + 0.04 + sy * 0.12, -1.048));
    put(new THREE.BoxGeometry(0.07, 0.72, 0.07), woodPaint(seed), at(0.32), { dir: d });
    for (const t of [0.12, 0.45]) put(new THREE.BoxGeometry(0.105, 0.04, 0.105), IRONP, at(t), { dir: d });
    put(new THREE.BoxGeometry(0.115, 0.17, 0.115), "#2a1c14", at(0.6), { dir: d });
    for (const t of [0.55, 0.61, 0.67]) put(new THREE.BoxGeometry(0.128, 0.02, 0.128), "#8a6a3a", at(t), { dir: d });
    put(new THREE.BoxGeometry(0.1, 0.04, 0.1), "#1a1210", at(0.7), { dir: d });
    const F = at(0.72);
    glow(
      b.cards([frame(F, [0, 1, 0])], FLAME, { size: [0.3, 0.42], cross: true, flow: [0, 0, 1], sink: 0, bone: root }),
      1,
    );
    glow(box(0.1, 0.12, 0.1, "#ff8a1a", F.clone().add(V(0, 0.07, 0))), 1.4);
    glow(box(0.06, 0.1, 0.06, "#ffd23a", F.clone().add(V(0, 0.15, 0))), 1.6);
    const rs = rng(seed * 7);
    for (let i = 0; i < 4; i++)
      glow(
        box(0.022, 0.022, 0.022, "#ffcf4a", F.clone().add(V((rs() - 0.5) * 0.25, 0.35 + rs() * 0.25, (rs() - 0.5) * 0.2))),
        2,
      );
  };
  wallTorch(-1.25, 1.15, 3);
  wallTorch(1.25, 1.15, 4);

  // Fallen, guttering torch on the floor
  {
    const yaw = 65;
    const d = V(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG));
    const c = V(-0.45, GROUND + 0.04, 1.15);
    const along = (t: number) => c.clone().addScaledVector(d, t);
    put(new THREE.BoxGeometry(0.07, 0.62, 0.07), WOODP, c, { dir: d });
    put(new THREE.BoxGeometry(0.115, 0.16, 0.115), "#1c1410", along(0.34), { dir: d });
    for (const t of [0.28, 0.4]) put(new THREE.BoxGeometry(0.125, 0.02, 0.125), "#8a6a3a", along(t), { dir: d });
    put(new THREE.BoxGeometry(0.1, 0.04, 0.1), IRONP, along(-0.15), { dir: d });
    const top = along(0.42);
    glow(
      b.cards([frame(top.clone().add(V(0, 0.05, 0)), [0, 1, 0])], FLAME, {
        size: [0.14, 0.2],
        cross: true,
        flow: [0, 0, 1],
        sink: 0,
        bone: root,
      }),
      1,
    );
    for (const [ox, oz] of [
      [0.1, 0.05],
      [-0.08, 0.12],
      [0.2, -0.06],
    ])
      glow(box(0.025, 0.02, 0.025, "#ff5a1a", V(top.x + ox, GROUND + 0.012, top.z + oz)), 1.5);
    glow(put(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", V(top.x, 0.14, top.z), { dir: [0, 1, 0], axis: "z", texture: SPILL }), 0.3);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Treasure chest

  const CX = -0.55;
  const CZ = -0.45;
  const CY = GROUND;
  const bodyTop = CY + 0.45;
  const rc = rng(23);
  put(tileBox([0.95, 0.45, 0.6], PLANKS, TEXEL, { rand: rc, step: [1, 4] }), "#ffffff", [CX, CY + 0.225, CZ], {
    texture: PLANKS,
  });
  for (const s of [1, -1]) {
    box(0.1, 0.47, 0.62, IRONP, [CX + s * 0.3, CY + 0.225, CZ]);
    for (const yy of [0.1, 0.22, 0.34]) box(0.026, 0.026, 0.02, IRON[5], [CX + s * 0.3, CY + yy, CZ + 0.315]);
    for (const sz of [-1, 1]) box(0.06, 0.47, 0.06, IRONP, [CX + s * 0.475, CY + 0.225, CZ + sz * 0.3]);
  }
  box(0.97, 0.06, 0.62, IRONP, [CX, CY + 0.07, CZ]);
  for (const sz of [-1, 1]) box(0.97, 0.05, 0.07, IRONP, [CX, bodyTop - 0.025, CZ + sz * 0.275]);
  for (const sx of [-1, 1]) box(0.07, 0.05, 0.62, IRONP, [CX + sx * 0.45, bodyTop - 0.025, CZ]);
  put(new THREE.PlaneGeometry(0.24, 0.26), "#ffffff", [CX, CY + 0.3, CZ + 0.316], { texture: LOCK });

  // Lid, hinged at the back
  const lid = b.joint("lidHinge", { parent: root, at: [CX, bodyTop, CZ - 0.3], dir: [0, 0, 1], role: "hinge" });
  const arch = stepped(
    [3, 4, 5, 5, 5, 5, 4, 3].map((h) => [0, h] as [number, number]),
    [0.0775, 0.05],
  );
  b.extrude(arch, { at: [CX, bodyTop, CZ - 0.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.97, color: woodPaint(5), bone: lid });
  for (const s of [1, -1])
    b.extrude(grown(arch, 0.012), {
      at: [CX + s * 0.3, bodyTop, CZ - 0.3],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.1,
      color: IRONP,
      bone: lid,
    });
  box(0.11, 0.2, 0.05, GOLD, [CX, bodyTop - 0.02, CZ + 0.335], { bone: lid });
  box(0.05, 0.05, 0.03, "#b8860b", [CX, bodyTop - 0.1, CZ + 0.355], { bone: lid });

  // Hoard inside
  box(0.86, 0.012, 0.5, "#150c07", [CX, bodyTop + 0.004, CZ]);
  const gl: [number, number, number, number][] = [
    [0.84, 0.05, 0.48, 0.03],
    [0.66, 0.05, 0.36, 0.075],
    [0.44, 0.05, 0.24, 0.12],
    [0.22, 0.04, 0.14, 0.16],
  ];
  for (const [w, h, d, y] of gl)
    glow(put(tileBox([w, h, d], COINS, TEXEL, { rand: rc }), "#ffffff", [CX, bodyTop + y, CZ], { texture: COINS }), 0.6);
  const gems: [string, number, number, number][] = [
    ["#e0243a", -0.18, 0.2, 0.05],
    ["#2a8cff", 0.12, 0.2, 0.0],
    ["#3ddc84", 0.0, 0.205, -0.08],
    ["#e0243a", 0.28, 0.1, 0.1],
  ];
  for (const [col, gx, gy, gz] of gems)
    glow(put(new THREE.OctahedronGeometry(0.03, 0), col, [CX + gx, bodyTop + gy, CZ + gz], { flat: true }), 1.5);
  // Coins spilled on the floor
  for (let i = 0; i < 7; i++) {
    const a = rc() * Math.PI * 2;
    glow(
      box(0.05, 0.008, 0.05, GOLD, [CX - 0.3 + rc() * 0.7, GROUND + 0.004, CZ + 0.45 + rc() * 0.2], {
        rotation: [(rc() - 0.5) * 10, a / DEG, (rc() - 0.5) * 10],
      }),
      0.5,
    );
  }

  b.pose(lid, { axis: [1, 0, 0], deg: -100 });

  // ------------------------------------------------------------------------------------------------------------
  // Barrels

  const barrel = (base: THREE.Vector3, axis: THREE.Vector3, k: number, open: boolean, seed: number) => {
    const o: [number, number][] = [
      [0, 0],
      [0.26 * k, 0],
      [0.29 * k, 0.15 * k],
      [0.33 * k, 0.45 * k],
      [0.29 * k, 0.75 * k],
      [0.26 * k, 0.9 * k],
    ];
    if (open) o.push([0.22 * k, 0.9 * k], [0.22 * k, 0.72 * k], [0, 0.72 * k]);
    else o.push([0.235 * k, 0.9 * k], [0.235 * k, 0.875 * k], [0, 0.875 * k]);
    const body = b.lathe(o, { at: base, axis, segments: 10, color: barrelPaint(k, seed), bone: root });
    for (const y of [0.12, 0.3, 0.6, 0.78]) {
      const r = radiusAt(y) * k;
      const yy = y * k;
      b.lathe(
        [
          [r - 0.02, yy - 0.028],
          [r + 0.022, yy - 0.028],
          [r + 0.022, yy + 0.028],
          [r - 0.02, yy + 0.028],
        ],
        { at: base, axis, segments: 10, color: IRONP, bone: root },
      );
    }
    return body;
  };

  const barrelA = barrel(V(0.85, GROUND - 0.005, -0.62), V(0, 1, 0), 1, false, 3);
  b.decal(barrelA, MARK, { at: V(0.85, GROUND + 0.45, -0.62 + 0.33), dir: [0, 0, 1], size: [0.2, 0.2], segments: 6 });

  // Open barrel brewing glowing slime
  {
    const bx = 1.52;
    const bz = -0.7;
    const k = 0.85;
    barrel(V(bx, GROUND - 0.005, bz), V(0, 1, 0), k, true, 8);
    glow(put(new THREE.CylinderGeometry(0.2 * k, 0.2 * k, 0.02, 10), "#5dff3a", V(bx, GROUND + 0.8 * k, bz), { flat: true }), 1.2);
    for (const [ox, oz, oy] of [
      [0.05, 0.03, 0.14],
      [-0.07, -0.02, 0.24],
      [0.02, -0.08, 0.34],
    ])
      glow(box(0.03, 0.03, 0.03, "#9dff7a", V(bx + ox, GROUND + 0.8 * k + oy, bz + oz)), 2);
  }

  // Barrel lying on its side
  {
    const axis = V(0.3, 0, 1).normalize();
    const centre = V(1.38, GROUND + 0.315, 0.2);
    const base = centre.clone().addScaledVector(axis, -0.45);
    barrel(base, axis, 1, false, 12);
    // tap
    box(0.045, 0.045, 0.1, IRON[4], centre.clone().addScaledVector(axis, 0.0).add(V(0, 0.01, 0)).add(V(-0.0, 0, 0)).add(V(0.0, 0, 0)).add(V(0, 0, 0)).setY(centre.y - 0.02).setX(centre.x + 0.0).setZ(centre.z), {
      rotation: [0, 0, 0],
    });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Bones

  const longBone = (c: THREE.Vector3, yaw: number, tilt: number, len: number) => {
    const d = V(Math.sin(yaw * DEG) * Math.cos(tilt * DEG), Math.sin(tilt * DEG), Math.cos(yaw * DEG) * Math.cos(tilt * DEG));
    const side = V(d.z, 0, -d.x).normalize();
    put(new THREE.BoxGeometry(0.036, len, 0.036), BONEP, c, { dir: d });
    for (const e of [-1, 1])
      for (const s of [-1, 1])
        put(
          new THREE.BoxGeometry(0.052, 0.05, 0.052),
          BONEP,
          c.clone().addScaledVector(d, e * (len / 2 - 0.01)).addScaledVector(side, s * 0.017),
          { dir: d },
        );
  };

  const qOf = (pitch: number, yaw: number, roll: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ"));

  const skull = (C: THREE.Vector3, q: THREE.Quaternion, open: number, eyes: boolean, name: string) => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(C);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    put(skinBox(SHEET, LAYOUT.faces.cran, SK), "#ffffff", C, { quat: q, texture: SHEET });
    const jaw = b.joint(`jaw${name}`, { parent: root, at: v(0, -0.06, -0.05), dir: fwd, role: "jaw" });
    put(skinBox(SHEET, LAYOUT.faces.jaw, SK), "#ffffff", v(0, -0.104, 0.012), { bone: jaw, quat: q, texture: SHEET });
    if (eyes)
      for (const s of [1, -1])
        glow(put(new THREE.PlaneGeometry(SK, SK), "#ff2a2a", v(s * 2 * SK, -0.011, 0.1), { quat: q }), 2);
    b.pose(jaw, { axis: jaw.dir([-1, 0, 0]), deg: open });
  };

  // Pile of long bones with a skull on top
  const rb = rng(31);
  for (let i = 0; i < 9; i++) {
    const ang = rb() * Math.PI * 2;
    const rad = rb() * 0.28;
    longBone(V(-1.35 + Math.cos(ang) * rad, GROUND + 0.03 + 0.03 * (i % 3), 0.3 + Math.sin(ang) * rad), rb() * 180, (rb() - 0.5) * 20, 0.28 + rb() * 0.14);
  }
  skull(V(-1.33, GROUND + 0.2, 0.3), qOf(8, 30, 0), 12, true, "A");
  skull(V(-1.68, GROUND + 0.08, 0.95), qOf(0, -40, 80), 25, false, "C");

  // Ribcage lying flat
  {
    const z0 = 0.95;
    for (let k = 0; k < 7; k++) {
      const x = -1.3 + k * 0.075;
      box(0.045, 0.04, 0.045, BONEP, [x, GROUND + 0.025, z0]);
      for (const s of [1, -1]) {
        const f = 1 - Math.abs(k - 3) * 0.12;
        const GR = GROUND;
        b.sweep(
          catmull([
            [x, GR + 0.035, z0],
            [x, GR + 0.095, z0 + s * 0.1 * f],
            [x + 0.015, GR + 0.08, z0 + s * 0.2 * f],
            [x + 0.03, GR + 0.03, z0 + s * 0.27 * f],
          ]),
          [0.016, 0.009],
          { sides: 4, caps: "flat", color: BONEP, bone: root },
        );
      }
    }
    box(0.1, 0.045, 0.06, BONEP, [-0.72, GROUND + 0.025, z0]);
    for (const s of [1, -1]) box(0.07, 0.04, 0.12, BONEP, [-0.66, GROUND + 0.025, z0 + s * 0.09], { rotation: [0, s * 25, 0] });
    for (let i = 0; i < 6; i++) box(0.016, 0.016, 0.05, BONEP, [-0.95 + rb() * 0.5, GROUND + 0.01, 1.28 + rb() * 0.1], { rotation: [0, rb() * 180, 0] });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Spike trap

  const TX = 0.4;
  const TZ = 0.7;
  const spikes = b.joint("spikes", { parent: root, at: [TX, 0.15, TZ], dir: [0, 1, 0] });
  box(0.96, 0.06, 0.96, "#ffffff", [TX, 0.12, TZ], { texture: TRAP });
  for (const s of [1, -1]) {
    box(1.1, 0.08, 0.07, IRONP, [TX, 0.12, TZ + s * 0.515]);
    box(0.07, 0.08, 0.96, IRONP, [TX + s * 0.515, 0.12, TZ]);
  }
  const rs = rng(41);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const x = TX - 0.36 + 0.24 * i;
      const z = TZ - 0.36 + 0.24 * j;
      const impaled = i === 1 && j === 2;
      const h = impaled ? 0.58 : 0.32 + rs() * 0.1;
      const base = 0.17;
      box(0.1, 0.03, 0.1, IRONP, [x, 0.155, z], { bone: spikes });
      put(new THREE.ConeGeometry(0.04, h, 4), IRONP, V(x, base + h / 2, z), { bone: spikes, rotation: [0, 45, 0], flat: true });
      const tipH = 0.11;
      put(new THREE.ConeGeometry(0.04 * (tipH / h) * 1.15, tipH, 4), "#7a1018", V(x, base + h - tipH / 2, z), {
        bone: spikes,
        rotation: [0, 45, 0],
        flat: true,
      });
      if (impaled) skull(V(x, base + h + 0.01, z), qOf(-50, 200, 0), 22, true, "B");
    }
  put(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", V(0.4, 0.14, 1.38), { dir: [0, 1, 0], axis: "z", texture: BLOOD });
  put(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", V(-0.5, 0.14, 0.45), { dir: [0, 1, 0], axis: "z", texture: BLOOD });

  // ------------------------------------------------------------------------------------------------------------
  // Hanging chain with shackle

  {
    const x = 0.45;
    box(0.14, 0.07, 0.06, IRONP, [x, 2.05, -1.07]);
    for (let i = 0; i < 9; i++)
      put(new THREE.BoxGeometry(0.06, 0.1, 0.012), "#ffffff", V(x, 2.0 - i * 0.075 - 0.05, -1.06), {
        texture: LINK,
        rotation: [0, i % 2 ? 90 : 0, 0],
      });
    box(0.15, 0.06, 0.08, IRONP, [x, 1.33, -1.06]);
    for (const s of [-1, 1]) box(0.04, 0.12, 0.08, IRONP, [x + s * 0.06, 1.25, -1.06]);
    box(0.16, 0.03, 0.08, IRONP, [x, 1.19, -1.06]);
  }

  return b.root;
}
```