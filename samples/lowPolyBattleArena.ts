import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG, rng } from "../src/math";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Sunforge Battle Arena",
  description:
    "A low-poly fortress battle arena for a top-down brawler: an octagonal stone floor around a glowing capture altar with a floating sun crystal, a lava moat and lava channels, four team spawn gates with portcullises, raised flanking platforms with ramps and stairs, jump pads, cover walls, broken columns, crates, braziers, banners and crenellated walls with eight towers.",
};

// ---------- palette (flat colours: shadow / base / highlight per family) ----------
const SAND_D = "#b47a4a";
const SAND = "#d29b62";
const SAND_L = "#e8bf84";
const GROUT = "#7d5236";
const WALL_D = "#5f6680";
const WALL = "#848ca6";
const WALL_L = "#aab1c6";
const MORTAR = "#4a4e62";
const BAS_D = "#2a2530";
const BAS = "#3f3946";
const BAS_L = "#5a5262";
const WOOD_D = "#6a3d22";
const WOOD = "#925630";
const WOOD_L = "#bb7a44";
const IRON_D = "#2a2d36";
const IRON = "#4a505e";
const IRON_L = "#727a8c";
const GOLD_D = "#b47c1c";
const GOLD = "#eeb12f";
const GOLD_L = "#ffd863";
const MARBLE_D = "#c9b08c";
const MARBLE = "#ead7b6";
const ROOF_D = "#2b3462";
const ROOF = "#3e4a8a";
const LAVA = "#e03a00";
const LAVA_L = "#ffa31a";
const LAVA_Y = "#ffd83a";
const FIRE = "#ff5200";
const FIRE_Y = "#ffc21a";
const TEAL = "#3ff0dc";
const TEAL_D = "#1a7c80";
const LEAF_D = "#386f33";
const LEAF = "#58a343";
const LEAF_L = "#8acb57";
const VOID = "#17131d";
const NAVY = "#232a55";

const TEAMS = [
  { name: "Red", th: 45, base: "#d8433a", dark: "#8e2629", light: "#ff8a6a", emblem: "flame" },
  { name: "Blue", th: 135, base: "#3a7de0", dark: "#22468f", light: "#86c6ff", emblem: "trident" },
  { name: "Green", th: 225, base: "#47b04a", dark: "#256b33", light: "#9cf07e", emblem: "tree" },
  { name: "Purple", th: 315, base: "#9555d4", dark: "#5a2e93", light: "#d7a2ff", emblem: "moon" },
];

// ---------- layout (meters) ----------
const FY = 0.6; // arena floor top
const SLAB = 0.5; // slab top under the floor stones
const WIN = 14.3; // wall inner face (apothem)
const WC = 15.0; // wall centre line
const WTOP = 3.8; // wall body top
const T8 = Math.tan(22.5 * DEG);
const C8 = Math.cos(22.5 * DEG);
const RV = WC / C8; // tower centres
const L = RV * Math.sin(22.5 * DEG); // half a wall between tower centres
const MOAT_IN = 5.2;
const MOAT_OUT = 6.4;
const CH = 0.55; // lava channel half width
const PT = FY + 1.8; // platform deck

type G = THREE.BufferGeometry;
type P2 = [number, number];
type V = readonly number[];

/** Side frame (x along the side, z out from the centre) of the side facing `th` degrees (0 = +Z, 90 = +X). */
function W(th: number, x: number, y: number, z: number): [number, number, number] {
  const c = Math.cos(th * DEG);
  const s = Math.sin(th * DEG);
  return [x * c + z * s, y, -x * s + z * c];
}
function W2(th: number, x: number, z: number): P2 {
  const p = W(th, x, 0, z);
  return [p[0], p[2]];
}
const out3 = (th: number, k = 1): [number, number, number] => [k * Math.sin(th * DEG), 0, k * Math.cos(th * DEG)];

function xf(g: G, at: V, ry = 0, rx = 0, rz = 0, sc: V = [1, 1, 1]): G {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG, "YXZ"));
  return g.applyMatrix4(
    new THREE.Matrix4().compose(new THREE.Vector3(at[0], at[1], at[2]), q, new THREE.Vector3(sc[0], sc[1], sc[2])),
  );
}

/** A square beam of width `w` from `a` to `b`. */
function beam(a: THREE.Vector3, b: THREE.Vector3, w: number): G {
  const d = b.clone().sub(a);
  const len = d.length();
  d.normalize();
  return xf(
    new THREE.BoxGeometry(w, len, w),
    [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2],
    Math.atan2(d.x, d.z) / DEG,
    Math.acos(d.y) / DEG,
  );
}

/** Convex solid through rings of points (same count each); faces turned outward from the centroid. */
function loft(rings: THREE.Vector3[][], capStart = false, capEnd = true): G {
  const c = new THREE.Vector3();
  let n = 0;
  for (const r of rings)
    for (const p of r) {
      c.add(p);
      n++;
    }
  c.divideScalar(n);
  const pos: number[] = [];
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const m = new THREE.Vector3();
  const tri = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) => {
    e1.subVectors(b, a);
    e2.subVectors(d, a);
    e1.cross(e2);
    if (e1.lengthSq() < 1e-14) return;
    m.copy(a).add(b).add(d).divideScalar(3).sub(c);
    const [p, q] = e1.dot(m) < 0 ? [d, b] : [b, d];
    pos.push(a.x, a.y, a.z, p.x, p.y, p.z, q.x, q.y, q.z);
  };
  for (let r = 0; r + 1 < rings.length; r++) {
    const A = rings[r];
    const B = rings[r + 1];
    for (let i = 0; i < A.length; i++) {
      const j = (i + 1) % A.length;
      tri(A[i], A[j], B[j]);
      tri(A[i], B[j], B[i]);
    }
  }
  const cap = (R: THREE.Vector3[]) => {
    for (let i = 1; i + 1 < R.length; i++) tri(R[0], R[i], R[i + 1]);
  };
  if (capStart) cap(rings[0]);
  if (capEnd) cap(rings[rings.length - 1]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

const ringY = (poly: P2[], y: number) => poly.map(([x, z]) => new THREE.Vector3(x, y, z));

/** A convex polygon moved inward by `c` along every edge. */
function inset(poly: P2[], c: number): P2[] {
  const n = poly.length;
  let cx = 0;
  let cz = 0;
  for (const [x, z] of poly) {
    cx += x / n;
    cz += z / n;
  }
  const normals = poly.map((p, i) => {
    const q = poly[(i + 1) % n];
    let nx = -(q[1] - p[1]);
    let nz = q[0] - p[0];
    const l = Math.hypot(nx, nz) || 1;
    nx /= l;
    nz /= l;
    if ((cx - (p[0] + q[0]) / 2) * nx + (cz - (p[1] + q[1]) / 2) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    return [nx, nz];
  });
  return poly.map((p, i) => {
    const a = normals[(i - 1 + n) % n];
    const b = normals[i];
    const d = 1 + a[0] * b[0] + a[1] * b[1];
    return [p[0] + (c * (a[0] + b[0])) / d, p[1] + (c * (a[1] + b[1])) / d];
  });
}

/** A prism on a floor polygon, with a chamfer `c` round its top edge (and `cb` round its bottom edge). */
function slab(poly: P2[], y0: number, h: number, c = 0, cb = 0): G {
  const rings: THREE.Vector3[][] = [];
  if (cb > 0) rings.push(ringY(inset(poly, cb), y0), ringY(poly, y0 + cb));
  else rings.push(ringY(poly, y0));
  if (c > 0) rings.push(ringY(poly, y0 + h - c), ringY(inset(poly, c), y0 + h));
  else rings.push(ringY(poly, y0 + h));
  return loft(rings, cb > 0, true);
}
const rectP = (w: number, d: number): P2[] => [
  [-w / 2, -d / 2],
  [w / 2, -d / 2],
  [w / 2, d / 2],
  [-w / 2, d / 2],
];
const ngonP = (r: number, n: number, rot = 0): P2[] =>
  Array.from({ length: n }, (_, k) => {
    const t = (rot + (360 * k) / n) * DEG;
    return [r * Math.sin(t), r * Math.cos(t)] as P2;
  });
/** Regular octagon with apothem `a`, flats facing 0°, 45°, ... (rotated by `rot`). */
const octP = (a: number, rot = 0): P2[] => ngonP(a / C8, 8, 22.5 + rot);
const blk = (w: number, h: number, d: number, c = 0, cb = 0) => slab(rectP(w, d), 0, h, c, cb);
const oct = (a: number, y0: number, h: number, c = 0) => slab(octP(a), y0, h, c);
const movePoly = (poly: P2[], dx: number, dz: number): P2[] => poly.map(([x, z]) => [x + dx, z + dz]);

/** A stone in a ring band between apothems a0 and a1 of side `th`, from tangent t0 to t1 (null: the mitred end). */
function seg(th: number, a0: number, a1: number, t0: number | null, t1: number | null): P2[] {
  const e0 = (a: number) => (t0 === null ? -a * T8 : t0);
  const e1 = (a: number) => (t1 === null ? a * T8 : t1);
  return [W2(th, e0(a0), a0), W2(th, e1(a0), a0), W2(th, e1(a1), a1), W2(th, e0(a1), a1)];
}

function hash(a: number, b: number, c: number) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Stone courses on vertical faces, laid along each face whatever way it turns; flat caps on top. */
function bricks(cols: [string, string, string], mortar: string, cap: string, bw: number, bh: number, seed: number) {
  return paint((p, n) => {
    if (n.y > 0.6) return cap;
    if (n.y < -0.6) return cols[0];
    const len = Math.hypot(n.x, n.z) || 1;
    const u = (-p.x * n.z + p.z * n.x) / len;
    const row = Math.floor(p.y / bh);
    const fv = p.y - row * bh;
    const uu = u / bw + (row & 1) * 0.5;
    const col = Math.floor(uu);
    const fu = (uu - col) * bw;
    if (fv < 0.065 || fu < 0.065) return mortar;
    const h = hash(row, col, seed + Math.round(n.x * 3) * 7 + Math.round(n.z * 3) * 13);
    return h < 0.2 ? cols[1] : h > 0.83 ? cols[2] : cols[0];
  });
}

// ---------- drawings ----------
const star = (cx: number, cy: number, R: number, r: number, n: number, rot = -90) =>
  Array.from({ length: 2 * n }, (_, i) => {
    const a = (rot + (i * 180) / n) * DEG;
    const rr = i % 2 ? r : R;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

function emblem(kind: string, c: string, c2: string, bg: string) {
  if (kind === "flame")
    return `<polygon points="32,3 43,17 51,30 51,43 44,55 32,61 20,55 13,43 15,29 22,36 24,22 30,28" fill="${c}"/><polygon points="32,27 40,38 41,48 32,56 23,48 26,39 30,43" fill="${c2}"/>`;
  if (kind === "trident")
    return `<polygon points="29,62 35,62 35,31 47,31 47,7 41,14 41,24 36,24 36,6 32,0 28,6 28,24 23,24 23,14 17,7 17,31 29,31" fill="${c}"/><rect x="24" y="42" width="16" height="5" fill="${c2}"/>`;
  if (kind === "tree")
    return `<polygon points="32,3 46,21 39,21 52,37 42,37 56,53 36,53 36,62 28,62 28,53 8,53 22,37 12,37 25,21 18,21" fill="${c}"/><polygon points="32,11 38,19 26,19" fill="${c2}"/>`;
  return `<circle cx="27" cy="32" r="25" fill="${c}"/><circle cx="38" cy="26" r="21" fill="${bg}"/><polygon points="${star(47, 40, 10, 4, 5)}" fill="${c2}"/>`;
}
const SVG = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const sunMark = (c: string, c2: string, c3: string) =>
  `<polygon points="${star(32, 32, 30, 17, 12)}" fill="${c}"/><circle cx="32" cy="32" r="13" fill="${c2}"/><circle cx="32" cy="32" r="6" fill="${c3}"/>`;

function bannerArt(base: string, dark: string, inner: string) {
  return svg(
    SVG(
      64,
      160,
      `<polygon points="0,0 64,0 64,158 32,136 0,158" fill="${dark}"/>
<polygon points="5,10 59,10 59,148 32,128 5,148" fill="${base}"/>
<rect x="0" y="0" width="64" height="9" fill="${GOLD_D}"/>
<rect x="5" y="17" width="54" height="4" fill="${GOLD}"/>
<rect x="5" y="102" width="54" height="4" fill="${GOLD}"/>
<g transform="translate(10 36) scale(0.69)">${inner}</g>
<polygon points="14,114 32,124 50,114 50,121 32,131 14,121" fill="${GOLD}"/>`,
    ),
    { size: 256 },
  );
}

export default function build() {
  const b = createBuilder({ name: "lowPolyBattleArena", paintSize: 2048 });
  const root = b.joint("arena", { at: [0, 0, 0] });
  type J = typeof root;
  const R = rng(41);
  const rr = (a: number, z: number) => a + (z - a) * R();

  // ---------- merged parts: one per name (colour, bone) ----------
  type Bin = { fill: string | Paint; geos: G[]; bone: J; glow: number; group: string };
  const bins = new Map<string, Bin>();
  let group = "floor";
  function put(name: string, fill: string | Paint, g: G, opts: { bone?: J; glow?: number } = {}) {
    let bin = bins.get(name);
    if (!bin) bins.set(name, (bin = { fill, geos: [], bone: opts.bone ?? root, glow: opts.glow ?? 0, group }));
    const src = g.index ? g.toNonIndexed() : g;
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", src.getAttribute("position"));
    bin.geos.push(out);
  }
  function decal(
    name: string,
    tex: THREE.Texture,
    w: number,
    h: number,
    at: V,
    dir: V,
    up: V,
    glowS = 0,
    bone: J = root,
  ) {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir,
      axis: "z",
      up,
      texture: tex,
      bone,
      name,
      group,
    });
    if (glowS) glow(p, glowS);
    return p;
  }

  // ---------- drawings ----------
  const SIGIL = svg(
    SVG(
      128,
      128,
      `<circle cx="64" cy="64" r="63" fill="#3a1c0c"/><circle cx="64" cy="64" r="57" fill="none" stroke="${GOLD}" stroke-width="5"/>
${Array.from({ length: 16 }, (_, i) => `<rect x="${i % 2 ? 61 : 62}" y="11" width="${i % 2 ? 6 : 4}" height="${i % 2 ? 6 : 10}" fill="${GOLD_L}" transform="rotate(${i * 22.5} 64 64)"/>`).join("")}
<circle cx="64" cy="64" r="44" fill="#5a2a10"/><polygon points="${star(64, 64, 43, 18, 8)}" fill="${LAVA_L}"/>
<polygon points="${star(64, 64, 37, 15, 8, -90 + 22.5)}" fill="${GOLD_L}"/><circle cx="64" cy="64" r="16" fill="${FIRE_Y}"/>
<circle cx="64" cy="64" r="10" fill="#5a2a10"/><circle cx="64" cy="64" r="6" fill="${GOLD_L}"/>`,
    ),
    { size: 256 },
  );
  const PAD = svg(
    SVG(
      64,
      64,
      `<rect width="64" height="64" fill="#0d3a42"/><circle cx="32" cy="32" r="28" fill="none" stroke="${TEAL}" stroke-width="3"/>
<polygon points="32,10 47,23 47,30 32,18 17,30 17,23" fill="#d4fff8"/><polygon points="32,24 47,37 47,44 32,32 17,44 17,37" fill="${TEAL}"/>
<polygon points="32,38 44,49 44,55 32,45 20,55 20,49" fill="#2bb3a8"/>`,
    ),
    { size: 128 },
  );
  const RUNES = [
    "M16 5 V27 M16 10 L24 16 M16 18 L8 24",
    "M9 5 V27 M23 5 V27 M9 17 L23 9",
    "M8 27 L16 5 L24 27 M11 19 H21",
    "M16 5 L25 16 L16 27 L7 16 Z",
  ].map((d) =>
    svg(
      SVG(
        32,
        32,
        `<rect width="32" height="32" fill="#2a170c"/><path d="${d}" fill="none" stroke="${GOLD_L}" stroke-width="3" stroke-linecap="square"/>`,
      ),
      { size: 64 },
    ),
  );
  const ARENA_BANNER = bannerArt(NAVY, "#141838", `<g>${sunMark(GOLD, GOLD_L, LAVA_L)}</g>`);
  const art = TEAMS.map((t) => ({
    banner: bannerArt(t.base, t.dark, emblem(t.emblem, GOLD_L, t.dark, t.base)),
    flag: svg(
      SVG(
        96,
        64,
        `<polygon points="0,0 96,0 82,32 96,64 0,64" fill="${t.base}"/><rect x="0" y="0" width="96" height="7" fill="${t.dark}"/>
<rect x="0" y="57" width="96" height="7" fill="${t.dark}"/><g transform="translate(22 12) scale(0.62)">${emblem(t.emblem, "#fff3d6", t.dark, t.base)}</g>`,
      ),
      { size: 192 },
    ),
    shield: svg(
      SVG(
        64,
        72,
        `<polygon points="3,3 61,3 61,36 32,69 3,36" fill="${GOLD}"/><polygon points="9,9 55,9 55,34 32,61 9,34" fill="${t.base}"/>
<g transform="translate(17 13) scale(0.47)">${emblem(t.emblem, GOLD_L, t.dark, t.base)}</g>`,
      ),
      { size: 128 },
    ),
    spawn: svg(
      SVG(
        64,
        64,
        `<circle cx="32" cy="32" r="31" fill="${t.dark}"/><circle cx="32" cy="32" r="27" fill="none" stroke="${t.light}" stroke-width="3"/>
<g transform="translate(13 13) scale(0.6)">${emblem(t.emblem, t.light, t.base, t.dark)}</g>`,
      ),
      { size: 128 },
    ),
  }));

  // ---------- foundation and floor slabs ----------
  group = "floor";
  const BRICK = bricks([WALL, WALL_D, WALL_L], MORTAR, WALL_L, 1.0, 0.5, 3);
  for (let k = 0; k < 8; k++) {
    const th = k * 45;
    for (let course = 0; course < 2; course++) {
      const n = 5;
      const half = 16 * T8;
      const cuts: (number | null)[] = [null];
      for (let i = 1; i < n; i++) cuts.push(-half + ((i - (course ? 0.5 : 0)) * 2 * half) / n);
      cuts.push(null);
      for (let j = 0; j + 1 < cuts.length; j++) {
        const poly = seg(th, 15.6, 16.35 - course * 0.12, cuts[j], cuts[j + 1]);
        const col = hash(k, j, course) > 0.6 ? BAS_L : BAS;
        put(`foundation${col === BAS ? "" : "Light"}`, col, slab(inset(poly, 0.03), course * 0.36, 0.38, 0.06));
      }
    }
  }
  // the slab: an octagon with the moat and the two lava channels cut out of it
  const holePts: P2[] = [];
  const moatVerts = ngonP(MOAT_OUT / C8, 8, 22.5);
  for (let k = 0; k < 8; k++) {
    holePts.push(moatVerts[k]);
    if (k === 3) holePts.push([CH, -MOAT_OUT], [CH, -14.35], [-CH, -14.35], [-CH, -MOAT_OUT]);
    if (k === 7) holePts.push([-CH, MOAT_OUT], [-CH, 14.35], [CH, 14.35], [CH, MOAT_OUT]);
  }
  const shapeOf = (pts: P2[]) => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const pathOf = (pts: P2[]) => new THREE.Path(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const outer = shapeOf(octP(14.6));
  outer.holes.push(pathOf(holePts));
  put("slab", GROUT, xf(new THREE.ExtrudeGeometry(outer, { depth: SLAB, bevelEnabled: false }), [0, 0, 0], 0, -90));
  put("slab", GROUT, oct(MOAT_IN, 0, SLAB));
  // lava
  const lavaShape = shapeOf(holePts.map(([x, z]) => [x * 1.0, z * 1.0] as P2));
  lavaShape.holes.push(pathOf(octP(MOAT_IN - 0.3)));
  put("lava", LAVA, xf(new THREE.ShapeGeometry(lavaShape), [0, 0.32, 0], 0, -90), { glow: 0.3 });

  // ---------- floor stones in octagonal rings ----------
  const inPlatform = (x: number, z: number) => Math.abs(x) > 11.3 && Math.abs(z) < 5.1;
  const laneDist = (x: number, z: number) => Math.min(Math.abs(x - z), Math.abs(x + z)) / Math.SQRT2;
  type RingOpts = {
    seg: number;
    y0?: number;
    h?: number;
    c?: number;
    cut?: number;
    parity?: number;
    gap?: number;
    jitter?: number;
    crack?: number;
    tufts?: number;
    colour: (cx: number, cz: number, k: number, j: number) => [string, string];
  };
  function stoneRing(a0: number, a1: number, o: RingOpts) {
    const amid = (a0 + a1) / 2;
    for (let k = 0; k < 8; k++) {
      const th = k * 45;
      const half = amid * T8;
      const n = Math.max(1, Math.round((2 * half) / o.seg));
      const step = (2 * half) / n;
      const off = (o.parity ?? 0) % 2 ? 0.5 : 0;
      let cuts: number[] = [];
      for (let i = 1; i <= n; i++) {
        const t = -half + (i - off) * step;
        if (t > -half + 0.25 * step && t < half - 0.25 * step) cuts.push(t);
      }
      const channel = o.cut !== undefined && (k === 0 || k === 4);
      if (channel) {
        const cw = o.cut!;
        cuts = cuts.filter((t) => Math.abs(t) > cw + 0.3);
        cuts.push(-cw, cw);
        cuts.sort((p, q) => p - q);
      }
      const edges: (number | null)[] = [null, ...cuts, null];
      for (let j = 0; j + 1 < edges.length; j++) {
        if (channel && edges[j] === -o.cut! && edges[j + 1] === o.cut!) continue;
        const poly = seg(th, a0, a1, edges[j], edges[j + 1]);
        const cx = poly.reduce((s, p) => s + p[0], 0) / 4;
        const cz = poly.reduce((s, p) => s + p[1], 0) / 4;
        if (inPlatform(cx, cz)) continue;
        const [col, name] = o.colour(cx, cz, k, j);
        const h = (o.h ?? 0.1) + (o.jitter ?? 0.02) * R();
        const y0 = o.y0 ?? SLAB;
        if (R() < (o.crack ?? 0)) {
          // a cracked flagstone: two pieces, one settled a little lower
          const u = rr(0.3, 0.7);
          const v = rr(0.3, 0.7);
          const A: P2 = [poly[0][0] + (poly[1][0] - poly[0][0]) * u, poly[0][1] + (poly[1][1] - poly[0][1]) * u];
          const B: P2 = [poly[3][0] + (poly[2][0] - poly[3][0]) * v, poly[3][1] + (poly[2][1] - poly[3][1]) * v];
          put(name, col, slab(inset([poly[0], A, B, poly[3]], o.gap ?? 0.04), y0, h, o.c ?? 0.04));
          put(name, col, slab(inset([A, poly[1], poly[2], B], o.gap ?? 0.04), y0, h - 0.025, o.c ?? 0.04));
        } else put(name, col, slab(inset(poly, o.gap ?? 0.04), y0, h, o.c ?? 0.04));
        if (R() < (o.tufts ?? 0)) {
          const [tx, tz] = poly[Math.floor(R() * 4)];
          for (let i = 0; i < 4; i++) {
            const a = i * 90 + rr(0, 60);
            const lean = rr(10, 28);
            const hh = rr(0.26, 0.42);
            put(
              i % 2 ? "tufts" : "tuftsLight",
              i % 2 ? LEAF : LEAF_L,
              xf(
                new THREE.ConeGeometry(0.045, hh, 3),
                [tx + 0.05 * Math.sin(a * DEG), y0 + hh / 2, tz + 0.05 * Math.cos(a * DEG)],
                a,
                lean,
              ),
            );
          }
        }
      }
    }
  }
  const field = (cx: number, cz: number, k: number, j: number): [string, string] => {
    if (laneDist(cx, cz) < 1.25) return [SAND_L, "stonesLight"];
    const h = hash(Math.round(cx * 10), Math.round(cz * 10), k + j);
    return h < 0.22 ? [SAND_D, "stonesDark"] : h > 0.86 ? [SAND_L, "stonesLight"] : [SAND, "stones"];
  };
  const bands = [7.0, 8.6, 10.2, 11.8, 13.4];
  for (let i = 0; i + 1 < bands.length; i++)
    stoneRing(bands[i], bands[i + 1], {
      seg: 1.7,
      parity: i,
      cut: 1.0,
      crack: 0.14,
      tufts: 0.05 + i * 0.03,
      colour: field,
    });
  stoneRing(13.4, 14.35, {
    seg: 2.3,
    parity: 1,
    cut: 1.0,
    crack: 0.2,
    tufts: 0.25,
    colour: () => [SAND_D, "stonesDark"],
  });
  // moat curbs
  const curb = (_x: number, _z: number, k: number, j: number): [string, string] =>
    (k + j) % 2 ? [BAS, "curbs"] : [BAS_L, "curbsLight"];
  stoneRing(MOAT_OUT, 7.0, { seg: 1.3, cut: CH, h: 0.2, c: 0.06, colour: curb });
  stoneRing(4.7, MOAT_IN, { seg: 1.1, parity: 1, h: 0.2, c: 0.06, colour: curb });
  for (const th of [0, 180])
    for (const s of [1, -1])
      for (let z = 7.0, i = 0; z < 14.3; i++) {
        const z1 = Math.min(14.35, z + 1.2);
        const poly = movePoly(rectP(0.42, z1 - z - 0.05), 0, 0).map(([x, zz]) =>
          W2(th, s * 0.775 + x, (z + z1) / 2 + zz),
        );
        const col = (i + (s > 0 ? 1 : 0)) % 2 ? BAS : BAS_L;
        put(col === BAS ? "curbs" : "curbsLight", col, slab(poly, SLAB, 0.2, 0.06));
        z = z1;
      }
  // plaza: a checker of light and dark stones round the altar, and the glowing capture line
  stoneRing(2.9, 3.8, {
    seg: 1.1,
    colour: (_x, _z, k, j) => ((k + j) % 2 ? [SAND_L, "stonesLight"] : [SAND_D, "stonesDark"]),
  });
  stoneRing(3.8, 4.55, {
    seg: 1.1,
    parity: 1,
    colour: (_x, _z, k, j) => ((k + j) % 2 ? [SAND, "stones"] : [SAND_L, "stonesLight"]),
  });
  for (let k = 0; k < 8; k++)
    put("captureLine", GOLD_L, slab(seg(k * 45, 4.55, 4.7, null, null), SLAB, 0.1), { glow: 0.8 });
  for (let k = 0; k < 8; k++) {
    const th = k * 45 + 22.5;
    const p = W(th, 0, FY + 0.032, (4.17 / Math.cos(22.5 * DEG)) * 0.93);
    decal(`plazaRune${k}`, RUNES[k % 4], 0.42, 0.42, p, [0, 1, 0], out3(th), 0.7);
  }

  // ---------- central altar ----------
  group = "altar";
  put("altarBody", SAND_D, oct(3.0, SLAB, 0.4));
  put("altarCaps", SAND_L, oct(3.08, 0.84, 0.12, 0.04));
  put("altarBodyMid", SAND, oct(2.3, 0.9, 0.4));
  put("altarCaps", SAND_L, oct(2.38, 1.24, 0.12, 0.04));
  put("altarGold", GOLD, oct(2.34, 1.0, 0.08));
  put("altarBody", SAND_D, oct(1.6, 1.3, 0.4));
  put("altarGold", GOLD, oct(1.66, 1.64, 0.12, 0.04));
  const sig = b.part(new THREE.CircleGeometry(1.5, 8), "#ffffff", {
    at: [0, 1.775, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: SIGIL,
    bone: root,
    name: "altarSigil",
    group,
  });
  glow(sig, 1.1);
  for (let k = 0; k < 8; k++) {
    const th = k * 45;
    decal(`altarRune${k}`, RUNES[(k + 1) % 4], 0.3, 0.3, W(th, 0, 0.7, 3.012), out3(th), [0, 1, 0], 0.7);
  }
  // four sun pylons and gold prongs reaching up to the crystal
  for (let i = 0; i < 4; i++) {
    const th = 45 + i * 90;
    const at = W(th, 0, 0.96, 2.6);
    put("altarBody", SAND_D, xf(blk(0.62, 0.22, 0.62, 0.05), at, th));
    const shaft = loft([ringY(rectP(0.44, 0.44), 0), ringY(rectP(0.32, 0.32), 1.4)]);
    put("pylons", SAND_L, xf(shaft, [at[0], at[1] + 0.22, at[2]], th));
    put("altarGold", GOLD, xf(blk(0.48, 0.1, 0.48, 0.03), [at[0], at[1] + 0.5, at[2]], th));
    const tip = loft([ringY(rectP(0.36, 0.36), 0), ringY(rectP(0.01, 0.01), 0.34)]);
    put("altarGold", GOLD, xf(tip, [at[0], at[1] + 1.62, at[2]], th));
    put(
      "pylonGems",
      LAVA_Y,
      xf(new THREE.OctahedronGeometry(0.13, 0), [at[0], at[1] + 2.25, at[2]], th, 0, 0, [1, 1.5, 1]),
      {
        glow: 1.0,
      },
    );
    const pr = W(th, 0, 1.76, 1.25);
    const cone = new THREE.ConeGeometry(0.1, 1.0, 4);
    put("altarGold", GOLD, xf(cone, [pr[0] * 0.85, 2.18, pr[2] * 0.85], th, -28));
  }
  // the floating sun crystal on its own joint
  const cryJ = b.joint("altarCrystal", { parent: root, at: [0, 3.45, 0], dir: [0, 1, 0] });
  {
    const rings = [
      { r: 0.0, y: -0.85 },
      { r: 0.4, y: -0.2 },
      { r: 0.48, y: 0.25 },
      { r: 0.0, y: 1.2 },
    ];
    for (let i = 0; i < 6; i++) {
      const a0 = i * 60 * DEG;
      const a1 = (i + 1) * 60 * DEG;
      const pts: number[] = [];
      for (let r = 0; r + 1 < rings.length; r++) {
        const A0 = [rings[r].r * Math.sin(a0), 3.45 + rings[r].y, rings[r].r * Math.cos(a0)];
        const A1 = [rings[r].r * Math.sin(a1), 3.45 + rings[r].y, rings[r].r * Math.cos(a1)];
        const B0 = [rings[r + 1].r * Math.sin(a0), 3.45 + rings[r + 1].y, rings[r + 1].r * Math.cos(a0)];
        const B1 = [rings[r + 1].r * Math.sin(a1), 3.45 + rings[r + 1].y, rings[r + 1].r * Math.cos(a1)];
        if (rings[r].r > 0) pts.push(...A0, ...A1, ...B1);
        if (rings[r + 1].r > 0) pts.push(...A0, ...B1, ...B0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      put(i % 2 ? "crystalA" : "crystalB", i % 2 ? "#ffc41f" : "#ff8a12", g, { bone: cryJ, glow: 0.55 });
    }
    for (const [ry, rx] of [
      [0, 62],
      [90, 118],
    ])
      put("crystalHalo", GOLD, xf(new THREE.TorusGeometry(1.0, 0.055, 4, 16), [0, 3.5, 0], ry, rx), { bone: cryJ });
    for (let i = 0; i < 6; i++) {
      const a = i * 60 + 30;
      const p = [1.0 * Math.sin(a * DEG), 3.5 + (i % 2 ? 0.25 : -0.25), 1.0 * Math.cos(a * DEG)];
      put("crystalShards", LAVA_Y, xf(new THREE.OctahedronGeometry(0.11, 0), p, a, 0, 0, [0.8, 1.6, 0.8]), {
        bone: cryJ,
        glow: 0.9,
      });
    }
  }

  // ---------- lava details ----------
  group = "lava";
  const lavaSpot = (): P2 => {
    if (R() < 0.3) {
      const th = R() < 0.5 ? 0 : 180;
      return W2(th, rr(-0.4, 0.4), rr(6.7, 14.0));
    }
    const k = Math.floor(R() * 8);
    const a = rr(MOAT_IN + 0.15, MOAT_OUT - 0.15);
    return W2(k * 45, rr(-a * T8 * 0.92, a * T8 * 0.92), a);
  };
  for (let i = 0; i < 46; i++) {
    const [x, z] = lavaSpot();
    const r = rr(0.12, 0.3);
    put("lavaCrust", BAS_D, slab(movePoly(ngonP(r, 5, rr(0, 72)), x, z), 0.29, 0.07, 0.03));
  }
  for (let i = 0; i < 40; i++) {
    const [x, z] = lavaSpot();
    put("lavaHot", LAVA_Y, slab(movePoly(ngonP(rr(0.08, 0.18), 6, rr(0, 60)), x, z), 0.31, 0.025), { glow: 1 });
  }
  for (let i = 0; i < 18; i++) {
    const [x, z] = lavaSpot();
    put("lavaBubbles", LAVA_L, xf(new THREE.IcosahedronGeometry(rr(0.07, 0.13), 0), [x, 0.33, z]), { glow: 1 });
  }
  // bright flow streaks running along the moat and the channels
  for (let i = 0; i < 60; i++) {
    const chan = i < 18;
    const th = chan ? (i % 2 ? 0 : 180) : Math.floor(R() * 8) * 45;
    const len = rr(0.5, 1.3);
    const wid = rr(0.04, 0.08);
    const [x0, z0] = chan ? [rr(-0.35, 0.35), rr(7.0, 13.6)] : [0, rr(MOAT_IN + 0.15, MOAT_OUT - 0.15)];
    const t0 = chan ? x0 : rr(-z0 * T8 * 0.8, z0 * T8 * 0.8);
    const poly: P2[] = chan
      ? [
          W2(th, t0 - wid, z0 - len / 2),
          W2(th, t0 + wid, z0 - len / 2),
          W2(th, t0 + wid, z0 + len / 2),
          W2(th, t0 - wid, z0 + len / 2),
        ]
      : [
          W2(th, t0 - len / 2, z0 - wid),
          W2(th, t0 + len / 2, z0 - wid),
          W2(th, t0 + len / 2, z0 + wid),
          W2(th, t0 - len / 2, z0 + wid),
        ];
    put(i % 3 ? "lavaStreaks" : "lavaHot", i % 3 ? LAVA_L : LAVA_Y, slab(poly, 0.31, 0.02), { glow: 1 });
  }
  // gold chevrons inlaid along the four spawn lanes, pointing at the altar
  group = "floor";
  for (const t of TEAMS)
    for (const z of [7.15, 7.95]) {
      for (const s of [-1, 1]) {
        const arm: P2[] = [
          [0, 0],
          [s * 0.62, 0.5],
          [s * 0.62, 0.78],
          [0, 0.28],
        ];
        put(
          "laneChevrons",
          GOLD,
          slab(
            arm.map(([x, dz]) => W2(t.th, x, z + dz)),
            0.6,
            0.045,
            0.015,
          ),
        );
      }
    }

  // ---------- small builders ----------
  function torch(th: number, x: number, y: number, face: number) {
    const at = (d: number, dy = 0) => W(th, x, y + dy, face - d);
    put("torchIron", IRON, xf(blk(0.2, 0.42, 0.06, 0.02), at(0.03, -0.2), th));
    put("torchIron", IRON, xf(blk(0.07, 0.07, 0.3, 0), at(0.17, -0.12), th));
    put("torchIron", IRON_D, xf(new THREE.CylinderGeometry(0.12, 0.06, 0.18, 6), at(0.3, 0.0), th));
    put("torchFlame", FIRE, xf(new THREE.ConeGeometry(0.12, 0.42, 5), at(0.3, 0.29), th + 20), { glow: 0.6 });
    put("torchFlameCore", FIRE_Y, xf(new THREE.ConeGeometry(0.07, 0.26, 5), at(0.33, 0.22), th - 15), { glow: 0.8 });
  }
  function brazier(x: number, z: number, s = 1, yb = FY) {
    put("brazierBase", WALL_D, xf(oct(0.3 * s, 0, 0.16 * s, 0.04), [x, yb, z]));
    put("brazierIron", IRON, xf(new THREE.CylinderGeometry(0.07 * s, 0.11 * s, 0.7 * s, 6), [x, yb + 0.5 * s, z]));
    put(
      "brazierIron",
      IRON_D,
      xf(new THREE.CylinderGeometry(0.42 * s, 0.22 * s, 0.3 * s, 8), [x, yb + 0.98 * s, z], 22.5),
    );
    put(
      "brazierGold",
      GOLD,
      xf(new THREE.CylinderGeometry(0.46 * s, 0.46 * s, 0.06 * s, 8), [x, yb + 1.14 * s, z], 22.5),
    );
    for (let i = 0; i < 4; i++) {
      const a = i * 90 + 45;
      const p = [x + 0.38 * s * Math.sin(a * DEG), yb + 0.55 * s, z + 0.38 * s * Math.cos(a * DEG)];
      put("brazierIron", IRON, xf(blk(0.06 * s, 0.75 * s, 0.06 * s), [p[0], yb, p[2]], a, 0, 0));
      put("brazierGold", GOLD, xf(new THREE.OctahedronGeometry(0.06 * s, 0), [p[0], yb + 0.8 * s, p[2]]));
    }
    for (let i = 0; i < 5; i++)
      put(
        "coals",
        BAS_D,
        xf(
          new THREE.OctahedronGeometry(0.13 * s, 0),
          [x + rr(-0.2, 0.2) * s, yb + 1.15 * s, z + rr(-0.2, 0.2) * s],
          rr(0, 90),
        ),
      );
    const flames: [number, number, number, number][] = [
      [0, 0, 0.26, 0.95],
      [0.14, 0.08, 0.17, 0.62],
      [-0.12, 0.1, 0.16, 0.55],
      [0.02, -0.15, 0.17, 0.6],
    ];
    for (const [dx, dz, r, h] of flames)
      put(
        "brazierFlame",
        FIRE,
        xf(new THREE.ConeGeometry(r * s, h * s, 5), [x + dx * s, yb + (1.17 + h / 2) * s, z + dz * s], rr(0, 72)),
        {
          glow: 0.6,
        },
      );
    put(
      "brazierFlameCore",
      FIRE_Y,
      xf(new THREE.ConeGeometry(0.15 * s, 0.55 * s, 5), [x, yb + 1.45 * s, z + 0.04 * s], 30),
      {
        glow: 0.8,
      },
    );
    for (let i = 0; i < 3; i++)
      put(
        "embers",
        FIRE_Y,
        xf(new THREE.TetrahedronGeometry(0.04 * s, 0), [
          x + rr(-0.3, 0.3) * s,
          yb + rr(1.9, 2.4) * s,
          z + rr(-0.3, 0.3) * s,
        ]),
        {
          glow: 0.8,
        },
      );
  }
  function crate(x: number, y: number, z: number, s: number, ry: number) {
    const at = (dx: number, dy: number, dz: number) => {
      const c = Math.cos(ry * DEG);
      const sn = Math.sin(ry * DEG);
      return [x + dx * c + dz * sn, y + dy, z - dx * sn + dz * c];
    };
    const e = 0.09 * s;
    put("crateCore", WOOD, xf(blk(s * 0.94, s * 0.94, s * 0.94), at(0, 0.03 * s, 0), ry));
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        put("crateFrame", WOOD_L, xf(blk(e, s, e), at((sx * (s - e)) / 2, 0, (sz * (s - e)) / 2), ry));
    for (const yy of [0, s - e])
      for (const sx of [-1, 1]) {
        put("crateFrame", WOOD_L, xf(blk(e, e, s - 2 * e), at((sx * (s - e)) / 2, yy, 0), ry));
        put("crateFrame", WOOD_L, xf(blk(s - 2 * e, e, e), at(0, yy, (sx * (s - e)) / 2), ry));
      }
    for (const sz of [-1, 1]) {
      const diag = Math.hypot(s - 2 * e, s - 2 * e);
      put(
        "crateFrame",
        WOOD_D,
        xf(blk(e * 0.9, diag, e * 0.7), at(0, (s - diag) / 2, (sz * (s - e * 0.4)) / 2), ry, 0, 45 * sz),
      );
    }
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        put(
          "crateIron",
          IRON,
          xf(blk(e * 1.3, e * 1.3, e * 1.3), at((sx * (s - e)) / 2, s - e * 1.15, (sz * (s - e)) / 2), ry),
        );
  }
  function barrel(x: number, z: number, y = FY) {
    put("barrels", WOOD, xf(new THREE.CylinderGeometry(0.36, 0.3, 0.42, 8, 1, true), [x, y + 0.21, z], 22.5));
    put("barrels", WOOD, xf(new THREE.CylinderGeometry(0.3, 0.36, 0.42, 8, 1, true), [x, y + 0.63, z], 22.5));
    put("barrelTops", WOOD_D, xf(new THREE.CylinderGeometry(0.29, 0.29, 0.04, 8), [x, y + 0.85, z], 22.5));
    for (const hy of [0.12, 0.42, 0.72])
      put(
        "barrelHoops",
        IRON,
        xf(
          new THREE.CylinderGeometry(
            0.355 - (hy === 0.42 ? -0.015 : 0.03),
            0.355 - (hy === 0.42 ? -0.015 : 0.03),
            0.06,
            8,
            1,
            true,
          ),
          [x, y + hy, z],
          22.5,
        ),
      );
  }
  function rocks(x: number, z: number, n: number, sMax = 0.25) {
    for (let i = 0; i < n; i++) {
      const s = rr(0.08, sMax);
      const col = R() < 0.5 ? SAND_D : SAND;
      put(
        col === SAND ? "rubble" : "rubbleDark",
        col,
        xf(
          new THREE.IcosahedronGeometry(s, 0),
          [x + rr(-0.7, 0.7), FY + s * 0.4, z + rr(-0.7, 0.7)],
          rr(0, 360),
          rr(0, 40),
          0,
          [1, rr(0.55, 0.9), 1],
        ),
      );
    }
  }
  function bush(x: number, z: number, s = 1) {
    const cols = [LEAF_D, LEAF, LEAF_L];
    const names = ["bushDark", "bush", "bushLight"];
    const blobs: [number, number, number, number][] = [
      [0, 0.3, 0, 0.5],
      [0.35, 0.22, 0.15, 0.36],
      [-0.3, 0.2, 0.2, 0.34],
      [0.05, 0.55, -0.05, 0.32],
    ];
    blobs.forEach(([dx, dy, dz, r], i) => {
      const c = i === 3 ? 2 : i === 0 ? 1 : Math.floor(R() * 2);
      put(
        names[c],
        cols[c],
        xf(new THREE.IcosahedronGeometry(r * s, 0), [x + dx * s, FY + dy * s, z + dz * s], rr(0, 360)),
      );
    });
  }
  function column(x: number, z: number, h: number, broken: boolean, ry: number) {
    put("columnBase", MARBLE_D, xf(blk(0.95, 0.28, 0.95, 0.05), [x, FY, z], ry));
    put("columnBase", MARBLE_D, xf(oct(0.42, 0, 0.16, 0.04), [x, FY + 0.28, z], ry));
    const shaft = new THREE.CylinderGeometry(0.34, 0.37, h, 8, 1, true);
    const pos = shaft.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0 && broken) pos.setY(i, y - 0.35 * (pos.getX(i) + 0.4) - 0.2 * hash(i, Math.round(x * 10), 3));
    }
    put("columns", MARBLE, xf(shaft, [x, FY + 0.44 + h / 2, z], ry + 22.5));
    if (broken) {
      // a jagged top, then the fallen drum beside it
      put(
        "columns",
        MARBLE,
        xf(new THREE.ConeGeometry(0.33, 0.25, 8), [x + 0.05, FY + 0.44 + h - 0.2, z], ry + 22.5, 0, 12),
      );
      const a = ry + 70;
      const dx = Math.sin(a * DEG) * 1.1;
      const dz = Math.cos(a * DEG) * 1.1;
      put("columns", MARBLE, xf(new THREE.CylinderGeometry(0.34, 0.34, 0.75, 8), [x + dx, FY + 0.3, z + dz], a, 0, 90));
      rocks(x + dx * 0.4, z + dz * 0.4, 5, 0.18);
    } else {
      put("columnBase", MARBLE_D, xf(blk(0.9, 0.24, 0.9, 0.05), [x, FY + 0.44 + h, z], ry));
      put("altarGold", GOLD, xf(oct(0.38, 0, 0.08), [x, FY + 0.36 + h, z], ry));
      put("columnBase", MARBLE_D, xf(blk(0.6, 0.18, 0.6, 0.05), [x, FY + 0.68 + h, z], ry));
    }
  }
  function coverWall(th: number, cx: number, cz: number, len: number, broken: number) {
    // two courses of chamfered blocks, a light coping, rubble where it broke
    const n = Math.max(2, Math.round(len / 0.75));
    const bl = len / n;
    for (let course = 0; course < 2; course++) {
      const off = course ? bl / 2 : 0;
      for (let i = 0; i <= n; i++) {
        let x0 = -len / 2 + i * bl - off;
        let x1 = x0 + bl;
        x0 = Math.max(x0, -len / 2);
        x1 = Math.min(x1, len / 2);
        if (x1 - x0 < 0.15) continue;
        if (course === 1 && broken && x0 > len / 2 - broken) continue;
        const col = hash(i, course, Math.round(cx * 7 + cz)) < 0.3 ? SAND_D : SAND;
        const g = blk(x1 - x0 - 0.04, 0.42, 0.62, 0.05);
        put(
          col === SAND ? "coverBlocks" : "coverBlocksDark",
          col,
          xf(g, W(th, cx + (x0 + x1) / 2, FY + course * 0.43, cz), th),
        );
      }
    }
    const capLen = len - broken;
    put("coverCaps", SAND_L, xf(blk(capLen + 0.08, 0.16, 0.74, 0.05), W(th, cx - broken / 2, FY + 0.86, cz), th));
    if (broken) rocks(W(th, cx + len / 2 - 0.2, 0, cz + 0.6)[0], W(th, cx + len / 2 - 0.2, 0, cz + 0.6)[2], 5);
  }
  function banner(
    name: string,
    th: number,
    x: number,
    y: number,
    z: number,
    face: number,
    w: number,
    len: number,
    tex: THREE.Texture,
  ) {
    const at = W(th, x, y, z);
    const j = b.joint(name, { parent: root, at, dir: [0, -1, 0] });
    put("bannerRods", IRON_D, xf(new THREE.CylinderGeometry(0.04, 0.04, w + 0.3, 6), at, th, 0, 90));
    for (const s of [-1, 1]) {
      put("bannerFinials", GOLD, xf(new THREE.OctahedronGeometry(0.08, 0), W(th, x + s * (w / 2 + 0.17), y, z), th));
      put("bannerRods", IRON_D, xf(blk(0.05, 0.05, 0.22), W(th, x + s * (w / 2 + 0.05), y - 0.03, z - face * 0.1), th));
    }
    b.part(new THREE.BoxGeometry(w, len, 0.035), "#ffffff", {
      bone: j,
      at: W(th, x, y - len / 2 - 0.03, z + face * 0.02),
      dir: out3(th, face),
      axis: "z",
      texture: tex,
      name: `${name}Cloth`,
      group,
    });
    return j;
  }
  function merlons(
    th: number,
    x0: number,
    x1: number,
    z: number,
    y: number,
    pitch: number,
    w: number,
    d: number,
    h: number,
    name = "merlons",
  ) {
    const n = Math.max(1, Math.floor((x1 - x0) / pitch));
    const start = (x0 + x1) / 2 - ((n - 1) * pitch) / 2;
    for (let i = 0; i < n; i++) put(name, WALL, xf(blk(w, h, d, 0.06), W(th, start + i * pitch, y, z), th));
  }
  /** Ivy spilling down a wall face: flat faceted leaves on the face of side `th` at `face` (+x along the face). */
  function ivy(th: number, origin: V, x: number, face: number, top: number, h: number, w: number) {
    const rows = Math.round(h / 0.22);
    for (let r = 0; r < rows; r++) {
      const t = r / rows;
      const half = w * (1 - 0.65 * t) * (0.7 + 0.3 * R());
      const n = Math.max(1, Math.round((2 * half) / 0.3));
      for (let i = 0; i < n; i++) {
        const lx = x - half + ((i + 0.5) * 2 * half) / n + rr(-0.08, 0.08);
        const p = W(th, lx, top - r * 0.22 + rr(-0.06, 0.06), face + 0.07 + rr(0, 0.05));
        const c = R();
        const col = c < 0.35 ? LEAF_D : c < 0.8 ? LEAF : LEAF_L;
        const name = c < 0.35 ? "bushDark" : c < 0.8 ? "bush" : "bushLight";
        const s = rr(0.16, 0.23) * (1 - 0.3 * t);
        put(
          name,
          col,
          xf(
            new THREE.OctahedronGeometry(s, 0),
            [p[0] + origin[0], p[1], p[2] + origin[2]],
            th + rr(-20, 20),
            rr(-25, 25),
            rr(0, 90),
            [1, 0.8, 0.35],
          ),
        );
      }
    }
  }

  // ---------- perimeter walls, gatehouses and towers ----------
  group = "walls";
  for (let k = 0; k < 8; k++) {
    const th = k * 45;
    const gate = k % 2 === 1;
    const segs: [number, number][] = gate
      ? [
          [-L, -3.4],
          [3.4, L],
        ]
      : [[-L, L]];
    for (const [x0, x1] of segs) {
      const cx = (x0 + x1) / 2;
      const w = x1 - x0;
      put("wallBodies", BRICK, xf(blk(w, WTOP, 1.4), W(th, cx, 0, WC), th));
      put("wallCaps", WALL_L, xf(blk(w, 0.22, 1.75, 0.05), W(th, cx, WTOP, WC + 0.1), th));
      put("wallPlinth", WALL_D, xf(blk(w, 0.45, 0.2, 0.06), W(th, cx, FY - 0.05, WIN - 0.1), th));
      put("wallLip", WALL_L, xf(blk(w, 0.32, 0.26, 0.05), W(th, cx, WTOP + 0.22, WIN + 0.05), th));
      // boards along the wall walk
      for (let x = Math.max(x0, -L + 1.75) + 0.2; x < Math.min(x1, L - 1.75) - 0.15; x += 0.4) {
        const h = hash(Math.round(x * 10), k, 21);
        const col = h < 0.25 ? WOOD_D : h > 0.75 ? WOOD_L : WOOD;
        put(
          col === WOOD ? "planks" : col === WOOD_D ? "planksDark" : "planksLight",
          col,
          xf(blk(0.36, 0.06, 0.82, 0.015), W(th, x, WTOP + 0.22, 14.9), th),
        );
      }
      const mx0 = Math.max(x0, -L + 1.9);
      const mx1 = Math.min(x1, L - 1.9);
      if (mx1 - mx0 > 0.8) {
        merlons(th, mx0, mx1, WC + 0.62, WTOP + 0.22, 1.15, 0.7, 0.42, 0.72);
        for (let x = mx0 + 0.3; x < mx1; x += 0.58)
          put(
            "corbels",
            WALL_L,
            xf(loft([ringY(rectP(0.2, 0.06), 0), ringY(rectP(0.24, 0.3), 0.32)]), W(th, x, WTOP - 0.32, WC + 0.83), th),
          );
      }
    }
    // outer buttresses and arrow slits
    const bx = gate ? [4.8] : [3.6];
    for (const s of [-1, 1])
      for (const x of bx) {
        const poly0 = movePoly(rectP(0.7, 0.9), 0, 0);
        const poly1 = movePoly(rectP(0.55, 0.35), 0, -0.27);
        const g = loft([ringY(poly0, 0), ringY(poly1, 2.8)]);
        put("buttresses", WALL_D, xf(g, W(th, s * x, 0, 16.1), th));
      }
    for (const x of gate ? [-4.8 + 1.0, 4.8 - 1.0] : [-1.0, 1.0, -4.6, 4.6])
      put("slits", VOID, xf(blk(0.16, 0.95, 0.1), W(th, x, 1.6, 15.71), th));
    if (hash(k, 1, 77) > 0.3)
      ivy(
        th,
        [0, 0, 0],
        (gate ? 5.35 : 4.15) * (hash(k, 2, 7) > 0.5 ? 1 : -1),
        15.7,
        3.45,
        rr(1.8, 2.8),
        gate ? 0.45 : 0.55,
      );
    if (!gate) {
      // big banners down the outside of the four cardinal walls
      for (const s of [-1, 1]) {
        banner(`bannerOut${k}${s > 0 ? "L" : "R"}`, th, s * 2.3, 3.32, 15.82, 1, 1.15, 2.4, ARENA_BANNER);
        torch(th + 180, -s * 1.0, 2.85, -15.7);
      }
    }
    if (k === 0 || k === 4) {
      // inner wall: banners, torches, pilasters, the lava spout
      for (const s of [-1, 1]) {
        banner(`bannerIn${k}${s > 0 ? "L" : "R"}`, th, s * 2.4, FY + 2.95, WIN - 0.1, -1, 1.0, 2.2, ARENA_BANNER);
        torch(th, s * 4.5, FY + 2.0, WIN);
        const pil = loft([
          ringY(rectP(0.62, 0.45), 0),
          ringY(rectP(0.62, 0.45), 2.9),
          ringY(
            rectP(0.62, 0.05).map(([x, z]) => [x, z + 0.2] as P2),
            3.15,
          ),
        ]);
        put("pilasters", WALL_L, xf(pil, W(th, s * 3.45, SLAB, WIN - 0.2), th));
      }
      // sun mask spout pouring lava into the channel
      const rays = star(0, 0, 0.95, 0.62, 12)
        .split(" ")
        .map((p) => p.split(",").map(Number) as [number, number]);
      b.extrude(rays, {
        at: W(th, 0, FY + 2.6, WIN - 0.05),
        x: W(th, 1, 0, 0),
        y: [0, 1, 0],
        thickness: 0.12,
        color: GOLD,
        name: `sunMask${k}`,
        group,
      });
      put(
        "maskFace",
        GOLD_L,
        xf(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 10), W(th, 0, FY + 2.6, WIN - 0.1), th, 90),
      );
      put("maskFace", GOLD_L, xf(blk(0.3, 0.06, 0.08), W(th, 0, FY + 2.55, WIN - 0.2), th));
      for (const s of [-1, 1])
        put("voidBits", VOID, xf(blk(0.12, 0.08, 0.06), W(th, s * 0.18, FY + 2.68, WIN - 0.18), th));
      const spout = loft([ringY(rectP(0.6, 0.02), 0), ringY(rectP(0.5, 0.95), 0.25)].map((r) => r.map((p) => p)));
      put("spouts", BAS, xf(spout, W(th, 0, FY + 1.75, WIN - 0.48), th));
      put("lavaFall", LAVA_L, xf(blk(0.42, 1.75, 0.16), W(th, 0, 0.32, WIN - 0.88), th), { glow: 1.0 });
      put("lavaFallCore", LAVA_Y, xf(blk(0.18, 1.6, 0.18), W(th, 0, 0.36, WIN - 0.9), th), { glow: 1.1 });
      put(
        "lavaSplash",
        LAVA_L,
        xf(new THREE.CylinderGeometry(0.2, 0.42, 0.14, 7, 1, true), W(th, 0, 0.38, WIN - 0.9), th),
        { glow: 1 },
      );
      for (let i = 0; i < 6; i++) {
        const a = i * 60 + rr(0, 30);
        const p = W(th, 0.45 * Math.sin(a * DEG), 0.42 + rr(0, 0.25), WIN - 0.9 + 0.3 * Math.cos(a * DEG));
        put("lavaHot", LAVA_Y, xf(new THREE.TetrahedronGeometry(rr(0.05, 0.09), 0), p, rr(0, 360), rr(0, 60)), {
          glow: 1,
        });
      }
      for (let i = 0; i < 5; i++)
        put(
          "lavaBubbles",
          LAVA_L,
          xf(new THREE.IcosahedronGeometry(rr(0.08, 0.14), 0), W(th, rr(-0.35, 0.35), 0.34, WIN - rr(0.7, 1.3))),
          { glow: 1 },
        );
    }
  }

  // ballistas on the four cardinal wall walks, aimed out over the walls
  for (const th of [0, 90, 180, 270]) {
    const at = (x: number, y: number, z: number) => W(th, x, WTOP + 0.28 + y, 14.95 + z);
    const v = (x: number, y: number, z: number) => new THREE.Vector3(...at(x, y, z));
    const bx = th % 180 ? 2.6 : 3.3;
    put("ballistaWood", WOOD_D, xf(blk(0.8, 0.18, 0.7, 0.03), at(bx, 0, 0), th));
    put("ballistaWood", WOOD_D, xf(new THREE.CylinderGeometry(0.1, 0.14, 0.35, 6), at(bx, 0.35, 0), th));
    put("ballistaStock", WOOD, beam(v(bx, 0.6, -0.65), v(bx, 0.78, 0.75), 0.2));
    for (const s of [-1, 1]) {
      put("ballistaArms", WOOD_L, beam(v(bx, 0.76, 0.6), v(bx + s * 0.85, 0.74, 0.32), 0.09));
      put("ballistaString", IRON_D, beam(v(bx + s * 0.85, 0.74, 0.32), v(bx, 0.74, -0.15), 0.025));
      put(
        "ballistaIron",
        IRON,
        xf(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 6), at(bx + s * 0.14, 0.55, -0.5), th, 0, 90),
      );
    }
    put("ballistaBolt", WOOD_L, beam(v(bx, 0.76, -0.1), v(bx, 0.88, 1.05), 0.045));
    put("ballistaIron", IRON_L, xf(new THREE.ConeGeometry(0.07, 0.22, 4), at(bx, 0.89, 1.15), th, 90 - 7));
    put("ballistaIron", IRON, xf(blk(0.26, 0.2, 0.14, 0.02), at(bx, 0.68, 0.62), th));
  }

  // gatehouses (diagonal sides): arch, portcullis, keystone shield, banners, flag
  const ARCH: OutlinePoint[] = [
    [-2.3, 0],
    [-1.6, 0],
    [-1.6, 2.25],
    [-1.4, 2.65],
    [-0.85, 2.95],
    [0, 3.12, "sharp"],
    [0.85, 2.95],
    [1.4, 2.65],
    [1.6, 2.25],
    [1.6, 0],
    [2.3, 0],
    [2.3, 3.75],
    [-2.3, 3.75],
  ];
  for (const t of TEAMS) {
    group = `gate${t.name}`;
    const th = t.th;
    for (const s of [-1, 1]) put("wallBodies", BRICK, xf(blk(1.8, 5.2, 2.8), W(th, s * 2.5, 0, 15.0), th));
    put("wallBodies", BRICK, xf(blk(3.2, 5.2 - FY - 3.1, 2.8), W(th, 0, FY + 3.1, 15.0), th));
    put("gateFloor", SAND_D, xf(blk(3.2, 0.1, 2.4), W(th, 0, SLAB, 15.3), th));
    put("gateVoid", VOID, xf(blk(3.2, 3.1, 0.2), W(th, 0, FY, 15.75), th));
    put("gateDoor", WOOD, xf(blk(3.2, 3.1, 0.2), W(th, 0, FY, 16.0), th));
    for (const s of [-1, 1]) put("gateGuides", IRON, xf(blk(0.14, 3.1, 0.14), W(th, s * 1.57, FY, 14.3), th));
    for (const [z, col, name] of [
      [13.45, SAND_L, "archFrames"],
      [16.48, WALL_L, "archFramesBack"],
    ] as [number, string, string][])
      b.extrude(ARCH, {
        at: W(th, 0, FY, z),
        x: W(th, 1, 0, 0),
        y: [0, 1, 0],
        thickness: 0.3,
        bevel: 0.04,
        color: col,
        name: `${name}${t.name}`,
        group,
      });
    put("keystones", GOLD_D, xf(blk(0.5, 0.6, 0.42, 0.05), W(th, 0, FY + 2.95, 13.42), th));
    decal(
      `gateShield${t.name}`,
      art[TEAMS.indexOf(t)].shield,
      0.8,
      0.9,
      W(th, 0, FY + 3.98, 13.29),
      out3(th, -1),
      [0, 1, 0],
    );
    // the outer door's iron bands
    for (const y of [0.7, 1.7, 2.7]) put("doorBands", IRON, xf(blk(3.2, 0.12, 0.06), W(th, 0, FY + y, 16.12), th));
    for (const y of [0.7, 1.7, 2.7])
      for (let i = 0; i < 8; i++)
        put(
          "doorStuds",
          IRON_L,
          xf(new THREE.OctahedronGeometry(0.06, 0), W(th, -1.4 + i * 0.4, FY + y + 0.06, 16.17), th),
        );
    put("doorSeam", WOOD_D, xf(blk(0.08, 3.1, 0.04), W(th, 0, FY, 16.11), th));
    decal(
      `doorShield${t.name}`,
      art[TEAMS.indexOf(t)].shield,
      0.7,
      0.79,
      W(th, 0, FY + 2.2, 16.2),
      out3(th),
      [0, 1, 0],
    );
    // gatehouse top: cap, corbels and merlons
    put("wallCaps", WALL_L, xf(blk(7.1, 0.22, 3.1, 0.05), W(th, 0, 5.2, 15.0), th));
    merlons(th, -3.5, 3.5, 13.75, 5.42, 1.15, 0.65, 0.42, 0.68);
    for (let x = -3.2; x < 3.25; x += 0.4) {
      const h = hash(Math.round(x * 10), th, 23);
      const col = h < 0.25 ? WOOD_D : h > 0.75 ? WOOD_L : WOOD;
      put(
        col === WOOD ? "planks" : col === WOOD_D ? "planksDark" : "planksLight",
        col,
        xf(blk(0.36, 0.06, 2.1, 0.015), W(th, x, 5.42, 15.0), th),
      );
    }
    merlons(th, -3.5, 3.5, 16.25, 5.42, 1.15, 0.65, 0.42, 0.68);
    for (let x = -3.2; x <= 3.21; x += 0.64)
      put(
        "corbels",
        WALL_L,
        xf(loft([ringY(rectP(0.2, 0.06), 0), ringY(rectP(0.24, 0.3), 0.32)]), W(th, x, 4.88, 13.5), th),
      );
    // portcullis on its joint: it slides up into the gatehouse
    const pj = b.joint(`portcullis${t.name}`, { parent: root, at: W(th, 0, FY + 3.1, 14.3), dir: [0, 1, 0] });
    for (let i = 0; i < 7; i++) {
      const x = -1.35 + i * 0.45;
      put(`portBars${t.name}`, IRON_D, xf(blk(0.1, 2.85, 0.1), W(th, x, FY + 0.25, 14.3), th), { bone: pj });
      put(
        `portBars${t.name}`,
        IRON_D,
        xf(new THREE.ConeGeometry(0.08, 0.25, 4), W(th, x, FY + 0.125, 14.3), th + 45, 180),
        { bone: pj },
      );
    }
    for (const y of [0.55, 1.35, 2.15, 2.85])
      put(`portBars${t.name}`, IRON_D, xf(blk(3.0, 0.1, 0.08), W(th, 0, FY + y, 14.36), th), { bone: pj });
    for (let i = 0; i < 7; i++)
      for (const y of [0.6, 1.4, 2.2])
        put(
          `portRivets${t.name}`,
          IRON_L,
          xf(blk(0.07, 0.07, 0.04), W(th, -1.35 + i * 0.45, FY + y - 0.01, 14.42), th),
          { bone: pj },
        );
    put(`portBeam${t.name}`, t.dark, xf(blk(3.2, 0.24, 0.2, 0.03), W(th, 0, FY + 2.9, 14.3), th), { bone: pj });
    // team banners on the gatehouse face and the flag on its roof
    for (const s of [-1, 1])
      banner(
        `banner${t.name}${s > 0 ? "L" : "R"}`,
        th,
        s * 2.88,
        4.75,
        13.55,
        -1,
        0.75,
        2.3,
        art[TEAMS.indexOf(t)].banner,
      );
    const pole = W(th, 0, 5.42, 15.0);
    put("flagPoles", IRON_D, xf(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 6), [pole[0], 5.42 + 1.5, pole[2]]));
    put("bannerFinials", GOLD, xf(new THREE.OctahedronGeometry(0.14, 0), [pole[0], 8.5, pole[2]]));
    const fj = b.joint(`flag${t.name}`, { parent: root, at: [pole[0], 8.25, pole[2]], dir: [0, -1, 0] });
    b.part(new THREE.BoxGeometry(1.7, 1.13, 0.03), "#ffffff", {
      bone: fj,
      at: W(th, 0.9, 7.68, 15.0),
      dir: out3(th, -1),
      axis: "z",
      texture: art[TEAMS.indexOf(t)].flag,
      name: `flag${t.name}Cloth`,
      group,
    });
    // spawn pad in front of the gate
    const sc = 11.7;
    const spawnPoly = (a: number) => octP(a).map(([x, z]) => W2(th, x, sc + z));
    put(`spawnInlay${t.name}`, t.dark, slab(spawnPoly(1.75), 0.58, 0.07, 0.02));
    for (let k = 0; k < 8; k++) {
      const p0 = octP(1.42)[k];
      const p1 = octP(1.42)[(k + 1) % 8];
      const q0 = octP(1.56)[k];
      const q1 = octP(1.56)[(k + 1) % 8];
      const poly = [p0, p1, q1, q0].map(([x, z]) => W2(th, x, sc + z));
      put(`spawnRing${t.name}`, t.light, slab(poly, 0.6, 0.075), { glow: 0.9 });
      const v = octP(1.75)[k];
      put(
        "spawnStuds",
        GOLD,
        xf(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 6), W(th, v[0] * 0.93, 0.66, sc + v[1] * 0.93), th),
      );
    }
    decal(
      `spawnMark${t.name}`,
      art[TEAMS.indexOf(t)].spawn,
      2.3,
      2.3,
      W(th, 0, 0.68, sc),
      [0, 1, 0],
      out3(th, -1),
      0.8,
    );
    for (const s of [-1, 1]) {
      const p = W(th, s * 2.55, 0, 13.0);
      brazier(p[0], p[2], 0.9);
      torch(th, s * 4.9, FY + 2.1, WIN);
    }
    // spawn shield wall, bridge over the moat, columns flanking the lane
    group = "cover";
    coverWall(th, 0, 9.2, 2.9, 0);
    decal(
      `coverShield${t.name}`,
      art[TEAMS.indexOf(t)].shield,
      0.55,
      0.62,
      W(th, 0, FY + 0.5, 8.86),
      out3(th, -1),
      [0, 1, 0],
    );
    group = "bridges";
    for (let i = 0; i < 3; i++) {
      const z0 = 4.7 + i * 0.8;
      put("bridgeDeck", i === 1 ? SAND_L : SAND, xf(blk(2.4, 0.3, 0.76, 0.05), W(th, 0, 0.48, z0 + 0.4), th));
    }
    put("bridgeKeel", SAND_D, xf(blk(1.9, 0.2, 1.6, 0), W(th, 0, 0.3, 5.8), th));
    for (const s of [-1, 1]) {
      put("bridgeRails", SAND, xf(blk(0.2, 0.42, 1.5, 0.04), W(th, s * 1.1, 0.78, 5.85), th));
      put("bridgeRailCaps", SAND_L, xf(blk(0.26, 0.08, 1.55, 0.03), W(th, s * 1.1, 1.2, 5.85), th));
      for (const z of [4.85, 6.85]) {
        put("bridgePosts", SAND_D, xf(blk(0.42, 0.85, 0.42, 0.05), W(th, s * 1.1, 0.78, z), th));
        put("bridgeRailCaps", SAND_L, xf(blk(0.5, 0.1, 0.5, 0.04), W(th, s * 1.1, 1.63, z), th));
      }
      const lp = W(th, s * 1.1, 1.73, 6.85);
      put("lanternIron", IRON_D, xf(blk(0.28, 0.06, 0.28, 0.02), lp, th));
      put(
        "lanternIron",
        IRON_D,
        xf(loft([ringY(rectP(0.3, 0.3), 0), ringY(rectP(0.04, 0.04), 0.2)]), [lp[0], lp[1] + 0.36, lp[2]], th),
      );
      put("lanternGlow", FIRE_Y, xf(blk(0.18, 0.3, 0.18), [lp[0], lp[1] + 0.06, lp[2]], th), { glow: 1.2 });
    }
    group = "cover";
    const ci = TEAMS.indexOf(t);
    column(W(th, -3.4, 0, 9.6)[0], W(th, -3.4, 0, 9.6)[2], ci % 2 ? 2.6 : 1.5, ci % 2 === 0, th + 10 * ci);
  }

  // towers at the eight corners
  group = "towers";
  const TOWER_BRICK = bricks([WALL, WALL_D, WALL_L], MORTAR, WALL_L, 0.9, 0.5, 11);
  for (let k = 0; k < 8; k++) {
    const ph = 22.5 + k * 45;
    const c = [RV * Math.sin(ph * DEG), 0, RV * Math.cos(ph * DEG)];
    const at = (y: number) => [c[0], y, c[2]];
    const tower = (a: number, y0: number, h: number, ch = 0) =>
      slab(
        octP(a, 22.5).map(([x, z]) => [x + c[0], z + c[2]] as P2),
        y0,
        h,
        ch,
      );
    put("towerPlinths", WALL_D, tower(2.2, 0, 1.0, 0.18));
    put("towerBodies", TOWER_BRICK, tower(1.85, 0.8, 5.4));
    put("towerBands", WALL_L, tower(1.95, 3.6, 0.18, 0.04));
    put("towerParapets", WALL_L, tower(2.12, 6.2, 0.55, 0.06));
    for (let f = 0; f < 8; f++) {
      const fa = ph + f * 45;
      put(
        "corbels",
        WALL_L,
        xf(
          loft([ringY(rectP(0.34, 0.06), 0), ringY(rectP(0.4, 0.34), 0.4)]),
          W(fa, 0, 5.8, 0).map((v, i) => v + c[i]),
          fa,
        ),
      );
      put(
        "merlons",
        WALL,
        xf(
          blk(0.62, 0.62, 0.36, 0.06),
          W(fa, 0, 6.75, 1.92).map((v, i) => v + c[i]),
          fa,
        ),
      );
    }
    // roof, gold trim, finial and pennant
    // a striped roof: facets alternate two blues, gold ribs run up the hips
    const apex = new THREE.Vector3(c[0], 6.75 + 3.3, c[2]);
    for (let f = 0; f < 8; f++) {
      const v = (j: number) =>
        new THREE.Vector3(
          c[0] + (2.05 / C8) * Math.sin(j * 45 * DEG),
          6.75,
          c[2] + (2.05 / C8) * Math.cos(j * 45 * DEG),
        );
      const g = new THREE.BufferGeometry();
      const [p, q] = [v(f), v(f + 1)];
      g.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([p.x, p.y, p.z, q.x, q.y, q.z, apex.x, apex.y, apex.z], 3),
      );
      put(f % 2 ? "roofs" : "roofsDark", f % 2 ? ROOF : ROOF_D, g);
      put("roofRibs", GOLD, beam(p, apex, 0.09));
    }
    put("roofTrim", GOLD, tower(2.06, 6.68, 0.12));
    put("bannerFinials", GOLD, xf(new THREE.OctahedronGeometry(0.22, 0), at(10.15), 0, 0, 0, [1, 1.4, 1]));
    put("flagPoles", IRON_D, xf(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6), at(10.9)));
    const team = TEAMS.find((t) => Math.abs(((ph - t.th + 540) % 360) - 180) === 22.5)!;
    const pj = b.joint(`pennant${k + 1}`, { parent: root, at: at(11.55), dir: [0, -1, 0] });
    b.extrude(
      [
        [0, 0],
        [1.25, 0.24],
        [0, 0.5],
      ],
      {
        at: at(11.12),
        x: out3(ph + (k % 2 ? 90 : -90)),
        y: [0, 1, 0],
        thickness: 0.03,
        color: team.base,
        bone: pj,
        name: `pennant${k + 1}Cloth`,
        group,
      },
    );
    // windows: slits outside, a lit window and a door facing the arena
    const outer = (dy: number, d: number, fa: number) => W(fa, 0, dy, 1.85 + d).map((v, i) => v + c[i]);
    put("slits", VOID, xf(blk(0.16, 0.9, 0.1), outer(2.2, 0.0, ph), ph));
    b.part(new THREE.BoxGeometry(1.2, 1.35, 0.1), "#ffffff", {
      at: outer(4.75, 0.07, ph),
      dir: out3(ph),
      axis: "z",
      texture: art[TEAMS.indexOf(team)].shield,
      bone: root,
      name: `towerShield${k + 1}`,
      group,
    });
    const inward = ph + 180;
    put("towerWindows", FIRE_Y, xf(blk(0.42, 0.75, 0.08), outer(4.5, -0.02, inward), inward), { glow: 1.0 });
    put(
      "towerWindowTop",
      FIRE_Y,
      xf(
        new THREE.CylinderGeometry(0.21, 0.21, 0.08, 6, 1, false, 0, Math.PI),
        outer(5.25, -0.02, inward),
        inward,
        90,
        90,
      ),
      { glow: 1.0 },
    );
    put("sills", WALL_L, xf(blk(0.62, 0.1, 0.2, 0.03), outer(4.42, 0.02, inward), inward));
    for (const s of [-1, 1])
      put(
        "sills",
        WALL_L,
        xf(
          blk(0.1, 1.0, 0.12),
          W(inward, s * 0.28, 4.45, 1.87).map((v, i) => v + c[i]),
          inward,
        ),
      );
    put("towerDoors", WOOD_D, xf(blk(1.0, 1.8, 0.1), outer(FY - 0.1, 0.0, inward), inward));
    for (const y of [0.85, 1.65]) put("doorBands", IRON, xf(blk(1.04, 0.1, 0.06), outer(y, 0.06, inward), inward));
    put("sills", WALL_L, xf(blk(1.3, 0.22, 0.2, 0.04), outer(FY + 1.7, 0.03, inward), inward));
    if (k === 1 || k === 4 || k === 6) ivy(ph, c, -0.4, 1.85, 3.35, 2.5, 0.6);
    // bushes in the corner
    for (const s of [-1, 1]) {
      const p = [13.7 * Math.sin((ph + s * 6.5) * DEG), 13.7 * Math.cos((ph + s * 6.5) * DEG)];
      if (hash(k, s + 3, 5) > 0.35) bush(p[0], p[1], rr(0.75, 1.05));
    }
  }

  // ---------- raised flanking platforms ----------
  group = "platforms";
  for (const th of [90, 270]) {
    const P = (x: number, y: number, z: number) => W(th, x, y, z);
    put("wallBodies", BRICK, xf(blk(10.4, PT - SLAB, 3.1), P(0, SLAB, 12.75), th));
    for (let i = 0; i < 21; i++) {
      const x = -5.2 + 0.25 + i * 0.4975;
      const h = hash(i, th, 9);
      const col = h < 0.25 ? WOOD_D : h > 0.75 ? WOOD_L : WOOD;
      put(
        col === WOOD ? "planks" : col === WOOD_D ? "planksDark" : "planksLight",
        col,
        xf(blk(0.46, 0.08, 2.85, 0.02), P(x, PT, 12.9), th),
      );
    }
    for (const z of [12.3, 13.7]) put("plankStraps", IRON, xf(blk(10.3, 0.02, 0.1), P(0, PT + 0.08, z), th));
    put("wallCaps", WALL_L, xf(blk(10.6, 0.2, 0.45, 0.05), P(0, PT - 0.05, 11.25), th));
    for (const x of [-5.0, -2.55, -1.75, 1.75, 2.55, 5.0])
      put("merlons", WALL, xf(blk(0.55, 0.55, 0.4, 0.06), P(x, PT + 0.15, 11.25), th));
    for (const s of [-1, 1]) torch(th, s * 2.15, FY + 1.05, 11.2);
    // ramp up the middle
    const prof = (x: number, lift: number) => [
      new THREE.Vector3(...P(x, SLAB, 7.5)),
      new THREE.Vector3(...P(x, SLAB, 11.2)),
      new THREE.Vector3(...P(x, PT + 0.08 + lift, 11.2)),
      new THREE.Vector3(...P(x, FY + 0.02 + lift, 7.5)),
    ];
    put("ramps", SAND, loft([prof(-1.3, 0), prof(1.3, 0)], true, true));
    for (const s of [-1, 1]) put("rampCurbs", WALL_L, loft([prof(s * 1.3, 0.28), prof(s * 1.52, 0.28)], true, true));
    const slope = Math.atan2(PT + 0.06 - FY, 3.7) / DEG;
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.6) / 6.3;
      put(
        "rampCleats",
        WOOD_D,
        xf(blk(2.5, 0.07, 0.12), P(0, FY + 0.02 + t * (PT + 0.06 - FY), 7.5 + t * 3.7), th, -slope),
      );
    }
    // stairs at both ends
    for (const s of [-1, 1]) {
      for (let k = 1; k <= 6; k++) {
        const z0 = 11.2 - (7 - k) * 0.5;
        put(
          k % 2 ? "steps" : "stepsLight",
          k % 2 ? SAND : SAND_L,
          xf(blk(1.8, FY + 0.3 * k - SLAB, 11.2 - z0, 0.04), P(s * 4.0, SLAB, (z0 + 11.2) / 2), th),
        );
      }
      for (const x of [2.95, 5.05]) {
        const sp = (xx: number) => [
          new THREE.Vector3(...P(s * xx, SLAB, 8.2)),
          new THREE.Vector3(...P(s * xx, SLAB, 11.2)),
          new THREE.Vector3(...P(s * xx, PT + 0.35, 11.2)),
          new THREE.Vector3(...P(s * xx, FY + 0.45, 8.2)),
        ];
        put("stringers", WALL, loft([sp(x - 0.1), sp(x + 0.1)], true, true));
      }
    }
    // deck props: power-up shrine, crates, barrels, brazier, spear rack
    const sh = P(0, PT + 0.08, 13.1);
    put("columnBase", MARBLE_D, xf(oct(0.55, 0, 0.3, 0.05), sh));
    put("columns", MARBLE, xf(oct(0.32, 0.3, 0.7, 0.04), sh));
    put("altarGold", GOLD, xf(new THREE.CylinderGeometry(0.5, 0.28, 0.22, 8), [sh[0], sh[1] + 1.1, sh[2]], 22.5));
    put(
      "pylonGems",
      LAVA_Y,
      xf(new THREE.OctahedronGeometry(0.32, 0), [sh[0], sh[1] + 1.75, sh[2]], 20, 0, 0, [1, 1.35, 1]),
      { glow: 1.0 },
    );
    for (const s of [-1, 1]) {
      const c1 = P(s * 4.0, PT + 0.08, 13.35);
      crate(c1[0], c1[1], c1[2], 1.0, th + 8 * s);
      const c2 = P(s * 3.85, PT + 1.08, 13.4);
      crate(c2[0], c2[1], c2[2], 0.7, th - 14 * s);
      const c3 = P(s * 4.4, PT + 0.08, 12.1);
      crate(c3[0], c3[1], c3[2], 0.72, th + 25 * s);
      const b1 = P(s * 2.7, 0, 13.7);
      barrel(b1[0], b1[2], PT + 0.08);
      const b2 = P(s * 2.0, 0, 13.85);
      barrel(b2[0], b2[2], PT + 0.08);
    }
    const br = P(-1.3, 0, 13.9);
    brazier(br[0], br[2], 0.9, PT + 0.08);
    // spear rack against the wall
    const rk = (x: number, y: number, z: number) => P(x, PT + 0.08 + y, z);
    for (const x of [0.55, 1.5]) put("rack", WOOD_D, xf(blk(0.12, 1.4, 0.12), rk(x, 0, 14.05), th));
    put("rack", WOOD_D, xf(blk(1.2, 0.1, 0.14), rk(1.02, 1.15, 14.05), th));
    for (let i = 0; i < 3; i++) {
      const x = 0.72 + i * 0.3;
      put("spearShafts", WOOD_L, xf(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 5, 1, true), rk(x, 1.0, 13.9), th, -8));
      put("spearHeads", IRON_L, xf(new THREE.ConeGeometry(0.07, 0.32, 4), rk(x, 2.1, 13.75), th, -8));
    }
    // a little sunforge anvil with a hot ingot and a hammer
    put("anvil", IRON_D, xf(blk(0.42, 0.34, 0.34, 0.03), rk(-2.2, 0, 12.45), th));
    put("anvil", IRON_D, xf(blk(0.24, 0.16, 0.22), rk(-2.2, 0.34, 12.45), th));
    put("anvilTop", IRON, xf(blk(0.66, 0.16, 0.3, 0.03), rk(-2.2, 0.5, 12.45), th));
    put("anvilTop", IRON, xf(new THREE.ConeGeometry(0.1, 0.32, 4), rk(-2.69, 0.6, 12.45), th, 0, 90));
    put("lavaHot", LAVA_Y, xf(blk(0.26, 0.06, 0.12), rk(-2.15, 0.66, 12.45), th + 12), { glow: 1 });
    put(
      "spearShafts",
      WOOD_L,
      xf(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 5, 1, true), rk(-1.95, 0.7, 12.75), th + 70, 0, 84),
    );
    put("anvil", IRON_D, xf(blk(0.1, 0.1, 0.2), rk(-1.7, 0.66, 12.77), th + 70));
    put("barrelTops", WOOD_D, xf(blk(0.9, 0.36, 0.5, 0.03), rk(-3.35, 0, 12.35), th));
    put("lava", LAVA, xf(blk(0.78, 0.02, 0.38), rk(-3.35, 0.33, 12.35), th), { glow: 0.8 });
  }

  // ---------- cardinal fields (front and back): jump pads, cover, footbridges, props ----------
  group = "jumpPads";
  let padN = 0;
  for (const th of [0, 180]) {
    for (const s of [-1, 1]) {
      const c = W(th, s * 3.6, 0, 10.9);
      const collar = (a: number, y0: number, h: number, ch = 0) => slab(movePoly(octP(a), c[0], c[2]), y0, h, ch);
      put("padCollars", IRON, collar(1.15, SLAB, 0.2, 0.06));
      put("padRims", GOLD, collar(1.0, FY + 0.1, 0.06));
      for (let k = 0; k < 8; k++) {
        const a = k * 45 + 22.5;
        put(
          "padLights",
          TEAL,
          xf(blk(0.16, 0.06, 0.1), [c[0] + 1.06 * Math.sin(a * DEG), FY + 0.1, c[2] + 1.06 * Math.cos(a * DEG)], a),
          { glow: 1.0 },
        );
      }
      padN++;
      const pj = b.joint(`jumpPad${padN}`, { parent: root, at: [c[0], FY + 0.16, c[2]], dir: [0, 1, 0] });
      put(`padPlate${padN}`, TEAL_D, collar(0.86, FY + 0.12, 0.12, 0.03), { bone: pj });
      for (let k = 0; k < 4; k++) {
        const a = k * 90 + 45;
        put(
          `padPlate${padN}`,
          TEAL_D,
          xf(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), [
            c[0] + 0.66 * Math.sin(a * DEG),
            FY + 0.29,
            c[2] + 0.66 * Math.cos(a * DEG),
          ]),
          { bone: pj },
        );
      }
      decal(`padArrow${padN}`, PAD, 1.45, 1.45, [c[0], FY + 0.245, c[2]], [0, 1, 0], [-c[0], 0, -c[2]], 1.0, pj);
    }
    group = "cover";
    for (const s of [-1, 1]) coverWall(th, s * 3.5, 8.0, 2.4, s > 0 ? 0.8 : 0);
    // a wooden footbridge over the lava channel
    group = "bridges";
    for (let i = 0; i < 5; i++) {
      const z = 9.2 + i * 0.25;
      put(
        i % 2 ? "planksDark" : "planks",
        i % 2 ? WOOD_D : WOOD,
        xf(blk(2.3, 0.08, 0.22, 0.02), W(th, 0, 0.72, z), th),
      );
    }
    for (const s of [-1, 1]) put("plankStraps", IRON, xf(blk(0.1, 0.1, 1.35), W(th, s * 0.85, 0.66, 9.7), th));
    group = "props";
    for (const s of [-1, 1]) {
      const p = W(th, s * 4.7, 0, 12.6);
      crate(p[0], FY, p[2], 0.85, th + 12 * s);
      const p2 = W(th, s * 5.6, 0, 11.6);
      barrel(p2[0], p2[2]);
    }
  }

  // ---------- flank fields: props by the ramps ----------
  group = "props";
  for (const th of [90, 270]) {
    for (const s of [-1, 1]) {
      const p = W(th, s * 6.6, 0, 9.0);
      crate(p[0], FY, p[2], 0.8, th + 20 * s);
      barrel(W(th, s * 6.0, 0, 9.9)[0], W(th, s * 6.0, 0, 9.9)[2]);
      rocks(W(th, s * 2.2, 0, 7.6)[0], W(th, s * 2.2, 0, 7.6)[2], 3, 0.15);
    }
  }

  // ---------- emit merged parts ----------
  for (const [name, bin] of bins) {
    group = bin.group;
    const part = b.part(mergeGeometries(bin.geos)!, bin.fill, {
      bone: bin.bone,
      at: [0, 0, 0],
      name,
      group: bin.group,
      flat: true,
    });
    if (bin.glow > 0) glow(part, bin.glow);
  }
  return b.root;
}
