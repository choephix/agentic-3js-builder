// Monster truck "MUD HOG": a pixel-art pickup on 1.7 m tyres. Every surface shows hard square texels: body, chassis
// and tyres are cell paints on one 4 cm grid, decals and lights are pixel textures at the same texel size.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { aim } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bezier, spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { cellPaint, pixelArt, pixelTexture, skinBox, skinLayout, snapColor } from "../../../../kits/pixel";
import type { PixelGrid } from "../../../../kits/pixel";

export const meta = {
  name: "Mud Hog Monster Truck",
  description:
    "A pixel-art monster truck on 1.7 m tyres: flame-painted orange pickup body, caged cab with a helmeted driver, supercharged engine with header stacks, coil-over shocks and live axles, roll-bar light rack and a hog on the tailgate.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ------------------------------------------------------------------------------------------------------------
// Palette

const TEXEL = 0.04;
const D = Math.PI / 180;
const snap = (c: string) => snapColor(c, 64);
const ramp = (list: string[]) => list.map(snap);

const INK = "#15131b";
const STEEL_D = "#2c303b";
const STEEL = "#444b5b";
const CHROME = "#cfd8e0";
const CHROME_L = "#f2f7fa";
const CHROME_D = "#8c98a8";
const TEAL = "#19c3b0";
const TEAL_D = "#0d8378";
const RED = "#d92b1a";
const YELLOW = "#ffd23a";
const WHITE = "#f4f1e8";
const BURNT = "#7a62d0";
const FLAME_LINE = "#1a0f14";
const FLAME = ["", "#c91f10", "#ff9a1f", "#fff08a"];

const ORANGES = ramp(["#7d2308", "#b83a0b", "#ff6a13", "#ff8c3d", "#ffb878"]);
const BLACKS = ramp(["#0b0a10", "#17151e", "#23212d", "#34313f"]);
const STEELS = ramp(["#1d2029", "#2c303b", "#444b5b", "#5f687b", "#7e889c"]);
const CHROMES = ramp(["#5a6778", "#8c98a8", "#cfd8e0", "#f2f7fa"]);
const TEALS = ramp(["#0a5a52", "#0d8378", "#19c3b0", "#5fe8d6"]);
const RUBBERS = ramp(["#0c0c11", "#17171e", "#22222b", "#30303b"]);
const GLASS = ramp(["#0b1430", "#16264d", "#244075", "#3f68a8"]);
const MUDS = ramp(["#3b2917", "#5a3f26", "#7a5a38"]);

// ------------------------------------------------------------------------------------------------------------
// Pixel font (5 rows) and small texture builders

const FONT: Record<string, string[]> = {
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  U: ["#...#", "#...#", "#...#", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "####."],
  H: ["#...#", "#...#", "#####", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", ".###."],
  G: [".####", "#....", "#..##", "#...#", ".####"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "3": ["####.", "....#", ".###.", "....#", "####."],
  " ": ["..", "..", "..", "..", ".."],
};

function stampText(g: PixelGrid, x0: number, y0: number, text: string, color: string) {
  let x = x0;
  for (const ch of text) {
    const gl = FONT[ch] ?? FONT[" "];
    gl.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] === "#") g.set(x + i, y0 + j, color);
    });
    x += gl[0].length + 1;
  }
}

/** Text with a one-pixel drop shadow; `bg` adds a two-pixel plate round it. */
function textTexture(text: string, fg: string, shadow: string, bg?: string) {
  const width = [...text].reduce((s, ch) => s + (FONT[ch] ?? FONT[" "])[0].length + 1, 0);
  const pad = bg ? 2 : 0;
  return pixelTexture(width + 2 * pad, 6 + 2 * pad, (g) => {
    if (bg) g.fill(() => bg);
    stampText(g, pad + 1, pad + 1, text, shadow);
    stampText(g, pad, pad, text, fg);
  });
}

/** Size in pixels of a kit texture. */
const pixelsOf = (t: THREE.Texture) => t.userData.pixels as [number, number];

const NAME_TEX = textTexture("MUD HOG", WHITE, INK);
const BANNER_TEX = textTexture("MUD HOG", YELLOW, "#5a3c00", INK);
const NUMBER_TEX = pixelTexture(15, 11, (g) => {
  g.fill(() => TEAL);
  g.fill(() => INK, [1, 1, 13, 9]);
  stampText(g, 3, 3, "13", WHITE);
});
const HOG_TEX = pixelArt(
  [
    "..kkk.....kkk..",
    ".kpppk...kpppk.",
    ".kppppkkkppppk.",
    "kpppppppppppppk",
    "kppwwkpppkwwppk",
    "kppwkkpppkkwppk",
    "kpppppppppppppk",
    "kppdddddddddppk",
    "kppdddkdkdddppk",
    "kppdddddddddppk",
    ".kpwpppppppwpk.",
    "..kkkkkkkkkkk..",
  ],
  { k: "#1b1420", p: "#f6a0b4", d: "#d86f8d", w: "#ffffff" },
);
const HEADLIGHT_TEX = pixelArt(
  ["kkkkkkkk", "kwwwwwwk", "kwyyyywk", "kwyyyywk", "kwwwwwwk", "kkkkkkkk"],
  { k: "#2a2d36", w: "#fff8d8", y: "#ffe870" },
);
const TAILLIGHT_TEX = pixelArt(
  ["kkkk", "krrk", "kRRk", "krrk", "krrk", "kRRk", "krrk", "kkkk"],
  { k: "#2a2d36", r: "#d8261a", R: "#ff6a50" },
);
const ROUND_LIGHT_TEX = pixelArt(
  [
    "..kkkk..",
    ".kwwwwk.",
    "kwwyywwk",
    "kwyyyywk",
    "kwyyyywk",
    "kwwyywwk",
    ".kwwwwk.",
    "..kkkk..",
  ],
  { k: "#2a2d36", w: "#fff8d8", y: "#ffe870" },
);
const BAR_LIGHT_TEX = pixelArt(["kkkkkk", "kwyywk", "kwyywk", "kkkkkk"], { k: "#2a2d36", w: "#fff8d8", y: "#ffe870" });
const AMBER_TEX = pixelArt(["kkkkkk", "koooak", "kkkkkk"], { k: "#2a2d36", o: "#ffb020", a: "#ffd76a" });
const GRILLE_TEX = pixelTexture(24, 12, (g) => {
  g.fill(() => "#0e0d13");
  for (const y of [1, 4, 7, 10]) g.fill((x) => (x > 0 && x < 23 ? (x % 6 === 1 ? CHROME_L : CHROME) : undefined), [0, y, 24, 1]);
  for (const y of [2, 5, 8, 11]) g.fill((x) => (x > 0 && x < 23 ? CHROME_D : undefined), [0, y, 24, 1]);
  g.fill(() => TEAL_D, [11, 0, 2, 12]);
  g.fill(() => TEAL, [11, 0, 1, 12]);
});
const NET_TEX = pixelTexture(36, 28, (g) => g.fill((x, y) => (x % 4 === 0 || y % 4 === 0 ? "#14131a" : undefined)));
const FLAG_TEX = pixelTexture(8, 6, (g) => g.fill((x, y) => ((x + y) % 2 ? WHITE : INK)));
const PLATE_TEX = pixelTexture(15, 9, (g) => {
  g.fill(() => "#c9c4b0");
  g.fill((x, y) => (x === 0 || y === 0 || x === 14 || y === 8 ? TEAL_D : undefined));
  stampText(g, 3, 2, "13", INK);
});

// Driver's helmet: white shell, dark visor, teal stripe.
const HELMET_LAYOUT = skinLayout({ head: [8, 8, 8] });
const HELMET_SHEET = pixelTexture(HELMET_LAYOUT.size[0], HELMET_LAYOUT.size[1], (g) => {
  const f = HELMET_LAYOUT.faces.head;
  for (const rect of Object.values(f)) g.fill((_x, y, _w, h) => (y > h - 2 ? "#c8c4b8" : WHITE), rect);
  g.fill((x, y) => (x > 0 && x < 7 && y > 1 && y < 5 ? "#12203f" : undefined), f.pz);
  g.fill((x, y) => (x === 2 && y === 2 ? "#6fa0ff" : x === 3 && y === 2 ? "#3f68a8" : undefined), f.pz);
  g.fill(() => TEAL, [f.py[0] + 3, f.py[1], 2, 8]);
  g.fill((x, y) => (x < 3 && y > 1 && y < 5 ? "#12203f" : undefined), f.px);
  g.fill((x, y) => (x > 4 && y > 1 && y < 5 ? "#12203f" : undefined), f.nx);
  g.fill((x, y) => (x > 2 && x < 5 && y > 2 && y < 5 ? TEAL : undefined), f.px);
  g.fill((x, y) => (x > 2 && x < 5 && y > 2 && y < 5 ? TEAL : undefined), f.nx);
  g.fill((x, y) => (y === 3 && x > 1 && x < 6 ? TEAL : undefined), f.nz);
});

// ------------------------------------------------------------------------------------------------------------
// Paints (cells are 4 cm on the large panels, finer on small hardware)

const h01 = (a: number, b = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Sawtooth flame tongues: `a` runs across the tongues, `d` along them from the base. 0 = none, 1..3 = outer..core. */
function flame(a: number, d: number, period: number, length: number, seed: number) {
  if (d < 0) return 0;
  const k = Math.floor(a / period);
  const f = a / period - k;
  const L = length * (0.55 + 0.45 * h01(k, seed)) * (1 - Math.pow(f, 1.2));
  if (d >= L) return 0;
  const r = d / L;
  return r < 0.3 ? 3 : r < 0.62 ? 2 : 1;
}
const sideFlame = (z: number, y: number) => {
  const dd = 2.6 - z;
  return flame(y - 1.52 - 0.34 * Math.pow(Math.max(dd, 0) / 2.4, 1.4), dd, 0.19, 2.3, 3);
};
const hoodFlame = (x: number, z: number) => flame(Math.abs(x) + 0.05, 2.6 - z, 0.2, 1.6, 8);

const BODY: Paint = cellPaint(
  TEXEL,
  (c) => {
    const { x, y, z } = c.at;
    const n = c.n;
    const mud = noise(c.at, 0.3, 11) + (2.0 - y) * 0.7 + (n.y < -0.3 ? 0.3 : 0) - (n.y > 0.5 ? 1 : 0);
    if (mud > 1.08) return c.pick(MUDS, noise(c.at, 0.12, 4));
    if (c.axis === 0 && y > 1.52 && y < 2.45 && z > 0.1 && sideFlame(z, y) > 0) {
      const edge = [
        [TEXEL, 0],
        [-TEXEL, 0],
        [0, TEXEL],
        [0, -TEXEL],
      ].some(([dz, dy]) => sideFlame(z + dz, y + dy) === 0);
      return edge ? FLAME_LINE : FLAME[sideFlame(z, y)];
    }
    if (c.axis === 1 && n.y > 0.5 && z > 1.0 && y > 2.05 && y < 2.4 && hoodFlame(x, z) > 0) {
      const edge = [
        [TEXEL, 0],
        [-TEXEL, 0],
        [0, TEXEL],
        [0, -TEXEL],
      ].some(([dx, dz]) => hoodFlame(x + dx, z + dz) === 0);
      return edge ? FLAME_LINE : FLAME[hoodFlame(x, z)];
    }
    if (c.axis === 0 && z < -0.82 && y > 1.7 && y < 2.2) {
      if ((y > 1.96 && y < 2.0) || (y > 2.08 && y < 2.12)) return TEAL;
      if (y > 2.0 && y < 2.08) return YELLOW;
    }
    if (c.random(4) < 0.012) return ORANGES[0];
    const v = 0.52 + 0.34 * n.y - 0.1 * Math.abs(n.z) + (y - 2.0) * 0.1 + 0.1 * (noise(c.at, 0.4, 2) - 0.5);
    return c.pick(ORANGES, v);
  },
  { dither: true },
);

/** Door skins: the body paint with a dark panel line round the edge. */
const doorPaint = cellPaint(TEXEL, (c) => {
  if (c.axis === 0 && (c.at.z < -0.14 + TEXEL || c.at.z > 0.9 - TEXEL || c.at.y < 1.58 + TEXEL || c.at.y > 2.34 - TEXEL))
    return "#6a1f07";
  return BODY;
});

const TRIM: Paint = cellPaint(
  TEXEL,
  (c) => {
    if (c.axis === 1 && c.n.y > 0.5 && Math.abs(c.at.x) > 0.74 && Math.abs(c.at.x) < 0.82 && c.at.y > 2.9) return TEAL_D;
    return c.pick(BLACKS, 0.35 + 0.45 * c.n.y + 0.2 * (noise(c.at, 0.3, 6) - 0.5));
  },
  { dither: true },
);

const STEELP: Paint = cellPaint(
  0.03,
  (c) => {
    const { x, y, z } = c.at;
    if (c.axis === 0 && Math.abs(x) > 0.38 && Math.abs(x) < 0.52 && Math.abs(y - 1.2) < 0.05) {
      const m = ((Math.floor(z / 0.03) % 9) + 9) % 9;
      if (m > 1 && m < 7) return STEELS[0];
    }
    const mud = noise(c.at, 0.3, 21) + (1.4 - y) * 0.9;
    if (mud > 1.0) return c.pick(MUDS, noise(c.at, 0.1, 3));
    return c.pick(STEELS, 0.4 + 0.3 * c.n.y + 0.25 * (noise(c.at, 0.2, 7) - 0.5) + (c.random(1) < 0.04 ? 0.3 : 0));
  },
  { dither: true },
);

const CHROMEP: Paint = cellPaint(
  0.02,
  (c) => {
    if (c.random(2) < 0.04) return CHROME_L;
    return c.pick(CHROMES, 0.45 + 0.35 * c.n.y + 0.2 * c.n.x * (c.axis === 0 ? 1 : 0) + 0.15 * Math.sin(c.u * 0.9 + c.v * 0.4));
  },
  { dither: true },
);

const TEALP: Paint = cellPaint(0.025, (c) => c.pick(TEALS, 0.45 + 0.4 * c.n.y + 0.1 * (c.random(3) - 0.5)), { dither: true });

const GLASSP: Paint = cellPaint(TEXEL, (c) => {
  const d = (((c.u * 2 + c.v) % 14) + 14) % 14;
  if (d < 2) return "#9fc3ff";
  if (d === 2 || d === 13) return "#5f8fd6";
  return c.pick(GLASS, 0.3 + 0.25 * noise(c.at, 0.3, 9) + 0.2 * c.n.y);
});

function tirePaint(hy: number, hz: number): Paint {
  return cellPaint(
    TEXEL,
    (c) => {
      const dy = c.at.y - hy;
      const dz = c.at.z - hz;
      const r = Math.hypot(dy, dz);
      const mud = noise(c.at, 0.22, 8) + (r - 0.5) * 0.9 + (0.5 - dy / 0.85) * 0.12;
      if (c.axis === 0) {
        if (r > 0.6 && r < 0.64) return "#5d5d6b";
        if (r > 0.66 && r < 0.74) {
          const sector = Math.floor(((Math.atan2(dz, dy) + Math.PI) / (2 * Math.PI)) * 44);
          if (sector % 2 === 0 && h01(sector, 5) > 0.15) return "#dcd8cb";
        }
        if (mud > 1.14) return c.pick(MUDS, noise(c.at, 0.1, 2));
        return c.pick(RUBBERS, 0.3 + 0.2 * (noise(c.at, 0.3, 1) - 0.5) + 0.25 * (r - 0.5));
      }
      if (mud > 0.98) return c.pick(MUDS, noise(c.at, 0.1, 2));
      return c.pick(RUBBERS, 0.38 + 0.3 * c.n.y + 0.2 * (noise(c.at, 0.25, 1) - 0.5));
    },
    { dither: true },
  );
}

function rimPaints(hy: number, hz: number) {
  const chrome = cellPaint(0.025, (c) => {
    const dy = c.at.y - hy;
    const r = Math.hypot(dy, c.at.z - hz);
    if (r > 0.54) return CHROME_D;
    return c.pick(CHROMES, 0.55 + 0.45 * (dy / 0.58));
  }, { dither: true });
  const teal = cellPaint(0.025, (c) => {
    const dy = c.at.y - hy;
    const dz = c.at.z - hz;
    const r = Math.hypot(dy, dz);
    const sector = (((Math.atan2(dz, dy) + Math.PI) / (2 * Math.PI)) * 8) % 1;
    if (c.axis === 0 && r > 0.2 && r < 0.37 && Math.abs(sector - 0.5) < 0.2) return "#0b3d3a";
    if (r > 0.36) return TEALS[1];
    return c.pick(TEALS, 0.55 + 0.45 * (dy / 0.4));
  }, { dither: true });
  return { chrome, teal };
}

// ------------------------------------------------------------------------------------------------------------

type V = [number, number, number];
type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });

  // ---- skeleton ------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 1.2, 0] });
  const axleF = b.joint("axleF", { parent: chassis, at: [0, 0.85, 1.5], dir: [0, 1, 0], role: "hinge" });
  const axleR = b.joint("axleR", { parent: chassis, at: [0, 0.85, -1.5], dir: [0, 1, 0], role: "hinge" });
  const steer: Record<number, Joint> = {};
  const wheelJ: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    steer[s] = b.joint(`steerF${side}`, { parent: axleF, at: [s * 1.1, 0.85, 1.5], dir: [0, 1, 0], role: "hinge" });
    wheelJ[`F${s}`] = b.joint(`wheelF${side}`, { parent: steer[s], at: [s * 1.5, 0.85, 1.5], dir: [s, 0, 0], role: "hinge" });
    wheelJ[`R${s}`] = b.joint(`wheelR${side}`, { parent: axleR, at: [s * 1.5, 0.85, -1.5], dir: [s, 0, 0], role: "hinge" });
  }
  const doorJ: Record<number, Joint> = {};
  for (const s of [1, -1])
    doorJ[s] = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 0.9, 1.6, 0.9], dir: [0, 1, 0], role: "hinge" });
  const hood = b.joint("hood", { parent: chassis, at: [0, 2.16, 1.0], dir: [0, 0, 1], role: "hinge" });
  const tailgate = b.joint("tailgate", { parent: chassis, at: [0, 1.76, -2.55], dir: [0, 0, -1], role: "hinge" });
  const wheelSteer = b.joint("steeringWheel", { parent: chassis, at: [0.42, 2.3, 0.32], dir: [0, 0.5, -0.86], role: "hinge" });

  // ---- merge bags: many small static pieces become one part per bone and colour -------------------------
  const bags = new Map<string, { bone: Joint; color: Col; geos: THREE.BufferGeometry[] }>();
  const add = (bone: Joint, color: Col, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${String(color)}`;
    let e = bags.get(key);
    if (!e) bags.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(g);
  };
  const place = (g: THREE.BufferGeometry, pos: V, rot?: V) => {
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)));
    return g.translate(pos[0], pos[1], pos[2]);
  };
  const box = (bone: Joint, color: Col, size: V, pos: V, rot?: V) =>
    add(bone, color, place(new THREE.BoxGeometry(size[0], size[1], size[2]), pos, rot));
  const cyl = (bone: Joint, color: Col, rTop: number, rBot: number, h: number, pos: V, axis: "x" | "y" | "z", seg = 8) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    if (axis === "x") g.rotateZ(-Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    add(bone, color, place(g, pos));
  };
  const tube = (bone: Joint, color: Col, a: V, c: V, r: number, seg = 6) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const dir = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(r, r, dir.length(), seg);
    g.applyQuaternion(aim(dir));
    const m = A.clone().add(C).multiplyScalar(0.5);
    add(bone, color, g.translate(m.x, m.y, m.z));
  };
  const bar = (bone: Joint, color: Col, a: V, c: V, w: number) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const dir = C.clone().sub(A);
    const g = new THREE.BoxGeometry(w, dir.length(), w);
    g.applyQuaternion(aim(dir));
    const m = A.clone().add(C).multiplyScalar(0.5);
    add(bone, color, g.translate(m.x, m.y, m.z));
  };
  const decal = (bone: Joint, tex: THREE.Texture, size: [number, number], at: V, dir: V, up: V = [0, 1, 0], circle = false) =>
    b.part(circle ? new THREE.CircleGeometry(size[0] / 2, 12) : new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      texture: tex,
      bone,
      at,
      dir,
      up,
      axis: "z",
    });

  // ---- wheels --------------------------------------------------------------------------------------------
  const wheel = (hub: V, out: number, bone: Joint) => {
    const [hx, hy, hz] = hub;
    const tp = tirePaint(hy, hz);
    const profile = [
      [0, -0.4],
      [0.5, -0.4],
      [0.6, -0.45],
      [0.74, -0.45],
      [0.78, -0.33],
      [0.78, 0.33],
      [0.74, 0.45],
      [0.6, 0.45],
      [0.5, 0.4],
      [0, 0.4],
    ].map(([r, a]) => new THREE.Vector2(r, a));
    const core = new THREE.LatheGeometry(profile, 16);
    core.rotateZ(-Math.PI / 2);
    add(bone, tp, core.translate(hx, hy, hz));
    const N = 22;
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < N; i++) {
        const th = ((i + row * 0.5) / N) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.3, 0.07, 0.15);
        g.rotateY((row ? -1 : 1) * 22 * D);
        g.rotateX(th);
        add(bone, tp, g.translate(hx + (row ? -0.2 : 0.2), hy + Math.cos(th) * 0.815, hz + Math.sin(th) * 0.815));
      }
    for (const sx of [1, -1])
      for (let i = 0; i < N; i++) {
        const th = ((i + (sx > 0 ? 0.25 : 0.75)) / N) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.1, 0.1, 0.12);
        g.rotateX(th);
        add(bone, tp, g.translate(hx + sx * 0.4, hy + Math.cos(th) * 0.78, hz + Math.sin(th) * 0.78));
      }
    const rp = rimPaints(hy, hz);
    for (const sx of [1, -1]) {
      const outer = sx === out;
      const xs = (a: number) => hx + sx * a;
      const disc = new THREE.CylinderGeometry(0.58, 0.58, 0.07, 20);
      disc.rotateZ(-Math.PI / 2);
      add(bone, rp.chrome, disc.translate(xs(0.435), hy, hz));
      for (let i = 0; i < 20; i++) {
        const th = (i / 20) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.04, 0.07, 0.07);
        g.rotateX(th);
        add(bone, "#2a2d36", g.translate(xs(0.47), hy + Math.cos(th) * 0.52, hz + Math.sin(th) * 0.52));
      }
      const tdisc = new THREE.CylinderGeometry(0.4, 0.4, 0.04, 16);
      tdisc.rotateZ(-Math.PI / 2);
      add(bone, rp.teal, tdisc.translate(xs(0.49), hy, hz));
      const hubcap = new THREE.CylinderGeometry(0.15, 0.15, outer ? 0.1 : 0.05, 8);
      hubcap.rotateZ(-Math.PI / 2);
      add(bone, CHROME_L, hubcap.translate(xs(outer ? 0.54 : 0.515), hy, hz));
      if (outer)
        for (let i = 0; i < 8; i++) {
          const th = (i / 8) * Math.PI * 2;
          const g = new THREE.BoxGeometry(0.05, 0.05, 0.05);
          g.rotateX(th + 0.4);
          add(bone, STEEL_D, g.translate(xs(0.525), hy + Math.cos(th) * 0.27, hz + Math.sin(th) * 0.27));
        }
    }
  };
  for (const s of [1, -1]) {
    wheel([s * 1.5, 0.85, 1.5], s, wheelJ[`F${s}`]);
    wheel([s * 1.5, 0.85, -1.5], s, wheelJ[`R${s}`]);
  }

  // ---- axles, shocks, links ----------------------------------------------------------------------------
  const springs: [Joint, V][] = [];
  const axleBuild = (axle: Joint, z0: number, front: boolean) => {
    const sgn = front ? 1 : -1; // direction toward the chassis centre is -sgn
    box(axle, STEELP, [1.8, 0.18, 0.18], [0, 0.85, z0]);
    box(axle, STEELP, [1.7, 0.04, 0.2], [0, 0.96, z0]);
    cyl(axle, STEELP, 0.22, 0.2, 0.3, [0, 0.88, z0 - sgn * 0.2], "z", 8);
    cyl(axle, TEALP, 0.15, 0.15, 0.06, [0, 0.88, z0 - sgn * 0.37], "z", 8);
    for (let i = 0; i < 8; i++) {
      const th = (i / 8) * Math.PI * 2;
      box(axle, CHROME_L, [0.035, 0.035, 0.035], [Math.sin(th) * 0.19, 0.88 + Math.cos(th) * 0.19, z0 - sgn * 0.4]);
    }
    for (const s of [1, -1]) {
      const knuckle = front ? steer[s] : axle;
      box(knuckle, STEELP, [0.14, 0.5, 0.34], [s * 0.94, 0.85, z0]);
      box(knuckle, TEALP, [0.05, 0.3, 0.2], [s * 1.02, 0.85, z0]);
      cyl(knuckle, STEEL, 0.08, 0.08, 0.14, [s * 1.07, 0.85, z0], "x", 8);
      cyl(knuckle, STEEL_D, 0.05, 0.05, 0.6, [s * 0.9, 0.85, z0], "y", 6);
      // four-link
      tube(axle, STEEL, [s * 0.6, 0.76, z0], [s * 0.45, 1.1, z0 - sgn * 1.1], 0.04);
      tube(axle, STEEL, [s * 0.3, 1.02, z0], [s * 0.4, 1.3, z0 - sgn * 0.95], 0.04);
      box(axle, STEEL_D, [0.1, 0.1, 0.1], [s * 0.6, 0.76, z0]);
      box(axle, STEEL_D, [0.1, 0.1, 0.1], [s * 0.3, 1.02, z0]);
      // shock tower: bracket under the body, post, cross bar
      box(chassis, STEELP, [0.58, 0.09, 0.14], [s * 0.74, 1.36, z0]);
      box(chassis, STEELP, [0.1, 0.72, 0.1], [s * 0.97, 1.62, z0]);
      box(chassis, STEELP, [0.12, 0.08, 0.8], [s * 0.97, 1.98, z0]);
      tube(chassis, STEEL, [s * 0.97, 1.4, z0], [s * 0.97, 1.94, z0 + sgn * 0.3], 0.025, 4);
      for (const dz of [-0.3, 0.3]) {
        const zz = z0 + dz;
        box(axle, STEEL_D, [0.12, 0.08, 0.12], [s * 0.97, 0.96, zz]);
        tube(axle, STEEL, [s * 0.78, 0.9, zz], [s * 0.97, 0.96, zz], 0.035, 4);
        cyl(axle, TEALP, 0.055, 0.055, 0.52, [s * 0.97, 1.24, zz], "y", 8);
        cyl(chassis, CHROMEP, 0.025, 0.025, 0.5, [s * 0.97, 1.7, zz], "y", 6);
        box(chassis, STEEL_D, [0.1, 0.06, 0.1], [s * 0.97, 1.93, zz]);
        cyl(axle, STEEL_D, 0.09, 0.09, 0.03, [s * 0.97, 1.01, zz], "y", 8);
        cyl(chassis, STEEL_D, 0.09, 0.09, 0.03, [s * 0.97, 1.56, zz], "y", 8);
        springs.push([axle, [s * 0.97, 1.03, zz]]);
      }
    }
    // steering / panhard rod
    tube(axle, STEEL, [-1.0, 0.7, z0 + sgn * 0.22], [1.0, 0.7, z0 + sgn * 0.22], 0.03);
    box(axle, STEEL_D, [0.2, 0.1, 0.1], [0.5, 0.7, z0 + sgn * 0.22]);
  };
  axleBuild(axleF, 1.5, true);
  axleBuild(axleR, -1.5, false);
  for (const [axle, p] of springs)
    b.sweep(spiral(p, [p[0] + 0.078, p[1], p[2]], [0, 1, 0], { turns: 7, r1: 0.078, pitch: 0.075 }), 0.016, {
      color: TEAL,
      bone: axle,
      section: { ngon: 4 },
      detail: 0.4,
      name: "coil",
    });

  // ---- frame, drivetrain, engine -------------------------------------------------------------------------
  for (const s of [1, -1]) {
    box(chassis, STEELP, [0.05, 0.2, 4.9], [s * 0.45, 1.2, 0]);
    box(chassis, STEELP, [0.16, 0.04, 4.9], [s * 0.45, 1.1, 0]);
    box(chassis, STEELP, [0.16, 0.04, 4.9], [s * 0.45, 1.3, 0]);
  }
  for (const z of [-2.3, -1.7, -0.9, -0.05, 0.9, 1.9, 2.3]) {
    box(chassis, STEELP, [0.8, 0.12, 0.12], [0, 1.2, z]);
    box(chassis, STEEL_D, [0.7, 0.04, 0.16], [0, 1.28, z]);
  }
  // body mounts
  for (const s of [1, -1])
    for (const z of [-2.1, -0.4, 0.8, 1.2, 2.2]) {
      box(chassis, INK, [0.14, 0.2, 0.14], [s * 0.45, 1.4, z]);
    }
  // transmission, driveshafts
  box(chassis, STEELP, [0.46, 0.34, 0.9], [0, 1.1, 0.05]);
  box(chassis, TEALP, [0.3, 0.2, 0.3], [0, 0.9, 0.05]);
  tube(chassis, STEEL, [0, 1.1, 0.5], [0, 0.97, 1.12], 0.045);
  tube(chassis, STEEL, [0, 1.1, -0.4], [0, 0.97, -1.12], 0.045);
  box(chassis, STEEL_D, [0.1, 0.1, 0.1], [0, 1.1, 0.5]);
  box(chassis, STEEL_D, [0.1, 0.1, 0.1], [0, 1.1, -0.4]);
  box(chassis, STEELP, [0.7, 0.04, 0.9], [0, 1.27, 1.75]); // skid plate
  // engine block, valve covers, belt drive
  box(chassis, STEELP, [0.62, 0.6, 0.85], [0, 1.65, 1.68]);
  for (const s of [1, -1]) box(chassis, CHROMEP, [0.1, 0.08, 0.7], [s * 0.3, 1.97, 1.68]);
  box(chassis, STEEL_D, [0.5, 0.45, 0.1], [0, 1.68, 2.15]);
  cyl(chassis, CHROMEP, 0.16, 0.16, 0.08, [0, 1.95, 2.18], "z", 10);
  cyl(chassis, INK, 0.1, 0.1, 0.1, [0, 1.95, 2.18], "z", 8);
  // blower, scoop, header stacks
  box(chassis, CHROMEP, [0.62, 0.34, 0.5], [0, 2.14, 1.68]);
  box(chassis, CHROMEP, [0.5, 0.2, 0.4], [0, 2.4, 1.68]);
  box(chassis, INK, [0.42, 0.14, 0.04], [0, 2.4, 1.89]);
  box(chassis, TEALP, [0.54, 0.05, 0.44], [0, 2.52, 1.68]);
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = 1.46 + i * 0.15;
      box(chassis, STEEL_D, [0.1, 0.05, 0.1], [s * 0.36, 1.95, z]);
      b.sweep(bezier([s * 0.36, 1.95, z], [s * 0.37, 2.4, z], [s * 0.46, 2.8, z]), 0.04, {
        color: CHROME,
        bands: [
          [0.62, CHROME],
          [0.82, "#9aa6c8"],
          [1, BURNT],
        ],
        bone: chassis,
        sides: 6,
        caps: "flat",
        detail: 0.6,
        name: "header",
      });
    }

  // ---- nose: fenders, front panel, hood ----------------------------------------------------------------------
  for (const s of [1, -1]) {
    box(chassis, BODY, [0.4, 0.62, 1.55], [s * 0.7, 1.81, 1.775]); // fender
    box(chassis, TRIM, [0.42, 0.04, 1.55], [s * 0.7, 2.14, 1.775]); // fender cap
    box(chassis, TRIM, [0.4, 0.14, 0.06], [s * 0.7, 1.6, 2.58]); // lower valance
    // headlight bezel and amber marker
    box(chassis, TRIM, [0.36, 0.3, 0.04], [s * 0.7, 1.88, 2.57]);
    box(chassis, CHROMEP, [0.3, 0.04, 0.04], [s * 0.7, 2.06, 2.58]);
  }
  box(chassis, BODY, [1.0, 0.62, 0.1], [0, 1.81, 2.5]); // front panel
  box(chassis, TRIM, [1.0, 0.1, 0.06], [0, 1.6, 2.58]); // grille chin
  box(chassis, BODY, [1.0, 0.62, 0.08], [0, 1.81, 1.04]); // firewall
  box(chassis, BODY, [1.8, 0.1, 0.31], [0, 2.3, 0.845]); // cowl
  // hood (hinged at the cowl)
  const hoodBox = (size: V, pos: V) => add(hood, BODY, place(new THREE.BoxGeometry(size[0], size[1], size[2]), pos));
  hoodBox([1.8, 0.08, 0.6], [0, 2.16, 2.25]);
  hoodBox([1.8, 0.08, 0.4], [0, 2.16, 1.2]);
  for (const s of [1, -1]) hoodBox([0.38, 0.08, 0.55], [s * 0.71, 2.16, 1.675]);
  for (const s of [1, -1]) for (const z of [1.1, 2.45]) box(hood, CHROME_L, [0.05, 0.03, 0.05], [s * 0.8, 2.21, z]);
  box(hood, TRIM, [1.8, 0.03, 0.05], [0, 2.2, 2.55]); // hood lip

  // ---- cab ---------------------------------------------------------------------------------------------
  // Hollow shell: floor, side walls to the belt line (y 2.25), open windows above, roof on pillars.
  box(chassis, TRIM, [1.8, 0.1, 1.75], [0, 1.55, 0.075]); // floor
  for (const s of [1, -1]) box(chassis, BODY, [0.06, 0.75, 1.75], [s * 0.87, 1.875, 0.075]); // side walls
  box(chassis, BODY, [1.68, 0.75, 0.13], [0, 1.875, 0.935]); // cab front
  box(chassis, BODY, [1.68, 0.75, 0.08], [0, 1.875, -0.76]); // cab back
  box(chassis, BODY, [1.68, 0.7, 0.06], [0, 2.6, -0.77]); // back wall above the belt
  box(chassis, GLASSP, [1.3, 0.4, 0.03], [0, 2.6, -0.805]); // rear window
  box(chassis, TRIM, [1.76, 0.1, 1.58], [0, 3.0, -0.03]); // roof
  box(chassis, TRIM, [1.64, 0.04, 1.5], [0, 2.95, -0.03]);
  const wsSlope = Math.atan2(0.25, 0.6);
  add(chassis, GLASSP, place(new THREE.BoxGeometry(1.66, 0.65, 0.04), [0, 2.65, 0.83], [-wsSlope / D, 0, 0]));
  add(chassis, TRIM, place(new THREE.BoxGeometry(1.78, 0.04, 0.22), [0, 2.98, 0.78], [-wsSlope / D, 0, 0]));
  for (const s of [1, -1]) {
    bar(chassis, TRIM, [s * 0.86, 2.24, 0.95], [s * 0.86, 2.98, 0.72], 0.1); // A pillar
    box(chassis, TRIM, [0.1, 0.7, 0.12], [s * 0.86, 2.6, -0.2]); // B pillar
    bar(chassis, TRIM, [s * 0.86, 2.24, -0.8], [s * 0.86, 2.98, -0.72], 0.1); // C pillar
    box(chassis, GLASSP, [0.03, 0.5, 0.45], [s * 0.88, 2.6, -0.5]); // quarter glass
    box(chassis, TRIM, [0.1, 0.05, 1.04], [s * 0.86, 2.27, 0.33]); // sill
    box(chassis, CHROMEP, [0.04, 0.04, 1.8], [s * 0.9, 1.52, 0.05]); // rocker trim
    // roll cage seen through the windows
    tube(chassis, STEEL_D, [s * 0.76, 1.6, -0.45], [s * 0.76, 2.9, -0.45], 0.025);
    tube(chassis, STEEL_D, [s * 0.76, 2.45, 0.78], [s * 0.76, 2.45, -0.45], 0.022);
    tube(chassis, STEEL_D, [s * 0.76, 2.24, 0.88], [s * 0.76, 2.9, 0.7], 0.025);
    tube(chassis, STEEL_D, [s * 0.76, 2.9, 0.7], [s * 0.76, 2.9, -0.45], 0.022);
    // seats
    const sx = s * 0.42;
    box(chassis, TRIM, [0.5, 0.12, 0.5], [sx, 1.68, 0.05]);
    add(chassis, TRIM, place(new THREE.BoxGeometry(0.5, 0.72, 0.1), [sx, 2.1, -0.24], [-8, 0, 0]));
    box(chassis, TEALP, [0.5, 0.04, 0.5], [sx, 1.75, 0.05]);
    box(chassis, TEALP, [0.08, 0.7, 0.12], [sx - 0.21, 2.1, -0.2]);
    box(chassis, TEALP, [0.08, 0.7, 0.12], [sx + 0.21, 2.1, -0.2]);
    box(chassis, TRIM, [0.3, 0.2, 0.1], [sx, 2.58, -0.27]); // head rest
  }
  tube(chassis, STEEL_D, [-0.76, 2.9, -0.45], [0.76, 2.9, -0.45], 0.025);
  tube(chassis, STEEL_D, [-0.76, 2.45, -0.45], [0.76, 2.45, -0.45], 0.022);
  box(chassis, TRIM, [0.2, 0.3, 0.55], [0, 1.78, 0.12]); // console
  box(chassis, STEEL, [0.04, 0.2, 0.04], [0, 2.0, 0.3]); // shifter
  box(chassis, INK, [0.07, 0.07, 0.07], [0, 2.12, 0.3]);
  // dash
  box(chassis, TRIM, [1.6, 0.5, 0.36], [0, 2.1, 0.68]);
  box(chassis, TRIM, [1.6, 0.06, 0.4], [0, 2.4, 0.7]);
  box(chassis, TEALP, [0.4, 0.06, 0.04], [0.42, 2.32, 0.5]);
  // steering column + wheel
  tube(chassis, STEEL_D, [0.42, 2.18, 0.52], [0.42, 2.28, 0.34], 0.025);
  {
    const c = new THREE.Vector3(0.42, 2.3, 0.32);
    const u = new THREE.Vector3(1, 0, 0);
    const w = new THREE.Vector3(0, -0.862, -0.507);
    const ring: V[] = [];
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      const p = c.clone().addScaledVector(u, Math.cos(t) * 0.14).addScaledVector(w, Math.sin(t) * 0.14);
      ring.push([p.x, p.y, p.z]);
    }
    for (let i = 0; i < 8; i++) tube(wheelSteer, INK, ring[i], ring[(i + 1) % 8], 0.022, 4);
    tube(wheelSteer, INK, ring[0], ring[4], 0.018, 4);
    tube(wheelSteer, INK, ring[2], ring[6], 0.018, 4);
    box(wheelSteer, TEAL, [0.07, 0.07, 0.07], [c.x, c.y, c.z]);
  }
  // driver: suit, harness, arms, helmet
  box(chassis, TEAL_D, [0.38, 0.52, 0.22], [0.42, 2.1, -0.06]);
  box(chassis, INK, [0.06, 0.46, 0.02], [0.34, 2.14, 0.06]);
  box(chassis, INK, [0.06, 0.46, 0.02], [0.5, 2.14, 0.06]);
  box(chassis, YELLOW, [0.1, 0.06, 0.02], [0.42, 2.0, 0.06]);
  tube(chassis, TEAL_D, [0.6, 2.28, -0.06], [0.54, 2.3, 0.3], 0.05);
  tube(chassis, TEAL_D, [0.24, 2.28, -0.06], [0.3, 2.3, 0.3], 0.05);
  box(chassis, INK, [0.09, 0.09, 0.09], [0.54, 2.3, 0.33]);
  box(chassis, INK, [0.09, 0.09, 0.09], [0.3, 2.3, 0.33]);
  b.part(skinBox(HELMET_SHEET, HELMET_LAYOUT.faces.head, 0.0275), "#ffffff", {
    texture: HELMET_SHEET,
    bone: chassis,
    at: [0.42, 2.6, -0.02],
    name: "helmet",
  });

  // ---- doors --------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const dj = doorJ[s];
    add(dj, doorPaint, place(new THREE.BoxGeometry(0.05, 0.66, 1.04), [s * 0.925, 1.91, 0.38]));
    box(dj, CHROMEP, [0.05, 0.05, 0.2], [s * 0.955, 2.08, 0.02]); // handle
    box(dj, CHROMEP, [0.05, 0.03, 0.05], [s * 0.955, 2.08, 0.15]);
    box(dj, STEEL_D, [0.04, 0.06, 0.06], [s * 0.95, 2.17, 0.1]); // lock
    // mirror
    tube(dj, STEEL_D, [s * 0.93, 2.45, 0.85], [s * 1.08, 2.55, 0.9], 0.02, 4);
    box(dj, TRIM, [0.06, 0.18, 0.14], [s * 1.12, 2.55, 0.9]);
    box(dj, TEAL, [0.02, 0.14, 0.1], [s * 1.155, 2.55, 0.9]);
    // window net and number badge
    decal(dj, NET_TEX, [0.9, 0.7], [s * 0.915, 2.6, 0.33], [s, 0, 0]);
    decal(dj, NUMBER_TEX, [0.45, 0.33], [s * 0.958, 1.9, 0.4], [s, 0, 0]);
  }

  // ---- bed ----------------------------------------------------------------------------------------------
  box(chassis, BODY, [1.8, 0.22, 1.75], [0, 1.61, -1.675]);
  box(chassis, TRIM, [1.64, 0.06, 1.7], [0, 1.74, -1.675]);
  const [nameW, nameH] = pixelsOf(NAME_TEX);
  for (const s of [1, -1]) {
    box(chassis, BODY, [0.08, 0.5, 1.75], [s * 0.86, 1.95, -1.675]);
    box(chassis, CHROMEP, [0.14, 0.04, 1.75], [s * 0.86, 2.22, -1.675]);
    box(chassis, TRIM, [0.02, 0.16, 1.7], [s * 0.78, 1.85, -1.675]);
    decal(chassis, NAME_TEX, [nameW * 0.03, nameH * 0.03], [s * 0.912, 1.84, -1.7], [s, 0, 0]);
    decal(chassis, AMBER_TEX, [0.18, 0.09], [s * 0.912, 1.64, -2.4], [s, 0, 0]);
    // tail lights
    box(chassis, TRIM, [0.2, 0.34, 0.05], [s * 0.8, 1.98, -2.58]);
    decal(chassis, TAILLIGHT_TEX, [0.16, 0.32], [s * 0.8, 1.98, -2.608], [0, 0, -1]);
  }
  box(chassis, TRIM, [1.64, 0.7, 0.06], [0, 2.07, -0.86]); // headboard
  // tailgate
  add(tailgate, BODY, place(new THREE.BoxGeometry(1.4, 0.45, 0.07), [0, 1.985, -2.55]));
  add(tailgate, CHROMEP, place(new THREE.BoxGeometry(1.42, 0.04, 0.09), [0, 2.21, -2.55]));
  add(tailgate, TEALP, place(new THREE.BoxGeometry(1.4, 0.03, 0.08), [0, 1.78, -2.55]));
  for (const s of [1, -1]) add(tailgate, CHROMEP, place(new THREE.BoxGeometry(0.06, 0.1, 0.05), [s * 0.62, 2.12, -2.59]));
  decal(tailgate, HOG_TEX, [0.3, 0.24], [-0.5, 1.97, -2.592], [0, 0, -1]);
  decal(tailgate, NAME_TEX, [nameW * 0.02, nameH * 0.02], [0.17, 2.08, -2.592], [0, 0, -1]);
  decal(tailgate, PLATE_TEX, [0.3, 0.18], [0.2, 1.88, -2.592], [0, 0, -1]);
  // rear bumper
  box(chassis, STEELP, [1.7, 0.14, 0.14], [0, 1.45, -2.68]);
  box(chassis, TEALP, [0.3, 0.1, 0.16], [0, 1.45, -2.68]);
  for (const s of [1, -1]) {
    box(chassis, STEELP, [0.1, 0.1, 0.4], [s * 0.45, 1.42, -2.5]);
    box(chassis, RED, [0.08, 0.1, 0.1], [s * 0.7, 1.35, -2.74]);
  }
  // bed cargo: nitro bottles, toolbox, jerry can, rope, battery
  for (const x of [0.5, 0.26]) {
    cyl(chassis, TEALP, 0.1, 0.1, 0.9, [x, 1.9, -1.25], "z", 8);
    cyl(chassis, CHROME_L, 0.04, 0.04, 0.1, [x, 1.9, -0.76], "z", 6);
    box(chassis, INK, [0.24, 0.24, 0.05], [x, 1.9, -1.0]);
    box(chassis, INK, [0.24, 0.24, 0.05], [x, 1.9, -1.5]);
  }
  box(chassis, RED, [0.5, 0.28, 0.3], [-0.52, 1.91, -1.1]);
  box(chassis, CHROME_D, [0.5, 0.04, 0.04], [-0.52, 2.06, -1.1]);
  box(chassis, CHROME_L, [0.06, 0.06, 0.04], [-0.52, 1.95, -0.94]);
  box(chassis, YELLOW, [0.3, 0.4, 0.16], [-0.58, 1.97, -1.75]);
  box(chassis, INK, [0.1, 0.06, 0.06], [-0.58, 2.2, -1.75]);
  box(chassis, YELLOW, [0.06, 0.1, 0.06], [-0.5, 2.19, -1.75]);
  cyl(chassis, "#b49a64", 0.15, 0.15, 0.1, [-0.3, 1.82, -2.1], "y", 8);
  cyl(chassis, "#8a7340", 0.08, 0.08, 0.11, [-0.3, 1.82, -2.1], "y", 8);
  box(chassis, TEALP, [0.4, 0.2, 0.3], [0.38, 1.85, -2.1]);
  box(chassis, RED, [0.06, 0.04, 0.04], [0.28, 1.97, -2.1]);
  box(chassis, INK, [0.06, 0.04, 0.04], [0.48, 1.97, -2.1]);
  // roll hoop with a rack of round lamps
  for (const s of [1, -1]) {
    tube(chassis, STEEL_D, [s * 0.7, 1.76, -1.0], [s * 0.7, 3.3, -1.0], 0.04, 8);
    tube(chassis, STEEL_D, [s * 0.7, 3.3, -1.0], [s * 0.78, 2.2, -2.2], 0.03);
    box(chassis, STEEL_D, [0.14, 0.04, 0.14], [s * 0.7, 1.78, -1.0]);
  }
  tube(chassis, STEEL_D, [-0.72, 3.3, -1.0], [0.72, 3.3, -1.0], 0.04, 8);
  tube(chassis, STEEL_D, [-0.7, 2.6, -1.0], [0.7, 2.6, -1.0], 0.03);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    cyl(chassis, TRIM, 0.11, 0.11, 0.12, [x, 3.43, -1.0], "z", 8);
    box(chassis, STEEL_D, [0.04, 0.1, 0.05], [x, 3.34, -1.0]);
    decal(chassis, ROUND_LIGHT_TEX, [0.18, 0.18], [x, 3.43, -0.935], [0, 0, 1], [0, 1, 0], true);
  }
  // twin exhaust stacks behind the cab
  for (const s of [1, -1]) {
    cyl(chassis, CHROMEP, 0.06, 0.06, 0.9, [s * 0.5, 2.62, -1.15], "y", 8);
    cyl(chassis, CHROMEP, 0.1, 0.06, 0.12, [s * 0.5, 3.12, -1.15], "y", 8);
    cyl(chassis, BURNT, 0.07, 0.07, 0.03, [s * 0.5, 3.18, -1.15], "y", 8);
    box(chassis, STEEL_D, [0.12, 0.06, 0.12], [s * 0.5, 2.3, -1.15]);
    box(chassis, STEEL_D, [0.12, 0.06, 0.12], [s * 0.5, 2.9, -1.15]);
  }
  // antenna with a chequered flag
  tube(chassis, INK, [-0.8, 2.22, -2.45], [-0.82, 3.7, -2.45], 0.014, 4);
  box(chassis, STEEL_D, [0.08, 0.1, 0.08], [-0.8, 2.24, -2.45]);
  b.part(new THREE.BoxGeometry(0.012, 0.2, 0.3), "#ffffff", { texture: FLAG_TEX, bone: chassis, at: [-0.82, 3.6, -2.6], name: "flag" });

  // ---- front end: bumper, bull bar, lights, grille ------------------------------------------------------
  box(chassis, STEELP, [1.9, 0.16, 0.16], [0, 1.6, 2.74]);
  box(chassis, CHROMEP, [1.9, 0.04, 0.17], [0, 1.69, 2.74]);
  for (const s of [1, -1]) {
    box(chassis, STEELP, [0.14, 0.14, 0.4], [s * 0.45, 1.3, 2.55]);
    bar(chassis, STEELP, [s * 0.45, 1.3, 2.7], [s * 0.45, 1.6, 2.74], 0.12);
    bar(chassis, STEEL_D, [s * 0.7, 1.6, 2.74], [s * 0.7, 2.05, 2.7], 0.07);
    bar(chassis, STEEL_D, [s * 0.7, 2.05, 2.7], [s * 0.25, 2.3, 2.64], 0.07);
    box(chassis, RED, [0.1, 0.1, 0.16], [s * 0.3, 1.5, 2.78]);
    cyl(chassis, TRIM, 0.09, 0.09, 0.08, [s * 0.9, 1.6, 2.82], "z", 8);
    decal(chassis, ROUND_LIGHT_TEX, [0.14, 0.14], [s * 0.9, 1.6, 2.865], [0, 0, 1], [0, 1, 0], true);
    // headlights + turn signals
    decal(chassis, HEADLIGHT_TEX, [0.3, 0.225], [s * 0.7, 1.88, 2.595], [0, 0, 1]);
    decal(chassis, AMBER_TEX, [0.24, 0.12], [s * 0.7, 1.67, 2.595], [0, 0, 1]);
  }
  box(chassis, TEALP, [0.4, 0.26, 0.22], [0, 1.62, 2.7]); // winch
  cyl(chassis, CHROMEP, 0.07, 0.07, 0.34, [0, 1.62, 2.82], "x", 8);
  tube(chassis, STEEL_D, [-0.25, 2.3, 2.64], [0.25, 2.3, 2.64], 0.035);
  decal(chassis, GRILLE_TEX, [0.96, 0.48], [0, 1.82, 2.556], [0, 0, 1]);
  // roof light bar, roof number, windshield banner
  box(chassis, TRIM, [1.5, 0.14, 0.12], [0, 3.13, 0.5]);
  for (const s of [1, -1]) box(chassis, STEEL_D, [0.08, 0.1, 0.1], [s * 0.55, 3.07, 0.5]);
  for (let i = 0; i < 6; i++) decal(chassis, BAR_LIGHT_TEX, [0.2, 0.12], [-0.625 + i * 0.25, 3.13, 0.563], [0, 0, 1]);
  decal(chassis, NUMBER_TEX, [0.6, 0.44], [0, 3.058, -0.2], [0, 1, 0], [0, 0, 1]);
  const [banW, banH] = pixelsOf(BANNER_TEX);
  decal(chassis, BANNER_TEX, [banW * 0.02, banH * 0.02], [0, 2.793, 0.798], [0, 0.38, 0.92], [0, 0.92, -0.38]);

  // ---- flush bags ------------------------------------------------------------------------------------------
  let n = 0;
  for (const { bone, color, geos } of bags.values()) {
    const live = geos.filter((g) => g.getAttribute("position"));
    if (!live.length) continue;
    const merged = mergeGeometries(live);
    if (!merged) throw new Error(`merge failed on ${bone.name}`);
    b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `${bone.name}.${n++}` });
  }
  return b.root;
}
