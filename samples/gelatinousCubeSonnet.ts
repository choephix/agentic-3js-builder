import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { glow } from "../kits/glow";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  type BoxFace,
} from "../kits/pixel";

export const meta = {
  name: "Gelatinous Cube",
  description:
    "A three-metre wobbling cube of pixel-stippled green jelly, its walls see-through with dithered holes, digesting a delver's hoard: a half-dissolved skeleton pressing one hand to the glass, a coin mound, an open chest, sword, shield, helmet, potions, a lit lantern and bubbles.",
  style: "pixel art",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
type Vox = Map<string, THREE.BufferGeometry>;

// ---------------------------------------------------------------------------------------------------------------
// Palette

const C = {
  s1: "#e8f1f6", s2: "#aebfcc", s3: "#73869b", s4: "#3f4d63",
  g1: "#fff1a0", g2: "#f4c542", g3: "#c98f1a", g4: "#7a4d12",
  w1: "#b87a3d", w2: "#8a5128", w3: "#5a3218", w4: "#3a2010",
  b1: "#f4efd8", b2: "#d9d0ac", b3: "#a89e78", b4: "#6e6648",
  r1: "#e85a5a", r2: "#b52d3c", r3: "#6e1626",
  cr1: "#f2e6c4", cr2: "#cdbb94",
  ruL: "#ff8aa0", ru: "#ff3b5c", ruD: "#b0143a",
  emL: "#9dffc0", em: "#2fe08a", emD: "#138a52",
  saL: "#9ad8ff", sa: "#3a8dff", saD: "#1c4fc4",
  amL: "#e0b0ff", am: "#a259f0", amD: "#6a2fb5",
  gl: "#cfeef2", gl2: "#8cc6d0",
  f1: "#ffd35a", f2: "#ff8a1f", iron: "#2b2b3a",
  p1: "#e8d6a0", p2: "#bda36a", ink: "#14101c",
};
const GLOW = new Set([
  C.ruL, C.ru, C.ruD, C.emL, C.em, C.emD, C.saL, C.sa, C.saD, C.amL, C.am, C.amD, C.f1, C.f2,
]);
const STEEL = [C.s4, C.s3, C.s2, C.s1];

const GR = ["#0f6b5a", "#1b9a78", "#34c88c", "#6fe3ab", "#b2f7cd", "#effff4"].map((c) => snapColor(c, 64));
const BONE_R = [C.b4, C.b3, C.b2, C.b1];

const hsh = (x: number, y: number, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------------------------------------------
// Voxel items: sprites extruded into square-edged voxels, merged per bone and colour

function vox(
  w: number,
  h: number,
  d: number,
  fn: (x: number, y: number, z: number) => string,
  tx: number,
  tz = tx,
): Vox {
  const cells: string[] = new Array<string>(w * h * d).fill("");
  const idx = (x: number, y: number, z: number) => x + w * (y + h * z);
  for (let z = 0; z < d; z++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cells[idx(x, y, z)] = fn(x, y, z);
  const filled = (x: number, y: number, z: number) =>
    x >= 0 && y >= 0 && z >= 0 && x < w && y < h && z < d && cells[idx(x, y, z)] !== "";
  const acc = new Map<string, { p: number[]; n: number[]; u: number[]; i: number[] }>();
  const half = [tx / 2, tx / 2, tz / 2];
  const mid = [w / 2 - 0.5, h / 2 - 0.5, d / 2 - 0.5];
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (let z = 0; z < d; z++)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const color = cells[idx(x, y, z)];
        if (!color) continue;
        let a = acc.get(color);
        if (!a) acc.set(color, (a = { p: [], n: [], u: [], i: [] }));
        const pos = [(x - mid[0]) * tx, (y - mid[1]) * tx, (z - mid[2]) * tz];
        for (let ax = 0; ax < 3; ax++)
          for (const s of [1, -1]) {
            const nb = [x, y, z];
            nb[ax] += s;
            if (filled(nb[0], nb[1], nb[2])) continue;
            const b1 = (ax + 1) % 3;
            const c1 = (ax + 2) % 3;
            const base = a.p.length / 3;
            for (const [sb, sc] of corners) {
              const v = [...pos];
              v[ax] += s * half[ax];
              v[b1] += sb * half[b1];
              v[c1] += sc * half[c1];
              a.p.push(v[0], v[1], v[2]);
              const n = [0, 0, 0];
              n[ax] = s;
              a.n.push(n[0], n[1], n[2]);
              a.u.push(0, 0);
            }
            if (s > 0) a.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
            else a.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
          }
      }
  const out: Vox = new Map();
  for (const [color, a] of acc) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(a.p, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(a.n, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(a.u, 2));
    g.setIndex(a.i);
    out.set(color, g);
  }
  return out;
}

const pools = new Map<string, { bone: Joint; cols: Map<string, THREE.BufferGeometry[]> }>();
function put(bone: Joint, model: Vox, at: P3, rot: P3 = [0, 0, 0], s = 1) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
    new THREE.Vector3(s, s, s),
  );
  let pool = pools.get(bone.name);
  if (!pool) pools.set(bone.name, (pool = { bone, cols: new Map() }));
  for (const [color, g] of model) {
    const list = pool.cols.get(color) ?? [];
    list.push(g.clone().applyMatrix4(m));
    pool.cols.set(color, list);
  }
}

// --- sprites -------------------------------------------------------------------------------------------------

function coinModel(c1: string, c2: string, c3: string): Vox {
  const rows = [".LG.", "LGGD", "GGDD", ".DD."];
  const key: Record<string, string> = { L: c1, G: c2, D: c3 };
  return vox(4, 4, 1, (x, y) => key[rows[3 - y][x]] ?? "", 0.02, 0.012);
}

function swordModel(): Vox {
  const pits = new Set(["5,31", "5,32", "3,27", "4,22", "3,14", "5,18", "3,33"]);
  return vox(
    9,
    38,
    3,
    (x, y, z) => {
      const dx = x - 4;
      if (y <= 1) return Math.abs(dx) <= (y === 0 ? 0 : 1) ? (dx < 0 ? C.g1 : dx > 0 ? C.g3 : C.g2) : "";
      if (y <= 7) return Math.abs(dx) <= 1 ? (y % 2 ? C.w3 : C.w2) : "";
      if (y <= 9) {
        if (Math.abs(dx) > 4) return "";
        if (y === 8 && dx === 0 && z === 2) return C.ru;
        return Math.abs(dx) >= 3 ? C.g3 : y === 9 ? C.g1 : C.g2;
      }
      if (z !== 1) return "";
      if (y === 37) return dx === 0 ? C.s1 : "";
      if (Math.abs(dx) > 1 || pits.has(`${x},${y}`)) return "";
      if (y >= 34 && dx > 0) return "";
      if (y >= 36 && dx < 0) return "";
      return dx < 0 ? C.s1 : dx === 0 ? C.s2 : C.s3;
    },
    0.025,
  );
}

function shieldModel(): Vox {
  const holes = (x: number, y: number) =>
    Math.hypot(x - 17, y - 5) < 2.6 || Math.hypot(x - 14, y - 3) < 1.6 || Math.hypot(x - 19.5, y - 8.5) < 1.3;
  return vox(
    23,
    23,
    5,
    (x, y, z) => {
      const dx = x - 11;
      const dy = y - 11;
      const r = Math.hypot(dx, dy);
      if (r > 11.2 || holes(x, y)) return "";
      if (z === 0) return r > 10.4 ? C.w4 : Math.abs(dy) < 1.2 ? C.w4 : C.w3;
      if (z === 1) return r <= 10.4 ? C.w2 : "";
      if (z === 2) {
        if (r > 10.2) return "";
        const red = dx < 0 === dy > 0;
        const edge = r > 8.8;
        if (Math.abs(dx) < 0.6 || Math.abs(dy) < 0.6) return C.w3;
        return red ? (edge ? C.r3 : dx + dy > 3 ? C.r1 : C.r2) : edge ? C.cr2 : C.cr1;
      }
      if (z === 3) {
        if (r <= 3.3) return dx + dy > 0 ? C.s3 : C.s2;
        if (r < 9.6) return "";
        const k = (Math.atan2(dy, dx) / (Math.PI * 2)) * 24;
        if (Math.abs(k - Math.round(k)) < 0.17) return C.s1;
        return dx - dy < -2 ? C.s1 : dx - dy > 4 ? C.s3 : C.s2;
      }
      return r <= 1.8 ? C.s1 : r <= 2.6 ? C.s2 : "";
    },
    0.025,
  );
}

function helmetModel(): Vox {
  return vox(
    11,
    16,
    11,
    (x, y, z) => {
      const dx = x - 5;
      const dz = z - 5;
      const r = Math.hypot(dx, dz);
      const maxr = y <= 8 ? 5.3 : y <= 12 ? 5.3 * Math.sqrt(Math.max(0, 1 - ((y - 8) / 5) ** 2)) : 0;
      if (y >= 12 && Math.abs(dx) <= 1 && z >= 1 && z <= 9 && y <= 12 + Math.round(3 - Math.abs(dz) * 0.7))
        return y >= 14 ? C.r1 : (y + z) % 2 ? C.r2 : C.r3;
      if (r > maxr || y > 12) return "";
      if (dx <= -4 && y >= 6 && y <= 9 && dz >= -1 && dz <= 2) return "";
      if ((y === 6 || y === 7) && Math.abs(dx) <= 3 && dz >= 3) return C.ink;
      if ((y === 2 || y === 4) && dz >= 3.5 && Math.abs(dx) % 2 === 1) return C.ink;
      if (dz >= 4 && dx === 0 && y <= 8) return C.s1;
      if (y === 1 && r >= 4.4 && (x + z) % 3 === 0) return C.s1;
      let tier = y >= 10 ? 3 : y >= 7 ? 2 : y >= 3 ? 1 : 0;
      tier += dx <= -3 ? 1 : dx >= 3 ? -1 : 0;
      return STEEL[Math.max(0, Math.min(3, tier))];
    },
    0.025,
  );
}

function potionModel(L: string, M: string, D: string): Vox {
  return vox(
    7,
    11,
    7,
    (x, y, z) => {
      const dx = x - 3;
      const dz = z - 3;
      const r = Math.hypot(dx, dz);
      if (y <= 4) {
        if (r > (y === 0 ? 2.2 : 3.2)) return "";
        return dx <= -2 && dz <= 1 && y >= 1 ? L : dx >= 2 ? D : M;
      }
      if (y === 5) return r <= 3.2 ? C.gl2 : "";
      if (y === 6) return r <= 2.4 ? C.gl : "";
      if (y <= 8) return r <= 1.4 ? C.gl : "";
      if (y === 9) return r <= 2.1 ? C.gl2 : "";
      return r <= 1.4 ? C.w1 : "";
    },
    0.025,
  );
}

function lanternModel(): Vox {
  return vox(
    7,
    13,
    7,
    (x, y, z) => {
      const dx = x - 3;
      const dz = z - 3;
      const post = Math.abs(dx) === 3 && Math.abs(dz) === 3;
      if (y === 0) return Math.abs(dx) <= 2 && Math.abs(dz) <= 2 ? C.iron : "";
      if (y <= 7) {
        if (post) return C.iron;
        if (Math.abs(dx) <= 2 && Math.abs(dz) <= 2)
          return y <= 3 ? (dx === 0 && dz === 0 ? C.f1 : C.f2) : dx === 0 && dz === 0 ? C.f1 : C.f1;
        return "";
      }
      if (y === 8) return Math.abs(dx) <= 2 && Math.abs(dz) <= 2 ? C.iron : "";
      if (y === 9) return Math.abs(dx) <= 1 && Math.abs(dz) <= 1 ? C.iron : "";
      if (dz !== 0) return "";
      if (y === 10 || y === 11) return Math.abs(dx) === 1 ? C.iron : "";
      return y === 12 && dx === 0 ? C.iron : "";
    },
    0.03,
  );
}

function crownModel(): Vox {
  const gems = [C.ru, C.em, C.sa, C.am];
  return vox(
    13,
    7,
    13,
    (x, y, z) => {
      const dx = x - 6;
      const dz = z - 6;
      const r = Math.hypot(dx, dz);
      if (r < 4.8 || r > 6.4) return "";
      const ang = Math.atan2(dz, dx);
      const k = Math.round(ang / (Math.PI / 4));
      const near = Math.abs(ang - (k * Math.PI) / 4) < 0.3;
      if (y === 0) return C.g3;
      if (y === 1) {
        if (r >= 5.4 && k % 2 === 0 && near) return gems[(((k / 2) % 4) + 4) % 4];
        return C.g2;
      }
      if (y === 2) return C.g1;
      if (!near) return "";
      const top = k % 2 === 0 ? 6 : 4;
      if (y > top) return "";
      return y === top ? C.g1 : C.g2;
    },
    0.025,
  );
}

function bootModel(): Vox {
  const torn = new Set(["4,7,2", "0,8,3", "4,5,1", "0,3,2"]);
  return vox(
    5,
    13,
    10,
    (x, y, z) => {
      const shaft = z <= 4 && y >= 3;
      const foot = y <= 3 && !(z >= 8 && y >= 2) && !(z === 9 && y >= 1);
      if (!shaft && !foot) return "";
      if (torn.has(`${x},${y},${z}`) || (y === 12 && (x + z) % 3 === 0)) return "";
      if (y === 0 || (y === 1 && z <= 2)) return C.w4;
      if (y >= 11) return C.w1;
      if (y === 10) return C.w3;
      if (z >= 6 && y >= 1) return C.w3;
      return x === 0 ? C.w1 : x === 4 ? C.w3 : C.w2;
    },
    0.028,
  );
}

function scrollModel(): Vox {
  return vox(
    14,
    5,
    5,
    (x, y, z) => {
      const r = Math.hypot(y - 2, z - 2);
      if (r > 2.3) return "";
      if (x === 0 || x === 13) return r <= 0.8 ? C.w4 : r <= 1.6 ? C.p2 : C.p1;
      if (x === 6 || x === 7) return y >= 3 ? C.r1 : C.r3;
      if (y === 4 && x % 3 === 1 && x >= 2 && x <= 11) return C.w4;
      return y >= 3 ? C.p1 : C.p2;
    },
    0.025,
  );
}

function keyModel(): Vox {
  return vox(
    7,
    17,
    2,
    (x, y) => {
      const r = Math.hypot(x - 3, y - 13);
      if (r >= 1.6 && r <= 3.3) return x < 3 ? C.g1 : C.g3;
      if (x === 3 && y >= 2 && y <= 9) return C.g2;
      if (y === 10 && Math.abs(x - 3) <= 1) return C.g3;
      if ((y === 2 || y === 3) && (x === 4 || x === 5) && y === 2) return C.g3;
      if ((y === 5 || y === 4) && x === 4 && y === 4) return C.g2;
      return "";
    },
    0.025,
  );
}

function gemModel(L: string, M: string, D: string): Vox {
  return vox(
    7,
    9,
    7,
    (x, y, z) => {
      const dx = x - 3;
      const dz = z - 3;
      const dy = y - 4;
      if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) * 0.75 > 3.2) return "";
      const v = dy / 4 - 0.3 * (dx / 3) - 0.1 * (dz / 3);
      return v > 0.3 ? L : v > -0.3 ? M : D;
    },
    0.02,
  );
}

function femurModel(): Vox {
  return vox(
    4,
    18,
    3,
    (x, y, z) => {
      if (y >= 16) return x === 0 && y === 17 ? C.b1 : x <= 3 ? (z === 1 ? C.b1 : C.b2) : "";
      if (y <= 1) return y === 0 && (x === 0 || x === 3) ? C.b3 : C.b2;
      if (x === 0 || x === 3) return "";
      if (y === 2 || y === 15) return C.b3;
      return x === 1 ? C.b1 : C.b2;
    },
    0.025,
  );
}

function handModel(): Vox {
  const w = 14;
  const h = 16;
  const grid: string[][] = Array.from({ length: h }, () => new Array<string>(w).fill(""));
  const dot = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = c;
  };
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const t = n ? i / n : 0;
      dot(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), i % 4 === 3 ? C.b3 : i === n ? C.b1 : C.b2);
    }
  };
  for (let y = 3; y <= 7; y++) for (let x = 4; x <= 10; x++) dot(x, y, y >= 6 ? C.b1 : y <= 3 ? C.b3 : C.b2);
  dot(6, 5, C.b3);
  dot(8, 4, C.b3);
  line(7, 0, 7, 3);
  line(5, 0, 6, 3);
  line(4, 8, 3, 14);
  line(6, 8, 6, 15);
  line(8, 8, 9, 14);
  line(10, 7, 12, 11);
  line(4, 5, 1, 9);
  return vox(w, h, 2, (x, y) => grid[y][x], 0.016, 0.02);
}

function ribcageModel(): Vox {
  return vox(
    18,
    34,
    13,
    (x, y, z) => {
      const dx = x - 8.5;
      // pelvis bowl
      if (y <= 6) {
        const e = Math.sqrt((dx / 8) ** 2 + ((y - 6) / 6.5) ** 2 + ((z - 6) / 5.5) ** 2);
        const hole = Math.abs(dx) <= 2.5 && y < 4 && z >= 6;
        const sacrum = Math.abs(dx) <= 1.5 && z >= 2 && z <= 4;
        if (sacrum) return C.b2;
        if (e >= 0.72 && e <= 1.02 && !hole) return y >= 6 ? C.b1 : y <= 1 ? C.b3 : C.b2;
        return "";
      }
      // spine
      if (Math.abs(dx) <= 0.5 && z >= 3 && z <= 4) return y % 3 === 0 ? C.b3 : y % 3 === 1 ? C.b1 : C.b2;
      if (Math.abs(dx) <= 0.5 && z === 2 && y % 3 === 1) return C.b2;
      // sternum
      if (Math.abs(dx) <= 0.5 && z === 12 && y >= 15 && y <= 25) return C.b1;
      // clavicles
      if (y === 27 && Math.abs(dx) >= 1 && Math.abs(dx) <= 6 && z >= 4 && z <= 5) return Math.abs(dx) > 4 ? C.b2 : C.b1;
      // scapulae
      if (Math.abs(dx) >= 3 && Math.abs(dx) <= 5 && z === 2 && y >= 19 && y <= 26 && !(Math.abs(dx) === 5 && y > 24))
        return C.b3;
      // ribs
      if (y >= 14 && y <= 26 && y % 2 === 0) {
        const rx = 4 + 3 * Math.sin((Math.PI * (y - 13)) / 14);
        const nd = Math.sqrt((dx / rx) ** 2 + ((z - 7.5) / 4.5) ** 2);
        if (nd >= 0.6 && nd <= 1.04) return z >= 9 ? C.b1 : z >= 6 ? C.b2 : C.b3;
      }
      return "";
    },
    0.025,
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "gelatinousCube", paintSize: 2048 });

  const T = 0.045;
  const SW = 60;
  const SH = 58;
  const SD = 60;
  const HW = (SW * T) / 2;
  const H = SH * T;

  // ----- skeleton root --------------------------------------------------------------------------------------
  const core = b.joint("core", { at: [0, H / 2, 0], dir: [0, 1, 0], role: "spine" });
  const item = (name: string, at: P3) => b.joint(name, { parent: core, at });

  // ----- gel shell: stippled see-through sheet (dithered holes show the loot) -----------------------------------
  const layout = skinLayout({ shell: [SW, SH, SD] }, SW * 4);
  const faces = layout.faces.shell;
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const name of Object.keys(faces) as BoxFace[]) {
      const rect = faces[name];
      const kind = name === "py" ? "top" : name === "ny" ? "bottom" : "side";
      g.fill((x, y, w, h) => {
        const e = Math.min(x, y, w - 1 - x, h - 1 - y);
        if (e === 0) return GR[0];
        if (e === 1) return GR[1];
        if (kind === "bottom") return pick(GR.slice(0, 4), 0.3 + 0.2 * hsh(x, y, 3), bayer(x, y));
        if (e === 2) return GR[4];
        if (e === 3) return GR[3];
        const t = Math.min(1, (e - 3) / 10);
        const cloud = hsh(x >> 2, y >> 2, 1) - 0.5;
        let f = kind === "top" ? 0.12 + 0.2 * t : 0.2 + 0.58 * t;
        f += 0.3 * cloud;
        if (bayer(x, y) < f) return "";
        let v = 0.2 + 0.5 * (1 - y / h) + 0.3 * (hsh(x >> 1, y >> 1, 2) - 0.5);
        if (kind === "top") {
          const d = Math.hypot(x - w / 2, y - h / 2);
          v = 0.5 + 0.3 * Math.sin(d * 0.55 + 0.6 * hsh(x >> 2, y >> 2, 4)) + 0.25 * (hsh(x, y, 9) - 0.5);
        }
        if (hsh(x, y, 6) < 0.012) return "#6b7f2a";
        return pick(GR, v, bayer(x + 1, y + 2));
      }, rect);
      const [rx, ry, rw, rh] = rect;
      if (kind === "side") {
        const glint = (gx: number, gy: number, len: number) => {
          for (let k = 0; k < len; k++) g.set(rx + gx + k, ry + gy - k, GR[5]);
          g.set(rx + gx - 1, ry + gy + 1, GR[4]);
          g.set(rx + gx + len, ry + gy - len, GR[4]);
        };
        glint(9, 24, 10);
        glint(14, 30, 5);
        glint(rw - 14, rh - 10, 6);
        const bub = [".w.", "w.w", ".w."];
        g.stamp(rx + 36, ry + 12, bub, { w: GR[5] });
        g.stamp(rx + 42, ry + 17, ["ww", "ww"], { w: GR[4] });
      } else if (kind === "top") {
        g.stamp(rx + 12, ry + 14, [".www.", "w...w", "w...w", ".www."], { w: GR[5] });
        g.stamp(rx + 36, ry + 38, [".ww.", "w..w", ".ww."], { w: GR[4] });
      }
    }
  });
  b.part(skinBox(SHEET, faces, T), "#ffffff", { texture: SHEET, bone: core, at: [0, H / 2, 0] });

  // inner flecks: a second, almost transparent shell of suspended gel specks
  const flecks = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const name of Object.keys(faces) as BoxFace[]) {
      if (name === "ny") continue;
      g.fill((x, y) => {
        const a = hsh(x, y, 5);
        if (a < 0.02) return GR[1];
        if (a < 0.035) return GR[4];
        if (a > 0.994) return "#6b7f2a";
        if (hsh(x >> 1, y >> 1, 8) > 0.985) return GR[2];
        return "";
      }, faces[name]);
    }
  });
  b.part(skinBox(flecks, faces, T * 0.93), "#ffffff", { texture: flecks, bone: core, at: [0, H / 2 - 0.01, 0] });

  // inner walls: opaque deep-gel backdrop seen through the holes, one inward-facing sheet per side
  const wallTex = (seed: number, ceiling: boolean) =>
    pixelTexture(58, 58, (g) => {
      g.fill((x, y, _w, h) => {
        const k = ceiling ? 0.55 : 1 - y / h;
        const wave = 0.06 * Math.sin(y * 0.3 + 4 * hsh(x >> 4, y >> 4, seed));
        const ray = (x + y * 0.6 + seed * 7) % 24 < 5 ? 0.13 : 0;
        if (hsh(x, y, seed + 3) < 0.012) return GR[4];
        return pick(GR.slice(0, 5), 0.3 + 0.4 * k + wave + ray + 0.07 * (hsh(x >> 1, y >> 1, seed) - 0.5), bayer(x, y));
      });
      g.stamp(10 + seed * 3, 14 + seed * 2, [".www.", "w...w", "w...w", ".www."], { w: GR[4] });
      g.stamp(38 - seed * 2, 30 + seed * 3, [".ww.", "w..w", ".ww."], { w: GR[3] });
    });
  const WI = HW - 0.035;
  const wallGeo = new THREE.PlaneGeometry(58 * T, 58 * T);
  const walls: { at: P3; dir: P3; seed: number; ceiling: boolean }[] = [
    { at: [0, H / 2, -WI], dir: [0, 0, 1], seed: 1, ceiling: false },
    { at: [0, H / 2, WI], dir: [0, 0, -1], seed: 2, ceiling: false },
    { at: [WI, H / 2, 0], dir: [-1, 0, 0], seed: 3, ceiling: false },
    { at: [-WI, H / 2, 0], dir: [1, 0, 0], seed: 4, ceiling: false },
    { at: [0, H - 0.035, 0], dir: [0, -1, 0], seed: 5, ceiling: true },
  ];
  for (const wl of walls) {
    const tex = wallTex(wl.seed, wl.ceiling);
    b.part(wallGeo, "#ffffff", { texture: tex, bone: core, at: wl.at, dir: wl.dir, axis: "z", name: `wall${wl.seed}` });
  }

  // ----- bright gel edges ----------------------------------------------------------------------------------------
  const BEAM = cellPaint(
    0.0225,
    (c) => c.pick(GR, 0.5 + 0.3 * c.n.y + 0.18 * c.n.x + 0.35 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const CORNER = cellPaint(0.0225, (c) => c.pick(GR, 0.72 + 0.2 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });
  const bt = 0.09;
  const BX = HW - 0.03;
  const yb = 0.04;
  const yt = H - 0.035;
  for (const sy of [yb, yt])
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(2 * HW + 0.06, bt, bt), BEAM, { bone: core, at: [0, sy, s * BX] });
      b.part(new THREE.BoxGeometry(bt, bt, 2 * HW + 0.06), BEAM, { bone: core, at: [s * BX, sy, 0] });
    }
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(bt, H + 0.04, bt), BEAM, { bone: core, at: [sx * BX, H / 2, sz * BX] });
      for (const sy of [0.06, H - 0.055])
        b.part(new THREE.BoxGeometry(0.13, 0.13, 0.13), CORNER, { bone: core, at: [sx * 1.31, sy, sz * 1.31] });
    }

  // ----- slime puddle and trail ------------------------------------------------------------------------------------
  const PC = 0.05;
  const z0 = -2.35;
  const z1 = 2.1;
  const nRows = Math.round((z1 - z0) / PC);
  const rows: [number, number][] = [];
  for (let j = 0; j < nRows; j++) {
    const z = z0 + (j + 0.5) * PC;
    const ox = 0.12 * Math.sin(z * 1.7);
    let hw: number;
    if (z > 1.45) {
      const t = (z - 1.45) / (z1 - 1.45);
      hw = 1.55 * Math.sqrt(Math.max(0, 1 - t * t)) * (0.92 + 0.08 * Math.sin(z * 17));
    } else if (z < -1.45) {
      const t = (-1.45 - z) / (-1.45 - z0);
      hw = 0.3 + 1.25 * (1 - t) ** 1.5 + 0.06 * Math.sin(z * 11);
    } else hw = 1.62 + 0.1 * Math.sin(z * 3.1) + 0.06 * Math.sin(z * 7.3 + 1);
    hw = Math.max(hw, 0.16);
    rows.push([Math.round((ox - hw) / PC), Math.round((ox + hw) / PC)]);
  }
  const PUD = cellPaint(
    PC,
    (c) => {
      const d = Math.min(1, Math.hypot(c.at.x / 1.7, c.at.z / 2.3));
      if (c.random(4) < 0.022) return c.random(5) < 0.6 ? C.g2 : C.b2;
      if (c.random(6) < 0.012) return "#6b7f2a";
      return c.pick(GR, 0.3 + 0.38 * d * d + 0.28 * (c.random(3) - 0.5) + 0.16 * Math.sin(d * 14));
    },
    { dither: true },
  );
  b.extrude(stepped(rows, PC, { rows: true, start: Math.round(z0 / PC) }), {
    at: [0, 0.013, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.026,
    color: PUD,
    bone: core,
    name: "puddle",
  });

  // ----- pseudopods -----------------------------------------------------------------------------------------------
  const POD = cellPaint(
    0.0225,
    (c) =>
      c.random(7) < 0.03
        ? c.random(8) < 0.5
          ? C.g2
          : C.b2
        : c.pick(GR, 0.28 + 0.45 * Math.max(0, c.n.y) + 0.3 * (c.random(1) - 0.5) + 0.12 * (c.at.z > 1.6 ? 1 : 0)),
    { dither: true },
  );
  const pods: { name: string; pts: P3[] }[] = [
    { name: "podFrontL", pts: [[0.7, 0.2, 0.9], [0.85, 0.11, 1.5], [0.95, 0.07, 2.0]] },
    { name: "podFrontC", pts: [[-0.05, 0.2, 1.0], [-0.12, 0.11, 1.6], [-0.3, 0.07, 2.02]] },
    { name: "podFrontR", pts: [[-0.75, 0.2, 0.9], [-0.95, 0.11, 1.45], [-1.2, 0.07, 1.85]] },
    { name: "podRearL", pts: [[0.55, 0.2, -0.9], [0.7, 0.1, -1.55], [0.6, 0.065, -2.05]] },
    { name: "podRearR", pts: [[-0.55, 0.2, -0.9], [-0.65, 0.1, -1.6], [-0.4, 0.065, -2.15]] },
  ];
  for (const pod of pods) {
    const chain = b.chain(pod.name, catmull(pod.pts), {
      parent: core,
      names: [`${pod.name}1`, `${pod.name}2`, `${pod.name}3`],
      role: "tentacle",
    });
    b.sweep(chain, (t) => [0.2 - 0.08 * t, 0.07 - 0.02 * t], {
      sides: 10,
      caps: "round",
      color: POD,
      name: `${pod.name}Tube`,
    });
  }

  // ----- drips ------------------------------------------------------------------------------------------------------
  const dripRows = (neck: number) => {
    const rowsHang = ["lmmd", "lmmd", "lmmd"];
    for (let i = 0; i < neck; i++) rowsHang.push(i % 2 ? ".lmd" : ".lm.");
    rowsHang.push("lmmd", "lwmd", "lmmd", ".md.");
    return rowsHang.reverse();
  };
  const dripKey = { l: GR[4], m: GR[3], d: GR[2], w: "#ffffff" };
  const drips = [3, 6, 10].map((n) => pixelArt(dripRows(n), dripKey));
  const dripSides: { at: (u: number) => P3; flow: P3 }[] = [
    { at: (u) => [u, H - 0.04, HW + 0.012], flow: [0, 0, 1] },
    { at: (u) => [u, H - 0.04, -HW - 0.012], flow: [0, 0, -1] },
    { at: (u) => [HW + 0.012, H - 0.04, u], flow: [1, 0, 0] },
    { at: (u) => [-HW - 0.012, H - 0.04, u], flow: [-1, 0, 0] },
  ];
  const rd = rng(33);
  for (const side of dripSides) {
    const pts: P3[] = [];
    for (let i = 0; i < 8; i++) pts.push(side.at(-1.05 + i * 0.3 + (rd() - 0.5) * 0.12));
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      drips,
      { size: [0.14, 0.34], lean: 180, flow: side.flow, vary: 0.5, rng: rd, bone: core, sink: 0 },
    );
  }

  // ----- bubbles ------------------------------------------------------------------------------------------------------
  const bubKey = { b: GR[4], w: "#ffffff", d: GR[2] };
  const bubbles = [
    pixelArt(["..bbb..", ".bw..b.", "bw....b", "b.....d", "b.....d", ".b...d.", "..ddd.."], bubKey),
    pixelArt([".bb.", "bw.d", "b..d", ".dd."], bubKey),
    pixelArt([".w.", "www", ".w."], bubKey),
  ];
  const bubPts: THREE.Vector3[] = [];
  const rb = rng(55);
  while (bubPts.length < 46) {
    const p = new THREE.Vector3((rb() - 0.5) * 2.3, 0.25 + rb() * 2.1, (rb() - 0.5) * 2.3);
    bubPts.push(p);
  }
  b.cards(
    bubPts.map((p) => frame([p.x, p.y, p.z], [0, 1, 0])),
    bubbles,
    { size: 0.1, lean: 0, flow: [0, 0, 1], cross: true, vary: 0.55, rng: rb, bone: core, sink: 0 },
  );

  // ----- loot inside --------------------------------------------------------------------------------------------------
  const COIN = coinModel(C.g1, C.g2, C.g3);
  const SILVER = coinModel(C.s1, C.s2, C.s3);
  const rc = rng(21);
  // coin mound
  const MC: P3 = [-0.55, 0, -0.5];
  for (let i = 0; i < 80; i++) {
    const ang = rc() * Math.PI * 2;
    const rad = Math.sqrt(rc()) * 0.58;
    const hgt = 0.03 + (1 - rad / 0.62) ** 1.3 * 0.3 + rc() * 0.03;
    const upright = rc() < 0.15;
    put(
      core,
      rc() < 0.2 ? SILVER : COIN,
      [MC[0] + Math.cos(ang) * rad, hgt, MC[2] + Math.sin(ang) * rad],
      upright ? [(rc() - 0.5) * 30, rc() * 360, 0] : [90 + (rc() - 0.5) * 45, rc() * 360, 0],
    );
  }
  // chest
  const CH: P3 = [0.6, 0.04, -0.55];
  const CHYAW = -28;
  const tx = 0.025;
  const chq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, CHYAW * DEG, 0));
  const chw = (x: number, y: number, z: number): P3 => {
    const v = new THREE.Vector3(x, y, z).applyQuaternion(chq);
    return [CH[0] + v.x, CH[1] + v.y, CH[2] + v.z];
  };
  const chestBase = vox(
    24,
    12,
    16,
    (x, y, z) => {
      if (y >= 2 && x >= 2 && x < 22 && z >= 2 && z < 14) return "";
      const cornerCol = (x <= 1 || x >= 22) && (z <= 1 || z >= 14);
      if (cornerCol) return y === 11 ? C.s2 : C.s3;
      if ((x >= 4 && x <= 5) || (x >= 18 && x <= 19)) return (y + x) % 5 === 0 ? C.s1 : C.s3;
      if (z === 15 && x >= 10 && x <= 13 && y >= 6 && y <= 9) return y === 8 && x >= 11 && x <= 12 ? C.ink : C.g2;
      if (y % 4 === 3) return C.w4;
      if (hsh(x, y, z) < 0.08) return C.w3;
      return y % 4 === 2 ? C.w1 : C.w2;
    },
    tx,
  );
  put(core, chestBase, chw(0, 6 * tx, 0), [0, CHYAW, 0]);
  const lidModel = vox(
    24,
    9,
    16,
    (x, y, z) => {
      const ymax = 4 + Math.round(5 * Math.sqrt(Math.max(0, 1 - ((z - 7.5) / 8) ** 2)));
      if (y >= ymax) return "";
      if (x >= 2 && x < 22 && z >= 2 && z < 14 && y < ymax - 2) return "";
      if ((x >= 4 && x <= 5) || (x >= 18 && x <= 19)) return (y + z) % 5 === 0 ? C.s1 : C.s3;
      if ((x <= 1 || x >= 22) && y >= ymax - 3) return C.s3;
      if (x % 5 === 4) return C.w4;
      if (hsh(x, y, z + 40) < 0.08) return C.w3;
      return y >= ymax - 1 ? C.w1 : C.w2;
    },
    tx,
  );
  const hinge = chw(0, 12 * tx, -8 * tx);
  const hingeFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(chq);
  const lid = b.joint("chestLid", {
    parent: core,
    at: hinge,
    dir: [hingeFwd.x, 0, hingeFwd.z],
    role: "hinge",
  });
  put(lid, lidModel, chw(0, 16.5 * tx, 0), [0, CHYAW, 0]);
  for (let i = 0; i < 34; i++) {
    const lx = (rc() - 0.5) * 0.4;
    const lz = (rc() - 0.5) * 0.24;
    const dome = 1 - Math.min(1, Math.hypot(lx / 0.2, lz / 0.12));
    put(
      core,
      rc() < 0.2 ? SILVER : COIN,
      chw(lx, 0.25 + dome * 0.07 - rc() * 0.03, lz),
      [90 + (rc() - 0.5) * 55, CHYAW + rc() * 360, 0],
    );
  }

  // floating coins
  const keepOut: [P3, number][] = [
    [[-0.55, 0.3, -0.5], 0.6],
    [[0.6, 0.3, -0.55], 0.5],
    [[0, 1.5, 0.8], 0.8],
    [[0.45, 1.3, -0.85], 0.6],
    [[-0.7, 1.7, -0.7], 0.45],
  ];
  let placed = 0;
  while (placed < 22) {
    const p: P3 = [(rc() - 0.5) * 2.3, 0.45 + rc() * 1.9, (rc() - 0.5) * 2.3];
    if (keepOut.some(([c, rr]) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) < rr)) continue;
    put(core, rc() < 0.25 ? SILVER : COIN, p, [rc() * 360, rc() * 360, rc() * 360]);
    placed++;
  }

  // coins the cube dropped on its own slime
  for (const [cx, cz] of [[0.4, 1.75], [-0.62, 1.8], [1.35, 1.4], [-1.3, 1.45], [1.6, 0.9], [-1.65, -0.2], [1.55, -1.0], [-1.45, -1.1]])
    put(core, rc() < 0.3 ? SILVER : COIN, [cx, 0.04, cz], [90 + (rc() - 0.5) * 20, rc() * 360, 0]);
  // gems
  const RUBY = gemModel(C.ruL, C.ru, C.ruD);
  const EMER = gemModel(C.emL, C.em, C.emD);
  const SAPH = gemModel(C.saL, C.sa, C.saD);
  const AMET = gemModel(C.amL, C.am, C.amD);
  put(core, RUBY, [-0.5, 0.36, -0.42], [0, 20, 8]);
  put(core, EMER, [-0.12, 0.13, -0.8], [0, 50, 18]);
  put(core, AMET, chw(0.05, 0.4, 0.06), [0, 35, -12]);
  const gemS = item("lootGemSapphire", [0.35, 1.75, -0.85]);
  put(gemS, SAPH, [0.35, 1.75, -0.85], [10, 25, 15]);

  // sword
  const swordJ = item("lootSword", [0.45, 1.3, -0.85]);
  put(swordJ, swordModel(), [0.45, 1.3, -0.85], [0, 12, 28]);
  // shield
  const shieldJ = item("lootShield", [-0.7, 1.75, -0.7]);
  put(shieldJ, shieldModel(), [-0.7, 1.75, -0.7], [-8, 22, 12]);
  // helmet
  const helmJ = item("lootHelmet", [-0.8, 0.3, 0.6]);
  put(helmJ, helmetModel(), [-0.8, 0.3, 0.6], [12, 35, 6]);
  // boot
  const bootJ = item("lootBoot", [0.25, 2.05, -0.4]);
  put(bootJ, bootModel(), [0.25, 2.05, -0.4], [20, -30, 55]);
  // crown
  const crownJ = item("lootCrown", [-0.4, 2.15, -0.35]);
  put(crownJ, crownModel(), [-0.4, 2.15, -0.35], [25, 0, -15]);
  // potions
  const potRJ = item("lootPotionRed", [0.9, 1.0, 0.72]);
  put(potRJ, potionModel(C.ruL, C.ru, C.ruD), [0.9, 1.0, 0.72], [0, 20, -22]);
  const potBJ = item("lootPotionBlue", [-0.3, 0.2, 0.95]);
  put(potBJ, potionModel(C.saL, C.sa, C.saD), [-0.3, 0.2, 0.95], [0, 70, 82]);
  // lantern
  const lanJ = item("lootLantern", [0.05, 0.26, -0.95]);
  put(lanJ, lanternModel(), [0.05, 0.26, -0.95], [0, 15, 4]);
  // key, scroll, bones
  const keyJ = item("lootKey", [1.0, 1.9, 0.2]);
  put(keyJ, keyModel(), [1.0, 1.9, 0.2], [0, 40, 25]);
  const scrJ = item("lootScroll", [-1.0, 0.9, 0.45]);
  put(scrJ, scrollModel(), [-1.0, 0.9, 0.45], [0, 50, 20]);
  const boneJ = item("lootBone", [-1.0, 1.0, -0.9]);
  put(boneJ, femurModel(), [-1.0, 1.0, -0.9], [60, 10, 70], 0.9);
  put(boneJ, femurModel(), [0.1, 0.6, -0.5], [75, 90, 10], 1);
  const pouchJ = item("lootPouch", [0.95, 0.2, 0.4]);
  put(
    pouchJ,
    vox(
      9,
      10,
      9,
      (x, y, z) => {
        const dx = x - 4;
        const dz = z - 4;
        const body = Math.hypot(dx, y - 3.2, dz) <= 4.2 && y <= 6;
        const neck = y >= 7 && y <= 8 && Math.hypot(dx, dz) <= 1.7 - (y - 7) * 0.2;
        const flare = y === 9 && Math.hypot(dx, dz) <= 2.9;
        if (y === 7 && Math.hypot(dx, dz) <= 2.2) return C.w4;
        if (!(body || neck || flare)) return "";
        if (flare) return C.w1;
        if (neck) return C.w2;
        return dx <= -2 ? C.w1 : dx >= 2 || y <= 1 ? C.w3 : C.w2;
      },
      0.025,
    ),
    [0.95, 0.2, 0.4],
    [0, 20, 8],
  );
  const chalJ = item("lootChalice", [-1.0, 0.3, -0.05]);
  put(
    chalJ,
    vox(
      7,
      10,
      7,
      (x, y, z) => {
        const r = Math.hypot(x - 3, z - 3);
        if (y === 0) return r <= 3.1 ? C.g3 : "";
        if (y <= 3) return r <= 1 ? C.g2 : "";
        if (y === 4) return r <= 2 ? C.g3 : "";
        const rr = 2 + (y - 4) * 0.35;
        if (r > rr) return "";
        if (y === 9) return r >= rr - 1 ? C.g1 : "";
        return x < 3 ? C.g1 : x === 3 ? C.g2 : C.g3;
      },
      0.028,
    ),
    [-1.0, 0.3, -0.05],
    [0, 0, 70],
  );
  const dagJ = item("lootDagger", [0.25, 1.0, 0.1]);
  put(dagJ, swordModel(), [0.25, 1.0, 0.1], [0, -50, 80], 0.5);

  // ----- drowned adventurer's skeleton ----------------------------------------------------------------------------
  const stx = 0.025;
  const SKC = new THREE.Vector3(0.0, 1.4, 0.7);
  const SKROT: P3 = [36, -18, 0];
  const skq = new THREE.Quaternion().setFromEuler(new THREE.Euler(SKROT[0] * DEG, SKROT[1] * DEG, 0, "YXZ"));
  const skp = (x: number, y: number, z: number) =>
    new THREE.Vector3((x - 8.5) * stx, (y - 16.5) * stx, (z - 6) * stx).applyQuaternion(skq).add(SKC);
  const hipsW = skp(8.5, 3, 6);
  const neckW = skp(8.5, 34, 3.5);
  const hips = b.joint("boneHips", {
    parent: core,
    at: [hipsW.x, hipsW.y, hipsW.z],
    aim: [neckW.x, neckW.y, neckW.z],
    role: "spine",
  });
  const spineChain = b.chain(
    "boneSpine",
    [hipsW, hipsW.clone().lerp(neckW, 0.33), hipsW.clone().lerp(neckW, 0.66), neckW],
    { parent: hips, names: ["boneSpineLow", "boneSpineMid", "boneSpineHigh"], role: "spine" },
  );
  const spineHigh = spineChain.joints[2];
  put(spineChain.joints[1], ribcageModel(), [SKC.x, SKC.y, SKC.z], SKROT);
  // one thigh bone still hanging from the pelvis
  const hipSocket = skp(15, 2, 6);
  put(hips, femurModel(), [hipSocket.x + 0.02, hipSocket.y - 0.22, hipSocket.z + 0.02], [10, 40, 175]);

  const BONEP = cellPaint(
    0.02,
    (c) => c.pick(BONE_R, 0.58 + 0.28 * c.n.y + 0.1 * c.n.x + 0.25 * (c.random(1) - 0.5)),
    { dither: true },
  );
  const HAND = handModel();
  const wallZ = 1.3;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = skp(s > 0 ? 16 : 1, 26, 5);
    const target: P3 = s > 0 ? [0.55, 1.42, wallZ] : [shoulder.x - 0.05, shoulder.y - 0.5, shoulder.z + 0.12];
    const pts = limb(shoulder, target, [0.32, 0.3], s > 0 ? [0.5, -0.8, -0.3] : [-0.4, -0.5, -0.6]);
    const arm = b.chain(`boneArm${side}`, pts, {
      parent: spineHigh,
      names: [`boneShoulder${side}`, `boneElbow${side}`, `boneWrist${side}`],
      role: "arm",
    });
    const [sj, ej, wj] = arm.joints;
    b.rod(sj, ej, [0.02, 0.02], { section: "box", color: BONEP, bone: sj, name: `humerus${side}` });
    for (const o of [-0.012, 0.012]) {
      const a = pts[1].clone().add(new THREE.Vector3(o, 0, o));
      const e = pts[2].clone().add(new THREE.Vector3(o, 0, o));
      b.rod(a, e, [0.011, 0.011], { section: "box", color: BONEP, bone: ej, name: `forearm${side}${o > 0 ? "A" : "B"}` });
    }
    for (const j of [sj, ej])
      b.part(new THREE.BoxGeometry(0.058, 0.058, 0.058), BONEP, { bone: j, at: j.at, rotation: [20, 30, 10] });
    const w = wj.at;
    if (s > 0) put(wj, HAND, [w.x, w.y + 0.12, wallZ], [0, 0, 6]);
    else put(wj, HAND, [w.x, w.y - 0.12, w.z], [20, 60, 175]);
  }

  // skull and jaw
  const skullSheetLayout = skinLayout({ skull: [10, 9, 11], jaw: [8, 3, 9] }, 64);
  const SK = skullSheetLayout.faces.skull;
  const JW = skullSheetLayout.faces.jaw;
  const SKULL = pixelTexture(skullSheetLayout.size[0], skullSheetLayout.size[1], (g) => {
    for (const set of [SK, JW])
      for (const name of Object.keys(set) as BoxFace[]) {
        g.fill((x, y, w, h) => {
          const e = Math.min(x, y, w - 1 - x, h - 1 - y);
          const v = 0.62 + 0.3 * (1 - y / h) - (e === 0 ? 0.2 : 0) + 0.2 * (hsh(x, y, name.length + set[name][0]) - 0.5);
          return pick(BONE_R, v, bayer(x, y));
        }, set[name]);
      }
    const key = { k: C.ink, w: "#fbf8ea", g: C.b4, e: "#7a1020" };
    g.stamp(SK.pz[0], SK.pz[1], [
      "..........",
      "..........",
      ".kkk..kkk.",
      ".kek..kek.",
      ".kkk..kkk.",
      "....kk....",
      "....kk....",
      ".wwgwwgww.",
      ".wwwwwwww.",
    ], key);
    for (const f of [SK.px, SK.nx]) g.stamp(f[0] + 6, f[1] + 4, ["kk"], key);
    g.stamp(SK.py[0], SK.py[1] + 2, [".....g....", "....g.g...", ".....g.g..", "......g...", ".....g...."], key);
    g.stamp(JW.pz[0], JW.pz[1], ["wwgwwgww", "wwwwwwww"], key);
  });
  const skullC = new THREE.Vector3(neckW.x, neckW.y + 0.1, neckW.z + 0.02);
  const head = b.joint("boneHead", {
    parent: spineHigh,
    at: [skullC.x, skullC.y - 0.06, skullC.z],
    dir: [0, 0.2, 1],
    role: "head",
  });
  const SKROTH: P3 = [-8, 15, 6];
  b.part(skinBox(SKULL, SK, 0.02), "#ffffff", { texture: SKULL, bone: head, at: [skullC.x, skullC.y, skullC.z], rotation: SKROTH });
  const hingeJ: P3 = [skullC.x, skullC.y - 0.07, skullC.z - 0.05];
  const jaw = b.joint("boneJaw", {
    parent: head,
    at: hingeJ,
    aim: [hingeJ[0], hingeJ[1], hingeJ[2] + 0.18],
    role: "jaw",
  });
  b.part(skinBox(SKULL, JW, 0.02), "#ffffff", {
    texture: SKULL,
    bone: jaw,
    at: [hingeJ[0], hingeJ[1] - 0.005, hingeJ[2] + 0.085],
    rotation: SKROTH,
  });

  // ----- bake the voxel pools ---------------------------------------------------------------------------------------
  for (const { bone, cols } of pools.values())
    for (const [color, list] of cols) {
      const merged = mergeGeometries(list);
      if (!merged) throw new Error(`could not merge voxels of ${color} on ${bone.name}`);
      const part = b.part(merged, color, { bone, at: [0, 0, 0], name: `vox.${bone.name}.${color.slice(1)}` });
      if (GLOW.has(color)) glow(part, 1);
    }

  // ----- rest pose: lid ajar, jaw slack -----------------------------------------------------------------------------
  b.pose(lid, { axis: [Math.cos(CHYAW * DEG), 0, -Math.sin(CHYAW * DEG)], deg: -55 });
  b.pose(jaw, { axis: [Math.cos(15 * DEG), 0, -Math.sin(15 * DEG)], deg: 14 });
  return b.root;
}
