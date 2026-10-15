import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { mix, mottle, noise, paint, patches, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hextech Hoard",
  description:
    "A treasure hoard on a rune-lit hex dais: an open arched chest with a spiked crest, heaps of embossed coins, cut gems, a leaning spiked crown, three goblets, glowing crystal clusters, ingots and coin towers.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ------------------------------------------------------------------------------------------------ palette
const GOLD = "#ffc21a";
const GOLD_HI = "#fff29a";
const GOLD_MID = "#f59a12";
const GOLD_DK = "#a5500c";
const BRONZE = "#6b3410";
const WOOD = "#4a3590";
const WOOD2 = "#3b2a78";
const WOOD3 = "#5d46a8";
const WOOD_DK = "#1c1442";
const VELVET = "#d4154f";
const VELVET_DK = "#7d0a35";
const STONE = "#3a4180";
const STONE2 = "#2b3063";
const STONE3 = "#4a529a";
const STONE_DK = "#14173a";
const CYAN = "#46f0ff";
const RUBY = "#ff2a5e";
const EMERALD = "#22e283";
const SAPPH = "#2f6bff";
const VIOLET = "#b05cff";
const TOPAZ = "#ffab1f";
const PEARL = "#fff0e6";
const SILVER = "#d9e8fa";
const SILVER_DK = "#7f96c2";
const INK = "#120d2e";

const FLOOR = 0.08; // top of the dais

// ------------------------------------------------------------------------------------------------ textures
function coinSvg(rim: string, face: string, ink: string, hi: string, centre: string) {
  return svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="${rim}"/>
      <circle cx="32" cy="32" r="26.5" fill="${ink}"/>
      <circle cx="32" cy="32" r="24" fill="${face}"/>
      <path d="M32 9 L37.5 26.5 L55 32 L37.5 37.5 L32 55 L26.5 37.5 L9 32 L26.5 26.5Z" fill="${ink}"/>
      <path d="M32 14 L36 28 L50 32 L36 36 L32 50 L28 36 L14 32 L28 28Z" fill="${hi}"/>
      <circle cx="32" cy="32" r="6.5" fill="${ink}"/><circle cx="32" cy="32" r="4.5" fill="${centre}"/>
      <g fill="${ink}"><circle cx="32" cy="5.2" r="1.4"/><circle cx="32" cy="58.8" r="1.4"/><circle cx="5.2" cy="32" r="1.4"/><circle cx="58.8" cy="32" r="1.4"/></g>
    </svg>`,
    { size: 128 },
  );
}
const T_GOLD = coinSvg("#ffe36a", "#ffc21a", "#b9640c", "#fff3a8", "#ff9d1a");
const T_AMBER = coinSvg("#ffc04a", "#f08a1a", "#8e3f0a", "#ffd37a", "#ffe9a0");
const T_SILVER = coinSvg("#f2f8ff", "#b8cdea", "#5c74a6", "#eaf3ff", "#6aa0ff");
const T_RARE = coinSvg("#ffe36a", "#ffb81f", "#b9640c", "#fff3a8", "#2ee6ff");

function crystalSvg(top: string, bottom: string, shades: number[], tip: boolean) {
  const cols = shades
    .map((s, i) => `<rect x="${i * 10}" y="0" width="10" height="64" fill="#000" fill-opacity="${s}"/>`)
    .join("");
  const lines = [10, 20, 30, 40, 50]
    .map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="64" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.4"/>`)
    .join("");
  const [a, c] = tip ? [bottom, top] : [top, bottom]; // image top -> bottom
  return svg(
    `<svg viewBox="0 0 60 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
      <rect width="60" height="64" fill="url(#g)"/>${cols}${lines}</svg>`,
    { size: 128 },
  );
}
const SHADES = [0.0, 0.22, 0.08, 0.36, 0.14, 0.28];
const CRYSTALS = {
  cyan: [crystalSvg("#9bf8ff", "#0a78d8", SHADES, false), crystalSvg("#ffffff", "#9bf8ff", SHADES, true)],
  violet: [crystalSvg("#e8b4ff", "#4a18c8", SHADES, false), crystalSvg("#ffffff", "#e8b4ff", SHADES, true)],
  rose: [crystalSvg("#ffb0cf", "#c2104e", SHADES, false), crystalSvg("#ffffff", "#ffb0cf", SHADES, true)],
};

const hexPts = (R: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (k * Math.PI) / 3;
    return `${(115 + R * Math.cos(a)).toFixed(1)},${(115 - R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
function runeSvg() {
  let ticks = "";
  for (let i = 0; i < 72; i++) {
    const a = (i * 5 * Math.PI) / 180;
    if (i % 12 === 0) continue;
    const r0 = 89;
    const r1 = i % 2 ? 93 : 96;
    ticks += `<line x1="${(115 + r0 * Math.cos(a)).toFixed(1)}" y1="${(115 - r0 * Math.sin(a)).toFixed(1)}" x2="${(115 + r1 * Math.cos(a)).toFixed(1)}" y2="${(115 - r1 * Math.sin(a)).toFixed(1)}" stroke="#46f0ff" stroke-width="1.5"/>`;
  }
  let glyphs = "";
  const shapes = [
    "M0,-6 L5,5 L-5,5Z",
    "M-5,-5 L5,-5 L0,6Z M0,-1 L0,-5",
    "M-4,-6 L-4,6 M4,-6 L4,6 M-4,0 L4,0",
    "M0,-6 L6,0 L0,6 L-6,0Z",
    "M-5,5 L0,-6 L5,5 M-3,1 L3,1",
    "M-5,-3 L5,-3 M-5,3 L5,3 M0,-6 L0,6",
  ];
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    const x = 115 + 74 * Math.cos(a);
    const y = 115 - 74 * Math.sin(a);
    glyphs += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(90 - i * 15).toFixed(0)}) scale(0.8)" d="${shapes[i % 6]}" fill="none" stroke="#7af4ff" stroke-width="1.8" stroke-linejoin="round"/>`;
  }
  let diamonds = "";
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const x = 115 + 91 * Math.cos(a);
    const y = 115 - 91 * Math.sin(a);
    diamonds += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(90 - k * 60).toFixed(0)})" d="M0,-9 L6,0 L0,9 L-6,0Z" fill="#46f0ff"/><path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(90 - k * 60).toFixed(0)})" d="M0,-4 L2.6,0 L0,4 L-2.6,0Z" fill="#ffffff"/>`;
  }
  return svg(
    `<svg viewBox="0 0 230 230">
      <polygon points="${hexPts(106)}" fill="none" stroke="#46f0ff" stroke-width="2.6" stroke-linejoin="round"/>
      <polygon points="${hexPts(101)}" fill="none" stroke="#2a9bff" stroke-width="1.4" stroke-linejoin="round"/>
      <polygon points="${hexPts(84)}" fill="none" stroke="#46f0ff" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="115" cy="115" r="65" fill="none" stroke="#46f0ff" stroke-width="1.6" stroke-dasharray="9 5"/>
      ${ticks}${glyphs}${diamonds}
    </svg>`,
    { size: 1024 },
  );
}
const T_RUNES = runeSvg();
const T_STAR = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 0 L19.2 12.8 L32 16 L19.2 19.2 L16 32 L12.8 19.2 L0 16 L12.8 12.8Z" fill="#fff4b8"/><path d="M16 6 L17.6 14.4 L26 16 L17.6 17.6 L16 26 L14.4 17.6 L6 16 L14.4 14.4Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);

// ------------------------------------------------------------------------------------------------ paints
const GOLD_PAINT = paint((p, n) => {
  const t = n.y * 0.6 + n.z * 0.18 + n.x * 0.1 + (noise(p, 0.07, 3) - 0.5) * 0.4;
  const base = mix(GOLD_DK, GOLD_MID, smoothstep(-0.8, 0.05, t));
  return mix(base, GOLD_HI, smoothstep(0.25, 0.95, t));
});
const HEAP_PAINT = mottle(GOLD_DK, BRONZE, { size: 0.12, contrast: 0.7, seed: 4 });
const VELVET_PAINT = mottle(VELVET, VELVET_DK, { size: 0.05, contrast: 0.6, seed: 9 });
const STONE_PAINT = patches(STONE_DK, [STONE, STONE2, STONE3], { size: 0.3, gap: 0.035, seed: 12 });
const STONE_SIDE = mottle(STONE2, STONE_DK, { size: 0.18, contrast: 0.7, seed: 2 });

// planks on the body: rows stacked in y, streaky grain along x/z
const WOODS = [WOOD, WOOD2, WOOD3, WOOD2];
const BODY_WOOD = paint((p) => {
  const row = (p.y - 0.13) / 0.0925;
  const id = Math.floor(row);
  const f = row - id;
  const g = noise(new THREE.Vector3(p.x * 0.18, p.y * 1.3, p.z * 0.18 + id * 2.1), 0.05, 5);
  const c = mix(WOODS[(id + 8) % 4], WOOD_DK, smoothstep(0.55, 1, g) * 0.55);
  if (f < 0.045 || f > 0.97) return WOOD_DK;
  return c;
});
const LID_CX = 0.27;
const LID_WOOD = paint((p) => {
  const ang = Math.atan2(p.y - 0.5, -((p.z + 0.675) - LID_CX) / 1.0);
  const row = ang / (Math.PI / 6);
  const id = Math.floor(row);
  const f = row - id;
  const g = noise(new THREE.Vector3(p.x * 0.18, p.y, p.z), 0.05, 7);
  const c = mix(WOODS[(id + 8) % 4], WOOD_DK, smoothstep(0.55, 1, g) * 0.55);
  if (f < 0.045 || f > 0.97) return WOOD_DK;
  return c;
});
// diamond lattice on the crown band; lathe coordinates s = [height, degrees]
const BAND_PAINT = paint((_p, _n, s) => {
  const a = (((s[1] / 360) * 12) % 1 + 1) % 1;
  const v = s[0] / 0.08;
  const e = Math.abs(a - 0.5) + Math.abs(v - 0.5) * 0.9;
  if (Math.abs(e - 0.34) < 0.05) return GOLD_DK;
  if (e < 0.13) return GOLD_HI;
  return GOLD_PAINT;
});
// goblets: dark bands at set heights
const GOBLET_PAINT = paint((_p, n, s) => {
  const h = s[0];
  if (Math.abs(h - 0.135) < 0.004 || Math.abs(h - 0.2) < 0.003 || Math.abs(h - 0.352) < 0.004) return GOLD_DK;
  if (n.y > 0.4 && h > 0.25) return GOLD_DK;
  return GOLD_PAINT;
});
const SILVER_PAINT = paint((p, n) => {
  const t = n.y * 0.6 + n.z * 0.2 + (noise(p, 0.06, 8) - 0.5) * 0.3;
  const base = mix(SILVER_DK, SILVER, smoothstep(-0.6, 0.3, t));
  return mix(base, "#ffffff", smoothstep(0.5, 1, t));
});

// ------------------------------------------------------------------------------------------------ batching helpers
type Opt = { smooth?: boolean; texture?: THREE.Texture; glow?: number };
const texIds = new Map<THREE.Texture, number>();
const texId = (t: THREE.Texture) => {
  if (!texIds.has(t)) texIds.set(t, texIds.size + 1);
  return texIds.get(t)!;
};
function norm(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g.clone();
  for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") n.deleteAttribute(k);
  if (!n.attributes.uv) n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
  return n;
}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const alignY = (dir: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
const eul = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
const mat = (pos: THREE.Vector3, q?: THREE.Quaternion, s: number | THREE.Vector3 = 1) =>
  new THREE.Matrix4().compose(pos, q ?? new THREE.Quaternion(), typeof s === "number" ? V(s, s, s) : s);

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, 0.5, -0.675], dir: [0, 0, 1], role: "hinge" });
  type Bone = typeof root;

  class Stash {
    private groups = new Map<string, { fill: Fill; opt: Opt; geos: THREE.BufferGeometry[] }>();
    constructor(private readonly bone: Bone) {}
    add(fill: Fill, geo: THREE.BufferGeometry, m?: THREE.Matrix4, opt: Opt = {}) {
      const key = `${String(fill)}|${opt.smooth ? 1 : 0}|${opt.texture ? texId(opt.texture) : 0}|${opt.glow ?? 0}`;
      let grp = this.groups.get(key);
      if (!grp) this.groups.set(key, (grp = { fill, opt, geos: [] }));
      const g = norm(geo);
      if (m) g.applyMatrix4(m);
      grp.geos.push(g);
    }
    flush() {
      for (const { fill, opt, geos } of this.groups.values()) {
        const merged = mergeGeometries(geos);
        if (!merged) throw new Error("merge failed");
        const part = b.part(merged, fill, { bone: this.bone, at: [0, 0, 0], flat: !opt.smooth, texture: opt.texture });
        if (opt.glow) glow(part, opt.glow);
      }
    }
  }
  const world = new Stash(root);
  const lidS = new Stash(lid);

  const box = (s: Stash, fill: Fill, c: [number, number, number], size: [number, number, number], q?: THREE.Quaternion) =>
    s.add(fill, new THREE.BoxGeometry(...size), mat(V(...c), q));

  // ---------------------------------------------------------------------------------------------- the dais
  const hexQ = eul(0, Math.PI / 6, 0);
  world.add(STONE_SIDE, new THREE.CylinderGeometry(1.2, 1.2, 0.04, 6), mat(V(0, 0.02, 0), hexQ));
  world.add(STONE_PAINT, new THREE.CylinderGeometry(1.15, 1.15, 0.04, 6), mat(V(0, 0.06, 0), hexQ));
  world.add(GOLD_PAINT, new THREE.CylinderGeometry(1.17, 1.17, 0.012, 6), mat(V(0, 0.046, 0), hexQ));
  world.add(GOLD_DK, new THREE.CylinderGeometry(1.2, 1.2, 0.008, 6), mat(V(0, 0.042, 0), hexQ));
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const cx = Math.cos(a) * 1.165;
    const cz = Math.sin(a) * 1.165;
    world.add(GOLD_PAINT, new THREE.ConeGeometry(0.045, 0.1, 4), mat(V(cx, 0.1, cz), eul(0, a + Math.PI / 4, 0)));
    world.add(GOLD_DK, new THREE.CylinderGeometry(0.05, 0.06, 0.03, 6), mat(V(cx, 0.055, cz)));
    world.add(CYAN, new THREE.IcosahedronGeometry(0.026, 0), mat(V(cx, 0.17, cz)), { glow: 1.2 });
  }
  // glowing rune ring inlaid in the top
  {
    const plane = new THREE.PlaneGeometry(2.3, 2.3).rotateX(-Math.PI / 2);
    const p = b.part(plane, "#ffffff", { bone: root, at: [0, FLOOR + 0.0015, 0], texture: T_RUNES });
    glow(p, 1);
  }

  // ---------------------------------------------------------------------------------------------- heap surfaces
  const BUMPS: number[][] = [
    [0.0, 0.15, 0.74, 0.28],
    [0.55, 0.2, 0.34, 0.2],
    [-0.55, 0.18, 0.36, 0.22],
    [0.2, 0.64, 0.3, 0.12],
    [-0.28, 0.62, 0.3, 0.11],
    [0.32, 0.3, 0.32, 0.08],
    [-0.68, -0.3, 0.3, 0.16],
    [0.68, -0.3, 0.3, 0.14],
    [0.0, 0.88, 0.2, 0.05],
  ];
  const H = (x: number, z: number) => {
    let y = FLOOR;
    for (const [cx, cz, r, h] of BUMPS) {
      const d = ((x - cx) ** 2 + (z - cz) ** 2) / (r * r);
      if (d < 1) y += h * (1 - d) * (1 - d);
    }
    return y + (y > FLOOR + 0.01 ? 0.008 * Math.sin(x * 13) * Math.sin(z * 11) : 0);
  };
  const IN_X = 0.385;
  const HIN = (x: number, z: number) => {
    const dx = x / 0.4;
    const dz = (z + 0.42) / 0.23;
    const k = Math.max(0, 1 - dx * dx - dz * dz);
    return 0.455 + 0.14 * Math.pow(k, 0.8) + 0.008 * Math.sin(x * 29) * Math.sin(z * 23);
  };
  const gradient = (f: (x: number, z: number) => number, x: number, z: number) => {
    const e = 0.02;
    return V(-(f(x + e, z) - f(x - e, z)) / (2 * e), 1, -(f(x, z + e) - f(x, z - e)) / (2 * e)).normalize();
  };
  function heightMesh(x0: number, x1: number, z0: number, z1: number, step: number, f: (x: number, z: number) => number, minY: number, lower: number) {
    const nx = Math.round((x1 - x0) / step);
    const nz = Math.round((z1 - z0) / step);
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= nx; i++)
      for (let j = 0; j <= nz; j++) {
        const x = x0 + (i / nx) * (x1 - x0);
        const z = z0 + (j / nz) * (z1 - z0);
        const h = f(x, z);
        pos.push(x, h > minY ? h - lower : h - lower - 0.02, z);
      }
    const vi = (i: number, j: number) => i * (nz + 1) + j;
    const hh = (k: number) => pos[k * 3 + 1];
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const a = vi(i, j);
        const c = vi(i + 1, j);
        const d = vi(i, j + 1);
        const e = vi(i + 1, j + 1);
        if (Math.max(hh(a), hh(c), hh(d), hh(e)) <= minY - lower) continue;
        idx.push(a, d, c, c, d, e);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }
  world.add(HEAP_PAINT, heightMesh(-1.0, 1.0, -0.5, 1.0, 0.05, H, FLOOR + 0.003, 0.022));
  world.add(VELVET_DK, heightMesh(-IN_X, IN_X, -0.63, -0.21, 0.04, HIN, 0, 0.02));

  // ---------------------------------------------------------------------------------------------- coins
  const COIN_KINDS = [
    { body: GOLD_MID, tex: T_GOLD, w: 0.42 },
    { body: "#d9751a", tex: T_AMBER, w: 0.28 },
    { body: SILVER_DK, tex: T_SILVER, w: 0.18 },
    { body: GOLD_MID, tex: T_RARE, w: 0.12 },
  ];
  const coinBody = new THREE.CylinderGeometry(1, 1, 1, 8);
  const coinFace = new THREE.CircleGeometry(0.86, 8).rotateX(-Math.PI / 2).translate(0, 0.5 + 0.14, 0);
  const R = rng(11);
  function coin(kind: number, pos: THREE.Vector3, normal: THREE.Vector3, spin: number, r = 0.05) {
    const q = alignY(normal).multiply(eul(0, spin, 0));
    const m = mat(pos, q, V(r, 0.0095, r));
    const k = COIN_KINDS[kind];
    world.add(k.body, coinBody, m);
    world.add("#ffffff", coinFace, m, { texture: k.tex });
  }
  const pickKind = () => {
    let t = R();
    for (let i = 0; i < COIN_KINDS.length; i++) {
      t -= COIN_KINDS[i].w;
      if (t <= 0) return i;
    }
    return 0;
  };
  const jitter = (n: THREE.Vector3, amount: number) => {
    const ax = V(R() - 0.5, 0, R() - 0.5).normalize();
    return n.clone().applyAxisAngle(ax, (R() - 0.3) * amount).normalize();
  };
  function poisson(
    count: number,
    minDist: number,
    sample: () => [number, number] | null,
    accept: (x: number, z: number) => boolean,
  ) {
    const out: [number, number][] = [];
    const cell = new Map<string, [number, number][]>();
    for (let tries = 0; tries < count * 40 && out.length < count; tries++) {
      const s = sample();
      if (!s || !accept(s[0], s[1])) continue;
      const cx = Math.floor(s[0] / minDist);
      const cz = Math.floor(s[1] / minDist);
      let ok = true;
      for (let i = -1; i <= 1 && ok; i++)
        for (let j = -1; j <= 1 && ok; j++)
          for (const o of cell.get(`${cx + i},${cz + j}`) ?? []) if ((o[0] - s[0]) ** 2 + (o[1] - s[1]) ** 2 < minDist * minDist) ok = false;
      if (!ok) continue;
      out.push(s);
      const key = `${cx},${cz}`;
      cell.set(key, [...(cell.get(key) ?? []), s]);
    }
    return out;
  }
  const inChest = (x: number, z: number, pad = 0) => Math.abs(x) < 0.46 + pad && z < -0.14 + pad && z > -0.71 - pad;
  // keep-out discs: crystals, goblets, ingots, tower bases
  const KEEP: [number, number, number][] = [
    [-0.8, -0.5, 0.17],
    [0.8, -0.5, 0.17],
    [-0.66, 0.6, 0.1],
    [0.66, 0.52, 0.1],
    [0.93, 0.02, 0.21],
    [-0.93, 0.08, 0.14],
  ];
  const keptOut = (x: number, z: number) => KEEP.some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const inHex = (x: number, z: number, m: number) => Math.abs(z) < 0.996 - m && Math.abs(x) < 1.15 - m - Math.abs(z) * 0.577;

  // the main heap
  const heapPts = poisson(
    600,
    0.0345,
    () => [R() * 2 - 1.0, R() * 1.45 - 0.45],
    (x, z) => !inChest(x, z, 0.01) && H(x, z) > FLOOR + 0.012 && !keptOut(x, z) && inHex(x, z, 0.06),
  );
  for (const [x, z] of heapPts) {
    const y = H(x, z) + (R() - 0.5) * 0.012;
    const n = gradient(H, x, z);
    const standing = R() < 0.08;
    const nn = standing ? jitter(n, 2.4) : jitter(n, 0.7);
    coin(pickKind(), V(x, y, z), nn, R() * 6.28, 0.043 + R() * 0.012);
  }
  // inside the chest
  const chestPts = poisson(
    110,
    0.045,
    () => [(R() * 2 - 1) * (IN_X - 0.03), -0.6 + R() * 0.37],
    () => true,
  );
  for (const [x, z] of chestPts) {
    const n = gradient(HIN, x, z);
    coin(pickKind(), V(x, HIN(x, z) + (R() - 0.5) * 0.01, z), jitter(n, 0.8), R() * 6.28, 0.042 + R() * 0.01);
  }
  // coins on the dais floor
  const floorPts = poisson(
    44,
    0.12,
    () => [R() * 2.2 - 1.1, R() * 1.9 - 0.95],
    (x, z) => H(x, z) < FLOOR + 0.004 && !inChest(x, z, 0.1) && !keptOut(x, z) && inHex(x, z, 0.12),
  );
  for (const [x, z] of floorPts) coin(pickKind(), V(x, FLOOR + 0.005 + (R() < 0.15 ? 0.02 : 0), z), R() < 0.15 ? jitter(UP, 1.1) : jitter(UP, 0.12), R() * 6.28, 0.05);
  // coins draped over the chest's front rim
  for (let i = 0; i < 9; i++) {
    const x = -0.36 + i * 0.09 + (R() - 0.5) * 0.03;
    const n = V((R() - 0.5) * 0.2, 0.55 + R() * 0.2, 0.8).normalize();
    coin(pickKind(), V(x, 0.5 + 0.004, -0.17 + 0.012 + R() * 0.02), n, R() * 6.28, 0.045);
  }

  // coin towers
  function tower(x: number, z: number, n: number, lean: number, kinds: number[]) {
    for (let i = 0; i < n; i++) {
      const off = V((R() - 0.5) * 0.008 + lean * i * 0.004, 0, (R() - 0.5) * 0.008);
      coin(kinds[i % kinds.length], V(x + off.x, FLOOR + 0.0048 + i * 0.0098, z + off.z), UP, R() * 6.28, 0.05);
    }
  }
  tower(-0.9, 0.0, 12, 1, [0, 0, 1]);
  tower(-0.97, 0.16, 8, -1, [2, 2, 0]);
  tower(-0.82, 0.19, 5, 0, [1]);
  tower(-0.74, 0.09, 3, 0, [3, 0]);
  // a toppled stack
  for (let i = 0; i < 7; i++) {
    const q = eul(Math.PI / 2, 0.35, 0);
    world.add(COIN_KINDS[0].body, coinBody, mat(V(-0.62 + i * 0.0098 * Math.cos(0.35), FLOOR + 0.05, 0.9 + i * 0.0098 * Math.sin(0.35) * 0), q, V(0.05, 0.0095, 0.05)));
  }

  // ---------------------------------------------------------------------------------------------- gems
  const brilliant = new THREE.LatheGeometry(
    [V(0, -0.9, 0), V(1, 0, 0), V(1, 0.1, 0), V(0.62, 0.42, 0), V(0, 0.42, 0)].map((v) => new THREE.Vector2(v.x, v.y)),
    8,
  );
  const shard = (() => {
    const prism = new THREE.CylinderGeometry(0.7, 0.8, 1.1, 6, 1, true).translate(0, 0.05, 0);
    const tip = new THREE.ConeGeometry(0.7, 0.7, 6, 1, true).translate(0, 0.95, 0);
    const base = new THREE.ConeGeometry(0.8, 0.4, 6, 1, true).rotateX(Math.PI).translate(0, -0.7, 0);
    return mergeGeometries([norm(prism), norm(tip), norm(base)])!;
  })();
  const octa = new THREE.OctahedronGeometry(1, 0).scale(0.85, 1.2, 0.85);
  const GEMS = [RUBY, SAPPH, EMERALD, VIOLET, TOPAZ, CYAN];
  const gem = (stash: Stash, shape: 0 | 1 | 2, color: string, pos: THREE.Vector3, normal: THREE.Vector3, size: number, glowS = 0) =>
    stash.add(color, shape === 0 ? brilliant : shape === 1 ? shard : octa, mat(pos, alignY(normal).multiply(eul(0, R() * 6, 0)), size), glowS ? { glow: glowS } : {});
  const gemPts = poisson(
    36,
    0.13,
    () => [R() * 1.8 - 0.9, R() * 1.35 - 0.4],
    (x, z) => !inChest(x, z, 0.02) && H(x, z) > FLOOR + 0.06 && !keptOut(x, z) && inHex(x, z, 0.12),
  );
  gemPts.forEach(([x, z], i) => {
    const size = 0.024 + R() * 0.02;
    const n = jitter(gradient(H, x, z), 0.9);
    gem(world, ((i % 3) as 0 | 1 | 2), GEMS[i % 6], V(x, H(x, z) + size * 0.55, z), n, size, i % 4 === 0 ? 0.45 : 0);
  });
  const chestGems = poisson(
    14,
    0.1,
    () => [(R() * 2 - 1) * 0.33, -0.6 + R() * 0.33],
    () => true,
  );
  chestGems.forEach(([x, z], i) => {
    const size = 0.024 + R() * 0.022;
    gem(world, ((i % 3) as 0 | 1 | 2), GEMS[(i + 2) % 6], V(x, HIN(x, z) + size * 0.5, z), jitter(gradient(HIN, x, z), 0.7), size, i % 3 === 0 ? 0.45 : 0);
  });

  // ---------------------------------------------------------------------------------------------- the chest
  const W = 0.86;
  const D = 0.5;
  const T = 0.035;
  const CZ = -0.42;
  const FRONT = -0.17;
  const BACK = -0.67;
  box(world, BODY_WOOD, [0, 0.315, FRONT - T / 2], [W, 0.37, T]);
  box(world, BODY_WOOD, [0, 0.315, BACK + T / 2], [W, 0.37, T]);
  for (const s of [1, -1]) box(world, BODY_WOOD, [s * (W / 2 - T / 2), 0.315, CZ], [T, 0.37, D - 2 * T]);
  box(world, WOOD_DK, [0, 0.15, CZ], [W - 0.04, 0.04, D - 0.04]);
  // velvet lining
  box(world, VELVET_PAINT, [0, 0.33, FRONT - T - 0.003], [W - 2 * T, 0.34, 0.006]);
  box(world, VELVET_PAINT, [0, 0.33, BACK + T + 0.003], [W - 2 * T, 0.34, 0.006]);
  for (const s of [1, -1]) box(world, VELVET_PAINT, [s * (W / 2 - T - 0.003), 0.33, CZ], [0.006, 0.34, D - 2 * T]);
  // gold rim and base bands
  for (const [y, h] of [[0.478, 0.048], [0.152, 0.044]] as const) {
    box(world, GOLD_PAINT, [0, y, FRONT + 0.008], [W + 0.034, h, 0.018]);
    box(world, GOLD_PAINT, [0, y, BACK - 0.008], [W + 0.034, h, 0.018]);
    for (const s of [1, -1]) box(world, GOLD_PAINT, [s * (W / 2 + 0.008), y, CZ], [0.018, h, D + 0.034]);
  }
  // front and back straps, side straps
  for (const x of [-0.28, 0.28]) {
    box(world, GOLD_PAINT, [x, 0.315, FRONT + 0.006], [0.07, 0.3, 0.014]);
    box(world, GOLD_PAINT, [x, 0.315, BACK - 0.006], [0.07, 0.3, 0.014]);
    box(world, GOLD_DK, [x, 0.315, FRONT + 0.0145], [0.012, 0.28, 0.003]);
    for (const y of [0.2, 0.26, 0.32, 0.38, 0.44]) {
      world.add(GOLD_HI, new THREE.SphereGeometry(0.009, 6, 4), mat(V(x - 0.024, y, FRONT + 0.015)));
      world.add(GOLD_HI, new THREE.SphereGeometry(0.009, 6, 4), mat(V(x + 0.024, y, FRONT + 0.015)));
    }
  }
  for (const s of [1, -1]) {
    box(world, GOLD_PAINT, [s * (W / 2 + 0.006), 0.315, CZ], [0.014, 0.3, 0.09]);
    for (const dz of [-0.03, 0.03]) for (const y of [0.22, 0.31, 0.4]) world.add(GOLD_HI, new THREE.SphereGeometry(0.009, 6, 4), mat(V(s * (W / 2 + 0.015), y, CZ + dz)));
  }
  // corner posts with spiked caps
  for (const sx of [1, -1])
    for (const [z, sz] of [[FRONT, 1], [BACK, -1]] as const) {
      const x = sx * (W / 2);
      box(world, GOLD_PAINT, [x, 0.318, z], [0.056, 0.4, 0.056]);
      world.add(GOLD_PAINT, new THREE.ConeGeometry(0.05, 0.1, 4), mat(V(x, 0.568, z), eul(0, Math.PI / 4, 0)));
      world.add(GOLD_HI, new THREE.SphereGeometry(0.012, 6, 4), mat(V(x + sx * 0.03, 0.4, z + sz * 0.03)));
      world.add(GOLD_HI, new THREE.SphereGeometry(0.012, 6, 4), mat(V(x + sx * 0.03, 0.24, z + sz * 0.03)));
      // claw foot
      world.add(GOLD_DK, new THREE.CylinderGeometry(0.036, 0.05, 0.05, 6), mat(V(x - sx * 0.02, 0.105, z - sz * 0.02)));
      world.add(GOLD_PAINT, new THREE.ConeGeometry(0.02, 0.05, 5), mat(V(x - sx * 0.02, 0.098, z + sz * 0.045), eul(sz * 1.2, 0, 0)));
    }
  // hinge knuckles
  for (const x of [-0.22, 0, 0.22]) world.add(GOLD_PAINT, new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), mat(V(x, 0.5, BACK - 0.005), eul(0, 0, Math.PI / 2)));
  // lock
  {
    const plate = b.extrude(
      [[-0.075, 0.08], [0.075, 0.08], [0.082, 0.0], [0.05, -0.075], [0, -0.115, "sharp"], [-0.05, -0.075], [-0.082, 0.0]],
      { at: [0, 0.4, FRONT + 0.004], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.022, bevel: 0.006, smoothing: 1, color: GOLD_PAINT, bone: root, name: "lockPlate" },
    );
    void plate;
    const keyhole = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8).rotateX(Math.PI / 2);
    world.add(INK, keyhole, mat(V(0, 0.337, FRONT + 0.0165)));
    box(world, INK, [0, 0.314, FRONT + 0.0165], [0.012, 0.04, 0.003]);
    glow(
      b.lathe([[0, -0.02], [0.034, 0], [0.034, 0.012], [0.02, 0.03], [0, 0.03]], { at: [0, 0.428, FRONT + 0.015], axis: [0, 0, 1], segments: 8, color: CYAN, bone: root, name: "lockGem" }),
      1.2,
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      world.add(GOLD_HI, new THREE.ConeGeometry(0.007, 0.022, 5), mat(V(Math.cos(a) * 0.044, 0.428 + Math.sin(a) * 0.044, FRONT + 0.03), eul(Math.PI / 2, 0, 0)));
    }
  }

  // ---------------------------------------------------------------------------------------------- the lid
  const archPt = (th: number, a: number, bb: number) => [LID_CX - a * Math.cos(th), bb * Math.sin(th)] as [number, number];
  const archPoly = (a: number, bb: number, n = 12) => Array.from({ length: n + 1 }, (_, i) => archPt((i / n) * Math.PI, a, bb));
  const HINGE: [number, number, number] = [0, 0.5, -0.675];
  b.extrude(archPoly(0.27, 0.22), { at: [HINGE[0], HINGE[1], HINGE[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: W, bevel: 0.01, color: LID_WOOD, bone: lid, name: "lidShell" });
  for (const x of [-0.28, 0.28]) {
    const outer = archPoly(0.288, 0.238, 12);
    const inner = archPoly(0.27, 0.22, 12).reverse();
    b.extrude([...outer, ...inner], { at: [x, HINGE[1], HINGE[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.004, color: GOLD_PAINT, bone: lid, name: "lidBand" });
    for (let i = 1; i < 6; i++) {
      const [zl, y] = archPt((i / 6) * Math.PI, 0.288, 0.238);
      for (const dx of [-0.026, 0.026]) lidS.add(GOLD_HI, new THREE.SphereGeometry(0.009, 6, 4), mat(V(x + dx, HINGE[1] + y, HINGE[2] + zl)));
    }
  }
  for (const s of [1, -1]) {
    const o = archPoly(0.288, 0.238, 12);
    b.extrude(o, { at: [s * (W / 2 + 0.002), HINGE[1], HINGE[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.005, color: GOLD_PAINT, bone: lid, name: "lidEnd" });
    // end plate gem
    const [zl, y] = archPt(Math.PI / 2, 0.27, 0.22);
    void zl;
    lidS.add(RUBY, brilliant, mat(V(s * (W / 2 + 0.026), HINGE[1] + y * 0.5, HINGE[2] + LID_CX), alignY(V(s, 0, 0)), 0.03), { glow: 0.5 });
  }
  // crest fin along the ridge
  {
    const outer: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const th = (i / 40) * Math.PI;
      const u = (th / Math.PI) * 5;
      const f = u - Math.floor(u);
      const h = 0.012 + (th > 0.12 && th < Math.PI - 0.12 ? 0.085 * (1 - Math.abs(2 * f - 1)) : 0);
      outer.push(archPt(th, 0.27 + h * 0.6, 0.22 + h));
    }
    const inner = archPoly(0.26, 0.2, 12).reverse();
    b.extrude([...outer, ...inner], { at: [0, HINGE[1], HINGE[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.022, bevel: 0.004, color: GOLD_PAINT, bone: lid, name: "lidCrest" });
  }
  // velvet underside, studs and a tab
  box(lidS, VELVET_PAINT, [0, 0.5 - 0.005, -0.675 + LID_CX], [W - 0.07, 0.01, 0.54 - 0.04]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      lidS.add(GOLD_HI, new THREE.SphereGeometry(0.012, 6, 4), mat(V(-0.3 + i * 0.2, 0.5 - 0.011, -0.675 + 0.12 + j * 0.15)));
    }
  lidS.add(GOLD_PAINT, new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), mat(V(0, 0.5 - 0.018, -0.675 + LID_CX)));
  lidS.add(CYAN, brilliant, mat(V(0, 0.5 - 0.034, -0.675 + LID_CX), alignY(V(0, -1, 0)), 0.04), { glow: 1 });
  box(lidS, GOLD_PAINT, [0, 0.5 - 0.035, -0.675 + 0.545], [0.07, 0.07, 0.016]);
  lidS.add(INK, new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8).rotateX(Math.PI / 2), mat(V(0, 0.5 - 0.04, -0.675 + 0.545)));

  // ---------------------------------------------------------------------------------------------- crown
  const CO = V(0.3, H(0.3, 0.26) + 0.045, 0.27);
  const CQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.32, 0.5, 0.12, "YXZ"));
  const cp = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(CQ).add(CO);
  const cd = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(CQ).normalize();
  const cUp = cd(0, 1, 0);
  b.lathe([[0.108, 0], [0.126, 0], [0.166, 0.082], [0.152, 0.082]], { at: cp(0, 0, 0), axis: cUp, segments: 16, color: BAND_PAINT, bone: root, name: "crownBand" });
  b.lathe([[0, 0.066], [0.15, 0.066], [0.13, 0.112], [0.07, 0.145], [0, 0.155]], { at: cp(0, 0, 0), axis: cUp, segments: 12, color: VELVET_PAINT, bone: root, name: "crownCap" });
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const hgt = [1.25, 0.78, 1.0, 0.78, 1.15, 0.78, 1.0, 0.78][k];
    const out = V(Math.sin(a), 0, Math.cos(a));
    const tan = V(Math.cos(a), 0, -Math.sin(a));
    const at = cp(out.x * 0.153, 0.07, out.z * 0.153);
    const yDir = cd(out.x * 0.16, 1, out.z * 0.16);
    const sp = b.extrude(
      [[-0.034, 0], [0.034, 0], [0.036, 0.04], [0.022, 0.1], [0.012, 0.17], [0, 0.225, "sharp"], [-0.012, 0.17], [-0.022, 0.1], [-0.036, 0.04]].map(([x, y, s]) => (s ? [x * 1, (y as number) * hgt, s] : [x, (y as number) * hgt])) as [number, number][],
      { at, x: tan.clone().applyQuaternion(CQ), y: yDir, thickness: 0.016, bevel: 0.004, smoothing: 1, color: GOLD_PAINT, bone: root, name: "crownSpike" },
    );
    void sp;
    const tip = at.clone().addScaledVector(yDir, 0.225 * hgt + 0.012);
    const tall = hgt > 0.9;
    world.add(tall ? CYAN : RUBY, new THREE.IcosahedronGeometry(tall ? 0.02 : 0.015, 0), mat(tip), { glow: tall ? 1.2 : 0.8 });
    // gem on the spike body
    const gp = at.clone().addScaledVector(yDir, 0.045 * hgt).addScaledVector(cd(out.x, 0, out.z), 0.009);
    gem(world, 0, [RUBY, SAPPH, EMERALD, VIOLET][k % 4], gp, cd(out.x, 0.3, out.z), 0.015 + 0.006 * hgt);
    // gold beads on the band: bottom and top rims
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    world.add(GOLD_HI, new THREE.SphereGeometry(0.008, 6, 4), mat(cp(Math.sin(a) * 0.128, 0.003, Math.cos(a) * 0.128)));
    world.add(GOLD_HI, new THREE.SphereGeometry(0.008, 6, 4), mat(cp(Math.sin(a) * 0.164, 0.082, Math.cos(a) * 0.164)));
  }
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    const out = cd(Math.sin(a), 0.15, Math.cos(a));
    gem(world, i % 2 ? 2 : 0, [CYAN, RUBY, EMERALD, VIOLET][i % 4], cp(Math.sin(a) * 0.148, 0.038, Math.cos(a) * 0.148), out, 0.019, i % 2 ? 0 : 0.5);
  }
  for (const a of [0, Math.PI / 2]) {
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const pts = [
      cp(sx * 0.15, 0.07, sz * 0.15),
      cp(sx * 0.1, 0.135, sz * 0.1),
      cp(sx * 0.045, 0.18, sz * 0.045),
      cp(0, 0.205, 0),
      cp(-sx * 0.045, 0.18, -sz * 0.045),
      cp(-sx * 0.1, 0.135, -sz * 0.1),
      cp(-sx * 0.15, 0.07, -sz * 0.15),
    ];
    b.sweep(catmull(pts), 0.0105, { color: GOLD_PAINT, sides: 6, bone: root, name: "crownArch" });
  }
  world.add(GOLD_PAINT, new THREE.SphereGeometry(0.026, 8, 6), mat(cp(0, 0.222, 0)), { smooth: true });
  world.add(RUBY, new THREE.OctahedronGeometry(0.02, 0).scale(0.8, 1.3, 0.8), mat(cp(0, 0.262, 0), CQ), { glow: 1 });
  world.add(GOLD_PAINT, new THREE.ConeGeometry(0.01, 0.03, 4), mat(cp(0, 0.3, 0), CQ));

  // ---------------------------------------------------------------------------------------------- goblets
  const TALL: [number, number][] = [[0, 0], [0.085, 0], [0.085, 0.012], [0.07, 0.024], [0.05, 0.034], [0.02, 0.07], [0.016, 0.12], [0.04, 0.138], [0.04, 0.158], [0.016, 0.18], [0.016, 0.21], [0.04, 0.226], [0.085, 0.276], [0.105, 0.332], [0.108, 0.364], [0.1, 0.366], [0.084, 0.31], [0, 0.258]];
  const SQUAT: [number, number][] = [[0, 0], [0.09, 0], [0.092, 0.014], [0.06, 0.03], [0.028, 0.05], [0.02, 0.085], [0.05, 0.1], [0.05, 0.116], [0.024, 0.128], [0.02, 0.15], [0.07, 0.17], [0.125, 0.22], [0.14, 0.26], [0.13, 0.262], [0.114, 0.222], [0.06, 0.188], [0, 0.178]];
  const scaled = (o: [number, number][], s: number) => o.map(([x, y]) => [x * s, y * s] as [number, number]);
  const goblet = (o: [number, number][], s: number, at: THREE.Vector3, axis: THREE.Vector3, fill: Fill, name: string) =>
    b.lathe(scaled(o, s), { at, axis, segments: 10, color: fill, bone: root, name });

  // tall gold goblet brimming with gems, standing
  {
    const g = V(-0.66, FLOOR, 0.6);
    const s = 0.82;
    goblet(TALL, s, g, UP, GOBLET_PAINT, "gobletTall");
    const rimY = 0.364 * s;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      gem(world, i % 2 ? 2 : 0, [RUBY, SAPPH][i % 2], g.clone().add(V(Math.sin(a) * 0.109 * s, 0.3 * s + 0.02, Math.cos(a) * 0.109 * s)), V(Math.sin(a), 0.1, Math.cos(a)), 0.016);
    }
    gem(world, 1, VIOLET, g.clone().add(V(0.04 * s, 0.1 * s + 0.01, 0.04 * s)), V(1, 1, 1), 0.012);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      world.add(GOLD_HI, new THREE.SphereGeometry(0.014, 6, 4), mat(g.clone().add(V(Math.sin(a) * 0.043, 0.15 * s, Math.cos(a) * 0.043))), { smooth: true });
    }
    for (let i = 0; i < 12; i++) {
      const rr = Math.sqrt(R()) * 0.075 * s;
      const a = R() * 6.28;
      const y = rimY + 0.012 + (1 - rr / (0.08 * s)) * 0.05 * s;
      gem(world, (i % 3) as 0 | 1 | 2, GEMS[i % 6], g.clone().add(V(Math.sin(a) * rr, y, Math.cos(a) * rr)), jitter(UP, 1.4), 0.022 + R() * 0.012, i % 2 ? 0.5 : 0);
    }
  }
  // silver chalice with handles, coin-filled, standing
  {
    const g = V(0.66, FLOOR, 0.52);
    const s = 0.9;
    goblet(SQUAT, s, g, UP, SILVER_PAINT, "chalice");
    const topY = 0.26 * s;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      world.add(i % 2 ? SAPPH : CYAN, brilliant, mat(g.clone().add(V(Math.sin(a) * 0.132 * s, 0.215 * s, Math.cos(a) * 0.132 * s)), alignY(V(Math.sin(a), 0.4, Math.cos(a))), 0.014));
    }
    for (const sx of [1, -1]) {
      const pts = [V(sx * 0.03, 0.15 * s, 0), V(sx * 0.12, 0.13 * s, 0), V(sx * 0.17, 0.2 * s, 0), V(sx * 0.14, 0.255 * s, 0)].map((p) => p.multiplyScalar(1).add(V(g.x, g.y, g.z)));
      b.sweep(catmull(pts), 0.0085, { color: SILVER_PAINT, sides: 6, bone: root, name: "chaliceHandle" });
      world.add(SAPPH, brilliant, mat(pts[2].clone().add(V(sx * 0.01, 0, 0)), alignY(V(sx, 0.2, 0)), 0.014), { glow: 0.5 });
    }
    // coins heaped in the bowl
    for (let i = 0; i < 30; i++) {
      const rr = Math.sqrt(R()) * 0.11 * s;
      const a = R() * 6.28;
      const y = topY + 0.006 + Math.max(0, 1 - rr / (0.12 * s)) * 0.07 + R() * 0.012;
      const n = jitter(V(Math.sin(a) * rr * 2, 1, Math.cos(a) * rr * 2).normalize(), 0.8);
      coin(pickKind(), g.clone().add(V(Math.sin(a) * rr, y - FLOOR + FLOOR - g.y + g.y - 0, Math.cos(a) * rr)).setY(g.y + y), n, R() * 6.28, 0.042);
    }
  }
  // violet goblet tipped over, spilling coins and gems toward the viewer
  {
    const dir = V(0.35, 0.3, 0.88).normalize();
    const base = V(0.02, H(0.02, 0.62) + 0.05, 0.64);
    goblet(TALL, 0.7, base, dir, GOBLET_PAINT, "gobletTipped");
    const mouth = base.clone().addScaledVector(dir, 0.364 * 0.7);
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const out = V(dir.x, 0, dir.z).normalize();
      const p = mouth.clone().addScaledVector(out, 0.03 + t * 0.42);
      p.y = Math.max(H(p.x, p.z) + 0.01 + R() * 0.012, mouth.y - 0.01 - 0.85 * t * t * 0.5);
      p.x += (R() - 0.5) * 0.06;
      coin(pickKind(), p, jitter(V(0, 1, 0).addScaledVector(out, -0.4), 2.2), R() * 6.28, 0.044);
    }
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      const out = V(dir.x, 0, dir.z).normalize();
      const p = mouth.clone().addScaledVector(out, 0.04 + t * 0.3);
      p.x += (R() - 0.5) * 0.08;
      p.y = Math.max(H(p.x, p.z) + 0.02, mouth.y - 0.01 - 0.4 * t * t);
      gem(world, (i % 3) as 0 | 1 | 2, GEMS[(i + 1) % 6], p, jitter(UP, 1.4), 0.025, 0.4);
    }
    // gems around the foot
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const side = V(1, 0, 0).cross(dir).normalize();
      const up2 = side.clone().cross(dir).normalize();
      const pos = base.clone().addScaledVector(dir, 0.03).addScaledVector(side, Math.sin(a) * 0.065).addScaledVector(up2, Math.cos(a) * 0.065);
      world.add(GEMS[i % 6], brilliant, mat(pos, alignY(dir.clone().multiplyScalar(-1)), 0.012));
    }
  }

  // ---------------------------------------------------------------------------------------------- gold ingots
  {
    const ingot = new THREE.CylinderGeometry(0.62, 0.82, 1, 4).rotateY(Math.PI / 4);
    const stack: [number, number, number][] = [
      [0.84, 0, 0],
      [0.84, 0.1, 0],
      [0.84, 0.2, 0],
      [0.96, 0, 0.0],
      [0.96, 0.1, 0.0],
      [0.9, 0.2, 0.0],
    ];
    void stack;
    const rows: [number, number, number, number][] = [
      [0.88, -0.07, 0, 0],
      [0.88, 0.07, 0, 0],
      [0.88, -0.0, 1, 0],
      [0.88, 0.0, 2, 0],
    ];
    void rows;
    // pyramid: 3 + 2 + 1 along z, stacked on the dais
    const place = (x: number, y: number, z: number, yaw: number) => {
      world.add(GOLD_PAINT, ingot, mat(V(x, FLOOR + 0.0285 + y, z), eul(0, yaw, 0), V(0.15, 0.055, 0.15 * 0.5)), {});
      world.add(GOLD_HI, new THREE.BoxGeometry(0.095, 0.004, 0.02), mat(V(x, FLOOR + 0.0585 + y, z), eul(0, yaw, 0)));
    };
    for (const z of [-0.1, 0.0, 0.1]) place(0.92, 0, z, 0.1 * (z + 0.2));
    for (const z of [-0.05, 0.05]) place(0.92, 0.055, z, 1.3 * z);
    place(0.92, 0.11, 0.0, 0.1);
    place(0.78, 0.0, 0.2, -0.5);
    world.add(GOLD_PAINT, ingot, mat(V(1.0, FLOOR + 0.0285, 0.15), eul(0, 1.2, 0), V(0.15, 0.055, 0.075)));
  }

  // ---------------------------------------------------------------------------------------------- crystal clusters
  function cluster(cx: number, cz: number, pal: keyof typeof CRYSTALS, seedShift: number) {
    const [tex, tipTex] = CRYSTALS[pal];
    const items: [number, number, number, number, number, number][] = [
      // dx, dz, height, radius, tiltX(deg), tiltZ(deg)
      [0, 0, 0.58, 0.058, 3, -4],
      [0.1, 0.07, 0.36, 0.04, -14, -22],
      [-0.1, 0.08, 0.3, 0.038, -18, 20],
      [0.02, 0.14, 0.24, 0.034, -26, 4],
      [-0.12, -0.07, 0.34, 0.036, 16, 24],
      [0.12, -0.08, 0.26, 0.032, 20, -26],
    ];
    world.add(GOLD_DK, new THREE.CylinderGeometry(0.17, 0.2, 0.035, 6), mat(V(cx, FLOOR + 0.0175, cz), hexQ));
    world.add(GOLD_PAINT, new THREE.CylinderGeometry(0.15, 0.17, 0.02, 6), mat(V(cx, FLOOR + 0.045, cz), hexQ));
    items.forEach(([dx, dz, h, r, tx, tz], i) => {
      const q = eul((tx * Math.PI) / 180, i * 1.1 + seedShift, (tz * Math.PI) / 180);
      const base = V(cx + dx, FLOOR + 0.05, cz + dz);
      const up = UP.clone().applyQuaternion(q);
      const prism = new THREE.CylinderGeometry(r * 0.92, r, h, 6, 1, true);
      const m1 = mat(base.clone().addScaledVector(up, h / 2), q);
      world.add("#ffffff", prism, m1, { texture: tex, glow: 1 });
      const tipH = r * 2.6;
      const cone = new THREE.ConeGeometry(r * 0.92, tipH, 6, 1, true);
      world.add("#ffffff", cone, mat(base.clone().addScaledVector(up, h + tipH / 2), q), { texture: tipTex, glow: 1 });
    });
    // gold claws holding the cluster
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + 0.3;
      world.add(GOLD_PAINT, new THREE.ConeGeometry(0.018, 0.1, 4), mat(V(cx + Math.sin(a) * 0.15, FLOOR + 0.095, cz + Math.cos(a) * 0.15), eul(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35)));
    }
  }
  cluster(-0.8, -0.5, "cyan", 0.2);
  cluster(0.8, -0.5, "violet", 1.0);
  // two small rose crystals near the front corners
  {
    const [tex, tipTex] = CRYSTALS.rose;
    for (const [x, z, h, tilt] of [[-0.35, 0.82, 0.2, 0.3], [0.4, 0.84, 0.16, -0.35]] as const) {
      const q = eul(0.18, x * 3, tilt);
      const up = UP.clone().applyQuaternion(q);
      const base = V(x, H(x, z) + 0.0, z);
      world.add(GOLD_PAINT, new THREE.CylinderGeometry(0.06, 0.07, 0.03, 6), mat(V(x, base.y + 0.01, z), hexQ));
      world.add("#ffffff", new THREE.CylinderGeometry(0.03, 0.036, h, 6, 1, true), mat(base.clone().addScaledVector(up, h / 2 + 0.02), q), { texture: tex, glow: 1 });
      world.add("#ffffff", new THREE.ConeGeometry(0.03, 0.08, 6, 1, true), mat(base.clone().addScaledVector(up, h + 0.02 + 0.04), q), { texture: tipTex, glow: 1 });
    }
  }

  // ---------------------------------------------------------------------------------------------- necklace and rings
  {
    const pts: THREE.Vector3[] = [];
    const path: [number, number][] = [[-0.32, -0.02], [-0.22, 0.16], [-0.1, 0.34], [0.05, 0.46], [0.2, 0.5], [0.34, 0.5]];
    for (const [x, z] of path) pts.push(V(x, H(x, z) + 0.02, z));
    const curve = catmull(pts);
    b.sweep(curve, 0.005, { color: GOLD_PAINT, sides: 5, bone: root, name: "chain" });
    b.along(curve, 14, (at) => {
      world.add(PEARL, new THREE.SphereGeometry(0.014, 7, 5), mat(at.at.clone().add(V(0, 0.004, 0))), { smooth: true });
    });
    const end = pts[pts.length - 1];
    gem(world, 0, RUBY, end.clone().add(V(0, 0.03, 0)), V(0.2, 1, 0.5), 0.038, 0.7);
    world.add(GOLD_PAINT, new THREE.TorusGeometry(0.032, 0.006, 5, 8), mat(end.clone().add(V(0, 0.03, 0)), eul(Math.PI / 2 - 0.3, 0, 0)));
  }
  for (const [x, z, col, rot] of [[-0.12, 0.5, EMERALD, 0.4], [0.1, 0.52, SAPPH, -0.7]] as const) {
    const y = H(x, z);
    world.add(GOLD_PAINT, new THREE.TorusGeometry(0.03, 0.0075, 5, 10), mat(V(x, y + 0.02, z), eul(Math.PI / 2 + 0.25, rot, 0)));
    gem(world, 0, col, V(x, y + 0.04, z - 0.02 * Math.cos(rot)), V(0, 1, -0.3), 0.017, 0.4);
  }

  // ---------------------------------------------------------------------------------------------- flush parts, pose lid
  world.flush();
  lidS.flush();

  // magical glints floating over the hoard
  {
    const spots: [number, number, number, number][] = [
      [0.3, 0.62, 0.3, 0.14],
      [-0.18, 0.7, 0.5, 0.1],
      [0.05, 0.72, -0.1, 0.12],
      [-0.5, 0.55, 0.3, 0.09],
      [0.55, 0.5, 0.55, 0.1],
      [0.62, 0.35, 0.05, 0.08],
      [-0.78, 0.9, -0.5, 0.1],
      [0.8, 0.9, -0.5, 0.1],
      [-0.1, 1.05, -0.3, 0.12],
      [0.35, 0.4, 0.6, 0.07],
      [-0.4, 0.3, 0.75, 0.07],
      [0.05, 0.95, 0.15, 0.09],
    ];
    const meshes = spots.flatMap(([x, y, z, s]) => b.cards([frame([x, y - s / 2, z], [0, 1, 0])], T_STAR, { size: s, cross: true, flow: [0, 0, 1], bone: root }));
    glow(meshes, 1);
  }

  b.pose(lid, { axis: [1, 0, 0], deg: -108 });
  return b.root;
}
